/* Home Base Obsidian plugin */
var x=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var C=Object.getOwnPropertyNames;var O=Object.prototype.hasOwnProperty;var $=(r,e)=>{for(var t in e)x(r,t,{get:e[t],enumerable:!0})},B=(r,e,t,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of C(e))!O.call(r,s)&&s!==t&&x(r,s,{get:()=>e[s],enumerable:!(o=W(e,s))||o.enumerable});return r};var H=r=>B(x({},"__esModule",{value:!0}),r);var K={};$(K,{default:()=>f});module.exports=H(K);var i=require("obsidian"),g="home-base-dashboard",F={openOnStartup:!0,todoInboxPath:"Home Base/Todo Inbox.md",todoScanFolders:"Home Base",workoutPlanPath:"Home Base/Workout Plan.md",workoutLogPath:"Home Base/Workout Log.md",showSchedulePlaceholder:!0},E=`# Todo Inbox

`,T=`# Workout Types

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
`,P=`# Workout Log

`,N="Finish essay tomorrow #school !high";function V(r,e=new Date){let t=r.trim().split(/\s+/).filter(Boolean);if(!t.length)return null;let o="",s="",a=[],n=[];for(let d of t){let l=d.toLowerCase(),u=l.match(/^!(high|medium|low)$/);if(u){s=u[1];continue}if(/^#[\w/-]+$/.test(d)){a.push(d);continue}let h=I(l,e);if(h){o=h;continue}n.push(d)}let c=n.join(" ").trim();return c?{title:c,due:o,priority:s,tags:S(a)}:null}function I(r,e){return r==="today"?D(e):r==="tomorrow"?D(j(e,1)):/^\d{4}-\d{2}-\d{2}$/.test(r)&&R(r)?r:""}function R(r){let e=r.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!e)return!1;let t=Number(e[1]),o=Number(e[2]),s=Number(e[3]),a=new Date(t,o-1,s);return a.getFullYear()===t&&a.getMonth()===o-1&&a.getDate()===s}function S(r){let e=new Set;return r.map(t=>t.trim()).filter(Boolean).map(t=>t.startsWith("#")?t:`#${t}`).filter(t=>e.has(t)?!1:(e.add(t),!0))}function L(r,e=!1){let t=r.due?` due:: ${r.due}`:"",o=r.priority?` priority:: ${r.priority}`:"",s=r.tags.length?` ${r.tags.join(" ")}`:"";return`- [${e?"x":" "}] ${r.title.trim()}${t}${o}${s}`}function A(r){return new Date(r.getFullYear(),r.getMonth(),r.getDate())}function j(r,e){let t=new Date(r);return t.setDate(t.getDate()+e),A(t)}function D(r){return`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")}`}var M=`
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
`,f=class extends i.Plugin{async onload(){this.settings=Object.assign({},F,await this.loadData()),this.injectStyles(),this.registerView(g,e=>new y(e,this)),this.addRibbonIcon("home","Open Home Base",()=>{this.openDashboard()}),this.addCommand({id:"open-home-base",name:"Open Home Base",callback:()=>void this.openDashboard()}),this.addCommand({id:"refresh-home-base",name:"Refresh Home Base",callback:()=>void this.refreshDashboard()}),this.addSettingTab(new k(this.app,this)),await this.ensureDefaultFiles().catch(e=>{console.warn("Home Base could not create one or more default files.",e)}),this.settings.openOnStartup&&this.app.workspace.onLayoutReady(()=>{this.openDashboard()})}onunload(){var e;this.app.workspace.detachLeavesOfType(g),(e=this.styleEl)==null||e.remove()}async saveSettings(){await this.saveData(this.settings)}async openDashboard(){let e=this.app.workspace.getLeavesOfType(g)[0];if(e){this.app.workspace.revealLeaf(e);return}let t=this.app.workspace.getLeaf("tab");await t.setViewState({type:g,active:!0}),this.app.workspace.revealLeaf(t)}async refreshDashboard(){let e=this.app.workspace.getLeavesOfType(g);for(let t of e){let o=t.view;o instanceof y&&await o.render()}}async ensureDefaultFiles(){await this.ensureFile(this.settings.todoInboxPath,E),await this.ensureFile(this.settings.workoutPlanPath,T),await this.ensureFile(this.settings.workoutLogPath,P)}async ensureFile(e,t){let o=(0,i.normalizePath)(e),s=this.app.vault.getAbstractFileByPath(o);if(s instanceof i.TFile)return;if(s)throw new Error(`Expected a file path but found a folder: ${o}`);let a=o.split("/").slice(0,-1).join("/");a&&await this.ensureFolder(a),await this.app.vault.create(o,t)}async ensureFolder(e){let t=(0,i.normalizePath)(e).split("/"),o="";for(let s of t){o=o?`${o}/${s}`:s;let a=this.app.vault.getAbstractFileByPath(o);if(a instanceof i.TFile)throw new Error(`Expected a folder path but found a file: ${o}`);a||await this.app.vault.createFolder(o)}}injectStyles(){var e;(e=this.styleEl)==null||e.remove(),this.styleEl=document.createElement("style"),this.styleEl.id="home-base-runtime-styles",this.styleEl.textContent=M,document.head.appendChild(this.styleEl)}},y=class extends i.ItemView{constructor(e,t){super(e),this.plugin=t}getViewType(){return g}getDisplayText(){return"Home Base"}getIcon(){return"home"}async onOpen(){await this.render()}async render(){let e=this.containerEl.children[1];e.empty(),e.addClass("home-base-view");let t=await this.loadTodos(),o=await this.loadWorkoutPlan(),s=await this.loadWorkoutLog(),a=this.getWorkoutState(o,s);this.renderHeader(e);let n=e.createDiv({cls:"home-base-grid"}),c=n.createDiv({cls:"home-base-column home-base-left"}),d=n.createDiv({cls:"home-base-column home-base-right"});this.plugin.settings.showSchedulePlaceholder&&this.renderSchedule(c),this.renderWorkout(c,o,a),this.renderTodos(d,t)}renderHeader(e){let t=e.createDiv({cls:"home-base-header"}),o=new Date,s=t.createDiv();s.createEl("h1",{text:"Home Base"}),s.createDiv({cls:"home-base-date",text:o.toLocaleDateString(void 0,{weekday:"long",year:"numeric",month:"long",day:"numeric"})}),s.createDiv({cls:"home-base-greeting",text:this.getGreeting()});let a=t.createEl("button",{cls:"home-base-icon-button",attr:{"aria-label":"Refresh"}});a.setText("Refresh"),a.onClickEvent(()=>void this.render())}renderSchedule(e){let t=e.createDiv({cls:"home-base-panel"}),o=t.createDiv({cls:"home-base-panel-title"});o.createEl("span",{cls:"home-base-icon",text:"Cal"}),o.createEl("h2",{text:"Schedule"}),o.createEl("span",{cls:"home-base-pill",text:"Coming soon"});let s=t.createDiv({cls:"home-base-schedule-empty"});s.createDiv({cls:"home-base-calendar-mark",text:"Calendar"});let a=s.createDiv();a.createEl("strong",{text:"Calendar integration planned"}),a.createEl("p",{text:"View your events and time blocks right here in the future."}),t.createEl("h3",{text:"Today (preview)"}),t.createEl("p",{cls:"home-base-muted home-base-italic",text:"No events scheduled"})}renderTodos(e,t){let o=e.createDiv({cls:"home-base-panel home-base-todo-panel"}),s=o.createDiv({cls:"home-base-panel-title home-base-todo-title"});s.createEl("span",{cls:"home-base-icon",text:"Task"}),s.createEl("h2",{text:"Todo Manager"});let a=o.createDiv({cls:"home-base-todo-controls"}),n=a.createEl("input",{cls:"home-base-quick-add",attr:{"aria-label":"Quick add todo",placeholder:N}});n.type="text",n.onkeydown=l=>{l.key==="Enter"&&(l.preventDefault(),this.createQuickTodo(n))},a.createEl("button",{cls:"mod-cta home-base-primary-button",text:"+ New Todo"}).onClickEvent(()=>{new v(this.app,this.plugin,void 0,()=>void this.render()).open()});let d=this.groupTodos(t);for(let l of["Overdue","Today","Tomorrow","Next 7 Days","No Due Date","Later"]){let u=d[l];if(!u.length&&l==="Later")continue;let h=o.createDiv({cls:"home-base-todo-group"});if(h.createEl("h3",{text:l}),!u.length){h.createEl("p",{cls:"home-base-muted home-base-italic",text:l==="Tomorrow"?"No todos due tomorrow":`No todos in ${l.toLowerCase()}`});continue}for(let p of u)this.renderTodoItem(h,p)}}renderTodoItem(e,t){let o=e.createDiv({cls:`home-base-todo-item ${t.completed?"is-complete":""}`}),s=o.createEl("input",{cls:"home-base-checkbox"});s.type="checkbox",s.checked=t.completed,s.onClickEvent(async()=>{await this.setTodoCompletion(t,s.checked),await this.render()});let a=o.createDiv({cls:"home-base-todo-body"});a.createDiv({cls:"home-base-todo-name",text:t.title});let n=a.createDiv({cls:"home-base-todo-meta"});n.createEl("span",{cls:"home-base-due",text:t.due?this.formatDue(t.due):"No due date"}),t.priority&&n.createEl("span",{cls:`home-base-priority is-${t.priority}`,text:this.capitalize(t.priority)});for(let u of t.tags)n.createEl("span",{cls:"home-base-tag",text:u});let c=o.createDiv({cls:"home-base-actions"});c.createEl("button",{cls:"home-base-ghost-button",text:"Edit"}).onClickEvent(()=>new v(this.app,this.plugin,t,()=>void this.render()).open()),c.createEl("button",{cls:"home-base-ghost-button",text:"Delete"}).onClickEvent(async()=>{await this.deleteTodo(t),await this.render()})}async createQuickTodo(e){let t=V(e.value);if(!t){new i.Notice("Add a todo title before saving."),e.focus();return}await q(this.app,this.plugin,L(t)),e.value="",new i.Notice("Todo added."),await this.render()}renderWorkout(e,t,o){var p;let s=e.createDiv({cls:"home-base-panel"}),a=s.createDiv({cls:"home-base-panel-title"});if(a.createEl("span",{cls:"home-base-icon",text:"Fit"}),a.createEl("h2",{text:"Workout"}),o.unresolved){let m=s.createDiv({cls:"home-base-unresolved"});m.createDiv({text:`Yesterday's workout was not resolved: ${o.unresolved.workout}`});let b=m.createDiv({cls:"home-base-unresolved-actions"});b.createEl("button",{text:"Mark Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(o.unresolved.date,o.unresolved.workout,"done"),await this.render()}),b.createEl("button",{text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(o.unresolved.date,o.unresolved.workout,"skipped"),await this.render()}),b.createEl("button",{text:"Keep Pending"}).onClickEvent(async()=>{new i.Notice("Kept as pending.")})}s.createEl("h3",{text:"Today's Workout"}),s.createEl("div",{cls:"home-base-workout-name",text:o.todayWorkout});let n=(p=t.types[o.todayWorkout])!=null?p:[];if(n.length){let m=s.createEl("ul",{cls:"home-base-exercises"});for(let b of n)m.createEl("li",{text:b})}else s.createEl("p",{cls:"home-base-muted",text:"No exercises configured for this workout."});s.createEl("button",{cls:"home-base-wide-button",text:"Edit Routine"}).onClickEvent(()=>{new w(this.app,this.plugin,t,()=>void this.render()).open()});let d=s.createDiv({cls:"home-base-workout-actions"});d.createEl("button",{cls:"mod-cta home-base-primary-button",text:"Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),o.todayWorkout,"done"),await this.render()}),d.createEl("button",{cls:"home-base-secondary-button",text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),o.todayWorkout,"skipped"),await this.render()});let h=s.createDiv({cls:"home-base-sequence"});h.createEl("h3",{text:"Routine Sequence"}),h.createDiv({text:t.sequence.length?t.sequence.join(" > "):"No sequence configured"})}async loadTodos(){let e=this.plugin.settings.todoScanFolders.split(",").map(s=>(0,i.normalizePath)(s.trim())).filter(Boolean),t=this.app.vault.getMarkdownFiles().filter(s=>e.length?e.some(a=>s.path===a||s.path.startsWith(`${a}/`)):!0),o=[];for(let s of t)(await this.app.vault.cachedRead(s)).split(`
`).forEach((c,d)=>{let l=this.parseTodoLine(c,s,d);l&&o.push(l)});return o.sort((s,a)=>this.compareTodos(s,a))}parseTodoLine(e,t,o){var u,h,p,m;let s=e.match(/^\s*[-*]\s+\[( |x|X)]\s+(.+)$/);if(!s)return null;let a=s[1].toLowerCase()==="x",n=s[2].trim(),c=n.match(/\sdue::\s*(\d{4}-\d{2}-\d{2})/),d=n.match(/\spriority::\s*(high|medium|low)/i),l=(u=n.match(/#[\w/-]+/g))!=null?u:[];return n=n.replace(/\sdue::\s*\d{4}-\d{2}-\d{2}/,"").replace(/\spriority::\s*(high|medium|low)/i,"").replace(/#[\w/-]+/g,"").trim(),{id:`${t.path}:${o}`,title:n,due:(h=c==null?void 0:c[1])!=null?h:"",priority:(m=(p=d==null?void 0:d[1])==null?void 0:p.toLowerCase())!=null?m:"",tags:l,completed:a,file:t,line:o,raw:e}}groupTodos(e){let t={Overdue:[],Today:[],Tomorrow:[],"Next 7 Days":[],"No Due Date":[],Later:[]},o=this.startOfDay(new Date),s=this.addDays(o,1),a=this.addDays(o,7);for(let n of e.filter(c=>!c.completed)){if(!n.due){t["No Due Date"].push(n);continue}let c=this.parseDate(n.due);c<o?t.Overdue.push(n):c.getTime()===o.getTime()?t.Today.push(n):c.getTime()===s.getTime()?t.Tomorrow.push(n):c<=a?t["Next 7 Days"].push(n):t.Later.push(n)}return t}async loadWorkoutPlan(){await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,T);let e=this.app.vault.getAbstractFileByPath((0,i.normalizePath)(this.plugin.settings.workoutPlanPath));if(!(e instanceof i.TFile))return{types:{},sequence:[]};let o=(await this.app.vault.cachedRead(e)).split(`
`),s={},a=[],n="",c="";for(let d of o){let l=d.trim();if(/^#\s+Workout Types/i.test(l)){n="types",c="";continue}if(/^#\s+Sequence/i.test(l)){n="sequence",c="";continue}if(n==="types"&&l.startsWith("## ")){c=l.replace(/^##\s+/,"").trim(),s[c]=[];continue}if(n==="types"&&c){let u=l.replace(/^[-*]\s+/,"").trim();u&&s[c].push(u)}n==="sequence"&&/^[-*]\s+/.test(l)&&a.push(l.replace(/^[-*]\s+/,"").trim())}return{types:s,sequence:a}}async loadWorkoutLog(){await this.plugin.ensureFile(this.plugin.settings.workoutLogPath,P);let e=this.app.vault.getAbstractFileByPath((0,i.normalizePath)(this.plugin.settings.workoutLogPath));return e instanceof i.TFile?(await this.app.vault.cachedRead(e)).split(`
`).map(o=>{var c,d,l,u;let s=(c=o.match(/date::\s*(\d{4}-\d{2}-\d{2})/))==null?void 0:c[1],a=(l=(d=o.match(/workout::\s*([^]+?)\s+status::/))==null?void 0:d[1])==null?void 0:l.trim(),n=(u=o.match(/status::\s*(done|skipped|pending)/))==null?void 0:u[1];return!s||!a||!n?null:{date:s,workout:a,status:n}}).filter(o=>!!o):[]}getWorkoutState(e,t){let o=e.sequence.length?e.sequence:Object.keys(e.types),s=t.filter(l=>l.status==="done").length,a=o.length?o[s%o.length]:"No workout configured",n=this.dateKey(this.addDays(new Date,-1)),d=t.filter(l=>l.date===n).length?null:{date:n,workout:a};return{todayWorkout:a,unresolved:d}}async appendWorkoutLog(e,t,o){let s=this.app.vault.getAbstractFileByPath((0,i.normalizePath)(this.plugin.settings.workoutLogPath));if(!(s instanceof i.TFile))return;let a=await this.app.vault.cachedRead(s),n=`- date:: ${e} workout:: ${t} status:: ${o}`;await this.app.vault.modify(s,`${a.trimEnd()}
${n}
`),new i.Notice(`Workout marked ${o}.`)}async setTodoCompletion(e,t){let s=(await this.app.vault.cachedRead(e.file)).split(`
`);s[e.line]=e.raw.replace(/\[( |x|X)]/,t?"[x]":"[ ]"),await this.app.vault.modify(e.file,s.join(`
`))}async deleteTodo(e){if(!confirm(`Delete "${e.title}"?`))return;let s=(await this.app.vault.cachedRead(e.file)).split(`
`);s.splice(e.line,1),await this.app.vault.modify(e.file,s.join(`
`))}compareTodos(e,t){let o=e.due||"9999-12-31",s=t.due||"9999-12-31";if(o!==s)return o.localeCompare(s);let a={high:0,medium:1,low:2,"":3};return a[e.priority]-a[t.priority]}formatDue(e){let t=this.todayKey();return e===t?"Today":e===this.dateKey(this.addDays(new Date,1))?"Tomorrow":new Date(`${e}T00:00:00`).toLocaleDateString(void 0,{month:"short",day:"numeric"})}getGreeting(){let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"}parseDate(e){return new Date(`${e}T00:00:00`)}startOfDay(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}addDays(e,t){let o=new Date(e);return o.setDate(o.getDate()+t),this.startOfDay(o)}todayKey(){return this.dateKey(new Date)}dateKey(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}capitalize(e){return e.charAt(0).toUpperCase()+e.slice(1)}};async function q(r,e,t){await e.ensureFile(e.settings.todoInboxPath,E);let o=r.vault.getAbstractFileByPath((0,i.normalizePath)(e.settings.todoInboxPath));if(!(o instanceof i.TFile))return;let s=await r.vault.cachedRead(o);await r.vault.modify(o,`${s.trimEnd()}
${t}
`)}var v=class extends i.Modal{constructor(t,o,s,a){super(t);this.titleValue="";this.dueValue="";this.priorityValue="medium";this.tagsValue="";this.plugin=o,this.todo=s,this.onSave=a,s&&(this.titleValue=s.title,this.dueValue=s.due,this.priorityValue=s.priority||"medium",this.tagsValue=s.tags.join(" "))}onOpen(){let{contentEl:t}=this;t.empty(),t.addClass("home-base-modal"),t.createEl("h2",{text:this.todo?"Edit Todo":"New Todo"}),new i.Setting(t).setName("Title").addText(o=>{o.setValue(this.titleValue),o.onChange(s=>{this.titleValue=s})}),new i.Setting(t).setName("Due date").addText(o=>{o.inputEl.type="date",o.setValue(this.dueValue),o.onChange(s=>{this.dueValue=s})}),new i.Setting(t).setName("Priority").addDropdown(o=>{o.addOption("high","High").addOption("medium","Medium").addOption("low","Low").setValue(this.priorityValue||"medium").onChange(s=>{this.priorityValue=s})}),new i.Setting(t).setName("Tags").setDesc("Use Markdown tags, for example #school #writing.").addText(o=>{o.setPlaceholder("#school #writing"),o.setValue(this.tagsValue),o.onChange(s=>{this.tagsValue=s})}),new i.Setting(t).addButton(o=>{o.setButtonText("Cancel").onClick(()=>this.close())}).addButton(o=>{o.setButtonText("Save").setCta().onClick(()=>void this.saveTodo())})}async saveTodo(){if(!this.titleValue.trim()){new i.Notice("Todo title is required.");return}let t=this.formatTodoLine();if(this.todo){let s=(await this.app.vault.cachedRead(this.todo.file)).split(`
`);s[this.todo.line]=t.replace("- [ ]",this.todo.completed?"- [x]":"- [ ]"),await this.app.vault.modify(this.todo.file,s.join(`
`))}else await q(this.app,this.plugin,t);this.close(),this.onSave()}formatTodoLine(){return L({title:this.titleValue.trim(),due:this.dueValue,priority:this.priorityValue,tags:S(this.tagsValue.split(/\s+/))})}},w=class extends i.Modal{constructor(e,t,o,s){super(e),this.plugin=t,this.plan={types:Object.fromEntries(Object.entries(o.types).map(([a,n])=>[a,[...n]])),sequence:[...o.sequence]},this.onSave=s}onOpen(){this.render()}render(){let{contentEl:e}=this;e.empty(),e.addClass("home-base-modal","home-base-routine-modal"),e.createEl("h2",{text:"Edit Workout Routine"});let t=e.createDiv({cls:"home-base-routine-section"}),o=t.createDiv({cls:"home-base-routine-section-header"});o.createEl("h3",{text:"Workout Types"}),o.createEl("button",{text:"+ Add Type"}).onClickEvent(()=>{let p=this.uniqueWorkoutName("New Workout");this.plan.types[p]=[],this.plan.sequence.push(p),this.render()});let a=Object.keys(this.plan.types);a.length||t.createEl("p",{cls:"home-base-muted home-base-italic",text:"Create a workout type to start your sequence."});for(let p of a)this.renderWorkoutType(t,p);let n=e.createDiv({cls:"home-base-routine-section"}),c=n.createDiv({cls:"home-base-routine-section-header"});c.createEl("h3",{text:"Sequence Order"});let d=c.createEl("button",{text:"+ Add Step"});d.disabled=!a.length,d.onClickEvent(()=>{let p=Object.keys(this.plan.types)[0];p&&(this.plan.sequence.push(p),this.render())}),this.plan.sequence.length||n.createEl("p",{cls:"home-base-muted home-base-italic",text:"No sequence steps yet."}),this.plan.sequence.forEach((p,m)=>{this.renderSequenceStep(n,p,m)});let l=e.createDiv({cls:"home-base-modal-footer"});l.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),l.createEl("button",{cls:"mod-cta",text:"Save Routine"}).onClickEvent(()=>void this.saveRoutine())}renderWorkoutType(e,t){let o=e.createDiv({cls:"home-base-routine-card"}),s=o.createDiv({cls:"home-base-routine-card-row"}),a=s.createEl("input",{cls:"home-base-routine-name"});a.type="text",a.value=t,a.placeholder="Workout name",a.onchange=()=>{this.renameWorkoutType(t,a.value.trim())},s.createEl("button",{text:"Delete"}).onClickEvent(()=>{delete this.plan.types[t],this.plan.sequence=this.plan.sequence.filter(d=>d!==t),this.render()});let c=o.createEl("textarea",{cls:"home-base-routine-exercises"});c.placeholder="One exercise per line",c.value=this.plan.types[t].join(`
`),c.onchange=()=>{this.plan.types[t]=c.value.split(`
`).map(d=>d.trim()).filter(Boolean)}}renderSequenceStep(e,t,o){let s=e.createDiv({cls:"home-base-sequence-row"});s.createEl("span",{cls:"home-base-sequence-index",text:`${o+1}`});let a=s.createEl("select");for(let l of Object.keys(this.plan.types)){let u=a.createEl("option",{text:l,value:l});u.selected=l===t}a.onchange=()=>{this.plan.sequence[o]=a.value};let n=s.createEl("button",{text:"Up"});n.disabled=o===0,n.onClickEvent(()=>{this.moveSequenceStep(o,o-1),this.render()});let c=s.createEl("button",{text:"Down"});c.disabled=o===this.plan.sequence.length-1,c.onClickEvent(()=>{this.moveSequenceStep(o,o+1),this.render()}),s.createEl("button",{text:"Remove"}).onClickEvent(()=>{this.plan.sequence.splice(o,1),this.render()})}renameWorkoutType(e,t){if(!t||t===e)return;if(this.plan.types[t]){new i.Notice("A workout type with that name already exists."),this.render();return}let o=Object.entries(this.plan.types);this.plan.types=Object.fromEntries(o.map(([s,a])=>s===e?[t,a]:[s,a])),this.plan.sequence=this.plan.sequence.map(s=>s===e?t:s),this.render()}moveSequenceStep(e,t){let[o]=this.plan.sequence.splice(e,1);this.plan.sequence.splice(t,0,o)}uniqueWorkoutName(e){if(!this.plan.types[e])return e;let t=2;for(;this.plan.types[`${e} ${t}`];)t+=1;return`${e} ${t}`}async saveRoutine(){let e=Object.keys(this.plan.types).filter(Boolean);if(!e.length){new i.Notice("Add at least one workout type.");return}this.plan.sequence=this.plan.sequence.filter(o=>!!this.plan.types[o]),this.plan.sequence.length||(this.plan.sequence=[e[0]]),await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,T);let t=this.app.vault.getAbstractFileByPath((0,i.normalizePath)(this.plugin.settings.workoutPlanPath));t instanceof i.TFile&&(await this.app.vault.modify(t,this.formatWorkoutPlan()),new i.Notice("Workout routine saved."),this.close(),this.onSave())}formatWorkoutPlan(){let e=["# Workout Types",""];for(let[t,o]of Object.entries(this.plan.types))e.push(`## ${t}`),o.length?e.push(...o.map(s=>`- ${s}`)):e.push("Rest day"),e.push("");return e.push("# Sequence",""),e.push(...this.plan.sequence.map(t=>`- ${t}`)),e.push(""),e.join(`
`)}},k=class extends i.PluginSettingTab{constructor(e,t){super(e,t),this.plugin=t}display(){let{containerEl:e}=this;e.empty(),e.createEl("h2",{text:"Home Base Settings"}),new i.Setting(e).setName("Open on startup").setDesc("Automatically open the Home Base dashboard when Obsidian starts.").addToggle(t=>{t.setValue(this.plugin.settings.openOnStartup).onChange(async o=>{this.plugin.settings.openOnStartup=o,await this.plugin.saveSettings()})}),new i.Setting(e).setName("Todo inbox file").setDesc("New todos created from the dashboard are saved here.").addText(t=>{t.setValue(this.plugin.settings.todoInboxPath).onChange(async o=>{this.plugin.settings.todoInboxPath=(0,i.normalizePath)(o),await this.plugin.saveSettings()})}),new i.Setting(e).setName("Todo scan folders").setDesc("Comma-separated folders to scan for Markdown todos. Leave blank to scan the whole vault.").addText(t=>{t.setValue(this.plugin.settings.todoScanFolders).onChange(async o=>{this.plugin.settings.todoScanFolders=o,await this.plugin.saveSettings()})}),new i.Setting(e).setName("Workout plan file").addText(t=>{t.setValue(this.plugin.settings.workoutPlanPath).onChange(async o=>{this.plugin.settings.workoutPlanPath=(0,i.normalizePath)(o),await this.plugin.saveSettings()})}),new i.Setting(e).setName("Workout log file").addText(t=>{t.setValue(this.plugin.settings.workoutLogPath).onChange(async o=>{this.plugin.settings.workoutLogPath=(0,i.normalizePath)(o),await this.plugin.saveSettings()})}),new i.Setting(e).setName("Show schedule placeholder").setDesc("Keep a disabled schedule panel visible until calendar support is implemented.").addToggle(t=>{t.setValue(this.plugin.settings.showSchedulePlaceholder).onChange(async o=>{this.plugin.settings.showSchedulePlaceholder=o,await this.plugin.saveSettings()})})}};
