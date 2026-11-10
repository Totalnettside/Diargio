import {createFileRoute,Link} from '@tanstack/react-router';
import {useAuth} from '@/hooks/useAuth';
import {privateHead,privatePageFor} from '@/lib/seo';
export const Route=createFileRoute('/auth/callback')({head:()=>{const page=privatePageFor('/auth/callback');return privateHead(page.title,page.description);},component:()=>{const {user,loading}=useAuth();return <main className="px-5 py-10"><h1 className="font-display text-2xl">Kontobekreftelse</h1><p>{loading?'Kontrollerer …':user?'Du er innlogget. Kontroller e-postadressen under kontosikkerhet.':'Lenken er utløpt eller krever innlogging.'}</p><Link to={user?'/min-side':'/auth'} className="underline">Fortsett</Link></main>;}});
