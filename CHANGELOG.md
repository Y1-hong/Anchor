# Home Base Changelog

This file records the main product and code changes for Home Base.

## v2.4 - Improve Create Event Logic

- Improved new calendar event defaults so start times use the next half-hour and end times stay one hour later by default.
- Updated event time editing so the end time follows start-time changes and invalid end times are corrected.
- Preserved repeat options and local-time ICS event output for CalDAV calendars.

## v3 - Calendar v1

- Replaced the Schedule placeholder with a real Calendar dashboard panel.
- Added iCloud/CalDAV settings for server URL, Apple ID username, app-specific password, default calendar URL, and calendar name.
- Added CalDAV sync support for discovering calendars, fetching Today and Next 7 Days, creating events, editing events, and deleting events.
- Added event editing UI with title, date, start/end time, all-day mode, location, and notes.
- Used ETag checks for event updates and deletes so Home Base warns when an event changed remotely.
- Updated plugin version to `0.3.0`.

## v2.2 - Load Stability Upgrade

- Added runtime CSS injection so the dashboard keeps its layout even if Obsidian does not load `styles.css` reliably after restart.
- Made startup default-file creation defensive so failures do not make Obsidian show `Failed to load plugin "home-base"`.
- Kept the clean install package as three files only:
  - `manifest.json`
  - `main.js`
  - `styles.css`
- Published the project to GitHub with tags:
  - `v1`
  - `v2`
  - `v2.2`

## v2 - Workout Routine UI

- Replaced `Edit Routine File` with `Edit Routine`.
- Added a dashboard modal for editing workout routines through UI.
- Added support for:
  - creating workout types
  - deleting workout types
  - editing exercise lists
  - adding sequence steps
  - removing sequence steps
  - moving sequence steps up and down
- Saved routine changes back into `Home Base/Workout Plan.md`.
- Cleared default demo todos from the starter inbox.
- Updated plugin version to `0.2.0`.

## v1 - Initial Dashboard

- Created the initial Obsidian plugin project.
- Added the `Home Base` custom plugin view.
- Added auto-open behavior when Obsidian starts.
- Added dashboard layout:
  - Schedule placeholder
  - Workout module
  - Todo Manager module
- Added Markdown-backed todo storage:
  - `Home Base/Todo Inbox.md`
  - todo format: `- [ ] Title due:: YYYY-MM-DD priority:: high #tag`
- Added Markdown-backed workout storage:
  - `Home Base/Workout Plan.md`
  - `Home Base/Workout Log.md`
- Added workout actions:
  - `Done`
  - `Skip`
  - unresolved workout prompt
- Added basic settings for file paths and startup behavior.

## Planned: v2.3 - Faster Todo Capture

- Improve todo creation to feel closer to Apple Reminders.
- Add a Quick Add input directly inside the Todo Manager panel.
- Support pressing `Enter` to create a todo without opening a modal.
- Parse lightweight inline syntax such as:
  - `Finish essay tomorrow #school !high`
  - `Review notes today #study`
  - `Pay rent 2026-06-30 #life !high`
- Keep the existing full edit modal for detailed editing.
