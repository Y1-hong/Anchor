# Home Base Changelog

This file records the main product and code changes for Home Base.

## v2.3 - Faster Todo Capture

- Added a Quick Add input at the top of the Todo Manager panel.
- Added `Enter`-to-create todo capture without opening the full modal.
- Parsed lightweight inline syntax:
  - `today`
  - `tomorrow`
  - `YYYY-MM-DD`
  - Markdown tags such as `#school`
  - priority markers `!high`, `!medium`, and `!low`
- Saved Quick Add todos to `Home Base/Todo Inbox.md` using the existing Markdown todo format.
- Kept the existing `New Todo` modal as the detailed editing entry point.
- Updated plugin version to `0.2.3`.

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

