# How We Built Weavy.ai Clone — A Complete Beginner's Guide

> This guide assumes you know **nothing** about web development. It explains every concept, technology, file, and decision from the ground up.

---

## Table of Contents

1. [What Are We Building?](#1-what-are-we-building)
2. [How Websites Work — The Basics](#2-how-websites-work--the-basics)
3. [The Technologies We Used (and Why)](#3-the-technologies-we-used-and-why)
4. [Project Structure — Where Everything Lives](#4-project-structure--where-everything-lives)
5. [The Foundation — Next.js App Setup](#5-the-foundation--nextjs-app-setup)
6. [Styling — Making It Look Good](#6-styling--making-it-look-good)
7. [The Marketing Landing Page — 10 Animated Sections](#7-the-marketing-landing-page--10-animated-sections)
8. [Authentication — Who Is the User?](#8-authentication--who-is-the-user)
9. [Database — Storing Data Permanently](#9-database--storing-data-permanently)
10. [State Management — Remembering Things in the Browser](#10-state-management--remembering-things-in-the-browser)
11. [The Workflow Canvas — Drag & Drop Nodes](#11-the-workflow-canvas--drag--drop-nodes)
12. [The 6 Node Types — What Each Node Does](#12-the-6-node-types--what-each-node-does)
13. [API Routes — The Backend Logic](#13-api-routes--the-backend-logic)
14. [AI Integration — Google Gemini](#14-ai-integration--google-gemini)
15. [Task Execution — Running the Workflow](#15-task-execution--running-the-workflow)
16. [Security Features](#16-security-features)
17. [Putting It All Together — The Full Flow](#17-putting-it-all-together--the-full-flow)
18. [Glossary of Terms](#18-glossary-of-terms)

---

## 1. What Are We Building?

**Weavy.ai** is a visual tool for building AI workflows by connecting boxes (called "nodes") on a canvas. Think of it like a flowchart maker, but each box actually DOES something — one box might hold text, another uploads an image, another runs AI to generate content.

We built a **pixel-perfect clone** of this tool. Our clone has two major parts:

### Part 1: The Marketing Landing Page

A fully animated, scroll-driven landing page that recreates the real weavy.ai homepage. It features:
- Smooth scrolling (Lenis)
- Scroll-aware animated navbar
- An interactive React Flow hero canvas
- A sticky section showcasing 15 AI models
- Parallax compositing editor preview
- Auto-scrolling workflow carousel
- All matched to real weavy.ai design, content, and imagery

### Part 2: The Workflow Builder

The actual application where users build AI workflows:

```
User signs up → Creates a workflow → Drags nodes onto canvas → 
Connects them with lines → Clicks "Run" → AI processes everything → 
Shows results
```

**Real-world example**: You could build a workflow that:
1. Uploads a product photo
2. Crops it to a square
3. Writes marketing copy about it using AI
4. Outputs the text

---

## 2. How Websites Work — The Basics

### What is a website?

A website is made of 3 layers:

| Layer | Language | What it does | Analogy |
|-------|----------|-------------|---------|
| **Structure** | HTML | Defines WHAT is on the page (text, buttons, images) | The skeleton of a building |
| **Style** | CSS | Defines HOW it looks (colors, sizes, spacing) | The paint and decoration |
| **Behavior** | JavaScript | Defines WHAT HAPPENS when you click/type/interact | The electrical wiring |

### Frontend vs Backend

```
┌─────────────────────────────────┐
│         YOUR BROWSER            │  ← FRONTEND (what you see)
│   HTML + CSS + JavaScript       │
│   React components              │
└──────────────┬──────────────────┘
               │ HTTP requests
               ▼
┌─────────────────────────────────┐
│          THE SERVER             │  ← BACKEND (behind the scenes)
│   API routes (Node.js)          │
│   Database queries              │
│   AI API calls                  │
└─────────────────────────────────┘
```

- **Frontend**: The part that runs in your browser. It's what you see and interact with.
- **Backend**: The part that runs on a server. It handles data storage, authentication, and AI calls.

### What is an API?

API = **Application Programming Interface**. It's a way for two programs to talk to each other.

When you click "Run" in our app:
1. The **frontend** (browser) sends a message to the **backend** (server): *"Hey, run this workflow"*
2. The **backend** processes it, calls AI, and sends back: *"Here are the results"*
3. The **frontend** displays the results

That message-passing system IS the API.

### What is a URL / Route?

A **URL** is an address: `http://localhost:3000/dashboard`

A **route** is the path part: `/dashboard`

Our app has these routes:
- `/` → Landing page
- `/sign-in` → Login page
- `/dashboard` → Your workflows list
- `/workflow/abc123` → Edit a specific workflow
- `/settings` → Manage API keys
- `/api/workflows` → Backend endpoint (not a visible page)

---

## 3. The Technologies We Used (and Why)

### The Language: TypeScript

**JavaScript** is the programming language of the web. Every browser understands it.

**TypeScript** is JavaScript with **types**. Types prevent bugs by telling the computer what kind of data to expect.

```typescript
// JavaScript — no types, can cause bugs:
let name = "Viswajit";
name = 42;  // No error, but probably a bug!

// TypeScript — with types, catches bugs early:
let name: string = "Viswajit";
name = 42;  // ❌ ERROR! TypeScript says: "42 is not a string"
```

**Why use it?** It catches mistakes before your code runs. In a big project like ours, this saves hours of debugging.

---

### The Framework: Next.js

A **framework** is a pre-built structure that gives you a head start. Instead of writing everything from scratch, you follow the framework's patterns and it handles the boring stuff.

**React** (made by Facebook/Meta) is a library for building user interfaces. You write small reusable pieces called **components**.

**Next.js** (made by Vercel) is a framework built ON TOP of React. It adds:

| Feature | What it means |
|---------|--------------|
| **File-based routing** | Create a file at `app/dashboard/page.tsx` → your app automatically has a `/dashboard` page |
| **Server components** | Some code runs on the server (fast, secure) |
| **Client components** | Some code runs in the browser (interactive) |
| **API routes** | Create backend endpoints by adding files in `app/api/` |
| **Built-in optimization** | Automatic image optimization, code splitting, etc. |

**Why use it?** It combines frontend AND backend in one project. No need to maintain two separate codebases.

---

### The Canvas: React Flow (@xyflow/react)

This is the library that gives us the **drag-and-drop canvas** with nodes and edges (connecting lines). We use it in TWO places:

1. **The Workflow Editor** — where users build real AI workflows
2. **The Hero Section** — on the landing page, a decorative interactive canvas that shows off a sample workflow with custom card-style nodes

Without React Flow, we'd have to write thousands of lines of code to handle:
- Dragging boxes around
- Drawing lines between them
- Zooming and panning
- Selecting and deleting nodes
- The minimap in the corner

React Flow gives us all of this out of the box. We just define what each node LOOKS like.

---

### Animations: Framer Motion

**Framer Motion** is the animation library used throughout the landing page. It provides:

```tsx
// Animate an element when it enters the viewport:
<motion.div
  initial={{ opacity: 0, y: 50 }}     // Start invisible, 50px below
  whileInView={{ opacity: 1, y: 0 }}   // Fade in and slide up when visible
  transition={{ duration: 0.8 }}        // Take 0.8 seconds
>
  <h2>Hello World</h2>
</motion.div>
```

We use Framer Motion for:
- **Scroll-aware navbar** — shrinks the "Start Now" button as you scroll
- **Section reveals** — elements fade/slide in when you scroll to them
- **Parallax effects** — editor preview moves opposite to mouse position
- **AnimatePresence** — smooth transitions between "Workflow" and "App Mode" views
- **Carousel motion** — infinite auto-scrolling workflow cards

---

### Smooth Scrolling: Lenis

**Lenis** provides buttery-smooth scrolling across the entire page. Instead of the browser's native jerky scroll behavior, Lenis interpolates scroll position with easing:

```tsx
// SmoothScroll.tsx — wraps the entire page
const lenis = new Lenis({ lerp: 0.1 });  // 0.1 = smooth interpolation factor
```

Without Lenis, the scroll-driven sticky sections and parallax effects would feel choppy.

---

### Validation: Zod

**Zod** validates data shapes at runtime. Every API route validates incoming requests:

```typescript
// Example: validate a workflow save request
const WorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

// If the data doesn't match, Zod throws a detailed error
const data = WorkflowSchema.parse(requestBody);
```

This prevents malformed requests from reaching the database or AI services.

---

### Authentication: Clerk

**Authentication** = knowing WHO the user is (sign up, log in, log out).

**Clerk** is a service that handles all of this for us. Instead of building login forms, password hashing, email verification, session management from scratch (which is extremely complex and security-sensitive), we just:

1. Sign up at clerk.com
2. Get API keys
3. Wrap our app in `<ClerkProvider>`
4. Use `<SignIn />` and `<UserButton />` components

Clerk handles everything: secure password storage, session cookies, OAuth (Google login), etc.

---

### Database: PostgreSQL + Prisma

**PostgreSQL** (often called "Postgres") is a **database** — a program that stores data permanently on disk. When you save a workflow, it goes into the database. When you reload the page, it loads from the database.

Think of it like a spreadsheet with tables:

```
Table: User
┌────────┬───────────┬──────────────────┐
│ id     │ clerkId   │ email            │
├────────┼───────────┼──────────────────┤
│ abc123 │ user_xxx  │ anant@gmail.com  │
└────────┴───────────┴──────────────────┘

Table: Workflow
┌────────┬──────────────┬───────────────┬─────────┐
│ id     │ name         │ nodes (JSON)  │ userId  │
├────────┼──────────────┼───────────────┼─────────┤
│ wf_001 │ My Workflow  │ [{...}, ...]  │ abc123  │
└────────┴──────────────┴───────────────┴─────────┘
```

**Prisma** is an **ORM** (Object-Relational Mapper). Instead of writing raw database queries:

```sql
-- Raw SQL (hard to read, error-prone):
SELECT * FROM "User" WHERE "clerkId" = 'user_xxx';
```

We write TypeScript:

```typescript
// Prisma (easy, type-safe):
const user = await prisma.user.findUnique({ where: { clerkId: 'user_xxx' } });
```

Prisma translates our TypeScript into SQL automatically, and gives us autocomplete + type checking.

---

### State Management: Zustand

**State** = the current data in your app at any moment. For our workflow editor:
- Which nodes are on the canvas?
- What are their positions?
- What text has the user typed?
- Is a workflow currently running?

**Zustand** is a tiny library that creates a **store** — a central place where all this state lives. Any component can read from it or update it.

```
Without Zustand:                    With Zustand:
                                    
Component A ──┐                     Component A ──┐
Component B ──┤ pass data around    Component B ──┤──→ STORE (single source of truth)
Component C ──┤ via props (messy)   Component C ──┘
Component D ──┘
```

**zundo** is an add-on for Zustand that gives us **undo/redo** for free. It remembers previous states and can go back/forward.

---

### Styling: Tailwind CSS

Normal CSS:
```css
/* styles.css */
.button {
  background-color: #8b5cf6;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}
```
```html
<button class="button">Click me</button>
```

**Tailwind CSS**:
```html
<!-- No separate CSS file needed! Classes directly in HTML: -->
<button class="bg-[#8b5cf6] text-white px-4 py-2 rounded-lg">Click me</button>
```

Each class does ONE thing:
- `bg-[#8b5cf6]` → background color purple
- `text-white` → white text
- `px-4` → horizontal padding
- `py-2` → vertical padding
- `rounded-lg` → rounded corners

**Why?** It's faster to write, easier to customize, and you never have to name CSS classes or switch between files.

---

## 4. Project Structure — Where Everything Lives

```
weavy-clone/
│
├── 📄 package.json          ← Lists all dependencies (libraries) and scripts
├── 📄 tsconfig.json          ← TypeScript configuration
├── 📄 next.config.ts         ← Next.js configuration (remote image patterns, etc.)
├── 📄 .env.local             ← SECRET keys (never commit to Git!)
├── 📄 trigger.config.ts      ← Trigger.dev configuration
│
├── 📁 prisma/
│   └── 📄 schema.prisma      ← Database table definitions (4 models)
│
├── 📁 public/
│   ├── 📄 base.png            ← Editor section compositing base image
│   └── 📄 wave.png            ← Workflow transition output image
│
└── 📁 src/                   ← ALL source code lives here
    │
    ├── 📄 middleware.ts       ← Runs BEFORE every request (auth check)
    │
    ├── 📁 app/               ← Pages and API routes (Next.js App Router)
    │   ├── 📄 layout.tsx      ← Root layout (Geist fonts, ClerkProvider, light theme)
    │   ├── 📄 page.tsx        ← Landing page (composes all marketing sections)
    │   ├── 📄 globals.css     ← Global styles + design tokens
    │   │
    │   ├── 📁 sign-in/        ← /sign-in page (Clerk)
    │   ├── 📁 sign-up/        ← /sign-up page (Clerk)
    │   ├── 📁 dashboard/      ← /dashboard page (workflow list)
    │   ├── 📁 settings/       ← /settings page (API keys)
    │   ├── 📁 workflow/
    │   │   └── 📁 [id]/       ← /workflow/:id page (dynamic route)
    │   │
    │   └── 📁 api/            ← Backend API routes
    │       ├── 📁 workflows/   ← CRUD operations for workflows
    │       ├── 📁 execute/     ← Run a complete workflow (DAG)
    │       ├── 📁 trigger/     ← Run individual tasks
    │       ├── 📁 upload/      ← Handle file uploads
    │       └── 📁 settings/    ← API key management
    │
    ├── 📁 components/         ← Reusable UI pieces
    │   ├── 📄 SmoothScroll.tsx ← Lenis smooth scroll wrapper
    │   ├── 📁 marketing/      ← 10 landing page sections
    │   │   ├── 📄 Navbar.tsx             ← Fixed header, scroll-aware CTA
    │   │   ├── 📄 HeroSection.tsx        ← Gradient hero with typography
    │   │   ├── 📄 HeroWorkflow.tsx       ← React Flow canvas (hero)
    │   │   ├── 📄 MobileHeroCards.tsx    ← Mobile card layout
    │   │   ├── 📄 StickyModelSection.tsx ← 15 AI models, sticky scroll
    │   │   ├── 📄 ToolSection.tsx        ← 11 scattered tool badges
    │   │   ├── 📄 EditorSection.tsx      ← Parallax compositing preview
    │   │   ├── 📄 WorkflowTransition.tsx ← Workflow → App Mode toggle
    │   │   ├── 📄 ExploreWorkflows.tsx   ← Auto-scroll carousel
    │   │   └── 📄 Footer.tsx            ← Dark sage footer
    │   ├── 📁 nodes/          ← The 6 node type components
    │   └── 📁 workflow/       ← Editor, Canvas, Sidebar, History
    │
    ├── 📁 lib/                ← Utility functions and configs
    │   ├── 📄 utils.ts        ← DAG validation, topological sort, parallel levels
    │   ├── 📄 prisma.ts       ← Database connection singleton
    │   ├── 📄 rate-limit.ts   ← Token-bucket rate limiting
    │   ├── 📄 ssrf-protection.ts ← URL safety validation
    │   ├── 📄 api-keys.ts     ← User API key resolver
    │   ├── 📄 validations.ts  ← Zod schemas for all API routes
    │   └── 📄 sampleWorkflow.ts  ← Pre-built demo workflow
    │
    ├── 📁 stores/
    │   └── 📄 workflowStore.ts ← Zustand + zundo store (undo/redo)
    │
    ├── 📁 trigger/            ← Background task definitions
    │   ├── 📄 llmTask.ts
    │   ├── 📄 cropImageTask.ts
    │   └── 📄 extractFrameTask.ts
    │
    └── 📁 types/
        └── 📄 workflow.types.ts  ← TypeScript type definitions
```

### Why this structure?

Next.js uses **file-based routing**. The folder structure IS the URL structure:

| File | URL |
|------|-----|
| `app/page.tsx` | `/` |
| `app/dashboard/page.tsx` | `/dashboard` |
| `app/workflow/[id]/page.tsx` | `/workflow/any-id-here` |
| `app/api/workflows/route.ts` | `/api/workflows` |

The `[id]` folder with brackets means it's a **dynamic route** — the `id` can be anything.

---

## 5. The Foundation — Next.js App Setup

### `layout.tsx` — The Root Layout

Every page in our app is wrapped in this layout. Think of it as a picture frame that's always there:

```tsx
// src/app/layout.tsx (simplified)

import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>          {/* Provides auth to the entire app */}
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}
                          antialiased bg-[#FBFBFB]`}>
          {children}         {/* ← Each page gets inserted HERE */}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**What's happening:**
1. `ClerkProvider` wraps everything so any page can check if the user is logged in
2. We use **Geist** and **Geist Mono** fonts (the same fonts used on the real weavy.ai)
3. The body has a light background (`#FBFBFB`) — matching weavy.ai's clean, light design
4. `{children}` is a placeholder — when you visit `/dashboard`, the dashboard page is inserted here

### `middleware.ts` — The Bouncer

This file runs BEFORE every page load. It's like a bouncer at a club:

```typescript
// src/middleware.ts (simplified)

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// These pages are open to everyone (no login required):
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();  // If NOT a public route → must be logged in!
  }
});
```

**What's happening:**
- Visit `/` → Public, anyone can see the landing page
- Visit `/dashboard` → NOT public, Clerk checks if you're logged in
- Not logged in? → Automatically redirected to `/sign-in`

### What is a "Component"?

A **component** is a reusable piece of UI written as a function:

```tsx
// A simple component
function Button({ text, onClick }) {
  return (
    <button onClick={onClick} className="bg-purple-500 text-white px-4 py-2 rounded">
      {text}
    </button>
  );
}

// Using it:
<Button text="Save" onClick={handleSave} />
<Button text="Delete" onClick={handleDelete} />
```

Components can contain other components, forming a tree:

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   └── UserButton
│   └── Page (children)
│       ├── Sidebar
│       ├── Canvas
│       │   ├── TextNode
│       │   ├── LLMNode
│       │   └── ...
│       └── HistoryPanel
```

### `'use client'` vs Server Components

In Next.js, components are **server components** by default — they run on the server, not in the browser.

But some things only work in the browser:
- Clicking buttons (`onClick`)
- Typing in inputs (`onChange`)
- Using `useState` (React state)
- Browser-only APIs

For those, you add `'use client'` at the top of the file:

```tsx
'use client';  // ← This component runs in the BROWSER

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);  // Needs browser
  return (
    <button onClick={() => setCount(count + 1)}>  {/* Needs browser */}
      Clicked {count} times
    </button>
  );
}
```

**In our app:**
- Server components: `dashboard/page.tsx` (loads data from DB)
- Client components: `WorkflowEditor.tsx`, `Sidebar.tsx`, all node components (need interactivity)

---

## 6. Styling — Making It Look Good

### Our Design System

The landing page uses a **light theme** that matches the real weavy.ai:

```
Page Background:   #FBFBFB  (off-white)
Hero Gradient:     #d6e8f1 → #dce3e9  (soft blue)
Yellow CTA:        #FEF3C7  (warm yellow for "Start Now" buttons)
Dark Sections:     #2b2d2a / #09090b  (for Explore, Footer)
Footer Sage:       #565955  (sage green container)
Text (dark):       #1a1a1a / #09090b  (near-black)
Text (light):      #ffffff  (on dark backgrounds)
Text (muted):      #6b7280  (gray descriptions)
Fonts:             Geist (body) + Geist Mono (code)
```

The **workflow editor** uses dark-themed React Flow overrides — so the canvas is dark while the rest of the app is light.

### How Tailwind Classes Map to Design

```tsx
<div className="bg-[#FBFBFB]">              {/* Page background: off-white */}
  <div className="bg-white                    {/* Card: white */}
              border border-gray-200          {/* Subtle gray border */}
              rounded-2xl                      {/* Large rounded corners */}
              p-6">                            {/* Padding: 24px */}
    <h2 className="text-[#09090b]              {/* Text: near-black */}
                text-3xl                       {/* Font size: 30px */}
                font-semibold                  {/* Font weight: 600 */}
                tracking-tight">               {/* Tight letter spacing */}
      Title
    </h2>
    <p className="text-gray-500 text-sm">      {/* Muted gray, small */}
      Description
    </p>
    <button className="bg-[#FEF3C7]           {/* Yellow background */}
                    text-[#09090b]             {/* Dark text */}
                    px-6 py-3                  {/* Generous padding */}
                    rounded-full               {/* Pill shape */}
                    hover:scale-105            {/* Grow on hover */}
                    transition-transform">     {/* Smooth transition */}
      Start Now
    </button>
  </div>
</div>
```

### Responsive Design

Tailwind makes responsive design easy with breakpoints:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

- `grid-cols-1` → On small screens: 1 column
- `md:grid-cols-2` → On medium screens (768px+): 2 columns
- `lg:grid-cols-3` → On large screens (1024px+): 3 columns

---

## 7. The Marketing Landing Page — 10 Animated Sections

The landing page (`src/app/page.tsx`) composes 10 marketing components inside a `SmoothScroll` wrapper. Each section is a separate React component in `src/components/marketing/`. Here's how they all work:

### Page Composition

```tsx
// src/app/page.tsx (simplified)
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/marketing/Navbar';
import HeroSection from '@/components/marketing/HeroSection';
// ... all 10 components

export default function Home() {
  return (
    <SmoothScroll>
      <Navbar />
      <HeroSection />
      <StickyModelSection />
      <ToolSection />
      <EditorSection />
      <WorkflowTransition />
      <ExploreWorkflows />
      <Footer />
    </SmoothScroll>
  );
}
```

### Component 1: SmoothScroll (wrapper)

Wraps the entire page with Lenis for buttery-smooth scroll behavior. Without it, scroll-driven animations would feel jerky.

```tsx
// Initializes Lenis and integrates with Framer Motion's scroll system
const lenis = new Lenis({ lerp: 0.1 });
```

### Component 2: Navbar

A fixed header that reacts to scroll position:

```
┌──────────────────────────────────────────────────────────┐
│  weavy   COLLECTIVE  ENTERPRISE  PRICING  REQUEST A DEMO │
│                                          SIGN IN [Start] │
└──────────────────────────────────────────────────────────┘
```

- Uses `useMotionValueEvent` from Framer Motion to track `scrollY`
- The yellow "Start Now" pill shrinks from wide to compact as you scroll
- Detects Clerk auth state — shows "SIGN IN" if logged out, links to dashboard if logged in
- Semi-transparent blur backdrop (`backdrop-blur-md`)

### Component 3: HeroSection

The first visual section with large typography:

```
┌──────────────────────────────────────────────────────────┐
│                    gradient bg (#d6e8f1)                  │
│                    + grid pattern overlay                 │
│                                                          │
│                        Weavy                             │
│                  Artistic Intelligence                    │
│                                                          │
│              [Run any visionary AI model]                 │
│                                                          │
│          ┌──────────────────────────────────┐             │
│          │    HeroWorkflow (React Flow)     │             │
│          │  ┌───┐  ┌───┐  ┌───┐            │             │
│          │  │img│──│LLM│──│txt│            │             │
│          │  └───┘  └───┘  └───┘            │             │
│          └──────────────────────────────────┘             │
└──────────────────────────────────────────────────────────┘
```

- `HeroWorkflow` renders a non-interactive React Flow canvas with 6 custom card-style nodes
- `MobileHeroCards` shows a vertical stacked card layout on mobile (hidden on desktop)

### Component 4: StickyModelSection

A 400vh tall scroll-driven section where a card sticks to the center of the viewport and AI model names cycle through as you scroll:

```
Scroll position 0%  → GPT img 1
Scroll position 7%  → Wan
Scroll position 14% → SD 3.5
...
Scroll position 93% → Bria
```

**How it works:**
1. The section is 400vh tall (4× viewport height)
2. Inside, a `sticky top-0` container locks the card in place
3. `useScroll` + `useTransform` from Framer Motion map scroll progress (0→1) to the active model index (0→14)
4. Each model has a background image or video loaded from the weavy.ai CDN
5. The card flips orientation at certain scroll thresholds

All **15 AI models**: GPT img 1, Wan, SD 3.5, Runway Gen-4, Imagen 3, Veo 3, Recraft V3, Kling, Flux Pro 1.1 Ultra, Minimax video, Ideogram V3, Luma ray 2, Minimax image 01, Hunyuan, Bria.

### Component 5: ToolSection

Scattered tool badges around a central hero image:

```
                 Rotate
          Crop          Blur
     Liquify    [CENTER IMG]    Text
          Color         Overlay
     Background   Upscale  Resize
                 Relight
```

- Each tool badge is absolutely positioned using percentage coordinates
- Uses `motion.img` (not Next.js `Image`) for the CDN-hosted images
- Images use `@2x.avif` format from the weavy.ai Webflow CDN

### Component 6: EditorSection

"Control the Outcome" section with a parallax compositing preview:

```
┌──────────────────────────────────────────────────────────┐
│              Control the Outcome                          │
│   Layers, type, and blends — all the tools to bring      │
│   your wildest ideas to life.                             │
│                                                          │
│        ┌─────────────────────────┐                       │
│        │    base.png (photo)     │  ← moves with mouse   │
│        │  + Astro overlay        │  ← parallax offset    │
│        │  + "ASTRO" text         │                       │
│        └─────────────────────────┘                       │
└──────────────────────────────────────────────────────────┘
```

- Tracks mouse position via `onMouseMove`
- Calculates parallax offset: each layer moves at different speeds
- Creates a compositing preview effect (base photo + overlay + text)

### Component 7: WorkflowTransition

A 200vh scroll-driven section that toggles between "Workflow" and "App Mode":

- Uses `useScroll` to detect scroll progress
- Before 50% → shows "From Workflow" view (node-based editor with floating nodes)
- After 50% → shows "to App Mode" view (prompt input with output panel)
- `AnimatePresence` handles smooth crossfade between the two views
- Floating nodes bounce with CSS keyframe animations

### Component 8: ExploreWorkflows

Auto-scrolling infinite carousel on a dark background:

```
┌──────────────────────────────────────────────────────────┐
│ bg: #2b2d2a                                              │
│                 Explore Our Workflows                     │
│    Browse and remix community favorites                   │
│                                                          │
│  ←← [Wan Lora] [Multiple] [Inflate] [Relight] [Logo] →→ │
│     auto-scrolling, infinite loop                         │
│                                                          │
│                    [Start Now]                             │
└──────────────────────────────────────────────────────────┘
```

- Duplicates the card array for seamless infinite scroll
- Uses CSS `@keyframes scroll` animation (not JS-driven)
- Cards show workflow thumbnails from the weavy.ai CDN

### Component 9: Footer

Dark sage-green footer with navigation and social links:

```
┌──────────────────────────────────────────────────────────┐
│ bg: #2b2d2a                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ bg: #565955 (sage container)                         │ │
│  │                                                      │ │
│  │  Artificial Intelligence + Human Creativity           │ │
│  │                                                      │ │
│  │  weavy description text                               │ │
│  │                                                      │ │
│  │  Get Started    Company      Connect    Resources     │ │
│  │  • Start Now    • About Us   • Discord  • Help Center │ │
│  │  • Enterprise   • Careers    • X        • Blog        │ │
│  │  • Collective   • Press      • LinkedIn • Tutorials   │ │
│  │  • Pricing                   • Instagram • Community  │ │
│  │                                                      │ │
│  │  [LinkedIn] [Instagram] [Discord]  © 2025 weavy inc   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                          │
│            ┌──────────────────────────────┐               │
│            │       Start Now              │  ← HUGE CTA   │
│            └──────────────────────────────┘               │
└──────────────────────────────────────────────────────────┘
```

- Social icons link to real weavy.ai social profiles
- The large "Start Now" CTA at the bottom links to `/sign-up`

---

## 8. Authentication — Who Is the User?

### How Clerk Works

```
                    ┌─────────────────┐
                    │  Clerk's Servers │
                    │  (they handle   │
                    │   passwords,    │
                    │   sessions)     │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐
│ Sign-In     │    │ Sign-Up     │    │ Our Middleware   │
│ Page        │    │ Page        │    │ (checks auth     │
│ (Clerk UI)  │    │ (Clerk UI)  │    │  on every request│
└─────────────┘    └─────────────┘    └─────────────────┘
```

### The Sign-In Page

```tsx
// src/app/sign-in/[[...sign-in]]/page.tsx

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <SignIn />  {/* ← Clerk renders the entire login form for us! */}
    </div>
  );
}
```

That's it! Clerk handles the form, validation, password hashing, email verification — everything.

### Using Auth in API Routes

```typescript
// In any API route:
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();       // Get the logged-in user's ID
  if (!userId) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }
  // userId is guaranteed to exist here
}
```

### Using Auth in Components

```tsx
// In any client component:
import { UserButton } from '@clerk/nextjs';

// This renders a circular avatar that, when clicked, shows
// a dropdown with "Sign out", "Manage account", etc.
<UserButton afterSignOutUrl="/" />
```

---

## 9. Database — Storing Data Permanently

### The Schema — Defining Tables

```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(cuid())   // Unique ID, auto-generated
  clerkId   String   @unique                // Links to Clerk's user
  email     String   @default("")
  name      String?                         // ? means optional
  workflows Workflow[]                      // One user has many workflows
  apiKeys   UserApiKey[]                    // One user has many API keys
}

model Workflow {
  id     String @id @default(cuid())
  name   String @default("Untitled Workflow")
  nodes  Json   @default("[]")    // Stores node data as JSON
  edges  Json   @default("[]")    // Stores edge data as JSON
  userId String
  user   User   @relation(...)    // Links back to the user
  runs   WorkflowRun[]            // One workflow has many runs
}

model WorkflowRun {
  id          String   @id @default(cuid())
  status      String   @default("running")  // "running", "completed", "failed"
  nodeResults Json     @default("[]")       // Results of each node
  startedAt   DateTime @default(now())
  duration    Int?                          // Seconds taken
}

model UserApiKey {
  id       String @id @default(cuid())
  provider String  // "gemini", "transloadit", "trigger"
  apiKey   String  // The actual key
  userId   String
  @@unique([userId, provider])  // One key per provider per user
}
```

### How We Use the Database

```typescript
// CREATE a workflow
const workflow = await prisma.workflow.create({
  data: {
    name: 'My Workflow',
    nodes: [...],
    edges: [...],
    userId: user.id,
  },
});

// READ all workflows for a user
const workflows = await prisma.workflow.findMany({
  where: { userId: user.id },
  orderBy: { updatedAt: 'desc' },
});

// UPDATE a workflow
await prisma.workflow.update({
  where: { id: 'wf_001' },
  data: { name: 'New Name', nodes: [...] },
});

// DELETE a workflow
await prisma.workflow.delete({ where: { id: 'wf_001' } });
```

### Why JSON Fields?

The `nodes` and `edges` fields store JSON (JavaScript Object Notation). This is because nodes and edges are complex nested structures that don't fit neatly into database columns:

```json
// A single node has MANY properties:
{
  "id": "node_1",
  "type": "text",
  "position": { "x": 100, "y": 200 },
  "data": { "text": "Hello world" }
}
```

Storing this as JSON in one column is much simpler than creating separate tables for positions, data, etc.

---

## 10. State Management — Remembering Things in the Browser

### The Problem

Imagine 5 different components all need to know the current list of nodes:
- Sidebar (to show count)
- Canvas (to render them)
- WorkflowEditor (to save them)
- HistoryPanel (to compare with past runs)
- Individual nodes (to read/write their own data)

Without a store, you'd pass data through every component (called **prop drilling**), which gets messy fast.

### The Solution: Zustand Store

```typescript
// src/stores/workflowStore.ts (simplified)

import { create } from 'zustand';

const useWorkflowStore = create((set, get) => ({
  // --- STATE (the data) ---
  nodes: [],
  edges: [],
  workflowName: 'Untitled Workflow',
  isExecuting: false,

  // --- ACTIONS (functions that change the data) ---
  setNodes: (nodes) => set({ nodes }),
  addNode: (type) => {
    const newNode = { id: generateId(), type, data: getDefaultData(type) };
    set({ nodes: [...get().nodes, newNode] });
  },
  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    });
  },
}));
```

### Using the Store

Any component can read and write:

```tsx
// In ANY component:
function MyComponent() {
  // Read state:
  const nodes = useWorkflowStore(state => state.nodes);
  const isExecuting = useWorkflowStore(state => state.isExecuting);
  
  // Write state:
  const addNode = useWorkflowStore(state => state.addNode);
  
  return (
    <button onClick={() => addNode('text')}>
      Add Text Node ({nodes.length} nodes total)
    </button>
  );
}
```

### Undo/Redo with zundo

We wrapped our store with `temporal` from zundo:

```typescript
import { temporal } from 'zundo';

const useWorkflowStore = create()(
  temporal(
    (set, get) => ({
      // ... same store as above
    }),
    {
      limit: 100,  // Remember last 100 states
      partialize: (state) => ({
        nodes: state.nodes,    // Only track these for undo
        edges: state.edges,
      }),
    }
  )
);
```

Now undo/redo just works:

```typescript
// Undo the last action:
useWorkflowStore.temporal.getState().undo();

// Redo:
useWorkflowStore.temporal.getState().redo();
```

---

## 11. The Workflow Canvas — Drag & Drop Nodes

### How React Flow Works

React Flow gives us a `<ReactFlow>` component that handles all the canvas interaction:

```tsx
// src/components/workflow/WorkflowCanvas.tsx (simplified)

import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';

// Tell React Flow about our custom node types:
const nodeTypes = {
  text: TextNode,           // When type="text", render TextNode component
  uploadImage: UploadImageNode,
  uploadVideo: UploadVideoNode,
  llm: LLMNode,
  cropImage: CropImageNode,
  extractFrame: ExtractFrameNode,
};

function WorkflowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore();

  return (
    <ReactFlow
      nodes={nodes}              // The boxes on the canvas
      edges={edges}              // The lines connecting them
      nodeTypes={nodeTypes}      // Our custom node components
      onNodesChange={onNodesChange}  // When a node is dragged/selected
      onEdgesChange={onEdgesChange}  // When an edge is deleted
      onConnect={onConnect}          // When a new edge is created
    >
      <Background variant="dots" />     {/* Dot grid pattern */}
      <Controls />                       {/* Zoom in/out buttons */}
      <MiniMap />                        {/* Small overview in corner */}
    </ReactFlow>
  );
}
```

### What Are Nodes and Edges?

**Node** = a box on the canvas:
```typescript
{
  id: "node_1",
  type: "text",                    // Which component to render
  position: { x: 100, y: 200 },   // Where on the canvas
  data: { text: "Hello world" },   // The node's internal data
}
```

**Edge** = a line connecting two nodes:
```typescript
{
  id: "edge_1",
  source: "node_1",         // From this node
  target: "node_2",         // To this node
  sourceHandle: "output",   // From its output handle
  targetHandle: "input",    // To its input handle
}
```

**Handle** = the small circle on a node where edges connect:
```
┌──────────────────┐
│   ● input        │  ← input handle (top of node)
│                  │
│   Text Node      │
│   "Hello world"  │
│                  │
│        output ●  │  ← output handle (bottom of node)
└──────────────────┘
```

### Drag-and-Drop from Sidebar

The Sidebar lets you drag new nodes onto the canvas:

```tsx
// Sidebar shows 6 node types:
const NODE_TYPES = [
  { type: 'text', label: 'Text', icon: Type, color: 'blue' },
  { type: 'uploadImage', label: 'Upload Image', icon: Image, color: 'green' },
  { type: 'uploadVideo', label: 'Upload Video', icon: Video, color: 'purple' },
  { type: 'llm', label: 'Run Any LLM', icon: Bot, color: 'yellow' },
  { type: 'cropImage', label: 'Crop Image', icon: Crop, color: 'orange' },
  { type: 'extractFrame', label: 'Extract Frame', icon: Film, color: 'pink' },
];

// When clicked, adds a node to the store:
onClick={() => addNode(type)}
```

---

## 12. The 6 Node Types — What Each Node Does

Each node is a React component. Here's a simplified look at each:

### 1. Text Node

**Purpose**: Holds a piece of text (like a sticky note)

```tsx
// Simplified TextNode.tsx
function TextNode({ id, data }) {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  
  return (
    <div className="bg-[#141414] border rounded-xl p-3 w-64">
      <div className="text-blue-400 font-semibold">Text</div>
      <textarea
        value={data.text || ''}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
        placeholder="Enter your text..."
      />
      <Handle type="source" position="bottom" id="output" />
    </div>
  );
}
```

**Handles**: output (bottom) → sends text to connected nodes

### 2. Upload Image Node

**Purpose**: Upload one or more images

When you click "Upload", it sends the file to `/api/upload`, which saves it to `public/uploads/` and returns a URL like `/uploads/abc123.jpg`.

**Handles**: output (bottom) → sends image URLs

### 3. Upload Video Node

**Purpose**: Upload a video file

Same as Upload Image but for video files. Shows a video player preview.

**Handles**: output (bottom) → sends video URL

### 4. LLM Node (Run Any LLM)

**Purpose**: Send text/images to Google Gemini AI and get a response

This is the most complex node:

```
      ┌─────────────────────────┐
  ●───│ system_prompt (input)   │  ← "You are a marketing expert"
  ●───│ user_message  (input)   │  ← "Write copy for this product"
  ●───│ images        (input)   │  ← Product photos
      │                         │
      │   Model: gemini-1.5-flash │  ← Dropdown to select AI model
      │                         │
      │   [Run] button          │
      │                         │
      │   Result: "Introducing  │  ← AI-generated text appears here
      │   our amazing new..."   │
      │                output ● │──→ sends result text
      └─────────────────────────┘
```

**Handles**: 3 inputs (top), 1 output (bottom)

### 5. Crop Image Node

**Purpose**: Crop an image by percentage coordinates

```
      ┌─────────────────────────┐
  ●───│ image_url     (input)   │
  ●───│ x_percent     (input)   │  ← or type 10 (%)
  ●───│ y_percent     (input)   │  ← or type 20 (%)
  ●───│ width_percent (input)   │  ← or type 50 (%)
  ●───│ height_percent(input)   │  ← or type 60 (%)
      │                         │
      │   Preview: [cropped img]│
      │                output ● │──→ sends cropped image URL
      └─────────────────────────┘
```

**Handles**: 5 inputs (top), 1 output (bottom)

### 6. Extract Frame Node

**Purpose**: Extract a still image from a video at a specific timestamp

```
      ┌─────────────────────────┐
  ●───│ video_url     (input)   │
  ●───│ timestamp     (input)   │  ← or use the slider
      │                         │
      │   ──●──────── 2.5s      │  ← slider to pick time
      │                         │
      │   Preview: [frame img]  │
      │                output ● │──→ sends frame image URL
      └─────────────────────────┘
```

**Handles**: 2 inputs (top), 1 output (bottom)

---

## 13. API Routes — The Backend Logic

### What is an API Route?

In Next.js, any `route.ts` file inside `app/api/` becomes a backend endpoint. The browser can send requests to it but never sees the code.

```
Browser                          Server
  │                                │
  │  POST /api/workflows           │
  │  { name: "My Workflow" }  ──→  │  route.ts receives the request
  │                                │  Saves to database
  │  ←──  { id: "wf_001" }        │  Sends back the response
  │                                │
```

### Our API Routes Explained

#### `/api/workflows` — CRUD (Create, Read, Update, Delete)

```typescript
// GET  /api/workflows       → List all user's workflows
// POST /api/workflows       → Create a new workflow
// PUT  /api/workflows       → Update an existing workflow
// DELETE /api/workflows?id= → Delete a workflow
```

#### `/api/execute` — Run a Full Workflow

This is where the magic happens. When you click "Run":

1. Receives the list of nodes and edges
2. Validates it's a valid **DAG** (no cycles)
3. Calculates **topological order** (which nodes to run first)
4. Executes each node in order
5. Passes output from one node as input to the next
6. Saves the results to the database

#### `/api/trigger` — Run a Single Task

Triggers one task (LLM, crop image, or extract frame) either via Trigger.dev or inline.

#### `/api/upload` — File Upload

Receives a file, validates type and size, saves to `public/uploads/`, returns the URL.

#### `/api/settings/api-keys` — User API Key Management

CRUD for user's personal API keys (Gemini, Transloadit, Trigger.dev).

---

## 14. AI Integration — Google Gemini

### What is Gemini?

Google Gemini is a large language model (LLM) — an AI that can understand and generate text. It can also understand images.

### How We Call Gemini

```typescript
// Simplified version of what happens in our LLM task:

import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Create a client with our API key
const genAI = new GoogleGenerativeAI('AIzaSy...');

// 2. Choose a model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// 3. Send a prompt and get a response
const result = await model.generateContent(
  'Write marketing copy for a smartphone'
);

const text = result.response.text();
// → "Introducing the future of mobile technology..."
```

### Available Models

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `gemini-1.5-flash` | Fast | Good | Quick tasks, testing |
| `gemini-1.5-pro` | Slower | Better | Complex analysis |
| `gemini-2.0-flash` | Fast | Best | Latest, most capable |

### User API Key Priority

When the LLM task runs, it looks for an API key in this order:

```
1. User's personal key (from Settings page) → Use this if it exists
2. Server's environment variable             → Fall back to this
3. Neither exists                             → Error: "No API key configured"
```

This is handled by `src/lib/api-keys.ts`.

---

## 15. Task Execution — Running the Workflow

### What is a DAG?

**DAG** = Directed Acyclic Graph. "Directed" means edges have a direction (A → B). "Acyclic" means no loops (A → B → C → A is NOT allowed).

```
Valid DAG:              Invalid (has a cycle):
  A → B → D              A → B
  A → C → D              ↑   ↓
                          D ← C
```

Our workflow must be a DAG because you can't have circular dependencies — Node B can't depend on Node C if Node C also depends on Node B.

### Topological Sort — Execution Order

**Topological sort** determines the order to run nodes so that every node runs AFTER the nodes it depends on.

```
Given this workflow:

  Text#1 ──→ LLM
  Text#2 ──→ LLM
  Image  ──→ Crop ──→ LLM

Topological order: [Text#1, Text#2, Image, Crop, LLM]
  (Text nodes and Image run first, then Crop, then LLM)
```

### The Execution Flow

```
Click "Run"
    │
    ▼
POST /api/execute
    │
    ├─ 1. Validate DAG (no cycles)
    ├─ 2. Get topological order
    ├─ 3. Create WorkflowRun record in database
    │
    ├─ 4. For each node in order:
    │     │
    │     ├─ Text/Image/Video → just pass through their data
    │     │
    │     ├─ LLM → POST /api/trigger { taskType: "llm", payload }
    │     │         ├─ Try Trigger.dev (background task)
    │     │         └─ Fall back to inline execution (Gemini API directly)
    │     │
    │     ├─ Crop → POST /api/trigger { taskType: "crop-image", payload }
    │     │         ├─ Try Trigger.dev
    │     │         └─ Fall back to Transloadit API directly
    │     │
    │     └─ Extract Frame → POST /api/trigger { taskType: "extract-frame", payload }
    │               ├─ Try Trigger.dev
    │               └─ Fall back to Transloadit API directly
    │
    ├─ 5. Collect all results
    ├─ 6. Update WorkflowRun record with results
    │
    └─ 7. Return results to frontend
```

### What is Trigger.dev?

Trigger.dev runs tasks **in the background**. Without it, if an LLM call takes 30 seconds, your browser would be frozen waiting.

With Trigger.dev:
1. We **trigger** a task (instant, returns a task ID)
2. We **poll** for results (check every second: "Is it done yet?")
3. When done, we get the result

Without Trigger.dev (our fallback):
- We run the task **inline** (directly in the API route)
- Simpler but less robust for production

---

## 16. Security Features

### Rate Limiting — Why and How

**Problem**: A malicious user could spam your API with thousands of requests per second, crashing your server.

**Solution**: Rate limiting — only allow X requests per Y seconds.

```
Request 1  ✅ Allowed  (9 tokens remaining)
Request 2  ✅ Allowed  (8 remaining)
...
Request 10 ✅ Allowed  (0 remaining)
Request 11 ❌ BLOCKED  → HTTP 429 "Too Many Requests"
                        "Retry-After: 10 seconds"
```

Our implementation uses a **token bucket** algorithm:
- Each user gets a bucket of N tokens
- Each request consumes 1 token
- Tokens refill over time
- When empty, requests are rejected

### SSRF Protection — Why and How

**SSRF** = Server-Side Request Forgery. It's an attack where someone tricks your server into making requests to INTERNAL networks.

**Example attack**: A user passes this URL as an image:
```
http://169.254.169.254/latest/meta-data/iam/security-credentials/
```
This is the cloud metadata endpoint — if your server fetches it, the attacker gets your cloud credentials!

**Our protection** blocks:
- `localhost`, `127.0.0.1` (your own machine)
- `10.x.x.x`, `192.168.x.x`, `172.16-31.x.x` (private networks)
- `169.254.169.254` (cloud metadata)
- Non-HTTP protocols (`ftp://`, `file://`)
- URLs with embedded credentials (`http://user:pass@evil.com`)
- Dangerous ports (22, 3306, 5432 — SSH, MySQL, PostgreSQL)

---

## 17. Putting It All Together — The Full Flow

Here's what happens when you use the app from start to finish:

```
1. USER VISITS http://localhost:3000
   │
   ├─ middleware.ts checks: Is "/" public? YES → show landing page
   ├─ SmoothScroll wraps the entire page with Lenis
   ├─ app/page.tsx renders all 10 marketing sections:
   │   ├─ Navbar (scroll-aware, Clerk auth detection)
   │   ├─ HeroSection (gradient bg + React Flow canvas)
   │   ├─ StickyModelSection (15 AI models, scroll-driven)
   │   ├─ ToolSection (scattered badges)
   │   ├─ EditorSection (parallax preview)
   │   ├─ WorkflowTransition (Workflow → App Mode)
   │   ├─ ExploreWorkflows (infinite carousel)
   │   └─ Footer (dark sage, social links)
   │
2. USER SCROLLS THROUGH LANDING PAGE
   │
   ├─ Lenis provides smooth scroll interpolation
   ├─ Framer Motion tracks scroll position for:
   │   ├─ Navbar CTA shrinking
   │   ├─ StickyModelSection model cycling (15 models)
   │   └─ WorkflowTransition view toggling
   │
3. USER CLICKS "Start Now" (yellow CTA)
   │
   ├─ Redirected to /sign-up
   ├─ Clerk renders sign-up form
   ├─ User creates account
   ├─ Clerk sets session cookie
   ├─ Redirected to /dashboard
   │
4. DASHBOARD LOADS
   │
   ├─ middleware.ts checks: Is user logged in? YES → continue
   ├─ dashboard/page.tsx (SERVER component):
   │   ├─ Gets userId from Clerk
   │   ├─ Finds/creates User in Prisma database
   │   ├─ Loads all workflows from database
   │   └─ Renders the page with stats and workflow list
   │
5. USER CLICKS "+ New Workflow"
   │
   ├─ Navigates to /workflow/new
   ├─ workflow/[id]/page.tsx loads:
   │   └─ id is "new" → creates empty WorkflowEditor
   │
6. USER DRAGS A TEXT NODE FROM SIDEBAR
   │
   ├─ Sidebar.onClick calls store.addNode('text')
   ├─ Store creates: { id: "node_1", type: "text", data: { text: "" } }
   ├─ Canvas re-renders with the new node
   │
7. USER TYPES IN THE TEXT NODE
   │
   ├─ TextNode.onChange calls store.updateNodeData("node_1", { text: "..." })
   ├─ zundo records this state change for undo/redo
   │
8. USER CONNECTS TWO NODES
   │
   ├─ React Flow detects drag from output handle to input handle
   ├─ onConnect creates: { source: "node_1", target: "node_2", ... }
   ├─ Connection validation checks: is this type-compatible?
   │
9. USER CLICKS "Save"
   │
   ├─ WorkflowEditor sends POST /api/workflows
   │   Body: { name, nodes, edges } → validated by Zod schema
   ├─ API route creates record in PostgreSQL via Prisma
   ├─ Returns { id: "wf_001" }
   ├─ URL changes to /workflow/wf_001
   │
10. USER CLICKS "Run"
    │
    ├─ WorkflowEditor sends POST /api/execute
    │   Body: { workflowId, nodes, edges }
    │
    ├─ Server validates DAG (no cycles)
    ├─ Server computes execution levels (parallel groups)
    ├─ Server creates WorkflowRun record
    │
    ├─ For each level (nodes at same level run in parallel):
    │   ├─ Text → immediately return { text: "..." }
    │   ├─ LLM → call Gemini API → return { output: "AI response..." }
    │   └─ Each node's output becomes the next level's input
    │
    ├─ Server saves all results to WorkflowRun record
    ├─ Returns results to frontend
    │
    └─ HistoryPanel shows the run with per-node results
```

---

## 18. Glossary of Terms

| Term | Meaning |
|------|---------|
| **AnimatePresence** | Framer Motion component that animates elements as they mount/unmount |
| **API** | A way for programs to communicate with each other |
| **API Key** | A secret password that lets you use a third-party service |
| **Backend** | Server-side code that handles data and logic |
| **CDN** | Content Delivery Network — serves images/files fast from edge servers |
| **Client** | The browser / frontend |
| **Component** | A reusable piece of UI (like a Lego block) |
| **CRUD** | Create, Read, Update, Delete — the 4 basic operations |
| **DAG** | Directed Acyclic Graph — a flowchart with no loops |
| **Database** | A program that stores data permanently |
| **Edge** | A connecting line between two nodes |
| **Endpoint** | A URL that the backend listens on (e.g., `/api/workflows`) |
| **Environment Variable** | A secret value stored outside the code (`.env.local`) |
| **Framer Motion** | Animation library for React (scroll, parallax, transitions) |
| **Framework** | A pre-built code structure (Next.js, React) |
| **Frontend** | Client-side code that runs in the browser |
| **Handle** | The small circle on a node where edges connect |
| **Hook** | A React function that lets you use features like state (`useState`) |
| **HTTP** | The protocol browsers use to communicate with servers |
| **JSON** | JavaScript Object Notation — a data format (`{ "key": "value" }`) |
| **Lenis** | Smooth scrolling library — interpolates scroll position |
| **LLM** | Large Language Model — AI that generates text (Gemini, ChatGPT) |
| **Middleware** | Code that runs between a request and its handler |
| **Node (React Flow)** | A box on the workflow canvas |
| **Node.js** | JavaScript runtime for servers (lets JS run outside browsers) |
| **npm** | Node Package Manager — installs JavaScript libraries |
| **ORM** | Object-Relational Mapper — translates code to database queries |
| **Parallax** | Visual effect where layers move at different speeds |
| **Props** | Data passed from parent component to child component |
| **Route** | A URL path that maps to a page or API endpoint |
| **Schema** | Definition of database tables and their columns |
| **Scroll-driven** | Animations/transitions triggered by scroll position, not time |
| **Server** | A computer that handles requests from browsers |
| **SSRF** | Server-Side Request Forgery — a security attack |
| **State** | Data that changes over time in your app |
| **Sticky** | CSS `position: sticky` — element sticks in place while scrolling |
| **Store** | A central place that holds state (Zustand in our app) |
| **Topological Sort** | Algorithm to order nodes so dependencies come first |
| **TypeScript** | JavaScript with type checking |
| **Zod** | Runtime validation library for TypeScript |

---

## What To Learn Next

If you want to understand this project deeper, learn in this order:

1. **HTML & CSS basics** → [freeCodeCamp](https://www.freecodecamp.org/)
2. **JavaScript fundamentals** → [javascript.info](https://javascript.info/)
3. **TypeScript** → [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
4. **React** → [react.dev](https://react.dev/learn)
5. **Next.js** → [nextjs.org/learn](https://nextjs.org/learn)
6. **Tailwind CSS** → [tailwindcss.com/docs](https://tailwindcss.com/docs)
7. **Prisma** → [prisma.io/docs](https://www.prisma.io/docs)
8. **Zustand** → [docs.pmnd.rs/zustand](https://docs.pmnd.rs/zustand)

---

*This guide was written to help you understand every piece of this project. Read it section by section, and refer to the actual source files as you go. The best way to learn is to change something in the code and see what happens!*