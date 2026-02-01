# ✅ TESTING CHECKLIST - QUICK START

**Status:** Ready to execute  
**Duration:** ~2 hours for full suite  
**Target:** All 7 tests must pass before deployment

---

## 🚀 PRE-TEST SETUP (5 minutes)

- [ ] Hardhat local node running: `npx hardhat node`
- [ ] MetaMask connected to localhost:8545 (chainId: 31337)
- [ ] 3 test accounts imported (OWNER, CUSTOMER, DRIVER)
- [ ] All 5 apps have `.env.local` configured
- [ ] Browser DevTools open for console errors

---

## 📋 TEST SCENARIOS

### TEST 1: Authentication (15 min)
**Goal:** Verify SIWE works in all 5 apps

#### 1A: POS App
- [ ] Run: `npm run dev -w web/pos`
- [ ] Navigate: http://localhost:3000
- [ ] Click "Connect Wallet" (Account 1 - OWNER)
- [ ] Sign SIWE message
- **Expected:** Dashboard loads, no errors
- ✅/❌ **RESULT:** 

#### 1B: Customer App
- [ ] Run: `npm run dev -w web/customer`
- [ ] Navigate: http://localhost:3001
- [ ] Connect Wallet (Account 2 - CUSTOMER)
- [ ] Sign SIWE message
- **Expected:** Dashboard loads, order history visible
- ✅/❌ **RESULT:** 

#### 1C: Driver App
- [ ] Run: `npm run dev -w web/driver`
- [ ] Navigate: http://localhost:3002
- [ ] Connect Wallet (Account 3 - DRIVER)
- [ ] Sign SIWE message
- **Expected:** Dashboard loads, delivery queue visible
- ✅/❌ **RESULT:** 

**Overall TEST 1 Result:** ✅/❌

---

### TEST 2: Order Creation (20 min)
**Goal:** Customer creates order, appears in POS

#### Steps:
1. [ ] In Customer app, navigate to `/checkout`
2. [ ] Add delivery address: "123 Main St, Dubai"
3. [ ] Add phone: "+971501234567"
4. [ ] Add special instructions: "No onions"
5. [ ] Select payment: "Blockchain"
6. [ ] Click "Place Order"
7. [ ] Confirm transaction in MetaMask
8. [ ] Wait for success message
9. [ ] Navigate to POS app
10. [ ] Verify order appears in Order Queue (Pending tab)

**Expected Results:**
- [ ] Order created successfully
- [ ] Order ID returned
- [ ] Order appears in POS within 10 seconds
- [ ] Order shows correct customer info
- [ ] Order shows correct total amount

**Overall TEST 2 Result:** ✅/❌

---

### TEST 3: Order Tracking (15 min)
**Goal:** Verify order tracking page works

#### Steps:
1. [ ] After order creation (TEST 2), you're on tracking page
2. [ ] Check Order ID displayed
3. [ ] Verify Timeline milestones visible:
   - [ ] Milestone 1: Order Placed ✓
   - [ ] Milestone 2: Confirmed - ⏳
   - [ ] Milestone 3: Preparing - ⏳
   - [ ] Milestone 4: Ready - ⏳
   - [ ] Milestone 5: Out for Delivery - ⏳
   - [ ] Milestone 6: Delivered - ⏳
4. [ ] Check Order Items section
5. [ ] Verify Totals (subtotal + tax + delivery = total)
6. [ ] Check Delivery Address display
7. [ ] Verify "Contact Driver" button visible

**Overall TEST 3 Result:** ✅/❌

---

### TEST 4: Driver Assignment (20 min)
**Goal:** Verify driver sees delivery, can mark complete

#### Steps:
1. [ ] In POS app, find pending order from TEST 2
2. [ ] Click order to view details
3. [ ] Click "Assign Driver" button
4. [ ] Select Account 3 (DRIVER)
5. [ ] Confirm assignment
6. [ ] Switch to Driver app (Account 3 logged in)
7. [ ] Verify order appears in "Active Deliveries"
8. [ ] Click "Mark Delivered"
9. [ ] Switch back to Customer app
10. [ ] Refresh order tracking page
11. [ ] Verify milestone 5 and 6 now show completed

