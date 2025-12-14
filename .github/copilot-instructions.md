# FarmLedge AI Coding Agent Instructions

## Project Overview
**FarmLedge** is a transparent agricultural supply chain platform that registers produce batches on-chain (Arbitrum Sepolia) with INR-denominated pricing, uses Stripe for off-chain payments, and employs verifier relayers to transfer ownership upon verified payment.

## Architecture Overview

### Full Stack Data Flow
```
Frontend (React/Vite) → Express Server (Node) → Stripe API + On-Chain Contract
         ↓                      ↓                        ↓
   wagmi + React Query   Relayer Account          AgriTruthChain.sol
   (Auth, Chain State)   (Batch Ops, Verify)      (Batch Registry)
```

### Frontend-Backend Proxying
- **Vite proxy** (`vite.config.ts`): All `/api/*`, `/create-checkout-session`, `/webhook` requests forward from `http://localhost:8000` → `http://localhost:3001`
- **Environment**: Client reads `VITE_*` vars from `server/.env` (see `envDir` in vite.config.ts)

### Key Architectural Decisions

1. **INR-Only Pricing On-Chain**: All batch prices stored as whole rupees (`uint256 basePriceINR`), not paise. Stripe amounts converted to paise (÷100) for API calls.
2. **Relayer-Based Verification**: Only the relayer account (from `RELAYER_PRIVATE_KEY`) can call `transferOwnershipByVerifier()` after Stripe payment confirmed.
3. **Idempotent Webhook Handling**: Server tracks `processedSessions` Set to prevent duplicate batch transfers if Stripe webhook retries occur.
4. **Role-Based Auth**: Six roles managed in `AuthContext.tsx`: `farmer`, `distributor`, `retailer`, `consumer`, `verifier`, `admin`. Each has separate profile pages and protected routes.

## Critical Developer Workflows

### Starting Development
```bash
# Root
npm install && cd server && npm install && cd ..

# Terminal 1: Frontend (http://localhost:8000)
npm run dev

# Terminal 2: Backend (http://localhost:3001)
npm run server:dev
```

### Deploying & Setup
1. Deploy `contracts/AgriTruthChain.sol` to Arbitrum Sepolia (Remix/Foundry)
2. Set `AGRI_TRUTH_CHAIN_ADDRESS` and `RELAYER_PRIVATE_KEY` in `server/.env`
3. One-time: `POST /api/setup-relayer-as-verifier` to make relayer an authorized verifier
4. Verify: `GET /api/chain-info` should show `isRelayerVerifier: true` and `hasBytecode: true`

### Build & Lint
```bash
npm run build                # Vite build (production)
npm run build:dev           # Development build
npm run lint                # ESLint check
npm run preview             # Preview production bundle locally
```

## Code Patterns & Conventions

### 1. Component Structure (React/shadcn)
- **Location**: `src/components/` for reusable, `src/pages/` for route handlers
- **UI Pattern**: All UI components in `src/components/ui/` imported from **shadcn** (Radix + Tailwind)
- **Example**: `Button`, `Dialog`, `Card` follow shadcn naming and composition
- **Forms**: Use `react-hook-form` + `@hookform/resolvers` (see `ConnectWallet.tsx`)

### 2. Authentication & Protected Routes
- **Context**: `AuthContext.tsx` stores `{ role, email, address }` in localStorage
- **Route Protection**: `ProtectedRoute.tsx` checks `user` and role; redirects to `/login` with `roleRequired` state
- **Usage**: Wrap routes like `<Route element={<ProtectedRoute role="farmer" />}><Route path="..." /></Route>`

### 3. Blockchain Interaction

#### Client-Side (React)
- **Config**: `src/lib/wagmi.ts` sets up wagmi config for Arbitrum Sepolia + injected (MetaMask) connector
- **Contract Reading**: Use `useContractRead` or fetch via server `/api/batch/:id`
- **Contract Writing**: Routes through server relayer endpoints to avoid gas on frontend

#### Server-Side (Node.js)
- **Viem Setup** (`server/src/index.js`):
  ```javascript
  const client = createPublicClient({ chain: arbitrumSepolia, transport })
  const wallet = createWalletClient({ account, chain: arbitrumSepolia, transport })
  ```
- **Read Batches**: `client.readContract()` with ABI from `server/src/contract.js`
- **Write Batches**: `wallet.writeContract()` (relayer signs), then `client.waitForTransactionReceipt()`

### 4. Stripe Payment Integration
- **Checkout**: Client POSTs batch details to `/create-checkout-session`
- **Amount Conversion**: INR whole rupees → paise (×100) for Stripe API; capped at 999,999,999,999 paise
- **Webhook**: `/webhook` endpoint validates Stripe signature, idempotency-checks, then calls `confirmPaymentAndTransfer()`
- **Redirect**: Post-payment, Stripe redirects to `/batch?id=...&paid=1&session_id=...`

