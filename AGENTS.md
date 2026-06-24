# Home Base Project Notes

## Project Overview

Home Base is an Obsidian community plugin that provides a personal dashboard page inside Obsidian.

The plugin currently focuses on:

- Todo management backed by Markdown.
- Workout sequence management backed by Markdown.
- A future calendar/schedule module.

The project is intentionally designed to feel native to Obsidian, using Obsidian theme variables and a custom plugin view rather than a normal Markdown homepage.

## Repository

- Local project path: `/Users/yihonghuang/Desktop/obsidian plugin`
- GitHub repository: `https://github.com/Y1-hong/home-base`
- Main branch: `main`
- Current latest tagged version: `v2.2`

## Build Commands

Install dependencies:

```bash
npm install
```

Build the plugin:

```bash
npm run build
```

The build generates or updates:

- `main.js`

## Obsidian Plugin Install Files

For manual testing in an Obsidian vault, only these files are required:

- `manifest.json`
- `main.js`
- `styles.css`

Do not copy the full development repo into `.obsidian/plugins`.

The correct test install structure is:

```text
<vault>/.obsidian/plugins/home-base/manifest.json
<vault>/.obsidian/plugins/home-base/main.js
<vault>/.obsidian/plugins/home-base/styles.css
```

## Known Local Paths

Clean install folder used during development:

```text
/Users/yihonghuang/Desktop/home-base
```

Obsidian iCloud vault root:

```text
/Users/yihonghuang/Library/Mobile Documents/iCloud~md~obsidian/Documents/Aidan's_Vault
```

Vault changelog note:

```text
/Users/yihonghuang/Library/Mobile Documents/iCloud~md~obsidian/Documents/Aidan's_Vault/Obsidian插件更新日志.md
```

## Data Files Created Inside the Vault

Home Base creates Markdown-backed data files in the vault:

```text
Home Base/Todo Inbox.md
Home Base/Workout Plan.md
Home Base/Workout Log.md
```

Todo format:

```md
- [ ] Finish essay due:: 2026-06-26 priority:: high #school
```

Workout plan format:

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

Workout log format:

```md
- date:: 2026-06-18 workout:: Pull status:: done
```

## Current Version Notes

### v2.2

- Added runtime CSS injection to prevent the dashboard from becoming unstyled after Obsidian restarts.
- Made default-file creation defensive so plugin startup does not fail if file creation has an issue.
- Published tags: `v1`, `v2`, `v2.2`.

### v2

- Added UI-based workout routine editing.
- Routine edits are saved back into `Home Base/Workout Plan.md`.
- Cleared default demo todos.

### v1

- Added the initial custom dashboard view.
- Added startup auto-open behavior.
- Added basic Todo Manager and Workout Sequence modules.

## Planned Work

Next planned feature: Apple Reminders-style quick todo capture.

Target interaction:

```text
Finish essay tomorrow #school !high
```

Expected parsed Markdown:

```md
- [ ] Finish essay due:: 2026-06-26 priority:: high #school
```

Desired behavior:

- Add a Quick Add input directly inside the Todo Manager panel.
- Press `Enter` to create a todo.
- Parse due dates such as `today`, `tomorrow`, and `YYYY-MM-DD`.
- Parse priority markers such as `!high`, `!medium`, and `!low`.
- Parse Markdown tags such as `#school`.
- Keep the existing modal for detailed editing.

## Development Notes

- Preserve Obsidian-native styling by using CSS variables such as `var(--background-primary)`, `var(--background-secondary)`, `var(--text-normal)`, and `var(--interactive-accent)`.
- Keep plugin install output simple: `manifest.json`, `main.js`, and `styles.css`.
- Avoid committing `node_modules/`.
- `Home_Base/` is a temporary local folder and should not be committed.
- Keep `CHANGELOG.md` updated for each meaningful version change.

