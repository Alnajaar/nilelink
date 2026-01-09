import crypto from 'crypto';
import { logger } from '../utils/logger';
import { prisma } from './DatabasePoolService';
import { emailService } from './EmailService';

export class OTPService {
    private readonly OTP_LENGTH = 6;
    private readonly OTP_EXPIRY_MINUTES = 10;
    private readonly MAX_OTP_ATTEMPTS = 5;

    /**
     * Generate a 6-digit OTP code
     */
    generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Send OTP via email
     * @param email User email address
     * @param firstName User first name
     * @param purpose 'registration' | 'login' | 'payment' | 'withdrawal'
     */
    async sendOTPByEmail(email: string, firstName: string, purpose: 'registration' | 'login' | 'payment' | 'withdrawal'): Promise<{ success: boolean; otp?: string; expiresAt?: Date }> {
        try {
            const otp = this.generateOTP();
            const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

            // Store OTP in database
            await prisma.user.update(
                {
                    where: { email },
                    data: {
                        otpCode: otp,
                        otpExpiresAt: expiresAt,
                        failedLoginAttempts: 0 // Reset on OTP send
                    }
                }
            ).catch(async (error) => {
                // If user doesn't exist yet, we can still generate OTP for frontend display
                logger.warn(`User ${email} not found in database, OTP generation may be for pre-registration`, error);
            });

            // Send OTP email
            const purposeText = {
                registration: 'verify your account',
                login: 'complete your login',
                payment: 'confirm your payment',
                withdrawal: 'confirm your withdrawal'
            }[purpose];

            const sent = await emailService.sendOtpCode(
                email,
                firstName,
                otp,
                `${this.OTP_EXPIRY_MINUTES} minutes`
            );

            if (!sent) {
                logger.error(`Failed to send OTP email to ${email}`);
                return { success: false };
            }

            logger.info(`OTP sent to ${email} for ${purpose}`, { expiresAt });
            return { success: true, otp, expiresAt };

        } catch (error) {
            logger.error(`Error in sendOTPByEmail: ${error}`);
            return { success: false };
        }
    }

    /**
     * Verify OTP code
     * @param email User email
     * @param otpCode OTP code to verify
     */
    async verifyOTP(email: string, otpCode: string): Promise<{ success: boolean; message: string }> {
        try {
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Check if OTP code exists and hasn't expired
            if (!user.otpCode || !user.otpExpiresAt) {
                return { success: false, message: 'No OTP code found. Please request a new one.' };
            }

            if (new Date() > user.otpExpiresAt) {
                return { success: false, message: 'OTP code has expired' };
            }

            // Check if OTP matches
            if (user.otpCode !== otpCode) {
                return { success: false, message: 'Invalid OTP code' };
            }

            // Clear OTP code
            await prisma.user.update({
                where: { email },
                data: {
                    otpCode: null,
                    otpExpiresAt: null,
                    phoneVerified: true // Mark as verified if using OTP
                }
            });

            logger.info(`OTP verified successfully for ${email}`);
            return { success: true, message: 'OTP verified successfully' };

        } catch (error) {
            logger.error(`Error in verifyOTP: ${error}`);
            return { success: false, message: 'Internal server error' };
        }
    }

    /**
     * Resend OTP code
     * @param email User email
     * @param purpose Purpose of OTP
     */
    async resendOTP(email: string, purpose: 'registration' | 'login' | 'payment' | 'withdrawal'): Promise<{ success: boolean; message: string; expiresAt?: Date }> {
        try {
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Generate new OTP
            const otp = this.generateOTP();
            const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

            // Update user with new OTP
            await prisma.user.update({
                where: { email },
                data: {
                    otpCode: otp,
                    otpExpiresAt: expiresAt
                }
            });

            // Send new OTP email
            const sent = await this.emailService.sendOtpCode(
                email,
                user.firstName || 'User',
                otp,
                `${this.OTP_EXPIRY_MINUTES} minutes`
            );

            if (!sent) {
                return { success: false, message: 'Failed to send OTP email' };
            }

            logger.info(`OTP resent to ${email}`);
            return { success: true, message: 'OTP resent successfully', expiresAt };

        } catch (error) {
            logger.error(`Error in resendOTP: ${error}`);
            return { success: false, message: 'Internal server error' };
        }
    }

    /**
     * Validate OTP without clearing it (for display purposes)
     */
    async validateOTPExists(email: string): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            return !!(user?.otpCode && user?.otpExpiresAt && new Date() < user.otpExpiresAt);
        } catch (error) {
            return false;
        }
    }
}

// Export singleton instance
export const otpService = new OTPService();
