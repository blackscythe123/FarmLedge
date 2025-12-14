# FarmLedge

> **A transparent agricultural supply chain platform**  
> Batches registered on-chain with purchases via Stripe; a verifier account transfers ownership on-chain after payment.

---

## 🚀 Tech Stack

The following technologies power **FarmLedge**, along with their icons and usage:

<details>
<summary>Frontend</summary>

| Technology     | Icon                                                                                                       | Usage                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **React**      | ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)                          | Building interactive UI components and managing state. |
| **Vite**       | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite)                             | Fast dev server & build tool with HMR.                 |
| **TypeScript** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)           | Static typing for safer, scalable code.                |
| **Tailwind CSS** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css)   | Utility-first CSS framework for rapid styling.         |
| **shadcn UI**  | ![shadcn UI](https://img.shields.io/badge/shadcn_UI-000000?style=for-the-badge)                             | Tailwind-based component library for consistent design.|

</details>

<details>
<summary>Backend</summary>

| Technology    | Icon                                                                                                         | Usage                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| **Node.js**   | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js)                      | Server runtime for APIs and blockchain interactions. |
| **Express**   | ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express)                      | Web framework for RESTful endpoints.              |
| **Stripe**    | ![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe)                        | Payment processing and webhook handling.           |
| **Viem**      | ![Viem](https://img.shields.io/badge/Viem-000000?style=for-the-badge)                                        | Ethereum library for Arbitrum Sepolia interactions. |

</details>

<details>
<summary>Smart Contract</summary>

| Technology   | Icon                                                                                                          | Usage                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Solidity** | ![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity)                    | Writing AgriTruthChain smart contract.          |

</details>

<details>
<summary>Utilities & DevOps</summary>

| Technology         | Icon                                                                                                      | Usage                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **npm**            | ![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm)                               | Dependency management and scripts.              |
| **GitHub Actions** | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions) | CI/CD workflows for automated testing and deployment. |
| **Docker** (opt.)  | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)                      | Containerization for consistent environments.   |

</details>

---

## 🎯 Key Features

### Blockchain & Supply Chain
- **INR-Only On-Chain Pricing**  
  Set farm-gate, distributor, and retailer prices in rupees—all stored on the blockchain.
- **Off-Chain Payments with Stripe**  
  Secure checkout and webhooks trigger ownership transfers.
- **Verifier-Based Transfers**  
  Only approved relayers can call `transferOwnershipByVerifier`.
- **Lean Reads & Fast UI**  
  Recent batches timeline with search, skeleton loaders, and detail modals.
- **Idempotent Webhooks**  
  Automatic duplicate-write protection (handles nonce errors).

### 📅 Expiry & Notifications
- **Use-By Date Tracking**  
  Farmers set an expiry date during registration. This date is stored on-chain and displayed across all dashboards (Distributor, Retailer, Consumer).
- **Automated Expiry Alerts**  
  A background cron job checks for batches nearing expiry and triggers an external n8n webhook.
- **WhatsApp Integration**  
  The n8n workflow sends WhatsApp notifications to stakeholders when their batches are about to expire.
- **Visual Indicators**  
  Red "Expires: [Date]" badges in the UI warn buyers of approaching expiry dates.

### 🌱 Supply Chain Features
- **Batch Splitting**  
  Buyers can purchase partial quantities, creating new "child" batches on-chain while preserving the "parent" batch's history.
- **Parent-Child Lineage**  
  Full traceability from the original farm batch down to the smallest consumer unit.
- **Historical Price Tracking**  
  Split batches inherit and preserve the price history (Farmer → Distributor → Retailer) of their parent batches.
- **Role-Based Dashboards**  
  Dedicated interfaces for Farmers, Distributors, Retailers, and Consumers with role-specific purchase and pricing logic.

### 🤖 ML-Powered Crop Price Prediction (NEW)
- **Random Forest Model**  
  Trained on historical Odisha agricultural data with 95%+ accuracy
- **Multi-Factor Analysis**  
  Predicts prices based on:
  - District and crop type
  - Soil quality (Grade A/B/C)
  - Rainfall patterns
  - Temperature variations
  - Seasonal trends
