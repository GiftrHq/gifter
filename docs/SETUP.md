# Gifter Monorepo - Quick Setup Guide

## ✅ What Just Happened

Your Gifter project is now a production-ready Turborepo monorepo! Here's what was set up:

### Structure Created
```
gifter/
├── apps/
│   └── web/              # Your prelaunch website (moved from website/prelaunch)
├── packages/
│   ├── typescript-config/  # Shared TypeScript configs
│   └── ui/                 # Ready for shared components
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # Workspace configuration
└── package.json          # Root package with scripts
```

### Git Repository
- ✅ Initialized git with `main` branch
- ✅ Connected to: `git@github.com:GiftrHq/gifter.git`
- ✅ Initial commit pushed to GitHub

## 🚀 Getting Started

### 1. Install pnpm (if not already installed)
```bash
npm install -g pnpm@9
```

### 2. Install all dependencies
```bash
pnpm install
```

This will install:
- Root dependencies (Turborepo, TypeScript, Prettier)
- Web app dependencies (Next.js, React, Tailwind, etc.)
- All workspace packages

### 3. Start development
```bash
# Run all apps (currently just web)
pnpm dev

# Or run specific app
pnpm dev --filter=@giftr/web
```

Visit: http://localhost:3000

## 📦 Available Commands

### Root Level (run from `/gifter`)
```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps and packages
pnpm lint         # Lint all apps and packages
pnpm format       # Format code with Prettier
pnpm clean        # Clean all build artifacts
```

### App Specific (run from `/giftr`)
```bash
pnpm dev --filter=@giftr/web       # Run only web app
pnpm build --filter=@giftr/web     # Build only web app
pnpm lint --filter=@giftr/web      # Lint only web app
```

### Or navigate into app
```bash
cd apps/web
pnpm dev
```

## 🎯 Next Steps

### Add New App (e.g., API)
```bash
# Create new app
mkdir -p apps/api
cd apps/api
pnpm init

# Update package.json name to @giftr/api
# Turborepo will automatically detect it!
```

### Add New Package (e.g., shared utilities)
```bash
mkdir -p packages/utils
cd packages/utils
pnpm init

# Update package.json name to @giftr/utils
# Use it in apps by adding to their package.json
```

### Share Code Between Apps
```javascript
// In apps/web/package.json
{
  "dependencies": {
    "@giftr/utils": "workspace:*"
  }
}

// Then import in your code
import { helper } from '@giftr/utils'
```

## 🔧 Turborepo Features

### Caching
Turborepo caches build outputs. Second builds are instant!

### Parallel Execution
Builds and lints run in parallel across all apps.

### Pipeline
Dependencies are handled automatically. If `web` depends on `ui`, `ui` builds first.

## 📝 Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes**
   - Work in `apps/web` for website changes
   - Add shared code to `packages/`

3. **Commit & push**
   ```bash
   git add .
   git commit -m "feat: your feature"
   git push origin feature/your-feature
   ```

4. **Create PR on GitHub**

## 🚢 Deployment

### Web App (Vercel - Recommended)
1. Connect GitHub repo to Vercel
2. Set root directory to `apps/web`
3. Vercel auto-detects Next.js
4. Deploy!

Or use Vercel CLI:
```bash
cd apps/web
vercel
```

## 🆘 Troubleshooting

### Port 3000 in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or Next.js will auto-select next available port
```

### Dependencies not installing
```bash
# Clear everything and reinstall
pnpm clean
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Turborepo cache issues
```bash
# Clear Turborepo cache
rm -rf .turbo
pnpm build
```

## 📚 Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspace](https://pnpm.io/workspaces)
- [Next.js Docs](https://nextjs.org/docs)

---

**You're all set! 🎉**

Run `pnpm install` then `pnpm dev` to get started.
