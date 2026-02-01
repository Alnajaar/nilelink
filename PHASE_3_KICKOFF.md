# ⚡ PHASE 3 QUICK START - FEATURE IMPLEMENTATION

**Target:** Hours 6-24 (18 hours remaining of 67-hour buffer)  
**Goal:** Build core features (dashboards, orders, delivery tracking)  
**Status:** Ready to begin - all infrastructure in place

---

## 📋 PHASE 3 CHECKLIST

### **Hour 6-7: Environment Setup**
```bash
# [ ] Edit .env.production
# [ ] Add RPC endpoints
# [ ] Add contract addresses  
# [ ] Test environment loads correctly

# Files to update:
# - .env.production (add real values from deployments/)
# - web/shared/abis/ (create directory)
# - Extract ABIs from artifacts/contracts/
```

### **Hour 7-8: Test Auth Flow**
```bash
# [ ] Run POS app: npm run dev -w web/pos
# [ ] Visit http://localhost:3000
# [ ] Click "Connect Wallet"
# [ ] Sign SIWE message
# [ ] Verify role check works
# [ ] Confirm dashboard loads

# Expected flow:
# 1. LoginPage shown (no wallet connected)
# 2. Connect button → MetaMask popup
# 3. User signs message
# 4. Role verified from smart contract
# 5. Dashboard rendered
```

### **Hour 8-10: POS Dashboard**
```typescript
// Create: web/pos/src/app/dashboard/page.tsx
// Components needed:
// 1. StatCard (sales, orders, staff)
// 2. OrdersList (pending, completed, cancelled)
// 3. StaffManagement (add/remove cashiers)
// 4. ReportsPicker (daily, weekly, monthly)

// Data sources:
// - Smart contracts for order history
// - IPFS for detailed order data
// - Real-time via WebSocket (later phase)

// UI Reference:
const Dashboard = () => {
  const { profile, address } = useAuth();
  const { getOrders } = useOrderService();
  
  return (
    <div>
      <h1>Welcome, {profile?.restaurantName}</h1>
      <StatCard label="Today's Sales" value="$1,234" />
      <StatCard label="Orders" value="42" />
      <OrdersList orders={getOrders()} />
    </div>
  );
};
```

### **Hour 10-12: Customer Dashboard**
```typescript
// Create: web/customer/src/app/dashboard/page.tsx
// Components:
// 1. FavoritesCarousel (nearby restaurants)
// 2. OrderHistory (recent orders)
// 3. LoyaltyCard (points, rewards)
// 4. ActiveOrders (tracking)

// Data flow:
// - Get restaurants from RestaurantRegistry
// - Get user's orders from OrderSettlement
// - Get loyalty points from smart contract
// - Show real-time tracking via DeliveryCoordinator

const CustomerDashboard = () => {
  const { address } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    // Load favorites from IPFS
    // Load order history from blockchain
  }, [address]);
  
  return (
    <div>
      <FavoritesCarousel restaurants={restaurants} />
      <OrderHistory orders={orders} />
    </div>
  );
};
```

### **Hour 12-14: Supplier Dashboard**
```typescript
// Create: web/supplier/src/app/dashboard/page.tsx
// Components:
// 1. InventoryStatus (stock levels)
// 2. OrderQueue (pending supplier orders)
// 3. Analytics (sales, top items)
// 4. AddProduct (inventory management)

// Data from:
// - SupplierRegistry (supplier info)
// - SupplyChain (product listings)
// - OrderSettlement (supplier orders)

const SupplierDashboard = () => {
  const { address, profile } = useAuth();
  
  return (
    <div>
      <h1>{profile?.supplierName}</h1>
      <InventoryStatus />
      <OrderQueue />
      <Analytics />
    </div>
  );
};
```

### **Hour 14-18: Order Flow**
```typescript
// Customer initiates order:
// web/customer/src/pages/checkout.tsx

// Flow:
// 1. Customer selects restaurant & items
// 2. Shows summary & location confirmation
// 3. User clicks "Place Order" 
// 4. Call: OrderSettlement.createOrder() (smart contract)
// 5. Wait for blockchain confirmation
// 6. Show order tracking page
// 7. Driver assigned via DeliveryCoordinator
// 8. Real-time updates via events

const CheckoutPage = () => {
  const { address } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Call smart contract
      const tx = await orderSettlement.createOrder({
        restaurant: restaurantAddress,
        items: selectedItems,
        deliveryAddress: userLocation,
        paymentToken: USDC,
      });
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Redirect to tracking
      router.push(`/order/${receipt.transactionHash}`);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <OrderSummary />
      <button onClick={handlePlaceOrder} disabled={loading}>
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
};
```

### **Hour 18-22: Delivery Integration**
```typescript
// Driver dashboard: web/driver/src/app/deliveries/page.tsx
// Already created in Phase 1, now add functionality

// Components:
// 1. ActiveDeliveries (assigned orders, map)
// 2. RouteOptimization (best path)
// 3. ProofOfDelivery (photo + signature)
// 4. EarningsTracker (real-time)

const DeliveriesPage = () => {
  const { address } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [location, setLocation] = useState(null);
  
  // Get assigned deliveries
  useEffect(() => {
    const loadDeliveries = async () => {
      const assigned = await deliveryCoordinator.getDriverDeliveries(address);
      setDeliveries(assigned);
    };
    loadDeliveries();
  }, [address]);
  
  // Real-time location tracking
  useEffect(() => {
    navigator.geolocation.watchPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      // Send to blockchain
      updateLocation(address, location);
    });
  }, []);
  
  return (
    <div>
      <Map deliveries={deliveries} driverLocation={location} />
      <DeliveryList 
        deliveries={deliveries} 
        onComplete={completeDelivery}
      />
      <EarningsTracker />
    </div>
  );
};

// Mark delivery complete with proof
const completeDelivery = async (deliveryId) => {
  // Get proof of delivery (photo)
  const photo = await capturePhoto();
  
  // Call smart contract
  await proofOfDelivery.submitDeliveryProof({
    deliveryId,
    photoHash: await uploadToIPFS(photo),
    timestamp: Date.now(),
  });
};
```

