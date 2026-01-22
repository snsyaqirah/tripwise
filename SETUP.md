# TripWise Development Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/snsyaqirah/tripwise.git
   cd tripwise
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   # or with bun
   bun install
   ```

3. **Start Frontend Development Server**
   ```bash
   npm run dev
   # or with bun
   bun run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

## Project Commands

### Using Root Package.json

From the root directory, you can run:

```bash
# Frontend development
npm run dev:frontend

# Build frontend for production
npm run build:frontend

# Run frontend tests
npm run test:frontend

# Lint frontend code
npm run lint:frontend

# Install all dependencies
npm run install:all
```

### Direct Frontend Commands

Navigate to `frontend/` directory:

```bash
cd frontend

# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code
```

## Project Structure

```
tripwise/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # React Context providers
│   │   ├── lib/          # Utility libraries
│   │   ├── types/        # TypeScript type definitions
│   │   └── data/         # Static data and mocks
│   ├── public/           # Static assets
│   └── ...config files   # Vite, TypeScript, Tailwind configs
│
├── backend/              # Backend API (coming soon)
│   └── README.md
│
├── .gitignore           # Git ignore rules
├── package.json         # Root workspace configuration
└── README.md            # Main project documentation
```

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Vitest** - Unit testing

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# API Configuration (when backend is ready)
VITE_API_URL=http://localhost:3000/api

# Other environment variables as needed
```

## Git Workflow

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit
   ```bash
   git add .
   git commit -m "feat: description of changes"
   ```

3. Push to GitHub
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

## Deployment

### Frontend Deployment

The frontend can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

Build command: `npm run build`
Output directory: `dist/`

## Troubleshooting

### Port Already in Use
If port 5173 is in use, Vite will automatically try the next available port.

### Module Not Found
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
Ensure all dependencies are installed and TypeScript has no errors:
```bash
cd frontend
npm install
npm run lint
```

## Need Help?

- Check [frontend/README.md](frontend/README.md) for frontend-specific docs
- Open an issue on GitHub
- Contact the development team

## License

MIT
