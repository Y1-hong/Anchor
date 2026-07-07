/* Home Base Obsidian plugin */
var H=Object.defineProperty;var ce=Object.getOwnPropertyDescriptor;var de=Object.getOwnPropertyNames;var ue=Object.prototype.hasOwnProperty;var pe=(s,a)=>{for(var e in a)H(s,e,{get:a[e],enumerable:!0})},he=(s,a,e,t)=>{if(a&&typeof a=="object"||typeof a=="function")for(let n of de(a))!ue.call(s,n)&&n!==e&&H(s,n,{get:()=>a[n],enumerable:!(t=ce(a,n))||t.enumerable});return s};var me=s=>he(H({},"__esModule",{value:!0}),s);var Ie={};pe(Ie,{default:()=>U});module.exports=me(Ie);var c=require("obsidian"),C="home-base-dashboard",ge={openOnStartup:!0,todoInboxPath:"Home Base/Todo Inbox.md",todoScanFolders:"Home Base",workoutPlanPath:"Home Base/Workout Plan.md",workoutLogPath:"Home Base/Workout Log.md",showSchedulePlaceholder:!0,calendarEnabled:!1,calendarServerUrl:"https://caldav.icloud.com",calendarUsername:"",calendarPassword:"",calendarUrl:"",calendarName:""},ie=`# Todo Inbox

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

`,B="urn:ietf:params:xml:ns:caldav",A="DAV:";function O(s){let a=s.trim();return a?a.endsWith("/")?a:`${a}/`:""}function I(s,a){return new URL(a,O(s)).toString()}function fe(s){return`${encodeURIComponent(s)}.ics`}function Q(s){let a=s.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`),e=[];for(let t of a)/^[ \t]/.test(t)&&e.length?e[e.length-1]+=t.slice(1):t.trim()&&e.push(t);return e}function se(s){let a=s.indexOf(":");if(a===-1)return null;let e=s.slice(0,a),[t,...n]=e.split(";");return{name:t.toUpperCase(),params:n.join(";"),value:s.slice(a+1)}}function j(s){return s.replace(/\\n/gi,`
`).replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\")}function K(s){return s.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/;/g,"\\;").replace(/,/g,"\\,")}function X(s){let a=[],e=s;for(;e.length>74;)a.push(e.slice(0,74)),e=` ${e.slice(74)}`;return a.push(e),a.join(`\r
`)}function V(s){return`${s.getFullYear()}${String(s.getMonth()+1).padStart(2,"0")}${String(s.getDate()).padStart(2,"0")}`}function N(s){return s.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z")}function S(s){return`${V(s)}T${String(s.getHours()).padStart(2,"0")}${String(s.getMinutes()).padStart(2,"0")}${String(s.getSeconds()).padStart(2,"0")}`}function ve(s,a){let e=Y(s,a);return e.allDay?V(e.date):S(e.date)}function Y(s,a){let e=/VALUE=DATE/i.test(a)||/^\d{8}$/.test(s);if(/^\d{8}$/.test(s))return{date:new Date(Number(s.slice(0,4)),Number(s.slice(4,6))-1,Number(s.slice(6,8))),allDay:e};let t=s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);if(!t)return{date:new Date,allDay:e};let[,n,i,r,o,l,d,u]=t,p=[n,i,r,o,l,d].map(h=>Number(h));return u?{date:new Date(Date.UTC(p[0],p[1]-1,p[2],p[3],p[4],p[5])),allDay:e}:{date:new Date(p[0],p[1]-1,p[2],p[3],p[4],p[5]),allDay:e}}function D(s,a){return new Date(s.getTime()+a*6e4)}function be(s){let a=new Date(s);return a.setSeconds(0,0),a.getMinutes()<30?a.setMinutes(30):a.setHours(a.getHours()+1,0,0,0),a}function ye(s,a){let e=new Date(s);return e.setMonth(e.getMonth()+a),e}function we(s,a){let e=new Date(s);return e.setFullYear(e.getFullYear()+a),e}function w(s,a){let[e,t,n]=s.split("-").map(o=>Number(o)),[i,r]=a.split(":").map(o=>Number(o));return new Date(e,t-1,n,i||0,r||0,0)}function xe(s){let[a,e,t]=s.date.split("-").map(r=>Number(r));if(s.allDay){let r=new Date(a,e-1,t);return{start:r,end:R(r,1)}}let n=w(s.date,s.startTime||"09:00"),i=w(s.date,s.endTime||"10:00");return i<=n&&(i=D(n,60)),{start:n,end:i}}function R(s,a){let e=new Date(s);return e.setDate(e.getDate()+a),e}function oe(s,a){let{start:e,end:t}=xe(s),n=new Date,i=[`UID:${a}`,`DTSTAMP:${N(n)}`,`LAST-MODIFIED:${N(n)}`,`SUMMARY:${K(s.title.trim())}`];s.allDay?(i.push(`DTSTART;VALUE=DATE:${V(e)}`),i.push(`DTEND;VALUE=DATE:${V(t)}`)):(i.push(`DTSTART:${S(e)}`),i.push(`DTEND:${S(t)}`)),s.location.trim()&&i.push(`LOCATION:${K(s.location.trim())}`),s.notes.trim()&&i.push(`DESCRIPTION:${K(s.notes.trim())}`);let r=Ee(s);return r&&i.push(`RRULE:${r}`),i}function Ee(s){if(s.repeat==="none")return"";let a=[];if(s.repeat==="daily"&&a.push("FREQ=DAILY"),s.repeat==="weekdays"&&a.push("FREQ=WEEKLY","BYDAY=MO,TU,WE,TH,FR"),s.repeat==="weekly"&&a.push("FREQ=WEEKLY"),s.repeat==="monthly"&&a.push("FREQ=MONTHLY"),s.repeat==="yearly"&&a.push("FREQ=YEARLY"),s.repeatUntil){let e=s.allDay?`${s.repeatUntil.replace(/-/g,"")}`:S(w(s.repeatUntil,s.endTime||"23:59"));a.push(`UNTIL=${e}`)}return a.join(";")}function le(s,a){return`${["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Home Base//Obsidian Calendar//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",`CREATED:${N(new Date)}`,...oe(s,a),"END:VEVENT","END:VCALENDAR"].map(X).join(`\r
`)}\r
`}function Te(s,a,e){let t=Q(s),n=t.findIndex(d=>d.toUpperCase()==="BEGIN:VEVENT"),i=t.findIndex((d,u)=>u>n&&d.toUpperCase()==="END:VEVENT");if(n===-1||i===-1)return le(a,e);let r=oe(a,e),o=new Set(["UID","DTSTAMP","LAST-MODIFIED","SUMMARY","DTSTART","DTEND","LOCATION","DESCRIPTION","RRULE"]);return`${[...t.slice(0,n+1),...r,...t.slice(n+1,i).filter(d=>{let u=se(d);return!u||!o.has(u.name)}),...t.slice(i)].map(X).join(`\r
`)}\r
`}function De(s,a,e,t){var k,L,$,y,E,Z,J,ee,te,ae;let n=Q(s),i=n.findIndex(f=>f.toUpperCase()==="BEGIN:VEVENT"),r=n.findIndex((f,T)=>T>i&&f.toUpperCase()==="END:VEVENT");if(i===-1||r===-1)return null;let o=n.slice(i+1,r).map(se).filter(f=>!!f),l=f=>o.find(T=>T.name===f),d=f=>o.filter(T=>T.name===f),u=((k=l("UID"))==null?void 0:k.value)||((L=a.split("/").pop())==null?void 0:L.replace(/\.ics$/i,""))||crypto.randomUUID(),p=l("DTSTART");if(!p)return null;let h=Y(p.value,p.params),m=l("DTEND"),g=m?Y(m.value,m.params):{date:h.allDay?R(h.date,1):D(h.date,60),allDay:h.allDay},b=ke((y=($=l("RRULE"))==null?void 0:$.value)!=null?y:""),x=d("EXDATE").flatMap(f=>f.value.split(",").map(T=>ve(T,f.params)));return{uid:u,href:a,etag:e,title:j((Z=(E=l("SUMMARY"))==null?void 0:E.value)!=null?Z:""),start:h.date,end:g.date,allDay:h.allDay,location:j((ee=(J=l("LOCATION"))==null?void 0:J.value)!=null?ee:""),notes:j((ae=(te=l("DESCRIPTION"))==null?void 0:te.value)!=null?ae:""),repeat:b.repeat,repeatUntil:b.repeatUntil,exceptionDates:x,rawIcs:s,calendarName:t}}function ke(s){if(!s)return{repeat:"none",repeatUntil:""};let a=Object.fromEntries(s.split(";").map(t=>{let[n,i=""]=t.split("=");return[n.toUpperCase(),i.toUpperCase()]})),e="none";return a.FREQ==="DAILY"&&(e="daily"),a.FREQ==="WEEKLY"&&a.BYDAY==="MO,TU,WE,TH,FR"?e="weekdays":a.FREQ==="WEEKLY"&&(e="weekly"),a.FREQ==="MONTHLY"&&(e="monthly"),a.FREQ==="YEARLY"&&(e="yearly"),{repeat:e,repeatUntil:a.UNTIL?`${a.UNTIL.slice(0,4)}-${a.UNTIL.slice(4,6)}-${a.UNTIL.slice(6,8)}`:""}}function Ce(s){var e;let a=(e=s.occurrenceStart)!=null?e:s.start;return s.allDay?V(a):S(a)}function Pe(s,a){let e=Q(s),t=e.findIndex(o=>o.toUpperCase()==="END:VEVENT");if(t===-1)return s;let n=Ce(a);if(a.exceptionDates.includes(n))return s;let i=a.allDay?`EXDATE;VALUE=DATE:${n}`:`EXDATE:${n}`;return`${[...e.slice(0,t),i,...e.slice(t)].map(X).join(`\r
`)}\r
`}function Ve(s,a,e){return s.flatMap(t=>t.repeat==="none"?[t]:Se(t,a,e))}function Se(s,a,e){let t=s.end.getTime()-s.start.getTime(),n=s.repeatUntil?R(new Date(`${s.repeatUntil}T00:00:00`),1):e,i=[],r=new Date(s.start),o=0;for(;r<e&&r<n&&o<500;){o+=1;let l=new Date(r.getTime()+t),d=s.allDay?V(r):S(r),u=r.getDay()>=1&&r.getDay()<=5;if(l>=a&&r<e&&!s.exceptionDates.includes(d)&&(s.repeat!=="weekdays"||u)&&i.push({...s,start:new Date(r),end:l,occurrenceStart:new Date(r)}),s.repeat==="daily"||s.repeat==="weekdays")r=R(r,1);else if(s.repeat==="weekly")r=R(r,7);else if(s.repeat==="monthly")r=ye(r,1);else if(s.repeat==="yearly")r=we(r,1);else break}return i}function v(s,a){let e=s instanceof Document?s.documentElement:s,t=Array.from(e.getElementsByTagName("*"));return e.localName===a&&t.unshift(e),t.filter(n=>n.localName===a)}function P(s,a){var e,t,n;return(n=(t=(e=v(s,a)[0])==null?void 0:e.textContent)==null?void 0:t.trim())!=null?n:""}function ne(s,a){let e=v(s,a)[0];return e?P(e,"href"):""}function M(s){return new DOMParser().parseFromString(s,"application/xml")}var Le=`
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
`,U=class extends c.Plugin{async onload(){this.settings=Object.assign({},ge,await this.loadData()),this.injectStyles(),this.registerView(C,a=>new F(a,this)),this.addRibbonIcon("home","Open Home Base",()=>{this.openDashboard()}),this.addCommand({id:"open-home-base",name:"Open Home Base",callback:()=>void this.openDashboard()}),this.addCommand({id:"refresh-home-base",name:"Refresh Home Base",callback:()=>void this.refreshDashboard()}),this.addSettingTab(new G(this.app,this)),await this.ensureDefaultFiles().catch(a=>{console.warn("Home Base could not create one or more default files.",a)}),this.settings.openOnStartup&&this.app.workspace.onLayoutReady(()=>{this.openDashboard()})}onunload(){var a;this.app.workspace.detachLeavesOfType(C),(a=this.styleEl)==null||a.remove()}async saveSettings(){await this.saveData(this.settings)}async openDashboard(){let a=this.app.workspace.getLeavesOfType(C)[0];if(a){this.app.workspace.revealLeaf(a);return}let e=this.app.workspace.getLeaf("tab");await e.setViewState({type:C,active:!0}),this.app.workspace.revealLeaf(e)}async refreshDashboard(){let a=this.app.workspace.getLeavesOfType(C);for(let e of a){let t=e.view;t instanceof F&&await t.render()}}async fetchCalendarEvents(a,e){if(!this.hasCalendarConfig())return{events:[],error:"",setupRequired:!0};try{let t=await this.getDefaultCalendar();if(!t)return{events:[],error:"No CalDAV event calendar was found.",setupRequired:!1};let n=`<?xml version="1.0" encoding="utf-8" ?>
<c:calendar-query xmlns:d="${A}" xmlns:c="${B}">
  <d:prop>
    <d:getetag />
    <c:calendar-data />
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${N(a)}" end="${N(e)}" />
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`,i=await this.caldavRequest(t.href,"REPORT",n,{Depth:"1"}),r=M(i.text);return{events:Ve(v(r,"response").map(l=>{let d=I(t.href,P(l,"href")),u=P(l,"getetag"),p=P(l,"calendar-data");return p?De(p,d,u,t.displayName):null}).filter(l=>!!l),a,e).filter(l=>l.end>=a&&l.start<e).sort((l,d)=>l.start.getTime()-d.start.getTime()),error:"",setupRequired:!1}}catch(t){return{events:[],error:this.readableCalendarError(t),setupRequired:!1}}}async saveCalendarEvent(a){let e=await this.getDefaultCalendar();if(!e){new c.Notice("Set up a default CalDAV calendar first.");return}let t=a.uid||crypto.randomUUID(),n=a.href||I(e.href,fe(t)),i=a.rawIcs?Te(a.rawIcs,a,t):le(a,t),r={"Content-Type":"text/calendar; charset=utf-8"};a.etag?r["If-Match"]=a.etag:r["If-None-Match"]="*";try{await this.caldavRequest(n,"PUT",i,r),new c.Notice("Calendar event saved.")}catch(o){throw new c.Notice(this.readableCalendarError(o)),o}}async saveCalendarOccurrence(a,e){await this.excludeCalendarOccurrence(a),await this.saveCalendarEvent({...e,uid:void 0,href:void 0,etag:void 0,rawIcs:void 0,repeat:"none",repeatUntil:""})}async deleteCalendarEvent(a,e=!1){try{if(e&&a.repeat!=="none"){await this.excludeCalendarOccurrence(a),new c.Notice("Calendar occurrence deleted.");return}await this.caldavRequest(a.href,"DELETE","",a.etag?{"If-Match":a.etag}:{}),new c.Notice("Calendar event deleted.")}catch(t){throw new c.Notice(this.readableCalendarError(t)),t}}async excludeCalendarOccurrence(a){let e=Pe(a.rawIcs,a);await this.caldavRequest(a.href,"PUT",e,{"Content-Type":"text/calendar; charset=utf-8",...a.etag?{"If-Match":a.etag}:{}})}async testCalendarConnection(){if(!this.hasCalendarCredentials())throw new Error("Fill in the CalDAV server URL, Apple ID email, and app-specific password first.");let a=await this.getDefaultCalendar(!0,!0);if(!a)throw new Error("No event calendar was found for this CalDAV account.");return a}hasCalendarCredentials(){return!!(this.settings.calendarServerUrl.trim()&&this.settings.calendarUsername.trim()&&this.settings.calendarPassword.trim())}hasCalendarConfig(){return!!(this.settings.calendarEnabled&&this.hasCalendarCredentials())}async getDefaultCalendar(a=!1,e=!1){var r,o;if(e?!this.hasCalendarCredentials():!this.hasCalendarConfig())return null;if(this.settings.calendarUrl.trim()&&!a)return{href:O(this.settings.calendarUrl),displayName:this.settings.calendarName||"Calendar",writable:!0};let t=await this.discoverCalendars(),n=t.filter(l=>l.writable),i=(o=(r=t.find(l=>l.href===O(this.settings.calendarUrl)))!=null?r:n[0])!=null?o:t[0];return i?(this.settings.calendarUrl=i.href,this.settings.calendarName=i.displayName,await this.saveSettings(),i):null}async discoverCalendars(){let a=O(this.settings.calendarServerUrl),e=await this.caldavRequest(a,"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${A}">
  <d:prop>
    <d:current-user-principal />
  </d:prop>
</d:propfind>`,{Depth:"0"}),t=M(e.text),n=ne(t,"current-user-principal");if(!n)throw new Error("CalDAV server did not return a principal URL.");let i=await this.caldavRequest(I(a,n),"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${A}" xmlns:c="${B}">
  <d:prop>
    <c:calendar-home-set />
  </d:prop>
</d:propfind>`,{Depth:"0"}),r=M(i.text),o=ne(r,"calendar-home-set");if(!o)throw new Error("CalDAV server did not return a calendar home.");let l=I(a,o),d=await this.caldavRequest(l,"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${A}" xmlns:c="${B}">
  <d:prop>
    <d:displayname />
    <d:resourcetype />
    <d:current-user-privilege-set />
    <c:supported-calendar-component-set />
  </d:prop>
</d:propfind>`,{Depth:"1"}),u=M(d.text);return v(u,"response").map(p=>{let h=P(p,"href"),m=v(p,"resourcetype")[0],g=!!(m&&v(m,"calendar").length),b=v(p,"comp").map(y=>{var E;return((E=y.getAttribute("name"))!=null?E:"").toUpperCase()}),x=!b.length||b.includes("VEVENT"),k=v(p,"current-user-privilege-set")[0],L=k?v(k,"privilege").flatMap(y=>Array.from(y.children).map(E=>E.localName)):[],$=!L.length||L.some(y=>["write","write-content","bind","unbind"].includes(y));return!h||!g||!x?null:{href:I(l,h),displayName:P(p,"displayname")||"Calendar",writable:$}}).filter(p=>!!p)}async caldavRequest(a,e,t="",n={}){let i=await(0,c.requestUrl)({url:a,method:e,body:t,headers:{Authorization:`Basic ${btoa(`${this.settings.calendarUsername}:${this.settings.calendarPassword}`)}`,"Content-Type":"application/xml; charset=utf-8",...n}});if(i.status>=400)throw i.status===401||i.status===403?new Error("Calendar authentication failed. Check your Apple ID and app-specific password."):i.status===405?new Error("This calendar does not allow that sync action. Choose a normal writable iCloud calendar."):i.status===409||i.status===412?new Error("This event changed remotely. Refresh Home Base and try again."):new Error(`CalDAV request failed with status ${i.status}.`);return i}readableCalendarError(a){return a instanceof Error?a.message:"Calendar sync failed."}async ensureDefaultFiles(){await this.ensureFile(this.settings.todoInboxPath,ie),await this.ensureFile(this.settings.workoutPlanPath,_),await this.ensureFile(this.settings.workoutLogPath,re)}async ensureFile(a,e){let t=(0,c.normalizePath)(a),n=this.app.vault.getAbstractFileByPath(t);if(n instanceof c.TFile)return;if(n)throw new Error(`Expected a file path but found a folder: ${t}`);let i=t.split("/").slice(0,-1).join("/");i&&await this.ensureFolder(i),await this.app.vault.create(t,e)}async ensureFolder(a){let e=(0,c.normalizePath)(a).split("/"),t="";for(let n of e){t=t?`${t}/${n}`:n;let i=this.app.vault.getAbstractFileByPath(t);if(i instanceof c.TFile)throw new Error(`Expected a folder path but found a file: ${t}`);i||await this.app.vault.createFolder(t)}}injectStyles(){var a;(a=this.styleEl)==null||a.remove(),this.styleEl=document.createElement("style"),this.styleEl.id="home-base-runtime-styles",this.styleEl.textContent=Le,document.head.appendChild(this.styleEl)}},F=class extends c.ItemView{constructor(a,e){super(a),this.plugin=e}getViewType(){return C}getDisplayText(){return"Home Base"}getIcon(){return"home"}async onOpen(){await this.render()}async render(){let a=this.containerEl.children[1];a.empty(),a.addClass("home-base-view");let e=await this.loadTodos(),t=await this.loadWorkoutPlan(),n=await this.loadWorkoutLog(),i=await this.plugin.fetchCalendarEvents(this.startOfDay(new Date),this.addDays(new Date,8)),r=this.getWorkoutState(t,n);this.renderHeader(a);let o=a.createDiv({cls:"home-base-grid"}),l=o.createDiv({cls:"home-base-column home-base-left"}),d=o.createDiv({cls:"home-base-column home-base-right"});this.renderCalendar(l,i),this.renderWorkout(l,t,r),this.renderTodos(d,e)}renderHeader(a){let e=a.createDiv({cls:"home-base-header"}),t=new Date,n=e.createDiv();n.createEl("h1",{text:"Home Base"}),n.createDiv({cls:"home-base-date",text:t.toLocaleDateString(void 0,{weekday:"long",year:"numeric",month:"long",day:"numeric"})}),n.createDiv({cls:"home-base-greeting",text:this.getGreeting()});let i=e.createEl("button",{cls:"home-base-icon-button",attr:{"aria-label":"Refresh"}});i.setText("Refresh"),i.onClickEvent(()=>void this.render())}renderCalendar(a,e){let t=a.createDiv({cls:"home-base-panel home-base-calendar-panel"}),n=t.createDiv({cls:"home-base-panel-title"});n.createEl("span",{cls:"home-base-icon",text:"Cal"}),n.createEl("h2",{text:"Calendar"}),this.plugin.settings.calendarName&&n.createEl("span",{cls:"home-base-pill",text:this.plugin.settings.calendarName});let i=t.createDiv({cls:"home-base-calendar-controls"}),r=i.createEl("button",{cls:"mod-cta home-base-primary-button",text:"+ Event"});if(r.disabled=e.setupRequired||!!e.error,r.onClickEvent(()=>{new W(this.app,this.plugin,void 0,()=>void this.render()).open()}),i.createEl("button",{cls:"home-base-secondary-button",text:"Refresh"}).onClickEvent(()=>void this.render()),e.setupRequired){let m=t.createDiv({cls:"home-base-schedule-empty"});m.createDiv({cls:"home-base-calendar-mark",text:"CalDAV"});let g=m.createDiv();g.createEl("strong",{text:"Connect iCloud Calendar"}),g.createEl("p",{text:"Enable Calendar in Home Base settings, then add your iCloud CalDAV account and default calendar."});return}if(e.error){let m=t.createDiv({cls:"home-base-calendar-error"});m.createEl("strong",{text:"Calendar could not sync"}),m.createEl("p",{text:e.error});return}let l=this.startOfDay(new Date),d=this.addDays(l,1),u=this.addDays(l,7),p=e.events.filter(m=>this.eventOccursOn(m,l)),h=e.events.filter(m=>{let g=this.startOfDay(m.start);return g>=d&&g<=u});this.renderCalendarGroup(t,"Today",p,"No events today"),this.renderCalendarGroup(t,"Next 7 Days",h,"No upcoming events")}renderCalendarGroup(a,e,t,n){let i=a.createDiv({cls:"home-base-calendar-group"});if(i.createEl("h3",{text:e}),!t.length){i.createEl("p",{cls:"home-base-muted home-base-italic",text:n});return}for(let r of t)this.renderCalendarEvent(i,r)}renderCalendarEvent(a,e){let t=a.createDiv({cls:"home-base-calendar-event"}),n=t.createDiv({cls:"home-base-calendar-time",text:this.formatCalendarEventTime(e)});e.allDay&&n.addClass("is-all-day");let i=t.createDiv({cls:"home-base-calendar-body"});i.createDiv({cls:"home-base-calendar-title",text:e.title||"Untitled event"});let r=i.createDiv({cls:"home-base-calendar-meta"});this.eventOccursOn(e,this.startOfDay(new Date))||r.createEl("span",{text:this.formatCalendarDate(e.start)}),e.location&&r.createEl("span",{text:e.location}),e.repeat!=="none"&&r.createEl("span",{text:this.formatRepeatLabel(e.repeat)});let o=t.createDiv({cls:"home-base-actions"});o.createEl("button",{cls:"home-base-ghost-button",text:"Edit"}).onClickEvent(()=>new W(this.app,this.plugin,e,()=>void this.render()).open()),o.createEl("button",{cls:"home-base-ghost-button",text:"Delete"}).onClickEvent(async()=>{if(!confirm(`Delete "${e.title||"Untitled event"}"?`))return;let p=e.repeat!=="none"&&confirm("Delete only this event? Press Cancel to delete the whole repeating series.");await this.plugin.deleteCalendarEvent(e,p),await this.render()})}renderTodos(a,e){let t=a.createDiv({cls:"home-base-panel home-base-todo-panel"}),n=t.createDiv({cls:"home-base-panel-title home-base-todo-title"});n.createEl("span",{cls:"home-base-icon",text:"Task"}),n.createEl("h2",{text:"Todo Manager"}),t.createDiv({cls:"home-base-todo-controls"}).createEl("button",{cls:"mod-cta home-base-primary-button",text:"+ New Todo"}).onClickEvent(()=>{new q(this.app,this.plugin,void 0,()=>void this.render()).open()});let o=this.groupTodos(e);for(let l of["Overdue","Today","Tomorrow","Next 7 Days","No Due Date","Later"]){let d=o[l];if(!d.length&&l==="Later")continue;let u=t.createDiv({cls:"home-base-todo-group"});if(u.createEl("h3",{text:l}),!d.length){u.createEl("p",{cls:"home-base-muted home-base-italic",text:l==="Tomorrow"?"No todos due tomorrow":`No todos in ${l.toLowerCase()}`});continue}for(let p of d)this.renderTodoItem(u,p)}}renderTodoItem(a,e){let t=a.createDiv({cls:`home-base-todo-item ${e.completed?"is-complete":""}`}),n=t.createEl("input",{cls:"home-base-checkbox"});n.type="checkbox",n.checked=e.completed,n.onClickEvent(async()=>{await this.setTodoCompletion(e,n.checked),await this.render()});let i=t.createDiv({cls:"home-base-todo-body"});i.createDiv({cls:"home-base-todo-name",text:e.title});let r=i.createDiv({cls:"home-base-todo-meta"});r.createEl("span",{cls:"home-base-due",text:e.due?this.formatDue(e.due):"No due date"}),e.priority&&r.createEl("span",{cls:`home-base-priority is-${e.priority}`,text:this.capitalize(e.priority)});for(let u of e.tags)r.createEl("span",{cls:"home-base-tag",text:u});let o=t.createDiv({cls:"home-base-actions"});o.createEl("button",{cls:"home-base-ghost-button",text:"Edit"}).onClickEvent(()=>new q(this.app,this.plugin,e,()=>void this.render()).open()),o.createEl("button",{cls:"home-base-ghost-button",text:"Delete"}).onClickEvent(async()=>{await this.deleteTodo(e),await this.render()})}renderWorkout(a,e,t){var h;let n=a.createDiv({cls:"home-base-panel"}),i=n.createDiv({cls:"home-base-panel-title"});if(i.createEl("span",{cls:"home-base-icon",text:"Fit"}),i.createEl("h2",{text:"Workout"}),t.unresolved){let m=n.createDiv({cls:"home-base-unresolved"});m.createDiv({text:`Yesterday's workout was not resolved: ${t.unresolved.workout}`});let g=m.createDiv({cls:"home-base-unresolved-actions"});g.createEl("button",{text:"Mark Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(t.unresolved.date,t.unresolved.workout,"done"),await this.render()}),g.createEl("button",{text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(t.unresolved.date,t.unresolved.workout,"skipped"),await this.render()}),g.createEl("button",{text:"Keep Pending"}).onClickEvent(async()=>{new c.Notice("Kept as pending.")})}n.createEl("h3",{text:"Today's Workout"}),n.createEl("div",{cls:"home-base-workout-name",text:t.todayWorkout});let r=(h=e.types[t.todayWorkout])!=null?h:[];if(r.length){let m=n.createEl("ul",{cls:"home-base-exercises"});for(let g of r)m.createEl("li",{text:g})}else n.createEl("p",{cls:"home-base-muted",text:"No exercises configured for this workout."});n.createEl("button",{cls:"home-base-wide-button",text:"Edit Routine"}).onClickEvent(()=>{new z(this.app,this.plugin,e,()=>void this.render()).open()});let l=n.createDiv({cls:"home-base-workout-actions"});l.createEl("button",{cls:"mod-cta home-base-primary-button",text:"Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),t.todayWorkout,"done"),await this.render()}),l.createEl("button",{cls:"home-base-secondary-button",text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),t.todayWorkout,"skipped"),await this.render()});let p=n.createDiv({cls:"home-base-sequence"});p.createEl("h3",{text:"Routine Sequence"}),p.createDiv({text:e.sequence.length?e.sequence.join(" > "):"No sequence configured"})}async loadTodos(){let a=this.plugin.settings.todoScanFolders.split(",").map(n=>(0,c.normalizePath)(n.trim())).filter(Boolean),e=this.app.vault.getMarkdownFiles().filter(n=>a.length?a.some(i=>n.path===i||n.path.startsWith(`${i}/`)):!0),t=[];for(let n of e)(await this.app.vault.cachedRead(n)).split(`
`).forEach((o,l)=>{let d=this.parseTodoLine(o,n,l);d&&t.push(d)});return t.sort((n,i)=>this.compareTodos(n,i))}parseTodoLine(a,e,t){var u,p,h,m;let n=a.match(/^\s*[-*]\s+\[( |x|X)]\s+(.+)$/);if(!n)return null;let i=n[1].toLowerCase()==="x",r=n[2].trim(),o=r.match(/\sdue::\s*(\d{4}-\d{2}-\d{2})/),l=r.match(/\spriority::\s*(high|medium|low)/i),d=(u=r.match(/#[\w/-]+/g))!=null?u:[];return r=r.replace(/\sdue::\s*\d{4}-\d{2}-\d{2}/,"").replace(/\spriority::\s*(high|medium|low)/i,"").replace(/#[\w/-]+/g,"").trim(),{id:`${e.path}:${t}`,title:r,due:(p=o==null?void 0:o[1])!=null?p:"",priority:(m=(h=l==null?void 0:l[1])==null?void 0:h.toLowerCase())!=null?m:"",tags:d,completed:i,file:e,line:t,raw:a}}groupTodos(a){let e={Overdue:[],Today:[],Tomorrow:[],"Next 7 Days":[],"No Due Date":[],Later:[]},t=this.startOfDay(new Date),n=this.addDays(t,1),i=this.addDays(t,7);for(let r of a.filter(o=>!o.completed)){if(!r.due){e["No Due Date"].push(r);continue}let o=this.parseDate(r.due);o<t?e.Overdue.push(r):o.getTime()===t.getTime()?e.Today.push(r):o.getTime()===n.getTime()?e.Tomorrow.push(r):o<=i?e["Next 7 Days"].push(r):e.Later.push(r)}return e}async loadWorkoutPlan(){await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,_);let a=this.app.vault.getAbstractFileByPath((0,c.normalizePath)(this.plugin.settings.workoutPlanPath));if(!(a instanceof c.TFile))return{types:{},sequence:[]};let t=(await this.app.vault.cachedRead(a)).split(`
`),n={},i=[],r="",o="";for(let l of t){let d=l.trim();if(/^#\s+Workout Types/i.test(d)){r="types",o="";continue}if(/^#\s+Sequence/i.test(d)){r="sequence",o="";continue}if(r==="types"&&d.startsWith("## ")){o=d.replace(/^##\s+/,"").trim(),n[o]=[];continue}if(r==="types"&&o){let u=d.replace(/^[-*]\s+/,"").trim();u&&n[o].push(u)}r==="sequence"&&/^[-*]\s+/.test(d)&&i.push(d.replace(/^[-*]\s+/,"").trim())}return{types:n,sequence:i}}async loadWorkoutLog(){await this.plugin.ensureFile(this.plugin.settings.workoutLogPath,re);let a=this.app.vault.getAbstractFileByPath((0,c.normalizePath)(this.plugin.settings.workoutLogPath));return a instanceof c.TFile?(await this.app.vault.cachedRead(a)).split(`
`).map(t=>{var o,l,d,u;let n=(o=t.match(/date::\s*(\d{4}-\d{2}-\d{2})/))==null?void 0:o[1],i=(d=(l=t.match(/workout::\s*([^]+?)\s+status::/))==null?void 0:l[1])==null?void 0:d.trim(),r=(u=t.match(/status::\s*(done|skipped|pending)/))==null?void 0:u[1];return!n||!i||!r?null:{date:n,workout:i,status:r}}).filter(t=>!!t):[]}getWorkoutState(a,e){let t=a.sequence.length?a.sequence:Object.keys(a.types),n=e.filter(d=>d.status==="done").length,i=t.length?t[n%t.length]:"No workout configured",r=this.dateKey(this.addDays(new Date,-1)),l=e.filter(d=>d.date===r).length?null:{date:r,workout:i};return{todayWorkout:i,unresolved:l}}async appendWorkoutLog(a,e,t){let n=this.app.vault.getAbstractFileByPath((0,c.normalizePath)(this.plugin.settings.workoutLogPath));if(!(n instanceof c.TFile))return;let i=await this.app.vault.cachedRead(n),r=`- date:: ${a} workout:: ${e} status:: ${t}`;await this.app.vault.modify(n,`${i.trimEnd()}
${r}
`),new c.Notice(`Workout marked ${t}.`)}async setTodoCompletion(a,e){let n=(await this.app.vault.cachedRead(a.file)).split(`
`);n[a.line]=a.raw.replace(/\[( |x|X)]/,e?"[x]":"[ ]"),await this.app.vault.modify(a.file,n.join(`
`))}async deleteTodo(a){if(!confirm(`Delete "${a.title}"?`))return;let n=(await this.app.vault.cachedRead(a.file)).split(`
`);n.splice(a.line,1),await this.app.vault.modify(a.file,n.join(`
`))}compareTodos(a,e){let t=a.due||"9999-12-31",n=e.due||"9999-12-31";if(t!==n)return t.localeCompare(n);let i={high:0,medium:1,low:2,"":3};return i[a.priority]-i[e.priority]}formatDue(a){let e=this.todayKey();return a===e?"Today":a===this.dateKey(this.addDays(new Date,1))?"Tomorrow":new Date(`${a}T00:00:00`).toLocaleDateString(void 0,{month:"short",day:"numeric"})}eventOccursOn(a,e){let t=this.startOfDay(a.start),n=this.startOfDay(a.allDay?this.addDays(a.end,-1):a.end);return t<=e&&n>=e}formatCalendarEventTime(a){if(a.allDay)return"All day";let e=a.start.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),t=a.end.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"});return`${e} - ${t}`}formatCalendarDate(a){return a.toLocaleDateString(void 0,{weekday:"short",month:"short",day:"numeric"})}formatRepeatLabel(a){return{none:"",daily:"Repeats daily",weekdays:"Repeats weekdays",weekly:"Repeats weekly",monthly:"Repeats monthly",yearly:"Repeats yearly"}[a]}getGreeting(){let a=new Date().getHours();return a<12?"Good morning":a<18?"Good afternoon":"Good evening"}parseDate(a){return new Date(`${a}T00:00:00`)}startOfDay(a){return new Date(a.getFullYear(),a.getMonth(),a.getDate())}addDays(a,e){let t=new Date(a);return t.setDate(t.getDate()+e),this.startOfDay(t)}todayKey(){return this.dateKey(new Date)}dateKey(a){return`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`}capitalize(a){return a.charAt(0).toUpperCase()+a.slice(1)}},q=class extends c.Modal{constructor(e,t,n,i){super(e);this.titleValue="";this.dueValue="";this.priorityValue="medium";this.tagsValue="";this.plugin=t,this.todo=n,this.onSave=i,n&&(this.titleValue=n.title,this.dueValue=n.due,this.priorityValue=n.priority||"medium",this.tagsValue=n.tags.join(" "))}onOpen(){let{contentEl:e}=this;e.empty(),e.addClass("home-base-modal"),e.createEl("h2",{text:this.todo?"Edit Todo":"New Todo"}),new c.Setting(e).setName("Title").addText(t=>{t.setValue(this.titleValue),t.onChange(n=>{this.titleValue=n})}),new c.Setting(e).setName("Due date").addText(t=>{t.inputEl.type="date",t.setValue(this.dueValue),t.onChange(n=>{this.dueValue=n})}),new c.Setting(e).setName("Priority").addDropdown(t=>{t.addOption("high","High").addOption("medium","Medium").addOption("low","Low").setValue(this.priorityValue||"medium").onChange(n=>{this.priorityValue=n})}),new c.Setting(e).setName("Tags").setDesc("Use Markdown tags, for example #school #writing.").addText(t=>{t.setPlaceholder("#school #writing"),t.setValue(this.tagsValue),t.onChange(n=>{this.tagsValue=n})}),new c.Setting(e).addButton(t=>{t.setButtonText("Cancel").onClick(()=>this.close())}).addButton(t=>{t.setButtonText("Save").setCta().onClick(()=>void this.saveTodo())})}async saveTodo(){if(!this.titleValue.trim()){new c.Notice("Todo title is required.");return}let e=this.formatTodoLine();if(this.todo){let n=(await this.app.vault.cachedRead(this.todo.file)).split(`
`);n[this.todo.line]=e.replace("- [ ]",this.todo.completed?"- [x]":"- [ ]"),await this.app.vault.modify(this.todo.file,n.join(`
`))}else{await this.plugin.ensureFile(this.plugin.settings.todoInboxPath,ie);let t=this.app.vault.getAbstractFileByPath((0,c.normalizePath)(this.plugin.settings.todoInboxPath));if(!(t instanceof c.TFile))return;let n=await this.app.vault.cachedRead(t);await this.app.vault.modify(t,`${n.trimEnd()}
${e}
`)}this.close(),this.onSave()}formatTodoLine(){let e=this.tagsValue.split(/\s+/).filter(Boolean).map(r=>r.startsWith("#")?r:`#${r}`).join(" "),t=this.dueValue?` due:: ${this.dueValue}`:"",n=this.priorityValue?` priority:: ${this.priorityValue}`:"",i=e?` ${e}`:"";return`- [ ] ${this.titleValue.trim()}${t}${n}${i}`}},W=class extends c.Modal{constructor(e,t,n,i){super(e);this.titleValue="";this.dateValue="";this.startTimeValue="09:00";this.endTimeValue="10:00";this.allDayValue=!1;this.locationValue="";this.notesValue="";this.repeatValue="none";this.repeatUntilValue="";this.durationMinutes=60;this.activeTimePicker=null;this.timeWheelDeltas=new WeakMap;this.outsideTimePickerHandler=e=>{var n,i;let t=e.target;t&&((n=this.timePickerPopover)!=null&&n.contains(t)||(i=this.activeTimeField)!=null&&i.contains(t)||this.closeTimePicker())};this.timePickerKeyHandler=e=>{e.key!=="Escape"||!this.activeTimePicker||(e.preventDefault(),e.stopPropagation(),this.closeTimePicker(!0))};this.timePickerResizeHandler=()=>this.positionTimePicker();if(this.plugin=t,this.event=n,this.onSave=i,n)this.titleValue=n.title,this.dateValue=this.dateInputValue(n.start),this.startTimeValue=this.timeInputValue(n.start),this.endTimeValue=this.timeInputValue(n.end),this.allDayValue=n.allDay,this.locationValue=n.location,this.notesValue=n.notes,this.repeatValue=n.repeat,this.repeatUntilValue=n.repeatUntil,this.durationMinutes=Math.max(1,Math.round((n.end.getTime()-n.start.getTime())/6e4));else{let r=be(new Date),o=D(r,this.durationMinutes);this.dateValue=this.dateInputValue(r),this.startTimeValue=this.timeInputValue(r),this.endTimeValue=this.timeInputValue(o)}}onOpen(){this.render()}onClose(){this.closeTimePicker()}render(){this.closeTimePicker();let{contentEl:e}=this;e.empty(),e.addClass("home-base-modal"),e.createEl("h2",{text:this.event?"Edit Event":"New Event"}),new c.Setting(e).setName("Title").addText(r=>{r.setValue(this.titleValue),r.onChange(o=>{this.titleValue=o})}),new c.Setting(e).setName("All day").addToggle(r=>{r.setValue(this.allDayValue),r.onChange(o=>{this.allDayValue=o,this.render()})}),new c.Setting(e).setName("Date").addText(r=>{r.inputEl.type="date",r.setValue(this.dateValue),r.onChange(o=>{this.dateValue=o})}),this.allDayValue||(this.renderTimeSetting(e,"Start time","start"),this.renderTimeSetting(e,"End time","end")),new c.Setting(e).setName("Repeat").addDropdown(r=>{r.addOption("none","Never").addOption("daily","Every day").addOption("weekdays","Every weekday").addOption("weekly","Every week").addOption("monthly","Every month").addOption("yearly","Every year").setValue(this.repeatValue).onChange(o=>{this.repeatValue=o,this.repeatValue==="none"&&(this.repeatUntilValue=""),this.render()})}),this.repeatValue!=="none"&&new c.Setting(e).setName("Repeat until").setDesc("Optional").addText(r=>{r.inputEl.type="date",r.setValue(this.repeatUntilValue),r.onChange(o=>{this.repeatUntilValue=o})}),new c.Setting(e).setName("Location").addText(r=>{r.setValue(this.locationValue),r.onChange(o=>{this.locationValue=o})}),new c.Setting(e).setName("Notes").addTextArea(r=>{r.setValue(this.notesValue),r.onChange(o=>{this.notesValue=o})});let t=e.createDiv({cls:"home-base-modal-footer"});this.event&&t.createEl("button",{text:"Delete"}).onClickEvent(()=>void this.deleteEvent()),t.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),t.createEl("button",{cls:"mod-cta",text:"Save Event"}).onClickEvent(()=>void this.saveEvent())}renderTimeSetting(e,t,n){let i=new c.Setting(e).setName(t);i.settingEl.addClass("home-base-time-setting");let r=i.controlEl.createDiv({cls:"home-base-time-field"}),o=r.createDiv({cls:"home-base-time-input-wrap"}),l=o.createEl("input",{cls:"home-base-time-input",attr:{type:"text",readonly:"true","aria-haspopup":"dialog","aria-expanded":"false","aria-label":`${t}: ${this.formatDisplayTime(this.timeValueFor(n))}. Open time picker.`}});l.value=this.formatDisplayTime(this.timeValueFor(n));let d=o.createSpan({cls:"home-base-time-icon"});(0,c.setIcon)(d,"clock"),l.addEventListener("click",u=>{u.preventDefault(),this.openTimePicker(n,r,l)}),l.addEventListener("focus",()=>this.openTimePicker(n,r,l)),l.addEventListener("keydown",u=>{var p,h;u.key!=="Enter"&&u.key!==" "&&u.key!=="ArrowDown"||(u.preventDefault(),this.openTimePicker(n,r,l),(h=(p=this.timePickerPopover)==null?void 0:p.querySelector("button"))==null||h.focus())}),n==="start"?this.startTimeInput=l:this.endTimeInput=l}openTimePicker(e,t,n){if(this.activeTimePicker===e&&this.timePickerPopover){this.positionTimePicker();return}this.closeTimePicker(),this.activeTimePicker=e,this.activeTimeField=t,this.activeTimeInput=n,n.setAttribute("aria-expanded","true");let i=t.createDiv({cls:"home-base-time-popover"});i.setAttribute("role","dialog"),i.setAttribute("aria-label",`${e==="start"?"Start":"End"} time picker`),this.timePickerPopover=i,this.renderTimePickerContents(),this.positionTimePicker(),document.addEventListener("mousedown",this.outsideTimePickerHandler,!0),document.addEventListener("keydown",this.timePickerKeyHandler,!0),window.addEventListener("resize",this.timePickerResizeHandler)}closeTimePicker(e=!1){let t=this.activeTimeInput;this.timePickerPopover&&this.timePickerPopover.remove(),this.timePickerPopover=void 0,this.activeTimeField=void 0,this.activeTimeInput=void 0,this.activeTimePicker=null,t&&t.setAttribute("aria-expanded","false"),document.removeEventListener("mousedown",this.outsideTimePickerHandler,!0),document.removeEventListener("keydown",this.timePickerKeyHandler,!0),window.removeEventListener("resize",this.timePickerResizeHandler),e&&(t==null||t.focus())}renderTimePickerContents(){if(!this.timePickerPopover||!this.activeTimePicker)return;let e=this.timePickerPopover,t=this.activeTimePicker,n=this.parseTimeParts(this.timeValueFor(t));e.empty(),this.renderTimeColumn(e,t,"hour",n.hour12),e.createDiv({cls:"home-base-time-divider"}),this.renderTimeColumn(e,t,"minute",String(n.minute).padStart(2,"0")),e.createDiv({cls:"home-base-time-divider"});let i=e.createDiv({cls:"home-base-period-column"});this.renderPeriodButton(i,t,"AM",n.period),this.renderPeriodButton(i,t,"PM",n.period)}renderTimeColumn(e,t,n,i){let r=n==="hour"?"hour":"minute",o=e.createDiv({cls:"home-base-time-column"});o.addEventListener("wheel",u=>this.handleTimeColumnWheel(u,o,t,n),{passive:!1});let l=o.createEl("button",{cls:"home-base-time-step",attr:{"aria-label":`Decrease ${t} ${r}`}});(0,c.setIcon)(l,"chevron-up"),l.onClickEvent(()=>this.adjustTime(t,n,-1)),o.createDiv({cls:"home-base-time-value",text:String(i)});let d=o.createEl("button",{cls:"home-base-time-step",attr:{"aria-label":`Increase ${t} ${r}`}});(0,c.setIcon)(d,"chevron-down"),d.onClickEvent(()=>this.adjustTime(t,n,1))}handleTimeColumnWheel(e,t,n,i){var u;e.preventDefault(),e.stopPropagation();let r=e.deltaMode===WheelEvent.DOM_DELTA_LINE?e.deltaY*16:e.deltaY,o=((u=this.timeWheelDeltas.get(t))!=null?u:0)+r,l=o>0?1:-1,d=this.timeWheelThreshold(n,i,l);if(Math.abs(o)<d){this.timeWheelDeltas.set(t,o);return}this.adjustWheelTime(n,i,l),this.timeWheelDeltas.set(t,o-Math.sign(o)*d)}timeWheelThreshold(e,t,n){if(t!=="minute")return 24;let{minute:i}=this.parseTimeParts(this.timeValueFor(e));return i===0||i===30?42:18}adjustWheelTime(e,t,n){let i=this.parseTimeParts(this.timeValueFor(e)),r=i.hour12,o=t==="hour"?this.wrapNumber(r+n,1,12):r,l=t==="minute"?this.wrapNumber(i.minute+n,0,59):i.minute,d=i.period==="AM"?o%12:o%12+12;this.applyTimeValue(e,`${String(d).padStart(2,"0")}:${String(l).padStart(2,"0")}`)}wrapNumber(e,t,n){return e>n?t:e<t?n:e}renderPeriodButton(e,t,n,i){e.createEl("button",{cls:`home-base-period-button${n===i?" is-selected":""}`,text:n,attr:{"aria-label":`Set ${t} time to ${n}`,"aria-pressed":n===i?"true":"false"}}).onClickEvent(()=>this.setTimePeriod(t,n))}positionTimePicker(){if(!this.timePickerPopover||!this.activeTimeField||!this.activeTimeInput)return;let e=this.timePickerPopover;e.style.left="0px",e.style.removeProperty("--home-base-time-pointer-left"),e.removeClass("is-above");let t=this.activeTimeField.getBoundingClientRect(),n=this.activeTimeInput.getBoundingClientRect(),i=e.getBoundingClientRect(),r=this.contentEl.getBoundingClientRect(),o=12,l=Math.max(o,r.left+o),d=Math.min(window.innerWidth-o,r.right-o),u=l-t.left,p=d-t.left-i.width,h=Math.min(u,p),m=Math.max(u,p),g=Math.min(Math.max(0,h),m);e.style.left=`${g}px`;let b=n.left+Math.min(32,n.width/2)-t.left-g;e.style.setProperty("--home-base-time-pointer-left",`${Math.max(16,Math.min(i.width-22,b))}px`);let x=e.getBoundingClientRect();x.bottom>window.innerHeight-o&&n.top-x.height-o>0&&e.addClass("is-above")}adjustTime(e,t,n){let i=this.parseTimeParts(this.timeValueFor(e)),r=new Date(2e3,0,1,i.hour24,i.minute,0,0),o=t==="hour"?D(r,n*60):D(r,n*30);this.applyTimeValue(e,this.timeInputValue(o))}setTimePeriod(e,t){let n=this.parseTimeParts(this.timeValueFor(e));if(n.period===t)return;let i=t==="AM"?n.hour24-12:n.hour24+12;this.applyTimeValue(e,`${String(i).padStart(2,"0")}:${String(n.minute).padStart(2,"0")}`)}applyTimeValue(e,t){e==="start"?(this.startTimeValue=t,this.updateTimeInput(this.startTimeInput,t,"Start time"),this.followStartTime()):(this.endTimeValue=t,this.updateTimeInput(this.endTimeInput,t,"End time"),this.updateDurationFromEnd()),this.renderTimePickerContents(),this.positionTimePicker()}updateTimeInput(e,t,n){if(!e)return;let i=this.formatDisplayTime(t);e.value=i,e.setAttribute("aria-label",`${n}: ${i}. Open time picker.`)}timeValueFor(e){return e==="start"?this.startTimeValue:this.endTimeValue}parseTimeParts(e){let[t,n]=e.split(":").map(o=>Number(o)),i=Number.isFinite(t)?Math.min(23,Math.max(0,t)):0,r=Number.isFinite(n)?Math.min(59,Math.max(0,n)):0;return{hour24:i,hour12:i%12||12,minute:r,period:i>=12?"PM":"AM"}}formatDisplayTime(e){let t=this.parseTimeParts(e);return`${t.hour12}:${String(t.minute).padStart(2,"0")} ${t.period}`}async saveEvent(){var t,n,i,r,o;if(!this.titleValue.trim()){new c.Notice("Event title is required.");return}if(!this.dateValue){new c.Notice("Event date is required.");return}this.ensureEndAfterStart(!1);let e={uid:(t=this.event)==null?void 0:t.uid,href:(n=this.event)==null?void 0:n.href,etag:(i=this.event)==null?void 0:i.etag,rawIcs:(r=this.event)==null?void 0:r.rawIcs,title:this.titleValue,date:this.dateValue,startTime:this.startTimeValue,endTime:this.endTimeValue,allDay:this.allDayValue,location:this.locationValue,notes:this.notesValue,repeat:this.repeatValue,repeatUntil:this.repeatUntilValue};(o=this.event)!=null&&o.repeat&&this.event.repeat!=="none"?confirm("Edit only this event? Press Cancel to edit the whole repeating series.")?await this.plugin.saveCalendarOccurrence(this.event,e):await this.plugin.saveCalendarEvent(e):await this.plugin.saveCalendarEvent(e),this.close(),this.onSave()}async deleteEvent(){if(!this.event||!confirm(`Delete "${this.event.title||"Untitled event"}"?`))return;let t=this.event.repeat!=="none"&&confirm("Delete only this event? Press Cancel to delete the whole repeating series.");await this.plugin.deleteCalendarEvent(this.event,t),this.close(),this.onSave()}ensureEndAfterStart(e){if(this.allDayValue||!this.dateValue||!this.startTimeValue||!this.endTimeValue)return;let t=w(this.dateValue,this.startTimeValue);if(w(this.dateValue,this.endTimeValue)>t)return;let i=D(t,Math.max(this.durationMinutes,60));this.endTimeValue=this.timeInputValue(i),this.updateTimeInput(this.endTimeInput,this.endTimeValue,"End time"),e||new c.Notice("End time was adjusted to be after the start time.")}followStartTime(){if(this.allDayValue||!this.dateValue||!this.startTimeValue)return;let e=w(this.dateValue,this.startTimeValue),t=D(e,Math.max(this.durationMinutes,1));this.endTimeValue=this.timeInputValue(t),this.updateTimeInput(this.endTimeInput,this.endTimeValue,"End time")}updateDurationFromEnd(){if(this.allDayValue||!this.dateValue||!this.startTimeValue||!this.endTimeValue)return;let e=w(this.dateValue,this.startTimeValue),t=w(this.dateValue,this.endTimeValue);if(t<=e){this.durationMinutes=60,this.ensureEndAfterStart(!1);return}this.durationMinutes=Math.max(1,Math.round((t.getTime()-e.getTime())/6e4))}dateInputValue(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}timeInputValue(e){return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}},z=class extends c.Modal{constructor(a,e,t,n){super(a),this.plugin=e,this.plan={types:Object.fromEntries(Object.entries(t.types).map(([i,r])=>[i,[...r]])),sequence:[...t.sequence]},this.onSave=n}onOpen(){this.render()}render(){let{contentEl:a}=this;a.empty(),a.addClass("home-base-modal","home-base-routine-modal"),a.createEl("h2",{text:"Edit Workout Routine"});let e=a.createDiv({cls:"home-base-routine-section"}),t=e.createDiv({cls:"home-base-routine-section-header"});t.createEl("h3",{text:"Workout Types"}),t.createEl("button",{text:"+ Add Type"}).onClickEvent(()=>{let h=this.uniqueWorkoutName("New Workout");this.plan.types[h]=[],this.plan.sequence.push(h),this.render()});let i=Object.keys(this.plan.types);i.length||e.createEl("p",{cls:"home-base-muted home-base-italic",text:"Create a workout type to start your sequence."});for(let h of i)this.renderWorkoutType(e,h);let r=a.createDiv({cls:"home-base-routine-section"}),o=r.createDiv({cls:"home-base-routine-section-header"});o.createEl("h3",{text:"Sequence Order"});let l=o.createEl("button",{text:"+ Add Step"});l.disabled=!i.length,l.onClickEvent(()=>{let h=Object.keys(this.plan.types)[0];h&&(this.plan.sequence.push(h),this.render())}),this.plan.sequence.length||r.createEl("p",{cls:"home-base-muted home-base-italic",text:"No sequence steps yet."}),this.plan.sequence.forEach((h,m)=>{this.renderSequenceStep(r,h,m)});let d=a.createDiv({cls:"home-base-modal-footer"});d.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),d.createEl("button",{cls:"mod-cta",text:"Save Routine"}).onClickEvent(()=>void this.saveRoutine())}renderWorkoutType(a,e){let t=a.createDiv({cls:"home-base-routine-card"}),n=t.createDiv({cls:"home-base-routine-card-row"}),i=n.createEl("input",{cls:"home-base-routine-name"});i.type="text",i.value=e,i.placeholder="Workout name",i.onchange=()=>{this.renameWorkoutType(e,i.value.trim())},n.createEl("button",{text:"Delete"}).onClickEvent(()=>{delete this.plan.types[e],this.plan.sequence=this.plan.sequence.filter(l=>l!==e),this.render()});let o=t.createEl("textarea",{cls:"home-base-routine-exercises"});o.placeholder="One exercise per line",o.value=this.plan.types[e].join(`
`),o.onchange=()=>{this.plan.types[e]=o.value.split(`
`).map(l=>l.trim()).filter(Boolean)}}renderSequenceStep(a,e,t){let n=a.createDiv({cls:"home-base-sequence-row"});n.createEl("span",{cls:"home-base-sequence-index",text:`${t+1}`});let i=n.createEl("select");for(let d of Object.keys(this.plan.types)){let u=i.createEl("option",{text:d,value:d});u.selected=d===e}i.onchange=()=>{this.plan.sequence[t]=i.value};let r=n.createEl("button",{text:"Up"});r.disabled=t===0,r.onClickEvent(()=>{this.moveSequenceStep(t,t-1),this.render()});let o=n.createEl("button",{text:"Down"});o.disabled=t===this.plan.sequence.length-1,o.onClickEvent(()=>{this.moveSequenceStep(t,t+1),this.render()}),n.createEl("button",{text:"Remove"}).onClickEvent(()=>{this.plan.sequence.splice(t,1),this.render()})}renameWorkoutType(a,e){if(!e||e===a)return;if(this.plan.types[e]){new c.Notice("A workout type with that name already exists."),this.render();return}let t=Object.entries(this.plan.types);this.plan.types=Object.fromEntries(t.map(([n,i])=>n===a?[e,i]:[n,i])),this.plan.sequence=this.plan.sequence.map(n=>n===a?e:n),this.render()}moveSequenceStep(a,e){let[t]=this.plan.sequence.splice(a,1);this.plan.sequence.splice(e,0,t)}uniqueWorkoutName(a){if(!this.plan.types[a])return a;let e=2;for(;this.plan.types[`${a} ${e}`];)e+=1;return`${a} ${e}`}async saveRoutine(){let a=Object.keys(this.plan.types).filter(Boolean);if(!a.length){new c.Notice("Add at least one workout type.");return}this.plan.sequence=this.plan.sequence.filter(t=>!!this.plan.types[t]),this.plan.sequence.length||(this.plan.sequence=[a[0]]),await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,_);let e=this.app.vault.getAbstractFileByPath((0,c.normalizePath)(this.plugin.settings.workoutPlanPath));e instanceof c.TFile&&(await this.app.vault.modify(e,this.formatWorkoutPlan()),new c.Notice("Workout routine saved."),this.close(),this.onSave())}formatWorkoutPlan(){let a=["# Workout Types",""];for(let[e,t]of Object.entries(this.plan.types))a.push(`## ${e}`),t.length?a.push(...t.map(n=>`- ${n}`)):a.push("Rest day"),a.push("");return a.push("# Sequence",""),a.push(...this.plan.sequence.map(e=>`- ${e}`)),a.push(""),a.join(`
`)}},G=class extends c.PluginSettingTab{constructor(a,e){super(a,e),this.plugin=e}display(){let{containerEl:a}=this;a.empty(),a.createEl("h2",{text:"Home Base Settings"}),new c.Setting(a).setName("Open on startup").setDesc("Automatically open the Home Base dashboard when Obsidian starts.").addToggle(e=>{e.setValue(this.plugin.settings.openOnStartup).onChange(async t=>{this.plugin.settings.openOnStartup=t,await this.plugin.saveSettings()})}),a.createEl("h3",{text:"Calendar"}),new c.Setting(a).setName("Enable calendar").setDesc("Connect a writable CalDAV calendar, such as iCloud Calendar.").addToggle(e=>{e.setValue(this.plugin.settings.calendarEnabled).onChange(async t=>{this.plugin.settings.calendarEnabled=t,await this.plugin.saveSettings()})}),new c.Setting(a).setName("CalDAV server URL").setDesc("For iCloud, use https://caldav.icloud.com.").addText(e=>{e.setPlaceholder("https://caldav.icloud.com").setValue(this.plugin.settings.calendarServerUrl).onChange(async t=>{this.plugin.settings.calendarServerUrl=t.trim(),await this.plugin.saveSettings()})}),new c.Setting(a).setName("Calendar username").setDesc("For iCloud, use your Apple ID email.").addText(e=>{e.setPlaceholder("name@example.com").setValue(this.plugin.settings.calendarUsername).onChange(async t=>{this.plugin.settings.calendarUsername=t.trim(),await this.plugin.saveSettings()})}),new c.Setting(a).setName("Calendar password").setDesc("For iCloud, use an app-specific password.").addText(e=>{e.inputEl.type="password",e.setValue(this.plugin.settings.calendarPassword).onChange(async t=>{this.plugin.settings.calendarPassword=t,await this.plugin.saveSettings()})}),new c.Setting(a).setName("Default calendar URL").setDesc("Leave blank and use Test connection to auto-select an event calendar.").addText(e=>{e.setPlaceholder("https://caldav.icloud.com/...").setValue(this.plugin.settings.calendarUrl).onChange(async t=>{this.plugin.settings.calendarUrl=t.trim(),await this.plugin.saveSettings()})}),new c.Setting(a).setName("Default calendar name").setDesc("Shown in the dashboard header.").addText(e=>{e.setPlaceholder("Calendar").setValue(this.plugin.settings.calendarName).onChange(async t=>{this.plugin.settings.calendarName=t.trim(),await this.plugin.saveSettings()})}),new c.Setting(a).setName("Test calendar connection").setDesc("Discovers CalDAV event calendars and prefers a writable calendar when iCloud reports permissions.").addButton(e=>{e.setButtonText("Test"),e.onClick(async()=>{try{let t=await this.plugin.testCalendarConnection();new c.Notice(`Connected to ${t.displayName}.`),this.display()}catch(t){new c.Notice(t instanceof Error?t.message:"Calendar connection failed.")}})}),a.createEl("h3",{text:"Todos"}),new c.Setting(a).setName("Todo inbox file").setDesc("New todos created from the dashboard are saved here.").addText(e=>{e.setValue(this.plugin.settings.todoInboxPath).onChange(async t=>{this.plugin.settings.todoInboxPath=(0,c.normalizePath)(t),await this.plugin.saveSettings()})}),new c.Setting(a).setName("Todo scan folders").setDesc("Comma-separated folders to scan for Markdown todos. Leave blank to scan the whole vault.").addText(e=>{e.setValue(this.plugin.settings.todoScanFolders).onChange(async t=>{this.plugin.settings.todoScanFolders=t,await this.plugin.saveSettings()})}),a.createEl("h3",{text:"Workout"}),new c.Setting(a).setName("Workout plan file").addText(e=>{e.setValue(this.plugin.settings.workoutPlanPath).onChange(async t=>{this.plugin.settings.workoutPlanPath=(0,c.normalizePath)(t),await this.plugin.saveSettings()})}),new c.Setting(a).setName("Workout log file").addText(e=>{e.setValue(this.plugin.settings.workoutLogPath).onChange(async t=>{this.plugin.settings.workoutLogPath=(0,c.normalizePath)(t),await this.plugin.saveSettings()})})}};
