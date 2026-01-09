import os
import time
import logging
from typing import Dict, Any, Optional, Callable
from functools import wraps
import threading

logger = logging.getLogger(__name__)

class APMService:
    """APM Service for NileLink AI Service with DataDog and New Relic support"""

    def __init__(self):
        self.provider = os.getenv('APM_PROVIDER', 'datadog')
        self.enabled = os.getenv('APM_ENABLED', 'false').lower() == 'true'
        self.sample_rate = float(os.getenv('APM_SAMPLE_RATE', '0.1'))
        self.service_name = os.getenv('APM_SERVICE_NAME', 'nilelink-ai-service')
        self.environment = os.getenv('APM_ENVIRONMENT', 'development')

        self.datadog_client = None
        self.newrelic_client = None

        self._initialize_apm()

    def _initialize_apm(self):
        """Initialize APM providers"""
        if not self.enabled:
            logger.info("APM monitoring disabled")
            return

        try:
            if self.provider in ['datadog', 'both']:
                self._initialize_datadog()
            if self.provider in ['newrelic', 'both']:
                self._initialize_newrelic()

            logger.info(f"APM initialized with provider: {self.provider}")
        except Exception as e:
            logger.error(f"Failed to initialize APM: {str(e)}")

    def _initialize_datadog(self):
        """Initialize DataDog APM"""
        try:
            import datadog
            from datadog import initialize, statsd

            api_key = os.getenv('DD_API_KEY')
            if not api_key:
                logger.warning("DataDog API key not configured")
                return

            # Initialize DataDog
            initialize(
                api_key=api_key,
                app_key=os.getenv('DD_APP_KEY'),
                statsd_host='localhost',
                statsd_port=8125
            )

            self.datadog_client = statsd
            logger.info("DataDog APM initialized successfully")

        except ImportError:
            logger.warning("DataDog package not installed. Install with: pip install datadog")
        except Exception as e:
            logger.error(f"Failed to initialize DataDog: {str(e)}")

    def _initialize_newrelic(self):
        """Initialize New Relic APM"""
        try:
            import newrelic.agent

            license_key = os.getenv('NEW_RELIC_LICENSE_KEY')
            if not license_key:
                logger.warning("New Relic license key not configured")
                return

            # Initialize New Relic
            newrelic.agent.initialize(
                config_file=None,
                license_key=license_key,
                app_name=os.getenv('NEW_RELIC_APP_NAME', 'NileLink AI Service'),
                environment=self.environment
            )

            self.newrelic_client = newrelic.agent
            logger.info("New Relic APM initialized successfully")

        except ImportError:
            logger.warning("New Relic package not installed. Install with: pip install newrelic")
        except Exception as e:
            logger.error(f"Failed to initialize New Relic: {str(e)}")

    def record_metric(self, name: str, value: float, tags: Optional[Dict[str, str]] = None):
        """Record a metric"""
        if not self.enabled:
            return

        full_tags = {
            'service': self.service_name,
            'environment': self.environment,
            **(tags or {})
        }

        try:
            if self.datadog_client and self.provider in ['datadog', 'both']:
                tag_list = [f"{k}:{v}" for k, v in full_tags.items()]
                self.datadog_client.gauge(name, value, tags=tag_list)

            if self.newrelic_client and self.provider in ['newrelic', 'both']:
                self.newrelic_client.record_custom_metric(f"Custom/{name}", value, full_tags)

        except Exception as e:
            logger.error(f"Failed to record metric {name}: {str(e)}")

    def time_operation(self, operation_name: str, tags: Optional[Dict[str, str]] = None):
        """Decorator to time operations"""
        def decorator(func: Callable):
            @wraps(func)
            def wrapper(*args, **kwargs):
                if not self.should_sample():
                    return func(*args, **kwargs)

                start_time = time.time()
                try:
                    result = func(*args, **kwargs)
                    duration = (time.time() - start_time) * 1000  # Convert to milliseconds

                    self.record_metric(f"{operation_name}.duration", duration, tags)
                    self.record_metric(f"{operation_name}.success", 1, tags)

                    return result
                except Exception as e:
                    duration = (time.time() - start_time) * 1000

                    self.record_metric(f"{operation_name}.duration", duration, tags)
                    self.record_metric(f"{operation_name}.error", 1, {
                        **(tags or {}),
                        'error_type': type(e).__name__,
                        'error_message': str(e)
                    })

                    raise e
            return wrapper
        return decorator

    def record_business_metric(self, metric: str, value: float, attributes: Optional[Dict[str, Any]] = None):
        """Record business-specific metrics"""
        self.record_metric(f"business.{metric}", value, attributes)

    def record_error(self, error: Exception, custom_attributes: Optional[Dict[str, str]] = None):
        """Record error metrics"""
        if not self.enabled:
            return

        attributes = {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'service': self.service_name,
            'environment': self.environment,
            **(custom_attributes or {})
        }

        self.record_metric('application.error', 1, attributes)

        try:
            if self.newrelic_client and self.provider in ['newrelic', 'both']:
                self.newrelic_client.record_exception(error, custom_attributes)

        except Exception as e:
            logger.error(f"Failed to record error in APM: {str(e)}")

    def create_span(self, name: str, tags: Optional[Dict[str, str]] = None):
        """Create a tracing span"""
        return APMSpan(self, name, tags)

    def record_event(self, event_name: str, properties: Optional[Dict[str, Any]] = None, tags: Optional[Dict[str, str]] = None):
        """Record custom events"""
        if not self.enabled:
            return

        event_tags = {
            'event': event_name,
            'service': self.service_name,
            'environment': self.environment,
            **(tags or {})
        }

        self.record_metric(f"event.{event_name}", 1, event_tags)

        try:
            if self.newrelic_client and self.provider in ['newrelic', 'both']:
                self.newrelic_client.record_custom_event(event_name, properties or {})

        except Exception as e:
            logger.error(f"Failed to record custom event {event_name}: {str(e)}")

    def should_sample(self) -> bool:
        """Determine if current operation should be sampled"""
        import random
        return random.random() < self.sample_rate

    def health_check(self) -> Dict[str, Any]:
        """Health check for APM service"""
        providers = []
        if self.datadog_client:
            providers.append('datadog')
        if self.newrelic_client:
            providers.append('newrelic')

        return {
            'status': 'healthy' if self.enabled else 'disabled',
            'providers': providers,
            'service': self.service_name,
            'environment': self.environment
        }

