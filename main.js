/* Home Base Obsidian plugin */
var x=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var S=Object.getOwnPropertyNames;var L=Object.prototype.hasOwnProperty;var W=(h,e)=>{for(var o in e)x(h,o,{get:e[o],enumerable:!0})},q=(h,e,o,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of S(e))!L.call(h,s)&&s!==o&&x(h,s,{get:()=>e[s],enumerable:!(t=P(e,s))||t.enumerable});return h};var C=h=>q(x({},"__esModule",{value:!0}),h);var $={};W($,{default:()=>y});module.exports=C($);var i=require("obsidian"),g="home-base-dashboard",O={openOnStartup:!0,todoInboxPath:"Home Base/Todo Inbox.md",todoScanFolders:"Home Base",workoutPlanPath:"Home Base/Workout Plan.md",workoutLogPath:"Home Base/Workout Log.md",showSchedulePlaceholder:!0},T=`# Todo Inbox

`,E=`# Workout Types

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
`,D=`# Workout Log

`,B=`
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

  .home-base-actions {
    grid-column: 2;
  }

  .home-base-routine-card-row,
  .home-base-sequence-row {
    align-items: stretch;
    flex-direction: column;
  }
}
`,y=class extends i.Plugin{async onload(){this.settings=Object.assign({},O,await this.loadData()),this.injectStyles(),this.registerView(g,e=>new f(e,this)),this.addRibbonIcon("home","Open Home Base",()=>{this.openDashboard()}),this.addCommand({id:"open-home-base",name:"Open Home Base",callback:()=>void this.openDashboard()}),this.addCommand({id:"refresh-home-base",name:"Refresh Home Base",callback:()=>void this.refreshDashboard()}),this.addSettingTab(new k(this.app,this)),await this.ensureDefaultFiles().catch(e=>{console.warn("Home Base could not create one or more default files.",e)}),this.settings.openOnStartup&&this.app.workspace.onLayoutReady(()=>{this.openDashboard()})}onunload(){var e;this.app.workspace.detachLeavesOfType(g),(e=this.styleEl)==null||e.remove()}async saveSettings(){await this.saveData(this.settings)}async openDashboard(){let e=this.app.workspace.getLeavesOfType(g)[0];if(e){this.app.workspace.revealLeaf(e);return}let o=this.app.workspace.getLeaf("tab");await o.setViewState({type:g,active:!0}),this.app.workspace.revealLeaf(o)}async refreshDashboard(){let e=this.app.workspace.getLeavesOfType(g);for(let o of e){let t=o.view;t instanceof f&&await t.render()}}async ensureDefaultFiles(){await this.ensureFile(this.settings.todoInboxPath,T),await this.ensureFile(this.settings.workoutPlanPath,E),await this.ensureFile(this.settings.workoutLogPath,D)}async ensureFile(e,o){let t=(0,i.normalizePath)(e),s=this.app.vault.getAbstractFileByPath(t);if(s instanceof i.TFile)return;if(s)throw new Error(`Expected a file path but found a folder: ${t}`);let a=t.split("/").slice(0,-1).join("/");a&&await this.ensureFolder(a),await this.app.vault.create(t,o)}async ensureFolder(e){let o=(0,i.normalizePath)(e).split("/"),t="";for(let s of o){t=t?`${t}/${s}`:s;let a=this.app.vault.getAbstractFileByPath(t);if(a instanceof i.TFile)throw new Error(`Expected a folder path but found a file: ${t}`);a||await this.app.vault.createFolder(t)}}injectStyles(){var e;(e=this.styleEl)==null||e.remove(),this.styleEl=document.createElement("style"),this.styleEl.id="home-base-runtime-styles",this.styleEl.textContent=B,document.head.appendChild(this.styleEl)}},f=class extends i.ItemView{constructor(e,o){super(e),this.plugin=o}getViewType(){return g}getDisplayText(){return"Home Base"}getIcon(){return"home"}async onOpen(){await this.render()}async render(){let e=this.containerEl.children[1];e.empty(),e.addClass("home-base-view");let o=await this.loadTodos(),t=await this.loadWorkoutPlan(),s=await this.loadWorkoutLog(),a=this.getWorkoutState(t,s);this.renderHeader(e);let n=e.createDiv({cls:"home-base-grid"}),r=n.createDiv({cls:"home-base-column home-base-left"}),c=n.createDiv({cls:"home-base-column home-base-right"});this.plugin.settings.showSchedulePlaceholder&&this.renderSchedule(r),this.renderWorkout(r,t,a),this.renderTodos(c,o)}renderHeader(e){let o=e.createDiv({cls:"home-base-header"}),t=new Date,s=o.createDiv();s.createEl("h1",{text:"Home Base"}),s.createDiv({cls:"home-base-date",text:t.toLocaleDateString(void 0,{weekday:"long",year:"numeric",month:"long",day:"numeric"})}),s.createDiv({cls:"home-base-greeting",text:this.getGreeting()});let a=o.createEl("button",{cls:"home-base-icon-button",attr:{"aria-label":"Refresh"}});a.setText("Refresh"),a.onClickEvent(()=>void this.render())}renderSchedule(e){let o=e.createDiv({cls:"home-base-panel"}),t=o.createDiv({cls:"home-base-panel-title"});t.createEl("span",{cls:"home-base-icon",text:"Cal"}),t.createEl("h2",{text:"Schedule"}),t.createEl("span",{cls:"home-base-pill",text:"Coming soon"});let s=o.createDiv({cls:"home-base-schedule-empty"});s.createDiv({cls:"home-base-calendar-mark",text:"Calendar"});let a=s.createDiv();a.createEl("strong",{text:"Calendar integration planned"}),a.createEl("p",{text:"View your events and time blocks right here in the future."}),o.createEl("h3",{text:"Today (preview)"}),o.createEl("p",{cls:"home-base-muted home-base-italic",text:"No events scheduled"})}renderTodos(e,o){let t=e.createDiv({cls:"home-base-panel home-base-todo-panel"}),s=t.createDiv({cls:"home-base-panel-title home-base-todo-title"});s.createEl("span",{cls:"home-base-icon",text:"Task"}),s.createEl("h2",{text:"Todo Manager"}),t.createDiv({cls:"home-base-todo-controls"}).createEl("button",{cls:"mod-cta home-base-primary-button",text:"+ New Todo"}).onClickEvent(()=>{new v(this.app,this.plugin,void 0,()=>void this.render()).open()});let r=this.groupTodos(o);for(let c of["Overdue","Today","Tomorrow","Next 7 Days","No Due Date","Later"]){let l=r[c];if(!l.length&&c==="Later")continue;let d=t.createDiv({cls:"home-base-todo-group"});if(d.createEl("h3",{text:c}),!l.length){d.createEl("p",{cls:"home-base-muted home-base-italic",text:c==="Tomorrow"?"No todos due tomorrow":`No todos in ${c.toLowerCase()}`});continue}for(let m of l)this.renderTodoItem(d,m)}}renderTodoItem(e,o){let t=e.createDiv({cls:`home-base-todo-item ${o.completed?"is-complete":""}`}),s=t.createEl("input",{cls:"home-base-checkbox"});s.type="checkbox",s.checked=o.completed,s.onClickEvent(async()=>{await this.setTodoCompletion(o,s.checked),await this.render()});let a=t.createDiv({cls:"home-base-todo-body"});a.createDiv({cls:"home-base-todo-name",text:o.title});let n=a.createDiv({cls:"home-base-todo-meta"});n.createEl("span",{cls:"home-base-due",text:o.due?this.formatDue(o.due):"No due date"}),o.priority&&n.createEl("span",{cls:`home-base-priority is-${o.priority}`,text:this.capitalize(o.priority)});for(let d of o.tags)n.createEl("span",{cls:"home-base-tag",text:d});let r=t.createDiv({cls:"home-base-actions"});r.createEl("button",{cls:"home-base-ghost-button",text:"Edit"}).onClickEvent(()=>new v(this.app,this.plugin,o,()=>void this.render()).open()),r.createEl("button",{cls:"home-base-ghost-button",text:"Delete"}).onClickEvent(async()=>{await this.deleteTodo(o),await this.render()})}renderWorkout(e,o,t){var p;let s=e.createDiv({cls:"home-base-panel"}),a=s.createDiv({cls:"home-base-panel-title"});if(a.createEl("span",{cls:"home-base-icon",text:"Fit"}),a.createEl("h2",{text:"Workout"}),t.unresolved){let u=s.createDiv({cls:"home-base-unresolved"});u.createDiv({text:`Yesterday's workout was not resolved: ${t.unresolved.workout}`});let b=u.createDiv({cls:"home-base-unresolved-actions"});b.createEl("button",{text:"Mark Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(t.unresolved.date,t.unresolved.workout,"done"),await this.render()}),b.createEl("button",{text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(t.unresolved.date,t.unresolved.workout,"skipped"),await this.render()}),b.createEl("button",{text:"Keep Pending"}).onClickEvent(async()=>{new i.Notice("Kept as pending.")})}s.createEl("h3",{text:"Today's Workout"}),s.createEl("div",{cls:"home-base-workout-name",text:t.todayWorkout});let n=(p=o.types[t.todayWorkout])!=null?p:[];if(n.length){let u=s.createEl("ul",{cls:"home-base-exercises"});for(let b of n)u.createEl("li",{text:b})}else s.createEl("p",{cls:"home-base-muted",text:"No exercises configured for this workout."});s.createEl("button",{cls:"home-base-wide-button",text:"Edit Routine"}).onClickEvent(()=>{new w(this.app,this.plugin,o,()=>void this.render()).open()});let c=s.createDiv({cls:"home-base-workout-actions"});c.createEl("button",{cls:"mod-cta home-base-primary-button",text:"Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),t.todayWorkout,"done"),await this.render()}),c.createEl("button",{cls:"home-base-secondary-button",text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),t.todayWorkout,"skipped"),await this.render()});let m=s.createDiv({cls:"home-base-sequence"});m.createEl("h3",{text:"Routine Sequence"}),m.createDiv({text:o.sequence.length?o.sequence.join(" > "):"No sequence configured"})}async loadTodos(){let e=this.plugin.settings.todoScanFolders.split(",").map(s=>(0,i.normalizePath)(s.trim())).filter(Boolean),o=this.app.vault.getMarkdownFiles().filter(s=>e.length?e.some(a=>s.path===a||s.path.startsWith(`${a}/`)):!0),t=[];for(let s of o)(await this.app.vault.cachedRead(s)).split(`
`).forEach((r,c)=>{let l=this.parseTodoLine(r,s,c);l&&t.push(l)});return t.sort((s,a)=>this.compareTodos(s,a))}parseTodoLine(e,o,t){var d,m,p,u;let s=e.match(/^\s*[-*]\s+\[( |x|X)]\s+(.+)$/);if(!s)return null;let a=s[1].toLowerCase()==="x",n=s[2].trim(),r=n.match(/\sdue::\s*(\d{4}-\d{2}-\d{2})/),c=n.match(/\spriority::\s*(high|medium|low)/i),l=(d=n.match(/#[\w/-]+/g))!=null?d:[];return n=n.replace(/\sdue::\s*\d{4}-\d{2}-\d{2}/,"").replace(/\spriority::\s*(high|medium|low)/i,"").replace(/#[\w/-]+/g,"").trim(),{id:`${o.path}:${t}`,title:n,due:(m=r==null?void 0:r[1])!=null?m:"",priority:(u=(p=c==null?void 0:c[1])==null?void 0:p.toLowerCase())!=null?u:"",tags:l,completed:a,file:o,line:t,raw:e}}groupTodos(e){let o={Overdue:[],Today:[],Tomorrow:[],"Next 7 Days":[],"No Due Date":[],Later:[]},t=this.startOfDay(new Date),s=this.addDays(t,1),a=this.addDays(t,7);for(let n of e.filter(r=>!r.completed)){if(!n.due){o["No Due Date"].push(n);continue}let r=this.parseDate(n.due);r<t?o.Overdue.push(n):r.getTime()===t.getTime()?o.Today.push(n):r.getTime()===s.getTime()?o.Tomorrow.push(n):r<=a?o["Next 7 Days"].push(n):o.Later.push(n)}return o}async loadWorkoutPlan(){await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,E);let e=this.app.vault.getAbstractFileByPath((0,i.normalizePath)(this.plugin.settings.workoutPlanPath));if(!(e instanceof i.TFile))return{types:{},sequence:[]};let t=(await this.app.vault.cachedRead(e)).split(`
`),s={},a=[],n="",r="";for(let c of t){let l=c.trim();if(/^#\s+Workout Types/i.test(l)){n="types",r="";continue}if(/^#\s+Sequence/i.test(l)){n="sequence",r="";continue}if(n==="types"&&l.startsWith("## ")){r=l.replace(/^##\s+/,"").trim(),s[r]=[];continue}if(n==="types"&&r){let d=l.replace(/^[-*]\s+/,"").trim();d&&s[r].push(d)}n==="sequence"&&/^[-*]\s+/.test(l)&&a.push(l.replace(/^[-*]\s+/,"").trim())}return{types:s,sequence:a}}async loadWorkoutLog(){await this.plugin.ensureFile(this.plugin.settings.workoutLogPath,D);let e=this.app.vault.getAbstractFileByPath((0,i.normalizePath)(this.plugin.settings.workoutLogPath));return e instanceof i.TFile?(await this.app.vault.cachedRead(e)).split(`
`).map(t=>{var r,c,l,d;let s=(r=t.match(/date::\s*(\d{4}-\d{2}-\d{2})/))==null?void 0:r[1],a=(l=(c=t.match(/workout::\s*([^]+?)\s+status::/))==null?void 0:c[1])==null?void 0:l.trim(),n=(d=t.match(/status::\s*(done|skipped|pending)/))==null?void 0:d[1];return!s||!a||!n?null:{date:s,workout:a,status:n}}).filter(t=>!!t):[]}getWorkoutState(e,o){let t=e.sequence.length?e.sequence:Object.keys(e.types),s=o.filter(l=>l.status==="done").length,a=t.length?t[s%t.length]:"No workout configured",n=this.dateKey(this.addDays(new Date,-1)),c=o.filter(l=>l.date===n).length?null:{date:n,workout:a};return{todayWorkout:a,unresolved:c}}async appendWorkoutLog(e,o,t){let s=this.app.vault.getAbstractFileByPath((0,i.normalizePath)(this.plugin.settings.workoutLogPath));if(!(s instanceof i.TFile))return;let a=await this.app.vault.cachedRead(s),n=`- date:: ${e} workout:: ${o} status:: ${t}`;await this.app.vault.modify(s,`${a.trimEnd()}
${n}
`),new i.Notice(`Workout marked ${t}.`)}async setTodoCompletion(e,o){let s=(await this.app.vault.cachedRead(e.file)).split(`
`);s[e.line]=e.raw.replace(/\[( |x|X)]/,o?"[x]":"[ ]"),await this.app.vault.modify(e.file,s.join(`
`))}async deleteTodo(e){if(!confirm(`Delete "${e.title}"?`))return;let s=(await this.app.vault.cachedRead(e.file)).split(`
`);s.splice(e.line,1),await this.app.vault.modify(e.file,s.join(`
`))}compareTodos(e,o){let t=e.due||"9999-12-31",s=o.due||"9999-12-31";if(t!==s)return t.localeCompare(s);let a={high:0,medium:1,low:2,"":3};return a[e.priority]-a[o.priority]}formatDue(e){let o=this.todayKey();return e===o?"Today":e===this.dateKey(this.addDays(new Date,1))?"Tomorrow":new Date(`${e}T00:00:00`).toLocaleDateString(void 0,{month:"short",day:"numeric"})}getGreeting(){let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"}parseDate(e){return new Date(`${e}T00:00:00`)}startOfDay(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}addDays(e,o){let t=new Date(e);return t.setDate(t.getDate()+o),this.startOfDay(t)}todayKey(){return this.dateKey(new Date)}dateKey(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}capitalize(e){return e.charAt(0).toUpperCase()+e.slice(1)}},v=class extends i.Modal{constructor(o,t,s,a){super(o);this.titleValue="";this.dueValue="";this.priorityValue="medium";this.tagsValue="";this.plugin=t,this.todo=s,this.onSave=a,s&&(this.titleValue=s.title,this.dueValue=s.due,this.priorityValue=s.priority||"medium",this.tagsValue=s.tags.join(" "))}onOpen(){let{contentEl:o}=this;o.empty(),o.addClass("home-base-modal"),o.createEl("h2",{text:this.todo?"Edit Todo":"New Todo"}),new i.Setting(o).setName("Title").addText(t=>{t.setValue(this.titleValue),t.onChange(s=>{this.titleValue=s})}),new i.Setting(o).setName("Due date").addText(t=>{t.inputEl.type="date",t.setValue(this.dueValue),t.onChange(s=>{this.dueValue=s})}),new i.Setting(o).setName("Priority").addDropdown(t=>{t.addOption("high","High").addOption("medium","Medium").addOption("low","Low").setValue(this.priorityValue||"medium").onChange(s=>{this.priorityValue=s})}),new i.Setting(o).setName("Tags").setDesc("Use Markdown tags, for example #school #writing.").addText(t=>{t.setPlaceholder("#school #writing"),t.setValue(this.tagsValue),t.onChange(s=>{this.tagsValue=s})}),new i.Setting(o).addButton(t=>{t.setButtonText("Cancel").onClick(()=>this.close())}).addButton(t=>{t.setButtonText("Save").setCta().onClick(()=>void this.saveTodo())})}async saveTodo(){if(!this.titleValue.trim()){new i.Notice("Todo title is required.");return}let o=this.formatTodoLine();if(this.todo){let s=(await this.app.vault.cachedRead(this.todo.file)).split(`
`);s[this.todo.line]=o.replace("- [ ]",this.todo.completed?"- [x]":"- [ ]"),await this.app.vault.modify(this.todo.file,s.join(`
`))}else{await this.plugin.ensureFile(this.plugin.settings.todoInboxPath,T);let t=this.app.vault.getAbstractFileByPath((0,i.normalizePath)(this.plugin.settings.todoInboxPath));if(!(t instanceof i.TFile))return;let s=await this.app.vault.cachedRead(t);await this.app.vault.modify(t,`${s.trimEnd()}
${o}
`)}this.close(),this.onSave()}formatTodoLine(){let o=this.tagsValue.split(/\s+/).filter(Boolean).map(n=>n.startsWith("#")?n:`#${n}`).join(" "),t=this.dueValue?` due:: ${this.dueValue}`:"",s=this.priorityValue?` priority:: ${this.priorityValue}`:"",a=o?` ${o}`:"";return`- [ ] ${this.titleValue.trim()}${t}${s}${a}`}},w=class extends i.Modal{constructor(e,o,t,s){super(e),this.plugin=o,this.plan={types:Object.fromEntries(Object.entries(t.types).map(([a,n])=>[a,[...n]])),sequence:[...t.sequence]},this.onSave=s}onOpen(){this.render()}render(){let{contentEl:e}=this;e.empty(),e.addClass("home-base-modal","home-base-routine-modal"),e.createEl("h2",{text:"Edit Workout Routine"});let o=e.createDiv({cls:"home-base-routine-section"}),t=o.createDiv({cls:"home-base-routine-section-header"});t.createEl("h3",{text:"Workout Types"}),t.createEl("button",{text:"+ Add Type"}).onClickEvent(()=>{let p=this.uniqueWorkoutName("New Workout");this.plan.types[p]=[],this.plan.sequence.push(p),this.render()});let a=Object.keys(this.plan.types);a.length||o.createEl("p",{cls:"home-base-muted home-base-italic",text:"Create a workout type to start your sequence."});for(let p of a)this.renderWorkoutType(o,p);let n=e.createDiv({cls:"home-base-routine-section"}),r=n.createDiv({cls:"home-base-routine-section-header"});r.createEl("h3",{text:"Sequence Order"});let c=r.createEl("button",{text:"+ Add Step"});c.disabled=!a.length,c.onClickEvent(()=>{let p=Object.keys(this.plan.types)[0];p&&(this.plan.sequence.push(p),this.render())}),this.plan.sequence.length||n.createEl("p",{cls:"home-base-muted home-base-italic",text:"No sequence steps yet."}),this.plan.sequence.forEach((p,u)=>{this.renderSequenceStep(n,p,u)});let l=e.createDiv({cls:"home-base-modal-footer"});l.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),l.createEl("button",{cls:"mod-cta",text:"Save Routine"}).onClickEvent(()=>void this.saveRoutine())}renderWorkoutType(e,o){let t=e.createDiv({cls:"home-base-routine-card"}),s=t.createDiv({cls:"home-base-routine-card-row"}),a=s.createEl("input",{cls:"home-base-routine-name"});a.type="text",a.value=o,a.placeholder="Workout name",a.onchange=()=>{this.renameWorkoutType(o,a.value.trim())},s.createEl("button",{text:"Delete"}).onClickEvent(()=>{delete this.plan.types[o],this.plan.sequence=this.plan.sequence.filter(c=>c!==o),this.render()});let r=t.createEl("textarea",{cls:"home-base-routine-exercises"});r.placeholder="One exercise per line",r.value=this.plan.types[o].join(`
`),r.onchange=()=>{this.plan.types[o]=r.value.split(`
`).map(c=>c.trim()).filter(Boolean)}}renderSequenceStep(e,o,t){let s=e.createDiv({cls:"home-base-sequence-row"});s.createEl("span",{cls:"home-base-sequence-index",text:`${t+1}`});let a=s.createEl("select");for(let l of Object.keys(this.plan.types)){let d=a.createEl("option",{text:l,value:l});d.selected=l===o}a.onchange=()=>{this.plan.sequence[t]=a.value};let n=s.createEl("button",{text:"Up"});n.disabled=t===0,n.onClickEvent(()=>{this.moveSequenceStep(t,t-1),this.render()});let r=s.createEl("button",{text:"Down"});r.disabled=t===this.plan.sequence.length-1,r.onClickEvent(()=>{this.moveSequenceStep(t,t+1),this.render()}),s.createEl("button",{text:"Remove"}).onClickEvent(()=>{this.plan.sequence.splice(t,1),this.render()})}renameWorkoutType(e,o){if(!o||o===e)return;if(this.plan.types[o]){new i.Notice("A workout type with that name already exists."),this.render();return}let t=Object.entries(this.plan.types);this.plan.types=Object.fromEntries(t.map(([s,a])=>s===e?[o,a]:[s,a])),this.plan.sequence=this.plan.sequence.map(s=>s===e?o:s),this.render()}moveSequenceStep(e,o){let[t]=this.plan.sequence.splice(e,1);this.plan.sequence.splice(o,0,t)}uniqueWorkoutName(e){if(!this.plan.types[e])return e;let o=2;for(;this.plan.types[`${e} ${o}`];)o+=1;return`${e} ${o}`}async saveRoutine(){let e=Object.keys(this.plan.types).filter(Boolean);if(!e.length){new i.Notice("Add at least one workout type.");return}this.plan.sequence=this.plan.sequence.filter(t=>!!this.plan.types[t]),this.plan.sequence.length||(this.plan.sequence=[e[0]]),await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,E);let o=this.app.vault.getAbstractFileByPath((0,i.normalizePath)(this.plugin.settings.workoutPlanPath));o instanceof i.TFile&&(await this.app.vault.modify(o,this.formatWorkoutPlan()),new i.Notice("Workout routine saved."),this.close(),this.onSave())}formatWorkoutPlan(){let e=["# Workout Types",""];for(let[o,t]of Object.entries(this.plan.types))e.push(`## ${o}`),t.length?e.push(...t.map(s=>`- ${s}`)):e.push("Rest day"),e.push("");return e.push("# Sequence",""),e.push(...this.plan.sequence.map(o=>`- ${o}`)),e.push(""),e.join(`
`)}},k=class extends i.PluginSettingTab{constructor(e,o){super(e,o),this.plugin=o}display(){let{containerEl:e}=this;e.empty(),e.createEl("h2",{text:"Home Base Settings"}),new i.Setting(e).setName("Open on startup").setDesc("Automatically open the Home Base dashboard when Obsidian starts.").addToggle(o=>{o.setValue(this.plugin.settings.openOnStartup).onChange(async t=>{this.plugin.settings.openOnStartup=t,await this.plugin.saveSettings()})}),new i.Setting(e).setName("Todo inbox file").setDesc("New todos created from the dashboard are saved here.").addText(o=>{o.setValue(this.plugin.settings.todoInboxPath).onChange(async t=>{this.plugin.settings.todoInboxPath=(0,i.normalizePath)(t),await this.plugin.saveSettings()})}),new i.Setting(e).setName("Todo scan folders").setDesc("Comma-separated folders to scan for Markdown todos. Leave blank to scan the whole vault.").addText(o=>{o.setValue(this.plugin.settings.todoScanFolders).onChange(async t=>{this.plugin.settings.todoScanFolders=t,await this.plugin.saveSettings()})}),new i.Setting(e).setName("Workout plan file").addText(o=>{o.setValue(this.plugin.settings.workoutPlanPath).onChange(async t=>{this.plugin.settings.workoutPlanPath=(0,i.normalizePath)(t),await this.plugin.saveSettings()})}),new i.Setting(e).setName("Workout log file").addText(o=>{o.setValue(this.plugin.settings.workoutLogPath).onChange(async t=>{this.plugin.settings.workoutLogPath=(0,i.normalizePath)(t),await this.plugin.saveSettings()})}),new i.Setting(e).setName("Show schedule placeholder").setDesc("Keep a disabled schedule panel visible until calendar support is implemented.").addToggle(o=>{o.setValue(this.plugin.settings.showSchedulePlaceholder).onChange(async t=>{this.plugin.settings.showSchedulePlaceholder=t,await this.plugin.saveSettings()})})}};
