import { useAuthStore } from '../store/useAuthStore';
import { hasPermission, hasAnyPermission, PERMISSIONS } from '../config/permissions';

export const usePermission = () => {
  const user = useAuthStore((state) => state.user);

  const can = (permissionKey) => hasPermission(user, permissionKey);
  const canAny = (permissionKeys) => hasAnyPermission(user, permissionKeys);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return {
    can,
    canAny,
    isSuperAdmin,
    user,
    PERMISSIONS,
  };
};

export default usePermission;

