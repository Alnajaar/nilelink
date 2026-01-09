import { logger } from '../utils/logger';
import { config } from '../config';

// DataDog SDK types (would be installed via npm)
interface DataDogMetric {
  metric: string;
  points: [number, number][];
  tags?: string[];
  type?: 'gauge' | 'count' | 'rate' | 'histogram' | 'distribution';
}

interface DataDogTrace {
  trace_id: string;
  span_id: string;
  parent_id?: string;
  name: string;
  resource: string;
  service: string;
  type: string;
  start: number;
  duration: number;
  error?: number;
  tags?: Record<string, string>;
}

// New Relic SDK types (would be installed via npm)
interface NewRelicMetric {
  name: string;
  value: number;
  timestamp?: number;
  attributes?: Record<string, string | number | boolean>;
}

interface APMConfig {
  provider: 'datadog' | 'newrelic' | 'both';
  datadog?: {
    apiKey: string;
    appKey?: string;
    site?: string;
    serviceName: string;
    env: string;
    version?: string;
  };
  newrelic?: {
    licenseKey: string;
    appName: string;
    labels?: string;
  };
  enabled: boolean;
  sampleRate: number; // 0.0 to 1.0
  customTags: Record<string, string>;
}

export class APMService {
  private config: APMConfig;
  private initialized: boolean = false;
  private ddClient: any = null; // DataDog client
  private nrAgent: any = null; // New Relic agent

  constructor() {
    this.config = this.loadConfig();
    this.initializeAPM();
  }

  private loadConfig(): APMConfig {
    return {
      provider: (process.env.APM_PROVIDER as 'datadog' | 'newrelic' | 'both') || 'datadog',
      enabled: process.env.APM_ENABLED === 'true',
      sampleRate: parseFloat(process.env.APM_SAMPLE_RATE || '0.1'), // 10% sampling by default
      customTags: {
        service: 'nilelink-backend',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      },
      datadog: {
        apiKey: process.env.DD_API_KEY || '',
        appKey: process.env.DD_APP_KEY,
        site: process.env.DD_SITE || 'datadoghq.com',
        serviceName: process.env.DD_SERVICE_NAME || 'nilelink-backend',
        env: process.env.DD_ENV || process.env.NODE_ENV || 'development',
        version: process.env.DD_VERSION || process.env.npm_package_version
      },
      newrelic: {
        licenseKey: process.env.NEW_RELIC_LICENSE_KEY || '',
        appName: process.env.NEW_RELIC_APP_NAME || 'NileLink Backend',
        labels: process.env.NEW_RELIC_LABELS
      }
    };
  }

