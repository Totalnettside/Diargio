import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export function SavedWalls() {
  const { user } = useAuth(); const cache = useQueryClient(); const [error, setError] = useState('');
  const walls = useQuery({ queryKey: ['my-art-walls', user?.id], enabled: !!user, queryFn: async () => {
    if (!user) return [];
    const { data, error } = await supabase.from('art_walls').select('id,name,shared,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false });
    if (error) throw error; return data ?? [];
  } });
  return <section className="mt-6"><div className="flex items-center justify-between gap-3"><h2 className="font-display text-lg font-medium">Mine kunstvegger</h2><Button asChild variant="outline"><Link to="/kunstvegg">Ny kunstvegg</Link></Button></div>
    {(walls.error || error) && <p role="alert" className="mt-3 text-sm text-destructive">{error || 'Kunstveggene kunne ikke lastes.'}</p>}
    {walls.isLoading && <p className="mt-4 text-sm text-muted-foreground">Laster kunstvegger…</p>}
    {walls.data?.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Du har ingen lagrede kunstvegger ennå.</p>}
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{walls.data?.map((w) => <article key={w.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"><div><Link to="/kunstvegg" search={{ wall: w.id }} className="font-semibold underline-offset-4 hover:underline">{w.name}</Link><p className="mt-1 text-xs text-muted-foreground">{w.shared ? 'Delbar lenke aktiv' : 'Privat kunstvegg'}</p></div><Button variant="ghost" size="icon" aria-label={`Slett ${w.name}`} onClick={async () => { if (!window.confirm(`Slette «${w.name}»?`)) return; const { error } = await supabase.from('art_walls').delete().eq('id',w.id); if (error) setError('Kunne ikke slette kunstveggen.'); else await cache.invalidateQueries({ queryKey: ['my-art-walls'] }); }}><Trash2 /></Button></article>)}</div>
  </section>;
}