**Overall TEST 4 Result:** ✅/❌

---

### TEST 5: Multi-Order (20 min)
**Goal:** Test system with 3 concurrent orders

#### Steps:
1. [ ] Place Order #1 (TEST 2 again)
2. [ ] Place Order #2 with different items
3. [ ] Place Order #3 with different address
4. [ ] In POS, verify all 3 show in queue
5. [ ] Assign different drivers (or multiple to same)
6. [ ] In Driver app, verify all 3 deliveries visible
7. [ ] Mark all 3 as delivered
8. [ ] In Customer app, verify all 3 show "Delivered"
9. [ ] Check Driver earnings total increased

**Overall TEST 5 Result:** ✅/❌

---

### TEST 6: Error Handling (15 min)
**Goal:** Verify graceful error handling

#### 6A: Missing Data
- [ ] Checkout without address
- [ ] **Expected:** Error message, order not created
- ✅/❌

#### 6B: Wallet Rejection
- [ ] Start checkout, reject MetaMask
- [ ] **Expected:** Error message, can retry
- ✅/❌

#### 6C: Network Error
- [ ] Stop Hardhat node (`Ctrl+C`)
- [ ] Try to place order
- [ ] **Expected:** "Network error" message
- [ ] Restart Hardhat
- [ ] **Expected:** Can retry successfully
- ✅/❌

**Overall TEST 6 Result:** ✅/❌

---

### TEST 7: UI/UX (10 min)
**Goal:** Verify UI is responsive and polished

#### Layout
- [ ] All buttons visible and clickable
- [ ] Forms have proper labels
- [ ] Error messages in red, success in green
- ✅/❌

#### Responsiveness
- [ ] Open Customer app in DevTools mobile view
- [ ] All content visible without horizontal scroll
- [ ] Buttons easily tappable (48px+)
- ✅/❌

#### Loading States
- [ ] Spinner shows when placing order
- [ ] Spinner shows when fetching orders
- [ ] Disabled buttons during loading
- ✅/❌

#### Animations
- [ ] Timeline animations smooth
- [ ] Cards fade in when appearing
- [ ] No layout shift during load
- ✅/❌

**Overall TEST 7 Result:** ✅/❌

---

## 📊 FINAL RESULTS

| Test | Result | Time | Notes |
|------|--------|------|-------|
| 1A: POS Auth | ✅/❌ | ___ | |
| 1B: Customer Auth | ✅/❌ | ___ | |
| 1C: Driver Auth | ✅/❌ | ___ | |
| 2: Order Creation | ✅/❌ | ___ | |
| 3: Order Tracking | ✅/❌ | ___ | |
| 4: Driver Assignment | ✅/❌ | ___ | |
| 5: Multi-Order | ✅/❌ | ___ | |
| 6: Error Handling | ✅/❌ | ___ | |
| 7: UI/UX | ✅/❌ | ___ | |

---

## ✨ SUCCESS CRITERIA

**PASS:** All 7 tests show ✅  
**FAIL:** Any test shows ❌ → Debug and fix

**If ALL PASS:** Ready for staging deployment (Task 14)  
**If ANY FAIL:** Document issue, fix, re-test

---

## 🐛 QUICK TROUBLESHOOTING

| Error | Fix |
|-------|-----|
| "Contract not found" | Update NEXT_PUBLIC_*_ADDRESS in .env.local |
| "Invalid signature" | Clear localStorage, reconnect wallet |
| "Transaction reverted" | Check wallet has ETH, verify role correct |
| "Orders not showing" | Check console for errors, verify contract address |
| MetaMask not prompting | Restart MetaMask, verify network added |

---

## 📝 NOTES DURING TESTING

(Write observations here)

```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**When complete:** All ✅ = Ready for deployment!
