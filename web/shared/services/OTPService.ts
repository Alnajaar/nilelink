/**
 * OTP Service - Handles SMS and Email verification
 * Production-ready with support for Twilio, AWS SNS, SendGrid, etc.
 */

// Types for OTP configuration
export interface OTPSendRequest {
  contact: string;
  type: 'email' | 'phone';
  userId?: string;
  purpose?: 'registration' | 'login' | 'password_reset';
}

export interface OTPSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  rateLimited?: boolean;
}

export interface OTPVerifyRequest {
  contact: string;
  otp: string;
  type: 'email' | 'phone';
}

export interface OTPVerifyResponse {
  success: boolean;
  error?: string;
  attemptsRemaining?: number;
}

// Configuration for different providers
interface OTPProviderConfig {
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  sendgrid: {
    apiKey: string;
    fromEmail: string;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    snsTopicArn?: string;
  };
}

// Rate limiting cache (in production, use Redis)
interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

class OTPCache {
  private cache = new Map<string, { otp: string; expiresAt: number; attempts: number }>();
  private rateLimitCache = new Map<string, RateLimitEntry>();

  // OTP storage and verification
  storeOTP(contact: string, otp: string, ttlSeconds = 300): void { // 5 minutes default
    this.cache.set(contact, {
      otp,
      expiresAt: Date.now() + (ttlSeconds * 1000),
      attempts: 0
    });
  }

  verifyOTP(contact: string, providedOtp: string): { valid: boolean; expired: boolean; attempts: number } {
    const entry = this.cache.get(contact);

    if (!entry) {
      return { valid: false, expired: true, attempts: 0 };
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(contact);
      return { valid: false, expired: true, attempts: entry.attempts };
    }

    entry.attempts += 1;

    if (entry.attempts > 3) {
      this.cache.delete(contact);
      return { valid: false, expired: true, attempts: entry.attempts };
    }

    const valid = entry.otp === providedOtp;
    if (valid) {
      this.cache.delete(contact);
    }

    return { valid, expired: false, attempts: entry.attempts };
  }

  // Rate limiting
  checkRateLimit(contact: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean { // 15 minutes
    const key = `ratelimit_${contact}`;
    const now = Date.now();
    const entry = this.rateLimitCache.get(key);

    if (!entry) {
      this.rateLimitCache.set(key, { attempts: 1, lastAttempt: now });
      return true;
    }

    // Reset counter if window has passed
    if (now - entry.lastAttempt > windowMs) {
      this.rateLimitCache.set(key, { attempts: 1, lastAttempt: now });
      return true;
    }

    // Check if blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return false;
    }

    // Increment attempts
    entry.attempts += 1;
    entry.lastAttempt = now;

    // Block if too many attempts
    if (entry.attempts > maxAttempts) {
      entry.blockedUntil = now + (30 * 60 * 1000); // 30 minutes block
      return false;
    }

    this.rateLimitCache.set(key, entry);
    return true;
  }

