export const MANAGER_ROLES = [
  "Support Manager",
  "PTAP Manager Support",
  "Manager Support",
];

export const STAFF_ROLES = [
  "Support Staff",
  "PTAP Eksternal/Internal Support Staff",
  "External Support",
  "Internal Support",
  "Support Agent",
];

export const hasAnyRole = (roles = [], allowedRoles = []) => {
  return roles.some((role) => allowedRoles.includes(role));
};

export const isManager = (roles = []) => {
  return hasAnyRole(roles, MANAGER_ROLES);
};

export const isStaff = (roles = []) => {
  return hasAnyRole(roles, STAFF_ROLES);
};

export const isCustomer = (roles = []) => {
  return !isManager(roles) && !isStaff(roles);
};

export const getRoleType = (roles = []) => {
  if (isManager(roles)) return "MANAGER";
  if (isStaff(roles)) return "STAFF";
  return "CUSTOMER";
};

export const getDisplayRole = (roles = []) => {
  if (isManager(roles)) return "Manager Support";
  if (isStaff(roles)) return "Support Agent";
  return "Customer";
};