# Home Base

Home Base is an Obsidian community plugin that turns a custom Obsidian view into a personal daily dashboard for todos, workout routines, and calendars.

Current release: `v3.0`

Minimum Obsidian version: `1.11.4`

## Features

### Daily dashboard

- Opens from the Home Base ribbon icon or the command palette.
- Shows Today and Next 7 Days events from every enabled iCloud/CalDAV and Google calendar.
- Loads todos, workouts, and remote calendars independently so one slow source does not block the dashboard.

### Todo Manager

- Stores tasks in Markdown inside the vault.
- Supports detailed task editing from the dashboard.
- Provides a Quick Add input with Enter-to-create capture.
- Parses `today`, `tomorrow`, and `YYYY-MM-DD` due dates.
- Parses priority markers such as `!high`, `!medium`, and `!low`.
- Preserves Markdown tags such as `#school`.

Example input:

```text
Finish essay tomorrow #school !high
```

Stored Markdown:

```md
- [ ] Finish essay due:: 2026-06-26 priority:: high #school
```

### Workout Sequence

- Stores workout types, exercises, sequence steps, and logs in Markdown.
- Provides a dashboard editor for creating and deleting workout types.
- Supports editing exercise lists and reordering workout sequence steps.
- Records completed and skipped workouts in the workout log.

### Unified Calendars

- Connects to iCloud and other CalDAV event calendars.
- Connects multiple Google Calendar accounts through OAuth 2.0 with PKCE.
- Discovers multiple calendars and provides per-calendar colors and visibility controls.
- Combines enabled calendars in the dashboard and the dedicated Home Base Calendar view.
- Provides Month, Week, and Day views with source filtering and event details.
- Supports event creation, editing, and deletion when the selected calendar is writable.
- Supports timed, all-day, and repeating CalDAV events.
- Uses session caching, request deduplication, and stale-result protection for remote calendar loading.

## Installation

Build or download the plugin, then place only these files in the plugin directory:

```text
<vault>/.obsidian/plugins/home-base/manifest.json
<vault>/.obsidian/plugins/home-base/main.js
<vault>/.obsidian/plugins/home-base/styles.css
```

Restart Obsidian or reload community plugins, then enable **Home Base** under **Settings → Community plugins**.

Do not copy the development repository or `node_modules` into the vault plugin directory.

## Getting Started

1. Enable Home Base in Obsidian.
2. Open **Home Base** from the ribbon or command palette.
3. Review the file locations and startup behavior in **Settings → Home Base**.
4. Enable Calendar if you want to connect iCloud/CalDAV or Google Calendar.

### iCloud / CalDAV

1. Enable Calendar in Home Base settings.
2. Set the CalDAV server URL. For iCloud, use `https://caldav.icloud.com`.
3. Enter the Apple ID email and an app-specific password.
4. Test the connection and discover the available calendars.
5. Choose which calendars are visible and select a writable default calendar for new events.

### Google Calendar

1. Start the connection from Obsidian Desktop.
2. If requested, enter the Google Desktop OAuth client secret. It is stored locally in Obsidian SecretStorage.
3. Create a sync passphrase when prompted, then finish authorization in the browser.
4. Enable the calendars you want Home Base to display.

Google refresh tokens are encrypted before they are written to synced plugin settings. Account connection must start on Desktop; the connected vault can then be synced for use on mobile.

## Vault Data

Home Base creates and maintains these Markdown-backed files by default:

```text
Home Base/Todo Inbox.md
Home Base/Workout Plan.md
Home Base/Workout Log.md
```

Workout plan example:

```md
# Workout Types

## Push
- Bench Press
- Shoulder Press
- Triceps Pushdown

# Sequence

- Push
- Pull
- Legs
- Rest
```

Workout log example:

```md
- date:: 2026-06-18 workout:: Pull status:: done
```

These paths can be changed in Home Base settings.

## Development

Install dependencies:

```bash
npm install
```

Start the development build:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

The production build type-checks the plugin and generates `main.js`.
