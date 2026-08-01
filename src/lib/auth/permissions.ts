export const permissions = {
  accessAdminPanel: 'admin:access',
} as const

export type Permission = (typeof permissions)[keyof typeof permissions]

const rolePermissions: Partial<Record<string, ReadonlyArray<Permission>>> = {
  admin: [permissions.accessAdminPanel],
}

export function hasPermission(
  role: string | null | undefined,
  permission: Permission,
): boolean {
  return rolePermissions[role ?? '']?.includes(permission) ?? false
}

export function canAccessAdminPanel(role: string | null | undefined): boolean {
  return hasPermission(role, permissions.accessAdminPanel)
}
