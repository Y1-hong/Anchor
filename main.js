/* Anchor Obsidian plugin */
var Y=Object.defineProperty;var ue=Object.getOwnPropertyDescriptor;var pe=Object.getOwnPropertyNames;var me=Object.prototype.hasOwnProperty;var ge=(l,s)=>{for(var e in s)Y(l,e,{get:s[e],enumerable:!0})},fe=(l,s,e,t)=>{if(s&&typeof s=="object"||typeof s=="function")for(let a of pe(s))!me.call(l,a)&&a!==e&&Y(l,a,{get:()=>s[a],enumerable:!(t=ue(s,a))||t.enumerable});return l};var ve=l=>fe(Y({},"__esModule",{value:!0}),l);var $e={};ge($e,{default:()=>W});module.exports=ve($e);var u=require("obsidian"),L="anchor-dashboard",V="anchor-calendar",ye={openOnStartup:!0,todoInboxPath:"Anchor/Todo Inbox.md",todoScanFolders:"Anchor",workoutPlanPath:"Anchor/Workout Plan.md",workoutLogPath:"Anchor/Workout Log.md",showSchedulePlaceholder:!0,calendarEnabled:!1,calendarServerUrl:"https://caldav.icloud.com",calendarUsername:"",calendarPassword:"",calendarUrl:"",calendarName:"",calendarSources:[],defaultCalendarId:""},ie=`# Todo Inbox

`,Z=`# Workout Types

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
`,oe=`# Workout Log

`,z="urn:ietf:params:xml:ns:caldav",q="DAV:";function se(l){let s=l.trim();return s?s.endsWith("/")?s:`${s}/`:""}function I(l,s){return new URL(s,se(l)).toString()}function xe(l){return`${encodeURIComponent(l)}.ics`}function J(l){let s=l.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`),e=[];for(let t of s)/^[ \t]/.test(t)&&e.length?e[e.length-1]+=t.slice(1):t.trim()&&e.push(t);return e}function ce(l){let s=l.indexOf(":");if(s===-1)return null;let e=l.slice(0,s),[t,...a]=e.split(";");return{name:t.toUpperCase(),params:a.join(";"),value:l.slice(s+1)}}function K(l){return l.replace(/\\n/gi,`
`).replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\")}function G(l){return l.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/;/g,"\\;").replace(/,/g,"\\,")}function ee(l){let s=[],e=l;for(;e.length>74;)s.push(e.slice(0,74)),e=` ${e.slice(74)}`;return s.push(e),s.join(`\r
`)}function A(l){return`${l.getFullYear()}${String(l.getMonth()+1).padStart(2,"0")}${String(l.getDate()).padStart(2,"0")}`}function O(l){return l.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z")}function N(l){return`${A(l)}T${String(l.getHours()).padStart(2,"0")}${String(l.getMinutes()).padStart(2,"0")}${String(l.getSeconds()).padStart(2,"0")}`}function we(l,s){let e=_(l,s);return e.allDay?A(e.date):N(e.date)}function _(l,s){let e=/VALUE=DATE/i.test(s)||/^\d{8}$/.test(l);if(/^\d{8}$/.test(l))return{date:new Date(Number(l.slice(0,4)),Number(l.slice(4,6))-1,Number(l.slice(6,8))),allDay:e};let t=l.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);if(!t)return{date:new Date,allDay:e};let[,a,n,r,i,o,c,d]=t,h=[a,n,r,i,o,c].map(p=>Number(p));return d?{date:new Date(Date.UTC(h[0],h[1]-1,h[2],h[3],h[4],h[5])),allDay:e}:{date:new Date(h[0],h[1]-1,h[2],h[3],h[4],h[5]),allDay:e}}function D(l,s){return new Date(l.getTime()+s*6e4)}function le(l){let s=new Date(l);return s.setSeconds(0,0),s.getMinutes()<30?s.setMinutes(30):s.setHours(s.getHours()+1,0,0,0),s}function be(l,s){let e=new Date(l);return e.setMonth(e.getMonth()+s),e}function De(l,s){let e=new Date(l);return e.setFullYear(e.getFullYear()+s),e}function T(l,s){let[e,t,a]=l.split("-").map(i=>Number(i)),[n,r]=s.split(":").map(i=>Number(i));return new Date(e,t-1,a,n||0,r||0,0)}function Ee(l){let[s,e,t]=l.date.split("-").map(r=>Number(r));if(l.allDay){let r=new Date(s,e-1,t);return{start:r,end:M(r,1)}}let a=T(l.date,l.startTime||"09:00"),n=T(l.date,l.endTime||"10:00");return n<=a&&(n=D(a,60)),{start:a,end:n}}function M(l,s){let e=new Date(l);return e.setDate(e.getDate()+s),e}function de(l,s){let{start:e,end:t}=Ee(l),a=new Date,n=[`UID:${s}`,`DTSTAMP:${O(a)}`,`LAST-MODIFIED:${O(a)}`,`SUMMARY:${G(l.title.trim())}`];l.allDay?(n.push(`DTSTART;VALUE=DATE:${A(e)}`),n.push(`DTEND;VALUE=DATE:${A(t)}`)):(n.push(`DTSTART:${N(e)}`),n.push(`DTEND:${N(t)}`)),l.location.trim()&&n.push(`LOCATION:${G(l.location.trim())}`),l.notes.trim()&&n.push(`DESCRIPTION:${G(l.notes.trim())}`);let r=Te(l);return r&&n.push(`RRULE:${r}`),n}function Te(l){if(l.repeat==="none")return"";let s=[];if(l.repeat==="daily"&&s.push("FREQ=DAILY"),l.repeat==="weekdays"&&s.push("FREQ=WEEKLY","BYDAY=MO,TU,WE,TH,FR"),l.repeat==="weekly"&&s.push("FREQ=WEEKLY"),l.repeat==="monthly"&&s.push("FREQ=MONTHLY"),l.repeat==="yearly"&&s.push("FREQ=YEARLY"),l.repeatUntil){let e=l.allDay?`${l.repeatUntil.replace(/-/g,"")}`:N(T(l.repeatUntil,l.endTime||"23:59"));s.push(`UNTIL=${e}`)}return s.join(";")}function he(l,s){return`${["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Anchor//Obsidian Calendar//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",`CREATED:${O(new Date)}`,...de(l,s),"END:VEVENT","END:VCALENDAR"].map(ee).join(`\r
`)}\r
`}function Ce(l,s,e){let t=J(l),a=t.findIndex(c=>c.toUpperCase()==="BEGIN:VEVENT"),n=t.findIndex((c,d)=>d>a&&c.toUpperCase()==="END:VEVENT");if(a===-1||n===-1)return he(s,e);let r=de(s,e),i=new Set(["UID","DTSTAMP","LAST-MODIFIED","SUMMARY","DTSTART","DTEND","LOCATION","DESCRIPTION","RRULE"]);return`${[...t.slice(0,a+1),...r,...t.slice(a+1,n).filter(c=>{let d=ce(c);return!d||!i.has(d.name)}),...t.slice(n)].map(ee).join(`\r
`)}\r
`}function ke(l,s,e,t){var y,x,C,F,$,E,k,te,ae,ne;let a=J(l),n=a.findIndex(w=>w.toUpperCase()==="BEGIN:VEVENT"),r=a.findIndex((w,S)=>S>n&&w.toUpperCase()==="END:VEVENT");if(n===-1||r===-1)return null;let i=a.slice(n+1,r).map(ce).filter(w=>!!w),o=w=>i.find(S=>S.name===w),c=w=>i.filter(S=>S.name===w),d=((y=o("UID"))==null?void 0:y.value)||((x=s.split("/").pop())==null?void 0:x.replace(/\.ics$/i,""))||crypto.randomUUID(),h=o("DTSTART");if(!h)return null;let p=_(h.value,h.params),g=o("DTEND"),f=g?_(g.value,g.params):{date:p.allDay?M(p.date,1):D(p.date,60),allDay:p.allDay},m=Se((F=(C=o("RRULE"))==null?void 0:C.value)!=null?F:""),v=c("EXDATE").flatMap(w=>w.value.split(",").map(S=>we(S,w.params)));return{uid:d,href:s,etag:e,title:K((E=($=o("SUMMARY"))==null?void 0:$.value)!=null?E:""),start:p.date,end:f.date,allDay:p.allDay,location:K((te=(k=o("LOCATION"))==null?void 0:k.value)!=null?te:""),notes:K((ne=(ae=o("DESCRIPTION"))==null?void 0:ae.value)!=null?ne:""),repeat:m.repeat,repeatUntil:m.repeatUntil,exceptionDates:v,rawIcs:l,calendarName:t.displayName,calendarId:t.id,accountName:t.accountName,provider:t.provider,color:t.color,writable:t.writable}}function Se(l){if(!l)return{repeat:"none",repeatUntil:""};let s=Object.fromEntries(l.split(";").map(t=>{let[a,n=""]=t.split("=");return[a.toUpperCase(),n.toUpperCase()]})),e="none";return s.FREQ==="DAILY"&&(e="daily"),s.FREQ==="WEEKLY"&&s.BYDAY==="MO,TU,WE,TH,FR"?e="weekdays":s.FREQ==="WEEKLY"&&(e="weekly"),s.FREQ==="MONTHLY"&&(e="monthly"),s.FREQ==="YEARLY"&&(e="yearly"),{repeat:e,repeatUntil:s.UNTIL?`${s.UNTIL.slice(0,4)}-${s.UNTIL.slice(4,6)}-${s.UNTIL.slice(6,8)}`:""}}function Pe(l){var e;let s=(e=l.occurrenceStart)!=null?e:l.start;return l.allDay?A(s):N(s)}function Le(l,s){let e=J(l),t=e.findIndex(i=>i.toUpperCase()==="END:VEVENT");if(t===-1)return l;let a=Pe(s);if(s.exceptionDates.includes(a))return l;let n=s.allDay?`EXDATE;VALUE=DATE:${a}`:`EXDATE:${a}`;return`${[...e.slice(0,t),n,...e.slice(t)].map(ee).join(`\r
`)}\r
`}function Ve(l,s,e){return l.flatMap(t=>t.repeat==="none"?[t]:Ae(t,s,e))}function Ae(l,s,e){let t=l.end.getTime()-l.start.getTime(),a=l.repeatUntil?M(new Date(`${l.repeatUntil}T00:00:00`),1):e,n=[],r=new Date(l.start),i=0;for(;r<e&&r<a&&i<500;){i+=1;let o=new Date(r.getTime()+t),c=l.allDay?A(r):N(r),d=r.getDay()>=1&&r.getDay()<=5;if(o>=s&&r<e&&!l.exceptionDates.includes(c)&&(l.repeat!=="weekdays"||d)&&n.push({...l,start:new Date(r),end:o,occurrenceStart:new Date(r)}),l.repeat==="daily"||l.repeat==="weekdays")r=M(r,1);else if(l.repeat==="weekly")r=M(r,7);else if(l.repeat==="monthly")r=be(r,1);else if(l.repeat==="yearly")r=De(r,1);else break}return n}function b(l,s){let e=l instanceof Document?l.documentElement:l,t=Array.from(e.getElementsByTagName("*"));return e.localName===s&&t.unshift(e),t.filter(a=>a.localName===s)}function P(l,s){var e,t,a;return(a=(t=(e=b(l,s)[0])==null?void 0:e.textContent)==null?void 0:t.trim())!=null?a:""}function re(l,s){let e=b(l,s)[0];return e?P(e,"href"):""}function U(l){return new DOMParser().parseFromString(l,"application/xml")}var Ne=`
.anchor-view {
  min-height: 100%;
  padding: 32px;
  color: var(--text-normal);
  background:
    radial-gradient(circle at top right, rgba(124, 97, 255, 0.12), transparent 36rem),
    var(--background-primary);
}

.anchor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
}

.anchor-header h1 {
  margin: 0 0 8px;
  font-size: 30px;
  letter-spacing: 0;
}

.anchor-date,
.anchor-greeting,
.anchor-muted {
  color: var(--text-muted);
}

.anchor-greeting {
  margin-top: 6px;
}

.anchor-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(360px, 1.2fr);
  gap: 22px;
  align-items: start;
}

.anchor-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.anchor-panel {
  padding: 20px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  background: var(--background-secondary);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.14);
}

.anchor-panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.anchor-panel-title h2 {
  margin: 0;
  font-size: 18px;
}

.anchor-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  min-height: 28px;
  color: var(--interactive-accent);
  font-size: 12px;
}

.anchor-pill,
.anchor-priority {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 2px 9px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.anchor-pill {
  color: var(--interactive-accent);
  background: rgba(124, 97, 255, 0.14);
}

.anchor-schedule-empty {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border: 1px dashed var(--background-modifier-border);
  border-radius: 8px;
}

.anchor-schedule-empty p {
  margin: 4px 0 0;
  color: var(--text-muted);
}

.anchor-calendar-mark {
  color: var(--text-muted);
  font-size: 13px;
}

.anchor-calendar-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.anchor-calendar-error {
  padding: 14px;
  border: 1px solid rgba(199, 74, 48, 0.5);
  border-radius: 8px;
  color: #ff8f7e;
  background: rgba(199, 74, 48, 0.12);
}

.anchor-calendar-error p {
  margin: 6px 0 0;
}

.anchor-calendar-group {
  margin-top: 18px;
}

.anchor-calendar-event {
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

.anchor-calendar-time {
  color: var(--interactive-accent);
  font-size: 12px;
  font-weight: 700;
}

.anchor-calendar-time.is-all-day {
  color: var(--text-muted);
}

.anchor-calendar-title {
  margin-bottom: 6px;
  font-weight: 600;
}

.anchor-calendar-source-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--background-modifier-border);
}

.anchor-calendar-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.anchor-italic {
  font-style: italic;
}

