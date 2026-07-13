/* Home Base Obsidian plugin */
var K=Object.defineProperty;var ke=Object.getOwnPropertyDescriptor;var Se=Object.getOwnPropertyNames;var Pe=Object.prototype.hasOwnProperty;var Le=(c,i)=>{for(var e in i)K(c,e,{get:i[e],enumerable:!0})},Ae=(c,i,e,t)=>{if(i&&typeof i=="object"||typeof i=="function")for(let a of Se(i))!Pe.call(c,a)&&a!==e&&K(c,a,{get:()=>i[a],enumerable:!(t=ke(i,a))||t.enumerable});return c};var Re=c=>Ae(K({},"__esModule",{value:!0}),c);var Xe={};Le(Xe,{default:()=>W});module.exports=Re(Xe);var u=require("obsidian"),R="home-base-dashboard",V="home-base-calendar",Ve={openOnStartup:!0,todoInboxPath:"Home Base/Todo Inbox.md",todoScanFolders:"Home Base",workoutPlanPath:"Home Base/Workout Plan.md",workoutLogPath:"Home Base/Workout Log.md",showSchedulePlaceholder:!0,calendarEnabled:!1,calendarServerUrl:"https://caldav.icloud.com",calendarUsername:"",calendarPassword:"",calendarUrl:"",calendarName:"",calendarSources:[],defaultCalendarId:"",googleAccounts:[]},fe=`# Todo Inbox

`,ie=`# Workout Types

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
`,be=`# Workout Log

`,Y="urn:ietf:params:xml:ns:caldav",Q="624562241406-v5ush8aaff978b0uou1i7ihuj880fj63.apps.googleusercontent.com",Ne="https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly",U="home-base-google-sync-key",X="home-base-google-client-secret",$e=5*60*1e3;function q(c){return c.replace(/[&<>"']/g,i=>{var e;return(e={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[i])!=null?e:i})}function pe(c,i){let e=c?"Google Calendar connected to Home Base.":"Google Calendar connection failed.",t=c?"You may close this window and return to Obsidian.":"Return to Obsidian, correct the issue, and try connecting again.";return`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${q(e)}</title></head>
<body style="font:16px system-ui,sans-serif;max-width:720px;margin:64px auto;padding:0 24px;line-height:1.5;color:#202124">
  <h2>${q(e)}</h2>
  <p>${q(i)}</p>
  <p>${q(t)}</p>
</body>
</html>`}function Z(c){let i="";return c.forEach(e=>i+=String.fromCharCode(e)),btoa(i).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function J(c){let i="";return c.forEach(e=>i+=String.fromCharCode(e)),btoa(i)}function ee(c){return Uint8Array.from(atob(c),i=>i.charCodeAt(0))}async function ve(c,i){let e=await crypto.subtle.importKey("raw",new TextEncoder().encode(c),"PBKDF2",!1,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt:i,iterations:21e4,hash:"SHA-256"},e,{name:"AES-GCM",length:256},!1,["encrypt","decrypt"])}async function Ie(c,i){let e=crypto.getRandomValues(new Uint8Array(16)),t=crypto.getRandomValues(new Uint8Array(12)),a=await ve(i,e),r=await crypto.subtle.encrypt({name:"AES-GCM",iv:t},a,new TextEncoder().encode(c));return{encrypted:J(new Uint8Array(r)),salt:J(e),iv:J(t)}}async function Oe(c,i,e,t){let a=await ve(i,ee(e)),r=await crypto.subtle.decrypt({name:"AES-GCM",iv:ee(t)},a,ee(c));return new TextDecoder().decode(r)}var H="DAV:";function ye(c){let i=c.trim();return i?i.endsWith("/")?i:`${i}/`:""}function O(c,i){return new URL(i,ye(c)).toString()}function Me(c){return`${encodeURIComponent(c)}.ics`}function le(c){let i=c.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`),e=[];for(let t of i)/^[ \t]/.test(t)&&e.length?e[e.length-1]+=t.slice(1):t.trim()&&e.push(t);return e}function we(c){let i=c.indexOf(":");if(i===-1)return null;let e=c.slice(0,i),[t,...a]=e.split(";");return{name:t.toUpperCase(),params:a.join(";"),value:c.slice(i+1)}}function te(c){return c.replace(/\\n/gi,`
`).replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\")}function ae(c){return c.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/;/g,"\\;").replace(/,/g,"\\,")}function ce(c){let i=[],e=c;for(;e.length>74;)i.push(e.slice(0,74)),e=` ${e.slice(74)}`;return i.push(e),i.join(`\r
`)}function N(c){return`${c.getFullYear()}${String(c.getMonth()+1).padStart(2,"0")}${String(c.getDate()).padStart(2,"0")}`}function G(c){return c.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z")}function $(c){return`${N(c)}T${String(c.getHours()).padStart(2,"0")}${String(c.getMinutes()).padStart(2,"0")}${String(c.getSeconds()).padStart(2,"0")}`}function Ge(c,i){let e=ne(c,i);return e.allDay?N(e.date):$(e.date)}function ne(c,i){let e=/VALUE=DATE/i.test(i)||/^\d{8}$/.test(c);if(/^\d{8}$/.test(c))return{date:new Date(Number(c.slice(0,4)),Number(c.slice(4,6))-1,Number(c.slice(6,8))),allDay:e};let t=c.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);if(!t)return{date:new Date,allDay:e};let[,a,r,n,s,o,l,d]=t,h=[a,r,n,s,o,l].map(p=>Number(p));return d?{date:new Date(Date.UTC(h[0],h[1]-1,h[2],h[3],h[4],h[5])),allDay:e}:{date:new Date(h[0],h[1]-1,h[2],h[3],h[4],h[5]),allDay:e}}function k(c,i){return new Date(c.getTime()+i*6e4)}function xe(c){let i=new Date(c);return i.setSeconds(0,0),i.getMinutes()<30?i.setMinutes(30):i.setHours(i.getHours()+1,0,0,0),i}function Ue(c,i){let e=new Date(c);return e.setMonth(e.getMonth()+i),e}function qe(c,i){let e=new Date(c);return e.setFullYear(e.getFullYear()+i),e}function S(c,i){let[e,t,a]=c.split("-").map(s=>Number(s)),[r,n]=i.split(":").map(s=>Number(s));return new Date(e,t-1,a,r||0,n||0,0)}function me(c){let[i,e,t]=c.split("-").map(Number);return new Date(i,e-1,t)}function He(c){return`${c.getFullYear()}-${String(c.getMonth()+1).padStart(2,"0")}-${String(c.getDate()).padStart(2,"0")}`}function Ee(c){let[i,e,t]=c.date.split("-").map(n=>Number(n));if(c.allDay){let n=new Date(i,e-1,t);return{start:n,end:M(n,1)}}let a=S(c.date,c.startTime||"09:00"),r=S(c.date,c.endTime||"10:00");return r<=a&&(r=k(a,60)),{start:a,end:r}}function M(c,i){let e=new Date(c);return e.setDate(e.getDate()+i),e}function De(c,i){let{start:e,end:t}=Ee(c),a=new Date,r=[`UID:${i}`,`DTSTAMP:${G(a)}`,`LAST-MODIFIED:${G(a)}`,`SUMMARY:${ae(c.title.trim())}`];c.allDay?(r.push(`DTSTART;VALUE=DATE:${N(e)}`),r.push(`DTEND;VALUE=DATE:${N(t)}`)):(r.push(`DTSTART:${$(e)}`),r.push(`DTEND:${$(t)}`)),c.location.trim()&&r.push(`LOCATION:${ae(c.location.trim())}`),c.notes.trim()&&r.push(`DESCRIPTION:${ae(c.notes.trim())}`);let n=Ce(c);return n&&r.push(`RRULE:${n}`),r}function Ce(c){if(c.repeat==="none")return"";let i=[];if(c.repeat==="daily"&&i.push("FREQ=DAILY"),c.repeat==="weekdays"&&i.push("FREQ=WEEKLY","BYDAY=MO,TU,WE,TH,FR"),c.repeat==="weekly"&&i.push("FREQ=WEEKLY"),c.repeat==="monthly"&&i.push("FREQ=MONTHLY"),c.repeat==="yearly"&&i.push("FREQ=YEARLY"),c.repeatUntil){let e=c.allDay?`${c.repeatUntil.replace(/-/g,"")}`:$(S(c.repeatUntil,c.endTime||"23:59"));i.push(`UNTIL=${e}`)}return i.join(";")}function Te(c,i){return`${["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Home Base//Obsidian Calendar//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",`CREATED:${G(new Date)}`,...De(c,i),"END:VEVENT","END:VCALENDAR"].map(ce).join(`\r
`)}\r
`}function Fe(c,i,e){let t=le(c),a=t.findIndex(l=>l.toUpperCase()==="BEGIN:VEVENT"),r=t.findIndex((l,d)=>d>a&&l.toUpperCase()==="END:VEVENT");if(a===-1||r===-1)return Te(i,e);let n=De(i,e),s=new Set(["UID","DTSTAMP","LAST-MODIFIED","SUMMARY","DTSTART","DTEND","LOCATION","DESCRIPTION","RRULE"]);return`${[...t.slice(0,a+1),...n,...t.slice(a+1,r).filter(l=>{let d=we(l);return!d||!s.has(d.name)}),...t.slice(r)].map(ce).join(`\r
`)}\r
`}function Be(c,i,e,t){var v,y,w,E,D,C,P,de,he,ue;let a=le(c),r=a.findIndex(x=>x.toUpperCase()==="BEGIN:VEVENT"),n=a.findIndex((x,L)=>L>r&&x.toUpperCase()==="END:VEVENT");if(r===-1||n===-1)return null;let s=a.slice(r+1,n).map(we).filter(x=>!!x),o=x=>s.find(L=>L.name===x),l=x=>s.filter(L=>L.name===x),d=((v=o("UID"))==null?void 0:v.value)||((y=i.split("/").pop())==null?void 0:y.replace(/\.ics$/i,""))||crypto.randomUUID(),h=o("DTSTART");if(!h)return null;let p=ne(h.value,h.params),g=o("DTEND"),f=g?ne(g.value,g.params):{date:p.allDay?M(p.date,1):k(p.date,60),allDay:p.allDay},m=We((E=(w=o("RRULE"))==null?void 0:w.value)!=null?E:""),b=l("EXDATE").flatMap(x=>x.value.split(",").map(L=>Ge(L,x.params)));return{uid:d,href:i,etag:e,title:te((C=(D=o("SUMMARY"))==null?void 0:D.value)!=null?C:""),start:p.date,end:f.date,allDay:p.allDay,location:te((de=(P=o("LOCATION"))==null?void 0:P.value)!=null?de:""),notes:te((ue=(he=o("DESCRIPTION"))==null?void 0:he.value)!=null?ue:""),repeat:m.repeat,repeatUntil:m.repeatUntil,exceptionDates:b,rawIcs:c,calendarName:t.displayName,calendarId:t.id,accountName:t.accountName,provider:t.provider,color:t.color,writable:t.writable}}function We(c){if(!c)return{repeat:"none",repeatUntil:""};let i=Object.fromEntries(c.split(";").map(t=>{let[a,r=""]=t.split("=");return[a.toUpperCase(),r.toUpperCase()]})),e="none";return i.FREQ==="DAILY"&&(e="daily"),i.FREQ==="WEEKLY"&&i.BYDAY==="MO,TU,WE,TH,FR"?e="weekdays":i.FREQ==="WEEKLY"&&(e="weekly"),i.FREQ==="MONTHLY"&&(e="monthly"),i.FREQ==="YEARLY"&&(e="yearly"),{repeat:e,repeatUntil:i.UNTIL?`${i.UNTIL.slice(0,4)}-${i.UNTIL.slice(4,6)}-${i.UNTIL.slice(6,8)}`:""}}function _e(c){var e;let i=(e=c.occurrenceStart)!=null?e:c.start;return c.allDay?N(i):$(i)}function je(c,i){let e=le(c),t=e.findIndex(s=>s.toUpperCase()==="END:VEVENT");if(t===-1)return c;let a=_e(i);if(i.exceptionDates.includes(a))return c;let r=i.allDay?`EXDATE;VALUE=DATE:${a}`:`EXDATE:${a}`;return`${[...e.slice(0,t),r,...e.slice(t)].map(ce).join(`\r
`)}\r
`}function ze(c,i,e){return c.flatMap(t=>t.repeat==="none"?[t]:Ke(t,i,e))}function Ke(c,i,e){let t=c.end.getTime()-c.start.getTime(),a=c.repeatUntil?M(new Date(`${c.repeatUntil}T00:00:00`),1):e,r=[],n=new Date(c.start),s=0;for(;n<e&&n<a&&s<500;){s+=1;let o=new Date(n.getTime()+t),l=c.allDay?N(n):$(n),d=n.getDay()>=1&&n.getDay()<=5;if(o>=i&&n<e&&!c.exceptionDates.includes(l)&&(c.repeat!=="weekdays"||d)&&r.push({...c,start:new Date(n),end:o,occurrenceStart:new Date(n)}),c.repeat==="daily"||c.repeat==="weekdays")n=M(n,1);else if(c.repeat==="weekly")n=M(n,7);else if(c.repeat==="monthly")n=Ue(n,1);else if(c.repeat==="yearly")n=qe(n,1);else break}return r}function T(c,i){let e=c instanceof Document?c.documentElement:c,t=Array.from(e.getElementsByTagName("*"));return e.localName===i&&t.unshift(e),t.filter(a=>a.localName===i)}function A(c,i){var e,t,a;return(a=(t=(e=T(c,i)[0])==null?void 0:e.textContent)==null?void 0:t.trim())!=null?a:""}function ge(c,i){let e=T(c,i)[0];return e?A(e,"href"):""}function F(c){return new DOMParser().parseFromString(c,"application/xml")}var Ye=`
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
`,Qe=`
.home-base-calendar-view{min-height:100%;padding:24px;color:var(--text-normal);background:radial-gradient(circle at top right,rgba(124,97,255,.1),transparent 38rem),var(--background-primary)}
.home-base-calendar-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:18px}.home-base-calendar-heading h1{margin:0;font-size:28px}.home-base-calendar-heading-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:5px;color:var(--text-muted);font-size:13px}.home-base-calendar-heading-meta>span+span:not(.home-base-pill)::before{content:"\xB7";margin-right:8px}
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
`,W=class extends u.Plugin{constructor(){super(...arguments);this.googleAccessTokens=new Map;this.calendarCaches=new Map;this.calendarRequests=new Map;this.calendarRequestVersions=new Map}async onload(){await this.loadSettings(),this.injectStyles(),this.registerView(R,e=>new _(e,this)),this.registerView(V,e=>new j(e,this)),this.addRibbonIcon("home","Open Home Base",()=>{this.openDashboard()}),this.addCommand({id:"open-home-base",name:"Open Home Base",callback:()=>void this.openDashboard()}),this.addCommand({id:"refresh-home-base",name:"Refresh Home Base",callback:()=>void this.refreshDashboard()}),this.addCommand({id:"open-home-base-calendar",name:"Open Home Base Calendar",callback:()=>void this.openCalendar()}),this.addSettingTab(new oe(this.app,this)),await this.ensureDefaultFiles().catch(e=>{console.warn("Home Base could not create one or more default files.",e)}),this.settings.openOnStartup&&this.app.workspace.onLayoutReady(()=>{this.openDashboard()})}onunload(){var e;this.app.workspace.detachLeavesOfType(R),this.app.workspace.detachLeavesOfType(V),(e=this.styleEl)==null||e.remove()}async saveSettings(){await this.saveData(this.settings)}async loadSettings(){var n,s,o,l;let e=(n=await this.loadData())!=null?n:{},t=Array.isArray(e.calendarSources)?e.calendarSources:[],a=t.filter(d=>(d==null?void 0:d.provider)==="icloud"||(d==null?void 0:d.provider)==="google"),r=a.length!==t.length||"systemCalendarSnapshot"in e||"systemSnapshotUpdatedAt"in e;if(delete e.systemCalendarSnapshot,delete e.systemSnapshotUpdatedAt,this.settings=Object.assign({},Ve,e,{calendarSources:a}),!a.some(d=>d.id===this.settings.defaultCalendarId&&d.writable)){let d=a.find(h=>h.writable);this.settings.defaultCalendarId=(s=d==null?void 0:d.id)!=null?s:"",this.settings.calendarUrl=(o=d==null?void 0:d.href)!=null?o:"",this.settings.calendarName=(l=d==null?void 0:d.displayName)!=null?l:""}r&&await this.saveSettings()}async openDashboard(){let e=this.app.workspace.getLeavesOfType(R)[0];if(e){this.app.workspace.revealLeaf(e);return}let t=this.app.workspace.getLeaf("tab");await t.setViewState({type:R,active:!0}),this.app.workspace.revealLeaf(t)}async openCalendar(){let e=this.app.workspace.getLeavesOfType(V)[0];if(e){this.app.workspace.revealLeaf(e);return}let t=this.app.workspace.getLeaf("tab");await t.setViewState({type:V,active:!0}),this.app.workspace.revealLeaf(t)}async refreshDashboard(e=!0){let t=this.app.workspace.getLeavesOfType(R);for(let r of t){let n=r.view;n instanceof _&&n.render(e)}let a=this.app.workspace.getLeavesOfType(V);for(let r of a){let n=r.view;n instanceof j&&n.refresh(e)}}getCachedCalendarEvents(e,t){var r;let a=this.calendarCacheKey(e,t);return(r=this.calendarCaches.get(a))==null?void 0:r.state}isCalendarCacheFresh(e,t){let a=this.calendarCacheKey(e,t),r=this.calendarCaches.get(a);return!!(r&&Date.now()-r.updatedAt<6e4)}invalidateCalendarCache(){this.calendarCaches.clear();for(let[e,t]of this.calendarRequestVersions)this.calendarRequestVersions.set(e,t+1);this.calendarRequests.clear()}refreshCalendarEvents(e,t,a=!1){var h,p;let r=this.calendarCacheKey(e,t),n=(h=this.calendarCaches.get(r))==null?void 0:h.state;if(!a&&n&&this.isCalendarCacheFresh(e,t))return Promise.resolve(n);let s=this.calendarRequests.get(r);if(!a&&s)return s;let o=n,l=((p=this.calendarRequestVersions.get(r))!=null?p:0)+1;this.calendarRequestVersions.set(r,l);let d=this.fetchCalendarEvents(e,t).then(g=>{var m,b,v;if(l!==this.calendarRequestVersions.get(r))return(v=(b=this.calendarRequests.get(r))!=null?b:(m=this.calendarCaches.get(r))==null?void 0:m.state)!=null?v:g;let f=g.status==="error"&&(o!=null&&o.events.length)?{...o,error:"",errors:g.errors.length?g.errors:[g.error],status:"error"}:g;return this.calendarCaches.set(r,{state:f,updatedAt:Date.now()}),f}).finally(()=>{this.calendarRequests.get(r)===d&&this.calendarRequests.delete(r)});return this.calendarRequests.set(r,d),d}async setCalendarEnabled(e,t){let a=this.settings.calendarSources.find(r=>r.id===e);a&&(a.enabled=t,this.invalidateCalendarCache(),await this.saveSettings(),await this.refreshDashboard(!0))}calendarCacheKey(e,t){let a=this.settings.calendarSources.map(n=>`${n.id}:${n.enabled}`).sort().join("|"),r=this.settings.googleAccounts.map(n=>n.id).sort().join("|");return[e.toISOString(),t.toISOString(),this.settings.calendarEnabled,this.settings.calendarServerUrl,this.settings.calendarUsername,a,r].join("::")}async fetchCalendarEvents(e,t){if(!this.hasCalendarConfig())return{events:[],error:"",errors:[],setupRequired:!0,sourceCount:0,status:"ready"};try{let a=(await this.getCalendars()).filter(o=>o.enabled);if(!a.length)return{events:[],error:"No calendars are enabled.",errors:[],setupRequired:!1,sourceCount:0,status:"error"};let r=await Promise.all(a.map(async o=>{try{if(o.provider==="google")return{events:await this.fetchGoogleEvents(o,e,t),error:""};let l=`<?xml version="1.0" encoding="utf-8" ?>
<c:calendar-query xmlns:d="${H}" xmlns:c="${Y}">
  <d:prop>
    <d:getetag />
    <c:calendar-data />
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${G(e)}" end="${G(t)}" />
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`,d=await this.caldavRequest(o.href,"REPORT",l,{Depth:"1"}),h=F(d.text);return{events:ze(T(h,"response").map(g=>{let f=O(o.href,A(g,"href")),m=A(g,"getetag"),b=A(g,"calendar-data");return b?Be(b,f,m,o):null}).filter(g=>!!g),e,t).filter(g=>g.end>=e&&g.start<t),error:""}}catch(l){return{events:[],error:`${o.displayName}: ${this.readableCalendarError(l)}`}}})),n=r.map(o=>o.error).filter(Boolean),s=r.flatMap(o=>o.events).filter((o,l,d)=>d.findIndex(h=>{var p,g,f,m;return h.calendarId===o.calendarId&&h.uid===o.uid&&((g=(p=h.occurrenceStart)==null?void 0:p.getTime())!=null?g:h.start.getTime())===((m=(f=o.occurrenceStart)==null?void 0:f.getTime())!=null?m:o.start.getTime())})===l).sort((o,l)=>Number(l.allDay)-Number(o.allDay)||o.start.getTime()-l.start.getTime()||o.title.localeCompare(l.title));return{events:s,error:s.length||!n.length?"":n[0],errors:n,setupRequired:!1,sourceCount:a.length,status:n.length?"error":"ready"}}catch(a){let r=this.readableCalendarError(a);return{events:[],error:r,errors:[r],setupRequired:!1,sourceCount:0,status:"error"}}}async saveCalendarEvent(e){let t=await this.getWritableCalendar(e.calendarId);if(!t){new u.Notice("Set up a default CalDAV calendar first.");return}if(t.provider==="google"){await this.saveGoogleEvent(t,e);return}let a=e.uid||crypto.randomUUID(),r=e.href||O(t.href,Me(a)),n=e.rawIcs?Fe(e.rawIcs,e,a):Te(e,a),s={"Content-Type":"text/calendar; charset=utf-8"};e.etag?s["If-Match"]=e.etag:s["If-None-Match"]="*";try{await this.caldavRequest(r,"PUT",n,s),this.invalidateCalendarCache(),new u.Notice("Calendar event saved.")}catch(o){throw new u.Notice(this.readableCalendarError(o)),o}}async saveCalendarOccurrence(e,t){await this.excludeCalendarOccurrence(e),await this.saveCalendarEvent({...t,uid:void 0,href:void 0,etag:void 0,rawIcs:void 0,repeat:"none",repeatUntil:""})}async deleteCalendarEvent(e,t=!1){try{if(e.provider==="google"){let a=this.settings.calendarSources.find(n=>n.id===e.calendarId);if(!a)throw new Error("Google calendar source is missing.");let r=await this.getGoogleAccessToken(a.accountName);await this.googleRequest(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(a.href)}/events/${encodeURIComponent(e.href)}`,"DELETE",r),this.invalidateCalendarCache(),new u.Notice("Calendar event deleted.");return}if(t&&e.repeat!=="none"){await this.excludeCalendarOccurrence(e),new u.Notice("Calendar occurrence deleted.");return}await this.caldavRequest(e.href,"DELETE","",e.etag?{"If-Match":e.etag}:{}),this.invalidateCalendarCache(),new u.Notice("Calendar event deleted.")}catch(a){throw new u.Notice(this.readableCalendarError(a)),a}}async excludeCalendarOccurrence(e){let t=je(e.rawIcs,e);await this.caldavRequest(e.href,"PUT",t,{"Content-Type":"text/calendar; charset=utf-8",...e.etag?{"If-Match":e.etag}:{}})}async testCalendarConnection(){if(!this.hasCalendarCredentials())throw new Error("Fill in the CalDAV server URL, Apple ID email, and app-specific password first.");let e=await this.getCalendars(!0,!0);if(!e.length)throw new Error("No event calendar was found for this CalDAV account.");return e}hasCalendarCredentials(){return!!(this.settings.calendarServerUrl.trim()&&this.settings.calendarUsername.trim()&&this.settings.calendarPassword.trim())}hasCalendarConfig(){return!!(this.settings.calendarEnabled&&(this.hasCalendarCredentials()||this.settings.googleAccounts.length))}async getCalendars(e=!1,t=!1){var s,o,l,d;if(!this.hasCalendarCredentials())return this.settings.calendarSources.filter(h=>h.provider==="google");if(!t&&!this.hasCalendarConfig())return[];if(this.settings.calendarSources.length&&!e&&(!this.hasCalendarCredentials()||this.settings.calendarSources.some(h=>h.provider==="icloud")))return this.settings.calendarSources;let a=new Map(this.settings.calendarSources.map(h=>[h.id,h])),r=[...(await this.discoverCalendars()).map(h=>{var p,g;return{...h,enabled:(g=(p=a.get(h.id))==null?void 0:p.enabled)!=null?g:!0}}),...this.settings.calendarSources.filter(h=>h.provider==="google")],n=(s=r.find(h=>h.id===this.settings.defaultCalendarId&&h.writable))!=null?s:r.find(h=>h.writable);return this.settings.calendarSources=r,this.settings.defaultCalendarId=(o=n==null?void 0:n.id)!=null?o:"",this.settings.calendarUrl=(l=n==null?void 0:n.href)!=null?l:"",this.settings.calendarName=(d=n==null?void 0:n.displayName)!=null?d:"",await this.saveSettings(),r}async getWritableCalendar(e){var a,r;let t=await this.getCalendars();return(r=(a=t.find(n=>n.writable&&n.id===(e||this.settings.defaultCalendarId)))!=null?a:t.find(n=>n.writable))!=null?r:null}async connectGoogleAccount(){if(!u.Platform.isDesktopApp)throw new Error("Connect Google accounts from Obsidian desktop first.");let e=await this.getGoogleClientSecret(),t=this.app.secretStorage.getSecret(U)||await B(this.app,"Create Google sync passphrase","This passphrase encrypts your Google Calendar token in the synced plugin settings.");if(!t)throw new Error("A sync passphrase is required.");this.app.secretStorage.setSecret(U,t);let a=Z(crypto.getRandomValues(new Uint8Array(48))),r=Z(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(a)))),n=Z(crypto.getRandomValues(new Uint8Array(24))),s=require("http"),o=require("electron").shell;return new Promise((l,d)=>{let h="",p=!1,g=!1,f,m=s.createServer((v,y)=>{(async()=>{if(!h){y.statusCode=503,y.end();return}let w=new URL(v.url||"/",h);if(w.pathname!=="/"){y.statusCode=w.pathname==="/favicon.ico"?204:404,y.end();return}if(p||g){y.statusCode=204,y.end();return}p=!0;try{if(w.searchParams.get("state")!==n)throw new Error("Google authorization state mismatch. Start the connection again from Obsidian.");let E=w.searchParams.get("error");if(E)throw new Error(E==="access_denied"?"Google authorization was cancelled.":`Google authorization failed: ${E}.`);let D=w.searchParams.get("code");if(!D)throw new Error("Google did not return an authorization code. Start the connection again.");let C=await this.completeGoogleAuthorization(D,h,a,t,e);y.statusCode=200,y.setHeader("Content-Type","text/html; charset=utf-8"),y.end(pe(!0,`${C.email} and its calendars are now available in Home Base.`)),b(void 0,C)}catch(E){let D=E instanceof Error?E:new Error("Google Calendar connection failed.");y.statusCode=400,y.setHeader("Content-Type","text/html; charset=utf-8"),y.end(pe(!1,D.message)),b(D)}})()}),b=(v,y)=>{g||(g=!0,f&&clearTimeout(f),m.listening&&m.close(),v?d(v):y&&l(y))};m.on("error",v=>b(v)),m.listen(0,"127.0.0.1",()=>{let v=m.address();if(!v||typeof v=="string"){b(new Error("Home Base could not start the local Google authorization callback."));return}h=`http://127.0.0.1:${v.port}`;let y=new URL("https://accounts.google.com/o/oauth2/v2/auth");y.search=new URLSearchParams({client_id:Q,redirect_uri:h,response_type:"code",scope:Ne,access_type:"offline",prompt:"consent",code_challenge:r,code_challenge_method:"S256",state:n}).toString(),f=setTimeout(()=>b(new Error("Google authorization timed out. Start the connection again from Obsidian.")),$e),o.openExternal(y.toString()).catch(w=>b(w))})})}async completeGoogleAuthorization(e,t,a,r,n){var g;let s=await(0,u.requestUrl)({url:"https://oauth2.googleapis.com/token",method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:Q,client_secret:n,code:e,code_verifier:a,redirect_uri:t,grant_type:"authorization_code"}).toString(),throw:!1});if(s.status>=400)throw new Error(this.googleResponseError(s,"Google token exchange failed."));let o=s.json;if(!o.refresh_token)throw new Error("Google did not return a refresh token. Revoke Home Base access in your Google Account, then reconnect.");let l=await this.fetchGoogleCalendarList(o.access_token),d=(g=l.find(f=>f.primary))!=null?g:l[0];if(!d)throw new Error("No Google calendars were found.");let h=await Ie(o.refresh_token,r),p={id:d.id,email:d.id,encryptedRefreshToken:h.encrypted,tokenSalt:h.salt,tokenIv:h.iv};return this.settings.googleAccounts=[...this.settings.googleAccounts.filter(f=>f.id!==p.id),p],this.googleAccessTokens.set(p.id,{token:o.access_token,expiresAt:Date.now()+o.expires_in*1e3-6e4}),await this.refreshGoogleCalendars(p,l),await this.saveSettings(),this.invalidateCalendarCache(),p}async disconnectGoogleAccount(e){this.settings.googleAccounts=this.settings.googleAccounts.filter(t=>t.id!==e),this.settings.calendarSources=this.settings.calendarSources.filter(t=>!(t.provider==="google"&&t.accountName===e)),this.googleAccessTokens.delete(e),await this.saveSettings(),this.invalidateCalendarCache()}async refreshGoogleCalendars(e,t){let a=t!=null?t:await this.fetchGoogleCalendarList(await this.getGoogleAccessToken(e.id)),r=new Map(this.settings.calendarSources.map(n=>[n.id,n]));this.settings.calendarSources=[...this.settings.calendarSources.filter(n=>n.provider!=="google"||n.accountName!==e.id),...a.map(n=>{var o,l;let s=`google:${e.id}:${n.id}`;return{id:s,href:n.id,displayName:n.summaryOverride||n.summary,accountName:e.id,provider:"google",color:n.backgroundColor||"#4285f4",writable:n.accessRole==="owner"||n.accessRole==="writer",enabled:(l=(o=r.get(s))==null?void 0:o.enabled)!=null?l:!0}})]}async getGoogleAccessToken(e){let t=this.googleAccessTokens.get(e);if(t&&t.expiresAt>Date.now())return t.token;let a=this.settings.googleAccounts.find(d=>d.id===e);if(!a)throw new Error("Google account is disconnected.");let r=this.app.secretStorage.getSecret(U)||await B(this.app,"Enter Google sync passphrase","Enter the passphrase used to encrypt this Google Calendar account.");if(!r)throw new Error("Google sync passphrase is required.");this.app.secretStorage.setSecret(U,r);let n;try{n=await Oe(a.encryptedRefreshToken,r,a.tokenSalt,a.tokenIv)}catch(d){throw new Error("The Google sync passphrase is incorrect.")}let s=await this.getGoogleClientSecret(),o=await(0,u.requestUrl)({url:"https://oauth2.googleapis.com/token",method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:Q,client_secret:s,refresh_token:n,grant_type:"refresh_token"}).toString(),throw:!1});if(o.status>=400)throw new Error("Google authorization expired. Reconnect this account.");let l=o.json;return this.googleAccessTokens.set(e,{token:l.access_token,expiresAt:Date.now()+l.expires_in*1e3-6e4}),l.access_token}async getGoogleClientSecret(){let e=this.app.secretStorage.getSecret(X);if(e)return e;let t=await B(this.app,"Google OAuth client secret","Paste the client secret for the Anchor Desktop OAuth client. It is stored only in Obsidian SecretStorage and is never written to plugin settings.","Client secret","Paste Google OAuth client secret","Google OAuth client secret is required.");if(!t)throw new Error("Google OAuth client secret is required.");return this.app.secretStorage.setSecret(X,t),t}async replaceGoogleClientSecret(){let e=await B(this.app,"Replace Google OAuth client secret","Paste the active client secret for the Anchor Desktop OAuth client. The previous locally stored value will be replaced.","Client secret","Paste Google OAuth client secret","Google OAuth client secret is required.");return e?(this.app.secretStorage.setSecret(X,e),this.googleAccessTokens.clear(),!0):!1}async fetchGoogleCalendarList(e){var a;return(a=(await this.googleRequest("https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=250","GET",e)).items)!=null?a:[]}async fetchGoogleEvents(e,t,a){var o;let r=await this.getGoogleAccessToken(e.accountName),n=new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(e.href)}/events`);return n.search=new URLSearchParams({timeMin:t.toISOString(),timeMax:a.toISOString(),singleEvents:"true",orderBy:"startTime",maxResults:"2500"}).toString(),((o=(await this.googleRequest(n.toString(),"GET",r)).items)!=null?o:[]).filter(l=>l.status!=="cancelled").map(l=>{var g,f,m,b,v;let d=((g=l.start)==null?void 0:g.dateTime)||((f=l.start)==null?void 0:f.date),h=((m=l.end)==null?void 0:m.dateTime)||((b=l.end)==null?void 0:b.date),p=!!((v=l.start)!=null&&v.date);return{uid:l.iCalUID||l.id,href:l.id,etag:l.etag||"",title:l.summary||"",start:p?me(d):new Date(d),end:p?me(h):new Date(h),allDay:p,location:l.location||"",notes:l.description||"",repeat:"none",repeatUntil:"",exceptionDates:[],rawIcs:JSON.stringify(l),calendarName:e.displayName,calendarId:e.id,accountName:e.accountName,provider:"google",color:e.color,writable:e.writable}})}async saveGoogleEvent(e,t){let a=await this.getGoogleAccessToken(e.accountName),r=Ee(t),n={summary:t.title,location:t.location||void 0,description:t.notes||void 0,start:t.allDay?{date:t.date}:{dateTime:r.start.toISOString()},end:t.allDay?{date:He(r.end)}:{dateTime:r.end.toISOString()}},s=Ce(t);s&&(n.recurrence=[`RRULE:${s}`]);let o=`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(e.href)}/events`;await this.googleRequest(t.href?`${o}/${encodeURIComponent(t.href)}`:o,t.href?"PUT":"POST",a,n),this.settings.defaultCalendarId=e.id,await this.saveSettings(),this.invalidateCalendarCache(),new u.Notice("Calendar event saved.")}async googleRequest(e,t,a,r){let n=await(0,u.requestUrl)({url:e,method:t,headers:{Authorization:`Bearer ${a}`,...r?{"Content-Type":"application/json"}:{}},body:r?JSON.stringify(r):void 0,throw:!1});if(n.status===401)throw new Error(this.googleResponseError(n,"Google authorization expired. Reconnect this account."));if(n.status===403)throw new Error(this.googleResponseError(n,"Google Calendar permission was denied."));if(n.status===429)throw new Error("Google Calendar rate limit reached. Try again later.");if(n.status>=400)throw new Error(this.googleResponseError(n,`Google Calendar request failed with status ${n.status}.`));return n.status===204||!n.text?{}:n.json}googleResponseError(e,t){var n;let a=e.json,r=(a==null?void 0:a.error_description)||(typeof(a==null?void 0:a.error)=="string"?a.error:(n=a==null?void 0:a.error)==null?void 0:n.message);return r&&!t.includes(r)?`${t} ${r}`:t}async discoverCalendars(){let e=ye(this.settings.calendarServerUrl),t=await this.caldavRequest(e,"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${H}">
  <d:prop>
    <d:current-user-principal />
  </d:prop>
</d:propfind>`,{Depth:"0"}),a=F(t.text),r=ge(a,"current-user-principal");if(!r)throw new Error("CalDAV server did not return a principal URL.");let n=await this.caldavRequest(O(e,r),"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${H}" xmlns:c="${Y}" xmlns:a="http://apple.com/ns/ical/">
  <d:prop>
    <c:calendar-home-set />
  </d:prop>
</d:propfind>`,{Depth:"0"}),s=F(n.text),o=ge(s,"calendar-home-set");if(!o)throw new Error("CalDAV server did not return a calendar home.");let l=O(e,o),d=await this.caldavRequest(l,"PROPFIND",`<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="${H}" xmlns:c="${Y}" xmlns:a="http://apple.com/ns/ical/">
  <d:prop>
    <d:displayname />
    <d:resourcetype />
    <d:current-user-privilege-set />
    <c:supported-calendar-component-set />
    <a:calendar-color />
  </d:prop>
</d:propfind>`,{Depth:"1"}),h=F(d.text);return T(h,"response").map(p=>{let g=A(p,"href"),f=T(p,"resourcetype")[0],m=!!(f&&T(f,"calendar").length),b=T(p,"comp").map(C=>{var P;return((P=C.getAttribute("name"))!=null?P:"").toUpperCase()}),v=!b.length||b.includes("VEVENT"),y=T(p,"current-user-privilege-set")[0],w=y?T(y,"privilege").flatMap(C=>Array.from(C.children).map(P=>P.localName)):[],E=!w.length||w.some(C=>["write","write-content","bind","unbind"].includes(C));if(!g||!m||!v)return null;let D=O(l,g);return{id:`icloud:${D}`,href:D,displayName:A(p,"displayname")||"Calendar",accountName:this.settings.calendarUsername,provider:"icloud",color:A(p,"calendar-color").slice(0,7)||"#8b5cf6",writable:E,enabled:!0}}).filter(p=>p!==null)}async caldavRequest(e,t,a="",r={}){let n=await(0,u.requestUrl)({url:e,method:t,body:a,throw:!1,headers:{Authorization:`Basic ${btoa(`${this.settings.calendarUsername}:${this.settings.calendarPassword}`)}`,"Content-Type":"application/xml; charset=utf-8",...r}});if(n.status>=400)throw n.status===401||n.status===403?new Error("Calendar authentication failed. Check your Apple ID and app-specific password."):n.status===405?new Error("This calendar does not allow that sync action. Choose a normal writable iCloud calendar."):n.status===409||n.status===412?new Error("This event changed remotely. Refresh Home Base and try again."):n.status===400?new Error("iCloud rejected the CalDAV request as malformed. Check the server URL and try again."):new Error(`CalDAV request failed with status ${n.status}.`);return n}readableCalendarError(e){return e instanceof Error?e.message:"Calendar sync failed."}async ensureDefaultFiles(){await this.ensureFile(this.settings.todoInboxPath,fe),await this.ensureFile(this.settings.workoutPlanPath,ie),await this.ensureFile(this.settings.workoutLogPath,be)}async ensureFile(e,t){let a=(0,u.normalizePath)(e),r=this.app.vault.getAbstractFileByPath(a);if(r instanceof u.TFile)return;if(r)throw new Error(`Expected a file path but found a folder: ${a}`);let n=a.split("/").slice(0,-1).join("/");n&&await this.ensureFolder(n),await this.app.vault.create(a,t)}async ensureFolder(e){let t=(0,u.normalizePath)(e).split("/"),a="";for(let r of t){a=a?`${a}/${r}`:r;let n=this.app.vault.getAbstractFileByPath(a);if(n instanceof u.TFile)throw new Error(`Expected a folder path but found a file: ${a}`);n||await this.app.vault.createFolder(a)}}injectStyles(){var e;(e=this.styleEl)==null||e.remove(),this.styleEl=document.createElement("style"),this.styleEl.id="home-base-runtime-styles",this.styleEl.textContent=Ye+Qe,document.head.appendChild(this.styleEl)}},_=class extends u.ItemView{constructor(e,t){super(e);this.renderGeneration=0;this.plugin=t}getViewType(){return R}getDisplayText(){return"Home Base"}getIcon(){return"home"}async onOpen(){this.render()}async onClose(){this.renderGeneration+=1,this.calendarHost=void 0}render(e=!1){let t=++this.renderGeneration,a=this.containerEl.children[1];a.empty(),a.addClass("home-base-view"),this.renderHeader(a);let r=a.createDiv({cls:"home-base-grid"}),n=r.createDiv({cls:"home-base-column home-base-left"}),s=r.createDiv({cls:"home-base-column home-base-right"});this.calendarHost=n.createDiv();let o=n.createDiv(),l=s.createDiv();this.renderLoadingPanel(o,"Fit","Workout","Loading workout..."),this.renderLoadingPanel(l,"Task","Todo Manager","Loading todos..."),this.refreshCalendar(e),this.loadTodos().then(d=>{t!==this.renderGeneration||!l.isConnected||(l.empty(),this.renderTodos(l,d))}).catch(d=>{t!==this.renderGeneration||!l.isConnected||this.renderPanelError(l,"Task","Todo Manager","Todos could not load",d)}),Promise.all([this.loadWorkoutPlan(),this.loadWorkoutLog()]).then(([d,h])=>{t!==this.renderGeneration||!o.isConnected||(o.empty(),this.renderWorkout(o,d,this.getWorkoutState(d,h)))}).catch(d=>{t!==this.renderGeneration||!o.isConnected||this.renderPanelError(o,"Fit","Workout","Workout could not load",d)})}async refreshCalendar(e){let t=this.renderGeneration,a=this.calendarHost;if(!a)return;let r=this.startOfDay(new Date),n=this.addDays(r,8),s=this.plugin.getCachedCalendarEvents(r,n),o=s?e||!this.plugin.isCalendarCacheFresh(r,n)?"refreshing":s.status:"loading";a.empty(),this.renderCalendar(a,s?{...s,status:o}:{events:[],error:"",errors:[],setupRequired:!1,sourceCount:0,status:o});try{let l=await this.plugin.refreshCalendarEvents(r,n,e);if(t!==this.renderGeneration||!a.isConnected)return;a.empty(),this.renderCalendar(a,l)}catch(l){if(t!==this.renderGeneration||!a.isConnected)return;let d=l instanceof Error?l.message:"Calendar could not sync.";a.empty(),this.renderCalendar(a,s?{...s,error:"",errors:[d],status:"error"}:{events:[],error:d,errors:[d],setupRequired:!1,sourceCount:0,status:"error"})}}renderLoadingPanel(e,t,a,r){let n=e.createDiv({cls:"home-base-panel"}),s=n.createDiv({cls:"home-base-panel-title"});s.createEl("span",{cls:"home-base-icon",text:t}),s.createEl("h2",{text:a}),n.createEl("p",{cls:"home-base-muted home-base-italic",text:r})}renderPanelError(e,t,a,r,n){e.empty();let s=e.createDiv({cls:"home-base-panel"}),o=s.createDiv({cls:"home-base-panel-title"});o.createEl("span",{cls:"home-base-icon",text:t}),o.createEl("h2",{text:a});let l=s.createDiv({cls:"home-base-calendar-error"});l.createEl("strong",{text:r}),l.createEl("p",{text:n instanceof Error?n.message:"Try refreshing Home Base."})}renderHeader(e){let t=e.createDiv({cls:"home-base-header"}),a=new Date,r=t.createDiv();r.createEl("h1",{text:"Home Base"}),r.createDiv({cls:"home-base-date",text:a.toLocaleDateString(void 0,{weekday:"long",year:"numeric",month:"long",day:"numeric"})}),r.createDiv({cls:"home-base-greeting",text:this.getGreeting()});let n=t.createEl("button",{cls:"home-base-icon-button",attr:{"aria-label":"Refresh"}});n.setText("Refresh"),n.onClickEvent(()=>this.render(!0))}renderCalendar(e,t){let a=e.createDiv({cls:"home-base-panel home-base-calendar-panel"}),r=a.createDiv({cls:"home-base-panel-title"});r.createEl("span",{cls:"home-base-icon",text:"Cal"}),r.createEl("h2",{text:"Calendar"}),t.sourceCount&&r.createEl("span",{cls:"home-base-pill",text:`${t.sourceCount} calendar${t.sourceCount===1?"":"s"}`}),(t.status==="loading"||t.status==="refreshing")&&r.createEl("span",{cls:"home-base-pill",text:t.status==="loading"?"Loading":"Refreshing"});let n=a.createDiv({cls:"home-base-calendar-controls"}),s=n.createEl("button",{cls:"mod-cta home-base-primary-button",text:"+ Event"});s.disabled=t.status==="loading"||t.setupRequired||!!t.error,s.onClickEvent(()=>{new I(this.app,this.plugin,void 0,()=>this.render(!0)).open()});let o=n.createEl("button",{cls:"home-base-secondary-button",text:"Refresh"});if(o.disabled=t.status==="loading"||t.status==="refreshing",o.onClickEvent(()=>void this.refreshCalendar(!0)),n.createEl("button",{cls:"home-base-secondary-button",text:"Open Calendar"}).onClickEvent(()=>void this.plugin.openCalendar()),t.status==="loading"){a.createEl("p",{cls:"home-base-muted home-base-italic",text:"Loading iCloud and Google calendars..."});return}if(t.setupRequired){let m=a.createDiv({cls:"home-base-schedule-empty"});m.createDiv({cls:"home-base-calendar-mark",text:"Cal"});let b=m.createDiv();b.createEl("strong",{text:"Connect a calendar"}),b.createEl("p",{text:"Enable Calendar in Home Base settings, then connect iCloud/CalDAV or Google Calendar."});return}if(t.error&&!t.events.length){let m=a.createDiv({cls:"home-base-calendar-error"});m.createEl("strong",{text:"Calendar could not sync"}),m.createEl("p",{text:t.error});return}if(t.errors.length){let m=a.createDiv({cls:"home-base-calendar-error"});m.createEl("strong",{text:"Some calendars could not sync"}),m.createEl("p",{text:t.errors.join(" \xB7 ")})}let d=this.startOfDay(new Date),h=this.addDays(d,1),p=this.addDays(d,7),g=t.events.filter(m=>this.eventOccursOn(m,d)),f=t.events.filter(m=>{let b=this.startOfDay(m.start);return b>=h&&b<=p});this.renderCalendarGroup(a,"Today",g,"No events today"),this.renderCalendarGroup(a,"Next 7 Days",f,"No upcoming events")}renderCalendarGroup(e,t,a,r){let n=e.createDiv({cls:"home-base-calendar-group"});if(n.createEl("h3",{text:t}),!a.length){n.createEl("p",{cls:"home-base-muted home-base-italic",text:r});return}for(let s of a)this.renderCalendarEvent(n,s)}renderCalendarEvent(e,t){let a=e.createDiv({cls:"home-base-calendar-event"}),r=a.createDiv({cls:"home-base-calendar-time",text:this.formatCalendarEventTime(t)});t.allDay&&r.addClass("is-all-day");let n=a.createDiv({cls:"home-base-calendar-body"}),s=n.createDiv({cls:"home-base-calendar-title"}),o=s.createSpan({cls:"home-base-calendar-source-dot"});o.style.backgroundColor=t.color,s.createSpan({text:t.title||"Untitled event"});let l=n.createDiv({cls:"home-base-calendar-meta"});if(l.createEl("span",{text:t.calendarName}),this.eventOccursOn(t,this.startOfDay(new Date))||l.createEl("span",{text:this.formatCalendarDate(t.start)}),t.location&&l.createEl("span",{text:t.location}),t.repeat!=="none"&&l.createEl("span",{text:this.formatRepeatLabel(t.repeat)}),!t.writable)return;let d=a.createDiv({cls:"home-base-actions"});d.createEl("button",{cls:"home-base-ghost-button",text:"Edit"}).onClickEvent(()=>new I(this.app,this.plugin,t,()=>this.render(!0)).open()),d.createEl("button",{cls:"home-base-ghost-button",text:"Delete"}).onClickEvent(async()=>{if(!confirm(`Delete "${t.title||"Untitled event"}"?`))return;let f=t.repeat!=="none"&&confirm("Delete only this event? Press Cancel to delete the whole repeating series.");await this.plugin.deleteCalendarEvent(t,f),this.render(!0)})}renderTodos(e,t){let a=e.createDiv({cls:"home-base-panel home-base-todo-panel"}),r=a.createDiv({cls:"home-base-panel-title home-base-todo-title"});r.createEl("span",{cls:"home-base-icon",text:"Task"}),r.createEl("h2",{text:"Todo Manager"}),a.createDiv({cls:"home-base-todo-controls"}).createEl("button",{cls:"mod-cta home-base-primary-button",text:"+ New Todo"}).onClickEvent(()=>{new z(this.app,this.plugin,void 0,()=>void this.render()).open()});let o=this.groupTodos(t);for(let l of["Overdue","Today","Tomorrow","Next 7 Days","No Due Date","Later"]){let d=o[l];if(!d.length&&l==="Later")continue;let h=a.createDiv({cls:"home-base-todo-group"});if(h.createEl("h3",{text:l}),!d.length){h.createEl("p",{cls:"home-base-muted home-base-italic",text:l==="Tomorrow"?"No todos due tomorrow":`No todos in ${l.toLowerCase()}`});continue}for(let p of d)this.renderTodoItem(h,p)}}renderTodoItem(e,t){let a=e.createDiv({cls:`home-base-todo-item ${t.completed?"is-complete":""}`}),r=a.createEl("input",{cls:"home-base-checkbox"});r.type="checkbox",r.checked=t.completed,r.onClickEvent(async()=>{await this.setTodoCompletion(t,r.checked),await this.render()});let n=a.createDiv({cls:"home-base-todo-body"});n.createDiv({cls:"home-base-todo-name",text:t.title});let s=n.createDiv({cls:"home-base-todo-meta"});s.createEl("span",{cls:"home-base-due",text:t.due?this.formatDue(t.due):"No due date"}),t.priority&&s.createEl("span",{cls:`home-base-priority is-${t.priority}`,text:this.capitalize(t.priority)});for(let h of t.tags)s.createEl("span",{cls:"home-base-tag",text:h});let o=a.createDiv({cls:"home-base-actions"});o.createEl("button",{cls:"home-base-ghost-button",text:"Edit"}).onClickEvent(()=>new z(this.app,this.plugin,t,()=>void this.render()).open()),o.createEl("button",{cls:"home-base-ghost-button",text:"Delete"}).onClickEvent(async()=>{await this.deleteTodo(t),await this.render()})}renderWorkout(e,t,a){var g;let r=e.createDiv({cls:"home-base-panel"}),n=r.createDiv({cls:"home-base-panel-title"});if(n.createEl("span",{cls:"home-base-icon",text:"Fit"}),n.createEl("h2",{text:"Workout"}),a.unresolved){let f=r.createDiv({cls:"home-base-unresolved"});f.createDiv({text:`Yesterday's workout was not resolved: ${a.unresolved.workout}`});let m=f.createDiv({cls:"home-base-unresolved-actions"});m.createEl("button",{text:"Mark Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(a.unresolved.date,a.unresolved.workout,"done"),await this.render()}),m.createEl("button",{text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(a.unresolved.date,a.unresolved.workout,"skipped"),await this.render()}),m.createEl("button",{text:"Keep Pending"}).onClickEvent(async()=>{new u.Notice("Kept as pending.")})}r.createEl("h3",{text:"Today's Workout"}),r.createEl("div",{cls:"home-base-workout-name",text:a.todayWorkout});let s=(g=t.types[a.todayWorkout])!=null?g:[];if(s.length){let f=r.createEl("ul",{cls:"home-base-exercises"});for(let m of s)f.createEl("li",{text:m})}else r.createEl("p",{cls:"home-base-muted",text:"No exercises configured for this workout."});r.createEl("button",{cls:"home-base-wide-button",text:"Edit Routine"}).onClickEvent(()=>{new se(this.app,this.plugin,t,()=>void this.render()).open()});let l=r.createDiv({cls:"home-base-workout-actions"});l.createEl("button",{cls:"mod-cta home-base-primary-button",text:"Done"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),a.todayWorkout,"done"),await this.render()}),l.createEl("button",{cls:"home-base-secondary-button",text:"Skip"}).onClickEvent(async()=>{await this.appendWorkoutLog(this.todayKey(),a.todayWorkout,"skipped"),await this.render()});let p=r.createDiv({cls:"home-base-sequence"});p.createEl("h3",{text:"Routine Sequence"}),p.createDiv({text:t.sequence.length?t.sequence.join(" > "):"No sequence configured"})}async loadTodos(){let e=this.plugin.settings.todoScanFolders.split(",").map(r=>(0,u.normalizePath)(r.trim())).filter(Boolean),t=this.app.vault.getMarkdownFiles().filter(r=>e.length?e.some(n=>r.path===n||r.path.startsWith(`${n}/`)):!0),a=[];for(let r of t)(await this.app.vault.cachedRead(r)).split(`
`).forEach((o,l)=>{let d=this.parseTodoLine(o,r,l);d&&a.push(d)});return a.sort((r,n)=>this.compareTodos(r,n))}parseTodoLine(e,t,a){var h,p,g,f;let r=e.match(/^\s*[-*]\s+\[( |x|X)]\s+(.+)$/);if(!r)return null;let n=r[1].toLowerCase()==="x",s=r[2].trim(),o=s.match(/\sdue::\s*(\d{4}-\d{2}-\d{2})/),l=s.match(/\spriority::\s*(high|medium|low)/i),d=(h=s.match(/#[\w/-]+/g))!=null?h:[];return s=s.replace(/\sdue::\s*\d{4}-\d{2}-\d{2}/,"").replace(/\spriority::\s*(high|medium|low)/i,"").replace(/#[\w/-]+/g,"").trim(),{id:`${t.path}:${a}`,title:s,due:(p=o==null?void 0:o[1])!=null?p:"",priority:(f=(g=l==null?void 0:l[1])==null?void 0:g.toLowerCase())!=null?f:"",tags:d,completed:n,file:t,line:a,raw:e}}groupTodos(e){let t={Overdue:[],Today:[],Tomorrow:[],"Next 7 Days":[],"No Due Date":[],Later:[]},a=this.startOfDay(new Date),r=this.addDays(a,1),n=this.addDays(a,7);for(let s of e.filter(o=>!o.completed)){if(!s.due){t["No Due Date"].push(s);continue}let o=this.parseDate(s.due);o<a?t.Overdue.push(s):o.getTime()===a.getTime()?t.Today.push(s):o.getTime()===r.getTime()?t.Tomorrow.push(s):o<=n?t["Next 7 Days"].push(s):t.Later.push(s)}return t}async loadWorkoutPlan(){await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,ie);let e=this.app.vault.getAbstractFileByPath((0,u.normalizePath)(this.plugin.settings.workoutPlanPath));if(!(e instanceof u.TFile))return{types:{},sequence:[]};let a=(await this.app.vault.cachedRead(e)).split(`
`),r={},n=[],s="",o="";for(let l of a){let d=l.trim();if(/^#\s+Workout Types/i.test(d)){s="types",o="";continue}if(/^#\s+Sequence/i.test(d)){s="sequence",o="";continue}if(s==="types"&&d.startsWith("## ")){o=d.replace(/^##\s+/,"").trim(),r[o]=[];continue}if(s==="types"&&o){let h=d.replace(/^[-*]\s+/,"").trim();h&&r[o].push(h)}s==="sequence"&&/^[-*]\s+/.test(d)&&n.push(d.replace(/^[-*]\s+/,"").trim())}return{types:r,sequence:n}}async loadWorkoutLog(){await this.plugin.ensureFile(this.plugin.settings.workoutLogPath,be);let e=this.app.vault.getAbstractFileByPath((0,u.normalizePath)(this.plugin.settings.workoutLogPath));return e instanceof u.TFile?(await this.app.vault.cachedRead(e)).split(`
`).map(a=>{var o,l,d,h;let r=(o=a.match(/date::\s*(\d{4}-\d{2}-\d{2})/))==null?void 0:o[1],n=(d=(l=a.match(/workout::\s*([^]+?)\s+status::/))==null?void 0:l[1])==null?void 0:d.trim(),s=(h=a.match(/status::\s*(done|skipped|pending)/))==null?void 0:h[1];return!r||!n||!s?null:{date:r,workout:n,status:s}}).filter(a=>!!a):[]}getWorkoutState(e,t){let a=e.sequence.length?e.sequence:Object.keys(e.types),r=t.filter(d=>d.status==="done").length,n=a.length?a[r%a.length]:"No workout configured",s=this.dateKey(this.addDays(new Date,-1)),l=t.filter(d=>d.date===s).length?null:{date:s,workout:n};return{todayWorkout:n,unresolved:l}}async appendWorkoutLog(e,t,a){let r=this.app.vault.getAbstractFileByPath((0,u.normalizePath)(this.plugin.settings.workoutLogPath));if(!(r instanceof u.TFile))return;let n=await this.app.vault.cachedRead(r),s=`- date:: ${e} workout:: ${t} status:: ${a}`;await this.app.vault.modify(r,`${n.trimEnd()}
${s}
`),new u.Notice(`Workout marked ${a}.`)}async setTodoCompletion(e,t){let r=(await this.app.vault.cachedRead(e.file)).split(`
`);r[e.line]=e.raw.replace(/\[( |x|X)]/,t?"[x]":"[ ]"),await this.app.vault.modify(e.file,r.join(`
`))}async deleteTodo(e){if(!confirm(`Delete "${e.title}"?`))return;let r=(await this.app.vault.cachedRead(e.file)).split(`
`);r.splice(e.line,1),await this.app.vault.modify(e.file,r.join(`
`))}compareTodos(e,t){let a=e.due||"9999-12-31",r=t.due||"9999-12-31";if(a!==r)return a.localeCompare(r);let n={high:0,medium:1,low:2,"":3};return n[e.priority]-n[t.priority]}formatDue(e){let t=this.todayKey();return e===t?"Today":e===this.dateKey(this.addDays(new Date,1))?"Tomorrow":new Date(`${e}T00:00:00`).toLocaleDateString(void 0,{month:"short",day:"numeric"})}eventOccursOn(e,t){let a=this.startOfDay(e.start),r=this.startOfDay(e.allDay?this.addDays(e.end,-1):e.end);return a<=t&&r>=t}formatCalendarEventTime(e){if(e.allDay)return"All day";let t=e.start.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),a=e.end.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"});return`${t} - ${a}`}formatCalendarDate(e){return e.toLocaleDateString(void 0,{weekday:"short",month:"short",day:"numeric"})}formatRepeatLabel(e){return{none:"",daily:"Repeats daily",weekdays:"Repeats weekdays",weekly:"Repeats weekly",monthly:"Repeats monthly",yearly:"Repeats yearly"}[e]}getGreeting(){let e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"}parseDate(e){return new Date(`${e}T00:00:00`)}startOfDay(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}addDays(e,t){let a=new Date(e);return a.setDate(a.getDate()+t),this.startOfDay(a)}todayKey(){return this.dateKey(new Date)}dateKey(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}capitalize(e){return e.charAt(0).toUpperCase()+e.slice(1)}},j=class extends u.ItemView{constructor(e,t){super(e);this.mode="month";this.selectedDate=this.startOfDay(new Date);this.renderGeneration=0;this.plugin=t}getViewType(){return V}getDisplayText(){return"Home Base Calendar"}getIcon(){return"calendar-days"}async onOpen(){await this.refresh(!1)}async onClose(){this.renderGeneration+=1}async refresh(e=!1){let t=++this.renderGeneration,{start:a,end:r}=this.visibleRange(),n=this.plugin.getCachedCalendarEvents(a,r),s=n?e||!this.plugin.isCalendarCacheFresh(a,r)?"refreshing":n.status:"loading";this.render(n?{...n,status:s}:{events:[],error:"",errors:[],setupRequired:!1,sourceCount:0,status:s});try{let o=await this.plugin.refreshCalendarEvents(a,r,e);if(t!==this.renderGeneration)return;this.render(o)}catch(o){if(t!==this.renderGeneration)return;let l=o instanceof Error?o.message:"Calendar could not sync.";this.render(n?{...n,error:"",errors:[l],status:"error"}:{events:[],error:l,errors:[l],setupRequired:!1,sourceCount:0,status:"error"})}}render(e){let t=this.containerEl.children[1];t.empty(),t.addClass("home-base-calendar-view"),this.renderHeader(t,e);let a=t.createDiv({cls:"home-base-calendar-layout"});this.renderSidebar(a);let r=a.createDiv({cls:"home-base-calendar-main"});if(e.setupRequired){let n=r.createDiv({cls:"home-base-calendar-empty"});n.createEl("h2",{text:"Connect a calendar"}),n.createEl("p",{text:"Enable Calendar in Home Base settings, then connect iCloud/CalDAV or Google Calendar."});return}if(e.error&&!e.events.length){let n=r.createDiv({cls:"home-base-calendar-error"});n.createEl("strong",{text:"Calendar could not sync"}),n.createEl("p",{text:e.error});return}if(e.errors.length){let n=r.createDiv({cls:"home-base-calendar-error"});n.createEl("strong",{text:"Some calendars could not sync"}),n.createEl("p",{text:e.errors.join(" \xB7 ")})}e.status==="loading"&&!e.events.length&&r.createDiv({cls:"home-base-calendar-loading",text:"Loading iCloud and Google calendars\u2026"}),this.mode==="month"?this.renderMonth(r,e.events):this.renderTimeView(r,e.events)}renderHeader(e,t){let a=e.createDiv({cls:"home-base-calendar-header"}),r=a.createDiv({cls:"home-base-calendar-heading"});r.createEl("h1",{text:this.rangeTitle()});let n=r.createDiv({cls:"home-base-calendar-heading-meta"});n.createSpan({text:"Home Base Calendar"}),t.sourceCount&&n.createSpan({text:`${t.sourceCount} visible`}),(t.status==="loading"||t.status==="refreshing")&&n.createSpan({cls:"home-base-pill",text:t.status==="loading"?"Loading":"Refreshing"});let s=a.createDiv({cls:"home-base-calendar-header-controls"}),o=s.createDiv({cls:"home-base-calendar-navigation"});this.iconButton(o,"chevron-left","Previous period",()=>this.navigate(-1)),o.createEl("button",{cls:"home-base-secondary-button",text:"Today"}).onClickEvent(()=>{this.selectedDate=this.startOfDay(new Date),this.refresh(!1)}),this.iconButton(o,"chevron-right","Next period",()=>this.navigate(1));let d=s.createDiv({cls:"home-base-calendar-mode-switch",attr:{role:"group","aria-label":"Calendar view"}});for(let f of["month","week","day"])d.createEl("button",{text:f.charAt(0).toUpperCase()+f.slice(1),cls:f===this.mode?"is-selected":"",attr:{"aria-pressed":f===this.mode?"true":"false"}}).onClickEvent(()=>{this.mode!==f&&(this.mode=f,this.refresh(!1))});let h=s.createDiv({cls:"home-base-calendar-header-actions"}),p=h.createEl("button",{cls:"home-base-secondary-button",text:"Refresh"});p.disabled=t.status==="loading"||t.status==="refreshing",p.onClickEvent(()=>void this.refresh(!0));let g=h.createEl("button",{cls:"mod-cta home-base-primary-button",text:"+ Event"});g.disabled=!this.plugin.settings.calendarSources.some(f=>f.writable),g.onClickEvent(()=>this.openNewEvent(this.defaultNewEventDate(),!1))}renderSidebar(e){let t=e.createEl("details",{cls:"home-base-calendar-sidebar"});t.open=!0,t.createEl("summary",{text:"Calendars"});let a=t.createDiv({cls:"home-base-calendar-sidebar-content"}),r=[{provider:"icloud",label:"iCloud"},{provider:"google",label:"Google"}];for(let{provider:n,label:s}of r){let o=this.plugin.settings.calendarSources.filter(p=>p.provider===n);if(!o.length)continue;let l=a.createDiv({cls:"home-base-calendar-provider"}),d=l.createDiv({cls:"home-base-calendar-provider-title"}),h=d.createSpan();(0,u.setIcon)(h,n==="icloud"?"cloud":"calendar-days"),d.createEl("h2",{text:s});for(let p of o){let g=l.createEl("label",{cls:"home-base-calendar-source"}),f=g.createEl("input",{attr:{type:"checkbox","aria-label":`Show ${p.displayName} from ${s}`}});f.checked=p.enabled;let m=g.createSpan({cls:"home-base-calendar-source-dot"});m.style.backgroundColor=p.color;let b=g.createSpan({cls:"home-base-calendar-source-copy"});b.createSpan({cls:"home-base-calendar-source-name",text:p.displayName}),b.createSpan({cls:"home-base-calendar-source-account",text:`${p.accountName||s} \xB7 ${p.writable?"Writable":"Read only"}`}),f.addEventListener("change",()=>void this.plugin.setCalendarEnabled(p.id,f.checked))}}this.plugin.settings.calendarSources.length||a.createEl("p",{cls:"home-base-muted",text:"No calendars discovered yet."})}renderMonth(e,t){let a=e.createDiv({cls:"home-base-month-calendar"}),r=a.createDiv({cls:"home-base-month-weekdays"});for(let l of["Sun","Mon","Tue","Wed","Thu","Fri","Sat"])r.createDiv({text:l});let n=a.createDiv({cls:"home-base-month-grid",attr:{role:"grid","aria-label":this.rangeTitle()}}),{start:s,end:o}=this.visibleRange();for(let l=new Date(s);l<o;l=this.addDays(l,1)){let d=new Date(l),h=d.getMonth()===this.selectedDate.getMonth(),p=this.sameDay(d,new Date),g=n.createDiv({cls:`home-base-month-day${h?"":" is-outside"}${p?" is-today":""}`,attr:{role:"gridcell",tabindex:"0","aria-label":d.toLocaleDateString(void 0,{weekday:"long",month:"long",day:"numeric",year:"numeric"})}});g.createEl("button",{cls:"home-base-month-day-number",text:String(d.getDate()),attr:{"aria-label":`Create event on ${this.fullDate(d)}`}}).onClickEvent(()=>this.openNewEvent(this.dateAt(d,9,0),!1)),g.addEventListener("keydown",v=>{v.key!=="Enter"&&v.key!==" "||(v.preventDefault(),this.openNewEvent(this.dateAt(d,9,0),!1))});let m=t.filter(v=>this.eventOccursOn(v,d)).sort((v,y)=>this.compareEvents(v,y)),b=g.createDiv({cls:"home-base-month-events"});for(let v of m.slice(0,3))this.renderMonthEvent(b,v,d);m.length>3&&b.createEl("button",{cls:"home-base-month-more",text:`+${m.length-3} more`,attr:{"aria-label":`Show all events on ${this.fullDate(d)}`}}).onClickEvent(y=>{y.stopPropagation(),this.selectedDate=d,this.mode="day",this.refresh(!1)}),g.addEventListener("click",v=>{(v.target===g||v.target===b)&&this.openNewEvent(this.dateAt(d,9,0),!1)})}}renderMonthEvent(e,t,a){let r=t.allDay||!this.sameDay(t.start,t.end)?"":t.start.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),n=e.createEl("button",{cls:"home-base-month-event",attr:{"aria-label":this.eventAriaLabel(t),title:this.eventAriaLabel(t)}});n.style.setProperty("--home-base-event-color",t.color),n.createSpan({cls:"home-base-month-event-provider",text:t.provider==="icloud"?"iCloud":"Google"}),r&&this.sameDay(t.start,a)&&n.createSpan({cls:"home-base-month-event-time",text:r}),n.createSpan({cls:"home-base-month-event-title",text:t.title||"Untitled event"}),n.onClickEvent(s=>{s.stopPropagation(),this.openEvent(t)})}renderTimeView(e,t){let{start:a,end:r}=this.visibleRange(),n=[];for(let m=new Date(a);m<r;m=this.addDays(m,1))n.push(new Date(m));let s=e.createDiv({cls:`home-base-time-calendar is-${this.mode}`}),o=s.createDiv({cls:"home-base-time-calendar-header"});o.createDiv({cls:"home-base-time-gutter"});let l=o.createDiv({cls:"home-base-time-day-headers"});l.style.setProperty("--home-base-calendar-days",String(n.length));for(let m of n){let b=l.createEl("button",{cls:`home-base-time-day-header${this.sameDay(m,new Date)?" is-today":""}`});b.createSpan({text:m.toLocaleDateString(void 0,{weekday:"short"})}),b.createEl("strong",{text:m.toLocaleDateString(void 0,{month:"short",day:"numeric"})}),b.onClickEvent(()=>{this.selectedDate=m,this.mode="day",this.refresh(!1)})}let d=s.createDiv({cls:"home-base-all-day-row"});d.createDiv({cls:"home-base-time-gutter",text:"all-day"});let h=d.createDiv({cls:"home-base-all-day-columns"});h.style.setProperty("--home-base-calendar-days",String(n.length));for(let m of n){let b=h.createDiv({cls:"home-base-all-day-column"});b.setAttribute("aria-label",`All-day events on ${this.fullDate(m)}`),b.addEventListener("click",y=>{y.target===b&&this.openNewEvent(this.dateAt(m,0,0),!0)});let v=t.filter(y=>this.isAllDayLaneEvent(y)&&this.eventOccursOn(y,m)).sort((y,w)=>this.compareEvents(y,w));for(let y of v)this.renderAllDayEvent(b,y)}let p=s.createDiv({cls:"home-base-calendar-time-scroll"}),g=p.createDiv({cls:"home-base-time-labels"});for(let m=0;m<24;m+=1)g.createDiv({text:new Date(2e3,0,1,m).toLocaleTimeString(void 0,{hour:"numeric"})});let f=p.createDiv({cls:"home-base-time-columns"});f.style.setProperty("--home-base-calendar-days",String(n.length));for(let m of n)this.renderTimeColumn(f,m,t);window.requestAnimationFrame(()=>{let m=this.sameDay(this.selectedDate,new Date)?Math.max(0,new Date().getHours()-2):8;p.scrollTop=m*64})}renderAllDayEvent(e,t){let a=e.createEl("button",{cls:"home-base-all-day-event",attr:{title:this.eventAriaLabel(t),"aria-label":this.eventAriaLabel(t)}});a.style.setProperty("--home-base-event-color",t.color),a.createSpan({cls:"home-base-calendar-provider-tag",text:t.provider==="icloud"?"iCloud":"Google"}),a.createSpan({text:t.title||"Untitled event"}),a.onClickEvent(r=>{r.stopPropagation(),this.openEvent(t)})}renderTimeColumn(e,t,a){let r=e.createDiv({cls:`home-base-time-day-column${this.sameDay(t,new Date)?" is-today":""}`});for(let s=0;s<48;s+=1){let o=Math.floor(s/2),l=s%2?30:0;r.createEl("button",{cls:"home-base-time-slot",attr:{"aria-label":`Create event on ${this.fullDate(t)} at ${this.timeLabel(o,l)}`}}).onClickEvent(()=>this.openNewEvent(this.dateAt(t,o,l),!1))}let n=this.layoutTimedEvents(a.filter(s=>!this.isAllDayLaneEvent(s)&&this.eventOccursOn(s,t)),t);for(let s of n){let o=r.createEl("button",{cls:"home-base-calendar-timed-event",attr:{title:this.eventAriaLabel(s.event),"aria-label":this.eventAriaLabel(s.event)}});o.style.setProperty("--home-base-event-color",s.event.color),o.style.top=`${s.start/1440*100}%`,o.style.height=`${Math.max(2.2,(s.end-s.start)/1440*100)}%`,o.style.left=`calc(${s.column/s.columns*100}% + 3px)`,o.style.width=`calc(${100/s.columns}% - 6px)`,o.createSpan({cls:"home-base-calendar-provider-tag",text:s.event.provider==="icloud"?"iCloud":"Google"}),o.createEl("strong",{text:s.event.title||"Untitled event"}),o.createSpan({text:this.eventTime(s.event)}),o.onClickEvent(l=>{l.stopPropagation(),this.openEvent(s.event)})}if(this.sameDay(t,new Date)){let s=new Date,o=s.getHours()*60+s.getMinutes(),l=r.createDiv({cls:"home-base-current-time"});l.style.top=`${o/1440*100}%`}}layoutTimedEvents(e,t){let a=this.startOfDay(t).getTime(),r=this.addDays(t,1).getTime(),n=e.map(o=>({event:o,start:Math.max(0,(Math.max(o.start.getTime(),a)-a)/6e4),end:Math.min(1440,(Math.min(o.end.getTime(),r)-a)/6e4)})).sort((o,l)=>o.start-l.start||o.end-l.end),s=[];for(let o=0;o<n.length;){let l=[],d=n[o].end;for(;o<n.length&&(!l.length||n[o].start<d);)l.push(n[o]),d=Math.max(d,n[o].end),o+=1;let h=[],p=[],g=1;for(let f of l){for(let v=h.length-1;v>=0;v-=1)h[v].end<=f.start&&h.splice(v,1);let m=new Set(h.map(v=>v.column)),b=0;for(;m.has(b);)b+=1;h.push({end:f.end,column:b}),p.push({...f,column:b}),g=Math.max(g,b+1)}s.push(...p.map(f=>({...f,columns:g})))}return s}visibleRange(){if(this.mode==="day"){let n=this.startOfDay(this.selectedDate);return{start:n,end:this.addDays(n,1)}}if(this.mode==="week"){let n=this.addDays(this.selectedDate,-this.selectedDate.getDay());return{start:n,end:this.addDays(n,7)}}let e=new Date(this.selectedDate.getFullYear(),this.selectedDate.getMonth(),1),t=new Date(this.selectedDate.getFullYear(),this.selectedDate.getMonth()+1,0),a=this.addDays(e,-e.getDay()),r=this.addDays(t,7-t.getDay());return{start:a,end:r}}rangeTitle(){if(this.mode==="month")return this.selectedDate.toLocaleDateString(void 0,{month:"long",year:"numeric"});if(this.mode==="day")return this.selectedDate.toLocaleDateString(void 0,{weekday:"long",month:"long",day:"numeric",year:"numeric"});let{start:e,end:t}=this.visibleRange(),a=this.addDays(t,-1);return e.getMonth()===a.getMonth()?`${e.toLocaleDateString(void 0,{month:"long",day:"numeric"})}\u2013${a.getDate()}, ${a.getFullYear()}`:`${e.toLocaleDateString(void 0,{month:"short",day:"numeric"})}\u2013${a.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}`}navigate(e){let t=new Date(this.selectedDate);this.mode==="month"?t.setMonth(t.getMonth()+e):t.setDate(t.getDate()+e*(this.mode==="week"?7:1)),this.selectedDate=this.startOfDay(t),this.refresh(!1)}iconButton(e,t,a,r){let n=e.createEl("button",{cls:"home-base-calendar-nav-button",attr:{"aria-label":a,title:a}});(0,u.setIcon)(n,t),n.onClickEvent(r)}openNewEvent(e,t){new I(this.app,this.plugin,void 0,()=>void this.refresh(!0),{initialDate:e,initialAllDay:t}).open()}openEvent(e){new I(this.app,this.plugin,e,()=>void this.refresh(!0),{readOnly:!e.writable}).open()}defaultNewEventDate(){return this.sameDay(this.selectedDate,new Date)?xe(new Date):this.dateAt(this.selectedDate,9,0)}isAllDayLaneEvent(e){return e.allDay||!this.sameDay(e.start,k(e.end,-1))}eventOccursOn(e,t){let a=this.startOfDay(e.start),r=this.startOfDay(e.allDay?this.addDays(e.end,-1):k(e.end,-1));return a<=t&&r>=t}compareEvents(e,t){return e.allDay!==t.allDay?e.allDay?-1:1:e.start.getTime()-t.start.getTime()||e.title.localeCompare(t.title)}eventAriaLabel(e){let t=e.provider==="icloud"?"iCloud":"Google";return`${e.title||"Untitled event"}, ${this.eventTime(e)}, ${e.calendarName}, ${t}${e.writable?"":", read only"}`}eventTime(e){if(e.allDay)return"All day";let t=e.start.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),a=e.end.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"});return`${t}\u2013${a}`}fullDate(e){return e.toLocaleDateString(void 0,{weekday:"long",month:"long",day:"numeric",year:"numeric"})}timeLabel(e,t){return new Date(2e3,0,1,e,t).toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"})}dateAt(e,t,a){return new Date(e.getFullYear(),e.getMonth(),e.getDate(),t,a,0,0)}startOfDay(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}addDays(e,t){let a=new Date(e);return a.setDate(a.getDate()+t),this.startOfDay(a)}sameDay(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}};function B(c,i,e,t="Passphrase",a="Enter passphrase",r="Google sync passphrase is required."){return new Promise(n=>{new re(c,i,e,t,a,r,n).open()})}var re=class extends u.Modal{constructor(e,t,a,r,n,s,o){super(e);this.title=t;this.description=a;this.fieldName=r;this.placeholder=n;this.requiredMessage=s;this.resolvePassphrase=o;this.value="";this.settled=!1}onOpen(){let{contentEl:e}=this;e.empty(),e.addClass("home-base-modal"),e.createEl("h2",{text:this.title}),e.createEl("p",{cls:"home-base-muted",text:this.description}),new u.Setting(e).setName(this.fieldName).addText(t=>{t.inputEl.type="password",t.inputEl.autocomplete="current-password",t.setPlaceholder(this.placeholder),t.onChange(a=>{this.value=a}),t.inputEl.addEventListener("keydown",a=>{a.key==="Enter"&&(a.preventDefault(),this.submit())}),window.setTimeout(()=>t.inputEl.focus(),0)}),new u.Setting(e).addButton(t=>{t.setButtonText("Cancel").onClick(()=>this.finish(null))}).addButton(t=>{t.setButtonText("Continue").setCta().onClick(()=>this.submit())})}onClose(){this.contentEl.empty(),this.settled||(this.settled=!0,this.resolvePassphrase(null))}submit(){if(!this.value){new u.Notice(this.requiredMessage);return}this.finish(this.value)}finish(e){this.settled||(this.settled=!0,this.resolvePassphrase(e),this.close())}},z=class extends u.Modal{constructor(e,t,a,r){super(e);this.titleValue="";this.dueValue="";this.priorityValue="medium";this.tagsValue="";this.plugin=t,this.todo=a,this.onSave=r,a&&(this.titleValue=a.title,this.dueValue=a.due,this.priorityValue=a.priority||"medium",this.tagsValue=a.tags.join(" "))}onOpen(){let{contentEl:e}=this;e.empty(),e.addClass("home-base-modal"),e.createEl("h2",{text:this.todo?"Edit Todo":"New Todo"}),new u.Setting(e).setName("Title").addText(t=>{t.setValue(this.titleValue),t.onChange(a=>{this.titleValue=a})}),new u.Setting(e).setName("Due date").addText(t=>{t.inputEl.type="date",t.setValue(this.dueValue),t.onChange(a=>{this.dueValue=a})}),new u.Setting(e).setName("Priority").addDropdown(t=>{t.addOption("high","High").addOption("medium","Medium").addOption("low","Low").setValue(this.priorityValue||"medium").onChange(a=>{this.priorityValue=a})}),new u.Setting(e).setName("Tags").setDesc("Use Markdown tags, for example #school #writing.").addText(t=>{t.setPlaceholder("#school #writing"),t.setValue(this.tagsValue),t.onChange(a=>{this.tagsValue=a})}),new u.Setting(e).addButton(t=>{t.setButtonText("Cancel").onClick(()=>this.close())}).addButton(t=>{t.setButtonText("Save").setCta().onClick(()=>void this.saveTodo())})}async saveTodo(){if(!this.titleValue.trim()){new u.Notice("Todo title is required.");return}let e=this.formatTodoLine();if(this.todo){let a=(await this.app.vault.cachedRead(this.todo.file)).split(`
`);a[this.todo.line]=e.replace("- [ ]",this.todo.completed?"- [x]":"- [ ]"),await this.app.vault.modify(this.todo.file,a.join(`
`))}else{await this.plugin.ensureFile(this.plugin.settings.todoInboxPath,fe);let t=this.app.vault.getAbstractFileByPath((0,u.normalizePath)(this.plugin.settings.todoInboxPath));if(!(t instanceof u.TFile))return;let a=await this.app.vault.cachedRead(t);await this.app.vault.modify(t,`${a.trimEnd()}
${e}
`)}this.close(),this.onSave()}formatTodoLine(){let e=this.tagsValue.split(/\s+/).filter(Boolean).map(n=>n.startsWith("#")?n:`#${n}`).join(" "),t=this.dueValue?` due:: ${this.dueValue}`:"",a=this.priorityValue?` priority:: ${this.priorityValue}`:"",r=e?` ${e}`:"";return`- [ ] ${this.titleValue.trim()}${t}${a}${r}`}},I=class extends u.Modal{constructor(e,t,a,r,n={}){super(e);this.titleValue="";this.dateValue="";this.startTimeValue="09:00";this.endTimeValue="10:00";this.allDayValue=!1;this.locationValue="";this.notesValue="";this.repeatValue="none";this.repeatUntilValue="";this.calendarIdValue="";this.readOnly=!1;this.durationMinutes=60;this.activeTimePicker=null;this.timeWheelDeltas=new WeakMap;this.outsideTimePickerHandler=e=>{var a,r;let t=e.target;t&&((a=this.timePickerPopover)!=null&&a.contains(t)||(r=this.activeTimeField)!=null&&r.contains(t)||this.closeTimePicker())};this.timePickerKeyHandler=e=>{e.key!=="Escape"||!this.activeTimePicker||(e.preventDefault(),e.stopPropagation(),this.closeTimePicker(!0))};this.timePickerResizeHandler=()=>this.positionTimePicker();if(this.plugin=t,this.event=a,this.onSave=r,this.readOnly=!!(n.readOnly||a&&!a.writable),a)this.calendarIdValue=a.calendarId,this.titleValue=a.title,this.dateValue=this.dateInputValue(a.start),this.startTimeValue=this.timeInputValue(a.start),this.endTimeValue=this.timeInputValue(a.end),this.allDayValue=a.allDay,this.locationValue=a.location,this.notesValue=a.notes,this.repeatValue=a.repeat,this.repeatUntilValue=a.repeatUntil,this.durationMinutes=Math.max(1,Math.round((a.end.getTime()-a.start.getTime())/6e4));else{this.calendarIdValue=t.settings.defaultCalendarId;let s=n.initialDate?new Date(n.initialDate):xe(new Date),o=k(s,this.durationMinutes);this.dateValue=this.dateInputValue(s),this.startTimeValue=this.timeInputValue(s),this.endTimeValue=this.timeInputValue(o),this.allDayValue=!!n.initialAllDay}}onOpen(){this.render()}onClose(){this.closeTimePicker()}render(){this.closeTimePicker();let{contentEl:e}=this;if(e.empty(),e.addClass("home-base-modal"),this.readOnly&&this.event){this.renderReadOnlyEvent(e,this.event);return}if(e.createEl("h2",{text:this.event?"Edit Event":"New Event"}),new u.Setting(e).setName("Title").addText(n=>{n.setValue(this.titleValue),n.onChange(s=>{this.titleValue=s})}),!this.event){let n=this.plugin.settings.calendarSources.filter(s=>s.writable);new u.Setting(e).setName("Calendar").setDesc("Choose where this event will be saved.").addDropdown(s=>{var o;for(let l of n)s.addOption(l.id,l.accountName?`${l.displayName} \u2014 ${l.accountName}`:l.displayName);s.setValue(this.calendarIdValue||((o=n[0])==null?void 0:o.id)||""),s.onChange(l=>{this.calendarIdValue=l})})}new u.Setting(e).setName("All day").addToggle(n=>{n.setValue(this.allDayValue),n.onChange(s=>{this.allDayValue=s,this.render()})}),new u.Setting(e).setName("Date").addText(n=>{n.inputEl.type="date",n.setValue(this.dateValue),n.onChange(s=>{this.dateValue=s})}),this.allDayValue||(this.renderTimeSetting(e,"Start time","start"),this.renderTimeSetting(e,"End time","end")),new u.Setting(e).setName("Repeat").addDropdown(n=>{n.addOption("none","Never").addOption("daily","Every day").addOption("weekdays","Every weekday").addOption("weekly","Every week").addOption("monthly","Every month").addOption("yearly","Every year").setValue(this.repeatValue).onChange(s=>{this.repeatValue=s,this.repeatValue==="none"&&(this.repeatUntilValue=""),this.render()})}),this.repeatValue!=="none"&&new u.Setting(e).setName("Repeat until").setDesc("Optional").addText(n=>{n.inputEl.type="date",n.setValue(this.repeatUntilValue),n.onChange(s=>{this.repeatUntilValue=s})}),new u.Setting(e).setName("Location").addText(n=>{n.setValue(this.locationValue),n.onChange(s=>{this.locationValue=s})}),new u.Setting(e).setName("Notes").addTextArea(n=>{n.setValue(this.notesValue),n.onChange(s=>{this.notesValue=s})});let t=e.createDiv({cls:"home-base-modal-footer"});this.event&&t.createEl("button",{text:"Delete"}).onClickEvent(()=>void this.deleteEvent()),t.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),t.createEl("button",{cls:"mod-cta",text:"Save Event"}).onClickEvent(()=>void this.saveEvent())}renderReadOnlyEvent(e,t){e.createEl("h2",{text:t.title||"Untitled event"});let a=t.provider==="icloud"?"iCloud":"Google",r=e.createDiv({cls:"home-base-event-details"}),n=(l,d)=>{if(!d)return;let h=r.createDiv({cls:"home-base-event-detail"});h.createEl("strong",{text:l}),h.createDiv({text:d})};n("Calendar",`${t.calendarName} \xB7 ${a}`),n("Account",t.accountName),n("When",this.readOnlyEventTime(t)),n("Location",t.location),n("Repeat",t.repeat==="none"?"Does not repeat":t.repeat),n("Notes",t.notes),r.createEl("p",{cls:"home-base-muted",text:"This calendar is read only in Home Base."}),e.createDiv({cls:"home-base-modal-footer"}).createEl("button",{cls:"mod-cta",text:"Close"}).onClickEvent(()=>this.close())}readOnlyEventTime(e){let t=e.start.toLocaleDateString(void 0,{weekday:"long",year:"numeric",month:"long",day:"numeric"});if(e.allDay)return`${t} \xB7 All day`;let a=e.start.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),r=e.end.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"});return`${t} \xB7 ${a}\u2013${r}`}renderTimeSetting(e,t,a){let r=new u.Setting(e).setName(t);r.settingEl.addClass("home-base-time-setting");let n=r.controlEl.createDiv({cls:"home-base-time-field"}),s=n.createDiv({cls:"home-base-time-input-wrap"}),o=s.createEl("input",{cls:"home-base-time-input",attr:{type:"text",readonly:"true","aria-haspopup":"dialog","aria-expanded":"false","aria-label":`${t}: ${this.formatDisplayTime(this.timeValueFor(a))}. Open time picker.`}});o.value=this.formatDisplayTime(this.timeValueFor(a));let l=s.createSpan({cls:"home-base-time-icon"});(0,u.setIcon)(l,"clock"),o.addEventListener("click",d=>{d.preventDefault(),this.openTimePicker(a,n,o)}),o.addEventListener("focus",()=>this.openTimePicker(a,n,o)),o.addEventListener("keydown",d=>{var h,p;d.key!=="Enter"&&d.key!==" "&&d.key!=="ArrowDown"||(d.preventDefault(),this.openTimePicker(a,n,o),(p=(h=this.timePickerPopover)==null?void 0:h.querySelector("button"))==null||p.focus())}),a==="start"?this.startTimeInput=o:this.endTimeInput=o}openTimePicker(e,t,a){if(this.activeTimePicker===e&&this.timePickerPopover){this.positionTimePicker();return}this.closeTimePicker(),this.activeTimePicker=e,this.activeTimeField=t,this.activeTimeInput=a,a.setAttribute("aria-expanded","true");let r=t.createDiv({cls:"home-base-time-popover"});r.setAttribute("role","dialog"),r.setAttribute("aria-label",`${e==="start"?"Start":"End"} time picker`),this.timePickerPopover=r,this.renderTimePickerContents(),this.positionTimePicker(),document.addEventListener("mousedown",this.outsideTimePickerHandler,!0),document.addEventListener("keydown",this.timePickerKeyHandler,!0),window.addEventListener("resize",this.timePickerResizeHandler)}closeTimePicker(e=!1){let t=this.activeTimeInput;this.timePickerPopover&&this.timePickerPopover.remove(),this.timePickerPopover=void 0,this.activeTimeField=void 0,this.activeTimeInput=void 0,this.activeTimePicker=null,t&&t.setAttribute("aria-expanded","false"),document.removeEventListener("mousedown",this.outsideTimePickerHandler,!0),document.removeEventListener("keydown",this.timePickerKeyHandler,!0),window.removeEventListener("resize",this.timePickerResizeHandler),e&&(t==null||t.focus())}renderTimePickerContents(){if(!this.timePickerPopover||!this.activeTimePicker)return;let e=this.timePickerPopover,t=this.activeTimePicker,a=this.parseTimeParts(this.timeValueFor(t));e.empty(),this.renderTimeColumn(e,t,"hour",a.hour12),e.createDiv({cls:"home-base-time-divider"}),this.renderTimeColumn(e,t,"minute",String(a.minute).padStart(2,"0")),e.createDiv({cls:"home-base-time-divider"});let r=e.createDiv({cls:"home-base-period-column"});this.renderPeriodButton(r,t,"AM",a.period),this.renderPeriodButton(r,t,"PM",a.period)}renderTimeColumn(e,t,a,r){let n=a==="hour"?"hour":"minute",s=e.createDiv({cls:"home-base-time-column"});s.addEventListener("wheel",d=>this.handleTimeColumnWheel(d,s,t,a),{passive:!1});let o=s.createEl("button",{cls:"home-base-time-step",attr:{"aria-label":`Decrease ${t} ${n}`}});(0,u.setIcon)(o,"chevron-up"),o.onClickEvent(()=>this.adjustTime(t,a,-1)),s.createDiv({cls:"home-base-time-value",text:String(r)});let l=s.createEl("button",{cls:"home-base-time-step",attr:{"aria-label":`Increase ${t} ${n}`}});(0,u.setIcon)(l,"chevron-down"),l.onClickEvent(()=>this.adjustTime(t,a,1))}handleTimeColumnWheel(e,t,a,r){var d;e.preventDefault(),e.stopPropagation();let n=e.deltaMode===WheelEvent.DOM_DELTA_LINE?e.deltaY*16:e.deltaY,s=((d=this.timeWheelDeltas.get(t))!=null?d:0)+n,o=s>0?1:-1,l=this.timeWheelThreshold(a,r,o);if(Math.abs(s)<l){this.timeWheelDeltas.set(t,s);return}this.adjustWheelTime(a,r,o),this.timeWheelDeltas.set(t,s-Math.sign(s)*l)}timeWheelThreshold(e,t,a){if(t!=="minute")return 24;let{minute:r}=this.parseTimeParts(this.timeValueFor(e));return r===0||r===30?42:18}adjustWheelTime(e,t,a){let r=this.parseTimeParts(this.timeValueFor(e)),n=r.hour12,s=t==="hour"?this.wrapNumber(n+a,1,12):n,o=t==="minute"?this.wrapNumber(r.minute+a,0,59):r.minute,l=r.period==="AM"?s%12:s%12+12;this.applyTimeValue(e,`${String(l).padStart(2,"0")}:${String(o).padStart(2,"0")}`)}wrapNumber(e,t,a){return e>a?t:e<t?a:e}renderPeriodButton(e,t,a,r){e.createEl("button",{cls:`home-base-period-button${a===r?" is-selected":""}`,text:a,attr:{"aria-label":`Set ${t} time to ${a}`,"aria-pressed":a===r?"true":"false"}}).onClickEvent(()=>this.setTimePeriod(t,a))}positionTimePicker(){if(!this.timePickerPopover||!this.activeTimeField||!this.activeTimeInput)return;let e=this.timePickerPopover;e.style.left="0px",e.style.removeProperty("--home-base-time-pointer-left"),e.removeClass("is-above");let t=this.activeTimeField.getBoundingClientRect(),a=this.activeTimeInput.getBoundingClientRect(),r=e.getBoundingClientRect(),n=this.contentEl.getBoundingClientRect(),s=12,o=Math.max(s,n.left+s),l=Math.min(window.innerWidth-s,n.right-s),d=o-t.left,h=l-t.left-r.width,p=Math.min(d,h),g=Math.max(d,h),f=Math.min(Math.max(0,p),g);e.style.left=`${f}px`;let m=a.left+Math.min(32,a.width/2)-t.left-f;e.style.setProperty("--home-base-time-pointer-left",`${Math.max(16,Math.min(r.width-22,m))}px`);let b=e.getBoundingClientRect();b.bottom>window.innerHeight-s&&a.top-b.height-s>0&&e.addClass("is-above")}adjustTime(e,t,a){let r=this.parseTimeParts(this.timeValueFor(e)),n=new Date(2e3,0,1,r.hour24,r.minute,0,0),s=t==="hour"?k(n,a*60):k(n,a*30);this.applyTimeValue(e,this.timeInputValue(s))}setTimePeriod(e,t){let a=this.parseTimeParts(this.timeValueFor(e));if(a.period===t)return;let r=t==="AM"?a.hour24-12:a.hour24+12;this.applyTimeValue(e,`${String(r).padStart(2,"0")}:${String(a.minute).padStart(2,"0")}`)}applyTimeValue(e,t){e==="start"?(this.startTimeValue=t,this.updateTimeInput(this.startTimeInput,t,"Start time"),this.followStartTime()):(this.endTimeValue=t,this.updateTimeInput(this.endTimeInput,t,"End time"),this.updateDurationFromEnd()),this.renderTimePickerContents(),this.positionTimePicker()}updateTimeInput(e,t,a){if(!e)return;let r=this.formatDisplayTime(t);e.value=r,e.setAttribute("aria-label",`${a}: ${r}. Open time picker.`)}timeValueFor(e){return e==="start"?this.startTimeValue:this.endTimeValue}parseTimeParts(e){let[t,a]=e.split(":").map(s=>Number(s)),r=Number.isFinite(t)?Math.min(23,Math.max(0,t)):0,n=Number.isFinite(a)?Math.min(59,Math.max(0,a)):0;return{hour24:r,hour12:r%12||12,minute:n,period:r>=12?"PM":"AM"}}formatDisplayTime(e){let t=this.parseTimeParts(e);return`${t.hour12}:${String(t.minute).padStart(2,"0")} ${t.period}`}async saveEvent(){var t,a,r,n,s,o;if(!this.titleValue.trim()){new u.Notice("Event title is required.");return}if(!this.dateValue){new u.Notice("Event date is required.");return}this.ensureEndAfterStart(!1);let e={uid:(t=this.event)==null?void 0:t.uid,href:(a=this.event)==null?void 0:a.href,etag:(r=this.event)==null?void 0:r.etag,rawIcs:(n=this.event)==null?void 0:n.rawIcs,calendarId:((s=this.event)==null?void 0:s.calendarId)||this.calendarIdValue,title:this.titleValue,date:this.dateValue,startTime:this.startTimeValue,endTime:this.endTimeValue,allDay:this.allDayValue,location:this.locationValue,notes:this.notesValue,repeat:this.repeatValue,repeatUntil:this.repeatUntilValue};(o=this.event)!=null&&o.repeat&&this.event.repeat!=="none"?confirm("Edit only this event? Press Cancel to edit the whole repeating series.")?await this.plugin.saveCalendarOccurrence(this.event,e):await this.plugin.saveCalendarEvent(e):await this.plugin.saveCalendarEvent(e),this.close(),this.onSave()}async deleteEvent(){if(!this.event||!confirm(`Delete "${this.event.title||"Untitled event"}"?`))return;let t=this.event.repeat!=="none"&&confirm("Delete only this event? Press Cancel to delete the whole repeating series.");await this.plugin.deleteCalendarEvent(this.event,t),this.close(),this.onSave()}ensureEndAfterStart(e){if(this.allDayValue||!this.dateValue||!this.startTimeValue||!this.endTimeValue)return;let t=S(this.dateValue,this.startTimeValue);if(S(this.dateValue,this.endTimeValue)>t)return;let r=k(t,Math.max(this.durationMinutes,60));this.endTimeValue=this.timeInputValue(r),this.updateTimeInput(this.endTimeInput,this.endTimeValue,"End time"),e||new u.Notice("End time was adjusted to be after the start time.")}followStartTime(){if(this.allDayValue||!this.dateValue||!this.startTimeValue)return;let e=S(this.dateValue,this.startTimeValue),t=k(e,Math.max(this.durationMinutes,1));this.endTimeValue=this.timeInputValue(t),this.updateTimeInput(this.endTimeInput,this.endTimeValue,"End time")}updateDurationFromEnd(){if(this.allDayValue||!this.dateValue||!this.startTimeValue||!this.endTimeValue)return;let e=S(this.dateValue,this.startTimeValue),t=S(this.dateValue,this.endTimeValue);if(t<=e){this.durationMinutes=60,this.ensureEndAfterStart(!1);return}this.durationMinutes=Math.max(1,Math.round((t.getTime()-e.getTime())/6e4))}dateInputValue(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}timeInputValue(e){return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}},se=class extends u.Modal{constructor(i,e,t,a){super(i),this.plugin=e,this.plan={types:Object.fromEntries(Object.entries(t.types).map(([r,n])=>[r,[...n]])),sequence:[...t.sequence]},this.onSave=a}onOpen(){this.render()}render(){let{contentEl:i}=this;i.empty(),i.addClass("home-base-modal","home-base-routine-modal"),i.createEl("h2",{text:"Edit Workout Routine"});let e=i.createDiv({cls:"home-base-routine-section"}),t=e.createDiv({cls:"home-base-routine-section-header"});t.createEl("h3",{text:"Workout Types"}),t.createEl("button",{text:"+ Add Type"}).onClickEvent(()=>{let p=this.uniqueWorkoutName("New Workout");this.plan.types[p]=[],this.plan.sequence.push(p),this.render()});let r=Object.keys(this.plan.types);r.length||e.createEl("p",{cls:"home-base-muted home-base-italic",text:"Create a workout type to start your sequence."});for(let p of r)this.renderWorkoutType(e,p);let n=i.createDiv({cls:"home-base-routine-section"}),s=n.createDiv({cls:"home-base-routine-section-header"});s.createEl("h3",{text:"Sequence Order"});let o=s.createEl("button",{text:"+ Add Step"});o.disabled=!r.length,o.onClickEvent(()=>{let p=Object.keys(this.plan.types)[0];p&&(this.plan.sequence.push(p),this.render())}),this.plan.sequence.length||n.createEl("p",{cls:"home-base-muted home-base-italic",text:"No sequence steps yet."}),this.plan.sequence.forEach((p,g)=>{this.renderSequenceStep(n,p,g)});let l=i.createDiv({cls:"home-base-modal-footer"});l.createEl("button",{text:"Cancel"}).onClickEvent(()=>this.close()),l.createEl("button",{cls:"mod-cta",text:"Save Routine"}).onClickEvent(()=>void this.saveRoutine())}renderWorkoutType(i,e){let t=i.createDiv({cls:"home-base-routine-card"}),a=t.createDiv({cls:"home-base-routine-card-row"}),r=a.createEl("input",{cls:"home-base-routine-name"});r.type="text",r.value=e,r.placeholder="Workout name",r.onchange=()=>{this.renameWorkoutType(e,r.value.trim())},a.createEl("button",{text:"Delete"}).onClickEvent(()=>{delete this.plan.types[e],this.plan.sequence=this.plan.sequence.filter(o=>o!==e),this.render()});let s=t.createEl("textarea",{cls:"home-base-routine-exercises"});s.placeholder="One exercise per line",s.value=this.plan.types[e].join(`
`),s.onchange=()=>{this.plan.types[e]=s.value.split(`
`).map(o=>o.trim()).filter(Boolean)}}renderSequenceStep(i,e,t){let a=i.createDiv({cls:"home-base-sequence-row"});a.createEl("span",{cls:"home-base-sequence-index",text:`${t+1}`});let r=a.createEl("select");for(let l of Object.keys(this.plan.types)){let d=r.createEl("option",{text:l,value:l});d.selected=l===e}r.onchange=()=>{this.plan.sequence[t]=r.value};let n=a.createEl("button",{text:"Up"});n.disabled=t===0,n.onClickEvent(()=>{this.moveSequenceStep(t,t-1),this.render()});let s=a.createEl("button",{text:"Down"});s.disabled=t===this.plan.sequence.length-1,s.onClickEvent(()=>{this.moveSequenceStep(t,t+1),this.render()}),a.createEl("button",{text:"Remove"}).onClickEvent(()=>{this.plan.sequence.splice(t,1),this.render()})}renameWorkoutType(i,e){if(!e||e===i)return;if(this.plan.types[e]){new u.Notice("A workout type with that name already exists."),this.render();return}let t=Object.entries(this.plan.types);this.plan.types=Object.fromEntries(t.map(([a,r])=>a===i?[e,r]:[a,r])),this.plan.sequence=this.plan.sequence.map(a=>a===i?e:a),this.render()}moveSequenceStep(i,e){let[t]=this.plan.sequence.splice(i,1);this.plan.sequence.splice(e,0,t)}uniqueWorkoutName(i){if(!this.plan.types[i])return i;let e=2;for(;this.plan.types[`${i} ${e}`];)e+=1;return`${i} ${e}`}async saveRoutine(){let i=Object.keys(this.plan.types).filter(Boolean);if(!i.length){new u.Notice("Add at least one workout type.");return}this.plan.sequence=this.plan.sequence.filter(t=>!!this.plan.types[t]),this.plan.sequence.length||(this.plan.sequence=[i[0]]),await this.plugin.ensureFile(this.plugin.settings.workoutPlanPath,ie);let e=this.app.vault.getAbstractFileByPath((0,u.normalizePath)(this.plugin.settings.workoutPlanPath));e instanceof u.TFile&&(await this.app.vault.modify(e,this.formatWorkoutPlan()),new u.Notice("Workout routine saved."),this.close(),this.onSave())}formatWorkoutPlan(){let i=["# Workout Types",""];for(let[e,t]of Object.entries(this.plan.types))i.push(`## ${e}`),t.length?i.push(...t.map(a=>`- ${a}`)):i.push("Rest day"),i.push("");return i.push("# Sequence",""),i.push(...this.plan.sequence.map(e=>`- ${e}`)),i.push(""),i.join(`
`)}},oe=class extends u.PluginSettingTab{constructor(i,e){super(i,e),this.plugin=e}display(){let{containerEl:i}=this;i.empty(),i.createEl("h2",{text:"Home Base Settings"}),new u.Setting(i).setName("Open on startup").setDesc("Automatically open the Home Base dashboard when Obsidian starts.").addToggle(t=>{t.setValue(this.plugin.settings.openOnStartup).onChange(async a=>{this.plugin.settings.openOnStartup=a,await this.plugin.saveSettings()})}),i.createEl("h3",{text:"Calendar"}),new u.Setting(i).setName("Enable calendar").setDesc("Show connected iCloud/CalDAV and Google calendars in Home Base.").addToggle(t=>{t.setValue(this.plugin.settings.calendarEnabled).onChange(async a=>{this.plugin.settings.calendarEnabled=a,await this.plugin.saveSettings()})}),new u.Setting(i).setName("CalDAV server URL").setDesc("For iCloud, use https://caldav.icloud.com.").addText(t=>{t.setPlaceholder("https://caldav.icloud.com").setValue(this.plugin.settings.calendarServerUrl).onChange(async a=>{this.plugin.settings.calendarServerUrl=a.trim(),await this.plugin.saveSettings()})}),new u.Setting(i).setName("Calendar username").setDesc("For iCloud, use your Apple ID email.").addText(t=>{t.setPlaceholder("name@example.com").setValue(this.plugin.settings.calendarUsername).onChange(async a=>{this.plugin.settings.calendarUsername=a.trim(),await this.plugin.saveSettings()})}),new u.Setting(i).setName("Calendar password").setDesc("For iCloud, use an app-specific password.").addText(t=>{t.inputEl.type="password",t.setValue(this.plugin.settings.calendarPassword).onChange(async a=>{this.plugin.settings.calendarPassword=a,await this.plugin.saveSettings()})}),new u.Setting(i).setName("Test calendar connection").setDesc("Discovers every CalDAV event calendar and enables new calendars by default.").addButton(t=>{t.setButtonText("Test"),t.onClick(async()=>{try{let a=await this.plugin.testCalendarConnection();new u.Notice(`Connected to ${a.length} calendar${a.length===1?"":"s"}.`),this.display(),await this.plugin.refreshDashboard(!0)}catch(a){new u.Notice(a instanceof Error?a.message:"Calendar connection failed.")}})}),i.createEl("h4",{text:"Google Calendar accounts"}),new u.Setting(i).setName("Google OAuth client secret").setDesc("Stored only in Obsidian SecretStorage. Set or replace it when Google reports that client_secret is missing or invalid.").addButton(t=>{t.setButtonText("Set / Replace"),t.onClick(async()=>{await this.plugin.replaceGoogleClientSecret()&&new u.Notice("Google OAuth client secret saved locally.")})}),new u.Setting(i).setName("Connect Google account").setDesc(u.Platform.isDesktopApp?"Opens Google in your browser using secure OAuth 2.0 + PKCE.":"Connect accounts from Obsidian desktop, then sync this vault to mobile.").addButton(t=>{t.setButtonText("Connect").setDisabled(!u.Platform.isDesktopApp),t.onClick(async()=>{try{let a=await this.plugin.connectGoogleAccount();new u.Notice(`Connected ${a.email}.`),this.display(),await this.plugin.refreshDashboard()}catch(a){new u.Notice(a instanceof Error?a.message:"Google Calendar connection failed.")}})});for(let t of this.plugin.settings.googleAccounts)new u.Setting(i).setName(t.email).setDesc("Google Calendar \xB7 Encrypted refresh token").addButton(a=>{a.setButtonText("Disconnect").setWarning(),a.onClick(async()=>{await this.plugin.disconnectGoogleAccount(t.id),this.display(),await this.plugin.refreshDashboard()})});let e=this.plugin.settings.calendarSources.filter(t=>t.provider==="icloud"||t.provider==="google");if(e.length){i.createEl("h4",{text:"Visible calendars"});for(let t of e){let a=t.provider==="icloud"?"iCloud":"Google",n=new u.Setting(i).setName(t.displayName).setDesc(`${a} \xB7 ${t.accountName||a}${t.writable?" \xB7 Writable":" \xB7 Read only"}`).addToggle(s=>{s.setValue(t.enabled).onChange(async o=>{await this.plugin.setCalendarEnabled(t.id,o)})}).nameEl.createSpan({cls:"home-base-calendar-source-dot"});n.style.backgroundColor=t.color}new u.Setting(i).setName("Default event calendar").setDesc("New events are saved here unless another calendar is selected in the event form.").addDropdown(t=>{for(let a of e.filter(r=>r.writable)){let r=a.provider==="icloud"?"iCloud":"Google";t.addOption(a.id,`${a.displayName} \u2014 ${r}`)}t.setValue(this.plugin.settings.defaultCalendarId),t.onChange(async a=>{var n,s;let r=this.plugin.settings.calendarSources.find(o=>o.id===a);this.plugin.settings.defaultCalendarId=a,this.plugin.settings.calendarUrl=(n=r==null?void 0:r.href)!=null?n:"",this.plugin.settings.calendarName=(s=r==null?void 0:r.displayName)!=null?s:"",await this.plugin.saveSettings()})})}i.createEl("h3",{text:"Todos"}),new u.Setting(i).setName("Todo inbox file").setDesc("New todos created from the dashboard are saved here.").addText(t=>{t.setValue(this.plugin.settings.todoInboxPath).onChange(async a=>{this.plugin.settings.todoInboxPath=(0,u.normalizePath)(a),await this.plugin.saveSettings()})}),new u.Setting(i).setName("Todo scan folders").setDesc("Comma-separated folders to scan for Markdown todos. Leave blank to scan the whole vault.").addText(t=>{t.setValue(this.plugin.settings.todoScanFolders).onChange(async a=>{this.plugin.settings.todoScanFolders=a,await this.plugin.saveSettings()})}),i.createEl("h3",{text:"Workout"}),new u.Setting(i).setName("Workout plan file").addText(t=>{t.setValue(this.plugin.settings.workoutPlanPath).onChange(async a=>{this.plugin.settings.workoutPlanPath=(0,u.normalizePath)(a),await this.plugin.saveSettings()})}),new u.Setting(i).setName("Workout log file").addText(t=>{t.setValue(this.plugin.settings.workoutLogPath).onChange(async a=>{this.plugin.settings.workoutLogPath=(0,u.normalizePath)(a),await this.plugin.saveSettings()})})}};