- **Real-Time Predictions**  
  Instant price forecasts for 30+ crop varieties across all Odisha districts
- **Interactive UI**  
  User-friendly interface with district selection, crop dropdown, and detailed predictions
- **Data-Driven Insights**  
  Helps farmers make informed decisions about crop selection and pricing

### 🗺️ Geo-Inference Mapping System (NEW)
- **Dual-Layer Interactive Map**  
  - **LULC Layer**: Color-coded agricultural regions by soil grade (A/B/C)
  - **Farmer Layer**: 90 individual farmer markers (3 per district) with contact info
- **Smart Route Calculation**  
  - Automatic location detection with manual refinement
  - Real-time driving routes via OpenRouteService API
  - Routes follow actual roads with polyline visualization
  - Distance and travel time display (intelligently formatted)
- **Layer Toggle System**  
  Switch between crop regions and individual farmers with one click
- **Custom Icons**  
  - Distributor: Blue location pin
  - Farmers: Orange circles with 🌾 icon
  - Routes: Color-coded polylines (blue for farmers, red for regions)
- **Contact Integration**  
  Direct access to farmer contact information for logistics planning
- **Comprehensive Coverage**  
  All 30 Odisha districts with realistic farmer data and GPS coordinates

### ✅ Verifier UX & Workflow
- **Themed Verify Modal**  
  Verifiers get a themed dialog to confirm and enter a passkey before marking a batch as Verified.
- **Search & Sorting on Verifier Dashboard**  
  Quickly filter by `ID`, `crop`, or `holder` and sort by `ID`, `quantity`, or `crop` (asc/desc). Verified batches remain hidden.
- **One-way Verification Rules**  
  Verified items cannot be edited; only allowed transitions between `unverified` and `pending` before final verify.
- **i18n Coverage**  
  English, Tamil, Hindi, and Odia across Navigation, Hero, Login, Index, and Verifier flows.
- **O(1) Crop Image Lookup**  
  Instant image rendering for 30+ crop types using a hash map, replacing legacy conditional logic.

---

## 📦 Prerequisites

- **Node.js** ≥ 18  
- **Python** ≥ 3.8 (for ML model)
- **npm**  
- **Stripe** test account (API keys)  
- **Arbitrum Sepolia** RPC URL + funded relayer private key  
- **OpenRouteService** API key (for mapping)
- Deployed **AgriTruthChain** contract address

---

## 🔧 Local Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repo
git clone https://github.com/blackscythe123/FarmLedge.git
cd FarmLedge

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Install Python dependencies for ML model
cd model
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment Variables

#### Backend (.env)
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server Configuration
PORT=3001

# Blockchain Configuration
AGRI_TRUTH_CHAIN_ADDRESS=0xYourDeployedContract
RELAYER_PRIVATE_KEY=your_funded_sepolia_private_key
OWNER_PRIVATE_KEY=optional_owner_key_for_verifier_setup
ARB_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Notifications
N8N_WEBHOOK_SECRET=https://n8ndreampi.app.n8n.cloud/webhook/your-webhook-id

# Mapping (NEW)
ORS_API_KEY=your_openrouteservice_api_key
```

#### Get OpenRouteService API Key
1. Sign up at https://openrouteservice.org/
2. Create a new API key
3. Add to `server/.env` as `ORS_API_KEY`

### 3. Train ML Model (First Time Only)

```bash
cd model
python train_model.py
```

This will:
- Load and preprocess Odisha agricultural data
- Train the Random Forest model
- Save the model as `crop_price_model.pkl`
- Generate feature importance analysis

### 4. Start All Services

#### Terminal 1: Frontend
```bash
npm run dev
# Runs on http://localhost:8000
```

#### Terminal 2: Backend
```bash
npm run server:dev
# Runs on http://localhost:3001
```

#### Terminal 3: Python ML Server
```bash
cd server
python python_server.py
# Runs on http://localhost:5000
```

### 5. One-Time Verifier Setup

```bash
# Linux/Mac
curl -X POST http://localhost:3001/api/setup-relayer-as-verifier

