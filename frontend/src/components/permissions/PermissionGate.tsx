import { ReactNode } from 'react';

interface PermissionGateProps {
  children: ReactNode;
  requiredRole: 'owner' | 'editor' | 'viewer';
  currentUserRole: 'owner' | 'editor' | 'viewer';
  fallback?: ReactNode;
}

const roleHierarchy = {
  owner: 3,
  editor: 2,
  viewer: 1,
};

export function PermissionGate({
  children,
  requiredRole,
  currentUserRole,
  fallback = null,
}: PermissionGateProps) {
  const hasPermission =
    roleHierarchy[currentUserRole] >= roleHierarchy[requiredRole];

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
