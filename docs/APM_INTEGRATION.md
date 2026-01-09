# APM Integration Guide

This document describes the Application Performance Monitoring (APM) integration for the NileLink platform, supporting both DataDog and New Relic.

## Overview

The NileLink platform now includes comprehensive APM integration to monitor application performance, track errors, and provide insights into system behavior across all services.

## Supported Providers

- **DataDog**: Full tracing, metrics, and log correlation
- **New Relic**: Application monitoring, error tracking, and custom metrics
- **Both**: Simultaneous integration with both providers

## Architecture

### Backend (Node.js/TypeScript)

The `APMService` class provides:
- Automatic request tracing via Express middleware
- Custom metric recording
- Error tracking and correlation
- Distributed tracing with spans
- Performance timing decorators

### AI Service (Python/FastAPI)

The `APMService` class provides:
- Automatic request tracing via FastAPI middleware
- Custom metric recording
- Error tracking
- Performance timing decorators
- Business metric collection

## Configuration

### Environment Variables

```bash
# APM Configuration
APM_ENABLED=true
APM_PROVIDER=datadog  # Options: datadog, newrelic, both
APM_SAMPLE_RATE=0.1   # 10% sampling rate

# DataDog Configuration
DD_API_KEY=your_datadog_api_key
DD_APP_KEY=your_datadog_app_key
DD_SITE=datadoghq.com
DD_SERVICE_NAME=nilelink-backend
DD_ENV=production
DD_VERSION=1.0.0

# New Relic Configuration
NEW_RELIC_LICENSE_KEY=your_new_relic_license_key
NEW_RELIC_APP_NAME="NileLink Backend"
NEW_RELIC_LABELS=environment:production;team:backend
```

### Python AI Service

```bash
# APM Configuration for AI Service
APM_ENABLED=true
APM_PROVIDER=newrelic
APM_SAMPLE_RATE=0.1
APM_SERVICE_NAME=nilelink-ai-service
APM_ENVIRONMENT=production

# New Relic for AI Service
NEW_RELIC_LICENSE_KEY=your_ai_service_license_key
NEW_RELIC_APP_NAME="NileLink AI Service"
```

## Installation

### Backend (Node.js)

APM packages are included as optional dependencies:

```bash
# Install DataDog APM
npm install dd-trace hot-shots

# Install New Relic APM
npm install newrelic

# Or install both
npm install dd-trace hot-shots newrelic
```

### AI Service (Python)

APM packages are optional:

```bash
# Install DataDog APM
pip install datadog

# Install New Relic APM
pip install newrelic

# Or install both
pip install datadog newrelic
```

## Usage

### Automatic Instrumentation

Both services automatically instrument HTTP requests, database calls, and external API requests when APM is enabled.

### Custom Metrics

#### Backend (TypeScript)

```typescript
import { apmService } from './services/APMService';

// Record custom metrics
await apmService.recordMetric('custom.operation.count', 1, {
  user_type: 'premium',
  operation: 'export'
});

// Record business metrics
await apmService.recordBusinessMetric('orders.processed', 150, {
  currency: 'USD',
  payment_method: 'card'
});

// Time operations
const result = await apmService.timeOperation('database.query', async () => {
  return await prisma.user.findMany();
}, { table: 'users' });
```

#### AI Service (Python)

```python
from apm import apm_service

# Record custom metrics
apm_service.record_metric('ai.prediction.count', 1, {
    'model_version': '1.0.0',
    'prediction_type': 'fraud_detection'
})

# Record business metrics
apm_service.record_business_metric('transactions_analyzed', 1000, {
    'currency': 'USD',
    'risk_level': 'high'
})

# Time operations (decorator)
@apm_service.time_operation("ai.model.inference")
def analyze_transaction(data):
    # Your AI logic here
    return result
```

### Error Tracking

#### Backend

```typescript
try {
  // Risky operation
  await processPayment(paymentData);
} catch (error) {
  await apmService.recordError(error, {
    operation: 'payment_processing',
    user_id: paymentData.userId,
    amount: paymentData.amount
  });
  throw error;
}
```

#### Python

```python
try:
    result = ai_system.process_request(data, context)
except Exception as e:
    apm_service.record_error(e, {
        'endpoint': '/analyze',
        'user_id': data.get('userId')
    })
    raise
```

### Distributed Tracing

