# 🧪 TESTING GUIDE - PHASE 3 IMPLEMENTATION

**Purpose:** Verify all Phase 3 features work end-to-end  
**Duration:** ~2 hours for full test suite  
**Target:** Hour 8-10 of 72-hour window

---

## ✅ QUICK SETUP (5 minutes)

### 1. Install Dependencies
```bash
cd /path/to/nilelink
npm install

# Install ethers.js if not already present
npm install ethers@6.0.0
```

### 2. Configure Wallets
- [ ] Install MetaMask (if not installed)
- [ ] Create 3 test accounts:
  - **Account 1 (OWNER):** Restaurant owner
  - **Account 2 (CUSTOMER):** Customer placing orders
  - **Account 3 (DRIVER):** Driver for deliveries

### 3. Connect to Local Blockchain
```bash
# In separate terminal, start Hardhat node
npx hardhat node

# Output should show:
# Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### 4. Setup MetaMask
- [ ] Add network to MetaMask:
  - **Network:** http://localhost:8545
  - **Chain ID:** 31337
  - **Currency:** ETH
- [ ] Import test accounts from Hardhat output

### 5. Set Environment Variables
Create `.env.local`:
```env
# Blockchain
NEXT_PUBLIC_RPC_ENDPOINT=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337

# Contract Addresses (from Hardhat deployment)
NEXT_PUBLIC_NILELINK_PROTOCOL_ADDRESS=0x[CONTRACT_ADDRESS]
NEXT_PUBLIC_RESTAURANT_REGISTRY_ADDRESS=0x[CONTRACT_ADDRESS]
NEXT_PUBLIC_ORDER_SETTLEMENT_ADDRESS=0x[CONTRACT_ADDRESS]
NEXT_PUBLIC_DELIVERY_COORDINATOR_ADDRESS=0x[CONTRACT_ADDRESS]
NEXT_PUBLIC_SUPPLIER_REGISTRY_ADDRESS=0x[CONTRACT_ADDRESS]

