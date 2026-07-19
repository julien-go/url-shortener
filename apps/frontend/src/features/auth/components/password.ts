// Mirrors apps/backend/src/modules/auth/auth.schema.ts's registerInputSchema password rule — keep both in sync.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
const PASSWORD_COMPLEXITY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]).+$/;

export function getPasswordValidationError(password: string): string | null {
  if (password.length === 0) return null;
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters`;
  }
  if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
    return "Password must include an uppercase letter, a lowercase letter, a digit, and a special character";
  }
  return null;
}
