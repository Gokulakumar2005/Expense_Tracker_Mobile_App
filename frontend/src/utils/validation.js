export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return null;
};

export const validateRegistration = ({ firstName, lastName, email, password, confirmPassword }) => {
  const errors = {};

  if (!firstName || !firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!lastName || !lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLogin = ({ email, password }) => {
  const errors = {};

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateTransaction = ({ title, amount, category, transaction_date }) => {
  const errors = {};

  if (!title || !title.trim()) {
    errors.title = 'Title is required';
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!category || !category.trim()) {
    errors.category = 'Category is required';
  }

  if (!transaction_date || !transaction_date.trim()) {
    errors.transaction_date = 'Date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateBudget = ({ category, amount, month, year }) => {
  const errors = {};

  if (!category || !category.trim()) {
    errors.category = 'Category is required';
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.amount = 'Budget amount must be greater than 0';
  }

  const numMonth = parseInt(month, 10);
  if (isNaN(numMonth) || numMonth < 1 || numMonth > 12) {
    errors.month = 'Invalid month';
  }

  const numYear = parseInt(year, 10);
  if (isNaN(numYear) || numYear < 2000 || numYear > 2100) {
    errors.year = 'Invalid year';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateProfile = ({ firstName, lastName }) => {
  const errors = {};

  if (!firstName || !firstName.trim()) {
    errors.firstName = 'First name cannot be blank';
  }

  if (!lastName || !lastName.trim()) {
    errors.lastName = 'Last name cannot be blank';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
