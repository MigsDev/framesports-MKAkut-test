# framesports-MKAkut-test

Sports content management dashboard maintained by **MKAkut**.

## Technology

- Ruby on Rails 8 API
- PostgreSQL 17 with ActiveRecord
- React 19 and TypeScript
- Vite frontend development server
- Docker Compose for the full development environment

## Features

- Overview: clip counts, publication status, views, and top sport
- Clip library: create, edit, search, filter, preview, and delete highlights
- Analytics: sports distribution and recently added clips
- Video previews: YouTube watch/Shorts links, Vimeo, and direct MP4/WebM/Ogg files
- Muted hover previews over clip thumbnails (up to six seconds), with click-to-open full playback
- Clip Library pagination with 5 or 10 rows per page; live case-insensitive prefix search by video title
- Analytics sports-distribution pie chart and publication-stage flowchart
- Views-by-video comparison report with selectable video bars and sport filter
- Rails model validation, permitted request fields, and API tests
- Responsive sidebar navigation with active-view highlighting

## Start on Windows 11

Install Docker Desktop with WSL 2 enabled and open this folder in VS Code.

In the integrated PowerShell terminal, run:

```powershell
docker compose up -d --build
docker compose ps -a
```

Open http://localhost:5173. The Rails API runs at http://localhost:3000 and PostgreSQL is exposed on port 5432.

The API container initializes its database, applies pending migrations, and ensures the example records exist. Its startup command clears stale `tmp/pids/server.pid` to avoid Rails refusing to start after an interrupted run.

The Compose project is deliberately named `framesports-practice` in `docker-compose.yml` for compatibility with an existing database volume from previous installations. The application folder and frontend package are named `framesports-MKAkut-test`.

### Update an existing installation

1. Back up your current project folder and database before changing the deployment.
2. Stop the old containers with `docker compose down` from the old project directory. Do **not** use `down -v`.
3. Extract this project. Keep `docker-compose.yml`'s project name unchanged if you intend to reuse the old volume.
4. Run `docker compose up -d --build` from the new folder.
5. Run `docker compose ps -a` and verify `db`, `api`, and `web` are healthy/running.

If the old and new directories are used simultaneously, do not start both Compose stacks against the same ports or data volume. Stop the previous stack first.

## Verify endpoints

| Endpoint | Expected result |
|---|---|
| `GET /api/health` | `{ "status": "ok" }` |
| `GET /api/clips` | JSON array of clips |
| `GET /api/dashboard` | Aggregated clip metrics |
| `POST /api/clips` | HTTP 201 with created clip |
| `PATCH /api/clips/:id` | Updated clip |
| `DELETE /api/clips/:id` | HTTP 204 |

### Rails tests

```powershell
docker compose exec api ruby bin/rails db:test:prepare
docker compose exec api ruby bin/rails test
```

### React build

```powershell
docker compose exec web npm run build
```

### Troubleshooting

```powershell
docker compose ps -a
docker compose logs api --tail=100
docker compose logs web --tail=100
```

The frontend uses the Docker service target `http://api:3000` in `frontend/vite.config.ts`. If running Vite directly outside Docker, change that target to `http://127.0.0.1:3000`.

## Folder structure

```text
framesports-MKAkut-test/
  docker-compose.yml
  backend/
    app/controllers/api/       REST controllers
    app/models/                ActiveRecord and validations
    config/                    Routes and PostgreSQL configuration
    db/                        Migrations, schema and starter data
    test/                      Automated tests
  frontend/
    src/components/            Sidebar, clips, statistics and player
    src/components/AnalyticsReports.tsx  Pie, workflow, and views reports
    src/utils/videoSource.ts    Reusable video URL parsing and player selection
    src/App.tsx                Application state and view switching
    src/api.ts                 API client
    src/types.ts               Typed contracts
    src/styles.css             Base styling
    src/enhancements.css       Page and media styles
```

## Deployment notes

The packaged PostgreSQL credentials are for local development only. Change them and configure authentication/authorization, production secrets, HTTPS, robust URL validation, rate limiting and media ingestion security before any public deployment. This application currently references externally hosted videos rather than storing or transcoding video files.

---

© 2026 MKAkut. All rights reserved.


## Video player and viewer feedback

Video player modals contain clip-specific comments, optional 1–5 star ratings, and a playback issue reporting form. Feedback is stored in PostgreSQL using the `clip_comments` migration. Direct media files also offer playback speed controls. YouTube/Vimeo use their own embedded controls.

After replacing source files, run `docker compose up -d --build` from the project root; the Rails startup script runs `bin/rails db:prepare` to apply pending migrations. Check with `docker compose logs api --tail=80`. No database reset is needed.

Endpoints: `GET /api/clips/:clip_id/comments` returns the latest 100 comments and rating summary; `POST /api/clips/:clip_id/comments` accepts `{ "comment": {"author":"Viewer", "body":"Great match", "rating":5, "kind":"comment"}}`. For player issues, use `kind: "issue"` without a rating.

This assessment prototype accepts a display name without authentication. Before deploying publicly, add user authentication, rate limiting, anti-spam moderation, and role-restricted deletion or reporting management.

## Telegram alerts and upcoming sports feeds

### Telegram configuration

