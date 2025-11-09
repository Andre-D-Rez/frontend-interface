export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  // Mínimo 8, 1 maiúscula, 1 minúscula, 1 número, 1 especial
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  return re.test(password);
};

export const isValidName = (name: string): boolean => {
  return typeof name === 'string' && name.trim().length >= 2;
};

export default { isValidEmail, isStrongPassword, isValidName }