# Web3Auth (optional for local testing)
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=...
```

---

## 🏁 TEST SCENARIOS

### TEST 1: Authentication Flow (15 minutes)

**Objective:** Verify SIWE authentication works in all 5 apps

#### Test 1A: POS App (Restaurant Owner)
1. Start POS app: `npm run dev -w web/pos`
2. Navigate to http://localhost:3000
3. **Expected:** LoginPage shown
4. Click "Connect Wallet"
5. **Expected:** MetaMask popup appears
6. Select Account 1 (OWNER account)
7. **Expected:** SIWE message for signature
8. Sign message in MetaMask
9. **Expected:** 
   - Dashboard loads
   - Header shows "Welcome, Restaurant Owner"
   - Order queue visible with mock orders
10. ✅ **PASS/FAIL**

#### Test 1B: Customer App
1. Start Customer app: `npm run dev -w web/customer`
2. Navigate to http://localhost:3001
3. Click "Connect Wallet"
4. Select Account 2 (CUSTOMER account)
5. Sign SIWE message
6. **Expected:**
   - Customer dashboard loads
   - "Your Orders" section visible
   - Can see order history
7. ✅ **PASS/FAIL**

#### Test 1C: Driver App
1. Start Driver app: `npm run dev -w web/driver`
2. Navigate to http://localhost:3002
3. Click "Connect Wallet"
4. Select Account 3 (DRIVER account)
5. Sign SIWE message
6. **Expected:**
   - Driver dashboard loads
   - "Active Deliveries" section visible
   - Earnings display shows
7. ✅ **PASS/FAIL**

---

### TEST 2: Order Creation Flow (20 minutes)

**Objective:** Customer places order, appears in Restaurant POS

#### Step 1: Navigate to Checkout
1. In Customer app (already logged in)
2. Click "Place Order" or navigate to `/checkout`
3. **Expected:** Checkout page loads with sample cart

#### Step 2: Fill Order Details
1. Add delivery address: "123 Main St, Dubai"
2. Add phone: "+971501234567"
3. Add special instructions: "No onions, extra spicy"
4. Select payment: "Blockchain (Recommended)"
5. Click "Place Order"

#### Step 3: Confirm Transaction
1. MetaMask popup appears
2. Review transaction details
3. Click "Confirm"
4. **Expected:** 
   - Transaction processing message
   - After ~5 seconds: "Order placed successfully! Order ID: [ID]"
   - Redirect to order tracking page

#### Step 4: Verify in Restaurant POS
1. Switch to POS app (keep logged in as OWNER)
2. Navigate to Dashboard
3. Look at "Order Queue" section with "Pending" filter
4. **Expected:**
   - New order appears in list
   - Shows customer name, address, total amount
   - Status badge: "PENDING"

#### Test 2 Result: ✅ **PASS/FAIL**

---

### TEST 3: Order Tracking (15 minutes)

**Objective:** Verify real-time order tracking page

#### Step 1: View Order Details
1. After placing order in TEST 2, you're on tracking page
2. **Expected:**
   - Order header with Order ID
   - Status: "Pending"
   - Timeline showing milestones

#### Step 2: Verify Timeline
- [ ] Milestone 1: "Order Placed" - ✓ Completed
- [ ] Milestone 2: "Confirmed by Restaurant" - ⏳ Waiting
- [ ] Milestone 3: "Being Prepared" - ⏳ Waiting
- [ ] Milestone 4: "Ready for Pickup" - ⏳ Waiting
- [ ] Milestone 5: "Out for Delivery" - ⏳ Waiting
- [ ] Milestone 6: "Delivered" - ⏳ Waiting

#### Step 3: Check Order Items
1. Scroll to "Order Items" section
2. **Expected:**
   - All items from checkout visible
   - Quantities correct
   - Individual prices and totals accurate

#### Step 4: Verify Totals
1. Check subtotal matches items sum
2. Check tax calculation (should be ~5%)
3. Check delivery fee ($2.00)
4. Check final total = subtotal + tax + delivery fee

#### Test 3 Result: ✅ **PASS/FAIL**

---

### TEST 4: Driver Assignment (20 minutes)

**Objective:** Verify driver can see and accept deliveries

#### Step 1: Assign Driver in POS
1. In POS app, find the pending order from TEST 2
2. Click on the order
3. **Expected:** Order detail page shows
4. Click "Assign Driver" button (if visible)
5. **Expected:** Driver selection modal
6. Select Account 3 (DRIVER)
7. Click "Assign"

#### Step 2: Verify Driver Sees Delivery
1. Switch to Driver app (or open in new window)
2. Make sure logged in as Account 3 (DRIVER)
3. Navigate to Driver dashboard
4. **Expected:**
   - Order appears in "Active" deliveries
   - Shows customer name, address, amount
   - Distance and ETA calculated
   - "Mark Delivered" button visible

#### Step 3: Mark Delivery Complete
1. In Driver dashboard, click "Mark Delivered"
2. **Expected:**
   - Order moves to "Completed" section
   - Earnings updated (total shows new amount)
   - Timestamp recorded

#### Step 4: Verify Customer Sees Update
1. Switch back to Customer app
2. Navigate to order tracking page
3. Refresh page or wait for auto-refresh
4. **Expected:**
   - Milestone 5 "Out for Delivery" now completed
   - Milestone 6 "Delivered" now completed (or very close)
   - Status at top shows "Delivered"

#### Test 4 Result: ✅ **PASS/FAIL**

---

### TEST 5: Multi-Order Scenario (20 minutes)

**Objective:** Test system with multiple concurrent orders

#### Step 1: Place 3 Orders
1. Switch to Customer app with Account 2
2. Place Order #1 (as TEST 2)
3. Place Order #2 with different items
4. Place Order #3 with different address
5. **Expected:** 3 orders successfully created

#### Step 2: View in Restaurant POS
1. Switch to POS (Account 1)
2. Dashboard should show all 3 pending orders
3. Filter to "Completed" - should be empty
4. Filter back to "Pending" - should show 3

#### Step 3: Assign Drivers
1. Assign different drivers to each order (or multiple to same driver)
2. **Expected:** 
   - Each order assigned
   - Driver app shows multiple deliveries
   - Each shows different customer/address

#### Step 4: Complete All Orders
1. In Driver app, mark all 3 as delivered
2. Check Driver earnings updated (sum of all 3)
3. In Customer app, verify each order shows "Delivered"

#### Test 5 Result: ✅ **PASS/FAIL**

---

### TEST 6: Error Handling (15 minutes)

**Objective:** Verify system handles errors gracefully

#### Test 6A: Insufficient Data
1. In Customer app, try to checkout with incomplete address
2. **Expected:** Validation message, order not created

#### Test 6B: Wallet Rejection
1. In Customer app, start checkout
2. When MetaMask prompts, click "Reject"
3. **Expected:** Error message, order not created, user can retry

#### Test 6C: Network Error
1. Temporarily stop Hardhat node (`Ctrl+C`)
2. Try to place order
3. **Expected:** "Network error" or "Contract not available" message
4. Restart Hardhat
5. **Expected:** User can retry successfully

#### Test 6 Result: ✅ **PASS/FAIL**

---

### TEST 7: UI/UX Verification (15 minutes)

#### Check Layout
- [ ] All buttons visible and clickable
- [ ] Forms have proper labels
- [ ] Input fields properly styled
- [ ] Error messages red, success green

#### Check Responsiveness
- [ ] Open Customer app on mobile (Chrome DevTools)
- [ ] All content visible without horizontal scroll
- [ ] Buttons easily tappable (48px minimum)
- [ ] Forms responsive to device width

#### Check Loading States
- [ ] When creating order, show loading spinner
- [ ] When fetching orders, show skeleton or spinner
- [ ] When updating status, disable button until complete

#### Check Animations
- [ ] Order timeline shows smooth animations
- [ ] Order cards fade in when appearing
- [ ] No layout shift during loading

#### Test 7 Result: ✅ **PASS/FAIL**

---

## 📊 TEST SUMMARY TABLE

Fill in after running all tests:

| Test # | Scenario | Result | Time | Notes |
|--------|----------|--------|------|-------|
| 1A | POS Auth | ✅/❌ | ___ min | |
| 1B | Customer Auth | ✅/❌ | ___ min | |
| 1C | Driver Auth | ✅/❌ | ___ min | |
| 2 | Order Creation | ✅/❌ | ___ min | |
| 3 | Order Tracking | ✅/❌ | ___ min | |
| 4 | Driver Assignment | ✅/❌ | ___ min | |
| 5 | Multi-Order | ✅/❌ | ___ min | |
| 6 | Error Handling | ✅/❌ | ___ min | |
| 7 | UI/UX | ✅/❌ | ___ min | |
| **TOTAL** | | | ___ min | |

---

## 🐛 TROUBLESHOOTING

### "Contract not found" error
**Cause:** Contract address not in .env.local  
**Fix:** Update NEXT_PUBLIC_*_ADDRESS variables with deployed contract addresses

### "Invalid signature" error
**Cause:** SIWE signature verification failed  
**Fix:** 
1. Clear browser localStorage
2. Sign out and reconnect wallet
3. Verify MetaMask is on correct network (localhost:8545)

### "Transaction reverted" error
**Cause:** Smart contract validation failed  
**Fix:**
1. Check caller has correct role
2. Verify contract balance has ETH for gas
3. Check contract state isn't paused

### "Orders not showing" in POS
**Cause:** useOrderService returning mock data instead of contract data  
**Fix:** 
1. Check ORDER_SETTLEMENT_ADDRESS is correct
2. Verify contract has orders stored
3. Check browser console for errors

### MetaMask not showing network prompt
**Cause:** Network already added to MetaMask  
**Fix:**
1. In MetaMask, select "Localhost 8545"
2. Or restart MetaMask and try again

---

## ✨ SUCCESS CRITERIA

All tests must pass:
- [ ] Authentication works in all 5 apps
- [ ] Order can be created from checkout
- [ ] Order appears immediately in restaurant POS
- [ ] Order tracking page shows all 6 milestones
- [ ] Driver can see assigned delivery
- [ ] Order status updates in real-time
- [ ] Multiple orders work correctly
- [ ] Errors display user-friendly messages
- [ ] UI is responsive and animated

**If all ✅:** System is ready for Hour 10 deployment testing

---

## 📝 NOTES FOR NEXT SESSION

- [ ] Record which tests passed/failed
- [ ] Note any UI issues for polish phase
- [ ] Check performance metrics (load time < 2s)
- [ ] Verify no console errors in DevTools
- [ ] Test with different wallet accounts
- [ ] Try rapid order creation to stress-test

---

**Testing Duration:** ~2 hours total  
**Expected Completion:** Hour 9-10 of 72-hour window  
**Next Phase:** Deployment configuration and environment setup
