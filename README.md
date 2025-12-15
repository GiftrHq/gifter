# Gifter

AI-powered gifting concierge platform connecting thoughtful brands with people searching for the perfect gift.

## Monorepo Structure

This is a Turborepo monorepo containing all Gifter applications and shared packages.

```
gifter/
├── apps/
│   └── web/              # Marketing & prelaunch website (Next.js)
├── packages/
│   ├── typescript-config/  # Shared TypeScript configurations
│   └── ui/                 # Shared React components (coming soon)
├── brand/                  # Brand assets and copy
├── docs/                   # Documentation
└── assets/                 # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)

### Installation

```bash
# Install all dependencies
npm install

# Run all apps in development mode
npm run dev

# Run specific app
cd apps/web && npm run dev
```

## Available Scripts

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps and packages
- `npm run lint` - Lint all apps and packages
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean all build artifacts and node_modules

## Apps

### Web (`apps/web`)

Marketing and prelaunch website built with Next.js 16, TypeScript, and Tailwind CSS v4.

**Tech Stack:**
- Next.js 16 with App Router
- TypeScript
- Tailwind CSS v4
- Framer Motion

**Development:**
```bash
cd apps/web
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Shared Packages

### TypeScript Config (`packages/typescript-config`)

Shared TypeScript configurations used across all apps.

- `base.json` - Base configuration
- `nextjs.json` - Next.js specific configuration

## Tech Stack

- **Build System**: Turborepo
- **Package Manager**: pnpm
- **Language**: TypeScript
- **Frontend**: React, Next.js
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion

## Development Workflow

1. Create a new branch for your feature
2. Make changes in the relevant app or package
3. Turborepo automatically handles dependencies
4. Submit a PR when ready

## Deployment

- **Web**: Deploy to Vercel (recommended) or any Node.js platform
- **API**: Coming soon
- **Apps**: Coming soon

## Contributing

This is a private repository for the Gifter team.

## License

All rights reserved - Gifter 2024