.anchor-todo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.anchor-primary-button,
.anchor-secondary-button,
.anchor-wide-button,
.anchor-icon-button,
.anchor-ghost-button {
  min-height: 36px;
  border-radius: 6px;
}

.anchor-wide-button {
  width: 100%;
  margin: 12px 0;
}

.anchor-icon-button {
  padding: 0 14px;
}

.anchor-secondary-button {
  background: var(--background-modifier-form-field);
}

.anchor-ghost-button {
  padding: 4px 8px;
  color: var(--text-muted);
  background: transparent;
  box-shadow: none;
}

.anchor-todo-group {
  margin-top: 18px;
}

.anchor-todo-group h3,
.anchor-panel h3 {
  margin: 0 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--background-modifier-border);
  font-size: 15px;
}

.anchor-todo-item {
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

.anchor-todo-item.is-complete {
  opacity: 0.58;
}

.anchor-checkbox {
  width: 18px;
  height: 18px;
}

.anchor-todo-name {
  margin-bottom: 7px;
  font-weight: 500;
}

.anchor-todo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: var(--text-muted);
  font-size: 13px;
}

.anchor-priority.is-high {
  color: #ff8f7e;
  background: rgba(199, 74, 48, 0.18);
}

.anchor-priority.is-medium {
  color: #e7bd5b;
  background: rgba(178, 132, 32, 0.18);
}

.anchor-priority.is-low {
  color: #8dd277;
  background: rgba(70, 139, 63, 0.18);
}

.anchor-tag {
  color: var(--interactive-accent);
}

.anchor-actions {
  display: flex;
  gap: 4px;
}

.anchor-unresolved {
  margin-bottom: 18px;
  padding: 14px;
  border: 1px solid rgba(226, 170, 68, 0.5);
  border-radius: 8px;
  color: #f0c25f;
  background: rgba(226, 170, 68, 0.1);
}

.anchor-unresolved-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.anchor-workout-name {
  margin: 8px 0 10px;
  color: var(--interactive-accent);
  font-size: 30px;
  font-weight: 700;
}

.anchor-exercises {
  margin-top: 0;
}

.anchor-exercises li::marker {
  color: var(--interactive-accent);
}

.anchor-workout-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.anchor-sequence {
  margin-top: 18px;
  color: var(--text-muted);
}

.anchor-modal .setting-item {
  border-top: 0;
}

.anchor-time-setting .setting-item-control {
  flex: 1;
}

.anchor-time-field {
  position: relative;
  width: min(260px, 100%);
}

.anchor-time-input-wrap {
  position: relative;
}

.anchor-time-input {
  width: 100%;
  padding-right: 36px;
  cursor: pointer;
}

