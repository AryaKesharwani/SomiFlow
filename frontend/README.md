# SomiFlow Frontend

Modern web interface for SomiFlow - an autonomous DeFi automation platform built on Lit Protocol.

## Overview

SomiFlow enables users to build, simulate, and execute automated DeFi strategies using a visual workflow builder. The frontend provides an intuitive interface for creating complex DeFi automations with trustless PKP-powered execution.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **React Router** - Client-side routing
- **Motion** - Animations (terminal components)
- **shadcn/ui** - Component library
- **Vincent SDK** - Authentication via Lit Protocol

## Features

- 🔐 **Vincent Authentication** - Secure wallet-based auth via Lit Protocol
- 🎨 **Professional Terminal UI** - Command-line styled components throughout
- 🔄 **Visual Workflow Builder** - Drag-and-drop DeFi automation builder
- 📊 **Real-time Dashboard** - Track workflows, executions, and success rates
- 🤖 **AI-Powered Creation** - Natural language workflow generation
- 🔒 **PKP Integration** - Trustless, non-custodial execution

## Getting Started

### Prerequisites

- Node.js 20+ (recommended)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys and configuration

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui and custom components
│   └── ...
├── pages/           # Route pages
├── contexts/        # React contexts (Auth, etc.)
├── lib/            # Utilities and API clients
├── config/         # Configuration files
└── assets/         # Static assets
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:5000
VITE_VINCENT_CLIENT_ID=your_client_id
VITE_VINCENT_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

This project is part of ETHOnline submission. Contributions welcome!

## License

MIT