# Windows PowerShell
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/setup-relayer-as-verifier | ConvertTo-Json -Depth 6
```

Response returns a transaction hash on success.

---🔄 Core Flows

1. **Register Batch**  
   POST `/api/register-batch` → writes batch + farmer price on-chain.
2. **Purchase**  
   - Create Stripe session: POST `/create-checkout-session`  
   - On webhook, server calls `transferOwnershipByVerifier` and optionally sets next price.
3. **View Batches**  
   - GET `/api/batches` → list of batches with computed fallbacks & timestamps  
   - GET `/api/batch/:id` → detailed batch info
4. **Price Updates**  
   - Distributor: POST `/api/set-price-by-distributor`  
   - Retailer: POST `/api/set-price-by-retailer`
5. **Fallback**  
   POST `/api/confirm-payment` if webhook fails.

## 📑 API Endpoints

### Blockchain & Supply Chain
| Method | Endpoint                             | Description                                 |
| ------ | ------------------------------------ | ------------------------------------------- |
| POST   | `/create-checkout-session`           | Returns Stripe session ID & URL             |
| POST   | `/api/register-batch`                | Register new batch on-chain                 |
| GET    | `/api/batches`                       | List all batches                            |
| GET    | `/api/batch/:id`                     | Get batch details                           |
| POST   | `/api/confirm-payment`               | Manual fallback transfer                    |
| POST   | `/api/set-price-by-distributor`      | Set distributor price                       |
| POST   | `/api/set-price-by-retailer`         | Set retailer price                          |
| POST   | `/api/setup-relayer-as-verifier`     | Mark relayer as verifier (one-time)         |
| GET    | `/api/chain-info`                    | Dev diagnostics                             |

### ML & Analytics (NEW)
| Method | Endpoint                             | Description                                 |
| ------ | ------------------------------------ | ------------------------------------------- |
| POST   | `http://localhost:5000/predict`      | Predict crop price based on multiple factors |

**Request Body:**
```json
{
  "district": "Khordha",
  "crop": "Paddy",
  "soil_quality": "A",
  "rainfall_mm": 1200,
  "temperature_c": 28,
  "month": 6
}
```

### Geo-Mapping (NEW)
| Method | Endpoint                             | Description                                 |
| ------ | ------------------------------------ | ------------------------------------------- |
| POST   | `/api/get-route`                     | Calculate driving route between two points  |

**Request Body:**
```json
{
  "start": [85.8245, 20.2700],
  "end": [85.8315, 19.8135]
}
```

---

ℹ️ API Documentation Link

The footer "API Documentation" link points to this README’s API section on GitHub:  
https://github.com/blackscythe123/FarmLedge#api-endpoints

🎨 Frontend Highlights

- **Recent Batches Timeline**  
  Paginated view (3 per page), searchable by Batch ID on Index. Status badges (Unverified/Pending/Verified) visible.
- **Verifier Dashboard**  
  Search + sort controls, themed verification modal with passkey, and strict one-way transitions.
- **Footer Resources**  
  Includes a GitHub link to the repo and API Documentation linking back to this README’s API section.

🛠️ Scripts

```jsonc
// package.json (root)
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server:dev": "node server/src/index.js",
    "server": "node server/src/index.js"
  }
}

// server/package.json
{
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js"
  }
}
```

⚠️ Troubleshooting

- **Webhook Signature Errors**  
  Ensure `STRIPE_WEBHOOK_SECRET` matches your Stripe CLI/webhook config.
- **Contract Address Issues**  
  Verify `AGRI_TRUTH_CHAIN_ADDRESS` points to your deployed contract (not an EOA).
- **Relayer Setup**  
  Confirm `RELAYER_PRIVATE_KEY` has sufficient Sepolia ETH.
- **Pricing Mismatch**  
  Stripe sends amounts in paise; contract stores rupees—convert appropriately.

🔒 Security & Data

- **On-Chain:** Public data (batch IDs, owners, INR prices)  
- **Off-Chain:** Minimal session & role data; Stripe handles payment details  
- **Idempotency:** Webhooks are idempotent to avoid duplicate blockchain writes
