/* Home Base Obsidian plugin */
var A=Object.defineProperty;var ne=Object.getOwnPropertyDescriptor;var se=Object.getOwnPropertyNames;var re=Object.prototype.hasOwnProperty;var oe=(o,t)=>{for(var e in t)A(o,e,{get:t[e],enumerable:!0})},ie=(o,t,e,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of se(t))!re.call(o,n)&&n!==e&&A(o,n,{get:()=>t[n],enumerable:!(a=ne(t,n))||a.enumerable});return o};var le=o=>ie(A({},"__esModule",{value:!0}),o);var ge={};oe(ge,{default:()=>I});module.exports=le(ge);var l=require("obsidian"),E="home-base-dashboard",ce={openOnStartup:!0,todoInboxPath:"Home Base/Todo Inbox.md",todoScanFolders:"Home Base",workoutPlanPath:"Home Base/Workout Plan.md",workoutLogPath:"Home Base/Workout Log.md",showSchedulePlaceholder:!0,calendarEnabled:!1,calendarServerUrl:"https://caldav.icloud.com",calendarUsername:"",calendarPassword:"",calendarUrl:"",calendarName:""},K=`# Todo Inbox

`,M=`# Workout Types

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
`,Y=`# Workout Log

`,W="urn:ietf:params:xml:ns:caldav",N="DAV:";function L(o){let t=o.trim();return t?t.endsWith("/")?t:`${t}/`:""}function S(o,t){return new URL(t,L(o)).toString()}function de(o){return`${encodeURIComponent(o)}.ics`}function X(o){let t=o.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`),e=[];for(let a of t)/^[ \t]/.test(a)&&e.length?e[e.length-1]+=a.slice(1):a.trim()&&e.push(a);return e}function Z(o){let t=o.indexOf(":");if(t===-1)return null;let e=o.slice(0,t),[a,...n]=e.split(";");return{name:a.toUpperCase(),params:n.join(";"),value:o.slice(t+1)}}function B(o){return o.replace(/\\n/gi,`
`).replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\")}function U(o){return o.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/;/g,"\\;").replace(/,/g,"\\,")}function J(o){let t=[],e=o;for(;e.length>74;)t.push(e.slice(0,74)),e=` ${e.slice(74)}`;return t.push(e),t.join(`\r
`)}function j(o){return`${o.getFullYear()}${String(o.getMonth()+1).padStart(2,"0")}${String(o.getDate()).padStart(2,"0")}`}function w(o){return o.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z")}function G(o,t){let e=/VALUE=DATE/i.test(t)||/^\d{8}$/.test(o);if(/^\d{8}$/.test(o))return{date:new Date(Number(o.slice(0,4)),Number(o.slice(4,6))-1,Number(o.slice(6,8))),allDay:e};let a=o.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);if(!a)return{date:new Date,allDay:e};let[,n,s,r,i,c,d,p]=a,u=[n,s,r,i,c,d].map(h=>Number(h));return p?{date:new Date(Date.UTC(u[0],u[1]-1,u[2],u[3],u[4],u[5])),allDay:e}:{date:new Date(u[0],u[1]-1,u[2],u[3],u[4],u[5]),allDay:e}}function Q(o,t){return new Date(o.getTime()+t*6e4)}function z(o,t){let[e,a,n]=o.split("-").map(i=>Number(i)),[s,r]=t.split(":").map(i=>Number(i));return new Date(e,a-1,n,s||0,r||0,0)}function ue(o){let[t,e,a]=o.date.split("-").map(r=>Number(r));if(o.allDay){let r=new Date(t,e-1,a);return{start:r,end:ee(r,1)}}let n=z(o.date,o.startTime||"09:00"),s=z(o.date,o.endTime||"10:00");return s<=n&&(s=Q(n,60)),{start:n,end:s}}function ee(o,t){let e=new Date(o);return e.setDate(e.getDate()+t),e}function te(o,t){let{start:e,end:a}=ue(o),n=new Date,s=[`UID:${t}`,`DTSTAMP:${w(n)}`,`LAST-MODIFIED:${w(n)}`,`SUMMARY:${U(o.title.trim())}`];return o.allDay?(s.push(`DTSTART;VALUE=DATE:${j(e)}`),s.push(`DTEND;VALUE=DATE:${j(a)}`)):(s.push(`DTSTART:${w(e)}`),s.push(`DTEND:${w(a)}`)),o.location.trim()&&s.push(`LOCATION:${U(o.location.trim())}`),o.notes.trim()&&s.push(`DESCRIPTION:${U(o.notes.trim())}`),s}function ae(o,t){return`${["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Home Base//Obsidian Calendar//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",`CREATED:${w(new Date)}`,...te(o,t),"END:VEVENT","END:VCALENDAR"].map(J).join(`\r
`)}\r
`}function pe(o,t,e){let a=X(o),n=a.findIndex(d=>d.toUpperCase()==="BEGIN:VEVENT"),s=a.findIndex((d,p)=>p>n&&d.toUpperCase()==="END:VEVENT");if(n===-1||s===-1)return ae(t,e);let r=te(t,e),i=new Set(["UID","DTSTAMP","LAST-MODIFIED","SUMMARY","DTSTART","DTEND","LOCATION","DESCRIPTION"]);return`${[...a.slice(0,n+1),...r,...a.slice(n+1,s).filter(d=>{let p=Z(d);return!p||!i.has(p.name)}),...a.slice(s)].map(J).join(`\r
`)}\r
`}function he(o,t,e,a){var g,x,C,D,k,V,b,v;let n=X(o),s=n.findIndex(y=>y.toUpperCase()==="BEGIN:VEVENT"),r=n.findIndex((y,q)=>q>s&&y.toUpperCase()==="END:VEVENT");if(s===-1||r===-1)return null;let i=n.slice(s+1,r).map(Z).filter(y=>!!y),c=y=>i.find(q=>q.name===y),d=((g=c("UID"))==null?void 0:g.value)||((x=t.split("/").pop())==null?void 0:x.replace(/\.ics$/i,""))||crypto.randomUUID(),p=c("DTSTART");if(!p)return null;let u=G(p.value,p.params),h=c("DTEND"),m=h?G(h.value,h.params):{date:u.allDay?ee(u.date,1):Q(u.date,60),allDay:u.allDay};return{uid:d,href:t,etag:e,title:B((D=(C=c("SUMMARY"))==null?void 0:C.value)!=null?D:""),start:u.date,end:m.date,allDay:u.allDay,location:B((V=(k=c("LOCATION"))==null?void 0:k.value)!=null?V:""),notes:B((v=(b=c("DESCRIPTION"))==null?void 0:b.value)!=null?v:""),rawIcs:o,calendarName:a}}function f(o,t){let e=o instanceof Document?o.documentElement:o,a=Array.from(e.getElementsByTagName("*"));return e.localName===t&&a.unshift(e),a.filter(n=>n.localName===t)}function T(o,t){var e,a,n;return(n=(a=(e=f(o,t)[0])==null?void 0:e.textContent)==null?void 0:a.trim())!=null?n:""}function _(o,t){let e=f(o,t)[0];return e?T(e,"href"):""}function P(o){return new DOMParser().parseFromString(o,"application/xml")}var me=`
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
`,I=class extends l.Plugin{async onload(){this.settings=Object.assign({},ce,await this.loadData()),this.injectStyles(),this.registerView(E,t=>new $(t,this)),this.addRibbonIcon("home","Open Home Base",()=>{this.openDashboard()}),this.addCommand({id:"open-home-base",name:"Open Home Base",callback:()=>void this.openDashboard()}),this.addCommand({id:"refresh-home-base",name:"Refresh Home Base",callback:()=>void this.refreshDashboard()}),this.addSettingTab(new H(this.app,this)),await this.ensureDefaultFiles().catch(t=>{console.warn("Home Base could not create one or more default files.",t)}),this.settings.openOnStartup&&this.app.workspace.onLayoutReady(()=>{this.openDashboard()})}onunload(){var t;this.app.workspace.detachLeavesOfType(E),(t=this.styleEl)==null||t.remove()}async saveSettings(){await this.saveData(this.settings)}async openDashboard(){let t=this.app.workspace.getLeavesOfType(E)[0];if(t){this.app.workspace.revealLeaf(t);return}let e=this.app.workspace.getLeaf("tab");await e.setViewState({type:E,active:!0}),this.app.workspace.revealLeaf(e)}async refreshDashboard(){let t=this.app.workspace.getLeavesOfType(E);for(let e of t){let a=e.view;a instanceof $&&await a.render()}}async fetchCalendarEvents(t,e){if(!this.hasCalendarConfig())return{events:[],error:"",setupRequired:!0};try{let a=await this.getDefaultCalendar();if(!a)return{events:[],error:"No writable CalDAV calendar was found.",setupRequired:!1};let n=`<?xml version="1.0" encoding="utf-8" ?>
<c:calendar-query xmlns:d="${N}" xmlns:c="${W}">
  <d:prop>
    <d:getetag />
    <c:calendar-data />
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${w(t)}" end="${w(e)}" />
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`,s=await this.caldavRequest(a.href,"REPORT",n,{Depth:"1"}),r=P(s.text);return{events:f(r,"response").map(c=>{let d=S(a.href,T(c,"href")),p=T(c,"getetag"),u=T(c,"calendar-data");return u?he(u,d,p,a.displayName):null}).filter(c=>!!c).filter(c=>c.end>=t&&c.start<e).sort((c,d)=>c.start.getTime()-d.start.getTime()),error:"",setupRequired:!1}}catch(a){return{events:[],error:this.readableCalendarError(a),setupRequired:!1}}}async saveCalendarEvent(t){let e=await this.getDefaultCalendar();if(!e){new l.Notice("Set up a default CalDAV calendar first.");return}let a=t.uid||crypto.randomUUID(),n=t.href||S(e.href,de(a)),s=t.rawIcs?pe(t.rawIcs,t,a):ae(t,a),r={"Content-Type":"text/calendar; charset=utf-8"};t.etag?r["If-Match"]=t.etag:r["If-None-Match"]="*";try{await this.caldavRequest(n,"PUT",s,r),new l.Notice("Calendar event saved.")}catch(i){throw new l.Notice(this.readableCalendarError(i)),i}}async deleteCalendarEvent(t){try{await this.caldavRequest(t.href,"DELETE","",t.etag?{"If-Match":t.etag}:{}),new l.Notice("Calendar event deleted.")}catch(e){throw new l.Notice(this.readableCalendarError(e)),e}}async testCalendarConnection(){let t=await this.getDefaultCalendar(!0);if(!t)throw new Error("No calendar was found for this CalDAV account.");return t}hasCalendarConfig(){return!!(this.settings.calendarEnabled&&this.settings.calendarServerUrl.trim()&&this.settings.calendarUsername.trim()&&this.settings.calendarPassword.trim())}async getDefaultCalendar(t=!1){var n;if(!this.hasCalendarConfig())return null;if(this.settings.calendarUrl.trim()&&!t)return{href:L(this.settings.calendarUrl),displayName:this.settings.calendarName||"Calendar",writable:!0};let e=await this.discoverCalendars(),a=(n=e.find(s=>s.href===L(this.settings.calendarUrl)))!=null?n:e[0];if(!a)return null;if(!a.writable)throw new Error(`"${a.displayName}" appears to be read-only. Choose a writable iCloud calendar.`);return this.settings.calendarUrl=a.href,this.settings.calendarName=a.displayName,await this.saveSettings(),a}async discoverCalendars(){let t=L(this.settings.calendarServerUrl),e=await this.caldavRequest(t,"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${N}">
  <d:prop>
    <d:current-user-principal />
  </d:prop>
</d:propfind>`,{Depth:"0"}),a=P(e.text),n=_(a,"current-user-principal");if(!n)throw new Error("CalDAV server did not return a principal URL.");let s=await this.caldavRequest(S(t,n),"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${N}" xmlns:c="${W}">
  <d:prop>
    <c:calendar-home-set />
  </d:prop>
</d:propfind>`,{Depth:"0"}),r=P(s.text),i=_(r,"calendar-home-set");if(!i)throw new Error("CalDAV server did not return a calendar home.");let c=S(t,i),d=await this.caldavRequest(c,"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${N}" xmlns:c="${W}">
  <d:prop>
    <d:displayname />
    <d:resourcetype />
    <d:current-user-privilege-set />
    <c:supported-calendar-component-set />
  </d:prop>
</d:propfind>`,{Depth:"1"}),p=P(d.text);return f(p,"response").map(u=>{let h=T(u,"href"),m=f(u,"resourcetype")[0],g=!!(m&&f(m,"calendar").length),x=f(u,"comp").map(b=>{var v;return((v=b.getAttribute("name"))!=null?v:"").toUpperCase()}),C=!x.length||x.includes("VEVENT"),D=f(u,"current-user-privilege-set")[0],k=D?f(D,"privilege").flatMap(b=>Array.from(b.children).map(v=>v.localName)):[],V=!k.length||k.some(b=>["write","write-content","bind","unbind"].includes(b));return!h||!g||!C?null:{href:S(c,h),displayName:T(u,"displayname")||"Calendar",writable:V}}).filter(u=>!!u).filter(u=>u.writable)}async caldavRequest(t,e,a="",n={}){let s=await(0,l.requestUrl)({url:t,method:e,body:a,headers:{Authorization:`Basic ${btoa(`${this.settings.calendarUsername}:${this.settings.calendarPassword}`)}`,"Content-Type":"application/xml; charset=utf-8",...n}});if(s.status>=400)throw s.status===401||s.status===403?new Error("Calendar authentication failed. Check your Apple ID and app-specific password."):s.status===409||s.status===412?new Error("This event changed remotely. Refresh Home Base and try again."):new Error(`CalDAV request failed with status ${s.status}.`);return s}readableCalendarError(t){return t instanceof Error?t.message:"Calendar sync failed."}async ensureDefaultFiles(){await this.ensureFile(this.settings.todoInboxPath,K),await this.ensureFile(this.settings.workoutPlanPath,M),await this.ensureFile(this.settings.workoutLogPath,Y)}async ensureFile(t,e){let a=(0,l.normalizePath)(t),n=this.app.vault.getAbstractFileByPath(a);if(n instanceof l.TFile)return;if(n)throw new Error(`Expected a file path but found a folder: ${a}`);let s=a.split("/").slice(0,-1).join("/");s&&await this.ensureFolder(s),await this.app.vault.create(a,e)}async ensureFolder(t){let e=(0,l.normalizePath)(t).split("/"),a="";for(let n of e){a=a?`${a}/${n}`:n;let s=this.app.vault.getAbstractFileByPath(a);if(s instanceof l.TFile)throw new Error(`Expected a folder path but found a file: ${a}`);s||await this.app.vault.createFolder(a)}}injectStyles(){var t;(t=this.styleEl)==null||t.remove(),this.styleEl=document.createElement("style"),this.styleEl.id="home-base-runtime-styles",this.styleEl.textContent=me,document.head.appendChild(this.styleEl)}},$=class extends l.ItemView{constructor(t,e){super(t),this.plugin=e}getViewType(){return E}getDisplayText(){return"Home Base"}getIcon(){return"home"}async onOpen(){await this.render()}async render(){let t=this.containerEl.children[1];t.empty(),t.addClass("home-base-view");let e=await this.loadTodos(),a=await this.loadWorkoutPlan(),n=await this.loadWorkoutLog(),s=await this.plugin.fetchCalendarEvents(this.startOfDay(new Date),this.addDays(new Date,8)),r=this.getWorkoutState(a,n);this.renderHeader(t);let i=t.createDiv({cls:"home-base-grid"}),c=i.createDiv({cls:"home-base-column home-base-left"}),d=i.createDiv({cls:"home-base-column home-base-right"});this.renderCalendar(c,s),this.renderWorkout(c,a,r),this.renderTodos(d,e)}renderHeader(t){let e=t.createDiv({cls:"home-base-header"}),a=new Date,n=e.createDiv();n.createEl("h1",{text:"Home Base"}),n.createDiv({cls:"home-base-date",text:a.toLocaleDateString(void 0,{weekday:"long",year:"numeric",month:"long",day:"numeric"})}),n.createDiv({cls:"home-base-greeting",text:this.getGreeting()});let s=e.createEl("button",{cls:"home-base-icon-button",attr:{"aria-label":"Refresh"}});s.setText("Refresh"),s.onClickEvent(()=>void this.render())}renderCalendar(t,e){let a=t.createDiv({cls:"home-base-panel home-base-calendar-panel"}),n=a.createDiv({cls:"home-base-panel-title"});n.createEl("span",{cls:"home-base-icon",text:"Cal"}),n.createEl("h2",{text:"Calendar"}),this.plugin.settings.calendarName&&n.createEl("span",{cls:"home-base-pill",text:this.plugin.settings.calendarName});let s=a.createDiv({cls:"home-base-calendar-controls"}),r=s.createEl("button",{cls:"mod-cta home-base-primary-button",text:"+ Event"});if(r.disabled=e.setupRequired||!!e.error,r.onClickEvent(()=>{new O(this.app,this.plugin,void 0,()=>void this.render()).open()}),s.createEl("button",{cls:"home-base-secondary-button",text:"Refresh"}).onClickEvent(()=>void this.render()),e.setupRequired){let m=a.createDiv({cls:"home-base-schedule-empty"});m.createDiv({cls:"home-base-calendar-mark",text:"CalDAV"});let g=m.createDiv();g.createEl("strong",{text:"Connect iCloud Calendar"}),g.createEl("p",{text:"Enable Calendar in Home Base settings, then add your iCloud CalDAV account and default calendar."});return}if(e.error){let m=a.createDiv({cls:"home-base-calendar-error"});m.createEl("strong",{text:"Calendar could not sync"}),m.createEl("p",{text:e.error});return}let c=this.startOfDay(new Date),d=this.addDays(c,1),p=this.addDays(c,7),u=e.events.filter(m=>this.eventOccursOn(m,c)),h=e.events.filter(m=>{let g=this.startOfDay(m.start);return g>=d&&g<=p});this.renderCalendarGroup(a,"Today",u,"No events today"),this.renderCalendarGroup(a,"Next 7 Days",h,"No upcoming events")}renderCalendarGroup(t,e,a,n){let s=t.createDiv({cls:"home-base-calendar-group"});if(s.createEl("h3",{text:e}),!a.length){s.createEl("p",{cls:"home-base-muted home-base-italic",text:n});return}for(let r of a)this.renderCalendarEvent(s,r)}renderCalendarEvent(t,e){let a=t.createDiv({cls:"home-base-calendar-event"}),n=a.createDiv({cls:"home-base-calendar-time",text:this.formatCalendarEventTime(e)});e.allDay&&n.addClass("is-all-day");let s=a.createDiv({cls:"home-base-calendar-body"});s.createDiv({cls:"home-base-calendar-title",text:e.title||"Untitled event"});let r=s.createDiv({cls:"home-base-calendar-meta"});this.eventOccursOn(e,this.startOfDay(new Date))||r.createEl("span",{text:this.formatCalendarDate(e.start)}),e.location&&r.createEl("span",{text:e.location});let i=a.createDiv({cls:"home-base-actions"});i.createEl("button",{cls:"home-base-ghost-button",text:"Edit"}).onClickEvent(()=>new O(this.app,this.plugin,e,()=>void this.render()).open()),i.createEl("button",{cls:"home-base-ghost-button",text:"Delete"}).onClickEvent(async()=>{confirm(`Delete "${e.title||"Untitled event"}"?`)&&(await this.plugin.deleteCalendarEvent(e),await this.render())})}renderTodos(t,e){let a=t.createDiv({cls:"home-base-panel home-base-todo-panel"}),n=a.createDiv({cls:"home-base-panel-title home-base-todo-title"});n.createEl("span",{cls:"home-base-icon",text:"Task"}),n.createEl("h2",{text:"Todo Manager"}),a.createDiv({cls:"home-base-todo-controls"}).createEl("button",{cls:"mod-cta home-base-primary-button",text:"+ New Todo"}).onClickEvent(()=>{new R(this.app,this.plugin,void 0,()=>void this.render()).open()});let i=this.groupTodos(e);for(let c of["Overdue","Today","Tomorrow","Next 7 Days","No Due Date","Later"]){let d=i[c];if(!d.length&&c==="Later")continue;let p=a.createDiv({cls:"home-base-todo-group"});if(p.createEl("h3",{text:c}),!d.length){p.createEl("p",{cls:"home-base-muted home-base-italic",text:c==="Tomorrow"?"No todos due tomorrow":`No todos in ${c.toLowerCase()}`});continue}for(let u of d)this.renderTodoItem(p,u)}}renderTodoItem(t,e){let a=t.createDiv({cls:`home-base-todo-item ${e.completed?"is-complete":""}`}),n=a.createEl("input",{cls:"home-base-checkbox"});n.type="checkbox",n.checked=e.completed,n.onClickEvent(async()=>{await this.setTodoCompletion(e,n.checked),await this.render()});let s=a.createDiv({cls:"home-base-todo-body"});s.createDiv({cls:"home-base-todo-name",text:e.title});let r=s.createDiv({cls:"home-base-todo-meta"});r.createEl("span",{cls:"home-base-due",text:e.due?this.formatDue(e.due):"No due date"}),e.priority&&r.createEl("span",{cls:`home-base-priority is-${e.priority}`,text:this.capitalize(e.priority)});for(let p of e.tags)r.createEl("span",{cls:"home-base-tag",text:p});let i=a.createDiv({cls:"home-base-actions"});i.createEl("button",{cls:"home-base-ghost-button",text:"Edit"}).onClickEvent(()=>new R(this.app,this.plugin,e,()=>void this.render()).open()),i.createEl("button",{cls:"home-base-ghost-button",text:"Delete"}).onClickEvent(async()=>{await this.deleteTodo(e),await this.render()})}renderWorkout(t,e,a){var h;let n=t.createDiv({cls:"home-base-panel"}),s=n.createDiv({cls:"home-base-panel-title"});if(s.createEl("span",{cls:"home-base-icon",text:"Fit"}),s.createEl("h2",{text:"Workout"}),a.unresolved){let m=n.createDiv({cls:"home-base-unresolved"});m.createDiv({text:`Yesterday's workout was not resolved: ${a.unresolved.workout}`});let g=m.createDiv({cls:"home-base-unresolved-actions"});g.createEl("button",{text:"Mark Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(a.unresolved.date,a.unresolved.workout,"done"),await this.render()}),g.createEl("button",{text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(a.unresolved.date,a.unresolved.workout,"skipped"),await this.render()}),g.createEl("button",{text:"Keep Pending"}).onClickEvent(async()=>{new l.Notice("Kept as pending.")})}n.createEl("h3",{text:"Today's Workout"}),n.createEl("div",{cls:"home-base-workout-name",text:a.todayWorkout});let r=(h=e.types[a.todayWorkout])!=null?h:[];if(r.length){let m=n.createEl("ul",{cls:"home-base-exercises"});for(let g of r)m.createEl("li",{text:g})}else n.createEl("p",{cls:"home-base-muted",text:"No exercises configured for this workout."});n.createEl("button",{cls:"home-base-wide-button",text:"Edit Routine"}).onClickEvent(()=>{new F(this.app,this.plugin,e,()=>void this.render()).open()});let c=n.createDiv({cls:"home-base-workout-actions"});c.createEl("button",{cls:"mod-cta home-base-primary-button",text:"Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),a.todayWorkout,"done"),await this.render()}),c.createEl("button",{cls:"home-base-secondary-button",text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),a.todayWorkout,"skipped"),await this.render()});let u=n.createDiv({cls:"home-base-sequence"});u.createEl("h3",{text:"Routine Sequence"}),u.createDiv({text:e.sequence.length?e.sequence.join(" > "):"No sequence configured"})}async loadTodos(){let t=this.plugin.settings.todoScanFolders.split(",").map(n=>(0,l.normalizePath)(n.trim())).filter(Boolean),e=this.app.vault.getMarkdownFiles().filter(n=>t.length?t.some(s=>n.path===s||n.path.startsWith(`${s}/`)):!0),a=[];for(let n of e)(await this.app.vault.cachedRead(n)).split(`
`).forEach((i,c)=>{let d=this.parseTodoLine(i,n,c);d&&a.push(d)});return a.sort((n,s)=>this.compareTodos(n,s))}parseTodoLine(t,e,a){var p,u,h,m;let n=t.match(/^\s*[-*]\s+\[( |x|X)]\s+(.+)$/);if(!n)return null;let s=n[1].toLowerCase()==="x",r=n[2].trim(),i=r.match(/\sdue::\s*(\d{4}-\d{2}-\d{2})/),c=r.match(/\spriority::\s*(high|medium|low)/i),d=(p=r.match(/#[\w/-]+/g))!=null?p:[];return r=r.replace(/\sdue::\s*\d{4}-\d{2}-\d{2}/,"").replace(/\spriority::\s*(high|medium|low)/i,"").replace(/#[\w/-]+/g,"").trim(),{id:`${e.path}:${a}`,title:r,due:(u=i==null?void 0:i[1])!=null?u:"",priority:(m=(h=c==null?void 0:c[1])==null?void 0:h.toLowerCase())!=null?m:"",tags:d,completed:s,file:e,line:a,raw:t}}groupTodos(t){let e={Overdue:[],Today:[],Tomorrow:[],"Next 7 Days":[],"No Due Date":[],Later:[]},a=this.startOfDay(new Date),n=this.addDays(a,1),s=this.addDays(a,7);for(let r of t.filter(i=>!i.completed)){if(!r.due){e["No Due Date"].push(r);continue}let i=this.parseDate(r.due);i<a?e.Overdue.push(r):i.getTime()===a.getTime()?e.Today.push(r):i.getTime()===n.getTime()?e.Tomorrow.push(r):i<=s?e["Next 7 Days"].push(r):e.Later.push(r)}return e}async loadWorkoutPlan(){await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,M);let t=this.app.vault.getAbstractFileByPath((0,l.normalizePath)(this.plugin.settings.workoutPlanPath));if(!(t instanceof l.TFile))return{types:{},sequence:[]};let a=(await this.app.vault.cachedRead(t)).split(`
`),n={},s=[],r="",i="";for(let c of a){let d=c.trim();if(/^#\s+Workout Types/i.test(d)){r="types",i="";continue}if(/^#\s+Sequence/i.test(d)){r="sequence",i="";continue}if(r==="types"&&d.startsWith("## ")){i=d.replace(/^##\s+/,"").trim(),n[i]=[];continue}if(r==="types"&&i){let p=d.replace(/^[-*]\s+/,"").trim();p&&n[i].push(p)}r==="sequence"&&/^[-*]\s+/.test(d)&&s.push(d.replace(/^[-*]\s+/,"").trim())}return{types:n,sequence:s}}async loadWorkoutLog(){await this.plugin.ensureFile(this.plugin.settings.workoutLogPath,Y);let t=this.app.vault.getAbstractFileByPath((0,l.normalizePath)(this.plugin.settings.workoutLogPath));return t instanceof l.TFile?(await this.app.vault.cachedRead(t)).split(`
`).map(a=>{var i,c,d,p;let n=(i=a.match(/date::\s*(\d{4}-\d{2}-\d{2})/))==null?void 0:i[1],s=(d=(c=a.match(/workout::\s*([^]+?)\s+status::/))==null?void 0:c[1])==null?void 0:d.trim(),r=(p=a.match(/status::\s*(done|skipped|pending)/))==null?void 0:p[1];return!n||!s||!r?null:{date:n,workout:s,status:r}}).filter(a=>!!a):[]}getWorkoutState(t,e){let a=t.sequence.length?t.sequence:Object.keys(t.types),n=e.filter(d=>d.status==="done").length,s=a.length?a[n%a.length]:"No workout configured",r=this.dateKey(this.addDays(new Date,-1)),c=e.filter(d=>d.date===r).length?null:{date:r,workout:s};return{todayWorkout:s,unresolved:c}}async appendWorkoutLog(t,e,a){let n=this.app.vault.getAbstractFileByPath((0,l.normalizePath)(this.plugin.settings.workoutLogPath));if(!(n instanceof l.TFile))return;let s=await this.app.vault.cachedRead(n),r=`- date:: ${t} workout:: ${e} status:: ${a}`;await this.app.vault.modify(n,`${s.trimEnd()}
${r}
`),new l.Notice(`Workout marked ${a}.`)}async setTodoCompletion(t,e){let n=(await this.app.vault.cachedRead(t.file)).split(`
`);n[t.line]=t.raw.replace(/\[( |x|X)]/,e?"[x]":"[ ]"),await this.app.vault.modify(t.file,n.join(`
`))}async deleteTodo(t){if(!confirm(`Delete "${t.title}"?`))return;let n=(await this.app.vault.cachedRead(t.file)).split(`
`);n.splice(t.line,1),await this.app.vault.modify(t.file,n.join(`
`))}compareTodos(t,e){let a=t.due||"9999-12-31",n=e.due||"9999-12-31";if(a!==n)return a.localeCompare(n);let s={high:0,medium:1,low:2,"":3};return s[t.priority]-s[e.priority]}formatDue(t){let e=this.todayKey();return t===e?"Today":t===this.dateKey(this.addDays(new Date,1))?"Tomorrow":new Date(`${t}T00:00:00`).toLocaleDateString(void 0,{month:"short",day:"numeric"})}eventOccursOn(t,e){let a=this.startOfDay(t.start),n=this.startOfDay(t.allDay?this.addDays(t.end,-1):t.end);return a<=e&&n>=e}formatCalendarEventTime(t){if(t.allDay)return"All day";let e=t.start.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),a=t.end.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"});return`${e} - ${a}`}formatCalendarDate(t){return t.toLocaleDateString(void 0,{weekday:"short",month:"short",day:"numeric"})}getGreeting(){let t=new Date().getHours();return t<12?"Good morning":t<18?"Good afternoon":"Good evening"}parseDate(t){return new Date(`${t}T00:00:00`)}startOfDay(t){return new Date(t.getFullYear(),t.getMonth(),t.getDate())}addDays(t,e){let a=new Date(t);return a.setDate(a.getDate()+e),this.startOfDay(a)}todayKey(){return this.dateKey(new Date)}dateKey(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}capitalize(t){return t.charAt(0).toUpperCase()+t.slice(1)}},R=class extends l.Modal{constructor(e,a,n,s){super(e);this.titleValue="";this.dueValue="";this.priorityValue="medium";this.tagsValue="";this.plugin=a,this.todo=n,this.onSave=s,n&&(this.titleValue=n.title,this.dueValue=n.due,this.priorityValue=n.priority||"medium",this.tagsValue=n.tags.join(" "))}onOpen(){let{contentEl:e}=this;e.empty(),e.addClass("home-base-modal"),e.createEl("h2",{text:this.todo?"Edit Todo":"New Todo"}),new l.Setting(e).setName("Title").addText(a=>{a.setValue(this.titleValue),a.onChange(n=>{this.titleValue=n})}),new l.Setting(e).setName("Due date").addText(a=>{a.inputEl.type="date",a.setValue(this.dueValue),a.onChange(n=>{this.dueValue=n})}),new l.Setting(e).setName("Priority").addDropdown(a=>{a.addOption("high","High").addOption("medium","Medium").addOption("low","Low").setValue(this.priorityValue||"medium").onChange(n=>{this.priorityValue=n})}),new l.Setting(e).setName("Tags").setDesc("Use Markdown tags, for example #school #writing.").addText(a=>{a.setPlaceholder("#school #writing"),a.setValue(this.tagsValue),a.onChange(n=>{this.tagsValue=n})}),new l.Setting(e).addButton(a=>{a.setButtonText("Cancel").onClick(()=>this.close())}).addButton(a=>{a.setButtonText("Save").setCta().onClick(()=>void this.saveTodo())})}async saveTodo(){if(!this.titleValue.trim()){new l.Notice("Todo title is required.");return}let e=this.formatTodoLine();if(this.todo){let n=(await this.app.vault.cachedRead(this.todo.file)).split(`
`);n[this.todo.line]=e.replace("- [ ]",this.todo.completed?"- [x]":"- [ ]"),await this.app.vault.modify(this.todo.file,n.join(`
`))}else{await this.plugin.ensureFile(this.plugin.settings.todoInboxPath,K);let a=this.app.vault.getAbstractFileByPath((0,l.normalizePath)(this.plugin.settings.todoInboxPath));if(!(a instanceof l.TFile))return;let n=await this.app.vault.cachedRead(a);await this.app.vault.modify(a,`${n.trimEnd()}
${e}
`)}this.close(),this.onSave()}formatTodoLine(){let e=this.tagsValue.split(/\s+/).filter(Boolean).map(r=>r.startsWith("#")?r:`#${r}`).join(" "),a=this.dueValue?` due:: ${this.dueValue}`:"",n=this.priorityValue?` priority:: ${this.priorityValue}`:"",s=e?` ${e}`:"";return`- [ ] ${this.titleValue.trim()}${a}${n}${s}`}},O=class extends l.Modal{constructor(e,a,n,s){super(e);this.titleValue="";this.dateValue="";this.startTimeValue="09:00";this.endTimeValue="10:00";this.allDayValue=!1;this.locationValue="";this.notesValue="";if(this.plugin=a,this.event=n,this.onSave=s,n)this.titleValue=n.title,this.dateValue=this.dateInputValue(n.start),this.startTimeValue=this.timeInputValue(n.start),this.endTimeValue=this.timeInputValue(n.end),this.allDayValue=n.allDay,this.locationValue=n.location,this.notesValue=n.notes;else{let r=new Date;this.dateValue=this.dateInputValue(r)}}onOpen(){this.render()}render(){let{contentEl:e}=this;e.empty(),e.addClass("home-base-modal"),e.createEl("h2",{text:this.event?"Edit Event":"New Event"}),new l.Setting(e).setName("Title").addText(r=>{r.setValue(this.titleValue),r.onChange(i=>{this.titleValue=i})}),new l.Setting(e).setName("All day").addToggle(r=>{r.setValue(this.allDayValue),r.onChange(i=>{this.allDayValue=i,this.render()})}),new l.Setting(e).setName("Date").addText(r=>{r.inputEl.type="date",r.setValue(this.dateValue),r.onChange(i=>{this.dateValue=i})}),this.allDayValue||(new l.Setting(e).setName("Start time").addText(r=>{r.inputEl.type="time",r.setValue(this.startTimeValue),r.onChange(i=>{this.startTimeValue=i})}),new l.Setting(e).setName("End time").addText(r=>{r.inputEl.type="time",r.setValue(this.endTimeValue),r.onChange(i=>{this.endTimeValue=i})})),new l.Setting(e).setName("Location").addText(r=>{r.setValue(this.locationValue),r.onChange(i=>{this.locationValue=i})}),new l.Setting(e).setName("Notes").addTextArea(r=>{r.setValue(this.notesValue),r.onChange(i=>{this.notesValue=i})});let a=e.createDiv({cls:"home-base-modal-footer"});this.event&&a.createEl("button",{text:"Delete"}).onClickEvent(()=>void this.deleteEvent()),a.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),a.createEl("button",{cls:"mod-cta",text:"Save Event"}).onClickEvent(()=>void this.saveEvent())}async saveEvent(){var a,n,s,r;if(!this.titleValue.trim()){new l.Notice("Event title is required.");return}if(!this.dateValue){new l.Notice("Event date is required.");return}let e={uid:(a=this.event)==null?void 0:a.uid,href:(n=this.event)==null?void 0:n.href,etag:(s=this.event)==null?void 0:s.etag,rawIcs:(r=this.event)==null?void 0:r.rawIcs,title:this.titleValue,date:this.dateValue,startTime:this.startTimeValue,endTime:this.endTimeValue,allDay:this.allDayValue,location:this.locationValue,notes:this.notesValue};await this.plugin.saveCalendarEvent(e),this.close(),this.onSave()}async deleteEvent(){!this.event||!confirm(`Delete "${this.event.title||"Untitled event"}"?`)||(await this.plugin.deleteCalendarEvent(this.event),this.close(),this.onSave())}dateInputValue(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}timeInputValue(e){return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}},F=class extends l.Modal{constructor(t,e,a,n){super(t),this.plugin=e,this.plan={types:Object.fromEntries(Object.entries(a.types).map(([s,r])=>[s,[...r]])),sequence:[...a.sequence]},this.onSave=n}onOpen(){this.render()}render(){let{contentEl:t}=this;t.empty(),t.addClass("home-base-modal","home-base-routine-modal"),t.createEl("h2",{text:"Edit Workout Routine"});let e=t.createDiv({cls:"home-base-routine-section"}),a=e.createDiv({cls:"home-base-routine-section-header"});a.createEl("h3",{text:"Workout Types"}),a.createEl("button",{text:"+ Add Type"}).onClickEvent(()=>{let h=this.uniqueWorkoutName("New Workout");this.plan.types[h]=[],this.plan.sequence.push(h),this.render()});let s=Object.keys(this.plan.types);s.length||e.createEl("p",{cls:"home-base-muted home-base-italic",text:"Create a workout type to start your sequence."});for(let h of s)this.renderWorkoutType(e,h);let r=t.createDiv({cls:"home-base-routine-section"}),i=r.createDiv({cls:"home-base-routine-section-header"});i.createEl("h3",{text:"Sequence Order"});let c=i.createEl("button",{text:"+ Add Step"});c.disabled=!s.length,c.onClickEvent(()=>{let h=Object.keys(this.plan.types)[0];h&&(this.plan.sequence.push(h),this.render())}),this.plan.sequence.length||r.createEl("p",{cls:"home-base-muted home-base-italic",text:"No sequence steps yet."}),this.plan.sequence.forEach((h,m)=>{this.renderSequenceStep(r,h,m)});let d=t.createDiv({cls:"home-base-modal-footer"});d.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),d.createEl("button",{cls:"mod-cta",text:"Save Routine"}).onClickEvent(()=>void this.saveRoutine())}renderWorkoutType(t,e){let a=t.createDiv({cls:"home-base-routine-card"}),n=a.createDiv({cls:"home-base-routine-card-row"}),s=n.createEl("input",{cls:"home-base-routine-name"});s.type="text",s.value=e,s.placeholder="Workout name",s.onchange=()=>{this.renameWorkoutType(e,s.value.trim())},n.createEl("button",{text:"Delete"}).onClickEvent(()=>{delete this.plan.types[e],this.plan.sequence=this.plan.sequence.filter(c=>c!==e),this.render()});let i=a.createEl("textarea",{cls:"home-base-routine-exercises"});i.placeholder="One exercise per line",i.value=this.plan.types[e].join(`
`),i.onchange=()=>{this.plan.types[e]=i.value.split(`
`).map(c=>c.trim()).filter(Boolean)}}renderSequenceStep(t,e,a){let n=t.createDiv({cls:"home-base-sequence-row"});n.createEl("span",{cls:"home-base-sequence-index",text:`${a+1}`});let s=n.createEl("select");for(let d of Object.keys(this.plan.types)){let p=s.createEl("option",{text:d,value:d});p.selected=d===e}s.onchange=()=>{this.plan.sequence[a]=s.value};let r=n.createEl("button",{text:"Up"});r.disabled=a===0,r.onClickEvent(()=>{this.moveSequenceStep(a,a-1),this.render()});let i=n.createEl("button",{text:"Down"});i.disabled=a===this.plan.sequence.length-1,i.onClickEvent(()=>{this.moveSequenceStep(a,a+1),this.render()}),n.createEl("button",{text:"Remove"}).onClickEvent(()=>{this.plan.sequence.splice(a,1),this.render()})}renameWorkoutType(t,e){if(!e||e===t)return;if(this.plan.types[e]){new l.Notice("A workout type with that name already exists."),this.render();return}let a=Object.entries(this.plan.types);this.plan.types=Object.fromEntries(a.map(([n,s])=>n===t?[e,s]:[n,s])),this.plan.sequence=this.plan.sequence.map(n=>n===t?e:n),this.render()}moveSequenceStep(t,e){let[a]=this.plan.sequence.splice(t,1);this.plan.sequence.splice(e,0,a)}uniqueWorkoutName(t){if(!this.plan.types[t])return t;let e=2;for(;this.plan.types[`${t} ${e}`];)e+=1;return`${t} ${e}`}async saveRoutine(){let t=Object.keys(this.plan.types).filter(Boolean);if(!t.length){new l.Notice("Add at least one workout type.");return}this.plan.sequence=this.plan.sequence.filter(a=>!!this.plan.types[a]),this.plan.sequence.length||(this.plan.sequence=[t[0]]),await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,M);let e=this.app.vault.getAbstractFileByPath((0,l.normalizePath)(this.plugin.settings.workoutPlanPath));e instanceof l.TFile&&(await this.app.vault.modify(e,this.formatWorkoutPlan()),new l.Notice("Workout routine saved."),this.close(),this.onSave())}formatWorkoutPlan(){let t=["# Workout Types",""];for(let[e,a]of Object.entries(this.plan.types))t.push(`## ${e}`),a.length?t.push(...a.map(n=>`- ${n}`)):t.push("Rest day"),t.push("");return t.push("# Sequence",""),t.push(...this.plan.sequence.map(e=>`- ${e}`)),t.push(""),t.join(`
`)}},H=class extends l.PluginSettingTab{constructor(t,e){super(t,e),this.plugin=e}display(){let{containerEl:t}=this;t.empty(),t.createEl("h2",{text:"Home Base Settings"}),new l.Setting(t).setName("Open on startup").setDesc("Automatically open the Home Base dashboard when Obsidian starts.").addToggle(e=>{e.setValue(this.plugin.settings.openOnStartup).onChange(async a=>{this.plugin.settings.openOnStartup=a,await this.plugin.saveSettings()})}),t.createEl("h3",{text:"Calendar"}),new l.Setting(t).setName("Enable calendar").setDesc("Connect a writable CalDAV calendar, such as iCloud Calendar.").addToggle(e=>{e.setValue(this.plugin.settings.calendarEnabled).onChange(async a=>{this.plugin.settings.calendarEnabled=a,await this.plugin.saveSettings()})}),new l.Setting(t).setName("CalDAV server URL").setDesc("For iCloud, use https://caldav.icloud.com.").addText(e=>{e.setPlaceholder("https://caldav.icloud.com").setValue(this.plugin.settings.calendarServerUrl).onChange(async a=>{this.plugin.settings.calendarServerUrl=a.trim(),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Calendar username").setDesc("For iCloud, use your Apple ID email.").addText(e=>{e.setPlaceholder("name@example.com").setValue(this.plugin.settings.calendarUsername).onChange(async a=>{this.plugin.settings.calendarUsername=a.trim(),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Calendar password").setDesc("For iCloud, use an app-specific password.").addText(e=>{e.inputEl.type="password",e.setValue(this.plugin.settings.calendarPassword).onChange(async a=>{this.plugin.settings.calendarPassword=a,await this.plugin.saveSettings()})}),new l.Setting(t).setName("Default calendar URL").setDesc("Leave blank and use Test connection to auto-select the first writable event calendar.").addText(e=>{e.setPlaceholder("https://caldav.icloud.com/...").setValue(this.plugin.settings.calendarUrl).onChange(async a=>{this.plugin.settings.calendarUrl=a.trim(),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Default calendar name").setDesc("Shown in the dashboard header.").addText(e=>{e.setPlaceholder("Calendar").setValue(this.plugin.settings.calendarName).onChange(async a=>{this.plugin.settings.calendarName=a.trim(),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Test calendar connection").setDesc("Discovers writable CalDAV event calendars and saves the first writable calendar when no default URL is set.").addButton(e=>{e.setButtonText("Test"),e.onClick(async()=>{try{let a=await this.plugin.testCalendarConnection();new l.Notice(`Connected to ${a.displayName}.`),this.display()}catch(a){new l.Notice(a instanceof Error?a.message:"Calendar connection failed.")}})}),t.createEl("h3",{text:"Todos"}),new l.Setting(t).setName("Todo inbox file").setDesc("New todos created from the dashboard are saved here.").addText(e=>{e.setValue(this.plugin.settings.todoInboxPath).onChange(async a=>{this.plugin.settings.todoInboxPath=(0,l.normalizePath)(a),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Todo scan folders").setDesc("Comma-separated folders to scan for Markdown todos. Leave blank to scan the whole vault.").addText(e=>{e.setValue(this.plugin.settings.todoScanFolders).onChange(async a=>{this.plugin.settings.todoScanFolders=a,await this.plugin.saveSettings()})}),t.createEl("h3",{text:"Workout"}),new l.Setting(t).setName("Workout plan file").addText(e=>{e.setValue(this.plugin.settings.workoutPlanPath).onChange(async a=>{this.plugin.settings.workoutPlanPath=(0,l.normalizePath)(a),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Workout log file").addText(e=>{e.setValue(this.plugin.settings.workoutLogPath).onChange(async a=>{this.plugin.settings.workoutLogPath=(0,l.normalizePath)(a),await this.plugin.saveSettings()})})}};
