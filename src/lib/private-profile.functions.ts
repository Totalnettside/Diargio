import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const getOwnProfile = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data,error}=await supabaseAdmin.from('profiles').select('first_name,last_name,phone,bio,location,website,avatar_url,story,techniques,studio_images,onboarded').eq('id',context.userId).maybeSingle();
 if(error) throw new Error('Kunne ikke hente profilen');
 return data;
});
