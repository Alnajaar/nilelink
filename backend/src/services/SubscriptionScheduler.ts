import { subscriptionService } from './SubscriptionService';
import { logger } from '../utils/logger';

export class SubscriptionScheduler {
    private intervals: NodeJS.Timeout[] = [];
    private isRunning = false;

    /**
     * Start the subscription scheduler
     */
    start() {
        if (this.isRunning) {
            logger.warn('Subscription scheduler is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting subscription scheduler');

        // Process renewals every hour
        const renewalInterval = setInterval(async () => {
            try {
                await subscriptionService.processRenewals();
            } catch (error) {
                logger.error('Error processing subscription renewals:', error);
            }
        }, 60 * 60 * 1000); // 1 hour

        // Process trial conversions every 4 hours
        const trialInterval = setInterval(async () => {
            try {
                await subscriptionService.processTrialConversions();
            } catch (error) {
                logger.error('Error processing trial conversions:', error);
            }
        }, 4 * 60 * 60 * 1000); // 4 hours

        // Process expired subscriptions daily
        const expiryInterval = setInterval(async () => {
            try {
                await subscriptionService.processExpiredSubscriptions();
            } catch (error) {
                logger.error('Error processing expired subscriptions:', error);
            }
        }, 24 * 60 * 60 * 1000); // 24 hours

        // Cleanup old data weekly
        const cleanupInterval = setInterval(async () => {
            try {
                await subscriptionService.cleanupOldData();
            } catch (error) {
                logger.error('Error cleaning up old subscription data:', error);
            }
        }, 7 * 24 * 60 * 60 * 1000); // 7 days

        this.intervals = [renewalInterval, trialInterval, expiryInterval, cleanupInterval];

        // Run initial checks on startup
        this.runInitialChecks();
    }

    /**
     * Stop the subscription scheduler
     */
    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        logger.info('Stopping subscription scheduler');

        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
    }

    /**
     * Run initial checks on startup
     */
    private async runInitialChecks() {
        try {
            logger.info('Running initial subscription lifecycle checks');

            // Process any pending renewals
            await subscriptionService.processRenewals();

            // Process any trial conversions
            await subscriptionService.processTrialConversions();

            // Process any expired subscriptions
            await subscriptionService.processExpiredSubscriptions();

            logger.info('Completed initial subscription lifecycle checks');
        } catch (error) {
            logger.error('Error during initial subscription checks:', error);
        }
    }

    /**
     * Manually trigger renewal processing (for testing/admin purposes)
     */
    async triggerRenewals() {
        logger.info('Manually triggering subscription renewals');
        await subscriptionService.processRenewals();
    }

    /**
     * Manually trigger trial conversions (for testing/admin purposes)
     */
    async triggerTrialConversions() {
        logger.info('Manually triggering trial conversions');
        await subscriptionService.processTrialConversions();
    }

    /**
     * Manually trigger expiry processing (for testing/admin purposes)
     */
    async triggerExpiries() {
        logger.info('Manually triggering subscription expiries');
        await subscriptionService.processExpiredSubscriptions();
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            activeIntervals: this.intervals.length,
            nextRuns: {
                renewals: 'Every hour',
                trialConversions: 'Every 4 hours',
                expiries: 'Daily',
                cleanup: 'Weekly'
            }
        };
    }
}

// Export singleton instance
export const subscriptionScheduler = new SubscriptionScheduler();
