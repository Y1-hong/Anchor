# Home Base Changelog

This file records the main product and code changes for Home Base.

## v2.4 - Improve Create Event Logic

- Improved new calendar event defaults so start times use the next half-hour and end times default to one hour later.
- Updated event time editing so the end time follows start-time changes immediately.
- Corrected invalid end times before saving events.
- Preserved repeat options and local-time ICS output for CalDAV calendars.
- Version `2.4` is not tagged; current minor releases are not tagged unless requested.

## v2.3 - Calendar Sync

- Added iCloud/CalDAV calendar sync for the Home Base dashboard.
- Added calendar settings for server URL, Apple ID username, app-specific password, default calendar URL, and calendar name.
- Added support for discovering event calendars, preferring writable calendars when available, and saving the selected calendar.
- Added dashboard event loading for Today and Next 7 Days.
- Added event create, edit, and delete flows with title, date, start/end time, all-day mode, location, and notes.
- Added clearer calendar setup, authentication, permission, and remote-change error handling.
- Tagged release: `v2.3`.

## v2.2 - Calendar Foundation and Load Stability

- Added the first Calendar dashboard panel and CalDAV event foundation.
- Added runtime CSS injection so the dashboard keeps its layout after Obsidian restarts.
- Made startup default-file creation defensive so file creation issues do not prevent the plugin from loading.
- Kept the clean install package as three files only: `manifest.json`, `main.js`, and `styles.css`.
- Tagged release: `v2.2`.

## v2.1 - Quick Todo Capture

- Added a Quick Add input directly inside the Todo Manager panel.
- Added Enter-to-create todo capture without opening the full edit modal.
- Added parsing for `today`, `tomorrow`, and `YYYY-MM-DD` due dates.
- Added parsing for Markdown tags such as `#school`.
- Added parsing for priority markers such as `!high`, `!medium`, and `!low`.
- Reused the existing Markdown-backed todo inbox format.

## v2 - Workout Routine UI

- Replaced `Edit Routine File` with `Edit Routine`.
- Added a dashboard modal for editing workout routines through UI.
- Added support for creating and deleting workout types.
- Added support for editing exercise lists.
- Added support for adding, removing, and reordering sequence steps.
- Saved routine changes back into `Home Base/Workout Plan.md`.
- Cleared default demo todos from the starter inbox.
- Tagged release: `v2`.

## v1 - Initial Dashboard

- Created the initial Obsidian plugin project.
- Added the `Home Base` custom dashboard view.
- Added startup auto-open behavior.
- Added the first dashboard layout with Schedule, Workout, and Todo Manager panels.
- Added Markdown-backed todo storage in `Home Base/Todo Inbox.md`.
- Added Markdown-backed workout storage in `Home Base/Workout Plan.md` and `Home Base/Workout Log.md`.
- Added workout actions for done, skip, and unresolved workout prompts.
- Added basic settings for file paths and startup behavior.
- Tagged release: `v1`.
