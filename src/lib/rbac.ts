import { Role } from '@prisma/client'

const roleHierarchy: Record<Role, number> = {
  [Role.TEAM_MEMBER]: 1,
  [Role.MANAGER]: 2,
  [Role.ADMIN]: 3,
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
