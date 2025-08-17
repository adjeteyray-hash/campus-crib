import { ValidationRule, FormState } from '../types';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (Ghana format)
const PHONE_REGEX = /^(\+233|0)[2-9]\d{8}$/;

// Password validation regex (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Validation rule functions
export const validateRequired = (value: any): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return 'This field is required';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return null; // Let required validation handle empty values
  
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return null; // Let required validation handle empty values
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }
  
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Let required validation handle empty values
  
  if (!PHONE_REGEX.test(phone)) {
    return 'Please enter a valid Ghana phone number (e.g., +233201234567 or 0201234567)';
  }
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name || name.trim() === '') {
    return 'Name is required';
  }
  
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }
  
  if (name.trim().length > 50) {
    return 'Name must be no more than 50 characters long';
  }
  
  return null;
};

export const validateMinLength = (minLength: number) => (value: string): string | null => {
  if (!value) return null; // Let required validation handle empty values
  
  if (value.length < minLength) {
    return `Must be at least ${minLength} characters long`;
  }
  return null;
};

export const validateMaxLength = (maxLength: number) => (value: string): string | null => {
  if (!value) return null; // Let required validation handle empty values
  
  if (value.length > maxLength) {
    return `Must be no more than ${maxLength} characters long`;
  }
  return null;
};

export const validatePrice = (price: string | number): string | null => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return 'Please enter a valid price';
  }
  
  if (numPrice < 0) {
    return 'Price cannot be negative';
  }
  
  if (numPrice > 10000) {
    return 'Price seems too high. Please verify the amount';
  }
  
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!url) return null; // Let required validation handle empty values
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

// Form field validation
export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (rule.required) {
      const error = validateRequired(value);
      if (error) return error;
    }
    
    if (rule.minLength && typeof value === 'string') {
      const error = validateMinLength(rule.minLength)(value);
      if (error) return error;
    }
    
    if (rule.maxLength && typeof value === 'string') {
      const error = validateMaxLength(rule.maxLength)(value);
      if (error) return error;
    }
    
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        return 'Invalid format';
      }
    }
    
    if (rule.custom) {
      const error = rule.custom(value);
      if (error) return error;
    }
  }
  
  return null;
};

// Form validation
export const validateForm = (formState: FormState): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  Object.keys(formState).forEach(fieldName => {
    const field = formState[fieldName];
    const error = validateField(field.value, field.rules);
    
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

// Specific form validators
export const validateLoginForm = (email: string, password: string) => {
  const errors: Record<string, string> = {};
  
  const emailError = validateRequired(email) || validateEmail(email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validateRequired(password);
  if (passwordError) errors.password = passwordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSignUpForm = (
  email: string, 
  password: string, 
  confirmPassword: string, 
  role: string,
  name?: string,
  phone?: string
) => {
  const errors: Record<string, string> = {};
  
  const emailError = validateRequired(email) || validateEmail(email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validateRequired(password) || validatePassword(password);
  if (passwordError) errors.password = passwordError;
  
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  const roleError = validateRequired(role);
  if (roleError) errors.role = roleError;
  
  if (name) {
    const nameError = validateMinLength(2)(name) || validateMaxLength(50)(name);
    if (nameError) errors.name = nameError;
  }
  
  if (phone) {
    const phoneError = validatePhone(phone);
    if (phoneError) errors.phone = phoneError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateHostelForm = (formData: {
  name: string;
  description: string;
  address: string;
  price: string | number;
  contactPhone: string;
  contactEmail: string;
}) => {
  const errors: Record<string, string> = {};
  
  const nameError = validateRequired(formData.name) || validateMaxLength(100)(formData.name);
  if (nameError) errors.name = nameError;
  
  const descriptionError = validateRequired(formData.description) || validateMaxLength(1000)(formData.description);
  if (descriptionError) errors.description = descriptionError;
  
  const addressError = validateRequired(formData.address) || validateMaxLength(200)(formData.address);
  if (addressError) errors.address = addressError;
  
  const priceError = validateRequired(formData.price) || validatePrice(formData.price);
  if (priceError) errors.price = priceError;
  
  const phoneError = validateRequired(formData.contactPhone) || validatePhone(formData.contactPhone);
  if (phoneError) errors.contactPhone = phoneError;
  
  const emailError = validateRequired(formData.contactEmail) || validateEmail(formData.contactEmail);
  if (emailError) errors.contactEmail = emailError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};