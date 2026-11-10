import {createFileRoute,Outlet,redirect} from '@tanstack/react-router';
import {supabase} from '@/integrations/supabase/client';
import {privateHead,privatePageFor} from '@/lib/seo';
// ssr is off, so child heads are not rendered for crawlers. This parent head still runs and noindexes the shell.
export const Route=createFileRoute('/_authenticated')({ssr:false,head:({matches})=>{const path=[...matches].reverse().find((match)=>match.pathname)?.pathname??'/min-side';const page=privatePageFor(path);return privateHead(page.title,page.description);},beforeLoad:async({location})=>{const {data}=await supabase.auth.getUser();if(!data.user)throw redirect({to:'/auth',search:{next:location.pathname+location.searchStr}});},component:Outlet});