### 5. Verification Status Lifecycle
- **On-Chain State**: `verificationStatus` is `0` (unverified) → `1` (pending) → `2` (verified)
- **Server Functions**: 
  - `getVerificationStatusChain(batchId)` → read from contract
  - `setVerificationStatusChain(batchId, statusLabel)` → relayer writes
- **Verifier Dashboard**: `StakeholderDashboard.tsx` shows unverified/pending batches; verifiers set status before transfer

### 6. Internationalization (i18n)
- **Setup**: `src/i18n/index.ts` configures i18next with 4 languages: en, hi, ta, or (Odia)
- **Translation Files**: `src/locales/{en,hi,ta,or}.json`
- **Usage**: `import { useTranslation } from 'react-i18next'` → `const { t } = useTranslation()` → `t('key')`
- **Persistence**: Language preference stored in localStorage

### 7. Data Fetching & Caching
- **React Query**: `QueryClient` initialized in `App.tsx`, provider wraps entire app
- **Hooks**: Use `useQuery()` for GET, `useMutation()` for POST/PUT
- **Server**: Express endpoints return enriched JSON (e.g., `currentHolderRole`, dates, prices computed from batch state)

## File Structure Reference

```
src/
  components/
    ui/                      # shadcn components (auto-generated)
    Navigation.tsx           # Header with i18n switcher
    ConnectWallet.tsx        # wagmi + role selection
    ProtectedRoute.tsx       # Route guards
    StakeholderDashboard.tsx # Role-specific batch UI
  context/
    AuthContext.tsx          # Auth state + localStorage sync
  pages/
    Index.tsx                # Home/landing
    Login.tsx                # Role + address login
    profiles/                # Farmer/Distributor/Retailer/Consumer detail pages
    BatchDetails.tsx         # Single batch view + payment UI
    Verifiers.tsx            # Verifier-only verification UI
  lib/
    contracts.ts             # ABI + address constants
    wagmi.ts                 # wagmi config
    addresses.ts             # Default test addresses
    utils.ts                 # Utility functions
  i18n/
    index.ts                 # i18next setup
  locales/
    en.json                  # English translations
    
server/
  src/
    index.js                 # Express app, Stripe + blockchain endpoints
    contract.js              # ABI + address exports
    verificationStore.js     # In-memory verification persistence
```

## Common Tasks & Patterns

### Adding a New Page
1. Create `src/pages/MyPage.tsx` (React component)
2. Add route in `App.tsx` (wrap with `ProtectedRoute` if needed)
3. Use `useAuth()` to check role, `useTranslation()` for i18n
4. Fetch data via `/api/*` endpoints or hook into wagmi

### Adding a New API Endpoint
1. In `server/src/index.js`, create `app.get/post('/api/...')`
2. Read/write chain state using `client.readContract()` / `wallet.writeContract()`
3. Use helper functions: `getVerificationStatusChain()`, `hasContractCode()`, etc.
4. Return JSON; let Vite proxy forward from frontend

### Updating Translations
1. Edit `src/locales/{en,hi,ta,or}.json` (keep keys consistent)
2. Use in component: `const { t } = useTranslation(); t('key')`
3. No rebuild needed; i18n reloads on save

### Smart Contract Changes
1. Update `contracts/AgriTruthChain.sol`
2. Deploy to Arbitrum Sepolia
3. Update ABI in `server/src/contract.js` and `src/lib/contracts.ts`
4. Update function calls in server endpoints or client components

## Important Constraints & Conventions

- **No Gas on Frontend**: Never use `writeContract()` client-side; route through `/api/*` relayer endpoints
- **Stripe Amount Format**: Always multiply INR by 100 (to paise); validate min/max bounds
- **Address Validation**: Use regex `/^0x[0-9a-fA-F]{40}$/` before calling chain
- **localStorage**: Auth user stored as `JSON.stringify({ role, email, address })` under key `"auth:user"`
- **Vite Env**: Client code accesses via `import.meta.env.VITE_*`; server reads `process.env` from `server/.env`

## Debugging Tips

- **Chain Issues**: `GET /api/chain-info` shows contract bytecode, relayer address, verifier status
- **Webhook Failures**: Check `processedSessions` Set; Stripe signature validation in `/webhook` endpoint
- **Role-Based Access**: Verify `AuthContext` localStorage has correct role; check `ProtectedRoute` redirect logic
- **i18n Missing Keys**: Check `src/locales/MASTER_KEYS.md` for exhaustive key list
- **Contract Calls**: Enable verbose logging in `server/src/index.js` viem operations; check RPC endpoint availability
