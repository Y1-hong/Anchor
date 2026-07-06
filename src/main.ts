import {
  App,
  ItemView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  WorkspaceLeaf,
  normalizePath,
  requestUrl
} from "obsidian";

const VIEW_TYPE_HOME_BASE = "home-base-dashboard";

type Priority = "high" | "medium" | "low" | "";
type TodoGroup = "Overdue" | "Today" | "Tomorrow" | "Next 7 Days" | "No Due Date" | "Later";
type RepeatFrequency = "none" | "daily" | "weekdays" | "weekly" | "monthly" | "yearly";

interface HomeBaseSettings {
  openOnStartup: boolean;
  todoInboxPath: string;
  todoScanFolders: string;
  workoutPlanPath: string;
  workoutLogPath: string;
  showSchedulePlaceholder: boolean;
  calendarEnabled: boolean;
  calendarServerUrl: string;
  calendarUsername: string;
  calendarPassword: string;
  calendarUrl: string;
  calendarName: string;
}

interface TodoItem {
  id: string;
  title: string;
  due: string;
  priority: Priority;
  tags: string[];
  completed: boolean;
  file: TFile;
  line: number;
  raw: string;
}

interface WorkoutPlan {
  types: Record<string, string[]>;
  sequence: string[];
}

interface WorkoutLogEntry {
  date: string;
  workout: string;
  status: "done" | "skipped" | "pending";
}

interface CalendarInfo {
  href: string;
  displayName: string;
  writable: boolean;
}

interface CalendarEvent {
  uid: string;
  href: string;
  etag: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location: string;
  notes: string;
  repeat: RepeatFrequency;
  repeatUntil: string;
  exceptionDates: string[];
  occurrenceStart?: Date;
  rawIcs: string;
  calendarName: string;
}

interface CalendarFetchState {
  events: CalendarEvent[];
  error: string;
  setupRequired: boolean;
}

interface CalendarEventDraft {
  uid?: string;
  href?: string;
  etag?: string;
  rawIcs?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string;
  notes: string;
  repeat: RepeatFrequency;
  repeatUntil: string;
}

const DEFAULT_SETTINGS: HomeBaseSettings = {
  openOnStartup: true,
  todoInboxPath: "Home Base/Todo Inbox.md",
  todoScanFolders: "Home Base",
  workoutPlanPath: "Home Base/Workout Plan.md",
  workoutLogPath: "Home Base/Workout Log.md",
  showSchedulePlaceholder: true,
  calendarEnabled: false,
  calendarServerUrl: "https://caldav.icloud.com",
  calendarUsername: "",
  calendarPassword: "",
  calendarUrl: "",
  calendarName: ""
};

const DEFAULT_TODO_INBOX = `# Todo Inbox

`;

const DEFAULT_WORKOUT_PLAN = `# Workout Types

## Push
- Bench Press
- Shoulder Press
- Triceps Pushdown

## Pull
- Pull-ups
- Barbell Row
- Biceps Curl

## Legs
- Squat
- Romanian Deadlift
- Calf Raise

## Rest
Rest day

# Sequence

- Push
- Pull
- Legs
- Rest
`;

const DEFAULT_WORKOUT_LOG = `# Workout Log

`;

const CALDAV_NS = "urn:ietf:params:xml:ns:caldav";
const DAV_NS = "DAV:";

function normalizeRemoteUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function resolveRemoteUrl(base: string, href: string) {
  return new URL(href, normalizeRemoteUrl(base)).toString();
}

function calendarEventFileName(uid: string) {
  return `${encodeURIComponent(uid)}.ics`;
}

function unfoldIcsLines(content: string) {
  const rawLines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const lines: string[] = [];
  for (const line of rawLines) {
    if (/^[ \t]/.test(line) && lines.length) {
      lines[lines.length - 1] += line.slice(1);
    } else if (line.trim()) {
      lines.push(line);
    }
  }
  return lines;
}

function parseIcsProperty(line: string) {
  const colon = line.indexOf(":");
  if (colon === -1) return null;
  const nameAndParams = line.slice(0, colon);
  const [name, ...params] = nameAndParams.split(";");
  return {
    name: name.toUpperCase(),
    params: params.join(";"),
    value: line.slice(colon + 1)
  };
}

