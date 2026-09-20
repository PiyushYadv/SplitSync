export type AuthValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function validateEmail(email: string): AuthValidationResult {
  return /^\S+@\S+\.\S+$/.test(email)
    ? { valid: true }
    : { valid: false, message: "Enter a valid email address" };
}

export function validatePassword(password: string): AuthValidationResult {
  return password.length >= 8
    ? { valid: true }
    : { valid: false, message: "Password must be at least 8 characters" };
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): AuthValidationResult {
  return password === confirmation
    ? { valid: true }
    : { valid: false, message: "Passwords do not match" };
}
