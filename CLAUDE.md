# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run setup` — first-time setup: install deps, generate Prisma client, run migrations
- `npm run dev` — start dev server (Next.js + Turbopack on port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm test` — run all tests (vitest with jsdom)
- `npx vitest run path/to/test.ts` — run a single test file
- `npm run db:reset` — reset the SQLite database

## Architecture

UIGen is an AI-powered React component generator. Users describe components via chat, an AI generates React code into a virtual file system, and a live preview renders the result in an iframe.

### Core Flow

1. User sends a chat message → `POST /api/chat` streams AI responses via Vercel AI SDK (`streamText`)
2. The AI calls two tools (`str_replace_editor` and `file_manager` in `src/lib/tools/`) to create/edit files in a server-side `VirtualFileSystem`
3. Tool calls are mirrored on the client via `FileSystemContext.handleToolCall` to keep the client-side VFS in sync
4. `PreviewFrame` transforms all VFS files using `@babel/standalone`, builds an import map with blob URLs (third-party deps via esm.sh, Tailwind via CDN), and renders in a sandboxed iframe

### Key Abstractions

- **VirtualFileSystem** (`src/lib/file-system.ts`) — in-memory tree-based file system; no disk writes. Serialized as JSON for persistence and sent with every chat request.
- **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`) — client-side Babel transform that converts JSX/TSX to ES modules and creates blob URLs + import maps for the preview iframe.
- **Mock Provider** (`src/lib/provider.ts`) — when `ANTHROPIC_API_KEY` is not set, a `MockLanguageModel` returns static code so the app runs without an API key.

### Context Providers

`MainContent` is wrapped by two providers:
- **FileSystemProvider** (`src/lib/contexts/file-system-context.tsx`) — owns the VFS instance, applies tool call side effects, tracks selected file
- **ChatProvider** (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK's `useChat`, sends serialized VFS with each request

### Routing

- `/` — anonymous users get `MainContent` directly; authenticated users redirect to most recent project
- `/[projectId]` — loads saved project (messages + VFS data) for authenticated users

### Data

- Prisma + SQLite (`prisma/schema.prisma`): `User` and `Project` models. Projects store messages and VFS data as JSON strings. Always reference `prisma/schema.prisma` when you need to understand the database structure.
- JWT auth via jose (`src/lib/auth.ts`), httpOnly cookies. Middleware protects `/api/projects` and `/api/filesystem`.
- Prisma client generates to `src/generated/prisma`.

### Generated Component Conventions

The AI prompt (`src/lib/prompts/generation.tsx`) requires: root `/App.jsx` as entry point, Tailwind for styling, `@/` import aliases for local files.

### UI

shadcn/ui (new-york style), Monaco editor, resizable panels (`react-resizable-panels`).
