export function maintenanceShowsSite(enabled: boolean, verifiedAdmin: boolean, pathname: string) {
  return !enabled || verifiedAdmin || ['/auth', '/auth/', '/auth/callback', '/auth/reset', '/auth/recovery'].includes(pathname);
}