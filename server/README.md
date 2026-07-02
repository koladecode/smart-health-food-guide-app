# Smart Health & Food Guide - Express & TypeScript Backend API

This directory contains the production-ready backend foundation for the Smart Health & Food Guide platform, constructed with clean architectural boundaries.

## Architecture & Structure

The codebase is modularized into distinct separation of concerns:

```
server/
├── src/
│   ├── app.ts            # Configures Express application layers & middleware
│   ├── server.ts         # Server entry point, connection management & graceful shutdown
│   ├── config/           # Type-safe environment loaders using dotenv
│   ├── routes/           # Unified API routes divided by feature namespaces
│   ├── controllers/      # High-level handlers receiving requests & mapping responses
│   ├── middleware/       # Global & specialized interceptors (e.g. centralized error handler)
│   ├── services/         # Isolated business logic engines
│   ├── models/           # (Future integration) Database entities & tables definition
│   ├── utils/            # Shared structural utility routines
│   └── types/            # TypeScript domain schemas, interfaces & aliases
├── package.json          # Node script commands & package dependecies
├── tsconfig.json         # Strict TypeScript compiler options
├── .env.example          # Non-sensitive configuration variable keys
└── README.md             # This structural handbook
```

---

## Getting Started

### Prerequisites
- Node.js (version 18 or above recommended)
- NPM or another compatible package manager

### 1. Install Dependencies
Navigate to the `server` directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file from the example template:
```bash
cp .env.example .env
```

### 3. Start Development Server
Run the dev task to start the server with Hot Module Reloading (HMR) powered by `tsx`:
```bash
npm run dev
```
The server will bind to `0.0.0.0` and be accessible at `http://localhost:5000` (or your configured `PORT`).

---

## Build for Production

Compile the TypeScript files into pure, highly performant JavaScript:
```bash
npm run build
```
This will compile output files into the `./dist` folder. To start the compiled production server:
```bash
npm run start
```

---

## Active API Endpoints

### Health Diagnostics
- **`GET /api/health`**: Checks if the server is healthy. Returns status metadata.

### Placeholder Services (Feature Frameworks ready for Supabase/DB integration)
- **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Health Profiles**: `GET /api/profile`, `POST /api/profile`
- **Personalized Recommendations**: `GET /api/recommendations`
- **Admin System Utilities**: `GET /api/admin/stats`, `POST /api/admin/cache/clear`