#### Backend

```typescript
const span = apmService.createSpan('complex.operation', {
  operation_type: 'data_processing',
  batch_size: 1000
});

try {
  // Complex operation
  await processBatchData(data);
  span.setTag('records_processed', data.length);
} finally {
  await span.finish();
}
```

#### Python

```python
span = apm_service.create_span('ai.inference', {
    'model': 'fraud_detection',
    'batch_size': len(data)
})

try:
    results = ai_system.batch_predict(data)
    span.set_tag('predictions_made', len(results))
finally:
    span.finish()
```

### Custom Events

```typescript
// Backend
await apmService.recordEvent('user.registration', {
  user_id: user.id,
  registration_method: 'email',
  plan: 'premium'
}, {
  environment: 'production',
  source: 'web_app'
});

// Python
apm_service.record_event('ai.decision_made', {
    'decision': 'approve',
    'confidence': 0.95,
    'model_version': '1.0.0'
}, {
    'user_id': user_id,
    'risk_level': 'low'
})
```

## Monitoring Dashboards

### DataDog Dashboards

Automatically created dashboards include:
- Request latency and throughput
- Error rates by endpoint
- Database performance metrics
- Custom business metrics
- Distributed tracing visualizations

### New Relic Dashboards

Automatically tracked metrics:
- Application performance overview
- Error analysis and tracking
- Custom metrics and events
- Transaction traces
- Infrastructure monitoring

## Health Checks

Both services expose APM health status:

```bash
# Backend health with APM
GET /health/detailed

# AI Service health with APM
GET /health
```

Response includes:
```json
{
  "apm": {
    "status": "healthy",
    "providers": ["datadog", "newrelic"],
    "service": "nilelink-backend",
    "environment": "production"
  }
}
```

## Sampling and Performance

- **Configurable Sampling**: Control monitoring overhead with `APM_SAMPLE_RATE`
- **Smart Sampling**: Automatic request sampling based on configured rate
- **Low Overhead**: Designed for production use with minimal performance impact
- **Graceful Degradation**: APM failures don't affect application functionality

## Alerting

Configure alerts in your APM provider:

### DataDog Alerts
- High error rates (>5%)
- Slow response times (>2s)
- Database connection failures
- Memory/CPU threshold breaches

### New Relic Alerts
- Application performance degradation
- Error rate spikes
- Custom metric thresholds
- Synthetic monitor failures

## Best Practices

### Metric Naming
- Use hierarchical naming: `service.operation.metric`
- Include units in names when applicable
- Use consistent tag keys across services

### Error Handling
- Always include relevant context in error tracking
- Use structured error attributes
- Avoid logging sensitive data in APM

### Performance
- Use sampling in production to control costs
- Monitor APM service resource usage
- Regularly review and clean up unused metrics

### Security
- Store API keys securely (environment variables)
- Use least-privilege access for APM integrations
- Monitor for APM-related security events

## Troubleshooting

### Common Issues

1. **APM Not Initializing**
   - Check environment variables
   - Verify package installations
   - Review application logs for initialization errors

2. **Missing Metrics**
   - Confirm sampling rate settings
   - Check provider-specific configuration
   - Verify metric naming conventions

3. **Performance Impact**
   - Adjust sampling rates
   - Review custom instrumentation
   - Monitor APM service resource usage

### Debugging

Enable debug logging:
```bash
DEBUG=apm:* npm start
```

Check APM service health:
```bash
curl http://localhost:3000/health/detailed
```

## Migration Guide

### From No APM to APM

1. Set environment variables
2. Install APM packages
3. Deploy with APM enabled
4. Monitor dashboards for 24-48 hours
5. Adjust sampling rates as needed

### Switching Providers

1. Install new provider packages
2. Update `APM_PROVIDER` environment variable
3. Restart services
4. Verify metrics appear in new provider
5. Remove old provider packages if desired

## Cost Optimization

- Use appropriate sampling rates (0.1-0.5 for production)
- Regularly review custom metrics usage
- Set up budget alerts in APM providers
- Archive old data according to retention policies

## Support

For APM integration issues:
1. Check application logs for APM-related errors
2. Verify provider console for connectivity issues
3. Review metric naming and tagging consistency
4. Consult provider-specific documentation

---

**Last Updated**: January 2026
**Version**: 1.0.0