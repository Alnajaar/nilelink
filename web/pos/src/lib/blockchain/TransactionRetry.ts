/**
 * Transaction Retry Logic with Exponential Backoff
 * Handles transient blockchain failures (network issues, RPC rate limits, gas estimation)
 */

export interface RetryConfig {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    retryableErrors: string[];
}

export interface RetryResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    attempts: number;
    totalTime: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
        'network',
        'timeout',
        'rate limit',
        'nonce',
        'gas',
        'rpc',
        'insufficient funds',
        'replacement transaction underpriced'
    ]
};

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: Error, config: RetryConfig): boolean {
    const errorMessage = error.message.toLowerCase();
    return config.retryableErrors.some(pattern => errorMessage.includes(pattern));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

    // Add jitter (±25%) to prevent thundering herd
    const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
    return Math.floor(cappedDelay + jitter);
}

/**
 * Executes an async operation with automatic retry on failure
 */
export async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    onRetry?: (attempt: number, error: Error, delayMs: number) => void
): Promise<RetryResult<T>> {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
        try {
            console.log(`[RetryLogic] Attempt ${attempt}/${finalConfig.maxAttempts}`);
            const result = await operation();

            return {
                success: true,
                data: result,
                attempts: attempt,
                totalTime: Date.now() - startTime
            };
        } catch (error: any) {
            lastError = error;
            console.warn(`[RetryLogic] Attempt ${attempt} failed:`, error.message);

            // Check if we should retry
            if (attempt < finalConfig.maxAttempts && isRetryableError(error, finalConfig)) {
                const delayMs = calculateDelay(attempt, finalConfig);
                console.log(`[RetryLogic] Retrying in ${delayMs}ms...`);

                if (onRetry) {
                    onRetry(attempt, error, delayMs);
                }

                // Wait before next attempt
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
                // No more retries or non-retryable error
                break;
            }
        }
    }

    return {
        success: false,
        error: lastError,
        attempts: finalConfig.maxAttempts,
        totalTime: Date.now() - startTime
    };
}

/**
 * Blockchain-specific retry wrapper for contract writes
 */
export async function retryBlockchainTransaction<T>(
    txOperation: () => Promise<T>,
    options: {
        onRetry?: (attempt: number, error: Error) => void;
        onFinalFailure?: (error: Error) => void;
    } = {}
): Promise<T> {
    const result = await retryWithBackoff(
        txOperation,
        {
            maxAttempts: 3,
            initialDelayMs: 2000,
            maxDelayMs: 15000,
            backoffMultiplier: 2
        },
        (attempt, error, delayMs) => {
            if (options.onRetry) {
                options.onRetry(attempt, error);
            }
        }
    );

    if (!result.success) {
        if (options.onFinalFailure && result.error) {
            options.onFinalFailure(result.error);
        }
        throw result.error || new Error('Transaction failed after retries');
    }

    return result.data as T;
}

/**
 * Retry wrapper for read operations (The Graph, IPFS)
 */
export async function retryReadOperation<T>(
    readOperation: () => Promise<T>,
    maxAttempts: number = 5
): Promise<T> {
    const result = await retryWithBackoff(
        readOperation,
        {
            maxAttempts,
            initialDelayMs: 500,
            maxDelayMs: 5000,
            backoffMultiplier: 1.5,
            retryableErrors: ['network', 'timeout', 'fetch', 'gateway', '503', '502', '504']
        }
    );

    if (!result.success) {
        // Don't treat user-aborted requests as failures that need a retry error
        if (result.error?.name === 'AbortError' || result.error?.message?.includes('aborted')) {
            console.warn('[Retry] Operation aborted by user');
            throw result.error;
        }
        throw result.error || new Error('Read operation failed after retries');
    }

    return result.data as T;
}
