import crypto from 'crypto';

/**
 * Server-side cryptographic service using AES-256-GCM.
 * Used for encrypting sensitive integration credentials (e.g. Slack bot tokens, OAuth refresh tokens).
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  /**
   * Derives a stable 32-byte key from server secret environment variable.
   */
  private static getKey(): Buffer {
    const rawSecret = process.env.ENCRYPTION_SECRET || process.env.SESSION_SECRET || 'matias-studio-secure-vault-encryption-secret-key-32b!';
    return crypto.createHash('sha256').update(rawSecret).digest();
  }

  /**
   * Encrypts plaintext into a base64 encoded string containing IV, Auth Tag, and Ciphertext.
   */
  public static encrypt(plaintext: string): string {
    if (!plaintext) return '';
    const key = this.getKey();
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    const payload = {
      iv: iv.toString('hex'),
      tag: authTag.toString('hex'),
      data: encrypted
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Decrypts a base64 encoded payload back into plaintext string.
   */
  public static decrypt(cipherPayload: string): string {
    if (!cipherPayload) return '';
    try {
      const decoded = JSON.parse(Buffer.from(cipherPayload, 'base64').toString('utf8'));
      if (!decoded.iv || !decoded.tag || !decoded.data) return '';

      const key = this.getKey();
      const iv = Buffer.from(decoded.iv, 'hex');
      const authTag = Buffer.from(decoded.tag, 'hex');
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(decoded.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return '';
    }
  }
}
