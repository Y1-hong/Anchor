import {
  App,
  ItemView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Platform,
  Setting,
  TFile,
  WorkspaceLeaf,
  normalizePath,
  requestUrl,
  setIcon
} from "obsidian";

declare const require: (id: string) => any;

const VIEW_TYPE_HOME_BASE = "home-base-dashboard";
const VIEW_TYPE_HOME_BASE_CALENDAR = "home-base-calendar";

type Priority = "high" | "medium" | "low" | "";
type TodoGroup = "Overdue" | "Today" | "Tomorrow" | "Next 7 Days" | "No Due Date" | "Later";
type RepeatFrequency = "none" | "daily" | "weekdays" | "weekly" | "monthly" | "yearly";
type TimePickerKind = "start" | "end";
type CalendarViewMode = "month" | "week" | "day";

interface CalendarEventModalOptions {
  initialDate?: Date;
  initialAllDay?: boolean;
  readOnly?: boolean;
}

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
  calendarSources: CalendarSource[];
  defaultCalendarId: string;
  googleAccounts: GoogleCalendarAccount[];
}

interface GoogleCalendarAccount {
  id: string;
  email: string;
  encryptedRefreshToken: string;
  tokenSalt: string;
  tokenIv: string;
}

interface GoogleCalendarListEntry {
  id: string;
  summary: string;
  summaryOverride?: string;
  backgroundColor?: string;
  accessRole: string;
  primary?: boolean;
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

type CalendarProvider = "icloud" | "google";
type CalendarLoadStatus = "loading" | "refreshing" | "ready" | "error";

interface CalendarSource {
  id: string;
  href: string;
  displayName: string;
  accountName: string;
  provider: CalendarProvider;
  color: string;
  writable: boolean;
  enabled: boolean;
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
  calendarId: string;
  accountName: string;
  provider: CalendarProvider;
  color: string;
  writable: boolean;
}

interface CalendarFetchState {
  events: CalendarEvent[];
  error: string;
  errors: string[];
  setupRequired: boolean;
  sourceCount: number;
  status: CalendarLoadStatus;
}

interface CalendarEventDraft {
  uid?: string;
  href?: string;
  etag?: string;
  rawIcs?: string;
  calendarId?: string;
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
  calendarName: "",
  calendarSources: [],
  defaultCalendarId: "",
  googleAccounts: []
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
const GOOGLE_CLIENT_ID = "624562241406-v5ush8aaff978b0uou1i7ihuj880fj63.apps.googleusercontent.com";
const GOOGLE_SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly";
const GOOGLE_SECRET_ID = "home-base-google-sync-key";
const GOOGLE_CLIENT_SECRET_ID = "home-base-google-client-secret";
const GOOGLE_OAUTH_TIMEOUT_MS = 5 * 60 * 1000;

function escapeHtmlText(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character] ?? character);
}

function googleOAuthResultPage(success: boolean, message: string) {
  const title = success ? "Google Calendar connected to Home Base." : "Google Calendar connection failed.";
  const nextStep = success
    ? "You may close this window and return to Obsidian."
    : "Return to Obsidian, correct the issue, and try connecting again.";
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtmlText(title)}</title></head>
<body style="font:16px system-ui,sans-serif;max-width:720px;margin:64px auto;padding:0 24px;line-height:1.5;color:#202124">
  <h2>${escapeHtmlText(title)}</h2>
  <p>${escapeHtmlText(message)}</p>
  <p>${escapeHtmlText(nextStep)}</p>
