import crypto from 'crypto';
import { logger } from '../utils/logger';
import { prisma } from './DatabasePoolService';
import { emailService } from './EmailService';

export class EmailVerificationService {
    private readonly TOKEN_LENGTH = 32; // bytes for hex token
    private readonly EMAIL_VERIFICATION_EXPIRY_MINUTES = 24 * 60; // 24 hours
    private readonly PASSWORD_RESET_EXPIRY_MINUTES = 60; // 1 hour

    /**
     * Generate secure email verification token
     */
    generateToken(): string {
        return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
    }

    /**
     * Send email verification link
     * @param email User email
     * @param firstName User first name
     * @param frontendURL Frontend URL for verification link
     */
    async sendVerificationEmail(
        email: string,
        firstName: string,
        frontendURL: string = 'http://localhost:3000'
    ): Promise<{ success: boolean; token?: string; expiresAt?: Date }> {
        try {
            const token = this.generateToken();
            const expiresAt = new Date(Date.now() + this.EMAIL_VERIFICATION_EXPIRY_MINUTES * 60 * 1000);

            // Update user with verification token
            await prisma.user.update(
                {
                    where: { email },
                    data: {
                        emailVerificationToken: token,
                        emailVerificationExpiresAt: expiresAt
                    }
                }
            ).catch(async (error) => {
                logger.warn(`User ${email} not found in database`, error);
            });

            // Build verification link
            const verificationLink = `${frontendURL}/auth/verify-email?token=${token}`;

            // Send verification email
            const sent = await emailService.sendRegistrationConfirmation(
                email,
                firstName,
                verificationLink,
                '24 hours'
            );

            if (!sent) {
                logger.error(`Failed to send verification email to ${email}`);
                return { success: false };
            }

            logger.info(`Verification email sent to ${email}`, { expiresAt });
            return { success: true, token, expiresAt };

        } catch (error) {
            logger.error(`Error in sendVerificationEmail: ${error}`);
            return { success: false };
        }
    }

    /**
     * Verify email with token
     * @param token Email verification token
     */
    async verifyEmail(token: string): Promise<{ success: boolean; message: string; email?: string }> {
        try {
            const user = await prisma.user.findFirst({
                where: { emailVerificationToken: token }
            });

            if (!user) {
                return { success: false, message: 'Invalid verification token' };
            }

            if (!user.emailVerificationExpiresAt || new Date() > user.emailVerificationExpiresAt) {
                return { success: false, message: 'Verification link has expired' };
            }

            // Mark email as verified
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    emailVerificationToken: null,
                    emailVerificationExpiresAt: null
                }
            });

            logger.info(`Email verified for ${user.email}`);
            return { success: true, message: 'Email verified successfully', email: user.email };

        } catch (error) {
            logger.error(`Error in verifyEmail: ${error}`);
            return { success: false, message: 'Internal server error' };
        }
    }

    /**
     * Resend verification email
     * @param email User email
     */
    async resendVerificationEmail(
        email: string,
        frontendURL: string = 'http://localhost:3000'
    ): Promise<{ success: boolean; message: string; expiresAt?: Date }> {
        try {
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return { success: false, message: 'User not found' };
            }

            if (user.emailVerified) {
                return { success: false, message: 'Email is already verified' };
            }

            const token = this.generateToken();
            const expiresAt = new Date(Date.now() + this.EMAIL_VERIFICATION_EXPIRY_MINUTES * 60 * 1000);

            // Update user with new token
            await prisma.user.update({
                where: { email },
                data: {
                    emailVerificationToken: token,
                    emailVerificationExpiresAt: expiresAt
                }
            });

            // Send verification email
            const verificationLink = `${frontendURL}/auth/verify-email?token=${token}`;
            const sent = await emailService.sendRegistrationConfirmation(
                email,
                user.firstName || 'User',
                verificationLink,
                '24 hours'
            );

            if (!sent) {
                return { success: false, message: 'Failed to send verification email' };
            }

            logger.info(`Verification email resent to ${email}`);
            return { success: true, message: 'Verification email sent', expiresAt };

        } catch (error) {
            logger.error(`Error in resendVerificationEmail: ${error}`);
            return { success: false, message: 'Internal server error' };
        }
    }

    /**
     * Send password reset email
     * @param email User email
     */
    async sendPasswordResetEmail(
        email: string,
        frontendURL: string = 'http://localhost:3000'
    ): Promise<{ success: boolean; token?: string; expiresAt?: Date }> {
        try {
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                // Don't reveal if email exists (security best practice)
                logger.info(`Password reset requested for non-existent email: ${email}`);
                return { success: true }; // Return success anyway for security
            }

            const token = this.generateToken();
            const expiresAt = new Date(Date.now() + this.PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);

            // Update user with reset token
            await prisma.user.update({
                where: { email },
                data: {
                    passwordResetToken: token,
                    passwordResetExpiresAt: expiresAt
                }
            });

            // Build password reset link
            const resetLink = `${frontendURL}/auth/reset-password?token=${token}`;

            // Send password reset email
            const sent = await emailService.sendPasswordReset(
                email,
                user.firstName || 'User',
                resetLink,
                '1 hour'
            );

            if (!sent) {
                logger.error(`Failed to send password reset email to ${email}`);
                return { success: true }; // Still return success for security
            }

            logger.info(`Password reset email sent to ${email}`, { expiresAt });
            return { success: true, token, expiresAt };

        } catch (error) {
            logger.error(`Error in sendPasswordResetEmail: ${error}`);
            return { success: true }; // Return success for security
        }
    }

    /**
     * Reset password with token
     * @param token Password reset token
     * @param newPassword New password (should be hashed by caller)
     */
    async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            const user = await prisma.user.findFirst({
                where: { passwordResetToken: token }
            });

            if (!user) {
                return { success: false, message: 'Invalid reset token' };
            }

            if (!user.passwordResetExpiresAt || new Date() > user.passwordResetExpiresAt) {
                return { success: false, message: 'Password reset link has expired' };
            }

            // Update password
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: newPassword,
                    passwordResetToken: null,
                    passwordResetExpiresAt: null,
                    failedLoginAttempts: 0
                }
            });

            logger.info(`Password reset for ${user.email}`);
            return { success: true, message: 'Password reset successfully' };

        } catch (error) {
            logger.error(`Error in resetPassword: ${error}`);
            return { success: false, message: 'Internal server error' };
        }
    }

    /**
     * Validate password reset token (without consuming it)
     */
    async validatePasswordResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
        try {
            const user = await prisma.user.findFirst({
                where: { passwordResetToken: token }
            });

            if (!user || !user.passwordResetExpiresAt || new Date() > user.passwordResetExpiresAt) {
                return { valid: false };
            }

            return { valid: true, email: user.email };

        } catch (error) {
            return { valid: false };
        }
    }
}

// Export singleton instance
export const emailVerificationService = new EmailVerificationService();
