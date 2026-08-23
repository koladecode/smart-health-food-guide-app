export function validateName(name: unknown): { valid: boolean; trimmed: string; message?: string } {
  if (name === undefined || name === null || typeof name !== 'string') {
    return { valid: false, trimmed: '', message: 'Name is required.' };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, trimmed: '', message: 'Please enter your name.' };
  }
  if (trimmed.length > 100) {
    return { valid: false, trimmed, message: 'Name cannot exceed 100 characters.' };
  }
  const hasLetter = /\p{L}/u.test(trimmed);
  const validCharsOnly = /^[\p{L}\p{M}\s'\-\.]{1,100}$/u.test(trimmed);

  if (!hasLetter || !validCharsOnly) {
    return {
      valid: false,
      trimmed,
      message: 'Name contains invalid characters. Please use standard letters, spaces, hyphens, or apostrophes.'
    };
  }
  return { valid: true, trimmed };
}

export function validateEmail(email: unknown): { valid: boolean; trimmed: string; message?: string } {
  if (email === undefined || email === null || typeof email !== 'string') {
    return { valid: false, trimmed: '', message: 'Email address is required.' };
  }
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length === 0) {
    return { valid: false, trimmed: '', message: 'Please enter your email address.' };
  }
  if (trimmed.length > 254) {
    return { valid: false, trimmed, message: 'Email address cannot exceed 254 characters.' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return {
      valid: false,
      trimmed,
      message: 'Please enter a valid email address (e.g., user@example.com).'
    };
  }
  return { valid: true, trimmed };
}