function unescapeIcsText(value: string) {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function foldIcsLine(line: string) {
  const chunks: string[] = [];
  let remaining = line;
  while (remaining.length > 74) {
    chunks.push(remaining.slice(0, 74));
    remaining = ` ${remaining.slice(74)}`;
  }
  chunks.push(remaining);
  return chunks.join("\r\n");
}

function formatIcsDate(date: Date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

function formatIcsUtcDateTime(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function formatIcsLocalDateTime(date: Date) {
  return `${formatIcsDate(date)}T${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;
}

function parseIcsDateKey(value: string, params: string) {
  const parsed = parseIcsDateValue(value, params);
  return parsed.allDay ? formatIcsDate(parsed.date) : formatIcsLocalDateTime(parsed.date);
}

function parseIcsDateValue(value: string, params: string) {
  const allDay = /VALUE=DATE/i.test(params) || /^\d{8}$/.test(value);
  if (/^\d{8}$/.test(value)) {
    return {
      date: new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6, 8))),
      allDay
    };
  }

  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!match) return { date: new Date(), allDay };

  const [, year, month, day, hour, minute, second, utc] = match;
  const parts = [year, month, day, hour, minute, second].map((part) => Number(part));
  if (utc) {
    return {
      date: new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5])),
      allDay
    };
  }
  return {
    date: new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]),
    allDay
  };
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function nextHalfHour(date: Date) {
  const next = new Date(date);
  next.setSeconds(0, 0);
  const minutes = next.getMinutes();
  if (minutes < 30) {
    next.setMinutes(30);
  } else {
    next.setHours(next.getHours() + 1, 0, 0, 0);
  }
  return next;
}

function addMonthsToDate(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function addYearsToDate(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function makeEventDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map((part) => Number(part));
  const [hour, minute] = time.split(":").map((part) => Number(part));
  return new Date(year, month - 1, day, hour || 0, minute || 0, 0);
}

function calendarDraftToDates(draft: CalendarEventDraft) {
  const [year, month, day] = draft.date.split("-").map((part) => Number(part));
  if (draft.allDay) {
    const start = new Date(year, month - 1, day);
    return { start, end: addDaysToDate(start, 1) };
  }

  const start = makeEventDate(draft.date, draft.startTime || "09:00");
  let end = makeEventDate(draft.date, draft.endTime || "10:00");
  if (end <= start) end = addMinutes(start, 60);
  return { start, end };
}

function addDaysToDate(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildIcsEventLines(draft: CalendarEventDraft, uid: string) {
  const { start, end } = calendarDraftToDates(draft);
  const now = new Date();
  const lines = [
    `UID:${uid}`,
    `DTSTAMP:${formatIcsUtcDateTime(now)}`,
    `LAST-MODIFIED:${formatIcsUtcDateTime(now)}`,
    `SUMMARY:${escapeIcsText(draft.title.trim())}`
  ];

  if (draft.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(start)}`);
    lines.push(`DTEND;VALUE=DATE:${formatIcsDate(end)}`);
  } else {
    lines.push(`DTSTART:${formatIcsLocalDateTime(start)}`);
    lines.push(`DTEND:${formatIcsLocalDateTime(end)}`);
  }

  if (draft.location.trim()) lines.push(`LOCATION:${escapeIcsText(draft.location.trim())}`);
  if (draft.notes.trim()) lines.push(`DESCRIPTION:${escapeIcsText(draft.notes.trim())}`);
  const rrule = formatRepeatRule(draft);
  if (rrule) lines.push(`RRULE:${rrule}`);
  return lines;
}

function formatRepeatRule(draft: CalendarEventDraft) {
  if (draft.repeat === "none") return "";
  const parts: string[] = [];
  if (draft.repeat === "daily") parts.push("FREQ=DAILY");
  if (draft.repeat === "weekdays") parts.push("FREQ=WEEKLY", "BYDAY=MO,TU,WE,TH,FR");
  if (draft.repeat === "weekly") parts.push("FREQ=WEEKLY");
  if (draft.repeat === "monthly") parts.push("FREQ=MONTHLY");
  if (draft.repeat === "yearly") parts.push("FREQ=YEARLY");
  if (draft.repeatUntil) {
    const until = draft.allDay ? `${draft.repeatUntil.replace(/-/g, "")}` : formatIcsLocalDateTime(makeEventDate(draft.repeatUntil, draft.endTime || "23:59"));
    parts.push(`UNTIL=${until}`);
  }
  return parts.join(";");
}

function buildNewIcsEvent(draft: CalendarEventDraft, uid: string) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Home Base//Obsidian Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `CREATED:${formatIcsUtcDateTime(new Date())}`,
    ...buildIcsEventLines(draft, uid),
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

function updateExistingIcsEvent(rawIcs: string, draft: CalendarEventDraft, uid: string) {
  const lines = unfoldIcsLines(rawIcs);
  const begin = lines.findIndex((line) => line.toUpperCase() === "BEGIN:VEVENT");
  const end = lines.findIndex((line, index) => index > begin && line.toUpperCase() === "END:VEVENT");
  if (begin === -1 || end === -1) return buildNewIcsEvent(draft, uid);

  const replacement = buildIcsEventLines(draft, uid);
  const replacedNames = new Set(["UID", "DTSTAMP", "LAST-MODIFIED", "SUMMARY", "DTSTART", "DTEND", "LOCATION", "DESCRIPTION", "RRULE"]);
  const nextLines = [
    ...lines.slice(0, begin + 1),
    ...replacement,
    ...lines.slice(begin + 1, end).filter((line) => {
      const property = parseIcsProperty(line);
      return !property || !replacedNames.has(property.name);
    }),
    ...lines.slice(end)
  ];
  return `${nextLines.map(foldIcsLine).join("\r\n")}\r\n`;
}

function parseCalendarEvent(rawIcs: string, href: string, etag: string, calendarName: string): CalendarEvent | null {
  const lines = unfoldIcsLines(rawIcs);
  const begin = lines.findIndex((line) => line.toUpperCase() === "BEGIN:VEVENT");
  const end = lines.findIndex((line, index) => index > begin && line.toUpperCase() === "END:VEVENT");
  if (begin === -1 || end === -1) return null;

  const properties = lines.slice(begin + 1, end)
    .map(parseIcsProperty)
    .filter((property): property is NonNullable<ReturnType<typeof parseIcsProperty>> => Boolean(property));
  const find = (name: string) => properties.find((property) => property.name === name);
  const all = (name: string) => properties.filter((property) => property.name === name);
  const uid = find("UID")?.value || href.split("/").pop()?.replace(/\.ics$/i, "") || crypto.randomUUID();
  const startProperty = find("DTSTART");
  if (!startProperty) return null;
  const parsedStart = parseIcsDateValue(startProperty.value, startProperty.params);
  const endProperty = find("DTEND");
  const parsedEnd = endProperty ? parseIcsDateValue(endProperty.value, endProperty.params) : {
    date: parsedStart.allDay ? addDaysToDate(parsedStart.date, 1) : addMinutes(parsedStart.date, 60),
    allDay: parsedStart.allDay
  };

  const repeatInfo = parseRepeatRule(find("RRULE")?.value ?? "");
  const exceptionDates = all("EXDATE").flatMap((property) => {
    return property.value.split(",").map((value) => parseIcsDateKey(value, property.params));
  });

  return {
    uid,
    href,
    etag,
    title: unescapeIcsText(find("SUMMARY")?.value ?? ""),
    start: parsedStart.date,
    end: parsedEnd.date,
    allDay: parsedStart.allDay,
    location: unescapeIcsText(find("LOCATION")?.value ?? ""),
    notes: unescapeIcsText(find("DESCRIPTION")?.value ?? ""),
    repeat: repeatInfo.repeat,
    repeatUntil: repeatInfo.repeatUntil,
    exceptionDates,
    rawIcs,
    calendarName
  };
}

function parseRepeatRule(value: string): { repeat: RepeatFrequency; repeatUntil: string } {
  if (!value) return { repeat: "none", repeatUntil: "" };
  const parts = Object.fromEntries(value.split(";").map((part) => {
    const [key, ruleValue = ""] = part.split("=");
    return [key.toUpperCase(), ruleValue.toUpperCase()];
  }));
  let repeat: RepeatFrequency = "none";
  if (parts.FREQ === "DAILY") repeat = "daily";
  if (parts.FREQ === "WEEKLY" && parts.BYDAY === "MO,TU,WE,TH,FR") repeat = "weekdays";
  else if (parts.FREQ === "WEEKLY") repeat = "weekly";
  if (parts.FREQ === "MONTHLY") repeat = "monthly";
  if (parts.FREQ === "YEARLY") repeat = "yearly";
  return { repeat, repeatUntil: parts.UNTIL ? `${parts.UNTIL.slice(0, 4)}-${parts.UNTIL.slice(4, 6)}-${parts.UNTIL.slice(6, 8)}` : "" };
}

function occurrenceExceptionKey(event: CalendarEvent) {
  const occurrenceStart = event.occurrenceStart ?? event.start;
  return event.allDay ? formatIcsDate(occurrenceStart) : formatIcsLocalDateTime(occurrenceStart);
}

function addExceptionToIcs(rawIcs: string, event: CalendarEvent) {
  const lines = unfoldIcsLines(rawIcs);
  const end = lines.findIndex((line) => line.toUpperCase() === "END:VEVENT");
  if (end === -1) return rawIcs;
  const key = occurrenceExceptionKey(event);
  if (event.exceptionDates.includes(key)) return rawIcs;
  const exdate = event.allDay ? `EXDATE;VALUE=DATE:${key}` : `EXDATE:${key}`;
  const nextLines = [...lines.slice(0, end), exdate, ...lines.slice(end)];
  return `${nextLines.map(foldIcsLine).join("\r\n")}\r\n`;
}

function expandCalendarEvents(events: CalendarEvent[], start: Date, end: Date) {
  return events.flatMap((event) => event.repeat === "none" ? [event] : expandRepeatingEvent(event, start, end));
}

function expandRepeatingEvent(event: CalendarEvent, rangeStart: Date, rangeEnd: Date) {
  const duration = event.end.getTime() - event.start.getTime();
  const until = event.repeatUntil ? addDaysToDate(new Date(`${event.repeatUntil}T00:00:00`), 1) : rangeEnd;
  const events: CalendarEvent[] = [];
  let cursor = new Date(event.start);
  let guard = 0;

  while (cursor < rangeEnd && cursor < until && guard < 500) {
    guard += 1;
    const nextEnd = new Date(cursor.getTime() + duration);
    const key = event.allDay ? formatIcsDate(cursor) : formatIcsLocalDateTime(cursor);
    const isWeekday = cursor.getDay() >= 1 && cursor.getDay() <= 5;
    if (nextEnd >= rangeStart && cursor < rangeEnd && !event.exceptionDates.includes(key) && (event.repeat !== "weekdays" || isWeekday)) {
      events.push({ ...event, start: new Date(cursor), end: nextEnd, occurrenceStart: new Date(cursor) });
    }
    if (event.repeat === "daily" || event.repeat === "weekdays") cursor = addDaysToDate(cursor, 1);
    else if (event.repeat === "weekly") cursor = addDaysToDate(cursor, 7);
    else if (event.repeat === "monthly") cursor = addMonthsToDate(cursor, 1);
    else if (event.repeat === "yearly") cursor = addYearsToDate(cursor, 1);
    else break;
  }

  return events;
}

function getElementsByLocalName(parent: Document | Element, localName: string): Element[] {
  const root = parent instanceof Document ? parent.documentElement : parent;
  const elements = Array.from(root.getElementsByTagName("*"));
  if (root.localName === localName) elements.unshift(root);
  return elements.filter((element) => element.localName === localName);
}

function firstTextByLocalName(parent: Document | Element, localName: string) {
  return getElementsByLocalName(parent, localName)[0]?.textContent?.trim() ?? "";
}

function hrefInside(parent: Document | Element, localName: string) {
  const container = getElementsByLocalName(parent, localName)[0];
  return container ? firstTextByLocalName(container, "href") : "";
}

function parseXml(text: string) {
  return new DOMParser().parseFromString(text, "application/xml");
}

const HOME_BASE_STYLES = `
.home-base-view {
  min-height: 100%;
  padding: 32px;
  color: var(--text-normal);
  background:
    radial-gradient(circle at top right, rgba(124, 97, 255, 0.12), transparent 36rem),
    var(--background-primary);
}

.home-base-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
}

.home-base-header h1 {
  margin: 0 0 8px;
  font-size: 30px;
  letter-spacing: 0;
}

.home-base-date,
.home-base-greeting,
.home-base-muted {
  color: var(--text-muted);
}

.home-base-greeting {
  margin-top: 6px;
}

.home-base-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(360px, 1.2fr);
  gap: 22px;
  align-items: start;
}

.home-base-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-base-panel {
  padding: 20px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  background: var(--background-secondary);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.14);
}

.home-base-panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.home-base-panel-title h2 {
  margin: 0;
  font-size: 18px;
}

.home-base-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  min-height: 28px;
  color: var(--interactive-accent);
  font-size: 12px;
}

.home-base-pill,
.home-base-priority {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 2px 9px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.home-base-pill {
  color: var(--interactive-accent);
  background: rgba(124, 97, 255, 0.14);
}

.home-base-schedule-empty {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border: 1px dashed var(--background-modifier-border);
  border-radius: 8px;
}

.home-base-schedule-empty p {
  margin: 4px 0 0;
  color: var(--text-muted);
}

.home-base-calendar-mark {
  color: var(--text-muted);
  font-size: 13px;
}

.home-base-calendar-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.home-base-calendar-error {
  padding: 14px;
  border: 1px solid rgba(199, 74, 48, 0.5);
  border-radius: 8px;
  color: #ff8f7e;
  background: rgba(199, 74, 48, 0.12);
}

.home-base-calendar-error p {
  margin: 6px 0 0;
}

.home-base-calendar-group {
  margin-top: 18px;
}

.home-base-calendar-event {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  padding: 12px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  background: var(--background-primary);
}

.home-base-calendar-time {
  color: var(--interactive-accent);
  font-size: 12px;
  font-weight: 700;
}

.home-base-calendar-time.is-all-day {
  color: var(--text-muted);
}

.home-base-calendar-title {
  margin-bottom: 6px;
  font-weight: 600;
}

.home-base-calendar-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.home-base-italic {
  font-style: italic;
}

.home-base-todo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.home-base-primary-button,
.home-base-secondary-button,
.home-base-wide-button,
.home-base-icon-button,
.home-base-ghost-button {
  min-height: 36px;
  border-radius: 6px;
}

.home-base-wide-button {
  width: 100%;
  margin: 12px 0;
}

.home-base-icon-button {
  padding: 0 14px;
}

.home-base-secondary-button {
  background: var(--background-modifier-form-field);
}

.home-base-ghost-button {
  padding: 4px 8px;
  color: var(--text-muted);
  background: transparent;
  box-shadow: none;
}

.home-base-todo-group {
  margin-top: 18px;
}

.home-base-todo-group h3,
.home-base-panel h3 {
  margin: 0 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--background-modifier-border);
  font-size: 15px;
}

.home-base-todo-item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  padding: 14px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  background: var(--background-primary);
}

.home-base-todo-item.is-complete {
  opacity: 0.58;
}

.home-base-checkbox {
  width: 18px;
  height: 18px;
}

.home-base-todo-name {
  margin-bottom: 7px;
  font-weight: 500;
}

.home-base-todo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: var(--text-muted);
  font-size: 13px;
}

.home-base-priority.is-high {
  color: #ff8f7e;
  background: rgba(199, 74, 48, 0.18);
}

.home-base-priority.is-medium {
  color: #e7bd5b;
  background: rgba(178, 132, 32, 0.18);
}

.home-base-priority.is-low {
  color: #8dd277;
  background: rgba(70, 139, 63, 0.18);
}

.home-base-tag {
  color: var(--interactive-accent);
}

.home-base-actions {
  display: flex;
  gap: 4px;
}

.home-base-unresolved {
  margin-bottom: 18px;
  padding: 14px;
  border: 1px solid rgba(226, 170, 68, 0.5);
  border-radius: 8px;
  color: #f0c25f;
  background: rgba(226, 170, 68, 0.1);
}

.home-base-unresolved-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.home-base-workout-name {
  margin: 8px 0 10px;
  color: var(--interactive-accent);
  font-size: 30px;
  font-weight: 700;
}

.home-base-exercises {
  margin-top: 0;
}

.home-base-exercises li::marker {
  color: var(--interactive-accent);
}

.home-base-workout-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.home-base-sequence {
  margin-top: 18px;
  color: var(--text-muted);
}

.home-base-modal .setting-item {
  border-top: 0;
}

.home-base-routine-modal {
  max-width: 780px;
}

.home-base-routine-section {
  margin-top: 22px;
}

.home-base-routine-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.home-base-routine-section-header h3 {
  margin: 0;
}

.home-base-routine-card {
  margin-bottom: 12px;
  padding: 14px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  background: var(--background-secondary);
}

.home-base-routine-card-row,
.home-base-sequence-row,
.home-base-modal-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.home-base-routine-name,
.home-base-sequence-row select {
  flex: 1;
}

.home-base-routine-exercises {
  width: 100%;
  min-height: 86px;
  margin-top: 10px;
  resize: vertical;
}

.home-base-sequence-row {
  margin-bottom: 8px;
  padding: 10px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  background: var(--background-secondary);
}

.home-base-sequence-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  color: var(--text-muted);
  background: var(--background-modifier-border);
  font-size: 12px;
}

.home-base-modal-footer {
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 900px) {
  .home-base-view {
    padding: 18px;
  }

  .home-base-grid {
    grid-template-columns: 1fr;
  }

  .home-base-todo-item {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .home-base-calendar-event {
    grid-template-columns: 1fr;
  }

  .home-base-actions {
    grid-column: 2;
  }

  .home-base-calendar-event .home-base-actions {
    grid-column: 1;
  }

  .home-base-routine-card-row,
  .home-base-sequence-row {
    align-items: stretch;
    flex-direction: column;
  }
}
`;

export default class HomeBasePlugin extends Plugin {
  settings: HomeBaseSettings;
  private styleEl?: HTMLStyleElement;

  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.injectStyles();

    this.registerView(
      VIEW_TYPE_HOME_BASE,
      (leaf) => new HomeBaseView(leaf, this)
    );

    this.addRibbonIcon("home", "Open Home Base", () => {
      void this.openDashboard();
    });

    this.addCommand({
      id: "open-home-base",
      name: "Open Home Base",
      callback: () => void this.openDashboard()
    });

    this.addCommand({
      id: "refresh-home-base",
      name: "Refresh Home Base",
      callback: () => void this.refreshDashboard()
    });

    this.addSettingTab(new HomeBaseSettingTab(this.app, this));
    await this.ensureDefaultFiles().catch((error) => {
      console.warn("Home Base could not create one or more default files.", error);
    });

    if (this.settings.openOnStartup) {
      this.app.workspace.onLayoutReady(() => {
        void this.openDashboard();
      });
    }
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_HOME_BASE);
    this.styleEl?.remove();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async openDashboard() {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_HOME_BASE)[0];

    if (existing) {
      this.app.workspace.revealLeaf(existing);
      return;
    }

    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({
      type: VIEW_TYPE_HOME_BASE,
      active: true
    });
    this.app.workspace.revealLeaf(leaf);
  }

  async refreshDashboard() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_HOME_BASE);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view instanceof HomeBaseView) {
        await view.render();
      }
    }
  }

  async fetchCalendarEvents(start: Date, end: Date): Promise<CalendarFetchState> {
    if (!this.hasCalendarConfig()) {
      return { events: [], error: "", setupRequired: true };
    }

    try {
      const calendar = await this.getDefaultCalendar();
      if (!calendar) return { events: [], error: "No CalDAV event calendar was found.", setupRequired: false };

      const body = `<?xml version="1.0" encoding="utf-8" ?>
<c:calendar-query xmlns:d="${DAV_NS}" xmlns:c="${CALDAV_NS}">
  <d:prop>
    <d:getetag />
    <c:calendar-data />
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${formatIcsUtcDateTime(start)}" end="${formatIcsUtcDateTime(end)}" />
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`;
      const response = await this.caldavRequest(calendar.href, "REPORT", body, { Depth: "1" });
      const document = parseXml(response.text);
      const events = expandCalendarEvents(getElementsByLocalName(document, "response")
        .map((element) => {
          const href = resolveRemoteUrl(calendar.href, firstTextByLocalName(element, "href"));
          const etag = firstTextByLocalName(element, "getetag");
          const calendarData = firstTextByLocalName(element, "calendar-data");
          if (!calendarData) return null;
          return parseCalendarEvent(calendarData, href, etag, calendar.displayName);
        })
        .filter((event): event is CalendarEvent => Boolean(event)), start, end)
        .filter((event) => event.end >= start && event.start < end)
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      return { events, error: "", setupRequired: false };
    } catch (error) {
      return { events: [], error: this.readableCalendarError(error), setupRequired: false };
    }
  }

  async saveCalendarEvent(draft: CalendarEventDraft) {
    const calendar = await this.getDefaultCalendar();
    if (!calendar) {
      new Notice("Set up a default CalDAV calendar first.");
      return;
    }

    const uid = draft.uid || crypto.randomUUID();
    const href = draft.href || resolveRemoteUrl(calendar.href, calendarEventFileName(uid));
    const ics = draft.rawIcs ? updateExistingIcsEvent(draft.rawIcs, draft, uid) : buildNewIcsEvent(draft, uid);
    const headers: Record<string, string> = {
      "Content-Type": "text/calendar; charset=utf-8"
    };

    if (draft.etag) {
      headers["If-Match"] = draft.etag;
    } else {
      headers["If-None-Match"] = "*";
    }

    try {
      await this.caldavRequest(href, "PUT", ics, headers);
      new Notice("Calendar event saved.");
    } catch (error) {
      new Notice(this.readableCalendarError(error));
      throw error;
    }
  }

  async saveCalendarOccurrence(event: CalendarEvent, draft: CalendarEventDraft) {
    await this.excludeCalendarOccurrence(event);
    await this.saveCalendarEvent({
      ...draft,
      uid: undefined,
      href: undefined,
      etag: undefined,
      rawIcs: undefined,
      repeat: "none",
      repeatUntil: ""
    });
  }

  async deleteCalendarEvent(event: CalendarEvent, occurrenceOnly = false) {
    try {
      if (occurrenceOnly && event.repeat !== "none") {
        await this.excludeCalendarOccurrence(event);
        new Notice("Calendar occurrence deleted.");
        return;
      }
      await this.caldavRequest(event.href, "DELETE", "", event.etag ? { "If-Match": event.etag } : {});
      new Notice("Calendar event deleted.");
    } catch (error) {
      new Notice(this.readableCalendarError(error));
      throw error;
    }
  }

  private async excludeCalendarOccurrence(event: CalendarEvent) {
    const ics = addExceptionToIcs(event.rawIcs, event);
    await this.caldavRequest(event.href, "PUT", ics, {
      "Content-Type": "text/calendar; charset=utf-8",
      ...(event.etag ? { "If-Match": event.etag } : {})
    });
  }

  async testCalendarConnection() {
    if (!this.hasCalendarCredentials()) {
      throw new Error("Fill in the CalDAV server URL, Apple ID email, and app-specific password first.");
    }

    const calendar = await this.getDefaultCalendar(true, true);
    if (!calendar) throw new Error("No event calendar was found for this CalDAV account.");
    return calendar;
  }

  private hasCalendarCredentials() {
    return Boolean(
      this.settings.calendarServerUrl.trim() &&
      this.settings.calendarUsername.trim() &&
      this.settings.calendarPassword.trim()
    );
  }

  private hasCalendarConfig() {
    return Boolean(
      this.settings.calendarEnabled &&
      this.hasCalendarCredentials()
    );
  }

  private async getDefaultCalendar(forceDiscovery = false, allowDisabled = false): Promise<CalendarInfo | null> {
    if (allowDisabled ? !this.hasCalendarCredentials() : !this.hasCalendarConfig()) return null;

    if (this.settings.calendarUrl.trim() && !forceDiscovery) {
      return {
        href: normalizeRemoteUrl(this.settings.calendarUrl),
        displayName: this.settings.calendarName || "Calendar",
        writable: true
      };
    }

    const calendars = await this.discoverCalendars();
    const writableCalendars = calendars.filter((calendar) => calendar.writable);
    const preferred =
      calendars.find((calendar) => calendar.href === normalizeRemoteUrl(this.settings.calendarUrl)) ??
      writableCalendars[0] ??
      calendars[0];
    if (!preferred) return null;

    this.settings.calendarUrl = preferred.href;
    this.settings.calendarName = preferred.displayName;
    await this.saveSettings();
    return preferred;
  }

  private async discoverCalendars(): Promise<CalendarInfo[]> {
    const serverUrl = normalizeRemoteUrl(this.settings.calendarServerUrl);
    const principalResponse = await this.caldavRequest(
      serverUrl,
      "PROPFIND",
      `<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${DAV_NS}">
  <d:prop>
    <d:current-user-principal />
  </d:prop>
</d:propfind>`,
      { Depth: "0" }
    );
    const principalDocument = parseXml(principalResponse.text);
    const principalHref = hrefInside(principalDocument, "current-user-principal");
    if (!principalHref) throw new Error("CalDAV server did not return a principal URL.");

    const homeResponse = await this.caldavRequest(
      resolveRemoteUrl(serverUrl, principalHref),
      "PROPFIND",
      `<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${DAV_NS}" xmlns:c="${CALDAV_NS}">
  <d:prop>
    <c:calendar-home-set />
  </d:prop>
</d:propfind>`,
      { Depth: "0" }
    );
    const homeDocument = parseXml(homeResponse.text);
    const homeHref = hrefInside(homeDocument, "calendar-home-set");
    if (!homeHref) throw new Error("CalDAV server did not return a calendar home.");

    const homeUrl = resolveRemoteUrl(serverUrl, homeHref);
    const calendarsResponse = await this.caldavRequest(
      homeUrl,
      "PROPFIND",
      `<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${DAV_NS}" xmlns:c="${CALDAV_NS}">
  <d:prop>
    <d:displayname />
    <d:resourcetype />
    <d:current-user-privilege-set />
    <c:supported-calendar-component-set />
  </d:prop>
</d:propfind>`,
      { Depth: "1" }
    );
    const calendarsDocument = parseXml(calendarsResponse.text);

    return getElementsByLocalName(calendarsDocument, "response")
      .map((element) => {
        const href = firstTextByLocalName(element, "href");
        const resourceType = getElementsByLocalName(element, "resourcetype")[0];
        const isCalendar = Boolean(resourceType && getElementsByLocalName(resourceType, "calendar").length);
        const supportedComponents = getElementsByLocalName(element, "comp").map((comp) => (comp.getAttribute("name") ?? "").toUpperCase());
        const supportsEvents = !supportedComponents.length || supportedComponents.includes("VEVENT");
        const privilegeSet = getElementsByLocalName(element, "current-user-privilege-set")[0];
        const privileges = privilegeSet ? getElementsByLocalName(privilegeSet, "privilege").flatMap((privilege) => {
          return Array.from(privilege.children).map((child) => child.localName);
        }) : [];
        const writable = !privileges.length || privileges.some((privilege) => {
          return ["write", "write-content", "bind", "unbind"].includes(privilege);
        });
        if (!href || !isCalendar || !supportsEvents) return null;
        return {
          href: resolveRemoteUrl(homeUrl, href),
          displayName: firstTextByLocalName(element, "displayname") || "Calendar",
          writable
        };
      })
      .filter((calendar): calendar is CalendarInfo => Boolean(calendar));
  }

  private async caldavRequest(url: string, method: string, body = "", headers: Record<string, string> = {}) {
    const response = await requestUrl({
      url,
      method,
      body,
      headers: {
        Authorization: `Basic ${btoa(`${this.settings.calendarUsername}:${this.settings.calendarPassword}`)}`,
        "Content-Type": "application/xml; charset=utf-8",
        ...headers
      }
    });

    if (response.status >= 400) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Calendar authentication failed. Check your Apple ID and app-specific password.");
      }
      if (response.status === 405) {
        throw new Error("This calendar does not allow that sync action. Choose a normal writable iCloud calendar.");
      }
      if (response.status === 409 || response.status === 412) {
        throw new Error("This event changed remotely. Refresh Home Base and try again.");
      }
      throw new Error(`CalDAV request failed with status ${response.status}.`);
    }

    return response;
  }

  private readableCalendarError(error: unknown) {
    if (error instanceof Error) return error.message;
    return "Calendar sync failed.";
  }

  async ensureDefaultFiles() {
    await this.ensureFile(this.settings.todoInboxPath, DEFAULT_TODO_INBOX);
    await this.ensureFile(this.settings.workoutPlanPath, DEFAULT_WORKOUT_PLAN);
    await this.ensureFile(this.settings.workoutLogPath, DEFAULT_WORKOUT_LOG);
  }

  async ensureFile(path: string, content: string) {
    const normalized = normalizePath(path);
    const existing = this.app.vault.getAbstractFileByPath(normalized);
    if (existing instanceof TFile) return;
    if (existing) {
      throw new Error(`Expected a file path but found a folder: ${normalized}`);
    }

    const folder = normalized.split("/").slice(0, -1).join("/");
    if (folder) await this.ensureFolder(folder);
    await this.app.vault.create(normalized, content);
  }

  async ensureFolder(path: string) {
    const parts = normalizePath(path).split("/");
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      const existing = this.app.vault.getAbstractFileByPath(current);
      if (existing instanceof TFile) {
        throw new Error(`Expected a folder path but found a file: ${current}`);
      }
      if (!existing) {
        await this.app.vault.createFolder(current);
      }
    }
  }

  private injectStyles() {
    this.styleEl?.remove();
    this.styleEl = document.createElement("style");
    this.styleEl.id = "home-base-runtime-styles";
    this.styleEl.textContent = HOME_BASE_STYLES;
    document.head.appendChild(this.styleEl);
  }
}