</body>
</html>`;
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => binary += String.fromCharCode(byte));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => binary += String.fromCharCode(byte));
  return btoa(binary);
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function deriveEncryptionKey(passphrase: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt as BufferSource, iterations: 210_000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

async function encryptSecret(value: string, passphrase: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(passphrase, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(value));
  return { encrypted: bytesToBase64(new Uint8Array(encrypted)), salt: bytesToBase64(salt), iv: bytesToBase64(iv) };
}

async function decryptSecret(value: string, passphrase: string, salt: string, iv: string) {
  const key = await deriveEncryptionKey(passphrase, base64ToBytes(salt));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(iv) }, key, base64ToBytes(value));
  return new TextDecoder().decode(decrypted);
}
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

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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

function parseCalendarEvent(rawIcs: string, href: string, etag: string, source: CalendarSource): CalendarEvent | null {
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
    calendarName: source.displayName,
    calendarId: source.id,
    accountName: source.accountName,
    provider: source.provider,
    color: source.color,
    writable: source.writable
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

.home-base-calendar-source-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--background-modifier-border);
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

.home-base-time-setting .setting-item-control {
  flex: 1;
}

.home-base-time-field {
  position: relative;
  width: min(260px, 100%);
}

.home-base-time-input-wrap {
  position: relative;
}

.home-base-time-input {
  width: 100%;
  padding-right: 36px;
  cursor: pointer;
}

.home-base-time-icon {
  position: absolute;
  top: 50%;
  right: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  pointer-events: none;
  transform: translateY(-50%);
}

.home-base-time-popover {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  z-index: 100;
  display: grid;
  grid-template-columns: 88px 1px 88px 1px 76px;
  align-items: stretch;
  width: 254px;
  padding: 14px 12px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 14px;
  background: var(--background-primary);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
}

.home-base-time-popover.is-above {
  top: auto;
  bottom: calc(100% + 12px);
}

.home-base-time-popover::before {
  position: absolute;
  top: -7px;
  left: var(--home-base-time-pointer-left, 28px);
  width: 14px;
  height: 14px;
  border-top: 1px solid var(--background-modifier-border);
  border-left: 1px solid var(--background-modifier-border);
  background: var(--background-primary);
  content: "";
  transform: rotate(45deg);
}

.home-base-time-popover.is-above::before {
  top: auto;
  bottom: -7px;
  border: 0;
  border-right: 1px solid var(--background-modifier-border);
  border-bottom: 1px solid var(--background-modifier-border);
}

.home-base-time-column,
.home-base-period-column {
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-base-time-column {
  flex-direction: column;
  gap: 7px;
  touch-action: none;
}

.home-base-time-value {
  min-width: 54px;
  color: var(--text-normal);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
}

.home-base-time-step,
.home-base-period-button {
  border: 0;
  box-shadow: none;
}

.home-base-time-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 24px;
  padding: 0;
  color: var(--text-muted);
  background: transparent;
}

.home-base-time-step:hover,
.home-base-time-step:focus-visible {
  color: var(--text-normal);
  background: var(--background-secondary);
}

.home-base-time-divider {
  width: 1px;
  min-height: 110px;
  background: var(--background-modifier-border);
}

.home-base-period-column {
  flex-direction: column;
  gap: 8px;
}

.home-base-period-button {
  min-width: 46px;
  height: 34px;
  padding: 0 10px;
  border-radius: 9px;
  color: var(--text-muted);
  background: transparent;
  font-weight: 700;
}

.home-base-period-button.is-selected {
  color: var(--text-on-accent);
  background: var(--interactive-accent);
}

.home-base-time-input:focus-visible,
.home-base-time-step:focus-visible,
.home-base-period-button:focus-visible {
  outline: 2px solid var(--interactive-accent);
  outline-offset: 2px;
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

const HOME_BASE_CALENDAR_STYLES = `
.home-base-calendar-view{min-height:100%;padding:24px;color:var(--text-normal);background:radial-gradient(circle at top right,rgba(124,97,255,.1),transparent 38rem),var(--background-primary)}
.home-base-calendar-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:18px}.home-base-calendar-heading h1{margin:0;font-size:28px}.home-base-calendar-heading-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:5px;color:var(--text-muted);font-size:13px}.home-base-calendar-heading-meta>span+span:not(.home-base-pill)::before{content:"·";margin-right:8px}
.home-base-calendar-header-controls,.home-base-calendar-navigation,.home-base-calendar-header-actions,.home-base-calendar-mode-switch{display:flex;align-items:center;gap:8px}.home-base-calendar-header-controls{flex-wrap:wrap;justify-content:flex-end}.home-base-calendar-nav-button,.home-base-calendar-header-controls button{min-width:40px;min-height:40px}.home-base-calendar-nav-button{display:inline-flex;align-items:center;justify-content:center;padding:0}.home-base-calendar-nav-button svg,.home-base-calendar-provider-title svg{width:17px;height:17px}
.home-base-calendar-mode-switch{padding:3px;border:1px solid var(--background-modifier-border);border-radius:8px;background:var(--background-secondary)}.home-base-calendar-mode-switch button{min-height:34px;padding:0 13px;background:transparent;box-shadow:none}.home-base-calendar-mode-switch button.is-selected{color:var(--text-on-accent);background:var(--interactive-accent)}
.home-base-calendar-layout{display:grid;grid-template-columns:minmax(210px,240px) minmax(0,1fr);gap:16px;align-items:start}.home-base-calendar-sidebar,.home-base-calendar-main{border:1px solid var(--background-modifier-border);border-radius:10px;background:color-mix(in srgb,var(--background-secondary) 88%,transparent)}.home-base-calendar-sidebar{position:sticky;top:12px;padding:16px}.home-base-calendar-sidebar>summary{display:none;cursor:pointer;font-weight:650}.home-base-calendar-provider+.home-base-calendar-provider{margin-top:22px}.home-base-calendar-provider-title{display:flex;align-items:center;gap:8px;margin-bottom:10px}.home-base-calendar-provider-title h2{margin:0;font-size:15px}
.home-base-calendar-source{display:grid;grid-template-columns:18px 10px minmax(0,1fr);gap:8px;align-items:center;min-height:44px;padding:6px 4px;border-radius:6px;cursor:pointer}.home-base-calendar-source:hover{background:var(--background-modifier-hover)}.home-base-calendar-source input{margin:0}.home-base-calendar-source-copy,.home-base-calendar-source-name,.home-base-calendar-source-account{display:block;min-width:0}.home-base-calendar-source-name,.home-base-calendar-source-account{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.home-base-calendar-source-name{font-weight:600}.home-base-calendar-source-account{margin-top:2px;color:var(--text-muted);font-size:11px}
.home-base-calendar-main{min-width:0;overflow:auto}.home-base-calendar-main>.home-base-calendar-error{margin:14px}.home-base-calendar-empty,.home-base-calendar-loading{padding:48px 24px;color:var(--text-muted);text-align:center}.home-base-calendar-empty h2{color:var(--text-normal)}
.home-base-month-calendar{min-width:720px}.home-base-month-weekdays,.home-base-month-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}.home-base-month-weekdays{position:sticky;top:0;z-index:4;border-bottom:1px solid var(--background-modifier-border);background:var(--background-secondary)}.home-base-month-weekdays>div{padding:10px;color:var(--text-muted);font-size:12px;font-weight:650;text-align:center;text-transform:uppercase}.home-base-month-grid{grid-auto-rows:minmax(116px,1fr)}
.home-base-month-day{position:relative;min-width:0;padding:8px;border-right:1px solid var(--background-modifier-border);border-bottom:1px solid var(--background-modifier-border);outline:none;background:var(--background-primary)}.home-base-month-day:nth-child(7n){border-right:0}.home-base-month-day.is-outside{background:color-mix(in srgb,var(--background-secondary) 72%,transparent)}.home-base-month-day.is-outside .home-base-month-day-number{color:var(--text-faint)}.home-base-month-day:focus-visible,.home-base-month-day:focus-within{z-index:2;box-shadow:inset 0 0 0 2px var(--interactive-accent)}
.home-base-month-day-number{display:inline-flex;align-items:center;justify-content:center;width:30px;min-width:30px;height:30px;min-height:30px;margin-bottom:5px;padding:0;border-radius:999px;color:var(--text-muted);background:transparent;box-shadow:none}.home-base-month-day.is-today .home-base-month-day-number{color:var(--text-on-accent);background:var(--interactive-accent);font-weight:700}.home-base-month-events{display:flex;flex-direction:column;gap:3px;min-height:66px}
.home-base-month-event,.home-base-all-day-event,.home-base-calendar-timed-event{border:0;border-left:3px solid var(--home-base-event-color);border-radius:5px;color:var(--text-normal);background:color-mix(in srgb,var(--home-base-event-color) 20%,var(--background-primary));box-shadow:none;text-align:left}.home-base-month-event{display:flex;align-items:center;gap:5px;width:100%;min-width:0;min-height:24px;padding:3px 5px;font-size:11px}.home-base-month-event-provider,.home-base-calendar-provider-tag{flex:0 0 auto;color:var(--text-muted);font-size:9px;font-weight:700;letter-spacing:.03em;text-transform:uppercase}.home-base-month-event-time{flex:0 0 auto;color:var(--text-muted)}.home-base-month-event-title{overflow:hidden;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.home-base-month-more{width:100%;min-height:24px;padding:2px 5px;color:var(--text-muted);background:transparent;box-shadow:none;font-size:11px;text-align:left}
.home-base-time-calendar{min-width:720px}.home-base-time-calendar.is-day{min-width:520px}.home-base-time-calendar-header,.home-base-all-day-row{display:grid;grid-template-columns:64px minmax(0,1fr)}.home-base-time-calendar-header,.home-base-all-day-row{border-bottom:1px solid var(--background-modifier-border)}.home-base-time-gutter{display:flex;align-items:center;justify-content:flex-end;padding:8px;color:var(--text-muted);font-size:10px;text-transform:uppercase}.home-base-time-day-headers,.home-base-all-day-columns,.home-base-time-columns{display:grid;grid-template-columns:repeat(var(--home-base-calendar-days),minmax(0,1fr))}
.home-base-time-day-header{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:58px;border-radius:0;background:transparent;box-shadow:none}.home-base-time-day-header span{color:var(--text-muted);font-size:11px;text-transform:uppercase}.home-base-time-day-header.is-today strong{color:var(--interactive-accent)}.home-base-all-day-row{min-height:54px}.home-base-all-day-column{min-width:0;padding:5px;border-left:1px solid var(--background-modifier-border)}.home-base-all-day-event{display:flex;align-items:center;gap:5px;width:100%;min-height:26px;margin-bottom:3px;padding:4px 6px;overflow:hidden;font-size:11px;text-overflow:ellipsis;white-space:nowrap}
.home-base-calendar-time-scroll{display:grid;grid-template-columns:64px minmax(0,1fr);max-height:min(68vh,720px);overflow-y:auto;overscroll-behavior:contain}.home-base-time-labels{display:grid;grid-template-rows:repeat(24,64px)}.home-base-time-labels>div{padding:0 8px;color:var(--text-muted);font-size:10px;text-align:right;transform:translateY(-6px)}.home-base-time-day-column{position:relative;display:grid;grid-template-rows:repeat(48,32px);min-width:0;border-left:1px solid var(--background-modifier-border);background:var(--background-primary)}.home-base-time-day-column.is-today{background:color-mix(in srgb,var(--interactive-accent) 4%,var(--background-primary))}
.home-base-time-slot{min-width:0;min-height:32px;padding:0;border:0;border-bottom:1px solid color-mix(in srgb,var(--background-modifier-border) 58%,transparent);border-radius:0;background:transparent;box-shadow:none}.home-base-time-slot:nth-child(2n){border-bottom-color:var(--background-modifier-border)}.home-base-time-slot:hover,.home-base-time-slot:focus-visible{background:color-mix(in srgb,var(--interactive-accent) 10%,transparent)}.home-base-calendar-timed-event{position:absolute;z-index:3;display:flex;flex-direction:column;align-items:flex-start;min-height:28px;padding:5px 6px;overflow:hidden;font-size:10px}.home-base-calendar-timed-event strong,.home-base-calendar-timed-event>span:last-child{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.home-base-current-time{position:absolute;right:0;left:0;z-index:5;height:2px;pointer-events:none;background:var(--text-error)}.home-base-current-time::before{position:absolute;top:-3px;left:-4px;width:8px;height:8px;border-radius:999px;background:var(--text-error);content:""}.home-base-event-details{margin-top:16px}.home-base-event-detail{display:grid;grid-template-columns:96px minmax(0,1fr);gap:14px;padding:10px 0;border-bottom:1px solid var(--background-modifier-border)}.home-base-event-detail>div{white-space:pre-wrap}
.home-base-calendar-view button:focus-visible,.home-base-calendar-source input:focus-visible,.home-base-calendar-sidebar>summary:focus-visible{outline:2px solid var(--interactive-accent);outline-offset:2px}
@media(prefers-reduced-motion:reduce){.home-base-calendar-view *{scroll-behavior:auto!important;transition:none!important}}
@media(max-width:900px){.home-base-calendar-view{padding:14px}.home-base-calendar-header{align-items:stretch;flex-direction:column}.home-base-calendar-header-controls{justify-content:flex-start}.home-base-calendar-layout{grid-template-columns:1fr}.home-base-calendar-sidebar{position:static}.home-base-calendar-sidebar>summary{display:list-item}.home-base-calendar-sidebar[open]>summary{margin-bottom:14px}}
`;

export default class HomeBasePlugin extends Plugin {
  settings: HomeBaseSettings;
  private styleEl?: HTMLStyleElement;
  private googleAccessTokens = new Map<string, { token: string; expiresAt: number }>();
  private calendarCaches = new Map<string, { state: CalendarFetchState; updatedAt: number }>();
  private calendarRequests = new Map<string, Promise<CalendarFetchState>>();
  private calendarRequestVersions = new Map<string, number>();

  async onload() {
    await this.loadSettings();
    this.injectStyles();

    this.registerView(
      VIEW_TYPE_HOME_BASE,
      (leaf) => new HomeBaseView(leaf, this)
    );
    this.registerView(
      VIEW_TYPE_HOME_BASE_CALENDAR,
      (leaf) => new HomeBaseCalendarView(leaf, this)
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

    this.addCommand({
      id: "open-home-base-calendar",
      name: "Open Home Base Calendar",
      callback: () => void this.openCalendar()
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
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_HOME_BASE_CALENDAR);
    this.styleEl?.remove();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private async loadSettings() {
    const stored = ((await this.loadData()) ?? {}) as Partial<HomeBaseSettings> & {
      systemCalendarSnapshot?: unknown;
      systemSnapshotUpdatedAt?: unknown;
    };
    const storedSources = Array.isArray(stored.calendarSources) ? stored.calendarSources : [];
    const calendarSources = storedSources.filter((source): source is CalendarSource => {
      return source?.provider === "icloud" || source?.provider === "google";
    });
    const removedLegacyData = calendarSources.length !== storedSources.length ||
      "systemCalendarSnapshot" in stored || "systemSnapshotUpdatedAt" in stored;
    delete stored.systemCalendarSnapshot;
    delete stored.systemSnapshotUpdatedAt;

    this.settings = Object.assign({}, DEFAULT_SETTINGS, stored, { calendarSources });
    if (!calendarSources.some((source) => source.id === this.settings.defaultCalendarId && source.writable)) {
      const preferred = calendarSources.find((source) => source.writable);
      this.settings.defaultCalendarId = preferred?.id ?? "";
      this.settings.calendarUrl = preferred?.href ?? "";
      this.settings.calendarName = preferred?.displayName ?? "";
    }
    if (removedLegacyData) await this.saveSettings();
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

  async openCalendar() {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_HOME_BASE_CALENDAR)[0];

    if (existing) {
      this.app.workspace.revealLeaf(existing);
      return;
    }

    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({
      type: VIEW_TYPE_HOME_BASE_CALENDAR,
      active: true
    });
    this.app.workspace.revealLeaf(leaf);
  }

  async refreshDashboard(forceCalendar = true) {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_HOME_BASE);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view instanceof HomeBaseView) {
        view.render(forceCalendar);
      }
    }
    const calendarLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_HOME_BASE_CALENDAR);
    for (const leaf of calendarLeaves) {
      const view = leaf.view;
      if (view instanceof HomeBaseCalendarView) void view.refresh(forceCalendar);
    }
  }

  getCachedCalendarEvents(start: Date, end: Date) {
    const key = this.calendarCacheKey(start, end);
    return this.calendarCaches.get(key)?.state;
  }

  isCalendarCacheFresh(start: Date, end: Date) {
    const key = this.calendarCacheKey(start, end);
    const cached = this.calendarCaches.get(key);
    return Boolean(cached && Date.now() - cached.updatedAt < 60_000);
  }

  invalidateCalendarCache() {
    this.calendarCaches.clear();
    for (const [key, version] of this.calendarRequestVersions) {
      this.calendarRequestVersions.set(key, version + 1);
    }
    this.calendarRequests.clear();
  }

  refreshCalendarEvents(start: Date, end: Date, force = false): Promise<CalendarFetchState> {
    const key = this.calendarCacheKey(start, end);
    const cached = this.calendarCaches.get(key)?.state;
    if (!force && cached && this.isCalendarCacheFresh(start, end)) {
      return Promise.resolve(cached);
    }
    const activeRequest = this.calendarRequests.get(key);
    if (!force && activeRequest) return activeRequest;

    const previous = cached;
    const version = (this.calendarRequestVersions.get(key) ?? 0) + 1;
    this.calendarRequestVersions.set(key, version);
    const promise: Promise<CalendarFetchState> = this.fetchCalendarEvents(start, end).then((state): CalendarFetchState | Promise<CalendarFetchState> => {
      if (version !== this.calendarRequestVersions.get(key)) {
        return this.calendarRequests.get(key) ?? this.calendarCaches.get(key)?.state ?? state;
      }
      const nextState = state.status === "error" && previous?.events.length
        ? { ...previous, error: "", errors: state.errors.length ? state.errors : [state.error], status: "error" as const }
        : state;
      this.calendarCaches.set(key, { state: nextState, updatedAt: Date.now() });
      return nextState;
    }).finally(() => {
      if (this.calendarRequests.get(key) === promise) this.calendarRequests.delete(key);
    });
    this.calendarRequests.set(key, promise);
    return promise;
  }

  async setCalendarEnabled(calendarId: string, enabled: boolean) {
    const calendar = this.settings.calendarSources.find((source) => source.id === calendarId);
    if (!calendar) return;
    calendar.enabled = enabled;
    this.invalidateCalendarCache();
    await this.saveSettings();
    await this.refreshDashboard(true);
  }

  private calendarCacheKey(start: Date, end: Date) {
    const sources = this.settings.calendarSources
      .map((source) => `${source.id}:${source.enabled}`)
      .sort()
      .join("|");
    const accounts = this.settings.googleAccounts.map((account) => account.id).sort().join("|");
    return [start.toISOString(), end.toISOString(), this.settings.calendarEnabled, this.settings.calendarServerUrl,
      this.settings.calendarUsername, sources, accounts].join("::");
  }

  async fetchCalendarEvents(start: Date, end: Date): Promise<CalendarFetchState> {
    if (!this.hasCalendarConfig()) {
      return { events: [], error: "", errors: [], setupRequired: true, sourceCount: 0, status: "ready" };
    }

    try {
      const calendars = (await this.getCalendars()).filter((calendar) => calendar.enabled);
      if (!calendars.length) {
        return { events: [], error: "No calendars are enabled.", errors: [], setupRequired: false, sourceCount: 0, status: "error" };
      }
      const results = await Promise.all(calendars.map(async (calendar) => {
        try {
          if (calendar.provider === "google") {
            return { events: await this.fetchGoogleEvents(calendar, start, end), error: "" };
          }
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
              return parseCalendarEvent(calendarData, href, etag, calendar);
            })
            .filter((event): event is CalendarEvent => Boolean(event)), start, end)
            .filter((event) => event.end >= start && event.start < end);
          return { events, error: "" };
        } catch (error) {
          return { events: [] as CalendarEvent[], error: `${calendar.displayName}: ${this.readableCalendarError(error)}` };
        }
      }));
      const errors = results.map((result) => result.error).filter(Boolean);
      const events = results.flatMap((result) => result.events)
        .filter((event, index, all) => all.findIndex((candidate) => {
          return candidate.calendarId === event.calendarId && candidate.uid === event.uid &&
            (candidate.occurrenceStart?.getTime() ?? candidate.start.getTime()) === (event.occurrenceStart?.getTime() ?? event.start.getTime());
        }) === index)
        .sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start.getTime() - b.start.getTime() || a.title.localeCompare(b.title));
      return { events, error: events.length || !errors.length ? "" : errors[0], errors, setupRequired: false,
        sourceCount: calendars.length, status: errors.length ? "error" : "ready" };
    } catch (error) {
      const message = this.readableCalendarError(error);
      return { events: [], error: message, errors: [message], setupRequired: false, sourceCount: 0, status: "error" };
    }
  }

  async saveCalendarEvent(draft: CalendarEventDraft) {
    const calendar = await this.getWritableCalendar(draft.calendarId);
    if (!calendar) {
      new Notice("Set up a default CalDAV calendar first.");
      return;
    }

    if (calendar.provider === "google") {
      await this.saveGoogleEvent(calendar, draft);
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
      this.invalidateCalendarCache();
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
      if (event.provider === "google") {
        const source = this.settings.calendarSources.find((calendar) => calendar.id === event.calendarId);
        if (!source) throw new Error("Google calendar source is missing.");
        const token = await this.getGoogleAccessToken(source.accountName);
        await this.googleRequest(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(source.href)}/events/${encodeURIComponent(event.href)}`, "DELETE", token);
        this.invalidateCalendarCache();
        new Notice("Calendar event deleted.");
        return;
      }
      if (occurrenceOnly && event.repeat !== "none") {
        await this.excludeCalendarOccurrence(event);
        new Notice("Calendar occurrence deleted.");
        return;
      }
      await this.caldavRequest(event.href, "DELETE", "", event.etag ? { "If-Match": event.etag } : {});
      this.invalidateCalendarCache();
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

    const calendars = await this.getCalendars(true, true);
    if (!calendars.length) throw new Error("No event calendar was found for this CalDAV account.");
    return calendars;
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
      (this.hasCalendarCredentials() || this.settings.googleAccounts.length)
    );
  }

  async getCalendars(forceDiscovery = false, allowDisabled = false): Promise<CalendarSource[]> {
    if (!this.hasCalendarCredentials()) {
      return this.settings.calendarSources.filter((source) => source.provider === "google");
    }
    if (!allowDisabled && !this.hasCalendarConfig()) return [];
    if (this.settings.calendarSources.length && !forceDiscovery && (!this.hasCalendarCredentials() || this.settings.calendarSources.some((source) => source.provider === "icloud"))) {
      return this.settings.calendarSources;
    }
    const previous = new Map(this.settings.calendarSources.map((calendar) => [calendar.id, calendar]));
    const calendars = [
      ...(await this.discoverCalendars()).map((calendar) => ({
      ...calendar,
      enabled: previous.get(calendar.id)?.enabled ?? true
      })),
      ...this.settings.calendarSources.filter((calendar) => calendar.provider === "google")
    ];
    const preferred = calendars.find((calendar) => calendar.id === this.settings.defaultCalendarId && calendar.writable) ??
      calendars.find((calendar) => calendar.writable);
    this.settings.calendarSources = calendars;
    this.settings.defaultCalendarId = preferred?.id ?? "";
    this.settings.calendarUrl = preferred?.href ?? "";
    this.settings.calendarName = preferred?.displayName ?? "";
    await this.saveSettings();
    return calendars;
  }

  private async getWritableCalendar(calendarId?: string) {
    const calendars = await this.getCalendars();
    return calendars.find((calendar) => calendar.writable && calendar.id === (calendarId || this.settings.defaultCalendarId)) ??
      calendars.find((calendar) => calendar.writable) ?? null;
  }

  async connectGoogleAccount() {
    if (!Platform.isDesktopApp) throw new Error("Connect Google accounts from Obsidian desktop first.");
    const clientSecret = await this.getGoogleClientSecret();
    const passphrase = this.app.secretStorage.getSecret(GOOGLE_SECRET_ID) || await requestGooglePassphrase(
      this.app,
      "Create Google sync passphrase",
      "This passphrase encrypts your Google Calendar token in the synced plugin settings."
    );
    if (!passphrase) throw new Error("A sync passphrase is required.");
    this.app.secretStorage.setSecret(GOOGLE_SECRET_ID, passphrase);

    const verifier = base64Url(crypto.getRandomValues(new Uint8Array(48)));
    const challenge = base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
    const state = base64Url(crypto.getRandomValues(new Uint8Array(24)));
    const http = require("http");
    const shell = require("electron").shell;
    return new Promise<GoogleCalendarAccount>((resolve, reject) => {
      let redirectUri = "";
      let callbackStarted = false;
      let finished = false;
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const server = http.createServer((request: any, response: any) => {
        void (async () => {
          if (!redirectUri) {
            response.statusCode = 503;
            response.end();
            return;
          }

          const callback = new URL(request.url || "/", redirectUri);
          if (callback.pathname !== "/") {
            response.statusCode = callback.pathname === "/favicon.ico" ? 204 : 404;
            response.end();
            return;
          }
          if (callbackStarted || finished) {
            response.statusCode = 204;
            response.end();
            return;
          }
          callbackStarted = true;

          try {
            if (callback.searchParams.get("state") !== state) {
              throw new Error("Google authorization state mismatch. Start the connection again from Obsidian.");
            }
            const authorizationError = callback.searchParams.get("error");
            if (authorizationError) {
              throw new Error(authorizationError === "access_denied" ? "Google authorization was cancelled." : `Google authorization failed: ${authorizationError}.`);
            }
            const code = callback.searchParams.get("code");
            if (!code) throw new Error("Google did not return an authorization code. Start the connection again.");

            const account = await this.completeGoogleAuthorization(code, redirectUri, verifier, passphrase, clientSecret);
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(googleOAuthResultPage(true, `${account.email} and its calendars are now available in Home Base.`));
            finish(undefined, account);
          } catch (error) {
            const connectionError = error instanceof Error ? error : new Error("Google Calendar connection failed.");
            response.statusCode = 400;
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(googleOAuthResultPage(false, connectionError.message));
            finish(connectionError);
          }
        })();
      });

      const finish = (error?: Error, account?: GoogleCalendarAccount) => {
        if (finished) return;
        finished = true;
        if (timeout) clearTimeout(timeout);
        if (server.listening) server.close();
        if (error) reject(error);
        else if (account) resolve(account);
      };

      server.on("error", (error: Error) => finish(error));
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        if (!address || typeof address === "string") {
          finish(new Error("Home Base could not start the local Google authorization callback."));
          return;
        }
        redirectUri = `http://127.0.0.1:${address.port}`;
        const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        url.search = new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, redirect_uri: redirectUri, response_type: "code", scope: GOOGLE_SCOPES, access_type: "offline", prompt: "consent", code_challenge: challenge, code_challenge_method: "S256", state }).toString();
        timeout = setTimeout(() => finish(new Error("Google authorization timed out. Start the connection again from Obsidian.")), GOOGLE_OAUTH_TIMEOUT_MS);
        void shell.openExternal(url.toString()).catch((error: Error) => finish(error));
      });
    });
  }

  private async completeGoogleAuthorization(code: string, redirectUri: string, verifier: string, passphrase: string, clientSecret: string) {
    const tokenResponse = await requestUrl({
      url: "https://oauth2.googleapis.com/token",
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, client_secret: clientSecret, code, code_verifier: verifier, redirect_uri: redirectUri, grant_type: "authorization_code" }).toString(),
      throw: false
    });
    if (tokenResponse.status >= 400) throw new Error(this.googleResponseError(tokenResponse, "Google token exchange failed."));
    const tokenData = tokenResponse.json as { access_token: string; refresh_token?: string; expires_in: number };
    if (!tokenData.refresh_token) throw new Error("Google did not return a refresh token. Revoke Home Base access in your Google Account, then reconnect.");
    const calendarList = await this.fetchGoogleCalendarList(tokenData.access_token);
    const primary = calendarList.find((calendar) => calendar.primary) ?? calendarList[0];
    if (!primary) throw new Error("No Google calendars were found.");
    const encrypted = await encryptSecret(tokenData.refresh_token, passphrase);
    const account: GoogleCalendarAccount = { id: primary.id, email: primary.id, encryptedRefreshToken: encrypted.encrypted, tokenSalt: encrypted.salt, tokenIv: encrypted.iv };
    this.settings.googleAccounts = [...this.settings.googleAccounts.filter((item) => item.id !== account.id), account];
    this.googleAccessTokens.set(account.id, { token: tokenData.access_token, expiresAt: Date.now() + tokenData.expires_in * 1000 - 60_000 });
    await this.refreshGoogleCalendars(account, calendarList);
    await this.saveSettings();
    this.invalidateCalendarCache();
    return account;
  }

  async disconnectGoogleAccount(accountId: string) {
    this.settings.googleAccounts = this.settings.googleAccounts.filter((account) => account.id !== accountId);
    this.settings.calendarSources = this.settings.calendarSources.filter((source) => !(source.provider === "google" && source.accountName === accountId));
    this.googleAccessTokens.delete(accountId);
    await this.saveSettings();
    this.invalidateCalendarCache();
  }

  private async refreshGoogleCalendars(account: GoogleCalendarAccount, supplied?: GoogleCalendarListEntry[]) {
    const list = supplied ?? await this.fetchGoogleCalendarList(await this.getGoogleAccessToken(account.id));
    const previous = new Map(this.settings.calendarSources.map((source) => [source.id, source]));
    this.settings.calendarSources = [
      ...this.settings.calendarSources.filter((source) => source.provider !== "google" || source.accountName !== account.id),
      ...list.map((calendar) => {
        const id = `google:${account.id}:${calendar.id}`;
        return { id, href: calendar.id, displayName: calendar.summaryOverride || calendar.summary, accountName: account.id, provider: "google" as const, color: calendar.backgroundColor || "#4285f4", writable: calendar.accessRole === "owner" || calendar.accessRole === "writer", enabled: previous.get(id)?.enabled ?? true };
      })
    ];
  }

  private async getGoogleAccessToken(accountId: string) {
    const cached = this.googleAccessTokens.get(accountId);
    if (cached && cached.expiresAt > Date.now()) return cached.token;
    const account = this.settings.googleAccounts.find((item) => item.id === accountId);
    if (!account) throw new Error("Google account is disconnected.");
    const passphrase = this.app.secretStorage.getSecret(GOOGLE_SECRET_ID) || await requestGooglePassphrase(
      this.app,
      "Enter Google sync passphrase",
      "Enter the passphrase used to encrypt this Google Calendar account."
    );
    if (!passphrase) throw new Error("Google sync passphrase is required.");
    this.app.secretStorage.setSecret(GOOGLE_SECRET_ID, passphrase);
    let refreshToken: string;
    try {
      refreshToken = await decryptSecret(account.encryptedRefreshToken, passphrase, account.tokenSalt, account.tokenIv);
    } catch {
      throw new Error("The Google sync passphrase is incorrect.");
    }
    const clientSecret = await this.getGoogleClientSecret();
    const response = await requestUrl({ url: "https://oauth2.googleapis.com/token", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }).toString(), throw: false });
    if (response.status >= 400) throw new Error("Google authorization expired. Reconnect this account.");
    const data = response.json as { access_token: string; expires_in: number };
    this.googleAccessTokens.set(accountId, { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 - 60_000 });
    return data.access_token;
  }

  private async getGoogleClientSecret() {
    const stored = this.app.secretStorage.getSecret(GOOGLE_CLIENT_SECRET_ID);
    if (stored) return stored;
    const clientSecret = await requestGooglePassphrase(
      this.app,
      "Google OAuth client secret",
      "Paste the client secret for the Anchor Desktop OAuth client. It is stored only in Obsidian SecretStorage and is never written to plugin settings.",
      "Client secret",
      "Paste Google OAuth client secret",
      "Google OAuth client secret is required."
    );
    if (!clientSecret) throw new Error("Google OAuth client secret is required.");
    this.app.secretStorage.setSecret(GOOGLE_CLIENT_SECRET_ID, clientSecret);
    return clientSecret;
  }

  async replaceGoogleClientSecret() {
    const clientSecret = await requestGooglePassphrase(
      this.app,
      "Replace Google OAuth client secret",
      "Paste the active client secret for the Anchor Desktop OAuth client. The previous locally stored value will be replaced.",
      "Client secret",
      "Paste Google OAuth client secret",
      "Google OAuth client secret is required."
    );
    if (!clientSecret) return false;
    this.app.secretStorage.setSecret(GOOGLE_CLIENT_SECRET_ID, clientSecret);
    this.googleAccessTokens.clear();
    return true;
  }

  private async fetchGoogleCalendarList(token: string): Promise<GoogleCalendarListEntry[]> {
    const data = await this.googleRequest("https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=250", "GET", token) as { items?: GoogleCalendarListEntry[] };
    return data.items ?? [];
  }

  private async fetchGoogleEvents(source: CalendarSource, start: Date, end: Date) {
    const token = await this.getGoogleAccessToken(source.accountName);
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(source.href)}/events`);
    url.search = new URLSearchParams({ timeMin: start.toISOString(), timeMax: end.toISOString(), singleEvents: "true", orderBy: "startTime", maxResults: "2500" }).toString();
    const data = await this.googleRequest(url.toString(), "GET", token) as { items?: Array<Record<string, any>> };
    return (data.items ?? []).filter((item) => item.status !== "cancelled").map((item) => {
      const startValue = item.start?.dateTime || item.start?.date;
      const endValue = item.end?.dateTime || item.end?.date;
      const allDay = Boolean(item.start?.date);
      return {
        uid: item.iCalUID || item.id,
        href: item.id,
        etag: item.etag || "",
        title: item.summary || "",
        start: allDay ? parseLocalDate(startValue) : new Date(startValue),
        end: allDay ? parseLocalDate(endValue) : new Date(endValue),
        allDay,
        location: item.location || "",
        notes: item.description || "",
        repeat: "none" as RepeatFrequency,
        repeatUntil: "",
        exceptionDates: [],
        rawIcs: JSON.stringify(item),
        calendarName: source.displayName,
        calendarId: source.id,
        accountName: source.accountName,
        provider: "google" as const,
        color: source.color,
        writable: source.writable
      };
    });
  }

  private async saveGoogleEvent(source: CalendarSource, draft: CalendarEventDraft) {
    const token = await this.getGoogleAccessToken(source.accountName);
    const dates = calendarDraftToDates(draft);
    const payload: Record<string, any> = {
      summary: draft.title,
      location: draft.location || undefined,
      description: draft.notes || undefined,
      start: draft.allDay ? { date: draft.date } : { dateTime: dates.start.toISOString() },
      end: draft.allDay ? { date: formatLocalDate(dates.end) } : { dateTime: dates.end.toISOString() }
    };
    const recurrence = formatRepeatRule(draft);
    if (recurrence) payload.recurrence = [`RRULE:${recurrence}`];
    const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(source.href)}/events`;
    await this.googleRequest(draft.href ? `${base}/${encodeURIComponent(draft.href)}` : base, draft.href ? "PUT" : "POST", token, payload);
    this.settings.defaultCalendarId = source.id;
    await this.saveSettings();
    this.invalidateCalendarCache();
    new Notice("Calendar event saved.");
  }

  private async googleRequest(url: string, method: string, token: string, body?: unknown) {
    const response = await requestUrl({
      url,
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      throw: false
    });
    if (response.status === 401) throw new Error(this.googleResponseError(response, "Google authorization expired. Reconnect this account."));
    if (response.status === 403) throw new Error(this.googleResponseError(response, "Google Calendar permission was denied."));
    if (response.status === 429) throw new Error("Google Calendar rate limit reached. Try again later.");
    if (response.status >= 400) throw new Error(this.googleResponseError(response, `Google Calendar request failed with status ${response.status}.`));
    return response.status === 204 || !response.text ? {} : response.json;
  }

  private googleResponseError(response: { status: number; json?: unknown }, fallback: string) {
    const payload = response.json as { error_description?: string; error?: string | { message?: string } } | undefined;
    const detail = payload?.error_description || (typeof payload?.error === "string" ? payload.error : payload?.error?.message);
    return detail && !fallback.includes(detail) ? `${fallback} ${detail}` : fallback;
  }

  private async discoverCalendars(): Promise<CalendarSource[]> {
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
<d:propfind xmlns:d="${DAV_NS}" xmlns:c="${CALDAV_NS}" xmlns:a="http://apple.com/ns/ical/">
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
<d:propfind xmlns:d="${DAV_NS}" xmlns:c="${CALDAV_NS}" xmlns:a="http://apple.com/ns/ical/">
  <d:prop>
    <d:displayname />
    <d:resourcetype />
    <d:current-user-privilege-set />
    <c:supported-calendar-component-set />
    <a:calendar-color />
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
        const absoluteHref = resolveRemoteUrl(homeUrl, href);
        return {
          id: `icloud:${absoluteHref}`,
          href: absoluteHref,
          displayName: firstTextByLocalName(element, "displayname") || "Calendar",
          accountName: this.settings.calendarUsername,
          provider: "icloud" as const,
          color: firstTextByLocalName(element, "calendar-color").slice(0, 7) || "#8b5cf6",
          writable,
          enabled: true
        };
      })
      .filter((calendar) => calendar !== null);
  }

  private async caldavRequest(url: string, method: string, body = "", headers: Record<string, string> = {}) {
    const response = await requestUrl({
      url,
      method,
      body,
      throw: false,
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
      if (response.status === 400) {
        throw new Error("iCloud rejected the CalDAV request as malformed. Check the server URL and try again.");
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
    this.styleEl.textContent = HOME_BASE_STYLES + HOME_BASE_CALENDAR_STYLES;
    document.head.appendChild(this.styleEl);
  }
}

class HomeBaseView extends ItemView {
  private plugin: HomeBasePlugin;
  private renderGeneration = 0;
  private calendarHost?: HTMLElement;

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
    this.render();
  }

  async onClose() {
    this.renderGeneration += 1;
    this.calendarHost = undefined;
  }

  render(forceCalendar = false) {
    const generation = ++this.renderGeneration;
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("home-base-view");

    this.renderHeader(root);

    const grid = root.createDiv({ cls: "home-base-grid" });
    const left = grid.createDiv({ cls: "home-base-column home-base-left" });
    const right = grid.createDiv({ cls: "home-base-column home-base-right" });
    this.calendarHost = left.createDiv();
    const workoutHost = left.createDiv();
    const todoHost = right.createDiv();

    this.renderLoadingPanel(workoutHost, "Fit", "Workout", "Loading workout...");
    this.renderLoadingPanel(todoHost, "Task", "Todo Manager", "Loading todos...");

    void this.refreshCalendar(forceCalendar);
    void this.loadTodos().then((todos) => {
      if (generation !== this.renderGeneration || !todoHost.isConnected) return;
      todoHost.empty();
      this.renderTodos(todoHost, todos);
    }).catch((error) => {
      if (generation !== this.renderGeneration || !todoHost.isConnected) return;
      this.renderPanelError(todoHost, "Task", "Todo Manager", "Todos could not load", error);
    });

    void Promise.all([this.loadWorkoutPlan(), this.loadWorkoutLog()]).then(([plan, log]) => {
      if (generation !== this.renderGeneration || !workoutHost.isConnected) return;
      workoutHost.empty();
      this.renderWorkout(workoutHost, plan, this.getWorkoutState(plan, log));
    }).catch((error) => {
      if (generation !== this.renderGeneration || !workoutHost.isConnected) return;
      this.renderPanelError(workoutHost, "Fit", "Workout", "Workout could not load", error);
    });
  }

  private async refreshCalendar(force: boolean) {
    const generation = this.renderGeneration;
    const host = this.calendarHost;
    if (!host) return;
    const start = this.startOfDay(new Date());
    const end = this.addDays(start, 8);
    const cached = this.plugin.getCachedCalendarEvents(start, end);
    const status: CalendarLoadStatus = cached
      ? (force || !this.plugin.isCalendarCacheFresh(start, end) ? "refreshing" : cached.status)
      : "loading";
    host.empty();
    this.renderCalendar(host, cached ? { ...cached, status } : {
      events: [], error: "", errors: [], setupRequired: false, sourceCount: 0, status
    });

    try {
      const state = await this.plugin.refreshCalendarEvents(start, end, force);
      if (generation !== this.renderGeneration || !host.isConnected) return;
      host.empty();
      this.renderCalendar(host, state);
    } catch (error) {
      if (generation !== this.renderGeneration || !host.isConnected) return;
      const message = error instanceof Error ? error.message : "Calendar could not sync.";
      host.empty();
      this.renderCalendar(host, cached ? { ...cached, error: "", errors: [message], status: "error" } : {
        events: [], error: message, errors: [message], setupRequired: false, sourceCount: 0, status: "error"
      });
    }
  }

  private renderLoadingPanel(parent: HTMLElement, icon: string, heading: string, message: string) {
    const panel = parent.createDiv({ cls: "home-base-panel" });
    const title = panel.createDiv({ cls: "home-base-panel-title" });
    title.createEl("span", { cls: "home-base-icon", text: icon });
    title.createEl("h2", { text: heading });
    panel.createEl("p", { cls: "home-base-muted home-base-italic", text: message });
  }

  private renderPanelError(parent: HTMLElement, icon: string, heading: string, message: string, error: unknown) {
    parent.empty();
    const panel = parent.createDiv({ cls: "home-base-panel" });
    const title = panel.createDiv({ cls: "home-base-panel-title" });
    title.createEl("span", { cls: "home-base-icon", text: icon });
    title.createEl("h2", { text: heading });
    const errorEl = panel.createDiv({ cls: "home-base-calendar-error" });
    errorEl.createEl("strong", { text: message });
    errorEl.createEl("p", { text: error instanceof Error ? error.message : "Try refreshing Home Base." });
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
    refresh.onClickEvent(() => this.render(true));
  }

  private renderCalendar(parent: HTMLElement, state: CalendarFetchState) {
    const panel = parent.createDiv({ cls: "home-base-panel home-base-calendar-panel" });
    const title = panel.createDiv({ cls: "home-base-panel-title" });
    title.createEl("span", { cls: "home-base-icon", text: "Cal" });
    title.createEl("h2", { text: "Calendar" });
    if (state.sourceCount) {
      title.createEl("span", { cls: "home-base-pill", text: `${state.sourceCount} calendar${state.sourceCount === 1 ? "" : "s"}` });
    }
    if (state.status === "loading" || state.status === "refreshing") {
      title.createEl("span", { cls: "home-base-pill", text: state.status === "loading" ? "Loading" : "Refreshing" });
    }

    const controls = panel.createDiv({ cls: "home-base-calendar-controls" });
    const add = controls.createEl("button", { cls: "mod-cta home-base-primary-button", text: "+ Event" });
    add.disabled = state.status === "loading" || state.setupRequired || Boolean(state.error);
    add.onClickEvent(() => {
      new CalendarEventModal(this.app, this.plugin, undefined, () => this.render(true)).open();
    });

    const refresh = controls.createEl("button", { cls: "home-base-secondary-button", text: "Refresh" });
    refresh.disabled = state.status === "loading" || state.status === "refreshing";
    refresh.onClickEvent(() => void this.refreshCalendar(true));

    const openCalendar = controls.createEl("button", { cls: "home-base-secondary-button", text: "Open Calendar" });
    openCalendar.onClickEvent(() => void this.plugin.openCalendar());

    if (state.status === "loading") {
      panel.createEl("p", { cls: "home-base-muted home-base-italic", text: "Loading iCloud and Google calendars..." });
      return;
    }

    if (state.setupRequired) {
      const setup = panel.createDiv({ cls: "home-base-schedule-empty" });
      setup.createDiv({ cls: "home-base-calendar-mark", text: "Cal" });
      const copy = setup.createDiv();
      copy.createEl("strong", { text: "Connect a calendar" });
      copy.createEl("p", {
        text: "Enable Calendar in Home Base settings, then connect iCloud/CalDAV or Google Calendar."
      });
      return;
    }

    if (state.error && !state.events.length) {
      const error = panel.createDiv({ cls: "home-base-calendar-error" });
      error.createEl("strong", { text: "Calendar could not sync" });
      error.createEl("p", { text: state.error });
      return;
    }

    if (state.errors.length) {
      const warning = panel.createDiv({ cls: "home-base-calendar-error" });
      warning.createEl("strong", { text: "Some calendars could not sync" });
      warning.createEl("p", { text: state.errors.join(" · ") });
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
    const eventTitle = body.createDiv({ cls: "home-base-calendar-title" });
    const color = eventTitle.createSpan({ cls: "home-base-calendar-source-dot" });
    color.style.backgroundColor = event.color;
    eventTitle.createSpan({ text: event.title || "Untitled event" });
    const meta = body.createDiv({ cls: "home-base-calendar-meta" });
    meta.createEl("span", { text: event.calendarName });
    if (!this.eventOccursOn(event, this.startOfDay(new Date()))) {
      meta.createEl("span", { text: this.formatCalendarDate(event.start) });
    }
    if (event.location) {
      meta.createEl("span", { text: event.location });
    }
    if (event.repeat !== "none") {
      meta.createEl("span", { text: this.formatRepeatLabel(event.repeat) });
    }

    if (!event.writable) return;
    const actions = item.createDiv({ cls: "home-base-actions" });
    const edit = actions.createEl("button", { cls: "home-base-ghost-button", text: "Edit" });
    edit.onClickEvent(() => new CalendarEventModal(this.app, this.plugin, event, () => this.render(true)).open());
    const remove = actions.createEl("button", { cls: "home-base-ghost-button", text: "Delete" });
    remove.onClickEvent(async () => {
      const confirmed = confirm(`Delete "${event.title || "Untitled event"}"?`);
      if (!confirmed) return;
      const occurrenceOnly = event.repeat !== "none" && confirm("Delete only this event? Press Cancel to delete the whole repeating series.");
      await this.plugin.deleteCalendarEvent(event, occurrenceOnly);
      this.render(true);
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

class HomeBaseCalendarView extends ItemView {
  private plugin: HomeBasePlugin;
  private mode: CalendarViewMode = "month";
  private selectedDate = this.startOfDay(new Date());
  private renderGeneration = 0;

  constructor(leaf: WorkspaceLeaf, plugin: HomeBasePlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE_HOME_BASE_CALENDAR;
  }

  getDisplayText() {
    return "Home Base Calendar";
  }

  getIcon() {
    return "calendar-days";
  }

  async onOpen() {
    await this.refresh(false);
  }

  async onClose() {
    this.renderGeneration += 1;
  }

  async refresh(force = false) {
    const generation = ++this.renderGeneration;
    const { start, end } = this.visibleRange();
    const cached = this.plugin.getCachedCalendarEvents(start, end);
    const status: CalendarLoadStatus = cached
      ? (force || !this.plugin.isCalendarCacheFresh(start, end) ? "refreshing" : cached.status)
      : "loading";
    this.render(cached ? { ...cached, status } : {
      events: [], error: "", errors: [], setupRequired: false, sourceCount: 0, status
    });

    try {
      const state = await this.plugin.refreshCalendarEvents(start, end, force);
      if (generation !== this.renderGeneration) return;
      this.render(state);
    } catch (error) {
      if (generation !== this.renderGeneration) return;
      const message = error instanceof Error ? error.message : "Calendar could not sync.";
      this.render(cached ? { ...cached, error: "", errors: [message], status: "error" } : {
        events: [], error: message, errors: [message], setupRequired: false, sourceCount: 0, status: "error"
      });
    }
  }

  private render(state: CalendarFetchState) {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("home-base-calendar-view");
    this.renderHeader(root, state);

    const layout = root.createDiv({ cls: "home-base-calendar-layout" });
    this.renderSidebar(layout);
    const main = layout.createDiv({ cls: "home-base-calendar-main" });

    if (state.setupRequired) {
      const empty = main.createDiv({ cls: "home-base-calendar-empty" });
      empty.createEl("h2", { text: "Connect a calendar" });
      empty.createEl("p", { text: "Enable Calendar in Home Base settings, then connect iCloud/CalDAV or Google Calendar." });
      return;
    }

    if (state.error && !state.events.length) {
      const error = main.createDiv({ cls: "home-base-calendar-error" });
      error.createEl("strong", { text: "Calendar could not sync" });
      error.createEl("p", { text: state.error });
      return;
    }

    if (state.errors.length) {
      const warning = main.createDiv({ cls: "home-base-calendar-error" });
      warning.createEl("strong", { text: "Some calendars could not sync" });
      warning.createEl("p", { text: state.errors.join(" · ") });
    }

    if (state.status === "loading" && !state.events.length) {
      main.createDiv({ cls: "home-base-calendar-loading", text: "Loading iCloud and Google calendars…" });
    }

    if (this.mode === "month") this.renderMonth(main, state.events);
    else this.renderTimeView(main, state.events);
  }

  private renderHeader(root: HTMLElement, state: CalendarFetchState) {
    const header = root.createDiv({ cls: "home-base-calendar-header" });
    const titleGroup = header.createDiv({ cls: "home-base-calendar-heading" });
    titleGroup.createEl("h1", { text: this.rangeTitle() });
    const meta = titleGroup.createDiv({ cls: "home-base-calendar-heading-meta" });
    meta.createSpan({ text: "Home Base Calendar" });
    if (state.sourceCount) meta.createSpan({ text: `${state.sourceCount} visible` });
    if (state.status === "loading" || state.status === "refreshing") {
      meta.createSpan({ cls: "home-base-pill", text: state.status === "loading" ? "Loading" : "Refreshing" });
    }

    const controls = header.createDiv({ cls: "home-base-calendar-header-controls" });
    const navigation = controls.createDiv({ cls: "home-base-calendar-navigation" });
    this.iconButton(navigation, "chevron-left", "Previous period", () => this.navigate(-1));
    const today = navigation.createEl("button", { cls: "home-base-secondary-button", text: "Today" });
    today.onClickEvent(() => {
      this.selectedDate = this.startOfDay(new Date());
      void this.refresh(false);
    });
    this.iconButton(navigation, "chevron-right", "Next period", () => this.navigate(1));

    const modes = controls.createDiv({ cls: "home-base-calendar-mode-switch", attr: { role: "group", "aria-label": "Calendar view" } });
    for (const mode of ["month", "week", "day"] as CalendarViewMode[]) {
      const button = modes.createEl("button", {
        text: mode.charAt(0).toUpperCase() + mode.slice(1),
        cls: mode === this.mode ? "is-selected" : "",
        attr: { "aria-pressed": mode === this.mode ? "true" : "false" }
      });
      button.onClickEvent(() => {
        if (this.mode === mode) return;
        this.mode = mode;
        void this.refresh(false);
      });
    }

    const actions = controls.createDiv({ cls: "home-base-calendar-header-actions" });
    const refresh = actions.createEl("button", { cls: "home-base-secondary-button", text: "Refresh" });
    refresh.disabled = state.status === "loading" || state.status === "refreshing";
    refresh.onClickEvent(() => void this.refresh(true));
    const add = actions.createEl("button", { cls: "mod-cta home-base-primary-button", text: "+ Event" });
    add.disabled = !this.plugin.settings.calendarSources.some((source) => source.writable);
    add.onClickEvent(() => this.openNewEvent(this.defaultNewEventDate(), false));
  }

  private renderSidebar(parent: HTMLElement) {
    const sidebar = parent.createEl("details", { cls: "home-base-calendar-sidebar" });
    sidebar.open = true;
    sidebar.createEl("summary", { text: "Calendars" });
    const content = sidebar.createDiv({ cls: "home-base-calendar-sidebar-content" });
    const providers: Array<{ provider: CalendarProvider; label: string }> = [
      { provider: "icloud", label: "iCloud" },
      { provider: "google", label: "Google" }
    ];

    for (const { provider, label } of providers) {
      const calendars = this.plugin.settings.calendarSources.filter((source) => source.provider === provider);
      if (!calendars.length) continue;
      const group = content.createDiv({ cls: "home-base-calendar-provider" });
      const heading = group.createDiv({ cls: "home-base-calendar-provider-title" });
      const providerIcon = heading.createSpan();
      setIcon(providerIcon, provider === "icloud" ? "cloud" : "calendar-days");
      heading.createEl("h2", { text: label });
      for (const calendar of calendars) {
        const row = group.createEl("label", { cls: "home-base-calendar-source" });
        const checkbox = row.createEl("input", {
          attr: { type: "checkbox", "aria-label": `Show ${calendar.displayName} from ${label}` }
        });
        checkbox.checked = calendar.enabled;
        const dot = row.createSpan({ cls: "home-base-calendar-source-dot" });
        dot.style.backgroundColor = calendar.color;
        const copy = row.createSpan({ cls: "home-base-calendar-source-copy" });
        copy.createSpan({ cls: "home-base-calendar-source-name", text: calendar.displayName });
        copy.createSpan({ cls: "home-base-calendar-source-account", text: `${calendar.accountName || label} · ${calendar.writable ? "Writable" : "Read only"}` });
        checkbox.addEventListener("change", () => void this.plugin.setCalendarEnabled(calendar.id, checkbox.checked));
      }
    }

    if (!this.plugin.settings.calendarSources.length) {
      content.createEl("p", { cls: "home-base-muted", text: "No calendars discovered yet." });
    }
  }

  private renderMonth(parent: HTMLElement, events: CalendarEvent[]) {
    const month = parent.createDiv({ cls: "home-base-month-calendar" });
    const weekdays = month.createDiv({ cls: "home-base-month-weekdays" });
    for (const label of ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
      weekdays.createDiv({ text: label });
    }
    const grid = month.createDiv({ cls: "home-base-month-grid", attr: { role: "grid", "aria-label": this.rangeTitle() } });
    const { start, end } = this.visibleRange();
    for (let date = new Date(start); date < end; date = this.addDays(date, 1)) {
      const day = new Date(date);
      const isCurrentMonth = day.getMonth() === this.selectedDate.getMonth();
      const isToday = this.sameDay(day, new Date());
      const cell = grid.createDiv({
        cls: `home-base-month-day${isCurrentMonth ? "" : " is-outside"}${isToday ? " is-today" : ""}`,
        attr: { role: "gridcell", tabindex: "0", "aria-label": day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) }
      });
      const dayNumber = cell.createEl("button", { cls: "home-base-month-day-number", text: String(day.getDate()), attr: { "aria-label": `Create event on ${this.fullDate(day)}` } });
      dayNumber.onClickEvent(() => this.openNewEvent(this.dateAt(day, 9, 0), false));
      cell.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        this.openNewEvent(this.dateAt(day, 9, 0), false);
      });
      const dayEvents = events.filter((event) => this.eventOccursOn(event, day)).sort((a, b) => this.compareEvents(a, b));
      const list = cell.createDiv({ cls: "home-base-month-events" });
      for (const event of dayEvents.slice(0, 3)) this.renderMonthEvent(list, event, day);
      if (dayEvents.length > 3) {
        const more = list.createEl("button", { cls: "home-base-month-more", text: `+${dayEvents.length - 3} more`, attr: { "aria-label": `Show all events on ${this.fullDate(day)}` } });
        more.onClickEvent((click) => {
          click.stopPropagation();
          this.selectedDate = day;
          this.mode = "day";
          void this.refresh(false);
        });
      }
      cell.addEventListener("click", (click) => {
        if (click.target === cell || click.target === list) this.openNewEvent(this.dateAt(day, 9, 0), false);
      });
    }
  }

  private renderMonthEvent(parent: HTMLElement, event: CalendarEvent, day: Date) {
    const time = event.allDay || !this.sameDay(event.start, event.end) ? "" : event.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const button = parent.createEl("button", {
      cls: "home-base-month-event",
      attr: { "aria-label": this.eventAriaLabel(event), title: this.eventAriaLabel(event) }
    });
    button.style.setProperty("--home-base-event-color", event.color);
    button.createSpan({ cls: "home-base-month-event-provider", text: event.provider === "icloud" ? "iCloud" : "Google" });
    if (time && this.sameDay(event.start, day)) button.createSpan({ cls: "home-base-month-event-time", text: time });
    button.createSpan({ cls: "home-base-month-event-title", text: event.title || "Untitled event" });
    button.onClickEvent((click) => {
      click.stopPropagation();
      this.openEvent(event);
    });
  }

  private renderTimeView(parent: HTMLElement, events: CalendarEvent[]) {
    const { start, end } = this.visibleRange();
    const days: Date[] = [];
    for (let date = new Date(start); date < end; date = this.addDays(date, 1)) days.push(new Date(date));
    const shell = parent.createDiv({ cls: `home-base-time-calendar is-${this.mode}` });
    const header = shell.createDiv({ cls: "home-base-time-calendar-header" });
    header.createDiv({ cls: "home-base-time-gutter" });
    const dayHeaders = header.createDiv({ cls: "home-base-time-day-headers" });
    dayHeaders.style.setProperty("--home-base-calendar-days", String(days.length));
    for (const day of days) {
      const button = dayHeaders.createEl("button", { cls: `home-base-time-day-header${this.sameDay(day, new Date()) ? " is-today" : ""}` });
      button.createSpan({ text: day.toLocaleDateString(undefined, { weekday: "short" }) });
      button.createEl("strong", { text: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }) });
      button.onClickEvent(() => {
        this.selectedDate = day;
        this.mode = "day";
        void this.refresh(false);
      });
    }

    const allDay = shell.createDiv({ cls: "home-base-all-day-row" });
    allDay.createDiv({ cls: "home-base-time-gutter", text: "all-day" });
    const allDayColumns = allDay.createDiv({ cls: "home-base-all-day-columns" });
    allDayColumns.style.setProperty("--home-base-calendar-days", String(days.length));
    for (const day of days) {
      const column = allDayColumns.createDiv({ cls: "home-base-all-day-column" });
      column.setAttribute("aria-label", `All-day events on ${this.fullDate(day)}`);
      column.addEventListener("click", (click) => {
        if (click.target === column) this.openNewEvent(this.dateAt(day, 0, 0), true);
      });
      const dayEvents = events.filter((event) => this.isAllDayLaneEvent(event) && this.eventOccursOn(event, day)).sort((a, b) => this.compareEvents(a, b));
      for (const event of dayEvents) this.renderAllDayEvent(column, event);
    }

    const scroll = shell.createDiv({ cls: "home-base-calendar-time-scroll" });
    const timeLabels = scroll.createDiv({ cls: "home-base-time-labels" });
    for (let hour = 0; hour < 24; hour += 1) {
      timeLabels.createDiv({ text: new Date(2000, 0, 1, hour).toLocaleTimeString(undefined, { hour: "numeric" }) });
    }
    const columns = scroll.createDiv({ cls: "home-base-time-columns" });
    columns.style.setProperty("--home-base-calendar-days", String(days.length));
    for (const day of days) this.renderTimeColumn(columns, day, events);
    window.requestAnimationFrame(() => {
      const targetHour = this.sameDay(this.selectedDate, new Date()) ? Math.max(0, new Date().getHours() - 2) : 8;
      scroll.scrollTop = targetHour * 64;
    });
  }

  private renderAllDayEvent(parent: HTMLElement, event: CalendarEvent) {
    const button = parent.createEl("button", { cls: "home-base-all-day-event", attr: { title: this.eventAriaLabel(event), "aria-label": this.eventAriaLabel(event) } });
    button.style.setProperty("--home-base-event-color", event.color);
    button.createSpan({ cls: "home-base-calendar-provider-tag", text: event.provider === "icloud" ? "iCloud" : "Google" });
    button.createSpan({ text: event.title || "Untitled event" });
    button.onClickEvent((click) => {
      click.stopPropagation();
      this.openEvent(event);
    });
  }

  private renderTimeColumn(parent: HTMLElement, day: Date, events: CalendarEvent[]) {
    const column = parent.createDiv({ cls: `home-base-time-day-column${this.sameDay(day, new Date()) ? " is-today" : ""}` });
    for (let slot = 0; slot < 48; slot += 1) {
      const hour = Math.floor(slot / 2);
      const minute = slot % 2 ? 30 : 0;
      const button = column.createEl("button", {
        cls: "home-base-time-slot",
        attr: { "aria-label": `Create event on ${this.fullDate(day)} at ${this.timeLabel(hour, minute)}` }
      });
      button.onClickEvent(() => this.openNewEvent(this.dateAt(day, hour, minute), false));
    }

    const layouts = this.layoutTimedEvents(events.filter((event) => !this.isAllDayLaneEvent(event) && this.eventOccursOn(event, day)), day);
    for (const layout of layouts) {
      const button = column.createEl("button", { cls: "home-base-calendar-timed-event", attr: { title: this.eventAriaLabel(layout.event), "aria-label": this.eventAriaLabel(layout.event) } });
      button.style.setProperty("--home-base-event-color", layout.event.color);
      button.style.top = `${layout.start / 1_440 * 100}%`;
      button.style.height = `${Math.max(2.2, (layout.end - layout.start) / 1_440 * 100)}%`;
      button.style.left = `calc(${layout.column / layout.columns * 100}% + 3px)`;
      button.style.width = `calc(${100 / layout.columns}% - 6px)`;
      button.createSpan({ cls: "home-base-calendar-provider-tag", text: layout.event.provider === "icloud" ? "iCloud" : "Google" });
      button.createEl("strong", { text: layout.event.title || "Untitled event" });
      button.createSpan({ text: this.eventTime(layout.event) });
      button.onClickEvent((click) => {
        click.stopPropagation();
        this.openEvent(layout.event);
      });
    }

    if (this.sameDay(day, new Date())) {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const line = column.createDiv({ cls: "home-base-current-time" });
      line.style.top = `${minutes / 1_440 * 100}%`;
    }
  }

  private layoutTimedEvents(events: CalendarEvent[], day: Date) {
    const dayStart = this.startOfDay(day).getTime();
    const dayEnd = this.addDays(day, 1).getTime();
    const intervals = events.map((event) => ({
      event,
      start: Math.max(0, (Math.max(event.start.getTime(), dayStart) - dayStart) / 60_000),
      end: Math.min(1_440, (Math.min(event.end.getTime(), dayEnd) - dayStart) / 60_000)
    })).sort((a, b) => a.start - b.start || a.end - b.end);
    const result: Array<typeof intervals[number] & { column: number; columns: number }> = [];
    for (let index = 0; index < intervals.length;) {
      const cluster: typeof intervals = [];
      let clusterEnd = intervals[index].end;
      while (index < intervals.length && (!cluster.length || intervals[index].start < clusterEnd)) {
        cluster.push(intervals[index]);
        clusterEnd = Math.max(clusterEnd, intervals[index].end);
        index += 1;
      }
      const active: Array<{ end: number; column: number }> = [];
      const assigned: Array<typeof intervals[number] & { column: number }> = [];
      let columns = 1;
      for (const interval of cluster) {
        for (let activeIndex = active.length - 1; activeIndex >= 0; activeIndex -= 1) {
          if (active[activeIndex].end <= interval.start) active.splice(activeIndex, 1);
        }
        const used = new Set(active.map((item) => item.column));
        let column = 0;
        while (used.has(column)) column += 1;
        active.push({ end: interval.end, column });
        assigned.push({ ...interval, column });
        columns = Math.max(columns, column + 1);
      }
      result.push(...assigned.map((interval) => ({ ...interval, columns })));
    }
    return result;
  }

  private visibleRange() {
    if (this.mode === "day") {
      const start = this.startOfDay(this.selectedDate);
      return { start, end: this.addDays(start, 1) };
    }
    if (this.mode === "week") {
      const start = this.addDays(this.selectedDate, -this.selectedDate.getDay());
      return { start, end: this.addDays(start, 7) };
    }
    const first = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
    const last = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0);
    const start = this.addDays(first, -first.getDay());
    const end = this.addDays(last, 7 - last.getDay());
    return { start, end };
  }

  private rangeTitle() {
    if (this.mode === "month") return this.selectedDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    if (this.mode === "day") return this.selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const { start, end } = this.visibleRange();
    const inclusiveEnd = this.addDays(end, -1);
    if (start.getMonth() === inclusiveEnd.getMonth()) {
      return `${start.toLocaleDateString(undefined, { month: "long", day: "numeric" })}–${inclusiveEnd.getDate()}, ${inclusiveEnd.getFullYear()}`;
    }
    return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}–${inclusiveEnd.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  }

  private navigate(direction: -1 | 1) {
    const next = new Date(this.selectedDate);
    if (this.mode === "month") next.setMonth(next.getMonth() + direction);
    else next.setDate(next.getDate() + direction * (this.mode === "week" ? 7 : 1));
    this.selectedDate = this.startOfDay(next);
    void this.refresh(false);
  }

  private iconButton(parent: HTMLElement, iconName: string, label: string, action: () => void) {
    const button = parent.createEl("button", { cls: "home-base-calendar-nav-button", attr: { "aria-label": label, title: label } });
    setIcon(button, iconName);
    button.onClickEvent(action);
  }

  private openNewEvent(date: Date, allDay: boolean) {
    new CalendarEventModal(this.app, this.plugin, undefined, () => void this.refresh(true), { initialDate: date, initialAllDay: allDay }).open();
  }

  private openEvent(event: CalendarEvent) {
    new CalendarEventModal(this.app, this.plugin, event, () => void this.refresh(true), { readOnly: !event.writable }).open();
  }

  private defaultNewEventDate() {
    if (this.sameDay(this.selectedDate, new Date())) return nextHalfHour(new Date());
    return this.dateAt(this.selectedDate, 9, 0);
  }

  private isAllDayLaneEvent(event: CalendarEvent) {
    return event.allDay || !this.sameDay(event.start, addMinutes(event.end, -1));
  }

  private eventOccursOn(event: CalendarEvent, day: Date) {
    const start = this.startOfDay(event.start);
    const end = this.startOfDay(event.allDay ? this.addDays(event.end, -1) : addMinutes(event.end, -1));
    return start <= day && end >= day;
  }

  private compareEvents(a: CalendarEvent, b: CalendarEvent) {
    if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
    return a.start.getTime() - b.start.getTime() || a.title.localeCompare(b.title);
  }

  private eventAriaLabel(event: CalendarEvent) {
    const provider = event.provider === "icloud" ? "iCloud" : "Google";
    return `${event.title || "Untitled event"}, ${this.eventTime(event)}, ${event.calendarName}, ${provider}${event.writable ? "" : ", read only"}`;
  }

  private eventTime(event: CalendarEvent) {
    if (event.allDay) return "All day";
    const start = event.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const end = event.end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return `${start}–${end}`;
  }

  private fullDate(date: Date) {
    return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

  private timeLabel(hour: number, minute: number) {
    return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  private dateAt(date: Date, hour: number, minute: number) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0);
  }

  private startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return this.startOfDay(next);
  }

  private sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}

