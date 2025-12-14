export const AGRI_TRUTH_CHAIN_ADDRESS = process.env.AGRI_TRUTH_CHAIN_ADDRESS || "0x0000000000000000000000000000000000000000";

export const AGRI_TRUTH_CHAIN_ABI = [
  { type: "constructor", inputs: [{ name: "_owner", type: "address" }] },
  { type: "function", name: "setVerifier", stateMutability: "nonpayable", inputs: [{ name: "account", type: "address" }, { name: "allowed", type: "bool" }], outputs: [] },
  {
    type: "function", name: "registerBatchFor", stateMutability: "nonpayable", inputs: [
      { name: "farmer", type: "address" },
      { name: "cropType", type: "string" },
      { name: "quantityKg", type: "uint256" },
      { name: "basePriceINR", type: "uint256" },
      { name: "harvestDate", type: "uint64" },
      { name: "metadataCID", type: "string" },
      { name: "expiryDate", type: "uint64" }
    ], outputs: [{ name: "batchId", type: "uint256" }]
  },
  {
    type: "function", name: "registerBatch", stateMutability: "nonpayable", inputs: [
      { name: "cropType", type: "string" },
      { name: "quantityKg", type: "uint256" },
      { name: "basePriceINR", type: "uint256" },
      { name: "harvestDate", type: "uint64" },
      { name: "metadataCID", type: "string" },
      { name: "expiryDate", type: "uint64" }
    ], outputs: [{ name: "batchId", type: "uint256" }]
  },
  { type: "function", name: "transferOwnership", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "to", type: "address" }], outputs: [] },
  { type: "function", name: "transferOwnershipByVerifier", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "to", type: "address" }], outputs: [] },
  { type: "function", name: "splitBatchByVerifier", stateMutability: "nonpayable", inputs: [{ name: "parentBatchId", type: "uint256" }, { name: "splitQuantity", type: "uint256" }, { name: "newOwner", type: "address" }], outputs: [{ name: "newBatchId", type: "uint256" }] },
  { type: "function", name: "setVerificationStatus", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "status", type: "uint8" }, { name: "verificationMetadataCID", type: "string" }, { name: "verifiedQuantity", type: "uint256" }], outputs: [] },
  {
    type: "function", name: "getVerification", stateMutability: "view", inputs: [{ name: "batchId", type: "uint256" }], outputs: [
      { name: "status", type: "uint8" },
      { name: "by", type: "address" },
      { name: "at", type: "uint256" },
      { name: "verificationMetadataCID", type: "string" }
    ]
  },
  { type: "function", name: "setMinPriceInr", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "minPriceINR", type: "uint256" }], outputs: [] },
  { type: "function", name: "setPriceByDistributorInr", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "price", type: "uint256" }], outputs: [] },
  { type: "function", name: "setPriceByRetailerInr", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "price", type: "uint256" }], outputs: [] },
  {
    type: "function", name: "batches", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [
      { name: "id", type: "uint256" },
      { name: "currentOwner", type: "address" },
      { name: "farmer", type: "address" },
      { name: "distributor", type: "address" },
      { name: "retailer", type: "address" },
      { name: "consumer", type: "address" },
      { name: "cropType", type: "string" },
      { name: "quantityKg", type: "uint256" },
      { name: "basePriceINR", type: "uint256" },
      { name: "harvestDate", type: "uint64" },
      { name: "metadataCID", type: "string" },
      { name: "createdAt", type: "uint256" },
      { name: "exists", type: "bool" },
      { name: "minPriceINR", type: "uint256" },
      { name: "priceByDistributorINR", type: "uint256" },
      { name: "priceByRetailerINR", type: "uint256" },
      { name: "boughtByDistributorAt", type: "uint256" },
      { name: "boughtByRetailerAt", type: "uint256" },
      { name: "boughtByConsumerAt", type: "uint256" },
      { name: "verificationStatus", type: "uint8" },
      { name: "verificationBy", type: "address" },
      { name: "verificationAt", type: "uint256" },
      { name: "parentId", type: "uint256" },
      { name: "isSplit", type: "bool" },
      { name: "expiryDate", type: "uint64" },
      { name: "verificationMetadataCID", type: "string" }
    ]
  },
  { type: "function", name: "getAllBatchIds", stateMutability: "view", inputs: [], outputs: [{ type: "uint256[]" }] },
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "verifiers", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "bool" }] },
  {
    type: "event", name: "BatchRegistered", inputs: [
      { name: "batchId", type: "uint256", indexed: true },
      { name: "farmer", type: "address", indexed: true },
      { name: "cropType", type: "string", indexed: false },
      { name: "quantityKg", type: "uint256", indexed: false },
      { name: "basePriceINR", type: "uint256", indexed: false },
      { name: "harvestDate", type: "uint64", indexed: false },
      { name: "metadataCID", type: "string", indexed: false },
      { name: "expiryDate", type: "uint64", indexed: false }
    ], anonymous: false
  },
  {
    type: "event", name: "OwnershipTransferred", inputs: [
      { name: "batchId", type: "uint256", indexed: true },
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true }
    ], anonymous: false
  },
  {
    type: "event", name: "PricesUpdatedINR", inputs: [
      { name: "batchId", type: "uint256", indexed: true },
      { name: "minPriceINR", type: "uint256", indexed: false },
      { name: "priceByDistributorINR", type: "uint256", indexed: false },
      { name: "priceByRetailerINR", type: "uint256", indexed: false }
    ], anonymous: false
  }
  , {
    type: "event", name: "VerificationStatusUpdated", inputs: [
      { name: "batchId", type: "uint256", indexed: true },
      { name: "status", type: "uint8", indexed: false },
      { name: "by", type: "address", indexed: true },
      { name: "at", type: "uint256", indexed: false },
      { name: "verificationMetadataCID", type: "string", indexed: false }
    ], anonymous: false
  },
  {
    type: "event", name: "BatchSplit", inputs: [
      { name: "parentId", type: "uint256", indexed: true },
      { name: "newBatchId", type: "uint256", indexed: true },
      { name: "quantity", type: "uint256", indexed: false }
    ], anonymous: false
  }
];
