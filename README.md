# Smart Expense Tracker — Client

React + Vite frontend for the Smart Expense Tracker. Connects to the server API for auth, transactions, charts, and AI coaching.

## Requirements

- Node 18+
- npm

## Setup

1) Install deps:
```
npm install
```

2) Create `.env` in `smart-expense-tracker-client/`:
```
# API base URL (no trailing slash). Defaults to http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000
```

3) Start dev server:
```
npm run dev
```
By default Vite serves on http://localhost:5173

## Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint

## Environment Variables

- `VITE_API_BASE_URL` — The backend base URL. Used by `src/services/api.js`. If omitted, defaults to `http://localhost:5000`.

For production, create `.env.production` with the production API URL.

## How It Works

- API client: `src/services/api.js` creates an Axios instance with `baseURL` from `VITE_API_BASE_URL`. It attaches JWT from storage to `Authorization` header when present, and clears auth on 401.
- Storage utils: `src/utils/storage.js` manages token and user persistence.
- Routing/UI: pages under `src/pages/` (e.g., `Dashboard.jsx`) and components under `src/components/`.

## Run Client + Server

1) Start the server (see `smart-expense-tracker-server/README.md`).
2) Start this client with `npm run dev`.
3) Visit http://localhost:5173 and log in or register.

## Features

- Authentication (login/register)
- Transactions CRUD and filtering
- Charts via `react-chartjs-2` / `chart.js`
- Prediction and AI coach features when backend endpoints are enabled

## Troubleshooting

- 401 errors: The client clears the session when the token is invalid/expired. Log in again.
- CORS issues: Ensure server is running on the configured `VITE_API_BASE_URL` and CORS is enabled (server uses `cors()`).

## License

ISC
