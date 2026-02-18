# Weavy AI - LLM Workflow Builder Clone

A pixel-perfect clone of [Weavy.ai](https://weavy.ai), built with Next.js, React Flow, Clerk, Prisma, Trigger.dev, and Google Gemini.

## Features

- **Visual Workflow Builder**: Drag-and-drop node-based editor powered by React Flow
- **6 Node Types**: Text, Upload Image, Upload Video, Run Any LLM, Crop Image, Extract Frame
- **AI Integration**: Google Gemini models (Flash, Pro, etc.) for LLM tasks
- **Media Processing**: Transloadit for image cropping and video frame extraction
- **Background Tasks**: Trigger.dev for reliable async task execution
- **Authentication**: Clerk auth with dark theme
- **Persistence**: PostgreSQL with Prisma ORM
- **DAG Validation**: Prevents cycles, validates connection types
- **Undo/Redo**: Full undo/redo with zundo (Cmd+Z / Cmd+Shift+Z)
- **Rate Limiting**: Token-bucket rate limiter on all API routes
- **SSRF Protection**: Blocks private IPs, cloud metadata, and dangerous URLs
- **User API Keys**: Bring your own Gemini/Transloadit/Trigger.dev keys via Settings page
- **History Panel**: Track all workflow runs with detailed results
- **Import/Export**: Save and load workflows as JSON
- **Sample Workflow**: Pre-built "Product Marketing Kit Generator"

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Canvas | @xyflow/react |
| State | Zustand + zundo (undo/redo) |
| Auth | Clerk |
| Database | PostgreSQL + Prisma 5 |
| AI | Google Gemini API |
| Tasks | Trigger.dev |
| Media | Transloadit |
| Styling | Tailwind CSS v4 |

---

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

| Tool | Version | How to install |
|------|---------|----------------|
| **Node.js** | v18.18+ (v20+ recommended) | [https://nodejs.org](https://nodejs.org) or `brew install node` |
| **npm** | v9+ (comes with Node.js) | Included with Node.js |
| **PostgreSQL** | v14+ | `brew install postgresql@16` (macOS) or [https://www.postgresql.org/download](https://www.postgresql.org/download) |
| **Git** | Any recent version | `brew install git` or [https://git-scm.com](https://git-scm.com) |

### Verify installations

```bash
node --version    # Should print v18.18.0 or higher
npm --version     # Should print 9.x or higher
psql --version    # Should print 14.x or higher
git --version     # Any version is fine
```

---

## Step-by-Step Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/AnantGp/pixel-perfect-clone.git
cd pixel-perfect-clone
```

> If you already have the project folder, just `cd` into it:
> ```bash
> cd "/Users/anant/Desktop/Projects/weavy.ai_clone project/weavy-clone"
> ```

---

### Step 2: Install dependencies

```bash
npm install
```

This installs all packages listed in `package.json` (~30 seconds).

---

### Step 3: Set up PostgreSQL database

#### 3a. Start PostgreSQL (if not already running)

```bash
# macOS (Homebrew)
brew services start postgresql@16

# Or if installed without version suffix:
brew services start postgresql
```

#### 3b. Create the database

```bash
# Open PostgreSQL shell
psql postgres

# Inside psql, run:
CREATE DATABASE weavy_clone;
CREATE USER weavy_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE weavy_clone TO weavy_user;
\q
```

> **Tip**: Replace `your_secure_password` with an actual password you'll remember.

---

### Step 4: Get your API keys

You need API keys from 2 required services (and 2 optional ones):

#### 4a. Clerk (REQUIRED — Authentication)

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com) and sign up / sign in
2. Click **"Create application"**
3. Give it a name (e.g., "Weavy Clone")
4. Enable **Email** as a sign-in method
5. Copy the **Publishable Key** (`pk_test_...`) and **Secret Key** (`sk_test_...`)

#### 4b. Google Gemini (REQUIRED — AI/LLM)

1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Copy the key (`AIzaSy...`)

> A Gemini API key is already included in `.env.local` for development. You can use it or replace it with your own.

#### 4c. Transloadit (OPTIONAL — Image/Video processing)

1. Go to [https://transloadit.com](https://transloadit.com) and sign up
2. Navigate to **API Credentials** in Dashboard  
3. Copy the **Auth Key** and **Auth Secret**

> Without Transloadit, Crop Image and Extract Frame nodes will return the original file as a placeholder.

#### 4d. Trigger.dev (OPTIONAL — Background task execution)

1. Go to [https://trigger.dev](https://trigger.dev) and sign up
2. Create a new project
3. Copy the **Secret Key** (`tr_dev_...`)

> Without Trigger.dev, tasks execute inline (synchronously). Everything still works.

---

### Step 5: Configure environment variables

Open `.env.local` in the project root and replace the placeholder values:

```bash
# Open in VS Code
code .env.local

# Or use any text editor
nano .env.local
```

Update the file with your actual keys:

```env
# Database — update user, password, and database name to match Step 3b
DATABASE_URL="postgresql://weavy_user:your_secure_password@localhost:5432/weavy_clone"

# Clerk — from Step 4a
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXX
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Google Gemini — from Step 4b
GOOGLE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXX

# Transloadit (optional) — from Step 4c
NEXT_PUBLIC_TRANSLOADIT_KEY=your_transloadit_key
TRANSLOADIT_AUTH_SECRET=your_transloadit_secret

# Trigger.dev (optional) — from Step 4d
TRIGGER_SECRET_KEY=your_trigger_secret_key
```

> **Important**: The `DATABASE_URL` must exactly match your PostgreSQL credentials from Step 3b.

---

### Step 6: Push database schema

This creates the database tables (User, Workflow, WorkflowRun, UserApiKey):

```bash
npx prisma db push
```

Expected output:
```
Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

> **If you get a connection error**: Double-check that PostgreSQL is running and your `DATABASE_URL` in `.env.local` is correct.

---

### Step 7: Run the development server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 16.1.6 (Turbopack)
- Local:   http://localhost:3000
```

---

### Step 8: Open in browser

Go to **[http://localhost:3000](http://localhost:3000)**

You should see the landing page. Click **"Get Started"** to sign up via Clerk, then you'll land on the **Dashboard**.

---

### Step 9 (Optional): Start Trigger.dev worker

If you configured Trigger.dev in Step 4d, start the worker in a **separate terminal**:

```bash
npx trigger.dev@latest dev
```

This enables background task execution for LLM, Crop Image, and Extract Frame nodes.

---

## Quick Start After Setup

Once setup is complete, you only need 2 commands to run the project:

```bash
cd weavy-clone
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

## How to Use the App

1. **Sign up / Sign in** via Clerk on the landing page
2. **Create a new workflow** from the Dashboard (click "+ New Workflow")
3. **Drag nodes** from the left sidebar onto the canvas
4. **Connect nodes** by dragging from output handles (bottom) to input handles (top)
5. **Configure nodes** — type text, upload images/video, select LLM model
6. **Click "Run"** to execute the entire workflow
7. **View results** in the History panel on the right
8. **Load the sample workflow** by clicking the ✨ sparkle button in the toolbar

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd + Z` | Undo |
| `Cmd + Shift + Z` | Redo |
| `Cmd + Y` | Redo (alternative) |

### Settings — Bring Your Own API Keys

Click the ⚙️ gear icon in the Dashboard header to go to **Settings**. You can add your own API keys for:

- **Google Gemini** — Your key is used instead of the server default
- **Transloadit** — For image/video processing
- **Trigger.dev** — For background task execution

---

## Common Issues & Troubleshooting

### "publishableKey passed to Clerk is invalid"

You haven't set valid Clerk keys. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com) → API Keys, and update `.env.local`.

### "Can't reach database server"

1. Check PostgreSQL is running: `brew services list | grep postgres`
2. Start it if needed: `brew services start postgresql@16`
3. Verify your `DATABASE_URL` in `.env.local` matches your database credentials

### "prisma db push" fails with "database does not exist"

Create the database first (Step 3b):
```bash
psql postgres -c "CREATE DATABASE weavy_clone;"
```

### Port 3000 already in use

```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
npm run dev -- -p 3001
```

### Node modules issues

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/page.tsx          # Workflow list
│   ├── settings/page.tsx           # API key management
│   ├── workflow/[id]/page.tsx      # Workflow editor
│   └── api/
│       ├── workflows/route.ts      # CRUD workflows
│       ├── execute/route.ts        # Run full workflow (DAG)
│       ├── trigger/route.ts        # Trigger individual tasks
│       ├── upload/route.ts         # File upload
│       └── settings/api-keys/      # User API key management
├── components/
│   ├── nodes/                      # 6 node components
│   └── workflow/                   # Editor, Canvas, Sidebar, History
├── lib/
│   ├── utils.ts                    # DAG, validation, helpers
│   ├── prisma.ts                   # Database client
│   ├── rate-limit.ts               # Token-bucket rate limiter
│   ├── ssrf-protection.ts          # URL safety validation
│   ├── api-keys.ts                 # User API key resolver
│   └── sampleWorkflow.ts           # Pre-built workflow
├── stores/workflowStore.ts         # Zustand + zundo store
├── trigger/                        # Trigger.dev task definitions
└── types/workflow.types.ts         # TypeScript interfaces
```

## Node Types

| Node | Inputs | Outputs | Description |
|------|--------|---------|-------------|
| Text | — | output (text) | Static text value |
| Upload Image | — | output (image) | Upload images |
| Upload Video | — | output (video) | Upload videos |
| Run Any LLM | system_prompt, user_message, images | output (text) | Gemini inference |
| Crop Image | image_url, x%, y%, width%, height% | output (image) | Crop with percentages |
| Extract Frame | video_url, timestamp | output (image) | Extract frame at time |

## Other Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Open Prisma Studio (GUI for database)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
```

## License

MIT