class HomeBaseView extends ItemView {
  private plugin: HomeBasePlugin;

  constructor(leaf: WorkspaceLeaf, plugin: HomeBasePlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE_HOME_BASE;
  }

  getDisplayText() {
    return "Home Base";
  }

  getIcon() {
    return "home";
  }

  async onOpen() {
    await this.render();
  }

  async render() {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("home-base-view");

    const todos = await this.loadTodos();
    const plan = await this.loadWorkoutPlan();
    const log = await this.loadWorkoutLog();
    const calendar = await this.plugin.fetchCalendarEvents(this.startOfDay(new Date()), this.addDays(new Date(), 8));
    const workoutState = this.getWorkoutState(plan, log);

    this.renderHeader(root);

    const grid = root.createDiv({ cls: "home-base-grid" });
    const left = grid.createDiv({ cls: "home-base-column home-base-left" });
    const right = grid.createDiv({ cls: "home-base-column home-base-right" });

    this.renderCalendar(left, calendar);
    this.renderWorkout(left, plan, workoutState);
    this.renderTodos(right, todos);
  }

  private renderHeader(root: HTMLElement) {
    const header = root.createDiv({ cls: "home-base-header" });
    const date = new Date();
    const left = header.createDiv();
    left.createEl("h1", { text: "Home Base" });
    left.createDiv({
      cls: "home-base-date",
      text: date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    });
    left.createDiv({ cls: "home-base-greeting", text: this.getGreeting() });

    const refresh = header.createEl("button", {
      cls: "home-base-icon-button",
      attr: { "aria-label": "Refresh" }
    });
    refresh.setText("Refresh");
    refresh.onClickEvent(() => void this.render());
  }

