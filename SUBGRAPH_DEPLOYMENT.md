# Subgraph Deployment Guide

## Issue: Windows CLI Build Error

The Graph CLI has a known issue with AssemblyScript compilation on Windows. Here's how to deploy your subgraph using The Graph Studio UI instead:

---

## 📋 Current Status

✅ **Completed:**
- Installed `@graphprotocol/graph-cli` globally
- Authenticated with deploy key: `25709f049d4fa4fec8dcd7384839ec3a`
- Created simplified subgraph.yaml with core contracts
- Fixed all event handler signatures to match ABIs
- Created mapping.ts with event handlers

❌ **Blocked:**
- CLI build fails on Windows with AssemblyScript compiler error
- Need to deploy via Studio UI or Linux/Mac

---

## 🚀 Alternative Deployment Methods

### Method 1: Deploy via The Graph Studio UI (Recommended)

1. **Go to The Graph Studio**
   - Visit: https://thegraph.com/studio/subgraph/nilelink-amoy

2. **Use Studio Deploy Button**
   - Click "Deploy" button in Studio UI
   - Upload your `subgraph` folder as ZIP
   - Studio will build and deploy automatically

3. **Get Your Endpoint**
   - After deployment, copy the subgraph endpoint URL
   - Format: `https://api.studio.thegraph.com/query/[YOUR_ID]/nilelink-amoy/version/latest`

4. **Update .env**
   ```bash
   NEXT_PUBLIC_GRAPH_AMOY_ENDPOINT=https://api.studio.thegraph.com/query/[YOUR_ID]/nilelink-amoy/version/latest
   ```

---

### Method 2: Deploy via WSL/Linux

If you have WSL or Linux:

```bash
# In WSL/Linux terminal
cd /mnt/c/Users/nilel/Projects/Sduan/New\ folder/nilelink/subgraph

# Authenticate
graph auth https://api.studio.thegraph.com/deploy/ 25709f049d4fa4fec8dcd7384839ec3a

# Build and deploy
graph codegen && graph build
graph deploy nilelink-amoy
```

---

### Method 3: Deploy via GitHub Actions

Create `.github/workflows/deploy-subgraph.yml`:

```yaml
name: Deploy Subgraph
on:
  push:
    branches: [main]
    paths:
     - 'subgraph/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Graph CLI
        run: npm install -g @graphprotocol/graph-cli
      
      - name: Deploy Subgraph
        run: |
          cd subgraph
          graph auth https://api.studio.thegraph.com/deploy/ ${{ secrets.GRAPH_DEPLOY_KEY }}
          graph codegen && graph build
          graph deploy nilelink-amoy
        env:
          GRAPH_DEPLOY_KEY: 25709f049d4fa4fec8dcd7384839ec3a
```

---

## 📝 What's Ready

Your subgraph is configured with:

### Contracts
- ✅ NileLinkProtocol (0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
- ✅ RestaurantRegistry (0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
- ✅ OrderSettlement (0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0)

### Events Tracked
- Protocol initialization and governance
- Restaurant registration and config updates
- Payment intents, receipts, and settlements

### Entities
- ProtocolStats (global statistics)
- Restaurant (restaurant data)
- Order (orders and payments)
- Payment (payment details)

---

## 🔄 After Deployment

Once your subgraph is deployed:

1. **Copy the endpoint URL** from The Graph Studio
2. **Update these files:**
   - `.env` → `NEXT_PUBLIC_GRAPH_AMOY_ENDPOINT`
   - `web/shared/services/GraphService.ts` → `endpoints.amoy`

3. **Test queries:**
   ```graphql
   {
     protocolStats(id: "global") {
       total Restaurants
       totalOrders
       totalVolumeUsd6
     }
   }
   ```

4. **Use in your app:**
   ```typescript
   import { getProtocolStats, getRestaurants } from '@shared/services/GraphService';
   
   const stats = await getProtocolStats();
   const restaurants = await getRestaurants(10, 0);
   ```

---

## 📚 Resources

- **Studio Dashboard**: https://thegraph.com/studio/subgraph/nilelink-amoy
- **Docs**: https://thegraph.com/docs/en/developing/creating-a-subgraph/
- **Discord**: https://discord.gg/eM8CA6WA9r (for help)
