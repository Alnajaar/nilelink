import { BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import {
  ProtocolInitialized,
  GovernanceUpdated
} from "../generated/NileLinkProtocol/NileLinkProtocol"
import {
  RestaurantRegistered,
  RestaurantConfigUpdated,
  RestaurantStatusChanged
} from "../generated/RestaurantRegistry/RestaurantRegistry"
import {
  PaymentIntentCreated,
  PaymentReceived,
  PaymentSettled
} from "../generated/OrderSettlement/OrderSettlement"
import {
  DeliveryOrderCreated,
  DeliveryStatusUpdated
} from "../generated/DeliveryCoordinator/DeliveryCoordinator"
import {
  PurchaseOrderCreated,
  PurchaseOrderFulfilled,
  ProductAdded
} from "../generated/SupplyChain/SupplyChain"
import {
  DisputeOpened,
  DisputeResolved
} from "../generated/DisputeResolution/DisputeResolution"
import {
  AnomalyFlagged,
  TransactionBlocked
} from "../generated/FraudDetection/FraudDetection"
import {
  SupplierRegistered,
  SupplierStatusChanged
} from "../generated/SupplierRegistry/SupplierRegistry"
import {
  ProtocolStats,
  Restaurant,
  InventoryItem,
  Order,
  Payment,
  Delivery,
  PurchaseOrder,
  Dispute,
  FraudAlert,
  Supplier,
  User,
  UserReputation
} from "../generated/schema"

export function handleProtocolInitialized(event: ProtocolInitialized): void {
  let stats = ProtocolStats.load("global")
  if (stats == null) {
    stats = new ProtocolStats("global")
    stats.totalRestaurants = BigInt.fromI32(0)
    stats.totalOrders = BigInt.fromI32(0)
    stats.totalVolumeUsd6 = BigInt.fromI32(0)
    stats.activeDisputes = BigInt.fromI32(0)
    stats.totalInvestmentsUsd6 = BigInt.fromI32(0)
    stats.protocolFeesCollectedUsd6 = BigInt.fromI32(0)
    stats.totalDeliveries = BigInt.fromI32(0)
    stats.activeDeliveries = BigInt.fromI32(0)
    stats.totalSuppliers = BigInt.fromI32(0)
    stats.activeSuppliers = BigInt.fromI32(0)
    stats.lastUpdated = event.block.timestamp
    stats.save()
  }
}

export function handleGovernanceUpdated(event: GovernanceUpdated): void {
  // Handle governance updates
}

export function handleRestaurantRegistered(event: RestaurantRegistered): void {
  let restaurant = new Restaurant(event.params.restaurant.toHexString())
  restaurant.metadataCid = event.params.metadataCid
  restaurant.catalogCid = event.params.catalogCid
  restaurant.country = event.params.country.toString()
  restaurant.localCurrency = event.params.localCurrency.toString()
  restaurant.tokenId = event.params.tokenId
  restaurant.businessType = event.params.businessType
  restaurant.plan = event.params.plan
  restaurant.dailyRateLimitUsd6 = event.params.dailyRateLimitUsd6
  restaurant.status = 1 // Active
  restaurant.commissionRate = BigDecimal.fromString("0")
  restaurant.rating = BigDecimal.fromString("0")
  restaurant.reviewCount = BigInt.fromI32(0)
  restaurant.totalReviews = BigInt.fromI32(0)
  restaurant.createdAt = event.params.timestamp
  restaurant.updatedAt = event.params.timestamp
  restaurant.save()

  let stats = ProtocolStats.load("global")
  if (stats != null) {
    stats.totalRestaurants = stats.totalRestaurants.plus(BigInt.fromI32(1))
    stats.save()
  }
}

export function handleRestaurantConfigUpdated(event: RestaurantConfigUpdated): void {
  let restaurant = Restaurant.load(event.params.restaurant.toHexString())
  if (restaurant != null) {
    restaurant.metadataCid = event.params.metadataCid
    restaurant.catalogCid = event.params.catalogCid
    restaurant.updatedAt = event.params.timestamp
    restaurant.save()
  }
}

export function handlePaymentIntentCreated(event: PaymentIntentCreated): void {
  let order = new Order(event.params.orderId.toHexString())
  order.orderNumber = event.params.orderId.toHexString()
  order.amountUsd6 = event.params.amountUsd6
  order.taxAmountUsd6 = BigInt.fromI32(0)
  order.deliveryFeeUsd6 = BigInt.fromI32(0)
  order.platformFeeUsd6 = BigInt.fromI32(0)
  order.totalAmountUsd6 = event.params.amountUsd6
  order.method = event.params.method
  order.status = 0 // Pending
  order.paymentStatus = 0 // Pending
  order.deliveryAddress = ""
  order.createdAt = event.params.timestamp
  order.save()

  let stats = ProtocolStats.load("global")
  if (stats != null) {
    stats.totalOrders = stats.totalOrders.plus(BigInt.fromI32(1))
    stats.save()
  }
}

export function handlePaymentReceived(event: PaymentReceived): void {
  let payment = new Payment(event.params.orderId.toHexString() + "-" + event.block.timestamp.toString())
  payment.amount = BigDecimal.fromString(event.params.amountUsd6.toString())
  payment.currency = "USDC"
  payment.paymentMethod = event.params.method.toString()
  payment.status = 1 // Completed
  payment.createdAt = event.params.timestamp
  payment.save()

  let stats = ProtocolStats.load("global")
  if (stats != null) {
    stats.totalVolumeUsd6 = stats.totalVolumeUsd6.plus(event.params.amountUsd6)
    stats.save()
  }
}

export function handlePaymentSettled(event: PaymentSettled): void {
  // Handle payment settlement
}

export function handleDeliveryOrderCreated(event: DeliveryOrderCreated): void {
  let delivery = new Delivery(event.params.orderId.toHexString())
  delivery.order = event.params.orderId.toHexString()
  delivery.restaurant = event.params.restaurant.toHexString()
  delivery.customer = event.params.customer.toHexString()
  delivery.status = event.params.priority > 0 ? 1 : 0
  delivery.amountUsd6 = BigInt.fromI32(0)
  delivery.zoneId = event.params.zoneId as i32
  delivery.priority = event.params.priority as i32
  delivery.createdAt = event.block.timestamp
  delivery.save()

  let stats = ProtocolStats.load("global")
  if (stats != null) {
    stats.totalDeliveries = stats.totalDeliveries.plus(BigInt.fromI32(1))
    stats.activeDeliveries = stats.activeDeliveries.plus(BigInt.fromI32(1))
    stats.save()
  }
}

export function handleDeliveryStatusUpdated(event: DeliveryStatusUpdated): void {
  let delivery = Delivery.load(event.params.orderId.toHexString())
  if (delivery != null) {
    delivery.status = event.params.newStatus as i32
    if (delivery.status == 4) { // DELIVERED
      let stats = ProtocolStats.load("global")
      if (stats != null) {
        stats.activeDeliveries = stats.activeDeliveries.minus(BigInt.fromI32(1))
        stats.save()
      }
    }
    delivery.save()
  }
}

export function handlePurchaseOrderCreated(event: PurchaseOrderCreated): void {
  let po = new PurchaseOrder(event.params.orderId.toHexString())
  po.restaurant = event.params.restaurant.toHexString()
  po.supplier = event.params.supplier.toHexString()
  po.status = 1 // SUBMITTED
  po.totalAmountUsd6 = event.params.totalAmount
  po.currency = event.params.currency.toString()
  po.createdAt = event.params.timestamp
  po.dueDate = BigInt.fromI32(0)
  po.creditUsed = BigInt.fromI32(0)
  po.createdAtBlock = event.block.number
  po.save()
}

export function handlePurchaseOrderFulfilled(event: PurchaseOrderFulfilled): void {
  let po = PurchaseOrder.load(event.params.orderId.toHexString())
  if (po != null) {
    po.status = 5 // FULFILLED
    po.fulfilledAt = event.params.timestamp
    po.save()
  }
}

export function handleProductAdded(event: ProductAdded): void {
  let item = new InventoryItem(event.params.itemId.toHexString())
  item.restaurant = event.params.restaurant.toHexString()
  item.supplier = event.params.supplier.toHexString()
  item.category = event.params.category
  item.tokenId = event.params.tokenId
  item.metadataCid = event.params.metadataCid
  item.createdAt = event.params.timestamp
  item.lastUpdated = event.params.timestamp
  // Defaults
  item.currentStock = BigInt.fromI32(0)
  item.reorderPoint = BigInt.fromI32(0)
  item.unitCostUsd6 = BigInt.fromI32(0)
  item.currency = "USD"
  item.trackExpiry = false
  item.isActive = true
  item.totalMovements = BigInt.fromI32(0)
  item.save()
}

export function handleRestaurantStatusChanged(event: RestaurantStatusChanged): void {
  let restaurant = Restaurant.load(event.params.restaurant.toHexString())
  if (restaurant != null) {
    restaurant.status = event.params.newStatus
    restaurant.updatedAt = event.params.timestamp
    restaurant.save()
  }
}

export function handleDisputeOpened(event: DisputeOpened): void {
  let dispute = new Dispute(event.params.disputeId.toHexString())
  dispute.order = event.params.orderId.toHexString()
  dispute.claimant = event.params.claimant
  dispute.claimAmountUsd6 = event.params.claimAmount
  dispute.openedAt = event.params.timestamp
  dispute.deadlineAt = event.params.deadlineAt
  dispute.reasonHash = event.params.reason
  dispute.status = 0 // OPEN
  dispute.evidence = []
  dispute.createdAt = event.params.timestamp
  dispute.updatedAt = event.params.timestamp
  dispute.save()
}

export function handleDisputeResolved(event: DisputeResolved): void {
  let dispute = Dispute.load(event.params.disputeId.toHexString())
  if (dispute != null) {
    dispute.resolution = event.params.resolution
    dispute.resolvedAt = event.params.timestamp
    dispute.resolvedBy = event.params.resolver
    dispute.refundAmountUsd6 = event.params.refundAmount
    dispute.status = 1 // RESOLVED
    dispute.updatedAt = event.params.timestamp
    dispute.save()
  }
}

export function handleAnomalyFlagged(event: AnomalyFlagged): void {
  let alert = new FraudAlert(event.params.alertId.toHexString())
  alert.subject = event.params.subject
  alert.anomalyType = event.params.anomalyType
  alert.severity = event.params.severity
  alert.detailsHash = event.params.details
  alert.timestamp = event.params.timestamp
  alert.resolved = false
  alert.save()
}

export function handleTransactionBlocked(event: TransactionBlocked): void {
  let alert = new FraudAlert(event.params.transactionId.toHexString())
  alert.subject = event.params.transactionId
  alert.anomalyType = Bytes.fromHexString("0x02") // TRANSACTION_BLOCKED type
  alert.severity = 5 // HIGH
  alert.detailsHash = event.params.reason
  alert.timestamp = event.params.timestamp
  alert.resolved = false
  alert.save()
}

export function handleSupplierRegistered(event: SupplierRegistered): void {
  let supplier = new Supplier(event.params.supplier.toHexString())
  supplier.businessName = event.params.businessName
  supplier.contactName = event.params.contactName
  supplier.email = event.params.email
  supplier.phone = event.params.phone
  supplier.businessType = event.params.businessType
  supplier.industry = event.params.industry
  supplier.country = event.params.country
  supplier.localCurrency = event.params.localCurrency
  supplier.status = event.params.status
  supplier.reputationScore = 100 // Default score
  supplier.registeredAt = event.params.timestamp
  supplier.lastVerifiedAt = event.params.timestamp
  supplier.lastActiveAt = event.params.timestamp
  supplier.metadataCid = event.params.metadataCid
  supplier.documentsCid = event.params.documentsCid
  supplier.verifier = event.params.verifier
  supplier.totalOrders = BigInt.fromI32(0)
  supplier.totalVolumeUsd6 = BigInt.fromI32(0)
  supplier.activeOrders = BigInt.fromI32(0)
  supplier.createdAt = event.params.timestamp
  supplier.updatedAt = event.params.timestamp
  supplier.save()

  let stats = ProtocolStats.load("global")
  if (stats != null) {
    stats.totalSuppliers = stats.totalSuppliers.plus(BigInt.fromI32(1))
    stats.activeSuppliers = stats.activeSuppliers.plus(BigInt.fromI32(1))
    stats.save()
  }
}

export function handleSupplierStatusChanged(event: SupplierStatusChanged): void {
  let supplier = Supplier.load(event.params.supplier.toHexString())
  if (supplier != null) {
    supplier.status = event.params.newStatus
    supplier.updatedAt = event.params.timestamp
    supplier.save()
  }
}