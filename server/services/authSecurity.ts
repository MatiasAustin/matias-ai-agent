import crypto from 'crypto';

export class AuthSecurity {
  /**
   * Hashes a password using crypto.scrypt with a cryptographically secure random salt.
   */
  public static hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { hash, salt };
  }

  /**
   * Verifies a password against stored scrypt hash and salt with constant-time comparison.
   */
  public static verifyPassword(password: string, hash: string, salt: string): boolean {
    try {
      const derivedHash = crypto.scryptSync(password, salt, 64);
      const storedHash = Buffer.from(hash, 'hex');
      if (derivedHash.length !== storedHash.length) {
        return false;
      }
      return crypto.timingSafeEqual(derivedHash, storedHash);
    } catch {
      return false;
    }
  }

  /**
   * Generates a 64-character secure hexadecimal session token.
   */
  public static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
