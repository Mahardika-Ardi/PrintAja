export const userMeSelect = {
  id: true,
  email: true,
  phone: true,
  avatarUrl: true,
  gender: true,
  firstName: true,
  lastName: true,
  birthDate: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
} as const;

export const userPublicSelect = {
  id: true,
  avatarUrl: true,
  firstName: true,
  lastName: true,
} as const;

export const userAdminSelect = {
  id: true,
  email: true,
  phone: true,
  role: true,
  avatarUrl: true,
  isVerified: true,
  createdAt: true,
} as const;
