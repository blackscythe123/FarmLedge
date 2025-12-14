// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgriTruthChain V3 - Registry with batch splitting support
contract AgriTruthChain {
    struct Batch {
        uint256 id;
        address currentOwner;
        address farmer;
        address distributor;
        address retailer;
        address consumer;
        string cropType;
        uint256 quantityKg;
        uint256 basePriceINR; // rupees (whole)
        uint64 harvestDate;
        string metadataCID;
        uint256 createdAt;
        bool exists;
        uint256 minPriceINR; // rupees (whole)
        uint256 priceByDistributorINR; // rupees (whole)
        uint256 priceByRetailerINR;    // rupees (whole)
        uint256 boughtByDistributorAt;
        uint256 boughtByRetailerAt;
        uint256 boughtByConsumerAt;
        // On-chain verification fields
        uint8 verificationStatus; // 0 = unverified, 1 = pending, 2 = verified
        address verificationBy;
        uint256 verificationAt;
        // Splitting fields
        uint256 parentId; // 0 if root
        bool isSplit;
        uint64 expiryDate;
        string verificationMetadataCID;
    }

    uint256 public nextBatchId = 1;
    mapping(uint256 => Batch) public batches;

    address public owner;
    mapping(address => bool) public verifiers;

    event BatchRegistered(uint256 indexed batchId, address indexed farmer, string cropType, uint256 quantityKg, uint256 basePriceINR, uint64 harvestDate, string metadataCID, uint64 expiryDate);
    event OwnershipTransferred(uint256 indexed batchId, address indexed from, address indexed to);
    event VerifierSet(address indexed verifier, bool allowed);
    event PricesUpdatedINR(uint256 indexed batchId, uint256 minPriceINR, uint256 priceByDistributorINR, uint256 priceByRetailerINR);
    event VerificationStatusUpdated(uint256 indexed batchId, uint8 status, address indexed by, uint256 at, string verificationMetadataCID);
    event BatchSplit(uint256 indexed parentId, uint256 indexed newBatchId, uint256 quantity);

    modifier onlyOwner() { require(msg.sender == owner, "not-owner"); _; }

    uint256[] public batchIds;

    constructor(address _owner) {
        owner = _owner == address(0) ? msg.sender : _owner;
    }

    function setVerifier(address account, bool allowed) external onlyOwner {
        verifiers[account] = allowed;
        emit VerifierSet(account, allowed);
    }

    function _registerBatch(
        address farmer,
        string calldata cropType,
        uint256 quantityKg,
        uint256 basePriceINR,
        uint64 harvestDate,
        string calldata metadataCID,
        uint64 expiryDate
    ) internal returns (uint256 batchId) {
        require(farmer != address(0), "bad-farmer");
        batchId = nextBatchId++;
        Batch storage b = batches[batchId];
        b.id = batchId;
        b.currentOwner = farmer;
        b.farmer = farmer;
        b.distributor = address(0);
        b.retailer = address(0);
        b.consumer = address(0);
        b.cropType = cropType;
        b.quantityKg = quantityKg;
        b.basePriceINR = basePriceINR;
        b.harvestDate = harvestDate;
        b.metadataCID = metadataCID;
        b.createdAt = block.timestamp;
        b.exists = true;
        b.minPriceINR = 0;
        b.priceByDistributorINR = 0;
        b.priceByRetailerINR = 0;
        b.boughtByDistributorAt = 0;
        b.boughtByRetailerAt = 0;
        b.boughtByConsumerAt = 0;
        b.verificationStatus = 0;
        b.verificationBy = address(0);
        b.verificationAt = 0;
        b.parentId = 0;
        b.isSplit = false;
        b.expiryDate = expiryDate;
        batchIds.push(batchId);
        emit BatchRegistered(batchId, farmer, cropType, quantityKg, basePriceINR, harvestDate, metadataCID, expiryDate);
    }

    function registerBatchFor(
        address farmer,
        string calldata cropType,
        uint256 quantityKg,
        uint256 basePriceINR,
        uint64 harvestDate,
        string calldata metadataCID,
        uint64 expiryDate
    ) external returns (uint256 batchId) {
        return _registerBatch(farmer, cropType, quantityKg, basePriceINR, harvestDate, metadataCID, expiryDate);
    }

    function registerBatch(
        string calldata cropType,
        uint256 quantityKg,
        uint256 basePriceINR,
        uint64 harvestDate,
        string calldata metadataCID,
        uint64 expiryDate
    ) external returns (uint256 batchId) {
        return _registerBatch(msg.sender, cropType, quantityKg, basePriceINR, harvestDate, metadataCID, expiryDate);
    }

    function transferOwnership(uint256 batchId, address to) external {
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        require(b.currentOwner == msg.sender, "not-owner");
        _updateOwner(batchId, to);
    }

    function _updateOwner(uint256 batchId, address to) internal {
        Batch storage b = batches[batchId];
        address prev = b.currentOwner;
        b.currentOwner = to;
        if (b.distributor == address(0) && to != b.farmer) {
            b.distributor = to;
            b.boughtByDistributorAt = block.timestamp;
        } else if (b.retailer == address(0) && to != b.distributor) {
            b.retailer = to;
            b.boughtByRetailerAt = block.timestamp;
        } else if (b.consumer == address(0) && to != b.retailer) {
            b.consumer = to;
            b.boughtByConsumerAt = block.timestamp;
        }
        emit OwnershipTransferred(batchId, prev, to);
    }

    function transferOwnershipByVerifier(uint256 batchId, address to) external {
        require(verifiers[msg.sender] || msg.sender == owner, "not-verifier");
        _updateOwner(batchId, to);
    }

    function setVerificationStatus(uint256 batchId, uint8 status, string calldata verificationMetadataCID, uint256 verifiedQuantity) external {
        require(verifiers[msg.sender] || msg.sender == owner, "not-verifier");
        require(status <= 2, "bad-status");
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        b.verificationStatus = status;
        b.verificationBy = msg.sender;
        b.verificationAt = block.timestamp;
        b.verificationMetadataCID = verificationMetadataCID;

        if (verifiedQuantity > 0 && verifiedQuantity != b.quantityKg) {
            b.quantityKg = verifiedQuantity;
        }

        emit VerificationStatusUpdated(batchId, status, msg.sender, block.timestamp, verificationMetadataCID);
    }

    function getVerification(uint256 batchId) external view returns (uint8 status, address by, uint256 at, string memory verificationMetadataCID) {
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        return (b.verificationStatus, b.verificationBy, b.verificationAt, b.verificationMetadataCID);
    }

    function getAllBatchIds() external view returns (uint256[] memory) { 
        return batchIds; 
    }

    function setMinPriceInr(uint256 batchId, uint256 minPriceINR_) external {
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        require(b.currentOwner == msg.sender || verifiers[msg.sender] || msg.sender == owner, "not-authorized");
        b.minPriceINR = minPriceINR_;
        emit PricesUpdatedINR(batchId, b.minPriceINR, b.priceByDistributorINR, b.priceByRetailerINR);
    }

    function setPriceByDistributorInr(uint256 batchId, uint256 price) external {
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        require(b.distributor == msg.sender || verifiers[msg.sender] || msg.sender == owner, "not-authorized");
        b.priceByDistributorINR = price;
        emit PricesUpdatedINR(batchId, b.minPriceINR, b.priceByDistributorINR, b.priceByRetailerINR);
    }

    function setPriceByRetailerInr(uint256 batchId, uint256 price) external {
        Batch storage b = batches[batchId];
        require(b.exists, "batch-not-found");
        require(b.retailer == msg.sender || verifiers[msg.sender] || msg.sender == owner, "not-authorized");
        b.priceByRetailerINR = price;
        emit PricesUpdatedINR(batchId, b.minPriceINR, b.priceByDistributorINR, b.priceByRetailerINR);
    }

    // Split a batch into a new child batch with proportional pricing and role assignment
    function splitBatchByVerifier(uint256 parentBatchId, uint256 splitQuantity, address newOwner) external returns (uint256 newBatchId) {
        require(verifiers[msg.sender] || msg.sender == owner, "not-verifier");
        Batch storage parent = batches[parentBatchId];
        require(parent.exists, "parent-not-found");
        require(parent.quantityKg > splitQuantity, "insufficient-quantity");
        require(splitQuantity > 0, "invalid-split-quantity");
        require(newOwner != address(0), "invalid-new-owner");

        // Calculate proportional prices for the child batch
        uint256 originalQuantity = parent.quantityKg;
        uint256 childBasePriceINR = parent.basePriceINR;
        uint256 childMinPriceINR = parent.minPriceINR;

        // Decrement parent quantity
        parent.quantityKg -= splitQuantity;

        // Create child batch
        newBatchId = nextBatchId++;
        Batch storage child = batches[newBatchId];
        child.id = newBatchId;
        child.currentOwner = newOwner;
        child.farmer = parent.farmer;
        
        // Set buyer role based on parent's current holder
        if (parent.currentOwner == parent.farmer) {
            // Farmer selling to Distributor
            child.distributor = newOwner;
            child.retailer = address(0);
            child.consumer = address(0);
            child.boughtByDistributorAt = block.timestamp;
            child.boughtByRetailerAt = 0;
            child.boughtByConsumerAt = 0;
        } else if (parent.distributor != address(0) && parent.retailer == address(0)) {
            // Distributor selling to Retailer
            child.distributor = parent.distributor;
            child.retailer = newOwner;
            child.consumer = address(0);
            child.boughtByDistributorAt = parent.boughtByDistributorAt;
            child.boughtByRetailerAt = block.timestamp;
            child.boughtByConsumerAt = 0;
        } else {
            // Retailer selling to Consumer
            child.distributor = parent.distributor;
            child.retailer = parent.retailer;
            child.consumer = newOwner;
            child.boughtByDistributorAt = parent.boughtByDistributorAt;
            child.boughtByRetailerAt = parent.boughtByRetailerAt;
            child.boughtByConsumerAt = block.timestamp;
        }
        
        child.cropType = parent.cropType;
        child.quantityKg = splitQuantity;
        child.basePriceINR = childBasePriceINR;
        child.harvestDate = parent.harvestDate;
        child.metadataCID = parent.metadataCID;
        child.createdAt = block.timestamp;
        child.exists = true;
        child.minPriceINR = childMinPriceINR;
        child.priceByDistributorINR = 0;
        child.priceByRetailerINR = 0;
        child.verificationStatus = parent.verificationStatus;
        child.verificationBy = parent.verificationBy;
        child.verificationAt = parent.verificationAt;
        child.parentId = parentBatchId;
        child.isSplit = true;
        child.expiryDate = parent.expiryDate;
        
        batchIds.push(newBatchId);
        emit BatchSplit(parentBatchId, newBatchId, splitQuantity);
        emit OwnershipTransferred(newBatchId, parent.currentOwner, newOwner);
        
        return newBatchId;
    }
}
