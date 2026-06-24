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
  normalizePath
} from "obsidian";

const VIEW_TYPE_HOME_BASE = "home-base-dashboard";

type Priority = "high" | "medium" | "low" | "";
type TodoGroup = "Overdue" | "Today" | "Tomorrow" | "Next 7 Days" | "No Due Date" | "Later";

interface HomeBaseSettings {
  openOnStartup: boolean;
  todoInboxPath: string;
  todoScanFolders: string;
  workoutPlanPath: string;
  workoutLogPath: string;
  showSchedulePlaceholder: boolean;
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

interface TodoDraft {
  title: string;
  due: string;
  priority: Priority;
  tags: string[];
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

const DEFAULT_SETTINGS: HomeBaseSettings = {
  openOnStartup: true,
  todoInboxPath: "Home Base/Todo Inbox.md",
  todoScanFolders: "Home Base",
  workoutPlanPath: "Home Base/Workout Plan.md",
  workoutLogPath: "Home Base/Workout Log.md",
  showSchedulePlaceholder: true
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

const QUICK_ADD_PLACEHOLDER = "Finish essay tomorrow #school !high";

function parseQuickTodoInput(input: string, now = new Date()): TodoDraft | null {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;

  let due = "";
  let priority: Priority = "";
  const tags: string[] = [];
  const titleTokens: string[] = [];

  for (const token of tokens) {
    const lower = token.toLowerCase();
    const priorityMatch = lower.match(/^!(high|medium|low)$/);
    if (priorityMatch) {
      priority = priorityMatch[1] as Priority;
      continue;
    }

    if (/^#[\w/-]+$/.test(token)) {
      tags.push(token);
      continue;
    }

    const quickDue = parseQuickDueToken(lower, now);
    if (quickDue) {
      due = quickDue;
      continue;
    }

    titleTokens.push(token);
  }

  const title = titleTokens.join(" ").trim();
  if (!title) return null;

  return {
    title,
    due,
    priority,
    tags: normalizeTodoTags(tags)
  };
}

function parseQuickDueToken(token: string, now: Date) {
  if (token === "today") return formatDateKey(now);
  if (token === "tomorrow") return formatDateKey(addDays(now, 1));
  if (/^\d{4}-\d{2}-\d{2}$/.test(token) && isValidDateKey(token)) return token;
  return "";
}

function isValidDateKey(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function normalizeTodoTags(tags: string[]) {
  const seen = new Set<string>();
  return tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.startsWith("#") ? tag : `#${tag}`)
    .filter((tag) => {
      if (seen.has(tag)) return false;
      seen.add(tag);
      return true;
    });
}

function formatTodoLine(todo: TodoDraft, completed = false) {
  const due = todo.due ? ` due:: ${todo.due}` : "";
  const priority = todo.priority ? ` priority:: ${todo.priority}` : "";
  const tags = todo.tags.length ? ` ${todo.tags.join(" ")}` : "";
  return `- [${completed ? "x" : " "}] ${todo.title.trim()}${due}${priority}${tags}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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

.home-base-italic {
  font-style: italic;
}

.home-base-todo-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.home-base-quick-add {
  flex: 1 1 260px;
  min-width: 0;
  min-height: 36px;
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

  .home-base-actions {
    grid-column: 2;
  }

  .home-base-todo-controls {
    align-items: stretch;
    flex-direction: column;
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
    const workoutState = this.getWorkoutState(plan, log);

    this.renderHeader(root);

    const grid = root.createDiv({ cls: "home-base-grid" });
    const left = grid.createDiv({ cls: "home-base-column home-base-left" });
    const right = grid.createDiv({ cls: "home-base-column home-base-right" });

    if (this.plugin.settings.showSchedulePlaceholder) {
      this.renderSchedule(left);
    }
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

  private renderSchedule(parent: HTMLElement) {
    const panel = parent.createDiv({ cls: "home-base-panel" });
    const title = panel.createDiv({ cls: "home-base-panel-title" });
    title.createEl("span", { cls: "home-base-icon", text: "Cal" });
    title.createEl("h2", { text: "Schedule" });
    title.createEl("span", { cls: "home-base-pill", text: "Coming soon" });

    const empty = panel.createDiv({ cls: "home-base-schedule-empty" });
    empty.createDiv({ cls: "home-base-calendar-mark", text: "Calendar" });
    const copy = empty.createDiv();
    copy.createEl("strong", { text: "Calendar integration planned" });
    copy.createEl("p", { text: "View your events and time blocks right here in the future." });

    panel.createEl("h3", { text: "Today (preview)" });
    panel.createEl("p", { cls: "home-base-muted home-base-italic", text: "No events scheduled" });
  }

  private renderTodos(parent: HTMLElement, todos: TodoItem[]) {
    const panel = parent.createDiv({ cls: "home-base-panel home-base-todo-panel" });
    const title = panel.createDiv({ cls: "home-base-panel-title home-base-todo-title" });
    title.createEl("span", { cls: "home-base-icon", text: "Task" });
    title.createEl("h2", { text: "Todo Manager" });

    const controls = panel.createDiv({ cls: "home-base-todo-controls" });
    const quickAdd = controls.createEl("input", {
      cls: "home-base-quick-add",
      attr: {
        "aria-label": "Quick add todo",
        placeholder: QUICK_ADD_PLACEHOLDER
      }
    });
    quickAdd.type = "text";
    quickAdd.onkeydown = (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      void this.createQuickTodo(quickAdd);
    };

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

  private async createQuickTodo(input: HTMLInputElement) {
    const todo = parseQuickTodoInput(input.value);
    if (!todo) {
      new Notice("Add a todo title before saving.");
      input.focus();
      return;
    }

    await appendTodoToInbox(this.app, this.plugin, formatTodoLine(todo));
    input.value = "";
    new Notice("Todo added.");
    await this.render();
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

async function appendTodoToInbox(app: App, plugin: HomeBasePlugin, line: string) {
  await plugin.ensureFile(plugin.settings.todoInboxPath, DEFAULT_TODO_INBOX);
  const file = app.vault.getAbstractFileByPath(normalizePath(plugin.settings.todoInboxPath));
  if (!(file instanceof TFile)) return;

  const content = await app.vault.cachedRead(file);
  await app.vault.modify(file, `${content.trimEnd()}\n${line}\n`);
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
      await appendTodoToInbox(this.app, this.plugin, line);
    }

    this.close();
    this.onSave();
  }

  private formatTodoLine() {
    return formatTodoLine({
      title: this.titleValue.trim(),
      due: this.dueValue,
      priority: this.priorityValue,
      tags: normalizeTodoTags(this.tagsValue.split(/\s+/))
    });
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

    new Setting(containerEl)
      .setName("Show schedule placeholder")
      .setDesc("Keep a disabled schedule panel visible until calendar support is implemented.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.showSchedulePlaceholder)
          .onChange(async (value) => {
            this.plugin.settings.showSchedulePlaceholder = value;
            await this.plugin.saveSettings();
          });
      });
  }
}