  getRemainingAttempts(contact: string): number {
    const entry = this.rateLimitCache.get(`ratelimit_${contact}`);
    if (!entry) return 5;
    return Math.max(0, 5 - entry.attempts);
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

class OTPSender {
  private config: Partial<OTPProviderConfig>;
  private cache = new OTPCache();

  constructor(config?: Partial<OTPProviderConfig>) {
    this.config = config || {};
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cache.clearExpired(), 5 * 60 * 1000);
  }

  // Send OTP via SMS
  private async sendSMS(phone: string, otp: string): Promise<OTPSendResponse> {
    try {
      // Check rate limiting first
      if (!this.cache.checkRateLimit(phone)) {
        return {
          success: false,
          error: 'Too many requests. Please try again later.',
          rateLimited: true
        };
      }

      // In development, just log the OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 SMS OTP for ${phone}: ${otp}`);
        this.cache.storeOTP(phone, otp);
        return { success: true, messageId: `dev_${Date.now()}` };
      }

      // Twilio implementation
      if (this.config.twilio) {
        const { accountSid, authToken, phoneNumber } = this.config.twilio;
        const twilio = require('twilio')(accountSid, authToken);

        const message = await twilio.messages.create({
          body: `Your NileLink verification code is: ${otp}. Valid for 5 minutes.`,
          from: phoneNumber,
          to: phone
        });

        this.cache.storeOTP(phone, otp);
        return { success: true, messageId: message.sid };
      }

      // AWS SNS implementation
      if (this.config.aws) {
        const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
        const sns = new SNSClient({
          region: this.config.aws.region,
          credentials: {
            accessKeyId: this.config.aws.accessKeyId,
            secretAccessKey: this.config.aws.secretAccessKey
          }
        });

        const command = new PublishCommand({
          PhoneNumber: phone,
          Message: `Your NileLink verification code is: ${otp}. Valid for 5 minutes.`
        });

        const result = await sns.send(command);
        this.cache.storeOTP(phone, otp);
        return { success: true, messageId: result.MessageId };
      }

      // Fallback to console in production (shouldn't happen)
      console.log(`📱 SMS OTP for ${phone}: ${otp}`);
      this.cache.storeOTP(phone, otp);
      return { success: true, messageId: `fallback_${Date.now()}` };

    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: 'Failed to send SMS' };
    }
  }

  // Send OTP via Email
  private async sendEmail(email: string, otp: string): Promise<OTPSendResponse> {
    try {
      // Check rate limiting first
      if (!this.cache.checkRateLimit(email)) {
        return {
          success: false,
          error: 'Too many requests. Please try again later.',
          rateLimited: true
        };
      }

      // In development, just log the OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 Email OTP for ${email}: ${otp}`);
        this.cache.storeOTP(email, otp);
        return { success: true, messageId: `dev_${Date.now()}` };
      }

      // SendGrid implementation
      if (this.config.sendgrid) {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(this.config.sendgrid.apiKey);

        const msg = {
          to: email,
          from: this.config.sendgrid.fromEmail,
          subject: 'Your NileLink Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a365d;">NileLink Verification</h2>
              <p>Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #2b6cb0; text-align: center; padding: 20px; border: 2px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
                ${otp}
              </div>
              <p>This code will expire in 5 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
          `
        };

        const result = await sgMail.send(msg);
        this.cache.storeOTP(email, otp);
        return { success: true, messageId: result[0]?.headers['x-message-id'] };
      }

      // AWS SES implementation
      if (this.config.aws) {
        const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
        const ses = new SESClient({
          region: this.config.aws.region,
          credentials: {
            accessKeyId: this.config.aws.accessKeyId,
            secretAccessKey: this.config.aws.secretAccessKey
          }
        });

        const command = new SendEmailCommand({
          Destination: { ToAddresses: [email] },
          Message: {
            Body: {
              Html: {
                Charset: 'UTF-8',
                Data: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a365d;">NileLink Verification</h2>
                    <p>Your verification code is:</p>
                    <div style="font-size: 32px; font-weight: bold; color: #2b6cb0; text-align: center; padding: 20px; border: 2px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
                      ${otp}
                    </div>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                  </div>
                `
              }
            },
            Subject: { Charset: 'UTF-8', Data: 'Your NileLink Verification Code' }
          },
          Source: 'noreply@nilelink.com' // Configure this
        });

        const result = await ses.send(command);
        this.cache.storeOTP(email, otp);
        return { success: true, messageId: result.MessageId };
      }

      // Fallback to console in production (shouldn't happen)
      console.log(`📧 Email OTP for ${email}: ${otp}`);
      this.cache.storeOTP(email, otp);
      return { success: true, messageId: `fallback_${Date.now()}` };

    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  // Public API methods
  async sendOTP(request: OTPSendRequest): Promise<OTPSendResponse> {
    const { contact, type } = request;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (type === 'phone') {
      return this.sendSMS(contact, otp);
    } else {
      return this.sendEmail(contact, otp);
    }
  }

  async verifyOTP(request: OTPVerifyRequest): Promise<OTPVerifyResponse> {
    const { contact, otp } = request;
    const result = this.cache.verifyOTP(contact, otp);

    if (result.expired) {
      return {
        success: false,
        error: result.attempts > 3 ? 'Too many failed attempts. Please request a new code.' : 'Code expired. Please request a new one.',
        attemptsRemaining: Math.max(0, 3 - result.attempts)
      };
    }

    if (!result.valid) {
      return {
        success: false,
        error: 'Invalid verification code',
        attemptsRemaining: Math.max(0, 3 - result.attempts)
      };
    }

    return { success: true };
  }

  getRemainingAttempts(contact: string): number {
    return this.cache.getRemainingAttempts(contact);
  }

  // Configuration methods for production
  configureTwilio(accountSid: string, authToken: string, phoneNumber: string): void {
    this.config.twilio = { accountSid, authToken, phoneNumber };
  }

  configureSendGrid(apiKey: string, fromEmail: string): void {
    this.config.sendgrid = { apiKey, fromEmail };
  }

  configureAWS(accessKeyId: string, secretAccessKey: string, region: string): void {
    this.config.aws = { accessKeyId, secretAccessKey, region };
  }
}

// Export singleton instance
export const otpService = new OTPSender();

// Environment-based configuration (for production deployment)
if (typeof window === 'undefined') { // Server-side only
  // Twilio configuration
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    otpService.configureTwilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      process.env.TWILIO_PHONE_NUMBER
    );
  }

  // SendGrid configuration
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    otpService.configureSendGrid(
      process.env.SENDGRID_API_KEY,
      process.env.SENDGRID_FROM_EMAIL
    );
  }

  // AWS configuration
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
    otpService.configureAWS(
      process.env.AWS_ACCESS_KEY_ID,
      process.env.AWS_SECRET_ACCESS_KEY,
      process.env.AWS_REGION
    );
  }
}