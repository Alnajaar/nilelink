# Quick Subgraph Deployment Guide

## ⚠️ You Already Have a Configured Subgraph!

**Don't run `graph init`** - we already created and configured your subgraph in the `subgraph/` folder.

---

## 🚀 Deploy Your Existing Subgraph

### Step 1: Build the Subgraph Manually

Since Windows has issues with the CLI, let's create a deployment package:

```powershell
cd subgraph

# Create deployment package
Compress-Archive -Path *.* -DestinationPath nilelink-subgraph.zip -Force
```

### Step 2: Deploy via The Graph Studio UI

1. **Go to your subgraph**: https://thegraph.com/studio/subgraph/nilelink-amoy/

2. **Click the "Deploy" tab**

3. **Upload Files**:
   - Upload `subgraph.yaml`
   - Upload `schema.graphql`
   - Upload `src/mapping.ts`
   - Or upload the entire `nilelink-subgraph.zip`

4. **Studio will build automatically**

5. **After deployment**, copy the endpoint URL

---

## 🔧 Alternative: Fix Contract Address First

Your current subgraph yaml uses **local addresses**. You need to either:

### Option A: Deploy Contracts to Polygon Amoy

```powershell
# Deploy contracts to testnet
npx hardhat run scripts/deploy-amoy-v2.js --network mumbai

# Then update subgraph.yaml with deployed addresses
```

### Option B: Use Existing Polygon Amoy Contracts

If you have contracts already deployed on Polygon Amoy, update `subgraph/subgraph.yaml`:

```yaml
source:
  address: "0xYOUR_ACTUAL_DEPLOYED_ADDRESS_ON_AMOY"
  abi: NileLinkProtocol
  startBlock: 0  # Or actual deployment block
```

---

## 📝 Current Subgraph Status

Your subgraph is already configured with:
- ✅ Fixed event handlers matching contract ABIs
- ✅ Entity schema (ProtocolStats, Restaurant, Order, Payment)
- ✅ Mapping handlers in `src/mapping.ts`

**Current contract addresses in your subgraph.yaml:**
- NileLinkProtocol: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` (LOCAL)
- RestaurantRegistry: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` (LOCAL)
- OrderSettlement: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` (LOCAL)

These are **Hardhat local addresses** - you need to deploy to Polygon Amoy first!

---

## ✅ Recommended Flow

1. **Deploy contracts to Polygon Amoy testnet**:
   ```powershell
   npx hardhat run scripts/deploy-amoy-v2.js --network mumbai
   ```

2. **Update subgraph.yaml** with deployed addresses

3. **Deploy subgraph via Studio UI**: https://thegraph.com/studio/subgraph/nilelink-amoy/

4. **Get endpoint and update .env**

---

## 🆘 Need Help?

The Graph CLI `init` command is for creating a NEW subgraph from scratch. You already have one!

Just:
1. Deploy your contracts to testnet
2. Update addresses in `subgraph.yaml`
3. Deploy via Studio UI