  private renderCalendar(parent: HTMLElement, state: CalendarFetchState) {
    const panel = parent.createDiv({ cls: "home-base-panel home-base-calendar-panel" });
    const title = panel.createDiv({ cls: "home-base-panel-title" });
    title.createEl("span", { cls: "home-base-icon", text: "Cal" });
    title.createEl("h2", { text: "Calendar" });
    if (this.plugin.settings.calendarName) {
      title.createEl("span", { cls: "home-base-pill", text: this.plugin.settings.calendarName });
    }

    const controls = panel.createDiv({ cls: "home-base-calendar-controls" });
    const add = controls.createEl("button", { cls: "mod-cta home-base-primary-button", text: "+ Event" });
    add.disabled = state.setupRequired || Boolean(state.error);
    add.onClickEvent(() => {
      new CalendarEventModal(this.app, this.plugin, undefined, () => void this.render()).open();
    });

    const refresh = controls.createEl("button", { cls: "home-base-secondary-button", text: "Refresh" });
    refresh.onClickEvent(() => void this.render());

    if (state.setupRequired) {
      const setup = panel.createDiv({ cls: "home-base-schedule-empty" });
      setup.createDiv({ cls: "home-base-calendar-mark", text: "CalDAV" });
      const copy = setup.createDiv();
      copy.createEl("strong", { text: "Connect iCloud Calendar" });
      copy.createEl("p", {
        text: "Enable Calendar in Home Base settings, then add your iCloud CalDAV account and default calendar."
      });
      return;
    }

    if (state.error) {
      const error = panel.createDiv({ cls: "home-base-calendar-error" });
      error.createEl("strong", { text: "Calendar could not sync" });
      error.createEl("p", { text: state.error });
      return;
    }

    const today = this.startOfDay(new Date());
    const tomorrow = this.addDays(today, 1);
    const nextWeek = this.addDays(today, 7);
    const todayEvents = state.events.filter((event) => this.eventOccursOn(event, today));
    const upcomingEvents = state.events.filter((event) => {
      const eventDay = this.startOfDay(event.start);
      return eventDay >= tomorrow && eventDay <= nextWeek;
    });

    this.renderCalendarGroup(panel, "Today", todayEvents, "No events today");
    this.renderCalendarGroup(panel, "Next 7 Days", upcomingEvents, "No upcoming events");
  }

