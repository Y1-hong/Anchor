# Home Base

Home Base is an Obsidian plugin page that opens as a personal daily dashboard.

MVP modules:

- Todo Manager with Markdown-backed tasks
- Workout Sequence with Markdown-backed plan and log
- Calendar placeholder for a later release

Todo format:

```md
- [ ] Finish essay due:: 2026-05-28 priority:: high #school
```

Workout files:

- `Home Base/Workout Plan.md`
- `Home Base/Workout Log.md`

## Development

```bash
npm install
npm run dev
```

Copy or symlink this folder into `.obsidian/plugins/home-base` in a test vault, then enable the plugin from Obsidian settings.