class APMSpan:
    """APM Span for distributed tracing"""

    def __init__(self, apm_service: APMService, name: str, tags: Optional[Dict[str, str]] = None):
        self.apm_service = apm_service
        self.name = name
        self.tags = tags or {}
        self.start_time = time.time()
        self.finished = False

        self._initialize_span()

    def _initialize_span(self):
        """Initialize span in APM providers"""
        try:
            if self.apm_service.newrelic_client and self.apm_service.provider in ['newrelic', 'both']:
                import newrelic.agent
                self.nr_transaction = newrelic.agent.current_transaction()
        except Exception as e:
            logger.debug(f"APM span initialization failed: {str(e)}")

    def finish(self, error: Optional[Exception] = None):
        """Finish the span"""
        if self.finished:
            return

        duration = (time.time() - self.start_time) * 1000  # Convert to milliseconds
        self.finished = True

        try:
            # Record span metrics
            self.apm_service.record_metric(
                f"span.{self.name}.duration",
                duration,
                self.tags
            )

            if error:
                self.apm_service.record_metric(
                    f"span.{self.name}.error",
                    1,
                    {**self.tags, 'error_type': type(error).__name__}
                )

        except Exception as e:
            logger.error(f"Failed to finish APM span {self.name}: {str(e)}")

    def set_tag(self, key: str, value: str):
        """Set a tag on the span"""
        self.tags[key] = value

# FastAPI middleware for automatic request tracing
def create_apm_middleware(apm_service: APMService):
    """Create FastAPI middleware for APM request tracing"""
    from fastapi import Request, Response
    from starlette.middleware.base import BaseHTTPMiddleware

    class APMMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            if not apm_service.should_sample():
                return await call_next(request)

            span = apm_service.create_span('http.request', {
                'method': request.method,
                'url': str(request.url),
                'user_agent': request.headers.get('user-agent', ''),
                'client_ip': request.client.host if request.client else 'unknown'
            })

            try:
                start_time = time.time()
                response = await call_next(request)
                duration = (time.time() - start_time) * 1000

                span.set_tag('status_code', str(response.status_code))
                span.set_tag('response_time', str(duration))

                return response
            except Exception as e:
                span.set_tag('error', 'true')
                span.set_tag('error_type', type(e).__name__)
                raise e
            finally:
                span.finish()

    return APMMiddleware

# Global APM instance
apm_service = APMService()

# Graceful shutdown
def shutdown_apm():
    """Shutdown APM service"""
    try:
        logger.info("APM service shutdown completed")
    except Exception as e:
        logger.error(f"Error during APM shutdown: {str(e)}")

# Register shutdown handler
import atexit
atexit.register(shutdown_apm)