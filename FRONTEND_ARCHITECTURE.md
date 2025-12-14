# Frontend Architecture & User Flow

This document provides a comprehensive guide to the frontend structure, component hierarchy, and detailed user flows of the Agri-Truth Chain application. It is designed to help developers and stakeholders visualize the application's layout and functionality without needing to run the code.

## 🛠 Tech Stack

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Blockchain Interaction**: Wagmi & Viem
- **Routing**: React Router
- **State Management**: React Context (AuthContext)
- **Internationalization**: Custom i18n implementation (English, Hindi, Tamil, Odia)

---

## 🧩 Core Layout & Navigation

### Global Navigation (`src/components/Navigation.tsx`)
The application features a **fixed, responsive top navigation bar** that persists across all pages.
- **Left**: "FarmLedge" Logo with a leaf icon.
- **Center (Desktop)**: Navigation links that dynamically appear based on the user's role.
- **Right**:
  - **Language Switcher**: A dropdown to toggle between languages.
  - **Login/User Button**: Shows "Login" if disconnected, or the user's connected wallet address if logged in.
- **Mobile**: A hamburger menu (`Menu` icon) that expands a drawer with all navigation links.

### Footer (`src/components/Footer.tsx`)
A standard footer containing copyright information and links to legal pages (Privacy, Terms).

---

## 🔄 Detailed User Flows & Page Layouts

### 1. Public Landing Page (`src/pages/Index.tsx`)
**Goal**: Provide transparency to the public and allow anyone to search for batch provenance.

- **Hero Section**: Welcoming text explaining the platform's purpose.
- **Search Bar**: A prominent input field to search for specific Batch IDs.
- **Recent Batches Feed**:
  - A vertical list of cards representing recent agricultural batches.
  - **Card Layout**:
    - **Left**: Batch ID badge (e.g., `#105`), Crop Name, Quantity.
    - **Middle**: Price breakdown (Farmer → Distributor → Retailer).
    - **Right**: Current Owner badge (e.g., "Retailer") and Verification Status (Verified/Pending).
    - **Timeline**: A visual indicator showing the batch's progress through the supply chain (Farmer → Distributor → Retailer → Consumer).
- **Batch Details Modal**: Clicking a card opens a dialog with full details:
  - Timestamps for every transfer.
  - Exact prices at each stage.
  - Links to the detailed `BatchDetails` page.

### 2. Login / Onboarding (`src/pages/Login.tsx`)
**Goal**: Authenticate users into their specific supply chain role.

- **Layout**: A centered card on a clean background.
- **Role Selection Tabs**: Five tabs at the top of the card:
  1. **Farmer**
  2. **Distributor**
  3. **Retailer**
  4. **Consumer**
  5. **Verifier**
- **Form**:
  - **Email & Password**: Standard input fields (currently mock authentication).
  - **"Continue" Button**: Logs the user in and redirects them to their specific dashboard.
  - *Note*: In a production environment, this would also trigger a wallet connection request.

### 3. Farmer Dashboard (`src/pages/Farmers.tsx`)
**Goal**: Allow farmers to register new produce batches on the blockchain.

- **Top Section**: "Register New Batch" Form (Card).
  - **Inputs**:
    - **Crop Type**: Text input (e.g., "Organic Potatoes").
    - **Quantity (kg)**: Number input.
    - **Price per kg (₹)**: Number input.
    - **Harvest Date**: Date picker.
    - **Farmer Address**: Input for the wallet address (auto-filled).
  - **Action**: "Register Batch" button triggers a blockchain transaction.
- **Bottom Section**: "My Batches" List.
  - A grid of cards showing batches created by the logged-in farmer.
  - Each card links to the `BatchDetails` page.

### 4. Distributor Dashboard (`src/pages/Distributors.tsx`)
**Goal**: Enable distributors to buy verified produce from farmers.

- **Browse & Buy Section** (Card):
  - **Batch Selector**: A dropdown menu listing all *verified* batches currently owned by Farmers.
  - **Batch Info**: When a batch is selected, a gray box appears showing available quantity and price/kg.
  - **Purchase Options**:
    - **"Purchase Complete Batch" Checkbox**: If checked, auto-fills the max quantity.
    - **Quantity Input**: Allows buying a partial amount (Batch Splitting).
  - **Pricing Inputs**:
    - **Resale Price (₹/kg)**: Input to set the price for the *next* buyer (Retailer).
  - **Total Calculation**: Automatically calculates the total cost.
  - **Action**: "Pay" button initiates a Stripe checkout session.
- **Payment Loading State**:
  - If redirected from Stripe, a full-screen "Processing Payment..." spinner (`Loader2`) appears.

### 5. Retailer Dashboard (`src/pages/Retailers.tsx`)
**Goal**: Enable retailers to stock up by buying from distributors.

- **Layout**: Identical structure to the Distributor dashboard.
- **Logic Differences**:
  - **Source**: The dropdown lists batches owned by *Distributors*.
  - **Pricing**: The input sets the **Consumer Price** (the final shelf price).
  - **Splitting**: Retailers can also split batches (e.g., buying 50kg from a 100kg distributor batch).

### 6. Consumer Dashboard (`src/pages/Consumers.tsx`)
**Goal**: Allow end consumers to verify and purchase produce.

- **Browse & Buy Section**:
  - **Source**: The dropdown lists batches owned by *Retailers*.
  - **Purchase**: Consumers buy the final product.
  - **Transparency**: Before buying, they can see the full price history (Farmer Price vs. Retail Price) to ensure fair trade.

### 7. Verifier Dashboard (`src/pages/Verifiers.tsx`)
**Goal**: Quality control agents verify the produce before it enters the supply chain.

- **Filter & Sort Bar**:
  - **Search**: Filter by Batch ID or Crop name.
  - **Sort**: Dropdown to sort by ID, Quantity, or Crop.
- **Review List**:
  - A list of batches marked as "Unverified" or "Pending".
  - **Action Buttons**:
    - **"Pending"**: Marks batch as under review.
    - **"Verified"**: Opens a confirmation modal.
- **Verification Modal**:
  - Requires a **Secret Key** (password) to confirm the verification on-chain.
  - Once verified, the batch becomes visible to Distributors.

### 8. Batch Details & Journey (`src/pages/BatchDetails.tsx`)
**Goal**: The "Truth" page showing the immutable history of a batch.

- **Header**: Batch ID and current status.
- **Details Grid**:
  - **Crop Info**: Type, Quantity, Harvest Date.
  - **Stakeholders**: Farmer, Distributor, Retailer addresses.
  - **Pricing**: Transparent display of the price at every stage (Farmer → Distributor → Retailer).
- **Timestamps**: Exact dates for every transfer (F2D, D2R, R2C).
- **Parent/Child Lineage**:
  - If the batch is a **Split** (Child), a special section appears: "Origin Batch Details (Parent)".
  - Displays the Parent Batch ID and a link to view its history, ensuring full traceability back to the source.

---

## 🔐 Authentication & State (`src/context/AuthContext.tsx`)
- **Wallet Connection**: Manages the connection state with Wagmi.
- **Role Detection**: On connection, queries the `AgriTruthChain` smart contract to check `roles(address)`.
- **Session**: Persists connection state to prevent re-login on refresh.

## 📡 Data Fetching
- **Smart Contract Reads**: We use `viem` and `wagmi` hooks to fetch batch data, prices, and ownership status directly from the blockchain.
- **Webhooks**: A Node.js server listens for Stripe payment events to trigger blockchain transactions (e.g., transferring ownership after fiat payment).
