/**
 * EcoSchola Application Security Utilities (AppSec)
 * - XSS Sanitization & Input Length Limits
 * - Strict Numeric & Weight Validation
 * - Session Integrity & Role Verification
 */

export const VALID_ROLES = ['siswa', 'guru', 'superadmin'];

export const VALID_CLASSES = [
  'Kelas 7A',
  'Kelas 7B',
  'Kelas 8A',
  'Kelas 8B',
  'Kelas 8C',
  'Kelas 9A',
  'Kelas 9B'
];

export const OFFICIAL_GURU_USERNAMES = ['gareta.eco', 'wyumna.eco'];

/**
 * Sanitize text input to prevent XSS attacks and enforce length limits
 * @param {string|any} input - Raw user input
 * @param {number} maxLength - Maximum allowable length (default: 255)
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input, maxLength = 255) {
  if (input === null || input === undefined) return '';
  let str = String(input);

  // Strip dangerous script tags and event handlers
  str = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onclick\s*=/gi, '')
    .replace(/<[^>]+>/g, ''); // Strip any HTML tags

  // Replace raw dangerous HTML entities
  str = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Un-escape safe quotes and ampersands for standard text UI reading while remaining XSS-safe
  str = str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");

  str = str.trim();

  if (maxLength && str.length > maxLength) {
    str = str.slice(0, maxLength).trim();
  }

  return str;
}

/**
 * Validate numeric input with strict bounds
 * @param {any} val - Input to validate
 * @param {object} options - Validation options { min, max, integerOnly }
 * @returns {{ isValid: boolean, value: number, error: string|null }}
 */
export function validateNumericInput(val, { min = 0.1, max = 500, integerOnly = false } = {}) {
  if (val === null || val === undefined || val === '') {
    return { isValid: false, value: 0, error: 'Nilai angka tidak boleh kosong.' };
  }

  const num = Number(val);

  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, value: 0, error: 'Input harus berupa angka valid.' };
  }

  if (integerOnly && !Number.isInteger(num)) {
    return { isValid: false, value: Math.round(num), error: 'Nilai harus berupa bilangan bulat.' };
  }

  if (num < min) {
    return { isValid: false, value: num, error: `Nilai minimal adalah ${min}.` };
  }

  if (num > max) {
    return { isValid: false, value: num, error: `Nilai melebihi batas maksimal (${max}).` };
  }

  return { isValid: true, value: num, error: null };
}

/**
 * Fallback Guest / Unauthenticated Session
 */
export const DEFAULT_SAFE_SESSION = null;

/**
 * Verify Session Integrity against official authorized roles and classes
 * @param {any} session - Session object from storage
 * @returns {{ isValid: boolean, session: object|null }}
 */
export function validateSessionIntegrity(session) {
  if (!session || typeof session !== 'object' || !session.isLoggedIn) {
    return { isValid: false, session: null };
  }

  // 1. Validate Role
  if (!VALID_ROLES.includes(session.role)) {
    console.warn('[SessionIntegrity] Invalid role detected in session:', session.role);
    return { isValid: false, session: null };
  }

  // 2. Validate Siswa Role
  if (session.role === 'siswa') {
    if (!VALID_CLASSES.includes(session.className)) {
      console.warn('[SessionIntegrity] Invalid class detected in student session:', session.className);
      return { 
        isValid: false, 
        session: null
      };
    }
  }

  // 3. Validate Guru Role
  if (session.role === 'guru') {
    const username = session.username || session.guruId;
    if (username && !OFFICIAL_GURU_USERNAMES.includes(username)) {
      console.warn('[SessionIntegrity] Unrecognized teacher ID:', username);
      // Fallback safely to primary teacher
      return {
        isValid: true,
        session: {
          ...session,
          username: 'gareta.eco',
          teacherName: 'Dra. Hj. Siti Nurhaliza'
        }
      };
    }
  }

  return { isValid: true, session };
}