1. In Telegram, open **@BotFather**, create a bot with `/newbot`, and copy its bot token.
2. Start a private conversation with the new bot and send it a message. To locate your numeric chat ID, open `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` privately and inspect `message.chat.id`. Never share the token or commit it to Git.
3. Copy `.env.example` to `.env` alongside `docker-compose.yml` and set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
4. Run `docker compose up -d --build api web`. Compose reads `.env` automatically for variable substitution.
5. Publish a *new* clip or change a clip's status from `draft`/`reviewing` to `published`; a bot message should arrive. Adding a viewer comment or playback issue should also notify the configured chat.

Telegram is optional: with either setting blank, sending is skipped. The `TelegramNotificationJob` uses Rails' configured Active Job adapter; notification failures are logged and do not block user actions. In this local development configuration, asynchronous jobs depend on the API process, so this is **not a durable production notification queue**. Add a persistent job queue and monitoring before deployment. Avoid putting personal or sensitive information in public group notifications. New alerts contain video titles and comment excerpts.

### Upcoming fixtures

Use **Sports feeds** in the sidebar to select a league. The server calls TheSportsDB v1 free schedule endpoint, caches results for 10 minutes, and responds from `/api/sports_feeds?league=4328`. The free endpoint can return only one upcoming event for a league and some leagues may have no available fixtures. **These are scheduled fixtures, not real-time scores**. No separate API key is required for the publicly documented development key `123`.

### Verification checklist

```powershell
# Rails & DB containers must be running
 docker compose ps -a
# Health and fixture API checks
 curl.exe http://localhost:3000/api/health
 curl.exe "http://localhost:3000/api/sports_feeds?league=4328"
# Unsupported league returns HTTP 422
 curl.exe -i "http://localhost:3000/api/sports_feeds?league=unknown"
# Rails tests and frontend production build
 docker compose exec api bin/rails test
 docker compose exec web npm run build
```

In the UI, verify that Overview/Library/Analytics remain available, hover preview and full playback work, pagination changes between 5/10 rows, each clip retains feedback and ratings, and the Sports feeds page shows either fixtures or a useful empty/error state. Telegram notifications are tested by publishing a clip and posting feedback. Use `docker compose logs api --tail=100` if a notification fails.

**Data preservation:** `docker-compose.yml` retains the previous Compose project name and `pgdata` named volume. Do not execute `docker compose down -v` or `rails db:reset` on existing data. The latest changes add no database tables and require no new migration.

## Rails test-suite repair

This release includes `backend/app/jobs/application_job.rb` (required for `TelegramNotificationJob`), loads `minitest/mock` so `.stub` works, and uses Active Job's test adapter. These changes do not modify any production database tables or volumes.

From the project root, run:

```powershell
docker compose up -d --build api web
docker compose exec api bin/rails db:migrate
docker compose exec api bin/rails test
```

Expected: 0 failures and 0 errors. If a test still fails, inspect the first exception with `docker compose logs api --tail=120` and `docker compose exec api bin/rails test test/controllers/api/clip_comments_controller_test.rb -v`. The commands above preserve the existing named PostgreSQL volume; never use `docker compose down -v` for an update.


## Click-based video view tracking (new)

Every explicit **Play** click in the Clip Library, Recently Added, or Analytics videos report
opens the video player and makes one `POST /api/clips/:id/view` request. Rails increments
`clips.views` atomically in PostgreSQL and responds with `{ "id": 1, "views": 11 }`.
React updates that clip's count, its open-player state, and Overview/Analytics total views
immediately after a successful response; the recorded value remains after a page refresh.
A failed API call shows an error instead of pretending the view was saved.

**Not counted:** thumbnail hover previews, browsing, searching, page refreshes, and
playing/pausing within an already open player. Closing and reopening the player counts
another view, by design. This measures **video opens/clicks**, not unique viewers,
verified playback completions, or real-time streams across all connected browsers.
Other browsers see updated counts when they refresh; WebSocket/SSE would be a
separate enhancement for immediate cross-browser broadcasts.

The clip editor shows current views as **read-only**; arbitrary create/update requests
cannot assign the `views` field. Existing view counts and data are preserved and no new
migration is required.

### API checks using PowerShell

In the project directory (with Docker running):

```powershell
docker compose up -d --build api web
docker compose exec api bin/rails test
curl.exe http://localhost:3000/api/clips/1
curl.exe -X POST http://localhost:3000/api/clips/1/view
curl.exe http://localhost:3000/api/clips/1
curl.exe http://localhost:3000/api/dashboard
```

For a manual browser check, note a clip's count in the Clip Library, click its Play
thumbnail once, and verify the count increases by one. Repeat from Analytics and
Recently Added, then refresh the browser and check the value persists. Hover should
never increase views.

**Important:** The POST test increments clip 1 for real. Use a test clip to avoid
modifying the analytics of an existing production clip. Keep the current Compose
project identity (`framesports-practice`) and named `pgdata` volume when updating;
**never** run `docker compose down -v` or `rails db:reset` to install this fix.

**Seed safety:** The original startup script used to overwrite demo clip view counts
on every Rails API restart. The updated `db/seeds.rb` now creates only missing demo
clips, leaving all previously recorded views and edits unchanged.

**Docker startup safety:** The `api` service no longer runs `db:seed` on every boot;
`db:prepare` keeps existing databases migrated without overwriting tracked views.
To insert missing sample clips manually on a new development database only, run
`docker compose exec api bin/rails db:seed`.
