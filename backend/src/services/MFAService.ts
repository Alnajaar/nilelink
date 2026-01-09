import crypto from 'crypto';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { prisma } from '../services/DatabasePoolService';
import { logger } from '../utils/logger';
import { rbacService } from './RBACService';

interface MFASecret {
    id: string;
    userId: string;
    secret: string;
    method: 'TOTP' | 'SMS' | 'EMAIL';
    isActive: boolean;
    backupCodes: string[];
    createdAt: Date;
    lastUsed?: Date;
}

interface MFAVerificationResult {
    success: boolean;
    error?: string;
    requiresMFA?: boolean;
}

export class MFAService {
    private static instance: MFAService;

    private constructor() {}

    static getInstance(): MFAService {
        if (!MFAService.instance) {
            MFAService.instance = new MFAService();
        }
        return MFAService.instance;
    }

    /**
     * Check if MFA is required for a user
     */
    async isMFARequired(userId: string): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true }
            });

            if (!user) return false;

            return rbacService.isMFARequired(user.role as any);
        } catch (error) {
            logger.error('MFA requirement check failed:', error);
            return false;
        }
    }

    /**
     * Generate TOTP secret and QR code for user
     */
    async generateTOTPSecret(userId: string): Promise<{
        success: boolean;
        secret?: string;
        qrCodeUrl?: string;
        error?: string;
    }> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, firstName: true, lastName: true }
            });

            if (!user) {
                return { success: false, error: 'User not found' };
            }

            // Generate secret
            const secret = authenticator.generateSecret();
            const serviceName = 'NileLink Protocol';
            const accountName = user.email;

            // Generate OTP Auth URL
            const otpauth = authenticator.keyuri(accountName, serviceName, secret);

            // Generate QR code
            const qrCodeUrl = await qrcode.toDataURL(otpauth);

            // Store secret temporarily (will be activated after verification)
            await this.storeTempMFASecret(userId, secret, 'TOTP');

            return {
                success: true,
                secret,
                qrCodeUrl
            };

        } catch (error) {
            logger.error('TOTP secret generation failed:', error);
            return { success: false, error: 'Failed to generate TOTP secret' };
        }
    }

    /**
     * Verify TOTP code and enable MFA
     */
    async enableTOTP(userId: string, code: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            // Get temporary secret
            const tempSecret = await this.getTempMFASecret(userId, 'TOTP');
            if (!tempSecret) {
                return { success: false, error: 'No TOTP setup in progress' };
            }

            // Verify the code
            const isValid = authenticator.verify({
                token: code,
                secret: tempSecret.secret
            });

            if (!isValid) {
                return { success: false, error: 'Invalid TOTP code' };
            }

            // Generate backup codes
            const backupCodes = this.generateBackupCodes();

            // Enable MFA
            await this.enableMFA(userId, 'TOTP', tempSecret.secret, backupCodes);

            // Clean up temp secret
            await this.clearTempMFASecret(userId, 'TOTP');

            logger.info(`MFA enabled for user ${userId} with TOTP`);

            return { success: true };

        } catch (error) {
            logger.error('TOTP enable failed:', error);
            return { success: false, error: 'Failed to enable TOTP' };
        }
    }

    /**
     * Verify MFA code during login
     */
    async verifyMFACode(userId: string, code: string): Promise<MFAVerificationResult> {
        try {
            // Check if MFA is required
            const mfaRequired = await this.isMFARequired(userId);
            if (!mfaRequired) {
                return { success: true };
            }

            // Get active MFA methods for user
            const mfaMethods = await this.getActiveMFAMethods(userId);
            if (mfaMethods.length === 0) {
                return { success: false, error: 'MFA required but no methods configured' };
            }

            // Try each method
            for (const method of mfaMethods) {
                let isValid = false;

                switch (method.method) {
                    case 'TOTP':
                        isValid = authenticator.verify({
                            token: code,
                            secret: method.secret
                        });
                        break;

                    case 'SMS':
                    case 'EMAIL':
                        // For SMS/Email, we'd check against sent codes
                        // This is simplified - in production, you'd store and verify sent codes
                        isValid = await this.verifySentCode(userId, method.method, code);
                        break;
                }

                if (isValid) {
                    // Update last used
                    await this.updateMFALastUsed(method.id);
                    return { success: true };
                }
            }

            // Check backup codes
            const backupCodeUsed = await this.verifyBackupCode(userId, code);
            if (backupCodeUsed) {
                return { success: true };
            }

            return { success: false, error: 'Invalid MFA code' };

        } catch (error) {
            logger.error('MFA verification failed:', error);
            return { success: false, error: 'MFA verification failed' };
        }
    }

    /**
     * Disable MFA for a user
     */
    async disableMFA(userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            await prisma.mFASecret.updateMany({
                where: { userId, isActive: true },
                data: { isActive: false }
            });

            logger.info(`MFA disabled for user ${userId}`);
            return { success: true };

        } catch (error) {
            logger.error('MFA disable failed:', error);
            return { success: false, error: 'Failed to disable MFA' };
        }
    }

    /**
     * Get MFA status for a user
     */
    async getMFAStatus(userId: string): Promise<{
        enabled: boolean;
        methods: string[];
        required: boolean;
    }> {
        const required = await this.isMFARequired(userId);
        const methods = await this.getActiveMFAMethods(userId);

        return {
            enabled: methods.length > 0,
            methods: methods.map(m => m.method),
            required
        };
    }

    /**
     * Regenerate backup codes
     */
    async regenerateBackupCodes(userId: string): Promise<{
        success: boolean;
        backupCodes?: string[];
        error?: string;
    }> {
        try {
            const methods = await this.getActiveMFAMethods(userId);
            if (methods.length === 0) {
                return { success: false, error: 'No MFA methods configured' };
            }

            const backupCodes = this.generateBackupCodes();

            // Update all active methods with new backup codes
            for (const method of methods) {
                await prisma.mFASecret.update({
                    where: { id: method.id },
                    data: { backupCodes }
                });
            }

            logger.info(`Backup codes regenerated for user ${userId}`);
            return { success: true, backupCodes };

        } catch (error) {
            logger.error('Backup code regeneration failed:', error);
            return { success: false, error: 'Failed to regenerate backup codes' };
        }
    }

    // Private helper methods

    private async storeTempMFASecret(userId: string, secret: string, method: 'TOTP' | 'SMS' | 'EMAIL'): Promise<void> {
        await prisma.mFATempSecret.upsert({
            where: { userId_method: { userId, method } },
            update: { secret, createdAt: new Date() },
            create: { userId, method, secret }
        });
    }

    private async getTempMFASecret(userId: string, method: 'TOTP' | 'SMS' | 'EMAIL'): Promise<{ secret: string } | null> {
        const tempSecret = await prisma.mFATempSecret.findUnique({
            where: { userId_method: { userId, method } }
        });

        // Check if expired (5 minutes)
        if (tempSecret && Date.now() - tempSecret.createdAt.getTime() > 5 * 60 * 1000) {
            await this.clearTempMFASecret(userId, method);
            return null;
        }

        return tempSecret;
    }

    private async clearTempMFASecret(userId: string, method: 'TOTP' | 'SMS' | 'EMAIL'): Promise<void> {
        await prisma.mFATempSecret.deleteMany({
            where: { userId, method }
        });
    }

    private async enableMFA(userId: string, method: 'TOTP' | 'SMS' | 'EMAIL', secret: string, backupCodes: string[]): Promise<void> {
        await prisma.mFASecret.create({
            data: {
                userId,
                method,
                secret,
                backupCodes,
                isActive: true
            }
        });
    }

    private async getActiveMFAMethods(userId: string): Promise<MFASecret[]> {
        const methods = await prisma.mFASecret.findMany({
            where: { userId, isActive: true }
        });

        return methods.map(method => ({
            id: method.id,
            userId: method.userId,
            secret: method.secret,
            method: method.method as 'TOTP' | 'SMS' | 'EMAIL',
            isActive: method.isActive,
            backupCodes: method.backupCodes,
            createdAt: method.createdAt,
            lastUsed: method.lastUsed || undefined
        }));
    }

    private generateBackupCodes(): string[] {
        const codes: string[] = [];
        for (let i = 0; i < 10; i++) {
            codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
        }
        return codes;
    }

    private async verifySentCode(userId: string, method: 'SMS' | 'EMAIL', code: string): Promise<boolean> {
        // This would check against a sent codes table
        // For now, this is a placeholder implementation
        // In production, you'd store sent codes with expiration
        logger.warn(`MFA verification for ${method} not fully implemented`);
        return false;
    }

    private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
        try {
            const methods = await this.getActiveMFAMethods(userId);

            for (const method of methods) {
                const codeIndex = method.backupCodes.indexOf(code);
                if (codeIndex !== -1) {
                    // Remove used backup code
                    method.backupCodes.splice(codeIndex, 1);
                    await prisma.mFASecret.update({
                        where: { id: method.id },
                        data: { backupCodes: method.backupCodes }
                    });

                    logger.warn(`Backup code used for user ${userId}`);
                    return true;
                }
            }

            return false;
        } catch (error) {
            logger.error('Backup code verification failed:', error);
            return false;
        }
    }

    private async updateMFALastUsed(secretId: string): Promise<void> {
        await prisma.mFASecret.update({
            where: { id: secretId },
            data: { lastUsed: new Date() }
        });
    }
}

export const mfaService = MFAService.getInstance();