function requestGooglePassphrase(
  app: App,
  title: string,
  description: string,
  fieldName = "Passphrase",
  placeholder = "Enter passphrase",
  requiredMessage = "Google sync passphrase is required."
) {
  return new Promise<string | null>((resolve) => {
    new GooglePassphraseModal(app, title, description, fieldName, placeholder, requiredMessage, resolve).open();
  });
}

class GooglePassphraseModal extends Modal {
  private value = "";
  private settled = false;

  constructor(
    app: App,
    private readonly title: string,
    private readonly description: string,
    private readonly fieldName: string,
    private readonly placeholder: string,
    private readonly requiredMessage: string,
    private readonly resolvePassphrase: (value: string | null) => void
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("home-base-modal");
    contentEl.createEl("h2", { text: this.title });
    contentEl.createEl("p", { cls: "home-base-muted", text: this.description });

    new Setting(contentEl)
      .setName(this.fieldName)
      .addText((text) => {
        text.inputEl.type = "password";
        text.inputEl.autocomplete = "current-password";
        text.setPlaceholder(this.placeholder);
        text.onChange((value) => {
          this.value = value;
        });
        text.inputEl.addEventListener("keydown", (event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          this.submit();
        });
        window.setTimeout(() => text.inputEl.focus(), 0);
      });

    new Setting(contentEl)
      .addButton((button) => {
        button
          .setButtonText("Cancel")
          .onClick(() => this.finish(null));
      })
      .addButton((button) => {
        button
          .setButtonText("Continue")
          .setCta()
          .onClick(() => this.submit());
      });
  }

