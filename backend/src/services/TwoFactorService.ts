/**
 * Two-Factor Authentication Service
 * Provides TOTP-based 2FA for NileLink users
 */

import crypto from 'crypto';

export interface TwoFactorSecret {
  secret: string;
  otpauthUrl: string;
  qrCodeUrl: string;
}

export interface TwoFactorVerification {
  isValid: boolean;
  attemptsRemaining: number;
  isLocked: boolean;
  lockoutUntil?: Date;
}

export class TwoFactorService {
  private static readonly WINDOW_SIZE = 1; // Allow 30 seconds before/after current time window
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  /**
   * Generate a new TOTP secret for a user
   */
  static generateSecret(userId: string, userEmail: string): TwoFactorSecret {
    // Generate 32-byte random secret (base32 encoded)
    const secret = crypto.randomBytes(32).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    // Create otpauth URL for QR code
    const issuer = 'NileLink';
    const accountName = encodeURIComponent(userEmail);
    const otpauthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

    // QR Code URL (using Google Charts API for simplicity)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

    return {
      secret,
      otpauthUrl,
      qrCodeUrl
    };
  }

  /**
   * Verify a TOTP code
   */
  static verifyCode(secret: string, code: string, userAttempts: number = 0): TwoFactorVerification {
    if (userAttempts >= this.MAX_ATTEMPTS) {
      return {
        isValid: false,
        attemptsRemaining: 0,
        isLocked: true,
        lockoutUntil: new Date(Date.now() + this.LOCKOUT_DURATION)
      };
    }

    // Decode base32 secret to buffer
    const secretBuffer = this.base32Decode(secret);
    const codeNum = parseInt(code, 10);

    if (isNaN(codeNum) || code.length !== 6) {
      return {
        isValid: false,
        attemptsRemaining: this.MAX_ATTEMPTS - userAttempts - 1,
        isLocked: false
      };
    }

    // Check current time window and adjacent windows
    const currentTime = Math.floor(Date.now() / 1000 / 30); // TOTP time steps

    for (let i = -this.WINDOW_SIZE; i <= this.WINDOW_SIZE; i++) {
      const timeStep = currentTime + i;

      // HMAC-SHA1
      const hmac = crypto.createHmac('sha1', secretBuffer);
      hmac.update(this.intToBytes(timeStep));
      const hash = hmac.digest();

      // Dynamic truncation
      const offset = hash[hash.length - 1] & 0x0F;
      const codeBytes = hash.slice(offset, offset + 4);

      // Convert to number and mask
      const generatedCode = (
        (codeBytes[0] << 24) |
        (codeBytes[1] << 16) |
        (codeBytes[2] << 8) |
        codeBytes[3]
      ) & 0x7FFFFFFF;

      const finalCode = (generatedCode % 1000000).toString().padStart(6, '0');

      if (finalCode === code) {
        return {
          isValid: true,
          attemptsRemaining: this.MAX_ATTEMPTS,
          isLocked: false
        };
      }
    }

    return {
      isValid: false,
      attemptsRemaining: this.MAX_ATTEMPTS - userAttempts - 1,
      isLocked: false
    };
  }

  /**
   * Check if a user account is locked due to failed 2FA attempts
   */
  static isAccountLocked(lastFailedAttempt?: Date, failedAttempts: number = 0): boolean {
    if (!lastFailedAttempt || failedAttempts < this.MAX_ATTEMPTS) {
      return false;
    }

    const timeSinceLastAttempt = Date.now() - lastFailedAttempt.getTime();
    return timeSinceLastAttempt < this.LOCKOUT_DURATION;
  }

  /**
   * Get remaining lockout time in minutes
   */
  static getLockoutTimeRemaining(lastFailedAttempt: Date): number {
    const timeSinceLastAttempt = Date.now() - lastFailedAttempt.getTime();
    const remainingMs = this.LOCKOUT_DURATION - timeSinceLastAttempt;
    return Math.max(0, Math.ceil(remainingMs / (60 * 1000)));
  }

  /**
   * Generate backup codes for account recovery
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }

    return codes;
  }

  /**
   * Validate a backup code
   */
  static validateBackupCode(code: string, storedCodes: string[]): { isValid: boolean; remainingCodes: string[] } {
    const normalizedCode = code.toUpperCase().replace(/\s+/g, '');
    const codeIndex = storedCodes.indexOf(normalizedCode);

    if (codeIndex === -1) {
      return { isValid: false, remainingCodes: storedCodes };
    }

    // Remove the used code
    const remainingCodes = [...storedCodes];
    remainingCodes.splice(codeIndex, 1);

    return { isValid: true, remainingCodes };
  }

  // Helper methods

  private static base32Decode(encoded: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const cleaned = encoded.replace(/=+$/, '').toUpperCase();

    let bits = 0;
    let value = 0;
    const result: number[] = [];

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      const index = alphabet.indexOf(char);

      if (index === -1) {
        throw new Error('Invalid base32 character');
      }

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        result.push((value >>> (bits - 8)) & 0xFF);
        bits -= 8;
      }
    }

    return Buffer.from(result);
  }

  private static intToBytes(num: number): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(num), 0);
    return buffer;
  }
}