.anchor-time-icon {
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

.anchor-time-popover {
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

.anchor-time-popover.is-above {
  top: auto;
  bottom: calc(100% + 12px);
}

.anchor-time-popover::before {
  position: absolute;
  top: -7px;
  left: var(--anchor-time-pointer-left, 28px);
  width: 14px;
  height: 14px;
  border-top: 1px solid var(--background-modifier-border);
  border-left: 1px solid var(--background-modifier-border);
  background: var(--background-primary);
  content: "";
  transform: rotate(45deg);
}

.anchor-time-popover.is-above::before {
  top: auto;
  bottom: -7px;
  border: 0;
  border-right: 1px solid var(--background-modifier-border);
  border-bottom: 1px solid var(--background-modifier-border);
}

.anchor-time-column,
.anchor-period-column {
  display: flex;
  align-items: center;
  justify-content: center;
}

.anchor-time-column {
  flex-direction: column;
  gap: 7px;
  touch-action: none;
}

.anchor-time-value {
  min-width: 54px;
  color: var(--text-normal);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
}

.anchor-time-step,
.anchor-period-button {
  border: 0;
  box-shadow: none;
}

.anchor-time-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 24px;
  padding: 0;
  color: var(--text-muted);
  background: transparent;
}

.anchor-time-step:hover,
.anchor-time-step:focus-visible {
  color: var(--text-normal);
  background: var(--background-secondary);
}

.anchor-time-divider {
  width: 1px;
  min-height: 110px;
  background: var(--background-modifier-border);
}

.anchor-period-column {
  flex-direction: column;
  gap: 8px;
}

.anchor-period-button {
  min-width: 46px;
  height: 34px;
  padding: 0 10px;
  border-radius: 9px;
  color: var(--text-muted);
  background: transparent;
  font-weight: 700;
}

.anchor-period-button.is-selected {
  color: var(--text-on-accent);
  background: var(--interactive-accent);
}

.anchor-time-input:focus-visible,
.anchor-time-step:focus-visible,
.anchor-period-button:focus-visible {
  outline: 2px solid var(--interactive-accent);
  outline-offset: 2px;
}

.anchor-routine-modal {
  max-width: 780px;
}

.anchor-routine-section {
  margin-top: 22px;
}

.anchor-routine-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.anchor-routine-section-header h3 {
  margin: 0;
}

.anchor-routine-card {
  margin-bottom: 12px;
  padding: 14px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  background: var(--background-secondary);
}

.anchor-routine-card-row,
.anchor-sequence-row,
.anchor-modal-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.anchor-routine-name,
.anchor-sequence-row select {
  flex: 1;
}

.anchor-routine-exercises {
  width: 100%;
  min-height: 86px;
  margin-top: 10px;
  resize: vertical;
}

.anchor-sequence-row {
  margin-bottom: 8px;
  padding: 10px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  background: var(--background-secondary);
}

.anchor-sequence-index {
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

.anchor-modal-footer {
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 900px) {
  .anchor-view {
    padding: 18px;
  }

  .anchor-grid {
    grid-template-columns: 1fr;
  }

  .anchor-todo-item {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .anchor-calendar-event {
    grid-template-columns: 1fr;
  }

  .anchor-actions {
    grid-column: 2;
  }

  .anchor-calendar-event .anchor-actions {
    grid-column: 1;
  }

  .anchor-routine-card-row,
  .anchor-sequence-row {
    align-items: stretch;
    flex-direction: column;
  }
}
`,Re=`
.anchor-calendar-view{min-height:100%;padding:24px;color:var(--text-normal);background:radial-gradient(circle at top right,rgba(124,97,255,.1),transparent 38rem),var(--background-primary)}
.anchor-calendar-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:18px}.anchor-calendar-heading h1{margin:0;font-size:28px}.anchor-calendar-heading-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:5px;color:var(--text-muted);font-size:13px}.anchor-calendar-heading-meta>span+span:not(.anchor-pill)::before{content:"\xB7";margin-right:8px}
.anchor-calendar-header-controls,.anchor-calendar-navigation,.anchor-calendar-header-actions,.anchor-calendar-mode-switch{display:flex;align-items:center;gap:8px}.anchor-calendar-header-controls{flex-wrap:wrap;justify-content:flex-end}.anchor-calendar-nav-button,.anchor-calendar-header-controls button{min-width:40px;min-height:40px}.anchor-calendar-nav-button{display:inline-flex;align-items:center;justify-content:center;padding:0}.anchor-calendar-nav-button svg,.anchor-calendar-provider-title svg{width:17px;height:17px}
.anchor-calendar-mode-switch{padding:3px;border:1px solid var(--background-modifier-border);border-radius:8px;background:var(--background-secondary)}.anchor-calendar-mode-switch button{min-height:34px;padding:0 13px;background:transparent;box-shadow:none}.anchor-calendar-mode-switch button.is-selected{color:var(--text-on-accent);background:var(--interactive-accent)}
.anchor-calendar-layout{display:grid;grid-template-columns:minmax(210px,240px) minmax(0,1fr);gap:16px;align-items:start}.anchor-calendar-sidebar,.anchor-calendar-main{border:1px solid var(--background-modifier-border);border-radius:10px;background:color-mix(in srgb,var(--background-secondary) 88%,transparent)}.anchor-calendar-sidebar{position:sticky;top:12px;padding:16px}.anchor-calendar-sidebar>summary{display:none;cursor:pointer;font-weight:650}.anchor-calendar-provider+.anchor-calendar-provider{margin-top:22px}.anchor-calendar-provider-title{display:flex;align-items:center;gap:8px;margin-bottom:10px}.anchor-calendar-provider-title h2{margin:0;font-size:15px}
.anchor-calendar-source{display:grid;grid-template-columns:18px 10px minmax(0,1fr);gap:8px;align-items:center;min-height:44px;padding:6px 4px;border-radius:6px;cursor:pointer}.anchor-calendar-source:hover{background:var(--background-modifier-hover)}.anchor-calendar-source input{margin:0}.anchor-calendar-source-copy,.anchor-calendar-source-name,.anchor-calendar-source-account{display:block;min-width:0}.anchor-calendar-source-name,.anchor-calendar-source-account{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.anchor-calendar-source-name{font-weight:600}.anchor-calendar-source-account{margin-top:2px;color:var(--text-muted);font-size:11px}
.anchor-calendar-main{min-width:0;overflow:auto}.anchor-calendar-main>.anchor-calendar-error{margin:14px}.anchor-calendar-empty,.anchor-calendar-loading{padding:48px 24px;color:var(--text-muted);text-align:center}.anchor-calendar-empty h2{color:var(--text-normal)}
.anchor-month-calendar{min-width:720px}.anchor-month-weekdays,.anchor-month-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}.anchor-month-weekdays{position:sticky;top:0;z-index:4;border-bottom:1px solid var(--background-modifier-border);background:var(--background-secondary)}.anchor-month-weekdays>div{padding:10px;color:var(--text-muted);font-size:12px;font-weight:650;text-align:center;text-transform:uppercase}.anchor-month-grid{grid-auto-rows:minmax(116px,1fr)}
.anchor-month-day{position:relative;min-width:0;padding:8px;border-right:1px solid var(--background-modifier-border);border-bottom:1px solid var(--background-modifier-border);outline:none;background:var(--background-primary)}.anchor-month-day:nth-child(7n){border-right:0}.anchor-month-day.is-outside{background:color-mix(in srgb,var(--background-secondary) 72%,transparent)}.anchor-month-day.is-outside .anchor-month-day-number{color:var(--text-faint)}.anchor-month-day:focus-visible,.anchor-month-day:focus-within{z-index:2;box-shadow:inset 0 0 0 2px var(--interactive-accent)}
.anchor-month-day-number{display:inline-flex;align-items:center;justify-content:center;width:30px;min-width:30px;height:30px;min-height:30px;margin-bottom:5px;padding:0;border-radius:999px;color:var(--text-muted);background:transparent;box-shadow:none}.anchor-month-day.is-today .anchor-month-day-number{color:var(--text-on-accent);background:var(--interactive-accent);font-weight:700}.anchor-month-events{display:flex;flex-direction:column;gap:3px;min-height:66px}
.anchor-month-event,.anchor-all-day-event,.anchor-calendar-timed-event{border:0;border-left:3px solid var(--anchor-event-color);border-radius:5px;color:var(--text-normal);background:color-mix(in srgb,var(--anchor-event-color) 20%,var(--background-primary));box-shadow:none;text-align:left}.anchor-month-event{display:flex;align-items:center;gap:5px;width:100%;min-width:0;min-height:24px;padding:3px 5px;font-size:11px}.anchor-month-event-provider,.anchor-calendar-provider-tag{flex:0 0 auto;color:var(--text-muted);font-size:9px;font-weight:700;letter-spacing:.03em;text-transform:uppercase}.anchor-month-event-time{flex:0 0 auto;color:var(--text-muted)}.anchor-month-event-title{overflow:hidden;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.anchor-month-more{width:100%;min-height:24px;padding:2px 5px;color:var(--text-muted);background:transparent;box-shadow:none;font-size:11px;text-align:left}
.anchor-time-calendar{min-width:720px}.anchor-time-calendar.is-day{min-width:520px}.anchor-time-calendar-header,.anchor-all-day-row{display:grid;grid-template-columns:64px minmax(0,1fr)}.anchor-time-calendar-header,.anchor-all-day-row{border-bottom:1px solid var(--background-modifier-border)}.anchor-time-gutter{display:flex;align-items:center;justify-content:flex-end;padding:8px;color:var(--text-muted);font-size:10px;text-transform:uppercase}.anchor-time-day-headers,.anchor-all-day-columns,.anchor-time-columns{display:grid;grid-template-columns:repeat(var(--anchor-calendar-days),minmax(0,1fr))}
.anchor-time-day-header{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:58px;border-radius:0;background:transparent;box-shadow:none}.anchor-time-day-header span{color:var(--text-muted);font-size:11px;text-transform:uppercase}.anchor-time-day-header.is-today strong{color:var(--interactive-accent)}.anchor-all-day-row{min-height:54px}.anchor-all-day-column{min-width:0;padding:5px;border-left:1px solid var(--background-modifier-border)}.anchor-all-day-event{display:flex;align-items:center;gap:5px;width:100%;min-height:26px;margin-bottom:3px;padding:4px 6px;overflow:hidden;font-size:11px;text-overflow:ellipsis;white-space:nowrap}
.anchor-calendar-time-scroll{display:grid;grid-template-columns:64px minmax(0,1fr);max-height:min(68vh,720px);overflow-y:auto;overscroll-behavior:contain}.anchor-time-labels{display:grid;grid-template-rows:repeat(24,64px)}.anchor-time-labels>div{padding:0 8px;color:var(--text-muted);font-size:10px;text-align:right;transform:translateY(-6px)}.anchor-time-day-column{position:relative;display:grid;grid-template-rows:repeat(48,32px);min-width:0;border-left:1px solid var(--background-modifier-border);background:var(--background-primary)}.anchor-time-day-column.is-today{background:color-mix(in srgb,var(--interactive-accent) 4%,var(--background-primary))}
.anchor-time-slot{min-width:0;min-height:32px;padding:0;border:0;border-bottom:1px solid color-mix(in srgb,var(--background-modifier-border) 58%,transparent);border-radius:0;background:transparent;box-shadow:none}.anchor-time-slot:nth-child(2n){border-bottom-color:var(--background-modifier-border)}.anchor-time-slot:hover,.anchor-time-slot:focus-visible{background:color-mix(in srgb,var(--interactive-accent) 10%,transparent)}.anchor-calendar-timed-event{position:absolute;z-index:3;display:flex;flex-direction:column;align-items:flex-start;min-height:28px;padding:5px 6px;overflow:hidden;font-size:10px}.anchor-calendar-timed-event strong,.anchor-calendar-timed-event>span:last-child{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.anchor-current-time{position:absolute;right:0;left:0;z-index:5;height:2px;pointer-events:none;background:var(--text-error)}.anchor-current-time::before{position:absolute;top:-3px;left:-4px;width:8px;height:8px;border-radius:999px;background:var(--text-error);content:""}.anchor-event-details{margin-top:16px}.anchor-event-detail{display:grid;grid-template-columns:96px minmax(0,1fr);gap:14px;padding:10px 0;border-bottom:1px solid var(--background-modifier-border)}.anchor-event-detail>div{white-space:pre-wrap}
.anchor-calendar-view button:focus-visible,.anchor-calendar-source input:focus-visible,.anchor-calendar-sidebar>summary:focus-visible{outline:2px solid var(--interactive-accent);outline-offset:2px}
@media(prefers-reduced-motion:reduce){.anchor-calendar-view *{scroll-behavior:auto!important;transition:none!important}}
@media(max-width:900px){.anchor-calendar-view{padding:14px}.anchor-calendar-header{align-items:stretch;flex-direction:column}.anchor-calendar-header-controls{justify-content:flex-start}.anchor-calendar-layout{grid-template-columns:1fr}.anchor-calendar-sidebar{position:static}.anchor-calendar-sidebar>summary{display:list-item}.anchor-calendar-sidebar[open]>summary{margin-bottom:14px}}
`,W=class extends u.Plugin{constructor(){super(...arguments);this.calendarCaches=new Map;this.calendarRequests=new Map;this.calendarRequestVersions=new Map}async onload(){await this.loadSettings(),this.injectStyles(),this.registerView(L,e=>new H(e,this)),this.registerView(V,e=>new j(e,this)),this.addRibbonIcon("anchor","Open Anchor",()=>{this.openDashboard()}),this.addCommand({id:"open-anchor",name:"Open Anchor",callback:()=>void this.openDashboard()}),this.addCommand({id:"refresh-anchor",name:"Refresh Anchor",callback:()=>void this.refreshDashboard()}),this.addCommand({id:"open-anchor-calendar",name:"Open Anchor Calendar",callback:()=>void this.openCalendar()}),this.addSettingTab(new X(this.app,this)),await this.ensureDefaultFiles().catch(e=>{console.warn("Anchor could not create one or more default files.",e)}),this.settings.openOnStartup&&this.app.workspace.onLayoutReady(()=>{this.openDashboard()})}onunload(){var e;this.app.workspace.detachLeavesOfType(L),this.app.workspace.detachLeavesOfType(V),(e=this.styleEl)==null||e.remove()}async saveSettings(){await this.saveData(this.settings)}async loadSettings(){var r,i,o,c;let e=(r=await this.loadData())!=null?r:{},t=Array.isArray(e.calendarSources)?e.calendarSources:[],a=t.filter(d=>(d==null?void 0:d.provider)==="icloud"),n=a.length!==t.length||"googleAccounts"in e||"systemCalendarSnapshot"in e||"systemSnapshotUpdatedAt"in e;delete e.googleAccounts,delete e.systemCalendarSnapshot,delete e.systemSnapshotUpdatedAt;for(let d of["anchor-google-sync-key","anchor-google-client-secret","home-base-google-sync-key","home-base-google-client-secret"])this.app.secretStorage.getSecret(d)&&this.app.secretStorage.setSecret(d,"");if(this.settings=Object.assign({},ye,e,{calendarSources:a}),!a.some(d=>d.id===this.settings.defaultCalendarId&&d.writable)){let d=a.find(h=>h.writable);this.settings.defaultCalendarId=(i=d==null?void 0:d.id)!=null?i:"",this.settings.calendarUrl=(o=d==null?void 0:d.href)!=null?o:"",this.settings.calendarName=(c=d==null?void 0:d.displayName)!=null?c:""}n&&await this.saveSettings()}async openDashboard(){let e=this.app.workspace.getLeavesOfType(L)[0];if(e){this.app.workspace.revealLeaf(e);return}let t=this.app.workspace.getLeaf("tab");await t.setViewState({type:L,active:!0}),this.app.workspace.revealLeaf(t)}async openCalendar(){let e=this.app.workspace.getLeavesOfType(V)[0];if(e){this.app.workspace.revealLeaf(e);return}let t=this.app.workspace.getLeaf("tab");await t.setViewState({type:V,active:!0}),this.app.workspace.revealLeaf(t)}async refreshDashboard(e=!0){let t=this.app.workspace.getLeavesOfType(L);for(let n of t){let r=n.view;r instanceof H&&r.render(e)}let a=this.app.workspace.getLeavesOfType(V);for(let n of a){let r=n.view;r instanceof j&&r.refresh(e)}}getCachedCalendarEvents(e,t){var n;let a=this.calendarCacheKey(e,t);return(n=this.calendarCaches.get(a))==null?void 0:n.state}isCalendarCacheFresh(e,t){let a=this.calendarCacheKey(e,t),n=this.calendarCaches.get(a);return!!(n&&Date.now()-n.updatedAt<6e4)}invalidateCalendarCache(){this.calendarCaches.clear();for(let[e,t]of this.calendarRequestVersions)this.calendarRequestVersions.set(e,t+1);this.calendarRequests.clear()}refreshCalendarEvents(e,t,a=!1){var h,p;let n=this.calendarCacheKey(e,t),r=(h=this.calendarCaches.get(n))==null?void 0:h.state;if(!a&&r&&this.isCalendarCacheFresh(e,t))return Promise.resolve(r);let i=this.calendarRequests.get(n);if(!a&&i)return i;let o=r,c=((p=this.calendarRequestVersions.get(n))!=null?p:0)+1;this.calendarRequestVersions.set(n,c);let d=this.fetchCalendarEvents(e,t).then(g=>{var m,v,y;if(c!==this.calendarRequestVersions.get(n))return(y=(v=this.calendarRequests.get(n))!=null?v:(m=this.calendarCaches.get(n))==null?void 0:m.state)!=null?y:g;let f=g.status==="error"&&(o!=null&&o.events.length)?{...o,error:"",errors:g.errors.length?g.errors:[g.error],status:"error"}:g;return this.calendarCaches.set(n,{state:f,updatedAt:Date.now()}),f}).finally(()=>{this.calendarRequests.get(n)===d&&this.calendarRequests.delete(n)});return this.calendarRequests.set(n,d),d}async setCalendarEnabled(e,t){let a=this.settings.calendarSources.find(n=>n.id===e);a&&(a.enabled=t,this.invalidateCalendarCache(),await this.saveSettings(),await this.refreshDashboard(!0))}calendarCacheKey(e,t){let a=this.settings.calendarSources.map(n=>`${n.id}:${n.enabled}`).sort().join("|");return[e.toISOString(),t.toISOString(),this.settings.calendarEnabled,this.settings.calendarServerUrl,this.settings.calendarUsername,a].join("::")}async fetchCalendarEvents(e,t){if(!this.hasCalendarConfig())return{events:[],error:"",errors:[],setupRequired:!0,sourceCount:0,status:"ready"};try{let a=(await this.getCalendars()).filter(o=>o.enabled);if(!a.length)return{events:[],error:"No calendars are enabled.",errors:[],setupRequired:!1,sourceCount:0,status:"error"};let n=await Promise.all(a.map(async o=>{try{let c=`<?xml version="1.0" encoding="utf-8" ?>
<c:calendar-query xmlns:d="${q}" xmlns:c="${z}">
  <d:prop>
    <d:getetag />
    <c:calendar-data />
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${O(e)}" end="${O(t)}" />
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`,d=await this.caldavRequest(o.href,"REPORT",c,{Depth:"1"}),h=U(d.text);return{events:Ve(b(h,"response").map(g=>{let f=I(o.href,P(g,"href")),m=P(g,"getetag"),v=P(g,"calendar-data");return v?ke(v,f,m,o):null}).filter(g=>!!g),e,t).filter(g=>g.end>=e&&g.start<t),error:""}}catch(c){return{events:[],error:`${o.displayName}: ${this.readableCalendarError(c)}`}}})),r=n.map(o=>o.error).filter(Boolean),i=n.flatMap(o=>o.events).filter((o,c,d)=>d.findIndex(h=>{var p,g,f,m;return h.calendarId===o.calendarId&&h.uid===o.uid&&((g=(p=h.occurrenceStart)==null?void 0:p.getTime())!=null?g:h.start.getTime())===((m=(f=o.occurrenceStart)==null?void 0:f.getTime())!=null?m:o.start.getTime())})===c).sort((o,c)=>Number(c.allDay)-Number(o.allDay)||o.start.getTime()-c.start.getTime()||o.title.localeCompare(c.title));return{events:i,error:i.length||!r.length?"":r[0],errors:r,setupRequired:!1,sourceCount:a.length,status:r.length?"error":"ready"}}catch(a){let n=this.readableCalendarError(a);return{events:[],error:n,errors:[n],setupRequired:!1,sourceCount:0,status:"error"}}}async saveCalendarEvent(e){let t=await this.getWritableCalendar(e.calendarId);if(!t){new u.Notice("Set up a default CalDAV calendar first.");return}let a=e.uid||crypto.randomUUID(),n=e.href||I(t.href,xe(a)),r=e.rawIcs?Ce(e.rawIcs,e,a):he(e,a),i={"Content-Type":"text/calendar; charset=utf-8"};e.etag?i["If-Match"]=e.etag:i["If-None-Match"]="*";try{await this.caldavRequest(n,"PUT",r,i),this.invalidateCalendarCache(),new u.Notice("Calendar event saved.")}catch(o){throw new u.Notice(this.readableCalendarError(o)),o}}async saveCalendarOccurrence(e,t){await this.excludeCalendarOccurrence(e),await this.saveCalendarEvent({...t,uid:void 0,href:void 0,etag:void 0,rawIcs:void 0,repeat:"none",repeatUntil:""})}async deleteCalendarEvent(e,t=!1){try{if(t&&e.repeat!=="none"){await this.excludeCalendarOccurrence(e),new u.Notice("Calendar occurrence deleted.");return}await this.caldavRequest(e.href,"DELETE","",e.etag?{"If-Match":e.etag}:{}),this.invalidateCalendarCache(),new u.Notice("Calendar event deleted.")}catch(a){throw new u.Notice(this.readableCalendarError(a)),a}}async excludeCalendarOccurrence(e){let t=Le(e.rawIcs,e);await this.caldavRequest(e.href,"PUT",t,{"Content-Type":"text/calendar; charset=utf-8",...e.etag?{"If-Match":e.etag}:{}})}async testCalendarConnection(){if(!this.hasCalendarCredentials())throw new Error("Fill in the CalDAV server URL, Apple ID email, and app-specific password first.");let e=await this.getCalendars(!0,!0);if(!e.length)throw new Error("No event calendar was found for this CalDAV account.");return e}hasCalendarCredentials(){return!!(this.settings.calendarServerUrl.trim()&&this.settings.calendarUsername.trim()&&this.settings.calendarPassword.trim())}hasCalendarConfig(){return!!(this.settings.calendarEnabled&&this.hasCalendarCredentials())}async getCalendars(e=!1,t=!1){var i,o,c,d;if(!this.hasCalendarCredentials())return[];if(!t&&!this.hasCalendarConfig())return[];if(this.settings.calendarSources.length&&!e)return this.settings.calendarSources;let a=new Map(this.settings.calendarSources.map(h=>[h.id,h])),n=(await this.discoverCalendars()).map(h=>{var p,g;return{...h,enabled:(g=(p=a.get(h.id))==null?void 0:p.enabled)!=null?g:!0}}),r=(i=n.find(h=>h.id===this.settings.defaultCalendarId&&h.writable))!=null?i:n.find(h=>h.writable);return this.settings.calendarSources=n,this.settings.defaultCalendarId=(o=r==null?void 0:r.id)!=null?o:"",this.settings.calendarUrl=(c=r==null?void 0:r.href)!=null?c:"",this.settings.calendarName=(d=r==null?void 0:r.displayName)!=null?d:"",await this.saveSettings(),n}async getWritableCalendar(e){var a,n;let t=await this.getCalendars();return(n=(a=t.find(r=>r.writable&&r.id===(e||this.settings.defaultCalendarId)))!=null?a:t.find(r=>r.writable))!=null?n:null}async discoverCalendars(){let e=se(this.settings.calendarServerUrl),t=await this.caldavRequest(e,"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${q}">
  <d:prop>
    <d:current-user-principal />
  </d:prop>
</d:propfind>`,{Depth:"0"}),a=U(t.text),n=re(a,"current-user-principal");if(!n)throw new Error("CalDAV server did not return a principal URL.");let r=await this.caldavRequest(I(e,n),"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${q}" xmlns:c="${z}" xmlns:a="http://apple.com/ns/ical/">
  <d:prop>
    <c:calendar-home-set />
  </d:prop>
</d:propfind>`,{Depth:"0"}),i=U(r.text),o=re(i,"calendar-home-set");if(!o)throw new Error("CalDAV server did not return a calendar home.");let c=I(e,o),d=await this.caldavRequest(c,"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${q}" xmlns:c="${z}" xmlns:a="http://apple.com/ns/ical/">
  <d:prop>
    <d:displayname />
    <d:resourcetype />
    <d:current-user-privilege-set />
    <c:supported-calendar-component-set />
    <a:calendar-color />
  </d:prop>
</d:propfind>`,{Depth:"1"}),h=U(d.text);return b(h,"response").map(p=>{let g=P(p,"href"),f=b(p,"resourcetype")[0],m=!!(f&&b(f,"calendar").length),v=b(p,"comp").map(E=>{var k;return((k=E.getAttribute("name"))!=null?k:"").toUpperCase()}),y=!v.length||v.includes("VEVENT"),x=b(p,"current-user-privilege-set")[0],C=x?b(x,"privilege").flatMap(E=>Array.from(E.children).map(k=>k.localName)):[],F=!C.length||C.some(E=>["write","write-content","bind","unbind"].includes(E));if(!g||!m||!y)return null;let $=I(c,g);return{id:`icloud:${$}`,href:$,displayName:P(p,"displayname")||"Calendar",accountName:this.settings.calendarUsername,provider:"icloud",color:P(p,"calendar-color").slice(0,7)||"#8b5cf6",writable:F,enabled:!0}}).filter(p=>p!==null)}async caldavRequest(e,t,a="",n={}){let r=await(0,u.requestUrl)({url:e,method:t,body:a,throw:!1,headers:{Authorization:`Basic ${btoa(`${this.settings.calendarUsername}:${this.settings.calendarPassword}`)}`,"Content-Type":"application/xml; charset=utf-8",...n}});if(r.status>=400)throw r.status===401||r.status===403?new Error("Calendar authentication failed. Check your Apple ID and app-specific password."):r.status===405?new Error("This calendar does not allow that sync action. Choose a normal writable iCloud calendar."):r.status===409||r.status===412?new Error("This event changed remotely. Refresh Anchor and try again."):r.status===400?new Error("iCloud rejected the CalDAV request as malformed. Check the server URL and try again."):new Error(`CalDAV request failed with status ${r.status}.`);return r}readableCalendarError(e){return e instanceof Error?e.message:"Calendar sync failed."}async ensureDefaultFiles(){await this.ensureFile(this.settings.todoInboxPath,ie),await this.ensureFile(this.settings.workoutPlanPath,Z),await this.ensureFile(this.settings.workoutLogPath,oe)}async ensureFile(e,t){let a=(0,u.normalizePath)(e),n=this.app.vault.getAbstractFileByPath(a);if(n instanceof u.TFile)return;if(n)throw new Error(`Expected a file path but found a folder: ${a}`);let r=a.split("/").slice(0,-1).join("/");r&&await this.ensureFolder(r),await this.app.vault.create(a,t)}async ensureFolder(e){let t=(0,u.normalizePath)(e).split("/"),a="";for(let n of t){a=a?`${a}/${n}`:n;let r=this.app.vault.getAbstractFileByPath(a);if(r instanceof u.TFile)throw new Error(`Expected a folder path but found a file: ${a}`);r||await this.app.vault.createFolder(a)}}injectStyles(){var e;(e=this.styleEl)==null||e.remove(),this.styleEl=document.createElement("style"),this.styleEl.id="anchor-runtime-styles",this.styleEl.textContent=Ne+Re,document.head.appendChild(this.styleEl)}},H=class extends u.ItemView{constructor(e,t){super(e);this.renderGeneration=0;this.plugin=t}getViewType(){return L}getDisplayText(){return"Anchor"}getIcon(){return"anchor"}async onOpen(){this.render()}async onClose(){this.renderGeneration+=1,this.calendarHost=void 0}render(e=!1){let t=++this.renderGeneration,a=this.containerEl.children[1];a.empty(),a.addClass("anchor-view"),this.renderHeader(a);let n=a.createDiv({cls:"anchor-grid"}),r=n.createDiv({cls:"anchor-column anchor-left"}),i=n.createDiv({cls:"anchor-column anchor-right"});this.calendarHost=r.createDiv();let o=r.createDiv(),c=i.createDiv();this.renderLoadingPanel(o,"Fit","Workout","Loading workout..."),this.renderLoadingPanel(c,"Task","Todo Manager","Loading todos..."),this.refreshCalendar(e),this.loadTodos().then(d=>{t!==this.renderGeneration||!c.isConnected||(c.empty(),this.renderTodos(c,d))}).catch(d=>{t!==this.renderGeneration||!c.isConnected||this.renderPanelError(c,"Task","Todo Manager","Todos could not load",d)}),Promise.all([this.loadWorkoutPlan(),this.loadWorkoutLog()]).then(([d,h])=>{t!==this.renderGeneration||!o.isConnected||(o.empty(),this.renderWorkout(o,d,this.getWorkoutState(d,h)))}).catch(d=>{t!==this.renderGeneration||!o.isConnected||this.renderPanelError(o,"Fit","Workout","Workout could not load",d)})}async refreshCalendar(e){let t=this.renderGeneration,a=this.calendarHost;if(!a)return;let n=this.startOfDay(new Date),r=this.addDays(n,8),i=this.plugin.getCachedCalendarEvents(n,r),o=i?e||!this.plugin.isCalendarCacheFresh(n,r)?"refreshing":i.status:"loading";a.empty(),this.renderCalendar(a,i?{...i,status:o}:{events:[],error:"",errors:[],setupRequired:!1,sourceCount:0,status:o});try{let c=await this.plugin.refreshCalendarEvents(n,r,e);if(t!==this.renderGeneration||!a.isConnected)return;a.empty(),this.renderCalendar(a,c)}catch(c){if(t!==this.renderGeneration||!a.isConnected)return;let d=c instanceof Error?c.message:"Calendar could not sync.";a.empty(),this.renderCalendar(a,i?{...i,error:"",errors:[d],status:"error"}:{events:[],error:d,errors:[d],setupRequired:!1,sourceCount:0,status:"error"})}}renderLoadingPanel(e,t,a,n){let r=e.createDiv({cls:"anchor-panel"}),i=r.createDiv({cls:"anchor-panel-title"});i.createEl("span",{cls:"anchor-icon",text:t}),i.createEl("h2",{text:a}),r.createEl("p",{cls:"anchor-muted anchor-italic",text:n})}renderPanelError(e,t,a,n,r){e.empty();let i=e.createDiv({cls:"anchor-panel"}),o=i.createDiv({cls:"anchor-panel-title"});o.createEl("span",{cls:"anchor-icon",text:t}),o.createEl("h2",{text:a});let c=i.createDiv({cls:"anchor-calendar-error"});c.createEl("strong",{text:n}),c.createEl("p",{text:r instanceof Error?r.message:"Try refreshing Anchor."})}renderHeader(e){let t=e.createDiv({cls:"anchor-header"}),a=new Date,n=t.createDiv();n.createEl("h1",{text:"Anchor"}),n.createDiv({cls:"anchor-date",text:a.toLocaleDateString(void 0,{weekday:"long",year:"numeric",month:"long",day:"numeric"})}),n.createDiv({cls:"anchor-greeting",text:this.getGreeting()});let r=t.createEl("button",{cls:"anchor-icon-button",attr:{"aria-label":"Refresh"}});r.setText("Refresh"),r.onClickEvent(()=>this.render(!0))}renderCalendar(e,t){let a=e.createDiv({cls:"anchor-panel anchor-calendar-panel"}),n=a.createDiv({cls:"anchor-panel-title"});n.createEl("span",{cls:"anchor-icon",text:"Cal"}),n.createEl("h2",{text:"Calendar"}),t.sourceCount&&n.createEl("span",{cls:"anchor-pill",text:`${t.sourceCount} calendar${t.sourceCount===1?"":"s"}`}),(t.status==="loading"||t.status==="refreshing")&&n.createEl("span",{cls:"anchor-pill",text:t.status==="loading"?"Loading":"Refreshing"});let r=a.createDiv({cls:"anchor-calendar-controls"}),i=r.createEl("button",{cls:"mod-cta anchor-primary-button",text:"+ Event"});i.disabled=t.status==="loading"||t.setupRequired||!!t.error,i.onClickEvent(()=>{new R(this.app,this.plugin,void 0,()=>this.render(!0)).open()});let o=r.createEl("button",{cls:"anchor-secondary-button",text:"Refresh"});if(o.disabled=t.status==="loading"||t.status==="refreshing",o.onClickEvent(()=>void this.refreshCalendar(!0)),r.createEl("button",{cls:"anchor-secondary-button",text:"Open Calendar"}).onClickEvent(()=>void this.plugin.openCalendar()),t.status==="loading"){a.createEl("p",{cls:"anchor-muted anchor-italic",text:"Loading iCloud calendars..."});return}if(t.setupRequired){let m=a.createDiv({cls:"anchor-schedule-empty"});m.createDiv({cls:"anchor-calendar-mark",text:"Cal"});let v=m.createDiv();v.createEl("strong",{text:"Connect a calendar"}),v.createEl("p",{text:"Enable Calendar in Anchor settings, then connect iCloud/CalDAV."});return}if(t.error&&!t.events.length){let m=a.createDiv({cls:"anchor-calendar-error"});m.createEl("strong",{text:"Calendar could not sync"}),m.createEl("p",{text:t.error});return}if(t.errors.length){let m=a.createDiv({cls:"anchor-calendar-error"});m.createEl("strong",{text:"Some calendars could not sync"}),m.createEl("p",{text:t.errors.join(" \xB7 ")})}let d=this.startOfDay(new Date),h=this.addDays(d,1),p=this.addDays(d,7),g=t.events.filter(m=>this.eventOccursOn(m,d)),f=t.events.filter(m=>{let v=this.startOfDay(m.start);return v>=h&&v<=p});this.renderCalendarGroup(a,"Today",g,"No events today"),this.renderCalendarGroup(a,"Next 7 Days",f,"No upcoming events")}renderCalendarGroup(e,t,a,n){let r=e.createDiv({cls:"anchor-calendar-group"});if(r.createEl("h3",{text:t}),!a.length){r.createEl("p",{cls:"anchor-muted anchor-italic",text:n});return}for(let i of a)this.renderCalendarEvent(r,i)}renderCalendarEvent(e,t){let a=e.createDiv({cls:"anchor-calendar-event"}),n=a.createDiv({cls:"anchor-calendar-time",text:this.formatCalendarEventTime(t)});t.allDay&&n.addClass("is-all-day");let r=a.createDiv({cls:"anchor-calendar-body"}),i=r.createDiv({cls:"anchor-calendar-title"}),o=i.createSpan({cls:"anchor-calendar-source-dot"});o.style.backgroundColor=t.color,i.createSpan({text:t.title||"Untitled event"});let c=r.createDiv({cls:"anchor-calendar-meta"});if(c.createEl("span",{text:t.calendarName}),this.eventOccursOn(t,this.startOfDay(new Date))||c.createEl("span",{text:this.formatCalendarDate(t.start)}),t.location&&c.createEl("span",{text:t.location}),t.repeat!=="none"&&c.createEl("span",{text:this.formatRepeatLabel(t.repeat)}),!t.writable)return;let d=a.createDiv({cls:"anchor-actions"});d.createEl("button",{cls:"anchor-ghost-button",text:"Edit"}).onClickEvent(()=>new R(this.app,this.plugin,t,()=>this.render(!0)).open()),d.createEl("button",{cls:"anchor-ghost-button",text:"Delete"}).onClickEvent(async()=>{if(!confirm(`Delete "${t.title||"Untitled event"}"?`))return;let f=t.repeat!=="none"&&confirm("Delete only this event? Press Cancel to delete the whole repeating series.");await this.plugin.deleteCalendarEvent(t,f),this.render(!0)})}renderTodos(e,t){let a=e.createDiv({cls:"anchor-panel anchor-todo-panel"}),n=a.createDiv({cls:"anchor-panel-title anchor-todo-title"});n.createEl("span",{cls:"anchor-icon",text:"Task"}),n.createEl("h2",{text:"Todo Manager"}),a.createDiv({cls:"anchor-todo-controls"}).createEl("button",{cls:"mod-cta anchor-primary-button",text:"+ New Todo"}).onClickEvent(()=>{new B(this.app,this.plugin,void 0,()=>void this.render()).open()});let o=this.groupTodos(t);for(let c of["Overdue","Today","Tomorrow","Next 7 Days","No Due Date","Later"]){let d=o[c];if(!d.length&&c==="Later")continue;let h=a.createDiv({cls:"anchor-todo-group"});if(h.createEl("h3",{text:c}),!d.length){h.createEl("p",{cls:"anchor-muted anchor-italic",text:c==="Tomorrow"?"No todos due tomorrow":`No todos in ${c.toLowerCase()}`});continue}for(let p of d)this.renderTodoItem(h,p)}}renderTodoItem(e,t){let a=e.createDiv({cls:`anchor-todo-item ${t.completed?"is-complete":""}`}),n=a.createEl("input",{cls:"anchor-checkbox"});n.type="checkbox",n.checked=t.completed,n.onClickEvent(async()=>{await this.setTodoCompletion(t,n.checked),await this.render()});let r=a.createDiv({cls:"anchor-todo-body"});r.createDiv({cls:"anchor-todo-name",text:t.title});let i=r.createDiv({cls:"anchor-todo-meta"});i.createEl("span",{cls:"anchor-due",text:t.due?this.formatDue(t.due):"No due date"}),t.priority&&i.createEl("span",{cls:`anchor-priority is-${t.priority}`,text:this.capitalize(t.priority)});for(let h of t.tags)i.createEl("span",{cls:"anchor-tag",text:h});let o=a.createDiv({cls:"anchor-actions"});o.createEl("button",{cls:"anchor-ghost-button",text:"Edit"}).onClickEvent(()=>new B(this.app,this.plugin,t,()=>void this.render()).open()),o.createEl("button",{cls:"anchor-ghost-button",text:"Delete"}).onClickEvent(async()=>{await this.deleteTodo(t),await this.render()})}renderWorkout(e,t,a){var g;let n=e.createDiv({cls:"anchor-panel"}),r=n.createDiv({cls:"anchor-panel-title"});if(r.createEl("span",{cls:"anchor-icon",text:"Fit"}),r.createEl("h2",{text:"Workout"}),a.unresolved){let f=n.createDiv({cls:"anchor-unresolved"});f.createDiv({text:`Yesterday's workout was not resolved: ${a.unresolved.workout}`});let m=f.createDiv({cls:"anchor-unresolved-actions"});m.createEl("button",{text:"Mark Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(a.unresolved.date,a.unresolved.workout,"done"),await this.render()}),m.createEl("button",{text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(a.unresolved.date,a.unresolved.workout,"skipped"),await this.render()}),m.createEl("button",{text:"Keep Pending"}).onClickEvent(async()=>{new u.Notice("Kept as pending.")})}n.createEl("h3",{text:"Today's Workout"}),n.createEl("div",{cls:"anchor-workout-name",text:a.todayWorkout});let i=(g=t.types[a.todayWorkout])!=null?g:[];if(i.length){let f=n.createEl("ul",{cls:"anchor-exercises"});for(let m of i)f.createEl("li",{text:m})}else n.createEl("p",{cls:"anchor-muted",text:"No exercises configured for this workout."});n.createEl("button",{cls:"anchor-wide-button",text:"Edit Routine"}).onClickEvent(()=>{new Q(this.app,this.plugin,t,()=>void this.render()).open()});let c=n.createDiv({cls:"anchor-workout-actions"});c.createEl("button",{cls:"mod-cta anchor-primary-button",text:"Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),a.todayWorkout,"done"),await this.render()}),c.createEl("button",{cls:"anchor-secondary-button",text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),a.todayWorkout,"skipped"),await this.render()});let p=n.createDiv({cls:"anchor-sequence"});p.createEl("h3",{text:"Routine Sequence"}),p.createDiv({text:t.sequence.length?t.sequence.join(" > "):"No sequence configured"})}async loadTodos(){let e=this.plugin.settings.todoScanFolders.split(",").map(n=>(0,u.normalizePath)(n.trim())).filter(Boolean),t=this.app.vault.getMarkdownFiles().filter(n=>e.length?e.some(r=>n.path===r||n.path.startsWith(`${r}/`)):!0),a=[];for(let n of t)(await this.app.vault.cachedRead(n)).split(`
`).forEach((o,c)=>{let d=this.parseTodoLine(o,n,c);d&&a.push(d)});return a.sort((n,r)=>this.compareTodos(n,r))}parseTodoLine(e,t,a){var h,p,g,f;let n=e.match(/^\s*[-*]\s+\[( |x|X)]\s+(.+)$/);if(!n)return null;let r=n[1].toLowerCase()==="x",i=n[2].trim(),o=i.match(/\sdue::\s*(\d{4}-\d{2}-\d{2})/),c=i.match(/\spriority::\s*(high|medium|low)/i),d=(h=i.match(/#[\w/-]+/g))!=null?h:[];return i=i.replace(/\sdue::\s*\d{4}-\d{2}-\d{2}/,"").replace(/\spriority::\s*(high|medium|low)/i,"").replace(/#[\w/-]+/g,"").trim(),{id:`${t.path}:${a}`,title:i,due:(p=o==null?void 0:o[1])!=null?p:"",priority:(f=(g=c==null?void 0:c[1])==null?void 0:g.toLowerCase())!=null?f:"",tags:d,completed:r,file:t,line:a,raw:e}}groupTodos(e){let t={Overdue:[],Today:[],Tomorrow:[],"Next 7 Days":[],"No Due Date":[],Later:[]},a=this.startOfDay(new Date),n=this.addDays(a,1),r=this.addDays(a,7);for(let i of e.filter(o=>!o.completed)){if(!i.due){t["No Due Date"].push(i);continue}let o=this.parseDate(i.due);o<a?t.Overdue.push(i):o.getTime()===a.getTime()?t.Today.push(i):o.getTime()===n.getTime()?t.Tomorrow.push(i):o<=r?t["Next 7 Days"].push(i):t.Later.push(i)}return t}async loadWorkoutPlan(){await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,Z);let e=this.app.vault.getAbstractFileByPath((0,u.normalizePath)(this.plugin.settings.workoutPlanPath));if(!(e instanceof u.TFile))return{types:{},sequence:[]};let a=(await this.app.vault.cachedRead(e)).split(`
`),n={},r=[],i="",o="";for(let c of a){let d=c.trim();if(/^#\s+Workout Types/i.test(d)){i="types",o="";continue}if(/^#\s+Sequence/i.test(d)){i="sequence",o="";continue}if(i==="types"&&d.startsWith("## ")){o=d.replace(/^##\s+/,"").trim(),n[o]=[];continue}if(i==="types"&&o){let h=d.replace(/^[-*]\s+/,"").trim();h&&n[o].push(h)}i==="sequence"&&/^[-*]\s+/.test(d)&&r.push(d.replace(/^[-*]\s+/,"").trim())}return{types:n,sequence:r}}async loadWorkoutLog(){await this.plugin.ensureFile(this.plugin.settings.workoutLogPath,oe);let e=this.app.vault.getAbstractFileByPath((0,u.normalizePath)(this.plugin.settings.workoutLogPath));return e instanceof u.TFile?(await this.app.vault.cachedRead(e)).split(`
`).map(a=>{var o,c,d,h;let n=(o=a.match(/date::\s*(\d{4}-\d{2}-\d{2})/))==null?void 0:o[1],r=(d=(c=a.match(/workout::\s*([^]+?)\s+status::/))==null?void 0:c[1])==null?void 0:d.trim(),i=(h=a.match(/status::\s*(done|skipped|pending)/))==null?void 0:h[1];return!n||!r||!i?null:{date:n,workout:r,status:i}}).filter(a=>!!a):[]}getWorkoutState(e,t){let a=e.sequence.length?e.sequence:Object.keys(e.types),n=t.filter(d=>d.status==="done").length,r=a.length?a[n%a.length]:"No workout configured",i=this.dateKey(this.addDays(new Date,-1)),c=t.filter(d=>d.date===i).length?null:{date:i,workout:r};return{todayWorkout:r,unresolved:c}}async appendWorkoutLog(e,t,a){let n=this.app.vault.getAbstractFileByPath((0,u.normalizePath)(this.plugin.settings.workoutLogPath));if(!(n instanceof u.TFile))return;let r=await this.app.vault.cachedRead(n),i=`- date:: ${e} workout:: ${t} status:: ${a}`;await this.app.vault.modify(n,`${r.trimEnd()}
${i}
`),new u.Notice(`Workout marked ${a}.`)}async setTodoCompletion(e,t){let n=(await this.app.vault.cachedRead(e.file)).split(`
`);n[e.line]=e.raw.replace(/\[( |x|X)]/,t?"[x]":"[ ]"),await this.app.vault.modify(e.file,n.join(`
`))}async deleteTodo(e){if(!confirm(`Delete "${e.title}"?`))return;let n=(await this.app.vault.cachedRead(e.file)).split(`
`);n.splice(e.line,1),await this.app.vault.modify(e.file,n.join(`
`))}compareTodos(e,t){let a=e.due||"9999-12-31",n=t.due||"9999-12-31";if(a!==n)return a.localeCompare(n);let r={high:0,medium:1,low:2,"":3};return r[e.priority]-r[t.priority]}formatDue(e){let t=this.todayKey();return e===t?"Today":e===this.dateKey(this.addDays(new Date,1))?"Tomorrow":new Date(`${e}T00:00:00`).toLocaleDateString(void 0,{month:"short",day:"numeric"})}eventOccursOn(e,t){let a=this.startOfDay(e.start),n=this.startOfDay(e.allDay?this.addDays(e.end,-1):e.end);return a<=t&&n>=t}formatCalendarEventTime(e){if(e.allDay)return"All day";let t=e.start.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),a=e.end.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"});return`${t} - ${a}`}formatCalendarDate(e){return e.toLocaleDateString(void 0,{weekday:"short",month:"short",day:"numeric"})}formatRepeatLabel(e){return{none:"",daily:"Repeats daily",weekdays:"Repeats weekdays",weekly:"Repeats weekly",monthly:"Repeats monthly",yearly:"Repeats yearly"}[e]}getGreeting(){let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"}parseDate(e){return new Date(`${e}T00:00:00`)}startOfDay(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}addDays(e,t){let a=new Date(e);return a.setDate(a.getDate()+t),this.startOfDay(a)}todayKey(){return this.dateKey(new Date)}dateKey(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}capitalize(e){return e.charAt(0).toUpperCase()+e.slice(1)}},j=class extends u.ItemView{constructor(e,t){super(e);this.mode="month";this.selectedDate=this.startOfDay(new Date);this.renderGeneration=0;this.plugin=t}getViewType(){return V}getDisplayText(){return"Anchor Calendar"}getIcon(){return"calendar-days"}async onOpen(){await this.refresh(!1)}async onClose(){this.renderGeneration+=1}async refresh(e=!1){let t=++this.renderGeneration,{start:a,end:n}=this.visibleRange(),r=this.plugin.getCachedCalendarEvents(a,n),i=r?e||!this.plugin.isCalendarCacheFresh(a,n)?"refreshing":r.status:"loading";this.render(r?{...r,status:i}:{events:[],error:"",errors:[],setupRequired:!1,sourceCount:0,status:i});try{let o=await this.plugin.refreshCalendarEvents(a,n,e);if(t!==this.renderGeneration)return;this.render(o)}catch(o){if(t!==this.renderGeneration)return;let c=o instanceof Error?o.message:"Calendar could not sync.";this.render(r?{...r,error:"",errors:[c],status:"error"}:{events:[],error:c,errors:[c],setupRequired:!1,sourceCount:0,status:"error"})}}render(e){let t=this.containerEl.children[1];t.empty(),t.addClass("anchor-calendar-view"),this.renderHeader(t,e);let a=t.createDiv({cls:"anchor-calendar-layout"});this.renderSidebar(a);let n=a.createDiv({cls:"anchor-calendar-main"});if(e.setupRequired){let r=n.createDiv({cls:"anchor-calendar-empty"});r.createEl("h2",{text:"Connect a calendar"}),r.createEl("p",{text:"Enable Calendar in Anchor settings, then connect iCloud/CalDAV."});return}if(e.error&&!e.events.length){let r=n.createDiv({cls:"anchor-calendar-error"});r.createEl("strong",{text:"Calendar could not sync"}),r.createEl("p",{text:e.error});return}if(e.errors.length){let r=n.createDiv({cls:"anchor-calendar-error"});r.createEl("strong",{text:"Some calendars could not sync"}),r.createEl("p",{text:e.errors.join(" \xB7 ")})}e.status==="loading"&&!e.events.length&&n.createDiv({cls:"anchor-calendar-loading",text:"Loading iCloud calendars\u2026"}),this.mode==="month"?this.renderMonth(n,e.events):this.renderTimeView(n,e.events)}renderHeader(e,t){let a=e.createDiv({cls:"anchor-calendar-header"}),n=a.createDiv({cls:"anchor-calendar-heading"});n.createEl("h1",{text:this.rangeTitle()});let r=n.createDiv({cls:"anchor-calendar-heading-meta"});r.createSpan({text:"Anchor Calendar"}),t.sourceCount&&r.createSpan({text:`${t.sourceCount} visible`}),(t.status==="loading"||t.status==="refreshing")&&r.createSpan({cls:"anchor-pill",text:t.status==="loading"?"Loading":"Refreshing"});let i=a.createDiv({cls:"anchor-calendar-header-controls"}),o=i.createDiv({cls:"anchor-calendar-navigation"});this.iconButton(o,"chevron-left","Previous period",()=>this.navigate(-1)),o.createEl("button",{cls:"anchor-secondary-button",text:"Today"}).onClickEvent(()=>{this.selectedDate=this.startOfDay(new Date),this.refresh(!1)}),this.iconButton(o,"chevron-right","Next period",()=>this.navigate(1));let d=i.createDiv({cls:"anchor-calendar-mode-switch",attr:{role:"group","aria-label":"Calendar view"}});for(let f of["month","week","day"])d.createEl("button",{text:f.charAt(0).toUpperCase()+f.slice(1),cls:f===this.mode?"is-selected":"",attr:{"aria-pressed":f===this.mode?"true":"false"}}).onClickEvent(()=>{this.mode!==f&&(this.mode=f,this.refresh(!1))});let h=i.createDiv({cls:"anchor-calendar-header-actions"}),p=h.createEl("button",{cls:"anchor-secondary-button",text:"Refresh"});p.disabled=t.status==="loading"||t.status==="refreshing",p.onClickEvent(()=>void this.refresh(!0));let g=h.createEl("button",{cls:"mod-cta anchor-primary-button",text:"+ Event"});g.disabled=!this.plugin.settings.calendarSources.some(f=>f.writable),g.onClickEvent(()=>this.openNewEvent(this.defaultNewEventDate(),!1))}renderSidebar(e){let t=e.createEl("details",{cls:"anchor-calendar-sidebar"});t.open=!0,t.createEl("summary",{text:"Calendars"});let a=t.createDiv({cls:"anchor-calendar-sidebar-content"}),n=this.plugin.settings.calendarSources;if(n.length){let r=a.createDiv({cls:"anchor-calendar-provider"}),i=r.createDiv({cls:"anchor-calendar-provider-title"}),o=i.createSpan();(0,u.setIcon)(o,"cloud"),i.createEl("h2",{text:"iCloud"});for(let c of n){let d=r.createEl("label",{cls:"anchor-calendar-source"}),h=d.createEl("input",{attr:{type:"checkbox","aria-label":`Show ${c.displayName} from iCloud`}});h.checked=c.enabled;let p=d.createSpan({cls:"anchor-calendar-source-dot"});p.style.backgroundColor=c.color;let g=d.createSpan({cls:"anchor-calendar-source-copy"});g.createSpan({cls:"anchor-calendar-source-name",text:c.displayName}),g.createSpan({cls:"anchor-calendar-source-account",text:`${c.accountName||"iCloud"} \xB7 ${c.writable?"Writable":"Read only"}`}),h.addEventListener("change",()=>void this.plugin.setCalendarEnabled(c.id,h.checked))}}this.plugin.settings.calendarSources.length||a.createEl("p",{cls:"anchor-muted",text:"No calendars discovered yet."})}renderMonth(e,t){let a=e.createDiv({cls:"anchor-month-calendar"}),n=a.createDiv({cls:"anchor-month-weekdays"});for(let c of["Sun","Mon","Tue","Wed","Thu","Fri","Sat"])n.createDiv({text:c});let r=a.createDiv({cls:"anchor-month-grid",attr:{role:"grid","aria-label":this.rangeTitle()}}),{start:i,end:o}=this.visibleRange();for(let c=new Date(i);c<o;c=this.addDays(c,1)){let d=new Date(c),h=d.getMonth()===this.selectedDate.getMonth(),p=this.sameDay(d,new Date),g=r.createDiv({cls:`anchor-month-day${h?"":" is-outside"}${p?" is-today":""}`,attr:{role:"gridcell",tabindex:"0","aria-label":d.toLocaleDateString(void 0,{weekday:"long",month:"long",day:"numeric",year:"numeric"})}});g.createEl("button",{cls:"anchor-month-day-number",text:String(d.getDate()),attr:{"aria-label":`Create event on ${this.fullDate(d)}`}}).onClickEvent(()=>this.openNewEvent(this.dateAt(d,9,0),!1)),g.addEventListener("keydown",y=>{y.key!=="Enter"&&y.key!==" "||(y.preventDefault(),this.openNewEvent(this.dateAt(d,9,0),!1))});let m=t.filter(y=>this.eventOccursOn(y,d)).sort((y,x)=>this.compareEvents(y,x)),v=g.createDiv({cls:"anchor-month-events"});for(let y of m.slice(0,3))this.renderMonthEvent(v,y,d);m.length>3&&v.createEl("button",{cls:"anchor-month-more",text:`+${m.length-3} more`,attr:{"aria-label":`Show all events on ${this.fullDate(d)}`}}).onClickEvent(x=>{x.stopPropagation(),this.selectedDate=d,this.mode="day",this.refresh(!1)}),g.addEventListener("click",y=>{(y.target===g||y.target===v)&&this.openNewEvent(this.dateAt(d,9,0),!1)})}}renderMonthEvent(e,t,a){let n=t.allDay||!this.sameDay(t.start,t.end)?"":t.start.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),r=e.createEl("button",{cls:"anchor-month-event",attr:{"aria-label":this.eventAriaLabel(t),title:this.eventAriaLabel(t)}});r.style.setProperty("--anchor-event-color",t.color),r.createSpan({cls:"anchor-month-event-provider",text:"iCloud"}),n&&this.sameDay(t.start,a)&&r.createSpan({cls:"anchor-month-event-time",text:n}),r.createSpan({cls:"anchor-month-event-title",text:t.title||"Untitled event"}),r.onClickEvent(i=>{i.stopPropagation(),this.openEvent(t)})}renderTimeView(e,t){let{start:a,end:n}=this.visibleRange(),r=[];for(let m=new Date(a);m<n;m=this.addDays(m,1))r.push(new Date(m));let i=e.createDiv({cls:`anchor-time-calendar is-${this.mode}`}),o=i.createDiv({cls:"anchor-time-calendar-header"});o.createDiv({cls:"anchor-time-gutter"});let c=o.createDiv({cls:"anchor-time-day-headers"});c.style.setProperty("--anchor-calendar-days",String(r.length));for(let m of r){let v=c.createEl("button",{cls:`anchor-time-day-header${this.sameDay(m,new Date)?" is-today":""}`});v.createSpan({text:m.toLocaleDateString(void 0,{weekday:"short"})}),v.createEl("strong",{text:m.toLocaleDateString(void 0,{month:"short",day:"numeric"})}),v.onClickEvent(()=>{this.selectedDate=m,this.mode="day",this.refresh(!1)})}let d=i.createDiv({cls:"anchor-all-day-row"});d.createDiv({cls:"anchor-time-gutter",text:"all-day"});let h=d.createDiv({cls:"anchor-all-day-columns"});h.style.setProperty("--anchor-calendar-days",String(r.length));for(let m of r){let v=h.createDiv({cls:"anchor-all-day-column"});v.setAttribute("aria-label",`All-day events on ${this.fullDate(m)}`),v.addEventListener("click",x=>{x.target===v&&this.openNewEvent(this.dateAt(m,0,0),!0)});let y=t.filter(x=>this.isAllDayLaneEvent(x)&&this.eventOccursOn(x,m)).sort((x,C)=>this.compareEvents(x,C));for(let x of y)this.renderAllDayEvent(v,x)}let p=i.createDiv({cls:"anchor-calendar-time-scroll"}),g=p.createDiv({cls:"anchor-time-labels"});for(let m=0;m<24;m+=1)g.createDiv({text:new Date(2e3,0,1,m).toLocaleTimeString(void 0,{hour:"numeric"})});let f=p.createDiv({cls:"anchor-time-columns"});f.style.setProperty("--anchor-calendar-days",String(r.length));for(let m of r)this.renderTimeColumn(f,m,t);window.requestAnimationFrame(()=>{let m=this.sameDay(this.selectedDate,new Date)?Math.max(0,new Date().getHours()-2):8;p.scrollTop=m*64})}renderAllDayEvent(e,t){let a=e.createEl("button",{cls:"anchor-all-day-event",attr:{title:this.eventAriaLabel(t),"aria-label":this.eventAriaLabel(t)}});a.style.setProperty("--anchor-event-color",t.color),a.createSpan({cls:"anchor-calendar-provider-tag",text:"iCloud"}),a.createSpan({text:t.title||"Untitled event"}),a.onClickEvent(n=>{n.stopPropagation(),this.openEvent(t)})}renderTimeColumn(e,t,a){let n=e.createDiv({cls:`anchor-time-day-column${this.sameDay(t,new Date)?" is-today":""}`});for(let i=0;i<48;i+=1){let o=Math.floor(i/2),c=i%2?30:0;n.createEl("button",{cls:"anchor-time-slot",attr:{"aria-label":`Create event on ${this.fullDate(t)} at ${this.timeLabel(o,c)}`}}).onClickEvent(()=>this.openNewEvent(this.dateAt(t,o,c),!1))}let r=this.layoutTimedEvents(a.filter(i=>!this.isAllDayLaneEvent(i)&&this.eventOccursOn(i,t)),t);for(let i of r){let o=n.createEl("button",{cls:"anchor-calendar-timed-event",attr:{title:this.eventAriaLabel(i.event),"aria-label":this.eventAriaLabel(i.event)}});o.style.setProperty("--anchor-event-color",i.event.color),o.style.top=`${i.start/1440*100}%`,o.style.height=`${Math.max(2.2,(i.end-i.start)/1440*100)}%`,o.style.left=`calc(${i.column/i.columns*100}% + 3px)`,o.style.width=`calc(${100/i.columns}% - 6px)`,o.createSpan({cls:"anchor-calendar-provider-tag",text:"iCloud"}),o.createEl("strong",{text:i.event.title||"Untitled event"}),o.createSpan({text:this.eventTime(i.event)}),o.onClickEvent(c=>{c.stopPropagation(),this.openEvent(i.event)})}if(this.sameDay(t,new Date)){let i=new Date,o=i.getHours()*60+i.getMinutes(),c=n.createDiv({cls:"anchor-current-time"});c.style.top=`${o/1440*100}%`}}layoutTimedEvents(e,t){let a=this.startOfDay(t).getTime(),n=this.addDays(t,1).getTime(),r=e.map(o=>({event:o,start:Math.max(0,(Math.max(o.start.getTime(),a)-a)/6e4),end:Math.min(1440,(Math.min(o.end.getTime(),n)-a)/6e4)})).sort((o,c)=>o.start-c.start||o.end-c.end),i=[];for(let o=0;o<r.length;){let c=[],d=r[o].end;for(;o<r.length&&(!c.length||r[o].start<d);)c.push(r[o]),d=Math.max(d,r[o].end),o+=1;let h=[],p=[],g=1;for(let f of c){for(let y=h.length-1;y>=0;y-=1)h[y].end<=f.start&&h.splice(y,1);let m=new Set(h.map(y=>y.column)),v=0;for(;m.has(v);)v+=1;h.push({end:f.end,column:v}),p.push({...f,column:v}),g=Math.max(g,v+1)}i.push(...p.map(f=>({...f,columns:g})))}return i}visibleRange(){if(this.mode==="day"){let r=this.startOfDay(this.selectedDate);return{start:r,end:this.addDays(r,1)}}if(this.mode==="week"){let r=this.addDays(this.selectedDate,-this.selectedDate.getDay());return{start:r,end:this.addDays(r,7)}}let e=new Date(this.selectedDate.getFullYear(),this.selectedDate.getMonth(),1),t=new Date(this.selectedDate.getFullYear(),this.selectedDate.getMonth()+1,0),a=this.addDays(e,-e.getDay()),n=this.addDays(t,7-t.getDay());return{start:a,end:n}}rangeTitle(){if(this.mode==="month")return this.selectedDate.toLocaleDateString(void 0,{month:"long",year:"numeric"});if(this.mode==="day")return this.selectedDate.toLocaleDateString(void 0,{weekday:"long",month:"long",day:"numeric",year:"numeric"});let{start:e,end:t}=this.visibleRange(),a=this.addDays(t,-1);return e.getMonth()===a.getMonth()?`${e.toLocaleDateString(void 0,{month:"long",day:"numeric"})}\u2013${a.getDate()}, ${a.getFullYear()}`:`${e.toLocaleDateString(void 0,{month:"short",day:"numeric"})}\u2013${a.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}`}navigate(e){let t=new Date(this.selectedDate);this.mode==="month"?t.setMonth(t.getMonth()+e):t.setDate(t.getDate()+e*(this.mode==="week"?7:1)),this.selectedDate=this.startOfDay(t),this.refresh(!1)}iconButton(e,t,a,n){let r=e.createEl("button",{cls:"anchor-calendar-nav-button",attr:{"aria-label":a,title:a}});(0,u.setIcon)(r,t),r.onClickEvent(n)}openNewEvent(e,t){new R(this.app,this.plugin,void 0,()=>void this.refresh(!0),{initialDate:e,initialAllDay:t}).open()}openEvent(e){new R(this.app,this.plugin,e,()=>void this.refresh(!0),{readOnly:!e.writable}).open()}defaultNewEventDate(){return this.sameDay(this.selectedDate,new Date)?le(new Date):this.dateAt(this.selectedDate,9,0)}isAllDayLaneEvent(e){return e.allDay||!this.sameDay(e.start,D(e.end,-1))}eventOccursOn(e,t){let a=this.startOfDay(e.start),n=this.startOfDay(e.allDay?this.addDays(e.end,-1):D(e.end,-1));return a<=t&&n>=t}compareEvents(e,t){return e.allDay!==t.allDay?e.allDay?-1:1:e.start.getTime()-t.start.getTime()||e.title.localeCompare(t.title)}eventAriaLabel(e){return`${e.title||"Untitled event"}, ${this.eventTime(e)}, ${e.calendarName}, iCloud${e.writable?"":", read only"}`}eventTime(e){if(e.allDay)return"All day";let t=e.start.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),a=e.end.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"});return`${t}\u2013${a}`}fullDate(e){return e.toLocaleDateString(void 0,{weekday:"long",month:"long",day:"numeric",year:"numeric"})}timeLabel(e,t){return new Date(2e3,0,1,e,t).toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"})}dateAt(e,t,a){return new Date(e.getFullYear(),e.getMonth(),e.getDate(),t,a,0,0)}startOfDay(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}addDays(e,t){let a=new Date(e);return a.setDate(a.getDate()+t),this.startOfDay(a)}sameDay(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}},B=class extends u.Modal{constructor(e,t,a,n){super(e);this.titleValue="";this.dueValue="";this.priorityValue="medium";this.tagsValue="";this.plugin=t,this.todo=a,this.onSave=n,a&&(this.titleValue=a.title,this.dueValue=a.due,this.priorityValue=a.priority||"medium",this.tagsValue=a.tags.join(" "))}onOpen(){let{contentEl:e}=this;e.empty(),e.addClass("anchor-modal"),e.createEl("h2",{text:this.todo?"Edit Todo":"New Todo"}),new u.Setting(e).setName("Title").addText(t=>{t.setValue(this.titleValue),t.onChange(a=>{this.titleValue=a})}),new u.Setting(e).setName("Due date").addText(t=>{t.inputEl.type="date",t.setValue(this.dueValue),t.onChange(a=>{this.dueValue=a})}),new u.Setting(e).setName("Priority").addDropdown(t=>{t.addOption("high","High").addOption("medium","Medium").addOption("low","Low").setValue(this.priorityValue||"medium").onChange(a=>{this.priorityValue=a})}),new u.Setting(e).setName("Tags").setDesc("Use Markdown tags, for example #school #writing.").addText(t=>{t.setPlaceholder("#school #writing"),t.setValue(this.tagsValue),t.onChange(a=>{this.tagsValue=a})}),new u.Setting(e).addButton(t=>{t.setButtonText("Cancel").onClick(()=>this.close())}).addButton(t=>{t.setButtonText("Save").setCta().onClick(()=>void this.saveTodo())})}async saveTodo(){if(!this.titleValue.trim()){new u.Notice("Todo title is required.");return}let e=this.formatTodoLine();if(this.todo){let a=(await this.app.vault.cachedRead(this.todo.file)).split(`
`);a[this.todo.line]=e.replace("- [ ]",this.todo.completed?"- [x]":"- [ ]"),await this.app.vault.modify(this.todo.file,a.join(`
`))}else{await this.plugin.ensureFile(this.plugin.settings.todoInboxPath,ie);let t=this.app.vault.getAbstractFileByPath((0,u.normalizePath)(this.plugin.settings.todoInboxPath));if(!(t instanceof u.TFile))return;let a=await this.app.vault.cachedRead(t);await this.app.vault.modify(t,`${a.trimEnd()}
${e}
`)}this.close(),this.onSave()}formatTodoLine(){let e=this.tagsValue.split(/\s+/).filter(Boolean).map(r=>r.startsWith("#")?r:`#${r}`).join(" "),t=this.dueValue?` due:: ${this.dueValue}`:"",a=this.priorityValue?` priority:: ${this.priorityValue}`:"",n=e?` ${e}`:"";return`- [ ] ${this.titleValue.trim()}${t}${a}${n}`}},R=class extends u.Modal{constructor(e,t,a,n,r={}){super(e);this.titleValue="";this.dateValue="";this.startTimeValue="09:00";this.endTimeValue="10:00";this.allDayValue=!1;this.locationValue="";this.notesValue="";this.repeatValue="none";this.repeatUntilValue="";this.calendarIdValue="";this.readOnly=!1;this.durationMinutes=60;this.activeTimePicker=null;this.timeWheelDeltas=new WeakMap;this.outsideTimePickerHandler=e=>{var a,n;let t=e.target;t&&((a=this.timePickerPopover)!=null&&a.contains(t)||(n=this.activeTimeField)!=null&&n.contains(t)||this.closeTimePicker())};this.timePickerKeyHandler=e=>{e.key!=="Escape"||!this.activeTimePicker||(e.preventDefault(),e.stopPropagation(),this.closeTimePicker(!0))};this.timePickerResizeHandler=()=>this.positionTimePicker();if(this.plugin=t,this.event=a,this.onSave=n,this.readOnly=!!(r.readOnly||a&&!a.writable),a)this.calendarIdValue=a.calendarId,this.titleValue=a.title,this.dateValue=this.dateInputValue(a.start),this.startTimeValue=this.timeInputValue(a.start),this.endTimeValue=this.timeInputValue(a.end),this.allDayValue=a.allDay,this.locationValue=a.location,this.notesValue=a.notes,this.repeatValue=a.repeat,this.repeatUntilValue=a.repeatUntil,this.durationMinutes=Math.max(1,Math.round((a.end.getTime()-a.start.getTime())/6e4));else{this.calendarIdValue=t.settings.defaultCalendarId;let i=r.initialDate?new Date(r.initialDate):le(new Date),o=D(i,this.durationMinutes);this.dateValue=this.dateInputValue(i),this.startTimeValue=this.timeInputValue(i),this.endTimeValue=this.timeInputValue(o),this.allDayValue=!!r.initialAllDay}}onOpen(){this.render()}onClose(){this.closeTimePicker()}render(){this.closeTimePicker();let{contentEl:e}=this;if(e.empty(),e.addClass("anchor-modal"),this.readOnly&&this.event){this.renderReadOnlyEvent(e,this.event);return}if(e.createEl("h2",{text:this.event?"Edit Event":"New Event"}),new u.Setting(e).setName("Title").addText(r=>{r.setValue(this.titleValue),r.onChange(i=>{this.titleValue=i})}),!this.event){let r=this.plugin.settings.calendarSources.filter(i=>i.writable);new u.Setting(e).setName("Calendar").setDesc("Choose where this event will be saved.").addDropdown(i=>{var o;for(let c of r)i.addOption(c.id,c.accountName?`${c.displayName} \u2014 ${c.accountName}`:c.displayName);i.setValue(this.calendarIdValue||((o=r[0])==null?void 0:o.id)||""),i.onChange(c=>{this.calendarIdValue=c})})}new u.Setting(e).setName("All day").addToggle(r=>{r.setValue(this.allDayValue),r.onChange(i=>{this.allDayValue=i,this.render()})}),new u.Setting(e).setName("Date").addText(r=>{r.inputEl.type="date",r.setValue(this.dateValue),r.onChange(i=>{this.dateValue=i})}),this.allDayValue||(this.renderTimeSetting(e,"Start time","start"),this.renderTimeSetting(e,"End time","end")),new u.Setting(e).setName("Repeat").addDropdown(r=>{r.addOption("none","Never").addOption("daily","Every day").addOption("weekdays","Every weekday").addOption("weekly","Every week").addOption("monthly","Every month").addOption("yearly","Every year").setValue(this.repeatValue).onChange(i=>{this.repeatValue=i,this.repeatValue==="none"&&(this.repeatUntilValue=""),this.render()})}),this.repeatValue!=="none"&&new u.Setting(e).setName("Repeat until").setDesc("Optional").addText(r=>{r.inputEl.type="date",r.setValue(this.repeatUntilValue),r.onChange(i=>{this.repeatUntilValue=i})}),new u.Setting(e).setName("Location").addText(r=>{r.setValue(this.locationValue),r.onChange(i=>{this.locationValue=i})}),new u.Setting(e).setName("Notes").addTextArea(r=>{r.setValue(this.notesValue),r.onChange(i=>{this.notesValue=i})});let t=e.createDiv({cls:"anchor-modal-footer"});this.event&&t.createEl("button",{text:"Delete"}).onClickEvent(()=>void this.deleteEvent()),t.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),t.createEl("button",{cls:"mod-cta",text:"Save Event"}).onClickEvent(()=>void this.saveEvent())}renderReadOnlyEvent(e,t){e.createEl("h2",{text:t.title||"Untitled event"});let a=e.createDiv({cls:"anchor-event-details"}),n=(o,c)=>{if(!c)return;let d=a.createDiv({cls:"anchor-event-detail"});d.createEl("strong",{text:o}),d.createDiv({text:c})};n("Calendar",`${t.calendarName} \xB7 iCloud`),n("Account",t.accountName),n("When",this.readOnlyEventTime(t)),n("Location",t.location),n("Repeat",t.repeat==="none"?"Does not repeat":t.repeat),n("Notes",t.notes),a.createEl("p",{cls:"anchor-muted",text:"This calendar is read only in Anchor."}),e.createDiv({cls:"anchor-modal-footer"}).createEl("button",{cls:"mod-cta",text:"Close"}).onClickEvent(()=>this.close())}readOnlyEventTime(e){let t=e.start.toLocaleDateString(void 0,{weekday:"long",year:"numeric",month:"long",day:"numeric"});if(e.allDay)return`${t} \xB7 All day`;let a=e.start.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),n=e.end.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"});return`${t} \xB7 ${a}\u2013${n}`}renderTimeSetting(e,t,a){let n=new u.Setting(e).setName(t);n.settingEl.addClass("anchor-time-setting");let r=n.controlEl.createDiv({cls:"anchor-time-field"}),i=r.createDiv({cls:"anchor-time-input-wrap"}),o=i.createEl("input",{cls:"anchor-time-input",attr:{type:"text",readonly:"true","aria-haspopup":"dialog","aria-expanded":"false","aria-label":`${t}: ${this.formatDisplayTime(this.timeValueFor(a))}. Open time picker.`}});o.value=this.formatDisplayTime(this.timeValueFor(a));let c=i.createSpan({cls:"anchor-time-icon"});(0,u.setIcon)(c,"clock"),o.addEventListener("click",d=>{d.preventDefault(),this.openTimePicker(a,r,o)}),o.addEventListener("focus",()=>this.openTimePicker(a,r,o)),o.addEventListener("keydown",d=>{var h,p;d.key!=="Enter"&&d.key!==" "&&d.key!=="ArrowDown"||(d.preventDefault(),this.openTimePicker(a,r,o),(p=(h=this.timePickerPopover)==null?void 0:h.querySelector("button"))==null||p.focus())}),a==="start"?this.startTimeInput=o:this.endTimeInput=o}openTimePicker(e,t,a){if(this.activeTimePicker===e&&this.timePickerPopover){this.positionTimePicker();return}this.closeTimePicker(),this.activeTimePicker=e,this.activeTimeField=t,this.activeTimeInput=a,a.setAttribute("aria-expanded","true");let n=t.createDiv({cls:"anchor-time-popover"});n.setAttribute("role","dialog"),n.setAttribute("aria-label",`${e==="start"?"Start":"End"} time picker`),this.timePickerPopover=n,this.renderTimePickerContents(),this.positionTimePicker(),document.addEventListener("mousedown",this.outsideTimePickerHandler,!0),document.addEventListener("keydown",this.timePickerKeyHandler,!0),window.addEventListener("resize",this.timePickerResizeHandler)}closeTimePicker(e=!1){let t=this.activeTimeInput;this.timePickerPopover&&this.timePickerPopover.remove(),this.timePickerPopover=void 0,this.activeTimeField=void 0,this.activeTimeInput=void 0,this.activeTimePicker=null,t&&t.setAttribute("aria-expanded","false"),document.removeEventListener("mousedown",this.outsideTimePickerHandler,!0),document.removeEventListener("keydown",this.timePickerKeyHandler,!0),window.removeEventListener("resize",this.timePickerResizeHandler),e&&(t==null||t.focus())}renderTimePickerContents(){if(!this.timePickerPopover||!this.activeTimePicker)return;let e=this.timePickerPopover,t=this.activeTimePicker,a=this.parseTimeParts(this.timeValueFor(t));e.empty(),this.renderTimeColumn(e,t,"hour",a.hour12),e.createDiv({cls:"anchor-time-divider"}),this.renderTimeColumn(e,t,"minute",String(a.minute).padStart(2,"0")),e.createDiv({cls:"anchor-time-divider"});let n=e.createDiv({cls:"anchor-period-column"});this.renderPeriodButton(n,t,"AM",a.period),this.renderPeriodButton(n,t,"PM",a.period)}renderTimeColumn(e,t,a,n){let r=a==="hour"?"hour":"minute",i=e.createDiv({cls:"anchor-time-column"});i.addEventListener("wheel",d=>this.handleTimeColumnWheel(d,i,t,a),{passive:!1});let o=i.createEl("button",{cls:"anchor-time-step",attr:{"aria-label":`Decrease ${t} ${r}`}});(0,u.setIcon)(o,"chevron-up"),o.onClickEvent(()=>this.adjustTime(t,a,-1)),i.createDiv({cls:"anchor-time-value",text:String(n)});let c=i.createEl("button",{cls:"anchor-time-step",attr:{"aria-label":`Increase ${t} ${r}`}});(0,u.setIcon)(c,"chevron-down"),c.onClickEvent(()=>this.adjustTime(t,a,1))}handleTimeColumnWheel(e,t,a,n){var d;e.preventDefault(),e.stopPropagation();let r=e.deltaMode===WheelEvent.DOM_DELTA_LINE?e.deltaY*16:e.deltaY,i=((d=this.timeWheelDeltas.get(t))!=null?d:0)+r,o=i>0?1:-1,c=this.timeWheelThreshold(a,n,o);if(Math.abs(i)<c){this.timeWheelDeltas.set(t,i);return}this.adjustWheelTime(a,n,o),this.timeWheelDeltas.set(t,i-Math.sign(i)*c)}timeWheelThreshold(e,t,a){if(t!=="minute")return 24;let{minute:n}=this.parseTimeParts(this.timeValueFor(e));return n===0||n===30?42:18}adjustWheelTime(e,t,a){let n=this.parseTimeParts(this.timeValueFor(e)),r=n.hour12,i=t==="hour"?this.wrapNumber(r+a,1,12):r,o=t==="minute"?this.wrapNumber(n.minute+a,0,59):n.minute,c=n.period==="AM"?i%12:i%12+12;this.applyTimeValue(e,`${String(c).padStart(2,"0")}:${String(o).padStart(2,"0")}`)}wrapNumber(e,t,a){return e>a?t:e<t?a:e}renderPeriodButton(e,t,a,n){e.createEl("button",{cls:`anchor-period-button${a===n?" is-selected":""}`,text:a,attr:{"aria-label":`Set ${t} time to ${a}`,"aria-pressed":a===n?"true":"false"}}).onClickEvent(()=>this.setTimePeriod(t,a))}positionTimePicker(){if(!this.timePickerPopover||!this.activeTimeField||!this.activeTimeInput)return;let e=this.timePickerPopover;e.style.left="0px",e.style.removeProperty("--anchor-time-pointer-left"),e.removeClass("is-above");let t=this.activeTimeField.getBoundingClientRect(),a=this.activeTimeInput.getBoundingClientRect(),n=e.getBoundingClientRect(),r=this.contentEl.getBoundingClientRect(),i=12,o=Math.max(i,r.left+i),c=Math.min(window.innerWidth-i,r.right-i),d=o-t.left,h=c-t.left-n.width,p=Math.min(d,h),g=Math.max(d,h),f=Math.min(Math.max(0,p),g);e.style.left=`${f}px`;let m=a.left+Math.min(32,a.width/2)-t.left-f;e.style.setProperty("--anchor-time-pointer-left",`${Math.max(16,Math.min(n.width-22,m))}px`);let v=e.getBoundingClientRect();v.bottom>window.innerHeight-i&&a.top-v.height-i>0&&e.addClass("is-above")}adjustTime(e,t,a){let n=this.parseTimeParts(this.timeValueFor(e)),r=new Date(2e3,0,1,n.hour24,n.minute,0,0),i=t==="hour"?D(r,a*60):D(r,a*30);this.applyTimeValue(e,this.timeInputValue(i))}setTimePeriod(e,t){let a=this.parseTimeParts(this.timeValueFor(e));if(a.period===t)return;let n=t==="AM"?a.hour24-12:a.hour24+12;this.applyTimeValue(e,`${String(n).padStart(2,"0")}:${String(a.minute).padStart(2,"0")}`)}applyTimeValue(e,t){e==="start"?(this.startTimeValue=t,this.updateTimeInput(this.startTimeInput,t,"Start time"),this.followStartTime()):(this.endTimeValue=t,this.updateTimeInput(this.endTimeInput,t,"End time"),this.updateDurationFromEnd()),this.renderTimePickerContents(),this.positionTimePicker()}updateTimeInput(e,t,a){if(!e)return;let n=this.formatDisplayTime(t);e.value=n,e.setAttribute("aria-label",`${a}: ${n}. Open time picker.`)}timeValueFor(e){return e==="start"?this.startTimeValue:this.endTimeValue}parseTimeParts(e){let[t,a]=e.split(":").map(i=>Number(i)),n=Number.isFinite(t)?Math.min(23,Math.max(0,t)):0,r=Number.isFinite(a)?Math.min(59,Math.max(0,a)):0;return{hour24:n,hour12:n%12||12,minute:r,period:n>=12?"PM":"AM"}}formatDisplayTime(e){let t=this.parseTimeParts(e);return`${t.hour12}:${String(t.minute).padStart(2,"0")} ${t.period}`}async saveEvent(){var t,a,n,r,i,o;if(!this.titleValue.trim()){new u.Notice("Event title is required.");return}if(!this.dateValue){new u.Notice("Event date is required.");return}this.ensureEndAfterStart(!1);let e={uid:(t=this.event)==null?void 0:t.uid,href:(a=this.event)==null?void 0:a.href,etag:(n=this.event)==null?void 0:n.etag,rawIcs:(r=this.event)==null?void 0:r.rawIcs,calendarId:((i=this.event)==null?void 0:i.calendarId)||this.calendarIdValue,title:this.titleValue,date:this.dateValue,startTime:this.startTimeValue,endTime:this.endTimeValue,allDay:this.allDayValue,location:this.locationValue,notes:this.notesValue,repeat:this.repeatValue,repeatUntil:this.repeatUntilValue};(o=this.event)!=null&&o.repeat&&this.event.repeat!=="none"?confirm("Edit only this event? Press Cancel to edit the whole repeating series.")?await this.plugin.saveCalendarOccurrence(this.event,e):await this.plugin.saveCalendarEvent(e):await this.plugin.saveCalendarEvent(e),this.close(),this.onSave()}async deleteEvent(){if(!this.event||!confirm(`Delete "${this.event.title||"Untitled event"}"?`))return;let t=this.event.repeat!=="none"&&confirm("Delete only this event? Press Cancel to delete the whole repeating series.");await this.plugin.deleteCalendarEvent(this.event,t),this.close(),this.onSave()}ensureEndAfterStart(e){if(this.allDayValue||!this.dateValue||!this.startTimeValue||!this.endTimeValue)return;let t=T(this.dateValue,this.startTimeValue);if(T(this.dateValue,this.endTimeValue)>t)return;let n=D(t,Math.max(this.durationMinutes,60));this.endTimeValue=this.timeInputValue(n),this.updateTimeInput(this.endTimeInput,this.endTimeValue,"End time"),e||new u.Notice("End time was adjusted to be after the start time.")}followStartTime(){if(this.allDayValue||!this.dateValue||!this.startTimeValue)return;let e=T(this.dateValue,this.startTimeValue),t=D(e,Math.max(this.durationMinutes,1));this.endTimeValue=this.timeInputValue(t),this.updateTimeInput(this.endTimeInput,this.endTimeValue,"End time")}updateDurationFromEnd(){if(this.allDayValue||!this.dateValue||!this.startTimeValue||!this.endTimeValue)return;let e=T(this.dateValue,this.startTimeValue),t=T(this.dateValue,this.endTimeValue);if(t<=e){this.durationMinutes=60,this.ensureEndAfterStart(!1);return}this.durationMinutes=Math.max(1,Math.round((t.getTime()-e.getTime())/6e4))}dateInputValue(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}timeInputValue(e){return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}},Q=class extends u.Modal{constructor(s,e,t,a){super(s),this.plugin=e,this.plan={types:Object.fromEntries(Object.entries(t.types).map(([n,r])=>[n,[...r]])),sequence:[...t.sequence]},this.onSave=a}onOpen(){this.render()}render(){let{contentEl:s}=this;s.empty(),s.addClass("anchor-modal","anchor-routine-modal"),s.createEl("h2",{text:"Edit Workout Routine"});let e=s.createDiv({cls:"anchor-routine-section"}),t=e.createDiv({cls:"anchor-routine-section-header"});t.createEl("h3",{text:"Workout Types"}),t.createEl("button",{text:"+ Add Type"}).onClickEvent(()=>{let p=this.uniqueWorkoutName("New Workout");this.plan.types[p]=[],this.plan.sequence.push(p),this.render()});let n=Object.keys(this.plan.types);n.length||e.createEl("p",{cls:"anchor-muted anchor-italic",text:"Create a workout type to start your sequence."});for(let p of n)this.renderWorkoutType(e,p);let r=s.createDiv({cls:"anchor-routine-section"}),i=r.createDiv({cls:"anchor-routine-section-header"});i.createEl("h3",{text:"Sequence Order"});let o=i.createEl("button",{text:"+ Add Step"});o.disabled=!n.length,o.onClickEvent(()=>{let p=Object.keys(this.plan.types)[0];p&&(this.plan.sequence.push(p),this.render())}),this.plan.sequence.length||r.createEl("p",{cls:"anchor-muted anchor-italic",text:"No sequence steps yet."}),this.plan.sequence.forEach((p,g)=>{this.renderSequenceStep(r,p,g)});let c=s.createDiv({cls:"anchor-modal-footer"});c.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),c.createEl("button",{cls:"mod-cta",text:"Save Routine"}).onClickEvent(()=>void this.saveRoutine())}renderWorkoutType(s,e){let t=s.createDiv({cls:"anchor-routine-card"}),a=t.createDiv({cls:"anchor-routine-card-row"}),n=a.createEl("input",{cls:"anchor-routine-name"});n.type="text",n.value=e,n.placeholder="Workout name",n.onchange=()=>{this.renameWorkoutType(e,n.value.trim())},a.createEl("button",{text:"Delete"}).onClickEvent(()=>{delete this.plan.types[e],this.plan.sequence=this.plan.sequence.filter(o=>o!==e),this.render()});let i=t.createEl("textarea",{cls:"anchor-routine-exercises"});i.placeholder="One exercise per line",i.value=this.plan.types[e].join(`
`),i.onchange=()=>{this.plan.types[e]=i.value.split(`
`).map(o=>o.trim()).filter(Boolean)}}renderSequenceStep(s,e,t){let a=s.createDiv({cls:"anchor-sequence-row"});a.createEl("span",{cls:"anchor-sequence-index",text:`${t+1}`});let n=a.createEl("select");for(let c of Object.keys(this.plan.types)){let d=n.createEl("option",{text:c,value:c});d.selected=c===e}n.onchange=()=>{this.plan.sequence[t]=n.value};let r=a.createEl("button",{text:"Up"});r.disabled=t===0,r.onClickEvent(()=>{this.moveSequenceStep(t,t-1),this.render()});let i=a.createEl("button",{text:"Down"});i.disabled=t===this.plan.sequence.length-1,i.onClickEvent(()=>{this.moveSequenceStep(t,t+1),this.render()}),a.createEl("button",{text:"Remove"}).onClickEvent(()=>{this.plan.sequence.splice(t,1),this.render()})}renameWorkoutType(s,e){if(!e||e===s)return;if(this.plan.types[e]){new u.Notice("A workout type with that name already exists."),this.render();return}let t=Object.entries(this.plan.types);this.plan.types=Object.fromEntries(t.map(([a,n])=>a===s?[e,n]:[a,n])),this.plan.sequence=this.plan.sequence.map(a=>a===s?e:a),this.render()}moveSequenceStep(s,e){let[t]=this.plan.sequence.splice(s,1);this.plan.sequence.splice(e,0,t)}uniqueWorkoutName(s){if(!this.plan.types[s])return s;let e=2;for(;this.plan.types[`${s} ${e}`];)e+=1;return`${s} ${e}`}async saveRoutine(){let s=Object.keys(this.plan.types).filter(Boolean);if(!s.length){new u.Notice("Add at least one workout type.");return}this.plan.sequence=this.plan.sequence.filter(t=>!!this.plan.types[t]),this.plan.sequence.length||(this.plan.sequence=[s[0]]),await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,Z);let e=this.app.vault.getAbstractFileByPath((0,u.normalizePath)(this.plugin.settings.workoutPlanPath));e instanceof u.TFile&&(await this.app.vault.modify(e,this.formatWorkoutPlan()),new u.Notice("Workout routine saved."),this.close(),this.onSave())}formatWorkoutPlan(){let s=["# Workout Types",""];for(let[e,t]of Object.entries(this.plan.types))s.push(`## ${e}`),t.length?s.push(...t.map(a=>`- ${a}`)):s.push("Rest day"),s.push("");return s.push("# Sequence",""),s.push(...this.plan.sequence.map(e=>`- ${e}`)),s.push(""),s.join(`
`)}},X=class extends u.PluginSettingTab{constructor(s,e){super(s,e),this.plugin=e}display(){let{containerEl:s}=this;s.empty(),s.createEl("h2",{text:"Anchor Settings"}),new u.Setting(s).setName("Open on startup").setDesc("Automatically open the Anchor dashboard when Obsidian starts.").addToggle(t=>{t.setValue(this.plugin.settings.openOnStartup).onChange(async a=>{this.plugin.settings.openOnStartup=a,await this.plugin.saveSettings()})}),s.createEl("h3",{text:"Calendar"}),new u.Setting(s).setName("Enable calendar").setDesc("Show connected iCloud/CalDAV calendars in Anchor.").addToggle(t=>{t.setValue(this.plugin.settings.calendarEnabled).onChange(async a=>{this.plugin.settings.calendarEnabled=a,await this.plugin.saveSettings()})}),new u.Setting(s).setName("CalDAV server URL").setDesc("For iCloud, use https://caldav.icloud.com.").addText(t=>{t.setPlaceholder("https://caldav.icloud.com").setValue(this.plugin.settings.calendarServerUrl).onChange(async a=>{this.plugin.settings.calendarServerUrl=a.trim(),await this.plugin.saveSettings()})}),new u.Setting(s).setName("Calendar username").setDesc("For iCloud, use your Apple ID email.").addText(t=>{t.setPlaceholder("name@example.com").setValue(this.plugin.settings.calendarUsername).onChange(async a=>{this.plugin.settings.calendarUsername=a.trim(),await this.plugin.saveSettings()})}),new u.Setting(s).setName("Calendar password").setDesc("For iCloud, use an app-specific password.").addText(t=>{t.inputEl.type="password",t.setValue(this.plugin.settings.calendarPassword).onChange(async a=>{this.plugin.settings.calendarPassword=a,await this.plugin.saveSettings()})}),new u.Setting(s).setName("Test calendar connection").setDesc("Discovers every CalDAV event calendar and enables new calendars by default.").addButton(t=>{t.setButtonText("Test"),t.onClick(async()=>{try{let a=await this.plugin.testCalendarConnection();new u.Notice(`Connected to ${a.length} calendar${a.length===1?"":"s"}.`),this.display(),await this.plugin.refreshDashboard(!0)}catch(a){new u.Notice(a instanceof Error?a.message:"Calendar connection failed.")}})});let e=this.plugin.settings.calendarSources;if(e.length){s.createEl("h4",{text:"Visible calendars"});for(let t of e){let n=new u.Setting(s).setName(t.displayName).setDesc(`iCloud \xB7 ${t.accountName||"iCloud"}${t.writable?" \xB7 Writable":" \xB7 Read only"}`).addToggle(r=>{r.setValue(t.enabled).onChange(async i=>{await this.plugin.setCalendarEnabled(t.id,i)})}).nameEl.createSpan({cls:"anchor-calendar-source-dot"});n.style.backgroundColor=t.color}new u.Setting(s).setName("Default event calendar").setDesc("New events are saved here unless another calendar is selected in the event form.").addDropdown(t=>{for(let a of e.filter(n=>n.writable))t.addOption(a.id,`${a.displayName} \u2014 iCloud`);t.setValue(this.plugin.settings.defaultCalendarId),t.onChange(async a=>{var r,i;let n=this.plugin.settings.calendarSources.find(o=>o.id===a);this.plugin.settings.defaultCalendarId=a,this.plugin.settings.calendarUrl=(r=n==null?void 0:n.href)!=null?r:"",this.plugin.settings.calendarName=(i=n==null?void 0:n.displayName)!=null?i:"",await this.plugin.saveSettings()})})}s.createEl("h3",{text:"Todos"}),new u.Setting(s).setName("Todo inbox file").setDesc("New todos created from the dashboard are saved here.").addText(t=>{t.setValue(this.plugin.settings.todoInboxPath).onChange(async a=>{this.plugin.settings.todoInboxPath=(0,u.normalizePath)(a),await this.plugin.saveSettings()})}),new u.Setting(s).setName("Todo scan folders").setDesc("Comma-separated folders to scan for Markdown todos. Leave blank to scan the whole vault.").addText(t=>{t.setValue(this.plugin.settings.todoScanFolders).onChange(async a=>{this.plugin.settings.todoScanFolders=a,await this.plugin.saveSettings()})}),s.createEl("h3",{text:"Workout"}),new u.Setting(s).setName("Workout plan file").addText(t=>{t.setValue(this.plugin.settings.workoutPlanPath).onChange(async a=>{this.plugin.settings.workoutPlanPath=(0,u.normalizePath)(a),await this.plugin.saveSettings()})}),new u.Setting(s).setName("Workout log file").addText(t=>{t.setValue(this.plugin.settings.workoutLogPath).onChange(async a=>{this.plugin.settings.workoutLogPath=(0,u.normalizePath)(a),await this.plugin.saveSettings()})})}};
