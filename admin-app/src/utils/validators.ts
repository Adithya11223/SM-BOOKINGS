/**
 * Validates if a string is a valid email address
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates if a string has a minimum length
 */
export const hasMinLength = (text: string, minLength: number): boolean => {
  return text.trim().length >= minLength;
};

/**
 * Validates if a string contains only digits
 */
export const isNumeric = (text: string): boolean => {
  const re = /^\d+$/;
  return re.test(text);
};

/**
 * Validates a standard US phone number format (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};
