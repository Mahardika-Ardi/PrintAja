export const registerSelect = {
  id: true,
  email: true,
  phone: true,
  role: true,
  gender: true,
  firstName: true,
  lastName: true,
  birthDate: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
} as const;

export const loginSelect = {
  id: true,
  email: true,
  phone: true,
  password: true,
} as const;
