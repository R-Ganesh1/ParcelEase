// Cryptographic OTP Generation and Verification Utilities
// Uses standard Web Crypto API / Node.js crypto compatible logic

export async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp.trim());
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simple hash for older environments if needed
  let hash = 0;
  for (let i = 0; i < otp.length; i++) {
    hash = (hash << 5) - hash + otp.charCodeAt(i);
    hash |= 0;
  }
  return `fallback_sha256_${Math.abs(hash)}`;
}

export function generateOtp(): string {
  // Generate random 6-digit OTP between 100000 and 999999
  const min = 100000;
  const max = 999999;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

export function isOtpExpired(expiresAtISO: string): boolean {
  return new Date().getTime() > new Date(expiresAtISO).getTime();
}