  onClose() {
    this.contentEl.empty();
    if (!this.settled) {
      this.settled = true;
      this.resolvePassphrase(null);
    }
  }

  private submit() {
    if (!this.value) {
      new Notice(this.requiredMessage);
      return;
    }
    this.finish(this.value);
  }

  private finish(value: string | null) {
    if (this.settled) return;
    this.settled = true;
    this.resolvePassphrase(value);
    this.close();
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
  private calendarIdValue = "";
  private readOnly = false;
  private durationMinutes = 60;
  private activeTimePicker: TimePickerKind | null = null;
  private activeTimeField?: HTMLElement;
  private activeTimeInput?: HTMLInputElement;
  private timePickerPopover?: HTMLElement;
  private startTimeInput?: HTMLInputElement;
  private endTimeInput?: HTMLInputElement;
  private timeWheelDeltas = new WeakMap<HTMLElement, number>();
  private outsideTimePickerHandler = (event: MouseEvent) => {
    const target = event.target as Node | null;
    if (!target) return;
    if (this.timePickerPopover?.contains(target) || this.activeTimeField?.contains(target)) return;
    this.closeTimePicker();
  };
  private timePickerKeyHandler = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !this.activeTimePicker) return;
    event.preventDefault();
    event.stopPropagation();
    this.closeTimePicker(true);
  };
  private timePickerResizeHandler = () => this.positionTimePicker();

  constructor(app: App, plugin: HomeBasePlugin, event: CalendarEvent | undefined, onSave: () => void, options: CalendarEventModalOptions = {}) {
    super(app);
    this.plugin = plugin;
    this.event = event;
    this.onSave = onSave;
    this.readOnly = Boolean(options.readOnly || (event && !event.writable));

    if (event) {
      this.calendarIdValue = event.calendarId;
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
      this.calendarIdValue = plugin.settings.defaultCalendarId;
      const start = options.initialDate ? new Date(options.initialDate) : nextHalfHour(new Date());
      const end = addMinutes(start, this.durationMinutes);
      this.dateValue = this.dateInputValue(start);
      this.startTimeValue = this.timeInputValue(start);
      this.endTimeValue = this.timeInputValue(end);
      this.allDayValue = Boolean(options.initialAllDay);
    }
  }

  onOpen() {
    this.render();
  }

  onClose() {
    this.closeTimePicker();
  }

  private render() {
    this.closeTimePicker();
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("home-base-modal");
    if (this.readOnly && this.event) {
      this.renderReadOnlyEvent(contentEl, this.event);
      return;
    }
    contentEl.createEl("h2", { text: this.event ? "Edit Event" : "New Event" });

    new Setting(contentEl)
      .setName("Title")
      .addText((text) => {
        text.setValue(this.titleValue);
        text.onChange((value) => {
          this.titleValue = value;
        });
      });

    if (!this.event) {
      const writableCalendars = this.plugin.settings.calendarSources.filter((calendar) => calendar.writable);
      new Setting(contentEl)
        .setName("Calendar")
        .setDesc("Choose where this event will be saved.")
        .addDropdown((dropdown) => {
          for (const calendar of writableCalendars) {
            dropdown.addOption(calendar.id, calendar.accountName ? `${calendar.displayName} — ${calendar.accountName}` : calendar.displayName);
          }
          dropdown.setValue(this.calendarIdValue || writableCalendars[0]?.id || "");
          dropdown.onChange((value) => {
            this.calendarIdValue = value;
          });
        });
    }

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
      this.renderTimeSetting(contentEl, "Start time", "start");
      this.renderTimeSetting(contentEl, "End time", "end");
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

  private renderReadOnlyEvent(contentEl: HTMLElement, event: CalendarEvent) {
    contentEl.createEl("h2", { text: event.title || "Untitled event" });
    const provider = event.provider === "icloud" ? "iCloud" : "Google";
    const details = contentEl.createDiv({ cls: "home-base-event-details" });
    const addDetail = (label: string, value: string) => {
      if (!value) return;
      const row = details.createDiv({ cls: "home-base-event-detail" });
      row.createEl("strong", { text: label });
      row.createDiv({ text: value });
    };
    addDetail("Calendar", `${event.calendarName} · ${provider}`);
    addDetail("Account", event.accountName);
    addDetail("When", this.readOnlyEventTime(event));
    addDetail("Location", event.location);
    addDetail("Repeat", event.repeat === "none" ? "Does not repeat" : event.repeat);
    addDetail("Notes", event.notes);
    details.createEl("p", { cls: "home-base-muted", text: "This calendar is read only in Home Base." });
    const footer = contentEl.createDiv({ cls: "home-base-modal-footer" });
    const close = footer.createEl("button", { cls: "mod-cta", text: "Close" });
    close.onClickEvent(() => this.close());
  }

  private readOnlyEventTime(event: CalendarEvent) {
    const date = event.start.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (event.allDay) return `${date} · All day`;
    const start = event.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const end = event.end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return `${date} · ${start}–${end}`;
  }

  private renderTimeSetting(parent: HTMLElement, label: string, kind: TimePickerKind) {
    const setting = new Setting(parent).setName(label);
    setting.settingEl.addClass("home-base-time-setting");
    const field = setting.controlEl.createDiv({ cls: "home-base-time-field" });
    const wrap = field.createDiv({ cls: "home-base-time-input-wrap" });
    const input = wrap.createEl("input", {
      cls: "home-base-time-input",
      attr: {
        type: "text",
        readonly: "true",
        "aria-haspopup": "dialog",
        "aria-expanded": "false",
        "aria-label": `${label}: ${this.formatDisplayTime(this.timeValueFor(kind))}. Open time picker.`
      }
    });
    input.value = this.formatDisplayTime(this.timeValueFor(kind));
    const icon = wrap.createSpan({ cls: "home-base-time-icon" });
    setIcon(icon, "clock");

    input.addEventListener("click", (event) => {
      event.preventDefault();
      this.openTimePicker(kind, field, input);
    });
    input.addEventListener("focus", () => this.openTimePicker(kind, field, input));
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "ArrowDown") return;
      event.preventDefault();
      this.openTimePicker(kind, field, input);
      this.timePickerPopover?.querySelector<HTMLButtonElement>("button")?.focus();
    });

    if (kind === "start") this.startTimeInput = input;
    else this.endTimeInput = input;
  }

  private openTimePicker(kind: TimePickerKind, field: HTMLElement, input: HTMLInputElement) {
    if (this.activeTimePicker === kind && this.timePickerPopover) {
      this.positionTimePicker();
      return;
    }
    this.closeTimePicker();
    this.activeTimePicker = kind;
    this.activeTimeField = field;
    this.activeTimeInput = input;
    input.setAttribute("aria-expanded", "true");
    const popover = field.createDiv({ cls: "home-base-time-popover" });
    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-label", `${kind === "start" ? "Start" : "End"} time picker`);
    this.timePickerPopover = popover;
    this.renderTimePickerContents();
    this.positionTimePicker();
    document.addEventListener("mousedown", this.outsideTimePickerHandler, true);
    document.addEventListener("keydown", this.timePickerKeyHandler, true);
    window.addEventListener("resize", this.timePickerResizeHandler);
  }

  private closeTimePicker(focusInput = false) {
    const input = this.activeTimeInput;
    if (this.timePickerPopover) this.timePickerPopover.remove();
    this.timePickerPopover = undefined;
    this.activeTimeField = undefined;
    this.activeTimeInput = undefined;
    this.activeTimePicker = null;
    if (input) input.setAttribute("aria-expanded", "false");
    document.removeEventListener("mousedown", this.outsideTimePickerHandler, true);
    document.removeEventListener("keydown", this.timePickerKeyHandler, true);
    window.removeEventListener("resize", this.timePickerResizeHandler);
    if (focusInput) input?.focus();
  }

  private renderTimePickerContents() {
    if (!this.timePickerPopover || !this.activeTimePicker) return;
    const popover = this.timePickerPopover;
    const kind = this.activeTimePicker;
    const parts = this.parseTimeParts(this.timeValueFor(kind));
    popover.empty();
    this.renderTimeColumn(popover, kind, "hour", parts.hour12);
    popover.createDiv({ cls: "home-base-time-divider" });
    this.renderTimeColumn(popover, kind, "minute", String(parts.minute).padStart(2, "0"));
    popover.createDiv({ cls: "home-base-time-divider" });
    const period = popover.createDiv({ cls: "home-base-period-column" });
    this.renderPeriodButton(period, kind, "AM", parts.period);
    this.renderPeriodButton(period, kind, "PM", parts.period);
  }

  private renderTimeColumn(parent: HTMLElement, kind: TimePickerKind, unit: "hour" | "minute", value: string | number) {
    const labelUnit = unit === "hour" ? "hour" : "minute";
    const column = parent.createDiv({ cls: "home-base-time-column" });
    column.addEventListener("wheel", (event) => this.handleTimeColumnWheel(event, column, kind, unit), { passive: false });
    const up = column.createEl("button", { cls: "home-base-time-step", attr: { "aria-label": `Decrease ${kind} ${labelUnit}` } });
    setIcon(up, "chevron-up");
    up.onClickEvent(() => this.adjustTime(kind, unit, -1));
    column.createDiv({ cls: "home-base-time-value", text: String(value) });
    const down = column.createEl("button", { cls: "home-base-time-step", attr: { "aria-label": `Increase ${kind} ${labelUnit}` } });
    setIcon(down, "chevron-down");
    down.onClickEvent(() => this.adjustTime(kind, unit, 1));
  }

  private handleTimeColumnWheel(event: WheelEvent, column: HTMLElement, kind: TimePickerKind, unit: "hour" | "minute") {
    event.preventDefault();
    event.stopPropagation();

    const wheelDelta = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * 16 : event.deltaY;
    const accumulated = (this.timeWheelDeltas.get(column) ?? 0) + wheelDelta;
    const direction = accumulated > 0 ? 1 : -1;
    const threshold = this.timeWheelThreshold(kind, unit, direction);
    if (Math.abs(accumulated) < threshold) {
      this.timeWheelDeltas.set(column, accumulated);
      return;
    }

    this.adjustWheelTime(kind, unit, direction);
    this.timeWheelDeltas.set(column, accumulated - Math.sign(accumulated) * threshold);
  }

  private timeWheelThreshold(kind: TimePickerKind, unit: "hour" | "minute", direction: 1 | -1) {
    if (unit !== "minute") return 24;
    const { minute } = this.parseTimeParts(this.timeValueFor(kind));
    return (minute === 0 || minute === 30) ? 42 : 18;
  }

  private adjustWheelTime(kind: TimePickerKind, unit: "hour" | "minute", direction: 1 | -1) {
    const parts = this.parseTimeParts(this.timeValueFor(kind));
    const hour12 = parts.hour12;
    const nextHour12 = unit === "hour" ? this.wrapNumber(hour12 + direction, 1, 12) : hour12;
    const nextMinute = unit === "minute" ? this.wrapNumber(parts.minute + direction, 0, 59) : parts.minute;
    const hour24 = parts.period === "AM"
      ? nextHour12 % 12
      : (nextHour12 % 12) + 12;
    this.applyTimeValue(kind, `${String(hour24).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`);
  }

  private wrapNumber(value: number, min: number, max: number) {
    if (value > max) return min;
    if (value < min) return max;
    return value;
  }

  private renderPeriodButton(parent: HTMLElement, kind: TimePickerKind, period: "AM" | "PM", selected: "AM" | "PM") {
    const button = parent.createEl("button", {
      cls: `home-base-period-button${period === selected ? " is-selected" : ""}`,
      text: period,
      attr: {
        "aria-label": `Set ${kind} time to ${period}`,
        "aria-pressed": period === selected ? "true" : "false"
      }
    });
    button.onClickEvent(() => this.setTimePeriod(kind, period));
  }

  private positionTimePicker() {
    if (!this.timePickerPopover || !this.activeTimeField || !this.activeTimeInput) return;
    const popover = this.timePickerPopover;
    popover.style.left = "0px";
    popover.style.removeProperty("--home-base-time-pointer-left");
    popover.removeClass("is-above");

    const fieldRect = this.activeTimeField.getBoundingClientRect();
    const inputRect = this.activeTimeInput.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const modalRect = this.contentEl.getBoundingClientRect();
    const margin = 12;
    const boundaryLeft = Math.max(margin, modalRect.left + margin);
    const boundaryRight = Math.min(window.innerWidth - margin, modalRect.right - margin);
    const minLeft = boundaryLeft - fieldRect.left;
    const maxLeft = boundaryRight - fieldRect.left - popoverRect.width;
    const lowerLeft = Math.min(minLeft, maxLeft);
    const upperLeft = Math.max(minLeft, maxLeft);
    const desiredLeft = Math.min(Math.max(0, lowerLeft), upperLeft);
    popover.style.left = `${desiredLeft}px`;

    const pointerLeft = inputRect.left + Math.min(32, inputRect.width / 2) - fieldRect.left - desiredLeft;
    popover.style.setProperty("--home-base-time-pointer-left", `${Math.max(16, Math.min(popoverRect.width - 22, pointerLeft))}px`);

    const nextRect = popover.getBoundingClientRect();
    if (nextRect.bottom > window.innerHeight - margin && inputRect.top - nextRect.height - margin > 0) {
      popover.addClass("is-above");
    }
  }

  private adjustTime(kind: TimePickerKind, unit: "hour" | "minute", direction: 1 | -1) {
    const parts = this.parseTimeParts(this.timeValueFor(kind));
    const date = new Date(2000, 0, 1, parts.hour24, parts.minute, 0, 0);
    const next = unit === "hour" ? addMinutes(date, direction * 60) : addMinutes(date, direction * 30);
    this.applyTimeValue(kind, this.timeInputValue(next));
  }

  private setTimePeriod(kind: TimePickerKind, period: "AM" | "PM") {
    const parts = this.parseTimeParts(this.timeValueFor(kind));
    if (parts.period === period) return;
    const hour24 = period === "AM" ? parts.hour24 - 12 : parts.hour24 + 12;
    this.applyTimeValue(kind, `${String(hour24).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`);
  }

  private applyTimeValue(kind: TimePickerKind, value: string) {
    if (kind === "start") {
      this.startTimeValue = value;
      this.updateTimeInput(this.startTimeInput, value, "Start time");
      this.followStartTime();
    } else {
      this.endTimeValue = value;
      this.updateTimeInput(this.endTimeInput, value, "End time");
      this.updateDurationFromEnd();
    }
    this.renderTimePickerContents();
    this.positionTimePicker();
  }

  private updateTimeInput(input: HTMLInputElement | undefined, value: string, label: string) {
    if (!input) return;
    const display = this.formatDisplayTime(value);
    input.value = display;
    input.setAttribute("aria-label", `${label}: ${display}. Open time picker.`);
  }

  private timeValueFor(kind: TimePickerKind) {
    return kind === "start" ? this.startTimeValue : this.endTimeValue;
  }

  private parseTimeParts(value: string) {
    const [rawHour, rawMinute] = value.split(":").map((part) => Number(part));
    const hour24 = Number.isFinite(rawHour) ? Math.min(23, Math.max(0, rawHour)) : 0;
    const minute = Number.isFinite(rawMinute) ? Math.min(59, Math.max(0, rawMinute)) : 0;
    return {
      hour24,
      hour12: hour24 % 12 || 12,
      minute,
      period: hour24 >= 12 ? "PM" as const : "AM" as const
    };
  }

  private formatDisplayTime(value: string) {
    const parts = this.parseTimeParts(value);
    return `${parts.hour12}:${String(parts.minute).padStart(2, "0")} ${parts.period}`;
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
      calendarId: this.event?.calendarId || this.calendarIdValue,
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
    this.updateTimeInput(this.endTimeInput, this.endTimeValue, "End time");
    if (!silent) new Notice("End time was adjusted to be after the start time.");
  }

  private followStartTime() {
    if (this.allDayValue || !this.dateValue || !this.startTimeValue) return;
    const start = makeEventDate(this.dateValue, this.startTimeValue);
    const end = addMinutes(start, Math.max(this.durationMinutes, 1));
    this.endTimeValue = this.timeInputValue(end);
    this.updateTimeInput(this.endTimeInput, this.endTimeValue, "End time");
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
      .setDesc("Show connected iCloud/CalDAV and Google calendars in Home Base.")
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
      .setName("Test calendar connection")
      .setDesc("Discovers every CalDAV event calendar and enables new calendars by default.")
      .addButton((button) => {
        button.setButtonText("Test");
        button.onClick(async () => {
          try {
            const calendars = await this.plugin.testCalendarConnection();
            new Notice(`Connected to ${calendars.length} calendar${calendars.length === 1 ? "" : "s"}.`);
            this.display();
            await this.plugin.refreshDashboard(true);
          } catch (error) {
            new Notice(error instanceof Error ? error.message : "Calendar connection failed.");
          }
        });
      });

    containerEl.createEl("h4", { text: "Google Calendar accounts" });
    new Setting(containerEl)
      .setName("Google OAuth client secret")
      .setDesc("Stored only in Obsidian SecretStorage. Set or replace it when Google reports that client_secret is missing or invalid.")
      .addButton((button) => {
        button.setButtonText("Set / Replace");
        button.onClick(async () => {
          if (await this.plugin.replaceGoogleClientSecret()) new Notice("Google OAuth client secret saved locally.");
        });
      });
    new Setting(containerEl)
      .setName("Connect Google account")
      .setDesc(Platform.isDesktopApp ? "Opens Google in your browser using secure OAuth 2.0 + PKCE." : "Connect accounts from Obsidian desktop, then sync this vault to mobile.")
      .addButton((button) => {
        button.setButtonText("Connect").setDisabled(!Platform.isDesktopApp);
        button.onClick(async () => {
          try {
            const account = await this.plugin.connectGoogleAccount();
            new Notice(`Connected ${account.email}.`);
            this.display();
            await this.plugin.refreshDashboard();
          } catch (error) {
            new Notice(error instanceof Error ? error.message : "Google Calendar connection failed.");
          }
        });
      });

    for (const account of this.plugin.settings.googleAccounts) {
      new Setting(containerEl)
        .setName(account.email)
        .setDesc("Google Calendar · Encrypted refresh token")
        .addButton((button) => {
          button.setButtonText("Disconnect").setWarning();
          button.onClick(async () => {
            await this.plugin.disconnectGoogleAccount(account.id);
            this.display();
            await this.plugin.refreshDashboard();
          });
        });
    }

    const supportedCalendars = this.plugin.settings.calendarSources.filter((source) => source.provider === "icloud" || source.provider === "google");
    if (supportedCalendars.length) {
      containerEl.createEl("h4", { text: "Visible calendars" });
      for (const calendar of supportedCalendars) {
        const providerLabel = calendar.provider === "icloud" ? "iCloud" : "Google";
        const setting = new Setting(containerEl)
          .setName(calendar.displayName)
          .setDesc(`${providerLabel} · ${calendar.accountName || providerLabel}${calendar.writable ? " · Writable" : " · Read only"}`)
          .addToggle((toggle) => {
            toggle.setValue(calendar.enabled).onChange(async (value) => {
              await this.plugin.setCalendarEnabled(calendar.id, value);
            });
          });
        const swatch = setting.nameEl.createSpan({ cls: "home-base-calendar-source-dot" });
        swatch.style.backgroundColor = calendar.color;
      }

      new Setting(containerEl)
        .setName("Default event calendar")
        .setDesc("New events are saved here unless another calendar is selected in the event form.")
        .addDropdown((dropdown) => {
          for (const calendar of supportedCalendars.filter((source) => source.writable)) {
            const providerLabel = calendar.provider === "icloud" ? "iCloud" : "Google";
            dropdown.addOption(calendar.id, `${calendar.displayName} — ${providerLabel}`);
          }
          dropdown.setValue(this.plugin.settings.defaultCalendarId);
          dropdown.onChange(async (value) => {
            const calendar = this.plugin.settings.calendarSources.find((source) => source.id === value);
            this.plugin.settings.defaultCalendarId = value;
            this.plugin.settings.calendarUrl = calendar?.href ?? "";
            this.plugin.settings.calendarName = calendar?.displayName ?? "";
            await this.plugin.saveSettings();
          });
        });
    }

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