### **Hour 22-24: Testing & Polish**
```bash
# [ ] Run each app locally
# [ ] Test auth flow on each app
# [ ] Test dashboard functionality
# [ ] Check error handling
# [ ] Verify mobile responsiveness
# [ ] Test on testnet (optional)

# Manual tests:
# 1. POS: Login → View dashboard → Check stats
# 2. Customer: Login → Browse restaurants → Place order
# 3. Supplier: Login → View inventory → Manage products
# 4. Driver: Login → View deliveries → Complete order
# 5. Admin: Login → View governance options
```

---

## 🗂️ FILE STRUCTURE FOR PHASE 3

```
web/pos/src/app/
├── dashboard/
│   └── page.tsx                    ✅ Create (sales overview)
└── restaurants/
    └── [id]/menu/page.tsx         ✅ Create (menu editing)

web/customer/src/app/
├── dashboard/
│   └── page.tsx                    ✅ Create (order history)
├── restaurants/
│   └── [id]/page.tsx              ✅ Create (menu viewing)
└── checkout/
    └── page.tsx                    ✅ Create (order placement)

web/supplier/src/app/
├── dashboard/
│   └── page.tsx                    ✅ Create (inventory)
├── products/
│   └── [id]/page.tsx              ✅ Create (product edit)
└── analytics/
    └── page.tsx                    ✅ Create (reports)

web/driver/src/app/
└── deliveries/
    └── page.tsx                    ✅ Already exists (add features)

web/shared/components/
├── OrderSummary.tsx                ✅ Create
├── OrderList.tsx                   ✅ Create
├── StatCard.tsx                    ✅ Create
├── Map.tsx                         ✅ Create (or use Leaflet)
└── ProofOfDelivery.tsx             ✅ Create
```

---

## 🛠️ TOOLS & LIBRARIES YOU'LL NEED

```bash
# Already installed:
npm install

# May need to add:
npm install leaflet react-leaflet        # Maps
npm install react-qr-code               # QR codes
npm install recharts                    # Analytics charts
npm install react-camera-pro            # Camera for proof
npm install zustand                     # State management

# For testing:
npm install --save-dev vitest          # Unit tests
npm install --save-dev @testing-library/react
```

---

## 🔌 SMART CONTRACT CALLS NEEDED

### **POS App**
```solidity
// Get restaurant orders
OrderSettlement.getRestaurantOrders(restaurantAddress)

// Get order details
OrderSettlement.getOrder(orderId)

// Update order status
OrderSettlement.updateOrderStatus(orderId, status)

// Get sales stats
OrderSettlement.getRestaurantRevenue(restaurantAddress, startDate, endDate)
```

### **Customer App**
```solidity
// Get user orders
OrderSettlement.getUserOrders(userAddress)

// Get order details
OrderSettlement.getOrder(orderId)

// Place order
OrderSettlement.createOrder(restaurant, items, deliveryAddress, paymentToken)

// Get order status
DeliveryCoordinator.getDeliveryStatus(orderId)
```

### **Supplier App**
```solidity
// Get supplier products
SupplyChain.getSupplierProducts(supplierAddress)

// Get supplier orders
SupplyChain.getSupplierOrders(supplierAddress)

// Update inventory
SupplyChain.updateInventory(productId, quantity)

// Get analytics
SupplyChain.getSupplierAnalytics(supplierAddress)
```

### **Driver App**
```solidity
// Get driver deliveries
DeliveryCoordinator.getDriverDeliveries(driverAddress)

// Update location
DeliveryCoordinator.updateDriverLocation(driverAddress, lat, lng)

// Submit proof
ProofOfDelivery.submitDeliveryProof(deliveryId, photoHash, timestamp)

// Get earnings
DeliveryCoordinator.getDriverEarnings(driverAddress)
```

---

## 📊 SUGGESTED TIMELINE

| Hours | Task | Component | Status |
|-------|------|-----------|--------|
| 6-7 | Environment Setup | Config | ⏳ Next |
| 7-8 | Auth Testing | All | ⏳ Next |
| 8-10 | POS Dashboard | web/pos | 🔄 In Progress |
| 10-12 | Customer Dashboard | web/customer | 🔄 In Progress |
| 12-14 | Supplier Dashboard | web/supplier | 🔄 In Progress |
| 14-18 | Order Flow | web/customer | 🔄 In Progress |
| 18-22 | Delivery System | web/driver | 🔄 In Progress |
| 22-24 | Testing & Polish | All | 🔄 In Progress |

---

## 🚀 KICK-OFF COMMAND

```bash
# Start POS dev server
cd web/pos
npm run dev

# Open http://localhost:3000
# Click "Connect Wallet"
# Sign message
# Dashboard should load
```

---

## ✨ SUCCESS CRITERIA

- ✅ All 5 apps have functional dashboards
- ✅ Users can place orders end-to-end
- ✅ Drivers can accept & track deliveries
- ✅ Real-time updates work
- ✅ All error cases handled gracefully
- ✅ Mobile responsive
- ✅ Accessible (WCAG)
- ✅ <3s page load time

---

## 🎯 GO TIME!

**Status:** Ready for Phase 3  
**Time Remaining:** 67 hours  
**Confidence:** Very High  
**Next Command:** npm run dev && let's build features!

---

*Created at end of Phase 2 - Ready for Phase 3 Implementation*
