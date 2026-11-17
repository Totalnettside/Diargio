import { type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useRouterState } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { getMaintenanceAdmin, getMaintenanceStatus } from '@/lib/maintenance.functions';
import { maintenanceShowsSite } from '@/lib/maintenance';
import waitingImage from '@/assets/diargio-venteside.png.asset.json';

export function MaintenanceGate({ children, initialEnabled }: { children: ReactNode; initialEnabled: boolean }) {
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const status = useServerFn(getMaintenanceStatus);
  const admin = useServerFn(getMaintenanceAdmin);
  const { data } = useQuery({ queryKey: ['maintenance-status'], queryFn: () => status(), initialData: { enabled: initialEnabled }, refetchInterval: 5000 });
  const verified = useQuery({ queryKey: ['maintenance-admin', user?.id], queryFn: () => admin(), enabled: !loading && !!user, staleTime: 0, refetchInterval: 10000, retry: false });
  if (maintenanceShowsSite(data.enabled, !!user && verified.data?.admin === true, pathname)) return children;
  return <main className="grid min-h-svh w-full place-items-center bg-topbar p-0">
    <img src={waitingImage.url} alt="Diargio – markedsplassen er snart klar for lansering" width={731} height={398} className="block h-auto max-h-svh w-full max-w-5xl object-contain" />
  </main>;
}