  private async initializeAPM(): Promise<void> {
    if (!this.config.enabled) {
      logger.info('APM monitoring disabled');
      return;
    }

    try {
      if (this.config.provider === 'datadog' || this.config.provider === 'both') {
        await this.initializeDataDog();
      }

      if (this.config.provider === 'newrelic' || this.config.provider === 'both') {
        await this.initializeNewRelic();
      }

      this.initialized = true;
      logger.info(`APM initialized with provider: ${this.config.provider}`);
    } catch (error) {
      logger.error('Failed to initialize APM', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  private async initializeDataDog(): Promise<void> {
    if (!this.config.datadog?.apiKey) {
      logger.warn('DataDog API key not configured');
      return;
    }

    try {
      // Initialize DataDog SDK
      // Note: Requires 'dd-trace' and 'datadog-metrics' packages
      const tracer = require('dd-trace');
      const StatsD = require('hot-shots');

      // Initialize tracer
      tracer.init({
        service: this.config.datadog.serviceName,
        env: this.config.datadog.env,
        version: this.config.datadog.version,
        tags: this.config.customTags
      });

      // Initialize metrics client
      this.ddClient = new StatsD({
        host: 'localhost',
        port: 8125,
        prefix: `${this.config.datadog.serviceName}.`,
        globalTags: Object.entries(this.config.customTags).map(([k, v]) => `${k}:${v}`)
      });

      logger.info('DataDog APM initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize DataDog', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  private async initializeNewRelic(): Promise<void> {
    if (!this.config.newrelic?.licenseKey) {
      logger.warn('New Relic license key not configured');
      return;
    }

    try {
      // Initialize New Relic SDK
      // Note: Requires 'newrelic' package
      require('newrelic');

      // Configure New Relic agent programmatically
      process.env.NEW_RELIC_LICENSE_KEY = this.config.newrelic.licenseKey;
      process.env.NEW_RELIC_APP_NAME = this.config.newrelic.appName;
      process.env.NEW_RELIC_LABELS = this.config.newrelic.labels;

      logger.info('New Relic APM initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize New Relic', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  // Metric Recording Methods
  async recordMetric(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    if (!this.initialized) return;

    const fullTags = { ...this.config.customTags, ...tags };

    try {
      if (this.ddClient && (this.config.provider === 'datadog' || this.config.provider === 'both')) {
        await this.recordDataDogMetric(name, value, fullTags);
      }

      if (this.nrAgent && (this.config.provider === 'newrelic' || this.config.provider === 'both')) {
        await this.recordNewRelicMetric(name, value, fullTags);
      }
    } catch (error) {
      logger.error('Failed to record metric', { name, value, error: error instanceof Error ? error.message : String(error) });
    }
  }

  private async recordDataDogMetric(name: string, value: number, tags: Record<string, string>): Promise<void> {
    const tagArray = Object.entries(tags).map(([k, v]) => `${k}:${v}`);

    // Use StatsD client for metrics
    this.ddClient.gauge(name, value, tagArray, (err: any) => {
      if (err) logger.error('DataDog metric send failed', { name, error: err.message });
    });
  }

  private async recordNewRelicMetric(name: string, value: number, tags: Record<string, string>): Promise<void> {
    // New Relic custom metrics
    const newrelic = require('newrelic');
    newrelic.recordMetric(`Custom/${name}`, value, tags);
  }

  // Performance Timing Methods
  async timeOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      await this.recordMetric(`${operationName}.duration`, duration, tags);
      await this.recordMetric(`${operationName}.success`, 1, tags);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      await this.recordMetric(`${operationName}.duration`, duration, tags);
      await this.recordMetric(`${operationName}.error`, 1, { ...tags, error: error instanceof Error ? error.message : String(error) });

      throw error;
    }
  }

  // Business Metrics
  async recordBusinessMetric(
    metric: string,
    value: number,
    attributes?: Record<string, string | number>
  ): Promise<void> {
    await this.recordMetric(`business.${metric}`, value, attributes as Record<string, string>);
  }

  // Error Tracking
  async recordError(error: Error, customAttributes?: Record<string, string>): Promise<void> {
    if (!this.initialized) return;

    const attributes: Record<string, string> = {
      error_type: error.name,
      error_message: error.message,
      ...this.config.customTags,
      ...customAttributes
    };

    // Add stack trace if available
    if (error.stack) {
      attributes.stack_trace = error.stack.substring(0, 1000);
    }

    await this.recordMetric('application.error', 1, attributes);

    try {
      if (this.ddClient && (this.config.provider === 'datadog' || this.config.provider === 'both')) {
        // DataDog error tracking
        const tracer = require('dd-trace');
        const span = tracer.scope().active();
        if (span) {
          span.setTag('error', true);
          span.setTag('error.type', error.name);
          span.setTag('error.message', error.message);
        }
      }

      if (this.nrAgent && (this.config.provider === 'newrelic' || this.config.provider === 'both')) {
        // New Relic error tracking
        const newrelic = require('newrelic');
        newrelic.noticeError(error, customAttributes);
      }
    } catch (apmError) {
      logger.error('Failed to record error in APM', { apmError: apmError instanceof Error ? apmError.message : String(apmError) });
    }
  }

  // Distributed Tracing
  createSpan(name: string, tags?: Record<string, string>): APMSpan {
    return new APMSpan(this, name, tags);
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; providers: string[] }> {
    const providers: string[] = [];

    if (this.ddClient) {
      providers.push('datadog');
    }

    if (this.nrAgent) {
      providers.push('newrelic');
    }

    return {
      status: this.initialized ? 'healthy' : 'disabled',
      providers
    };
  }

  // Custom Event Tracking
  async recordEvent(
    eventName: string,
    properties?: Record<string, any>,
    tags?: Record<string, string>
  ): Promise<void> {
    if (!this.initialized) return;

    const eventTags = {
      event: eventName,
      ...this.config.customTags,
      ...tags
    };

    await this.recordMetric(`event.${eventName}`, 1, eventTags);

    try {
      if (this.ddClient && (this.config.provider === 'datadog' || this.config.provider === 'both')) {
        // DataDog custom events would require additional setup
        logger.debug('DataDog custom event recorded', { eventName, properties });
      }

      if (this.nrAgent && (this.config.provider === 'newrelic' || this.config.provider === 'both')) {
        const newrelic = require('newrelic');
        newrelic.recordCustomEvent(eventName, properties || {});
      }
    } catch (error) {
      logger.error('Failed to record custom event', { eventName, error: error instanceof Error ? error.message : String(error) });
    }
  }

  // Sampling decision
  shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  // Shutdown
  async shutdown(): Promise<void> {
    try {
      if (this.ddClient) {
        this.ddClient.close();
      }
      logger.info('APM service shut down successfully');
    } catch (error) {
      logger.error('Error during APM shutdown', { error: error instanceof Error ? error.message : String(error) });
    }
  }
}

// Span wrapper for distributed tracing
export class APMSpan {
  private apmService: APMService;
  private name: string;
  private tags: Record<string, string>;
  private startTime: number;
  private finished: boolean = false;
  private ddSpan: any = null;
  private nrSegment: any = null;

  constructor(apmService: APMService, name: string, tags?: Record<string, string>) {
    this.apmService = apmService;
    this.name = name;
    this.tags = tags || {};
    this.startTime = Date.now();

    this.initializeSpan();
  }

  private initializeSpan(): void {
    try {
      // DataDog span
      const tracer = require('dd-trace');
      this.ddSpan = tracer.scope().active()?.tracer?.startSpan(this.name, {
        tags: this.tags
      });

      // New Relic segment
      const newrelic = require('newrelic');
      this.nrSegment = newrelic.createSegment(this.name);
    } catch (error) {
      logger.debug('APM span initialization failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  async finish(error?: Error): Promise<void> {
    if (this.finished) return;

    const duration = Date.now() - this.startTime;
    this.finished = true;

    try {
      // Finish DataDog span
      if (this.ddSpan) {
        if (error) {
          this.ddSpan.setTag('error', true);
          this.ddSpan.setTag('error.msg', error.message);
        }
        this.ddSpan.finish();
      }

      // Finish New Relic segment
      if (this.nrSegment) {
        if (error) {
          this.nrSegment.noticeError(error);
        }
        this.nrSegment.end();
      }

      // Record span metrics
      await this.apmService.recordMetric(
        `span.${this.name}.duration`,
        duration,
        this.tags
      );

      if (error) {
        await this.apmService.recordMetric(
          `span.${this.name}.error`,
          1,
          { ...this.tags, error_type: error.name }
        );
      }
    } catch (spanError) {
      logger.error('Failed to finish APM span', { name: this.name, error: spanError instanceof Error ? spanError.message : String(spanError) });
    }
  }

  setTag(key: string, value: string): void {
    this.tags[key] = value;

    try {
      if (this.ddSpan) {
        this.ddSpan.setTag(key, value);
      }
      // New Relic tags are handled through segment attributes
    } catch (error) {
      logger.debug('Failed to set span tag', { key, value, error: error instanceof Error ? error.message : String(error) });
    }
  }
}

// Express middleware for automatic request tracing
export function createAPMRequestMiddleware(apmService: APMService) {
  return async (req: any, res: any, next: any) => {
    if (!apmService.shouldSample()) {
      return next();
    }

    const span = apmService.createSpan('http.request', {
      method: req.method,
      url: req.url,
      user_agent: req.get('User-Agent') || '',
      ip: req.ip
    });

    // Track response
    const originalSend = res.send;
    res.send = function(data: any) {
      res.send = originalSend;
      const result = res.send.call(this, data);

      span.setTag('status_code', res.statusCode.toString());
      span.setTag('response_size', Buffer.byteLength(data || '').toString());

      return result;
    };

    res.on('finish', async () => {
      try {
        await span.finish();
      } catch (error) {
        logger.error('Failed to finish request span', { error: error instanceof Error ? error.message : String(error) });
      }
    });

    next();
  };
}

// Global APM instance
export const apmService = new APMService();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await apmService.shutdown();
});

process.on('SIGINT', async () => {
  await apmService.shutdown();
});
