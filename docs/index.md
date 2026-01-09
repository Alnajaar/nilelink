# NileLink Customer Onboarding Guide

Welcome to NileLink! This guide will help you get started with our food delivery platform.

## Getting Started

### 1. Account Setup
- Sign up at [nilelink.app](https://nilelink.app)
- Verify your email address
- Complete your business profile

### 2. Restaurant Setup
- Add your restaurant information
- Configure menu items and pricing
- Set up delivery zones and fees

### 3. Payment Configuration
- Connect your Stripe account
- Configure settlement preferences
- Set up automatic payouts

## For Restaurant Owners

### Managing Your Menu
- Add menu categories
- Upload high-quality food photos
- Set preparation times
- Configure dietary options

### Order Management
- Accept/reject orders in real-time
- Update order status
- Communicate with customers
- Handle special requests

### Analytics and Reporting
- View sales performance
- Track customer ratings
- Monitor delivery times
- Analyze popular items

## For Delivery Partners

### Getting Started
- Complete driver verification
- Upload required documents
- Set up payment methods

### Using the Driver App
- Accept delivery assignments
- Navigate to pickup locations
- Track delivery routes
- Update delivery status

## API Integration

For developers looking to integrate with NileLink:

### Authentication
```javascript
const response = await fetch('https://api.nilelink.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
});
```

### Creating Orders
```javascript
const order = await fetch('https://api.nilelink.app/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    restaurantId: 'restaurant-id',
    items: [...],
    deliveryAddress: {...}
  })
});
```

## Support

Need help? Contact our support team:
- Email: support@nilelink.app
- Phone: +971-XX-XXX-XXXX
- Live chat: Available on our website

## Next Steps

- [Complete Setup Guide](./setup.md)
- [Menu Management](./menu-management.md)
- [Order Processing](./order-processing.md)
- [API Documentation](./api.md)