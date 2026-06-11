# Heliactyl Next - Frontend

The React/Vite client for the Heliactyl Next (Toledo) dashboard, built using shadcn/ui, Radix UI, and Tailwind CSS.

## Structure

The workspace directory structure must look like this:
```text
├── frontend/
└── server/
```

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- pnpm (recommended)

### Commands

Install dependencies:
```bash
pnpm install
```

Start the development server:
```bash
pnpm run dev
```

Build for production:
```bash
pnpm run build
```
The compiled files are output to the `dist/` directory, which is served statically by the Toledo backend server.

> [!TIP]
> When deploying to a production server, you should build the frontend locally on your machine first, then upload only the `dist/` directory to the server's `frontend/` folder. This keeps the production server clean and avoids running memory-heavy builds on it.

## Configuration

The development server proxy is configured in `vite.config.js` to route `/api` and `/ws` to `http://localhost:3000` by default.