  private renderCalendarGroup(parent: HTMLElement, heading: string, events: CalendarEvent[], emptyText: string) {
    const group = parent.createDiv({ cls: "home-base-calendar-group" });
    group.createEl("h3", { text: heading });
    if (!events.length) {
      group.createEl("p", { cls: "home-base-muted home-base-italic", text: emptyText });
      return;
    }

    for (const event of events) {
      this.renderCalendarEvent(group, event);
    }
  }

  private renderCalendarEvent(parent: HTMLElement, event: CalendarEvent) {
    const item = parent.createDiv({ cls: "home-base-calendar-event" });
    const time = item.createDiv({ cls: "home-base-calendar-time", text: this.formatCalendarEventTime(event) });
    if (event.allDay) time.addClass("is-all-day");

    const body = item.createDiv({ cls: "home-base-calendar-body" });
    body.createDiv({ cls: "home-base-calendar-title", text: event.title || "Untitled event" });
    const meta = body.createDiv({ cls: "home-base-calendar-meta" });
    if (!this.eventOccursOn(event, this.startOfDay(new Date()))) {
      meta.createEl("span", { text: this.formatCalendarDate(event.start) });
    }
    if (event.location) {
      meta.createEl("span", { text: event.location });
    }
    if (event.repeat !== "none") {
      meta.createEl("span", { text: this.formatRepeatLabel(event.repeat) });
    }

    const actions = item.createDiv({ cls: "home-base-actions" });
    const edit = actions.createEl("button", { cls: "home-base-ghost-button", text: "Edit" });
    edit.onClickEvent(() => new CalendarEventModal(this.app, this.plugin, event, () => void this.render()).open());
    const remove = actions.createEl("button", { cls: "home-base-ghost-button", text: "Delete" });
    remove.onClickEvent(async () => {
      const confirmed = confirm(`Delete "${event.title || "Untitled event"}"?`);
      if (!confirmed) return;
      const occurrenceOnly = event.repeat !== "none" && confirm("Delete only this event? Press Cancel to delete the whole repeating series.");
      await this.plugin.deleteCalendarEvent(event, occurrenceOnly);
      await this.render();
    });
  }

  private renderTodos(parent: HTMLElement, todos: TodoItem[]) {
    const panel = parent.createDiv({ cls: "home-base-panel home-base-todo-panel" });
    const title = panel.createDiv({ cls: "home-base-panel-title home-base-todo-title" });
    title.createEl("span", { cls: "home-base-icon", text: "Task" });
    title.createEl("h2", { text: "Todo Manager" });

    const controls = panel.createDiv({ cls: "home-base-todo-controls" });
    const newTodo = controls.createEl("button", { cls: "mod-cta home-base-primary-button", text: "+ New Todo" });
    newTodo.onClickEvent(() => {
      new TodoModal(this.app, this.plugin, undefined, () => void this.render()).open();
    });

    const groups = this.groupTodos(todos);
    for (const groupName of ["Overdue", "Today", "Tomorrow", "Next 7 Days", "No Due Date", "Later"] as TodoGroup[]) {
      const groupTodos = groups[groupName];
      if (!groupTodos.length && groupName === "Later") continue;

      const group = panel.createDiv({ cls: "home-base-todo-group" });
      group.createEl("h3", { text: groupName });
      if (!groupTodos.length) {
        group.createEl("p", {
          cls: "home-base-muted home-base-italic",
          text: groupName === "Tomorrow" ? "No todos due tomorrow" : `No todos in ${groupName.toLowerCase()}`
        });
        continue;
      }

      for (const todo of groupTodos) {
        this.renderTodoItem(group, todo);
      }
    }
  }

  private renderTodoItem(parent: HTMLElement, todo: TodoItem) {
    const item = parent.createDiv({ cls: `home-base-todo-item ${todo.completed ? "is-complete" : ""}` });
    const checkbox = item.createEl("input", { cls: "home-base-checkbox" });
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.onClickEvent(async () => {
      await this.setTodoCompletion(todo, checkbox.checked);
      await this.render();
    });

    const body = item.createDiv({ cls: "home-base-todo-body" });
    body.createDiv({ cls: "home-base-todo-name", text: todo.title });

    const meta = body.createDiv({ cls: "home-base-todo-meta" });
    meta.createEl("span", { cls: "home-base-due", text: todo.due ? this.formatDue(todo.due) : "No due date" });
    if (todo.priority) {
      meta.createEl("span", { cls: `home-base-priority is-${todo.priority}`, text: this.capitalize(todo.priority) });
    }
    for (const tag of todo.tags) {
      meta.createEl("span", { cls: "home-base-tag", text: tag });
    }

    const actions = item.createDiv({ cls: "home-base-actions" });
    const edit = actions.createEl("button", { cls: "home-base-ghost-button", text: "Edit" });
    edit.onClickEvent(() => new TodoModal(this.app, this.plugin, todo, () => void this.render()).open());
    const remove = actions.createEl("button", { cls: "home-base-ghost-button", text: "Delete" });
    remove.onClickEvent(async () => {
      await this.deleteTodo(todo);
      await this.render();
    });
  }

  private renderWorkout(parent: HTMLElement, plan: WorkoutPlan, state: ReturnType<HomeBaseView["getWorkoutState"]>) {
    const panel = parent.createDiv({ cls: "home-base-panel" });
    const title = panel.createDiv({ cls: "home-base-panel-title" });
    title.createEl("span", { cls: "home-base-icon", text: "Fit" });
    title.createEl("h2", { text: "Workout" });

    if (state.unresolved) {
      const unresolved = panel.createDiv({ cls: "home-base-unresolved" });
      unresolved.createDiv({ text: `Yesterday's workout was not resolved: ${state.unresolved.workout}` });
      const buttons = unresolved.createDiv({ cls: "home-base-unresolved-actions" });
      const done = buttons.createEl("button", { text: "Mark Done" });
      done.onClickEvent(async () => {
        await this.appendWorkoutLog(state.unresolved!.date, state.unresolved!.workout, "done");
        await this.render();
      });
      const skip = buttons.createEl("button", { text: "Skip" });
      skip.onClickEvent(async () => {
        await this.appendWorkoutLog(state.unresolved!.date, state.unresolved!.workout, "skipped");
        await this.render();
      });
      const pending = buttons.createEl("button", { text: "Keep Pending" });
      pending.onClickEvent(async () => {
        new Notice("Kept as pending.");
      });
    }

    panel.createEl("h3", { text: "Today's Workout" });
    panel.createEl("div", { cls: "home-base-workout-name", text: state.todayWorkout });

    const exercises = plan.types[state.todayWorkout] ?? [];
    if (exercises.length) {
      const list = panel.createEl("ul", { cls: "home-base-exercises" });
      for (const exercise of exercises) {
        list.createEl("li", { text: exercise });
      }
    } else {
      panel.createEl("p", { cls: "home-base-muted", text: "No exercises configured for this workout." });
    }

    const edit = panel.createEl("button", { cls: "home-base-wide-button", text: "Edit Routine" });
    edit.onClickEvent(() => {
      new WorkoutRoutineModal(this.app, this.plugin, plan, () => void this.render()).open();
    });

    const actions = panel.createDiv({ cls: "home-base-workout-actions" });
    const done = actions.createEl("button", { cls: "mod-cta home-base-primary-button", text: "Done" });
    done.onClickEvent(async () => {
      await this.appendWorkoutLog(this.todayKey(), state.todayWorkout, "done");
      await this.render();
    });
    const skip = actions.createEl("button", { cls: "home-base-secondary-button", text: "Skip" });
    skip.onClickEvent(async () => {
      await this.appendWorkoutLog(this.todayKey(), state.todayWorkout, "skipped");
      await this.render();
    });

    const sequence = panel.createDiv({ cls: "home-base-sequence" });
    sequence.createEl("h3", { text: "Routine Sequence" });
    sequence.createDiv({ text: plan.sequence.length ? plan.sequence.join(" > ") : "No sequence configured" });
  }

