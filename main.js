/* Home Base Obsidian plugin */
var M=Object.defineProperty;var ce=Object.getOwnPropertyDescriptor;var de=Object.getOwnPropertyNames;var ue=Object.prototype.hasOwnProperty;var pe=(r,t)=>{for(var e in t)M(r,e,{get:t[e],enumerable:!0})},he=(r,t,e,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of de(t))!ue.call(r,n)&&n!==e&&M(r,n,{get:()=>t[n],enumerable:!(a=ce(t,n))||a.enumerable});return r};var me=r=>he(M({},"__esModule",{value:!0}),r);var Le={};pe(Le,{default:()=>q});module.exports=me(Le);var l=require("obsidian"),T="home-base-dashboard",ge={openOnStartup:!0,todoInboxPath:"Home Base/Todo Inbox.md",todoScanFolders:"Home Base",workoutPlanPath:"Home Base/Workout Plan.md",workoutLogPath:"Home Base/Workout Log.md",showSchedulePlaceholder:!0,calendarEnabled:!1,calendarServerUrl:"https://caldav.icloud.com",calendarUsername:"",calendarPassword:"",calendarUrl:"",calendarName:""},se=`# Todo Inbox

`,_=`# Workout Types

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
`,re=`# Workout Log

`,H="urn:ietf:params:xml:ns:caldav",$="DAV:";function A(r){let t=r.trim();return t?t.endsWith("/")?t:`${t}/`:""}function N(r,t){return new URL(t,A(r)).toString()}function fe(r){return`${encodeURIComponent(r)}.ics`}function Q(r){let t=r.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`),e=[];for(let a of t)/^[ \t]/.test(a)&&e.length?e[e.length-1]+=a.slice(1):a.trim()&&e.push(a);return e}function ie(r){let t=r.indexOf(":");if(t===-1)return null;let e=r.slice(0,t),[a,...n]=e.split(";");return{name:a.toUpperCase(),params:n.join(";"),value:r.slice(t+1)}}function j(r){return r.replace(/\\n/gi,`
`).replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\")}function Y(r){return r.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/;/g,"\\;").replace(/,/g,"\\,")}function X(r){let t=[],e=r;for(;e.length>74;)t.push(e.slice(0,74)),e=` ${e.slice(74)}`;return t.push(e),t.join(`\r
`)}function k(r){return`${r.getFullYear()}${String(r.getMonth()+1).padStart(2,"0")}${String(r.getDate()).padStart(2,"0")}`}function I(r){return r.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z")}function V(r){return`${k(r)}T${String(r.getHours()).padStart(2,"0")}${String(r.getMinutes()).padStart(2,"0")}${String(r.getSeconds()).padStart(2,"0")}`}function ye(r,t){let e=G(r,t);return e.allDay?k(e.date):V(e.date)}function G(r,t){let e=/VALUE=DATE/i.test(t)||/^\d{8}$/.test(r);if(/^\d{8}$/.test(r))return{date:new Date(Number(r.slice(0,4)),Number(r.slice(4,6))-1,Number(r.slice(6,8))),allDay:e};let a=r.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);if(!a)return{date:new Date,allDay:e};let[,n,i,s,o,c,d,p]=a,u=[n,i,s,o,c,d].map(h=>Number(h));return p?{date:new Date(Date.UTC(u[0],u[1]-1,u[2],u[3],u[4],u[5])),allDay:e}:{date:new Date(u[0],u[1]-1,u[2],u[3],u[4],u[5]),allDay:e}}function R(r,t){return new Date(r.getTime()+t*6e4)}function ve(r){let t=new Date(r);return t.setSeconds(0,0),t.getMinutes()<30?t.setMinutes(30):t.setHours(t.getHours()+1,0,0,0),t}function be(r,t){let e=new Date(r);return e.setMonth(e.getMonth()+t),e}function we(r,t){let e=new Date(r);return e.setFullYear(e.getFullYear()+t),e}function b(r,t){let[e,a,n]=r.split("-").map(o=>Number(o)),[i,s]=t.split(":").map(o=>Number(o));return new Date(e,a-1,n,i||0,s||0,0)}function Ee(r){let[t,e,a]=r.date.split("-").map(s=>Number(s));if(r.allDay){let s=new Date(t,e-1,a);return{start:s,end:L(s,1)}}let n=b(r.date,r.startTime||"09:00"),i=b(r.date,r.endTime||"10:00");return i<=n&&(i=R(n,60)),{start:n,end:i}}function L(r,t){let e=new Date(r);return e.setDate(e.getDate()+t),e}function oe(r,t){let{start:e,end:a}=Ee(r),n=new Date,i=[`UID:${t}`,`DTSTAMP:${I(n)}`,`LAST-MODIFIED:${I(n)}`,`SUMMARY:${Y(r.title.trim())}`];r.allDay?(i.push(`DTSTART;VALUE=DATE:${k(e)}`),i.push(`DTEND;VALUE=DATE:${k(a)}`)):(i.push(`DTSTART:${V(e)}`),i.push(`DTEND:${V(a)}`)),r.location.trim()&&i.push(`LOCATION:${Y(r.location.trim())}`),r.notes.trim()&&i.push(`DESCRIPTION:${Y(r.notes.trim())}`);let s=De(r);return s&&i.push(`RRULE:${s}`),i}function De(r){if(r.repeat==="none")return"";let t=[];if(r.repeat==="daily"&&t.push("FREQ=DAILY"),r.repeat==="weekdays"&&t.push("FREQ=WEEKLY","BYDAY=MO,TU,WE,TH,FR"),r.repeat==="weekly"&&t.push("FREQ=WEEKLY"),r.repeat==="monthly"&&t.push("FREQ=MONTHLY"),r.repeat==="yearly"&&t.push("FREQ=YEARLY"),r.repeatUntil){let e=r.allDay?`${r.repeatUntil.replace(/-/g,"")}`:V(b(r.repeatUntil,r.endTime||"23:59"));t.push(`UNTIL=${e}`)}return t.join(";")}function le(r,t){return`${["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Home Base//Obsidian Calendar//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",`CREATED:${I(new Date)}`,...oe(r,t),"END:VEVENT","END:VCALENDAR"].map(X).join(`\r
`)}\r
`}function xe(r,t,e){let a=Q(r),n=a.findIndex(d=>d.toUpperCase()==="BEGIN:VEVENT"),i=a.findIndex((d,p)=>p>n&&d.toUpperCase()==="END:VEVENT");if(n===-1||i===-1)return le(t,e);let s=oe(t,e),o=new Set(["UID","DTSTAMP","LAST-MODIFIED","SUMMARY","DTSTART","DTEND","LOCATION","DESCRIPTION","RRULE"]);return`${[...a.slice(0,n+1),...s,...a.slice(n+1,i).filter(d=>{let p=ie(d);return!p||!o.has(p.name)}),...a.slice(i)].map(X).join(`\r
`)}\r
`}function Te(r,t,e,a){var x,S,O,v,w,Z,J,ee,te,ae;let n=Q(r),i=n.findIndex(f=>f.toUpperCase()==="BEGIN:VEVENT"),s=n.findIndex((f,E)=>E>i&&f.toUpperCase()==="END:VEVENT");if(i===-1||s===-1)return null;let o=n.slice(i+1,s).map(ie).filter(f=>!!f),c=f=>o.find(E=>E.name===f),d=f=>o.filter(E=>E.name===f),p=((x=c("UID"))==null?void 0:x.value)||((S=t.split("/").pop())==null?void 0:S.replace(/\.ics$/i,""))||crypto.randomUUID(),u=c("DTSTART");if(!u)return null;let h=G(u.value,u.params),m=c("DTEND"),g=m?G(m.value,m.params):{date:h.allDay?L(h.date,1):R(h.date,60),allDay:h.allDay},D=Ce((v=(O=c("RRULE"))==null?void 0:O.value)!=null?v:""),P=d("EXDATE").flatMap(f=>f.value.split(",").map(E=>ye(E,f.params)));return{uid:p,href:t,etag:e,title:j((Z=(w=c("SUMMARY"))==null?void 0:w.value)!=null?Z:""),start:h.date,end:g.date,allDay:h.allDay,location:j((ee=(J=c("LOCATION"))==null?void 0:J.value)!=null?ee:""),notes:j((ae=(te=c("DESCRIPTION"))==null?void 0:te.value)!=null?ae:""),repeat:D.repeat,repeatUntil:D.repeatUntil,exceptionDates:P,rawIcs:r,calendarName:a}}function Ce(r){if(!r)return{repeat:"none",repeatUntil:""};let t=Object.fromEntries(r.split(";").map(a=>{let[n,i=""]=a.split("=");return[n.toUpperCase(),i.toUpperCase()]})),e="none";return t.FREQ==="DAILY"&&(e="daily"),t.FREQ==="WEEKLY"&&t.BYDAY==="MO,TU,WE,TH,FR"?e="weekdays":t.FREQ==="WEEKLY"&&(e="weekly"),t.FREQ==="MONTHLY"&&(e="monthly"),t.FREQ==="YEARLY"&&(e="yearly"),{repeat:e,repeatUntil:t.UNTIL?`${t.UNTIL.slice(0,4)}-${t.UNTIL.slice(4,6)}-${t.UNTIL.slice(6,8)}`:""}}function ke(r){var e;let t=(e=r.occurrenceStart)!=null?e:r.start;return r.allDay?k(t):V(t)}function Ve(r,t){let e=Q(r),a=e.findIndex(o=>o.toUpperCase()==="END:VEVENT");if(a===-1)return r;let n=ke(t);if(t.exceptionDates.includes(n))return r;let i=t.allDay?`EXDATE;VALUE=DATE:${n}`:`EXDATE:${n}`;return`${[...e.slice(0,a),i,...e.slice(a)].map(X).join(`\r
`)}\r
`}function Se(r,t,e){return r.flatMap(a=>a.repeat==="none"?[a]:Ne(a,t,e))}function Ne(r,t,e){let a=r.end.getTime()-r.start.getTime(),n=r.repeatUntil?L(new Date(`${r.repeatUntil}T00:00:00`),1):e,i=[],s=new Date(r.start),o=0;for(;s<e&&s<n&&o<500;){o+=1;let c=new Date(s.getTime()+a),d=r.allDay?k(s):V(s),p=s.getDay()>=1&&s.getDay()<=5;if(c>=t&&s<e&&!r.exceptionDates.includes(d)&&(r.repeat!=="weekdays"||p)&&i.push({...r,start:new Date(s),end:c,occurrenceStart:new Date(s)}),r.repeat==="daily"||r.repeat==="weekdays")s=L(s,1);else if(r.repeat==="weekly")s=L(s,7);else if(r.repeat==="monthly")s=be(s,1);else if(r.repeat==="yearly")s=we(s,1);else break}return i}function y(r,t){let e=r instanceof Document?r.documentElement:r,a=Array.from(e.getElementsByTagName("*"));return e.localName===t&&a.unshift(e),a.filter(n=>n.localName===t)}function C(r,t){var e,a,n;return(n=(a=(e=y(r,t)[0])==null?void 0:e.textContent)==null?void 0:a.trim())!=null?n:""}function ne(r,t){let e=y(r,t)[0];return e?C(e,"href"):""}function U(r){return new DOMParser().parseFromString(r,"application/xml")}var Re=`
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
`,q=class extends l.Plugin{async onload(){this.settings=Object.assign({},ge,await this.loadData()),this.injectStyles(),this.registerView(T,t=>new F(t,this)),this.addRibbonIcon("home","Open Home Base",()=>{this.openDashboard()}),this.addCommand({id:"open-home-base",name:"Open Home Base",callback:()=>void this.openDashboard()}),this.addCommand({id:"refresh-home-base",name:"Refresh Home Base",callback:()=>void this.refreshDashboard()}),this.addSettingTab(new K(this.app,this)),await this.ensureDefaultFiles().catch(t=>{console.warn("Home Base could not create one or more default files.",t)}),this.settings.openOnStartup&&this.app.workspace.onLayoutReady(()=>{this.openDashboard()})}onunload(){var t;this.app.workspace.detachLeavesOfType(T),(t=this.styleEl)==null||t.remove()}async saveSettings(){await this.saveData(this.settings)}async openDashboard(){let t=this.app.workspace.getLeavesOfType(T)[0];if(t){this.app.workspace.revealLeaf(t);return}let e=this.app.workspace.getLeaf("tab");await e.setViewState({type:T,active:!0}),this.app.workspace.revealLeaf(e)}async refreshDashboard(){let t=this.app.workspace.getLeavesOfType(T);for(let e of t){let a=e.view;a instanceof F&&await a.render()}}async fetchCalendarEvents(t,e){if(!this.hasCalendarConfig())return{events:[],error:"",setupRequired:!0};try{let a=await this.getDefaultCalendar();if(!a)return{events:[],error:"No CalDAV event calendar was found.",setupRequired:!1};let n=`<?xml version="1.0" encoding="utf-8" ?>
<c:calendar-query xmlns:d="${$}" xmlns:c="${H}">
  <d:prop>
    <d:getetag />
    <c:calendar-data />
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${I(t)}" end="${I(e)}" />
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`,i=await this.caldavRequest(a.href,"REPORT",n,{Depth:"1"}),s=U(i.text);return{events:Se(y(s,"response").map(c=>{let d=N(a.href,C(c,"href")),p=C(c,"getetag"),u=C(c,"calendar-data");return u?Te(u,d,p,a.displayName):null}).filter(c=>!!c),t,e).filter(c=>c.end>=t&&c.start<e).sort((c,d)=>c.start.getTime()-d.start.getTime()),error:"",setupRequired:!1}}catch(a){return{events:[],error:this.readableCalendarError(a),setupRequired:!1}}}async saveCalendarEvent(t){let e=await this.getDefaultCalendar();if(!e){new l.Notice("Set up a default CalDAV calendar first.");return}let a=t.uid||crypto.randomUUID(),n=t.href||N(e.href,fe(a)),i=t.rawIcs?xe(t.rawIcs,t,a):le(t,a),s={"Content-Type":"text/calendar; charset=utf-8"};t.etag?s["If-Match"]=t.etag:s["If-None-Match"]="*";try{await this.caldavRequest(n,"PUT",i,s),new l.Notice("Calendar event saved.")}catch(o){throw new l.Notice(this.readableCalendarError(o)),o}}async saveCalendarOccurrence(t,e){await this.excludeCalendarOccurrence(t),await this.saveCalendarEvent({...e,uid:void 0,href:void 0,etag:void 0,rawIcs:void 0,repeat:"none",repeatUntil:""})}async deleteCalendarEvent(t,e=!1){try{if(e&&t.repeat!=="none"){await this.excludeCalendarOccurrence(t),new l.Notice("Calendar occurrence deleted.");return}await this.caldavRequest(t.href,"DELETE","",t.etag?{"If-Match":t.etag}:{}),new l.Notice("Calendar event deleted.")}catch(a){throw new l.Notice(this.readableCalendarError(a)),a}}async excludeCalendarOccurrence(t){let e=Ve(t.rawIcs,t);await this.caldavRequest(t.href,"PUT",e,{"Content-Type":"text/calendar; charset=utf-8",...t.etag?{"If-Match":t.etag}:{}})}async testCalendarConnection(){if(!this.hasCalendarCredentials())throw new Error("Fill in the CalDAV server URL, Apple ID email, and app-specific password first.");let t=await this.getDefaultCalendar(!0,!0);if(!t)throw new Error("No event calendar was found for this CalDAV account.");return t}hasCalendarCredentials(){return!!(this.settings.calendarServerUrl.trim()&&this.settings.calendarUsername.trim()&&this.settings.calendarPassword.trim())}hasCalendarConfig(){return!!(this.settings.calendarEnabled&&this.hasCalendarCredentials())}async getDefaultCalendar(t=!1,e=!1){var s,o;if(e?!this.hasCalendarCredentials():!this.hasCalendarConfig())return null;if(this.settings.calendarUrl.trim()&&!t)return{href:A(this.settings.calendarUrl),displayName:this.settings.calendarName||"Calendar",writable:!0};let a=await this.discoverCalendars(),n=a.filter(c=>c.writable),i=(o=(s=a.find(c=>c.href===A(this.settings.calendarUrl)))!=null?s:n[0])!=null?o:a[0];return i?(this.settings.calendarUrl=i.href,this.settings.calendarName=i.displayName,await this.saveSettings(),i):null}async discoverCalendars(){let t=A(this.settings.calendarServerUrl),e=await this.caldavRequest(t,"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${$}">
  <d:prop>
    <d:current-user-principal />
  </d:prop>
</d:propfind>`,{Depth:"0"}),a=U(e.text),n=ne(a,"current-user-principal");if(!n)throw new Error("CalDAV server did not return a principal URL.");let i=await this.caldavRequest(N(t,n),"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${$}" xmlns:c="${H}">
  <d:prop>
    <c:calendar-home-set />
  </d:prop>
</d:propfind>`,{Depth:"0"}),s=U(i.text),o=ne(s,"calendar-home-set");if(!o)throw new Error("CalDAV server did not return a calendar home.");let c=N(t,o),d=await this.caldavRequest(c,"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${$}" xmlns:c="${H}">
  <d:prop>
    <d:displayname />
    <d:resourcetype />
    <d:current-user-privilege-set />
    <c:supported-calendar-component-set />
  </d:prop>
</d:propfind>`,{Depth:"1"}),p=U(d.text);return y(p,"response").map(u=>{let h=C(u,"href"),m=y(u,"resourcetype")[0],g=!!(m&&y(m,"calendar").length),D=y(u,"comp").map(v=>{var w;return((w=v.getAttribute("name"))!=null?w:"").toUpperCase()}),P=!D.length||D.includes("VEVENT"),x=y(u,"current-user-privilege-set")[0],S=x?y(x,"privilege").flatMap(v=>Array.from(v.children).map(w=>w.localName)):[],O=!S.length||S.some(v=>["write","write-content","bind","unbind"].includes(v));return!h||!g||!P?null:{href:N(c,h),displayName:C(u,"displayname")||"Calendar",writable:O}}).filter(u=>!!u)}async caldavRequest(t,e,a="",n={}){let i=await(0,l.requestUrl)({url:t,method:e,body:a,headers:{Authorization:`Basic ${btoa(`${this.settings.calendarUsername}:${this.settings.calendarPassword}`)}`,"Content-Type":"application/xml; charset=utf-8",...n}});if(i.status>=400)throw i.status===401||i.status===403?new Error("Calendar authentication failed. Check your Apple ID and app-specific password."):i.status===405?new Error("This calendar does not allow that sync action. Choose a normal writable iCloud calendar."):i.status===409||i.status===412?new Error("This event changed remotely. Refresh Home Base and try again."):new Error(`CalDAV request failed with status ${i.status}.`);return i}readableCalendarError(t){return t instanceof Error?t.message:"Calendar sync failed."}async ensureDefaultFiles(){await this.ensureFile(this.settings.todoInboxPath,se),await this.ensureFile(this.settings.workoutPlanPath,_),await this.ensureFile(this.settings.workoutLogPath,re)}async ensureFile(t,e){let a=(0,l.normalizePath)(t),n=this.app.vault.getAbstractFileByPath(a);if(n instanceof l.TFile)return;if(n)throw new Error(`Expected a file path but found a folder: ${a}`);let i=a.split("/").slice(0,-1).join("/");i&&await this.ensureFolder(i),await this.app.vault.create(a,e)}async ensureFolder(t){let e=(0,l.normalizePath)(t).split("/"),a="";for(let n of e){a=a?`${a}/${n}`:n;let i=this.app.vault.getAbstractFileByPath(a);if(i instanceof l.TFile)throw new Error(`Expected a folder path but found a file: ${a}`);i||await this.app.vault.createFolder(a)}}injectStyles(){var t;(t=this.styleEl)==null||t.remove(),this.styleEl=document.createElement("style"),this.styleEl.id="home-base-runtime-styles",this.styleEl.textContent=Re,document.head.appendChild(this.styleEl)}},F=class extends l.ItemView{constructor(t,e){super(t),this.plugin=e}getViewType(){return T}getDisplayText(){return"Home Base"}getIcon(){return"home"}async onOpen(){await this.render()}async render(){let t=this.containerEl.children[1];t.empty(),t.addClass("home-base-view");let e=await this.loadTodos(),a=await this.loadWorkoutPlan(),n=await this.loadWorkoutLog(),i=await this.plugin.fetchCalendarEvents(this.startOfDay(new Date),this.addDays(new Date,8)),s=this.getWorkoutState(a,n);this.renderHeader(t);let o=t.createDiv({cls:"home-base-grid"}),c=o.createDiv({cls:"home-base-column home-base-left"}),d=o.createDiv({cls:"home-base-column home-base-right"});this.renderCalendar(c,i),this.renderWorkout(c,a,s),this.renderTodos(d,e)}renderHeader(t){let e=t.createDiv({cls:"home-base-header"}),a=new Date,n=e.createDiv();n.createEl("h1",{text:"Home Base"}),n.createDiv({cls:"home-base-date",text:a.toLocaleDateString(void 0,{weekday:"long",year:"numeric",month:"long",day:"numeric"})}),n.createDiv({cls:"home-base-greeting",text:this.getGreeting()});let i=e.createEl("button",{cls:"home-base-icon-button",attr:{"aria-label":"Refresh"}});i.setText("Refresh"),i.onClickEvent(()=>void this.render())}renderCalendar(t,e){let a=t.createDiv({cls:"home-base-panel home-base-calendar-panel"}),n=a.createDiv({cls:"home-base-panel-title"});n.createEl("span",{cls:"home-base-icon",text:"Cal"}),n.createEl("h2",{text:"Calendar"}),this.plugin.settings.calendarName&&n.createEl("span",{cls:"home-base-pill",text:this.plugin.settings.calendarName});let i=a.createDiv({cls:"home-base-calendar-controls"}),s=i.createEl("button",{cls:"mod-cta home-base-primary-button",text:"+ Event"});if(s.disabled=e.setupRequired||!!e.error,s.onClickEvent(()=>{new B(this.app,this.plugin,void 0,()=>void this.render()).open()}),i.createEl("button",{cls:"home-base-secondary-button",text:"Refresh"}).onClickEvent(()=>void this.render()),e.setupRequired){let m=a.createDiv({cls:"home-base-schedule-empty"});m.createDiv({cls:"home-base-calendar-mark",text:"CalDAV"});let g=m.createDiv();g.createEl("strong",{text:"Connect iCloud Calendar"}),g.createEl("p",{text:"Enable Calendar in Home Base settings, then add your iCloud CalDAV account and default calendar."});return}if(e.error){let m=a.createDiv({cls:"home-base-calendar-error"});m.createEl("strong",{text:"Calendar could not sync"}),m.createEl("p",{text:e.error});return}let c=this.startOfDay(new Date),d=this.addDays(c,1),p=this.addDays(c,7),u=e.events.filter(m=>this.eventOccursOn(m,c)),h=e.events.filter(m=>{let g=this.startOfDay(m.start);return g>=d&&g<=p});this.renderCalendarGroup(a,"Today",u,"No events today"),this.renderCalendarGroup(a,"Next 7 Days",h,"No upcoming events")}renderCalendarGroup(t,e,a,n){let i=t.createDiv({cls:"home-base-calendar-group"});if(i.createEl("h3",{text:e}),!a.length){i.createEl("p",{cls:"home-base-muted home-base-italic",text:n});return}for(let s of a)this.renderCalendarEvent(i,s)}renderCalendarEvent(t,e){let a=t.createDiv({cls:"home-base-calendar-event"}),n=a.createDiv({cls:"home-base-calendar-time",text:this.formatCalendarEventTime(e)});e.allDay&&n.addClass("is-all-day");let i=a.createDiv({cls:"home-base-calendar-body"});i.createDiv({cls:"home-base-calendar-title",text:e.title||"Untitled event"});let s=i.createDiv({cls:"home-base-calendar-meta"});this.eventOccursOn(e,this.startOfDay(new Date))||s.createEl("span",{text:this.formatCalendarDate(e.start)}),e.location&&s.createEl("span",{text:e.location}),e.repeat!=="none"&&s.createEl("span",{text:this.formatRepeatLabel(e.repeat)});let o=a.createDiv({cls:"home-base-actions"});o.createEl("button",{cls:"home-base-ghost-button",text:"Edit"}).onClickEvent(()=>new B(this.app,this.plugin,e,()=>void this.render()).open()),o.createEl("button",{cls:"home-base-ghost-button",text:"Delete"}).onClickEvent(async()=>{if(!confirm(`Delete "${e.title||"Untitled event"}"?`))return;let u=e.repeat!=="none"&&confirm("Delete only this event? Press Cancel to delete the whole repeating series.");await this.plugin.deleteCalendarEvent(e,u),await this.render()})}renderTodos(t,e){let a=t.createDiv({cls:"home-base-panel home-base-todo-panel"}),n=a.createDiv({cls:"home-base-panel-title home-base-todo-title"});n.createEl("span",{cls:"home-base-icon",text:"Task"}),n.createEl("h2",{text:"Todo Manager"}),a.createDiv({cls:"home-base-todo-controls"}).createEl("button",{cls:"mod-cta home-base-primary-button",text:"+ New Todo"}).onClickEvent(()=>{new W(this.app,this.plugin,void 0,()=>void this.render()).open()});let o=this.groupTodos(e);for(let c of["Overdue","Today","Tomorrow","Next 7 Days","No Due Date","Later"]){let d=o[c];if(!d.length&&c==="Later")continue;let p=a.createDiv({cls:"home-base-todo-group"});if(p.createEl("h3",{text:c}),!d.length){p.createEl("p",{cls:"home-base-muted home-base-italic",text:c==="Tomorrow"?"No todos due tomorrow":`No todos in ${c.toLowerCase()}`});continue}for(let u of d)this.renderTodoItem(p,u)}}renderTodoItem(t,e){let a=t.createDiv({cls:`home-base-todo-item ${e.completed?"is-complete":""}`}),n=a.createEl("input",{cls:"home-base-checkbox"});n.type="checkbox",n.checked=e.completed,n.onClickEvent(async()=>{await this.setTodoCompletion(e,n.checked),await this.render()});let i=a.createDiv({cls:"home-base-todo-body"});i.createDiv({cls:"home-base-todo-name",text:e.title});let s=i.createDiv({cls:"home-base-todo-meta"});s.createEl("span",{cls:"home-base-due",text:e.due?this.formatDue(e.due):"No due date"}),e.priority&&s.createEl("span",{cls:`home-base-priority is-${e.priority}`,text:this.capitalize(e.priority)});for(let p of e.tags)s.createEl("span",{cls:"home-base-tag",text:p});let o=a.createDiv({cls:"home-base-actions"});o.createEl("button",{cls:"home-base-ghost-button",text:"Edit"}).onClickEvent(()=>new W(this.app,this.plugin,e,()=>void this.render()).open()),o.createEl("button",{cls:"home-base-ghost-button",text:"Delete"}).onClickEvent(async()=>{await this.deleteTodo(e),await this.render()})}renderWorkout(t,e,a){var h;let n=t.createDiv({cls:"home-base-panel"}),i=n.createDiv({cls:"home-base-panel-title"});if(i.createEl("span",{cls:"home-base-icon",text:"Fit"}),i.createEl("h2",{text:"Workout"}),a.unresolved){let m=n.createDiv({cls:"home-base-unresolved"});m.createDiv({text:`Yesterday's workout was not resolved: ${a.unresolved.workout}`});let g=m.createDiv({cls:"home-base-unresolved-actions"});g.createEl("button",{text:"Mark Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(a.unresolved.date,a.unresolved.workout,"done"),await this.render()}),g.createEl("button",{text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(a.unresolved.date,a.unresolved.workout,"skipped"),await this.render()}),g.createEl("button",{text:"Keep Pending"}).onClickEvent(async()=>{new l.Notice("Kept as pending.")})}n.createEl("h3",{text:"Today's Workout"}),n.createEl("div",{cls:"home-base-workout-name",text:a.todayWorkout});let s=(h=e.types[a.todayWorkout])!=null?h:[];if(s.length){let m=n.createEl("ul",{cls:"home-base-exercises"});for(let g of s)m.createEl("li",{text:g})}else n.createEl("p",{cls:"home-base-muted",text:"No exercises configured for this workout."});n.createEl("button",{cls:"home-base-wide-button",text:"Edit Routine"}).onClickEvent(()=>{new z(this.app,this.plugin,e,()=>void this.render()).open()});let c=n.createDiv({cls:"home-base-workout-actions"});c.createEl("button",{cls:"mod-cta home-base-primary-button",text:"Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),a.todayWorkout,"done"),await this.render()}),c.createEl("button",{cls:"home-base-secondary-button",text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),a.todayWorkout,"skipped"),await this.render()});let u=n.createDiv({cls:"home-base-sequence"});u.createEl("h3",{text:"Routine Sequence"}),u.createDiv({text:e.sequence.length?e.sequence.join(" > "):"No sequence configured"})}async loadTodos(){let t=this.plugin.settings.todoScanFolders.split(",").map(n=>(0,l.normalizePath)(n.trim())).filter(Boolean),e=this.app.vault.getMarkdownFiles().filter(n=>t.length?t.some(i=>n.path===i||n.path.startsWith(`${i}/`)):!0),a=[];for(let n of e)(await this.app.vault.cachedRead(n)).split(`
`).forEach((o,c)=>{let d=this.parseTodoLine(o,n,c);d&&a.push(d)});return a.sort((n,i)=>this.compareTodos(n,i))}parseTodoLine(t,e,a){var p,u,h,m;let n=t.match(/^\s*[-*]\s+\[( |x|X)]\s+(.+)$/);if(!n)return null;let i=n[1].toLowerCase()==="x",s=n[2].trim(),o=s.match(/\sdue::\s*(\d{4}-\d{2}-\d{2})/),c=s.match(/\spriority::\s*(high|medium|low)/i),d=(p=s.match(/#[\w/-]+/g))!=null?p:[];return s=s.replace(/\sdue::\s*\d{4}-\d{2}-\d{2}/,"").replace(/\spriority::\s*(high|medium|low)/i,"").replace(/#[\w/-]+/g,"").trim(),{id:`${e.path}:${a}`,title:s,due:(u=o==null?void 0:o[1])!=null?u:"",priority:(m=(h=c==null?void 0:c[1])==null?void 0:h.toLowerCase())!=null?m:"",tags:d,completed:i,file:e,line:a,raw:t}}groupTodos(t){let e={Overdue:[],Today:[],Tomorrow:[],"Next 7 Days":[],"No Due Date":[],Later:[]},a=this.startOfDay(new Date),n=this.addDays(a,1),i=this.addDays(a,7);for(let s of t.filter(o=>!o.completed)){if(!s.due){e["No Due Date"].push(s);continue}let o=this.parseDate(s.due);o<a?e.Overdue.push(s):o.getTime()===a.getTime()?e.Today.push(s):o.getTime()===n.getTime()?e.Tomorrow.push(s):o<=i?e["Next 7 Days"].push(s):e.Later.push(s)}return e}async loadWorkoutPlan(){await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,_);let t=this.app.vault.getAbstractFileByPath((0,l.normalizePath)(this.plugin.settings.workoutPlanPath));if(!(t instanceof l.TFile))return{types:{},sequence:[]};let a=(await this.app.vault.cachedRead(t)).split(`
`),n={},i=[],s="",o="";for(let c of a){let d=c.trim();if(/^#\s+Workout Types/i.test(d)){s="types",o="";continue}if(/^#\s+Sequence/i.test(d)){s="sequence",o="";continue}if(s==="types"&&d.startsWith("## ")){o=d.replace(/^##\s+/,"").trim(),n[o]=[];continue}if(s==="types"&&o){let p=d.replace(/^[-*]\s+/,"").trim();p&&n[o].push(p)}s==="sequence"&&/^[-*]\s+/.test(d)&&i.push(d.replace(/^[-*]\s+/,"").trim())}return{types:n,sequence:i}}async loadWorkoutLog(){await this.plugin.ensureFile(this.plugin.settings.workoutLogPath,re);let t=this.app.vault.getAbstractFileByPath((0,l.normalizePath)(this.plugin.settings.workoutLogPath));return t instanceof l.TFile?(await this.app.vault.cachedRead(t)).split(`
`).map(a=>{var o,c,d,p;let n=(o=a.match(/date::\s*(\d{4}-\d{2}-\d{2})/))==null?void 0:o[1],i=(d=(c=a.match(/workout::\s*([^]+?)\s+status::/))==null?void 0:c[1])==null?void 0:d.trim(),s=(p=a.match(/status::\s*(done|skipped|pending)/))==null?void 0:p[1];return!n||!i||!s?null:{date:n,workout:i,status:s}}).filter(a=>!!a):[]}getWorkoutState(t,e){let a=t.sequence.length?t.sequence:Object.keys(t.types),n=e.filter(d=>d.status==="done").length,i=a.length?a[n%a.length]:"No workout configured",s=this.dateKey(this.addDays(new Date,-1)),c=e.filter(d=>d.date===s).length?null:{date:s,workout:i};return{todayWorkout:i,unresolved:c}}async appendWorkoutLog(t,e,a){let n=this.app.vault.getAbstractFileByPath((0,l.normalizePath)(this.plugin.settings.workoutLogPath));if(!(n instanceof l.TFile))return;let i=await this.app.vault.cachedRead(n),s=`- date:: ${t} workout:: ${e} status:: ${a}`;await this.app.vault.modify(n,`${i.trimEnd()}
${s}
`),new l.Notice(`Workout marked ${a}.`)}async setTodoCompletion(t,e){let n=(await this.app.vault.cachedRead(t.file)).split(`
`);n[t.line]=t.raw.replace(/\[( |x|X)]/,e?"[x]":"[ ]"),await this.app.vault.modify(t.file,n.join(`
`))}async deleteTodo(t){if(!confirm(`Delete "${t.title}"?`))return;let n=(await this.app.vault.cachedRead(t.file)).split(`
`);n.splice(t.line,1),await this.app.vault.modify(t.file,n.join(`
`))}compareTodos(t,e){let a=t.due||"9999-12-31",n=e.due||"9999-12-31";if(a!==n)return a.localeCompare(n);let i={high:0,medium:1,low:2,"":3};return i[t.priority]-i[e.priority]}formatDue(t){let e=this.todayKey();return t===e?"Today":t===this.dateKey(this.addDays(new Date,1))?"Tomorrow":new Date(`${t}T00:00:00`).toLocaleDateString(void 0,{month:"short",day:"numeric"})}eventOccursOn(t,e){let a=this.startOfDay(t.start),n=this.startOfDay(t.allDay?this.addDays(t.end,-1):t.end);return a<=e&&n>=e}formatCalendarEventTime(t){if(t.allDay)return"All day";let e=t.start.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),a=t.end.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"});return`${e} - ${a}`}formatCalendarDate(t){return t.toLocaleDateString(void 0,{weekday:"short",month:"short",day:"numeric"})}formatRepeatLabel(t){return{none:"",daily:"Repeats daily",weekdays:"Repeats weekdays",weekly:"Repeats weekly",monthly:"Repeats monthly",yearly:"Repeats yearly"}[t]}getGreeting(){let t=new Date().getHours();return t<12?"Good morning":t<18?"Good afternoon":"Good evening"}parseDate(t){return new Date(`${t}T00:00:00`)}startOfDay(t){return new Date(t.getFullYear(),t.getMonth(),t.getDate())}addDays(t,e){let a=new Date(t);return a.setDate(a.getDate()+e),this.startOfDay(a)}todayKey(){return this.dateKey(new Date)}dateKey(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}capitalize(t){return t.charAt(0).toUpperCase()+t.slice(1)}},W=class extends l.Modal{constructor(e,a,n,i){super(e);this.titleValue="";this.dueValue="";this.priorityValue="medium";this.tagsValue="";this.plugin=a,this.todo=n,this.onSave=i,n&&(this.titleValue=n.title,this.dueValue=n.due,this.priorityValue=n.priority||"medium",this.tagsValue=n.tags.join(" "))}onOpen(){let{contentEl:e}=this;e.empty(),e.addClass("home-base-modal"),e.createEl("h2",{text:this.todo?"Edit Todo":"New Todo"}),new l.Setting(e).setName("Title").addText(a=>{a.setValue(this.titleValue),a.onChange(n=>{this.titleValue=n})}),new l.Setting(e).setName("Due date").addText(a=>{a.inputEl.type="date",a.setValue(this.dueValue),a.onChange(n=>{this.dueValue=n})}),new l.Setting(e).setName("Priority").addDropdown(a=>{a.addOption("high","High").addOption("medium","Medium").addOption("low","Low").setValue(this.priorityValue||"medium").onChange(n=>{this.priorityValue=n})}),new l.Setting(e).setName("Tags").setDesc("Use Markdown tags, for example #school #writing.").addText(a=>{a.setPlaceholder("#school #writing"),a.setValue(this.tagsValue),a.onChange(n=>{this.tagsValue=n})}),new l.Setting(e).addButton(a=>{a.setButtonText("Cancel").onClick(()=>this.close())}).addButton(a=>{a.setButtonText("Save").setCta().onClick(()=>void this.saveTodo())})}async saveTodo(){if(!this.titleValue.trim()){new l.Notice("Todo title is required.");return}let e=this.formatTodoLine();if(this.todo){let n=(await this.app.vault.cachedRead(this.todo.file)).split(`
`);n[this.todo.line]=e.replace("- [ ]",this.todo.completed?"- [x]":"- [ ]"),await this.app.vault.modify(this.todo.file,n.join(`
`))}else{await this.plugin.ensureFile(this.plugin.settings.todoInboxPath,se);let a=this.app.vault.getAbstractFileByPath((0,l.normalizePath)(this.plugin.settings.todoInboxPath));if(!(a instanceof l.TFile))return;let n=await this.app.vault.cachedRead(a);await this.app.vault.modify(a,`${n.trimEnd()}
${e}
`)}this.close(),this.onSave()}formatTodoLine(){let e=this.tagsValue.split(/\s+/).filter(Boolean).map(s=>s.startsWith("#")?s:`#${s}`).join(" "),a=this.dueValue?` due:: ${this.dueValue}`:"",n=this.priorityValue?` priority:: ${this.priorityValue}`:"",i=e?` ${e}`:"";return`- [ ] ${this.titleValue.trim()}${a}${n}${i}`}},B=class extends l.Modal{constructor(e,a,n,i){super(e);this.titleValue="";this.dateValue="";this.startTimeValue="09:00";this.endTimeValue="10:00";this.allDayValue=!1;this.locationValue="";this.notesValue="";this.repeatValue="none";this.repeatUntilValue="";this.durationMinutes=60;if(this.plugin=a,this.event=n,this.onSave=i,n)this.titleValue=n.title,this.dateValue=this.dateInputValue(n.start),this.startTimeValue=this.timeInputValue(n.start),this.endTimeValue=this.timeInputValue(n.end),this.allDayValue=n.allDay,this.locationValue=n.location,this.notesValue=n.notes,this.repeatValue=n.repeat,this.repeatUntilValue=n.repeatUntil,this.durationMinutes=Math.max(1,Math.round((n.end.getTime()-n.start.getTime())/6e4));else{let s=ve(new Date),o=R(s,this.durationMinutes);this.dateValue=this.dateInputValue(s),this.startTimeValue=this.timeInputValue(s),this.endTimeValue=this.timeInputValue(o)}}onOpen(){this.render()}render(){let{contentEl:e}=this;e.empty(),e.addClass("home-base-modal"),e.createEl("h2",{text:this.event?"Edit Event":"New Event"}),new l.Setting(e).setName("Title").addText(s=>{s.setValue(this.titleValue),s.onChange(o=>{this.titleValue=o})}),new l.Setting(e).setName("All day").addToggle(s=>{s.setValue(this.allDayValue),s.onChange(o=>{this.allDayValue=o,this.render()})}),new l.Setting(e).setName("Date").addText(s=>{s.inputEl.type="date",s.setValue(this.dateValue),s.onChange(o=>{this.dateValue=o})}),this.allDayValue||(new l.Setting(e).setName("Start time").addText(s=>{s.inputEl.type="time",s.setValue(this.startTimeValue),s.onChange(o=>{this.startTimeValue=o,this.followStartTime()})}),new l.Setting(e).setName("End time").addText(s=>{s.inputEl.type="time",this.endTimeInput=s.inputEl,s.setValue(this.endTimeValue),s.onChange(o=>{this.endTimeValue=o,this.updateDurationFromEnd()})})),new l.Setting(e).setName("Repeat").addDropdown(s=>{s.addOption("none","Never").addOption("daily","Every day").addOption("weekdays","Every weekday").addOption("weekly","Every week").addOption("monthly","Every month").addOption("yearly","Every year").setValue(this.repeatValue).onChange(o=>{this.repeatValue=o,this.repeatValue==="none"&&(this.repeatUntilValue=""),this.render()})}),this.repeatValue!=="none"&&new l.Setting(e).setName("Repeat until").setDesc("Optional").addText(s=>{s.inputEl.type="date",s.setValue(this.repeatUntilValue),s.onChange(o=>{this.repeatUntilValue=o})}),new l.Setting(e).setName("Location").addText(s=>{s.setValue(this.locationValue),s.onChange(o=>{this.locationValue=o})}),new l.Setting(e).setName("Notes").addTextArea(s=>{s.setValue(this.notesValue),s.onChange(o=>{this.notesValue=o})});let a=e.createDiv({cls:"home-base-modal-footer"});this.event&&a.createEl("button",{text:"Delete"}).onClickEvent(()=>void this.deleteEvent()),a.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),a.createEl("button",{cls:"mod-cta",text:"Save Event"}).onClickEvent(()=>void this.saveEvent())}async saveEvent(){var a,n,i,s,o;if(!this.titleValue.trim()){new l.Notice("Event title is required.");return}if(!this.dateValue){new l.Notice("Event date is required.");return}this.ensureEndAfterStart(!1);let e={uid:(a=this.event)==null?void 0:a.uid,href:(n=this.event)==null?void 0:n.href,etag:(i=this.event)==null?void 0:i.etag,rawIcs:(s=this.event)==null?void 0:s.rawIcs,title:this.titleValue,date:this.dateValue,startTime:this.startTimeValue,endTime:this.endTimeValue,allDay:this.allDayValue,location:this.locationValue,notes:this.notesValue,repeat:this.repeatValue,repeatUntil:this.repeatUntilValue};(o=this.event)!=null&&o.repeat&&this.event.repeat!=="none"?confirm("Edit only this event? Press Cancel to edit the whole repeating series.")?await this.plugin.saveCalendarOccurrence(this.event,e):await this.plugin.saveCalendarEvent(e):await this.plugin.saveCalendarEvent(e),this.close(),this.onSave()}async deleteEvent(){if(!this.event||!confirm(`Delete "${this.event.title||"Untitled event"}"?`))return;let a=this.event.repeat!=="none"&&confirm("Delete only this event? Press Cancel to delete the whole repeating series.");await this.plugin.deleteCalendarEvent(this.event,a),this.close(),this.onSave()}ensureEndAfterStart(e){if(this.allDayValue||!this.dateValue||!this.startTimeValue||!this.endTimeValue)return;let a=b(this.dateValue,this.startTimeValue);if(b(this.dateValue,this.endTimeValue)>a)return;let i=R(a,Math.max(this.durationMinutes,60));this.endTimeValue=this.timeInputValue(i),this.endTimeInput&&(this.endTimeInput.value=this.endTimeValue),e||new l.Notice("End time was adjusted to be after the start time.")}followStartTime(){if(this.allDayValue||!this.dateValue||!this.startTimeValue)return;let e=b(this.dateValue,this.startTimeValue),a=R(e,Math.max(this.durationMinutes,1));this.endTimeValue=this.timeInputValue(a),this.endTimeInput&&(this.endTimeInput.value=this.endTimeValue)}updateDurationFromEnd(){if(this.allDayValue||!this.dateValue||!this.startTimeValue||!this.endTimeValue)return;let e=b(this.dateValue,this.startTimeValue),a=b(this.dateValue,this.endTimeValue);if(a<=e){this.durationMinutes=60,this.ensureEndAfterStart(!1);return}this.durationMinutes=Math.max(1,Math.round((a.getTime()-e.getTime())/6e4))}dateInputValue(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}timeInputValue(e){return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}},z=class extends l.Modal{constructor(t,e,a,n){super(t),this.plugin=e,this.plan={types:Object.fromEntries(Object.entries(a.types).map(([i,s])=>[i,[...s]])),sequence:[...a.sequence]},this.onSave=n}onOpen(){this.render()}render(){let{contentEl:t}=this;t.empty(),t.addClass("home-base-modal","home-base-routine-modal"),t.createEl("h2",{text:"Edit Workout Routine"});let e=t.createDiv({cls:"home-base-routine-section"}),a=e.createDiv({cls:"home-base-routine-section-header"});a.createEl("h3",{text:"Workout Types"}),a.createEl("button",{text:"+ Add Type"}).onClickEvent(()=>{let h=this.uniqueWorkoutName("New Workout");this.plan.types[h]=[],this.plan.sequence.push(h),this.render()});let i=Object.keys(this.plan.types);i.length||e.createEl("p",{cls:"home-base-muted home-base-italic",text:"Create a workout type to start your sequence."});for(let h of i)this.renderWorkoutType(e,h);let s=t.createDiv({cls:"home-base-routine-section"}),o=s.createDiv({cls:"home-base-routine-section-header"});o.createEl("h3",{text:"Sequence Order"});let c=o.createEl("button",{text:"+ Add Step"});c.disabled=!i.length,c.onClickEvent(()=>{let h=Object.keys(this.plan.types)[0];h&&(this.plan.sequence.push(h),this.render())}),this.plan.sequence.length||s.createEl("p",{cls:"home-base-muted home-base-italic",text:"No sequence steps yet."}),this.plan.sequence.forEach((h,m)=>{this.renderSequenceStep(s,h,m)});let d=t.createDiv({cls:"home-base-modal-footer"});d.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),d.createEl("button",{cls:"mod-cta",text:"Save Routine"}).onClickEvent(()=>void this.saveRoutine())}renderWorkoutType(t,e){let a=t.createDiv({cls:"home-base-routine-card"}),n=a.createDiv({cls:"home-base-routine-card-row"}),i=n.createEl("input",{cls:"home-base-routine-name"});i.type="text",i.value=e,i.placeholder="Workout name",i.onchange=()=>{this.renameWorkoutType(e,i.value.trim())},n.createEl("button",{text:"Delete"}).onClickEvent(()=>{delete this.plan.types[e],this.plan.sequence=this.plan.sequence.filter(c=>c!==e),this.render()});let o=a.createEl("textarea",{cls:"home-base-routine-exercises"});o.placeholder="One exercise per line",o.value=this.plan.types[e].join(`
`),o.onchange=()=>{this.plan.types[e]=o.value.split(`
`).map(c=>c.trim()).filter(Boolean)}}renderSequenceStep(t,e,a){let n=t.createDiv({cls:"home-base-sequence-row"});n.createEl("span",{cls:"home-base-sequence-index",text:`${a+1}`});let i=n.createEl("select");for(let d of Object.keys(this.plan.types)){let p=i.createEl("option",{text:d,value:d});p.selected=d===e}i.onchange=()=>{this.plan.sequence[a]=i.value};let s=n.createEl("button",{text:"Up"});s.disabled=a===0,s.onClickEvent(()=>{this.moveSequenceStep(a,a-1),this.render()});let o=n.createEl("button",{text:"Down"});o.disabled=a===this.plan.sequence.length-1,o.onClickEvent(()=>{this.moveSequenceStep(a,a+1),this.render()}),n.createEl("button",{text:"Remove"}).onClickEvent(()=>{this.plan.sequence.splice(a,1),this.render()})}renameWorkoutType(t,e){if(!e||e===t)return;if(this.plan.types[e]){new l.Notice("A workout type with that name already exists."),this.render();return}let a=Object.entries(this.plan.types);this.plan.types=Object.fromEntries(a.map(([n,i])=>n===t?[e,i]:[n,i])),this.plan.sequence=this.plan.sequence.map(n=>n===t?e:n),this.render()}moveSequenceStep(t,e){let[a]=this.plan.sequence.splice(t,1);this.plan.sequence.splice(e,0,a)}uniqueWorkoutName(t){if(!this.plan.types[t])return t;let e=2;for(;this.plan.types[`${t} ${e}`];)e+=1;return`${t} ${e}`}async saveRoutine(){let t=Object.keys(this.plan.types).filter(Boolean);if(!t.length){new l.Notice("Add at least one workout type.");return}this.plan.sequence=this.plan.sequence.filter(a=>!!this.plan.types[a]),this.plan.sequence.length||(this.plan.sequence=[t[0]]),await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,_);let e=this.app.vault.getAbstractFileByPath((0,l.normalizePath)(this.plugin.settings.workoutPlanPath));e instanceof l.TFile&&(await this.app.vault.modify(e,this.formatWorkoutPlan()),new l.Notice("Workout routine saved."),this.close(),this.onSave())}formatWorkoutPlan(){let t=["# Workout Types",""];for(let[e,a]of Object.entries(this.plan.types))t.push(`## ${e}`),a.length?t.push(...a.map(n=>`- ${n}`)):t.push("Rest day"),t.push("");return t.push("# Sequence",""),t.push(...this.plan.sequence.map(e=>`- ${e}`)),t.push(""),t.join(`
`)}},K=class extends l.PluginSettingTab{constructor(t,e){super(t,e),this.plugin=e}display(){let{containerEl:t}=this;t.empty(),t.createEl("h2",{text:"Home Base Settings"}),new l.Setting(t).setName("Open on startup").setDesc("Automatically open the Home Base dashboard when Obsidian starts.").addToggle(e=>{e.setValue(this.plugin.settings.openOnStartup).onChange(async a=>{this.plugin.settings.openOnStartup=a,await this.plugin.saveSettings()})}),t.createEl("h3",{text:"Calendar"}),new l.Setting(t).setName("Enable calendar").setDesc("Connect a writable CalDAV calendar, such as iCloud Calendar.").addToggle(e=>{e.setValue(this.plugin.settings.calendarEnabled).onChange(async a=>{this.plugin.settings.calendarEnabled=a,await this.plugin.saveSettings()})}),new l.Setting(t).setName("CalDAV server URL").setDesc("For iCloud, use https://caldav.icloud.com.").addText(e=>{e.setPlaceholder("https://caldav.icloud.com").setValue(this.plugin.settings.calendarServerUrl).onChange(async a=>{this.plugin.settings.calendarServerUrl=a.trim(),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Calendar username").setDesc("For iCloud, use your Apple ID email.").addText(e=>{e.setPlaceholder("name@example.com").setValue(this.plugin.settings.calendarUsername).onChange(async a=>{this.plugin.settings.calendarUsername=a.trim(),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Calendar password").setDesc("For iCloud, use an app-specific password.").addText(e=>{e.inputEl.type="password",e.setValue(this.plugin.settings.calendarPassword).onChange(async a=>{this.plugin.settings.calendarPassword=a,await this.plugin.saveSettings()})}),new l.Setting(t).setName("Default calendar URL").setDesc("Leave blank and use Test connection to auto-select an event calendar.").addText(e=>{e.setPlaceholder("https://caldav.icloud.com/...").setValue(this.plugin.settings.calendarUrl).onChange(async a=>{this.plugin.settings.calendarUrl=a.trim(),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Default calendar name").setDesc("Shown in the dashboard header.").addText(e=>{e.setPlaceholder("Calendar").setValue(this.plugin.settings.calendarName).onChange(async a=>{this.plugin.settings.calendarName=a.trim(),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Test calendar connection").setDesc("Discovers CalDAV event calendars and prefers a writable calendar when iCloud reports permissions.").addButton(e=>{e.setButtonText("Test"),e.onClick(async()=>{try{let a=await this.plugin.testCalendarConnection();new l.Notice(`Connected to ${a.displayName}.`),this.display()}catch(a){new l.Notice(a instanceof Error?a.message:"Calendar connection failed.")}})}),t.createEl("h3",{text:"Todos"}),new l.Setting(t).setName("Todo inbox file").setDesc("New todos created from the dashboard are saved here.").addText(e=>{e.setValue(this.plugin.settings.todoInboxPath).onChange(async a=>{this.plugin.settings.todoInboxPath=(0,l.normalizePath)(a),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Todo scan folders").setDesc("Comma-separated folders to scan for Markdown todos. Leave blank to scan the whole vault.").addText(e=>{e.setValue(this.plugin.settings.todoScanFolders).onChange(async a=>{this.plugin.settings.todoScanFolders=a,await this.plugin.saveSettings()})}),t.createEl("h3",{text:"Workout"}),new l.Setting(t).setName("Workout plan file").addText(e=>{e.setValue(this.plugin.settings.workoutPlanPath).onChange(async a=>{this.plugin.settings.workoutPlanPath=(0,l.normalizePath)(a),await this.plugin.saveSettings()})}),new l.Setting(t).setName("Workout log file").addText(e=>{e.setValue(this.plugin.settings.workoutLogPath).onChange(async a=>{this.plugin.settings.workoutLogPath=(0,l.normalizePath)(a),await this.plugin.saveSettings()})})}};
