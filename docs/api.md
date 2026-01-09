# NileLink API Documentation

Welcome to the NileLink API documentation. This API allows you to integrate with our food delivery platform programmatically.

## Base URL
```
https://api.nilelink.app/api
```

## Authentication

All API requests require authentication using JWT tokens.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "restaurant"
    }
  }
}
```

### Using the Token
Include the token in the Authorization header:
```
Authorization: Bearer jwt_token_here
```

## Restaurants

### Get Restaurant Details
```http
GET /api/restaurants/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "restaurant_id",
    "name": "Restaurant Name",
    "description": "Description",
    "address": "Address",
    "phone": "Phone",
    "menu": [...],
    "rating": 4.5
  }
}
```

### Update Restaurant
```http
PUT /api/restaurants/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

## Orders

### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "restaurantId": "restaurant_id",
  "items": [
    {
      "menuItemId": "item_id",
      "quantity": 2,
      "specialInstructions": "No onions"
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "City",
    "postalCode": "12345"
  },
  "paymentMethod": "card"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "status": "pending",
    "total": 25.99,
    "estimatedDelivery": "2024-01-15T18:30:00Z"
  }
}
```

### Get Order Status
```http
GET /api/orders/{id}
Authorization: Bearer {token}
```

### Update Order Status
```http
PATCH /api/orders/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "preparing"
}
```

**Valid statuses:** `pending`, `confirmed`, `preparing`, `ready`, `picked_up`, `delivered`, `cancelled`

## Payments

### Process Payment
```http
POST /api/payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "order_id",
  "amount": 25.99,
  "currency": "USD",
  "paymentMethodId": "pm_card_visa"
}
```

## Analytics

### Get Restaurant Analytics
```http
GET /api/analytics/restaurant/{restaurantId}?period=7d
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "totalRevenue": 3750.00,
    "averageOrderValue": 25.00,
    "popularItems": [...],
    "peakHours": [...]
  }
}
```

## Webhooks

Configure webhooks to receive real-time updates.

### Webhook Events
- `order.created`
- `order.status_updated`
- `payment.succeeded`
- `payment.failed`

### Register Webhook
```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/nilelink",
  "events": ["order.created", "order.status_updated"]
}
```

### Webhook Payload
```json
{
  "event": "order.status_updated",
  "data": {
    "orderId": "order_id",
    "oldStatus": "preparing",
    "newStatus": "ready",
    "timestamp": "2024-01-15T18:00:00Z"
  }
}
```

## Error Handling

All API responses follow this format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {...}
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Invalid or missing token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limits
- 1000 requests per hour for authenticated endpoints
- 100 requests per hour for public endpoints
- 10 requests per minute for payment endpoints

## SDKs and Libraries

### JavaScript SDK
```bash
npm install nilelink-api
```

```javascript
import { NileLinkAPI } from 'nilelink-api';

const client = new NileLinkAPI({
  apiKey: 'your_api_key'
});

const order = await client.orders.create({
  restaurantId: 'restaurant_id',
  items: [...]
});
```

## Support

For API support:
- Email: api-support@nilelink.app
- Documentation: [docs.nilelink.app/api](https://docs.nilelink.app/api)
- Status Page: [status.nilelink.app](https://status.nilelink.app)