  private async loadTodos(): Promise<TodoItem[]> {
    const folders = this.plugin.settings.todoScanFolders
      .split(",")
      .map((folder) => normalizePath(folder.trim()))
      .filter(Boolean);

    const files = this.app.vault.getMarkdownFiles().filter((file) => {
      if (!folders.length) return true;
      return folders.some((folder) => file.path === folder || file.path.startsWith(`${folder}/`));
    });

    const todos: TodoItem[] = [];
    for (const file of files) {
      const content = await this.app.vault.cachedRead(file);
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        const todo = this.parseTodoLine(line, file, index);
        if (todo) todos.push(todo);
      });
    }

    return todos.sort((a, b) => this.compareTodos(a, b));
  }

  private parseTodoLine(line: string, file: TFile, index: number): TodoItem | null {
    const match = line.match(/^\s*[-*]\s+\[( |x|X)]\s+(.+)$/);
    if (!match) return null;

    const completed = match[1].toLowerCase() === "x";
    let body = match[2].trim();
    const dueMatch = body.match(/\sdue::\s*(\d{4}-\d{2}-\d{2})/);
    const priorityMatch = body.match(/\spriority::\s*(high|medium|low)/i);
    const tagMatches = body.match(/#[\w/-]+/g) ?? [];

    body = body
      .replace(/\sdue::\s*\d{4}-\d{2}-\d{2}/, "")
      .replace(/\spriority::\s*(high|medium|low)/i, "")
      .replace(/#[\w/-]+/g, "")
      .trim();

    return {
      id: `${file.path}:${index}`,
      title: body,
      due: dueMatch?.[1] ?? "",
      priority: (priorityMatch?.[1]?.toLowerCase() as Priority) ?? "",
      tags: tagMatches,
      completed,
      file,
      line: index,
      raw: line
    };
  }

  private groupTodos(todos: TodoItem[]): Record<TodoGroup, TodoItem[]> {
    const groups: Record<TodoGroup, TodoItem[]> = {
      Overdue: [],
      Today: [],
      Tomorrow: [],
      "Next 7 Days": [],
      "No Due Date": [],
      Later: []
    };

    const today = this.startOfDay(new Date());
    const tomorrow = this.addDays(today, 1);
    const nextWeek = this.addDays(today, 7);

    for (const todo of todos.filter((item) => !item.completed)) {
      if (!todo.due) {
        groups["No Due Date"].push(todo);
        continue;
      }

      const due = this.parseDate(todo.due);
      if (due < today) groups.Overdue.push(todo);
      else if (due.getTime() === today.getTime()) groups.Today.push(todo);
      else if (due.getTime() === tomorrow.getTime()) groups.Tomorrow.push(todo);
      else if (due <= nextWeek) groups["Next 7 Days"].push(todo);
      else groups.Later.push(todo);
    }

    return groups;
  }

  private async loadWorkoutPlan(): Promise<WorkoutPlan> {
    await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath, DEFAULT_WORKOUT_PLAN);
    const file = this.app.vault.getAbstractFileByPath(normalizePath(this.plugin.settings.workoutPlanPath));
    if (!(file instanceof TFile)) return { types: {}, sequence: [] };

    const content = await this.app.vault.cachedRead(file);
    const lines = content.split("\n");
    const types: Record<string, string[]> = {};
    const sequence: string[] = [];
    let section: "types" | "sequence" | "" = "";
    let currentType = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (/^#\s+Workout Types/i.test(trimmed)) {
        section = "types";
        currentType = "";
        continue;
      }
      if (/^#\s+Sequence/i.test(trimmed)) {
        section = "sequence";
        currentType = "";
        continue;
      }
      if (section === "types" && trimmed.startsWith("## ")) {
        currentType = trimmed.replace(/^##\s+/, "").trim();
        types[currentType] = [];
        continue;
      }
      if (section === "types" && currentType) {
        const item = trimmed.replace(/^[-*]\s+/, "").trim();
        if (item) types[currentType].push(item);
      }
      if (section === "sequence" && /^[-*]\s+/.test(trimmed)) {
        sequence.push(trimmed.replace(/^[-*]\s+/, "").trim());
      }
    }

    return { types, sequence };
  }

  private async loadWorkoutLog(): Promise<WorkoutLogEntry[]> {
    await this.plugin.ensureFile(this.plugin.settings.workoutLogPath, DEFAULT_WORKOUT_LOG);
    const file = this.app.vault.getAbstractFileByPath(normalizePath(this.plugin.settings.workoutLogPath));
    if (!(file instanceof TFile)) return [];

    const content = await this.app.vault.cachedRead(file);
    return content
      .split("\n")
      .map((line) => {
        const date = line.match(/date::\s*(\d{4}-\d{2}-\d{2})/)?.[1];
        const workout = line.match(/workout::\s*([^]+?)\s+status::/)?.[1]?.trim();
        const status = line.match(/status::\s*(done|skipped|pending)/)?.[1] as WorkoutLogEntry["status"] | undefined;
        if (!date || !workout || !status) return null;
        return { date, workout, status };
      })
      .filter((entry): entry is WorkoutLogEntry => Boolean(entry));
  }

  private getWorkoutState(plan: WorkoutPlan, log: WorkoutLogEntry[]) {
    const sequence = plan.sequence.length ? plan.sequence : Object.keys(plan.types);
    const doneCount = log.filter((entry) => entry.status === "done").length;
    const todayWorkout = sequence.length ? sequence[doneCount % sequence.length] : "No workout configured";
    const yesterday = this.dateKey(this.addDays(new Date(), -1));
    const yesterdayEntries = log.filter((entry) => entry.date === yesterday);
    const unresolved = yesterdayEntries.length ? null : { date: yesterday, workout: todayWorkout };

    return { todayWorkout, unresolved };
  }

  private async appendWorkoutLog(date: string, workout: string, status: WorkoutLogEntry["status"]) {
    const file = this.app.vault.getAbstractFileByPath(normalizePath(this.plugin.settings.workoutLogPath));
    if (!(file instanceof TFile)) return;

    const content = await this.app.vault.cachedRead(file);
    const line = `- date:: ${date} workout:: ${workout} status:: ${status}`;
    await this.app.vault.modify(file, `${content.trimEnd()}\n${line}\n`);
    new Notice(`Workout marked ${status}.`);
  }

  private async setTodoCompletion(todo: TodoItem, completed: boolean) {
    const content = await this.app.vault.cachedRead(todo.file);
    const lines = content.split("\n");
    lines[todo.line] = todo.raw.replace(/\[( |x|X)]/, completed ? "[x]" : "[ ]");
    await this.app.vault.modify(todo.file, lines.join("\n"));
  }

  private async deleteTodo(todo: TodoItem) {
    const confirmed = confirm(`Delete "${todo.title}"?`);
    if (!confirmed) return;

    const content = await this.app.vault.cachedRead(todo.file);
    const lines = content.split("\n");
    lines.splice(todo.line, 1);
    await this.app.vault.modify(todo.file, lines.join("\n"));
  }

  private compareTodos(a: TodoItem, b: TodoItem) {
    const aDate = a.due || "9999-12-31";
    const bDate = b.due || "9999-12-31";
    if (aDate !== bDate) return aDate.localeCompare(bDate);

    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, "": 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }

  private formatDue(date: string) {
    const today = this.todayKey();
    if (date === today) return "Today";
    if (date === this.dateKey(this.addDays(new Date(), 1))) return "Tomorrow";
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  private eventOccursOn(event: CalendarEvent, day: Date) {
    const start = this.startOfDay(event.start);
    const end = this.startOfDay(event.allDay ? this.addDays(event.end, -1) : event.end);
    return start <= day && end >= day;
  }

  private formatCalendarEventTime(event: CalendarEvent) {
    if (event.allDay) return "All day";
    const start = event.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const end = event.end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return `${start} - ${end}`;
  }

  private formatCalendarDate(date: Date) {
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  private formatRepeatLabel(repeat: RepeatFrequency) {
    const labels: Record<RepeatFrequency, string> = {
      none: "",
      daily: "Repeats daily",
      weekdays: "Repeats weekdays",
      weekly: "Repeats weekly",
      monthly: "Repeats monthly",
      yearly: "Repeats yearly"
    };
    return labels[repeat];
  }

  private getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  private parseDate(date: string) {
    return new Date(`${date}T00:00:00`);
  }

  private startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return this.startOfDay(next);
  }

  private todayKey() {
    return this.dateKey(new Date());
  }

  private dateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  private capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}

class TodoModal extends Modal {
  private plugin: HomeBasePlugin;
  private todo?: TodoItem;
  private onSave: () => void;
  private titleValue = "";
  private dueValue = "";
  private priorityValue: Priority = "medium";
  private tagsValue = "";

  constructor(app: App, plugin: HomeBasePlugin, todo: TodoItem | undefined, onSave: () => void) {
    super(app);
    this.plugin = plugin;
    this.todo = todo;
    this.onSave = onSave;

    if (todo) {
      this.titleValue = todo.title;
      this.dueValue = todo.due;
      this.priorityValue = todo.priority || "medium";
      this.tagsValue = todo.tags.join(" ");
    }
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("home-base-modal");
    contentEl.createEl("h2", { text: this.todo ? "Edit Todo" : "New Todo" });

    new Setting(contentEl)
      .setName("Title")
      .addText((text) => {
        text.setValue(this.titleValue);
        text.onChange((value) => {
          this.titleValue = value;
        });
      });

    new Setting(contentEl)
      .setName("Due date")
      .addText((text) => {
        text.inputEl.type = "date";
        text.setValue(this.dueValue);
        text.onChange((value) => {
          this.dueValue = value;
        });
      });

    new Setting(contentEl)
      .setName("Priority")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("high", "High")
          .addOption("medium", "Medium")
          .addOption("low", "Low")
          .setValue(this.priorityValue || "medium")
          .onChange((value) => {
            this.priorityValue = value as Priority;
          });
      });

    new Setting(contentEl)
      .setName("Tags")
      .setDesc("Use Markdown tags, for example #school #writing.")
      .addText((text) => {
        text.setPlaceholder("#school #writing");
        text.setValue(this.tagsValue);
        text.onChange((value) => {
          this.tagsValue = value;
        });
      });

    new Setting(contentEl)
      .addButton((button) => {
        button
          .setButtonText("Cancel")
          .onClick(() => this.close());
      })
      .addButton((button) => {
        button
          .setButtonText("Save")
          .setCta()
          .onClick(() => void this.saveTodo());
      });
  }

  private async saveTodo() {
    if (!this.titleValue.trim()) {
      new Notice("Todo title is required.");
      return;
    }

    const line = this.formatTodoLine();

    if (this.todo) {
      const content = await this.app.vault.cachedRead(this.todo.file);
      const lines = content.split("\n");
      lines[this.todo.line] = line.replace("- [ ]", this.todo.completed ? "- [x]" : "- [ ]");
      await this.app.vault.modify(this.todo.file, lines.join("\n"));
    } else {
      await this.plugin.ensureFile(this.plugin.settings.todoInboxPath, DEFAULT_TODO_INBOX);
      const file = this.app.vault.getAbstractFileByPath(normalizePath(this.plugin.settings.todoInboxPath));
      if (!(file instanceof TFile)) return;
      const content = await this.app.vault.cachedRead(file);
      await this.app.vault.modify(file, `${content.trimEnd()}\n${line}\n`);
    }

    this.close();
    this.onSave();
  }

  private formatTodoLine() {
    const tags = this.tagsValue
      .split(/\s+/)
      .filter(Boolean)
      .map((tag) => tag.startsWith("#") ? tag : `#${tag}`)
      .join(" ");
    const due = this.dueValue ? ` due:: ${this.dueValue}` : "";
    const priority = this.priorityValue ? ` priority:: ${this.priorityValue}` : "";
    const tagPart = tags ? ` ${tags}` : "";
    return `- [ ] ${this.titleValue.trim()}${due}${priority}${tagPart}`;
  }
}

