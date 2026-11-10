import {createFileRoute,Link} from '@tanstack/react-router';
import {privateHead,privatePageFor} from '@/lib/seo';
export const Route=createFileRoute('/auth/vipps')({head:()=>{const page=privatePageFor('/auth/vipps');return privateHead(page.title,page.description);},component:()=> <main className="px-5 py-10"><p>Vipps-innlogging er fjernet.</p><Link to="/auth" className="underline">Logg inn med e-post eller Google</Link></main>});
