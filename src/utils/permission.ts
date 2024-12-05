export function hasPermission(permissions: undefined | string | string[], userPermission: string[]) {
  if (!permissions || `${permissions}`.trim() === '') {
    return true;
  }

  const permission = Array.isArray(permissions) ? permissions : [permissions];
  if (permission.length === 0) {
    return true;
  }

  if (userPermission.length === 0) {
    return false;
  }

  if (permission.includes('*')) {
    return true;
  }

  if (userPermission.includes('*')) {
    return true;
  }

  return permission.some((item) => userPermission.includes(item));
}