class CalendarEventModal extends Modal {
  private plugin: HomeBasePlugin;
  private event?: CalendarEvent;
  private onSave: () => void;
  private titleValue = "";
  private dateValue = "";
  private startTimeValue = "09:00";
  private endTimeValue = "10:00";
  private allDayValue = false;
  private locationValue = "";
  private notesValue = "";
  private repeatValue: RepeatFrequency = "none";
  private repeatUntilValue = "";
  private durationMinutes = 60;
  private endTimeInput?: HTMLInputElement;

  constructor(app: App, plugin: HomeBasePlugin, event: CalendarEvent | undefined, onSave: () => void) {
    super(app);
    this.plugin = plugin;
    this.event = event;
    this.onSave = onSave;

    if (event) {
      this.titleValue = event.title;
      this.dateValue = this.dateInputValue(event.start);
      this.startTimeValue = this.timeInputValue(event.start);
      this.endTimeValue = this.timeInputValue(event.end);
      this.allDayValue = event.allDay;
      this.locationValue = event.location;
      this.notesValue = event.notes;
      this.repeatValue = event.repeat;
      this.repeatUntilValue = event.repeatUntil;
      this.durationMinutes = Math.max(1, Math.round((event.end.getTime() - event.start.getTime()) / 60_000));
    } else {
      const start = nextHalfHour(new Date());
      const end = addMinutes(start, this.durationMinutes);
      this.dateValue = this.dateInputValue(start);
      this.startTimeValue = this.timeInputValue(start);
      this.endTimeValue = this.timeInputValue(end);
    }
  }

  onOpen() {
    this.render();
  }

  private render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("home-base-modal");
    contentEl.createEl("h2", { text: this.event ? "Edit Event" : "New Event" });

    new Setting(contentEl)
      .setName("Title")
      .addText((text) => {
        text.setValue(this.titleValue);
        text.onChange((value) => {
          this.titleValue = value;
        });
      });

    new Setting(contentEl)
      .setName("All day")
      .addToggle((toggle) => {
        toggle.setValue(this.allDayValue);
        toggle.onChange((value) => {
          this.allDayValue = value;
          this.render();
        });
      });

    new Setting(contentEl)
      .setName("Date")
      .addText((text) => {
        text.inputEl.type = "date";
        text.setValue(this.dateValue);
        text.onChange((value) => {
          this.dateValue = value;
        });
      });

    if (!this.allDayValue) {
      new Setting(contentEl)
        .setName("Start time")
        .addText((text) => {
          text.inputEl.type = "time";
          text.setValue(this.startTimeValue);
          text.onChange((value) => {
            this.startTimeValue = value;
            this.followStartTime();
          });
        });

      new Setting(contentEl)
        .setName("End time")
        .addText((text) => {
          text.inputEl.type = "time";
          this.endTimeInput = text.inputEl;
          text.setValue(this.endTimeValue);
          text.onChange((value) => {
            this.endTimeValue = value;
            this.updateDurationFromEnd();
          });
        });
    }

    new Setting(contentEl)
      .setName("Repeat")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("none", "Never")
          .addOption("daily", "Every day")
          .addOption("weekdays", "Every weekday")
          .addOption("weekly", "Every week")
          .addOption("monthly", "Every month")
          .addOption("yearly", "Every year")
          .setValue(this.repeatValue)
          .onChange((value) => {
            this.repeatValue = value as RepeatFrequency;
            if (this.repeatValue === "none") this.repeatUntilValue = "";
            this.render();
          });
      });

    if (this.repeatValue !== "none") {
      new Setting(contentEl)
        .setName("Repeat until")
        .setDesc("Optional")
        .addText((text) => {
          text.inputEl.type = "date";
          text.setValue(this.repeatUntilValue);
          text.onChange((value) => {
            this.repeatUntilValue = value;
          });
        });
    }

    new Setting(contentEl)
      .setName("Location")
      .addText((text) => {
        text.setValue(this.locationValue);
        text.onChange((value) => {
          this.locationValue = value;
        });
      });

    new Setting(contentEl)
      .setName("Notes")
      .addTextArea((text) => {
        text.setValue(this.notesValue);
        text.onChange((value) => {
          this.notesValue = value;
        });
      });

    const footer = contentEl.createDiv({ cls: "home-base-modal-footer" });
    if (this.event) {
      const remove = footer.createEl("button", { text: "Delete" });
      remove.onClickEvent(() => void this.deleteEvent());
    }
    const cancel = footer.createEl("button", { text: "Cancel" });
    cancel.onClickEvent(() => this.close());
    const save = footer.createEl("button", { cls: "mod-cta", text: "Save Event" });
    save.onClickEvent(() => void this.saveEvent());
  }

  private async saveEvent() {
    if (!this.titleValue.trim()) {
      new Notice("Event title is required.");
      return;
    }
    if (!this.dateValue) {
      new Notice("Event date is required.");
      return;
    }
    this.ensureEndAfterStart(false);

    const draft: CalendarEventDraft = {
      uid: this.event?.uid,
      href: this.event?.href,
      etag: this.event?.etag,
      rawIcs: this.event?.rawIcs,
      title: this.titleValue,
      date: this.dateValue,
      startTime: this.startTimeValue,
      endTime: this.endTimeValue,
      allDay: this.allDayValue,
      location: this.locationValue,
      notes: this.notesValue,
      repeat: this.repeatValue,
      repeatUntil: this.repeatUntilValue
    };

    if (this.event?.repeat && this.event.repeat !== "none") {
      const onlyThis = confirm("Edit only this event? Press Cancel to edit the whole repeating series.");
      if (onlyThis) {
        await this.plugin.saveCalendarOccurrence(this.event, draft);
      } else {
        await this.plugin.saveCalendarEvent(draft);
      }
    } else {
      await this.plugin.saveCalendarEvent(draft);
    }
    this.close();
    this.onSave();
  }

  private async deleteEvent() {
    if (!this.event) return;
    const confirmed = confirm(`Delete "${this.event.title || "Untitled event"}"?`);
    if (!confirmed) return;
    const occurrenceOnly = this.event.repeat !== "none" && confirm("Delete only this event? Press Cancel to delete the whole repeating series.");
    await this.plugin.deleteCalendarEvent(this.event, occurrenceOnly);
    this.close();
    this.onSave();
  }

  private ensureEndAfterStart(silent: boolean) {
    if (this.allDayValue || !this.dateValue || !this.startTimeValue || !this.endTimeValue) return;
    const start = makeEventDate(this.dateValue, this.startTimeValue);
    const end = makeEventDate(this.dateValue, this.endTimeValue);
    if (end > start) return;
    const next = addMinutes(start, Math.max(this.durationMinutes, 60));
    this.endTimeValue = this.timeInputValue(next);
    if (this.endTimeInput) this.endTimeInput.value = this.endTimeValue;
    if (!silent) new Notice("End time was adjusted to be after the start time.");
  }

  private followStartTime() {
    if (this.allDayValue || !this.dateValue || !this.startTimeValue) return;
    const start = makeEventDate(this.dateValue, this.startTimeValue);
    const end = addMinutes(start, Math.max(this.durationMinutes, 1));
    this.endTimeValue = this.timeInputValue(end);
    if (this.endTimeInput) this.endTimeInput.value = this.endTimeValue;
  }

  private updateDurationFromEnd() {
    if (this.allDayValue || !this.dateValue || !this.startTimeValue || !this.endTimeValue) return;
    const start = makeEventDate(this.dateValue, this.startTimeValue);
    const end = makeEventDate(this.dateValue, this.endTimeValue);
    if (end <= start) {
      this.durationMinutes = 60;
      this.ensureEndAfterStart(false);
      return;
    }
    this.durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60_000));
  }

  private dateInputValue(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  private timeInputValue(date: Date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
}

class WorkoutRoutineModal extends Modal {
  private plugin: HomeBasePlugin;
  private plan: WorkoutPlan;
  private onSave: () => void;

  constructor(app: App, plugin: HomeBasePlugin, plan: WorkoutPlan, onSave: () => void) {
    super(app);
    this.plugin = plugin;
    this.plan = {
      types: Object.fromEntries(
        Object.entries(plan.types).map(([name, exercises]) => [name, [...exercises]])
      ),
      sequence: [...plan.sequence]
    };
    this.onSave = onSave;
  }

  onOpen() {
    this.render();
  }

  private render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("home-base-modal", "home-base-routine-modal");
    contentEl.createEl("h2", { text: "Edit Workout Routine" });

    const typesSection = contentEl.createDiv({ cls: "home-base-routine-section" });
    const typesHeader = typesSection.createDiv({ cls: "home-base-routine-section-header" });
    typesHeader.createEl("h3", { text: "Workout Types" });
    const addType = typesHeader.createEl("button", { text: "+ Add Type" });
    addType.onClickEvent(() => {
      const nextName = this.uniqueWorkoutName("New Workout");
      this.plan.types[nextName] = [];
      this.plan.sequence.push(nextName);
      this.render();
    });

    const typeNames = Object.keys(this.plan.types);
    if (!typeNames.length) {
      typesSection.createEl("p", {
        cls: "home-base-muted home-base-italic",
        text: "Create a workout type to start your sequence."
      });
    }

    for (const name of typeNames) {
      this.renderWorkoutType(typesSection, name);
    }

    const sequenceSection = contentEl.createDiv({ cls: "home-base-routine-section" });
    const sequenceHeader = sequenceSection.createDiv({ cls: "home-base-routine-section-header" });
    sequenceHeader.createEl("h3", { text: "Sequence Order" });
    const addSequence = sequenceHeader.createEl("button", { text: "+ Add Step" });
    addSequence.disabled = !typeNames.length;
    addSequence.onClickEvent(() => {
      const firstType = Object.keys(this.plan.types)[0];
      if (!firstType) return;
      this.plan.sequence.push(firstType);
      this.render();
    });

    if (!this.plan.sequence.length) {
      sequenceSection.createEl("p", {
        cls: "home-base-muted home-base-italic",
        text: "No sequence steps yet."
      });
    }

    this.plan.sequence.forEach((workout, index) => {
      this.renderSequenceStep(sequenceSection, workout, index);
    });

    const footer = contentEl.createDiv({ cls: "home-base-modal-footer" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    cancel.onClickEvent(() => this.close());
    const save = footer.createEl("button", { cls: "mod-cta", text: "Save Routine" });
    save.onClickEvent(() => void this.saveRoutine());
  }

  private renderWorkoutType(parent: HTMLElement, name: string) {
    const card = parent.createDiv({ cls: "home-base-routine-card" });
    const row = card.createDiv({ cls: "home-base-routine-card-row" });

    const nameInput = row.createEl("input", { cls: "home-base-routine-name" });
    nameInput.type = "text";
    nameInput.value = name;
    nameInput.placeholder = "Workout name";
    nameInput.onchange = () => {
      this.renameWorkoutType(name, nameInput.value.trim());
    };

    const remove = row.createEl("button", { text: "Delete" });
    remove.onClickEvent(() => {
      delete this.plan.types[name];
      this.plan.sequence = this.plan.sequence.filter((item) => item !== name);
      this.render();
    });

    const exercises = card.createEl("textarea", { cls: "home-base-routine-exercises" });
    exercises.placeholder = "One exercise per line";
    exercises.value = this.plan.types[name].join("\n");
    exercises.onchange = () => {
      this.plan.types[name] = exercises.value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    };
  }

  private renderSequenceStep(parent: HTMLElement, workout: string, index: number) {
    const row = parent.createDiv({ cls: "home-base-sequence-row" });
    row.createEl("span", { cls: "home-base-sequence-index", text: `${index + 1}` });

    const select = row.createEl("select");
    for (const typeName of Object.keys(this.plan.types)) {
      const option = select.createEl("option", { text: typeName, value: typeName });
      option.selected = typeName === workout;
    }
    select.onchange = () => {
      this.plan.sequence[index] = select.value;
    };

    const up = row.createEl("button", { text: "Up" });
    up.disabled = index === 0;
    up.onClickEvent(() => {
      this.moveSequenceStep(index, index - 1);
      this.render();
    });

    const down = row.createEl("button", { text: "Down" });
    down.disabled = index === this.plan.sequence.length - 1;
    down.onClickEvent(() => {
      this.moveSequenceStep(index, index + 1);
      this.render();
    });

    const remove = row.createEl("button", { text: "Remove" });
    remove.onClickEvent(() => {
      this.plan.sequence.splice(index, 1);
      this.render();
    });
  }

  private renameWorkoutType(oldName: string, newName: string) {
    if (!newName || newName === oldName) return;
    if (this.plan.types[newName]) {
      new Notice("A workout type with that name already exists.");
      this.render();
      return;
    }

    const entries = Object.entries(this.plan.types);
    this.plan.types = Object.fromEntries(
      entries.map(([name, exercises]) => name === oldName ? [newName, exercises] : [name, exercises])
    );
    this.plan.sequence = this.plan.sequence.map((item) => item === oldName ? newName : item);
    this.render();
  }

  private moveSequenceStep(from: number, to: number) {
    const [item] = this.plan.sequence.splice(from, 1);
    this.plan.sequence.splice(to, 0, item);
  }

  private uniqueWorkoutName(base: string) {
    if (!this.plan.types[base]) return base;
    let index = 2;
    while (this.plan.types[`${base} ${index}`]) index += 1;
    return `${base} ${index}`;
  }

  private async saveRoutine() {
    const typeNames = Object.keys(this.plan.types).filter(Boolean);
    if (!typeNames.length) {
      new Notice("Add at least one workout type.");
      return;
    }

    this.plan.sequence = this.plan.sequence.filter((item) => Boolean(this.plan.types[item]));
    if (!this.plan.sequence.length) {
      this.plan.sequence = [typeNames[0]];
    }

    await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath, DEFAULT_WORKOUT_PLAN);
    const file = this.app.vault.getAbstractFileByPath(normalizePath(this.plugin.settings.workoutPlanPath));
    if (!(file instanceof TFile)) return;

    await this.app.vault.modify(file, this.formatWorkoutPlan());
    new Notice("Workout routine saved.");
    this.close();
    this.onSave();
  }

  private formatWorkoutPlan() {
    const parts = ["# Workout Types", ""];
    for (const [name, exercises] of Object.entries(this.plan.types)) {
      parts.push(`## ${name}`);
      if (exercises.length) {
        parts.push(...exercises.map((exercise) => `- ${exercise}`));
      } else {
        parts.push("Rest day");
      }
      parts.push("");
    }

    parts.push("# Sequence", "");
    parts.push(...this.plan.sequence.map((item) => `- ${item}`));
    parts.push("");
    return parts.join("\n");
  }
}

class HomeBaseSettingTab extends PluginSettingTab {
  plugin: HomeBasePlugin;

  constructor(app: App, plugin: HomeBasePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Home Base Settings" });

    new Setting(containerEl)
      .setName("Open on startup")
      .setDesc("Automatically open the Home Base dashboard when Obsidian starts.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.openOnStartup)
          .onChange(async (value) => {
            this.plugin.settings.openOnStartup = value;
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl("h3", { text: "Calendar" });

    new Setting(containerEl)
      .setName("Enable calendar")
      .setDesc("Connect a writable CalDAV calendar, such as iCloud Calendar.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.calendarEnabled)
          .onChange(async (value) => {
            this.plugin.settings.calendarEnabled = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("CalDAV server URL")
      .setDesc("For iCloud, use https://caldav.icloud.com.")
      .addText((text) => {
        text
          .setPlaceholder("https://caldav.icloud.com")
          .setValue(this.plugin.settings.calendarServerUrl)
          .onChange(async (value) => {
            this.plugin.settings.calendarServerUrl = value.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Calendar username")
      .setDesc("For iCloud, use your Apple ID email.")
      .addText((text) => {
        text
          .setPlaceholder("name@example.com")
          .setValue(this.plugin.settings.calendarUsername)
          .onChange(async (value) => {
            this.plugin.settings.calendarUsername = value.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Calendar password")
      .setDesc("For iCloud, use an app-specific password.")
      .addText((text) => {
        text.inputEl.type = "password";
        text
          .setValue(this.plugin.settings.calendarPassword)
          .onChange(async (value) => {
            this.plugin.settings.calendarPassword = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Default calendar URL")
      .setDesc("Leave blank and use Test connection to auto-select an event calendar.")
      .addText((text) => {
        text
          .setPlaceholder("https://caldav.icloud.com/...")
          .setValue(this.plugin.settings.calendarUrl)
          .onChange(async (value) => {
            this.plugin.settings.calendarUrl = value.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Default calendar name")
      .setDesc("Shown in the dashboard header.")
      .addText((text) => {
        text
          .setPlaceholder("Calendar")
          .setValue(this.plugin.settings.calendarName)
          .onChange(async (value) => {
            this.plugin.settings.calendarName = value.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Test calendar connection")
      .setDesc("Discovers CalDAV event calendars and prefers a writable calendar when iCloud reports permissions.")
      .addButton((button) => {
        button.setButtonText("Test");
        button.onClick(async () => {
          try {
            const calendar = await this.plugin.testCalendarConnection();
            new Notice(`Connected to ${calendar.displayName}.`);
            this.display();
          } catch (error) {
            new Notice(error instanceof Error ? error.message : "Calendar connection failed.");
          }
        });
      });

    containerEl.createEl("h3", { text: "Todos" });

    new Setting(containerEl)
      .setName("Todo inbox file")
      .setDesc("New todos created from the dashboard are saved here.")
      .addText((text) => {
        text
          .setValue(this.plugin.settings.todoInboxPath)
          .onChange(async (value) => {
            this.plugin.settings.todoInboxPath = normalizePath(value);
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Todo scan folders")
      .setDesc("Comma-separated folders to scan for Markdown todos. Leave blank to scan the whole vault.")
      .addText((text) => {
        text
          .setValue(this.plugin.settings.todoScanFolders)
          .onChange(async (value) => {
            this.plugin.settings.todoScanFolders = value;
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl("h3", { text: "Workout" });

    new Setting(containerEl)
      .setName("Workout plan file")
      .addText((text) => {
        text
          .setValue(this.plugin.settings.workoutPlanPath)
          .onChange(async (value) => {
            this.plugin.settings.workoutPlanPath = normalizePath(value);
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Workout log file")
      .addText((text) => {
        text
          .setValue(this.plugin.settings.workoutLogPath)
          .onChange(async (value) => {
            this.plugin.settings.workoutLogPath = normalizePath(value);
            await this.plugin.saveSettings();
          });
      });
  }
}
