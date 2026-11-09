import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { listingContentSchema } from './moderation';
import type { Json } from '@/integrations/supabase/types';

export const saveListingDraft = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({listing: listingContentSchema}).parse(d))
  .handler(async({data,context}) => {
    const {data:id,error} = await context.supabase.rpc('save_listing_revision',{_id:data.listing.id,_data:data.listing as Json});
    if(error) throw new Error(error.message);
    return {revisionId:id};
  });
export const submitListing = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({id:z.string().min(1).max(200)}).parse(d))
  .handler(async({data,context}) => {
    const {data:eventId,error} = await context.supabase.rpc('submit_listing_revision',{_id:data.id});
    if(error) throw new Error(error.message);
    return {eventId};
  });
export const changeListingVisibility = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({id:z.string().min(1).max(200),action:z.enum(['draft','withdrawn','sold'])}).parse(d))
  .handler(async({data,context}) => {
    const {error} = await context.supabase.rpc('change_listing_visibility',{_id:data.id,_action:data.action});
    if(error) throw new Error(error.message);
    return {ok:true};
  });
export const getModerationQueue = createServerFn({method:'GET'}).middleware([requireSupabaseAuth])
  .handler(async({context}) => {
    const {data:admin} = await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
    if(!admin) throw new Error('Ingen administratortilgang.');
    const [revisions,profiles,events,notes] = await Promise.all([
      context.supabase.from('listing_revisions').select('*').order('submitted_at',{ascending:true,nullsFirst:false}),
      context.supabase.from('profiles').select('id,display_name'),
      context.supabase.from('listing_review_events').select('*').order('created_at',{ascending:false}),
      context.supabase.from('listing_review_notes').select('*'),
    ]);
    if([revisions,profiles,events,notes].some(r=>r.error)) throw new Error('Godkjenningskøen kunne ikke lastes.');
    return {revisions:revisions.data??[],profiles:profiles.data??[],events:events.data??[],notes:notes.data??[]};
  });
export const reviewListing = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({revisionId:z.string().uuid(),version:z.number().int().positive(),decision:z.enum(['published','changes_requested','rejected']),reason:z.string().max(4000),note:z.string().max(10000)}).parse(d))
  .handler(async({data,context}) => {
    const {data:eventId,error} = await context.supabase.rpc('review_listing_revision',{_revision:data.revisionId,_version:data.version,_decision:data.decision,_reason:data.reason,_note:data.note});
    if(error) throw new Error(error.message);
    return {eventId};
  });

// A fixed feature event determines the recipient and template. The event also stores
// send outcomes; no email queue or bulk sending exists in the application.
export const sendReviewNotice = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({eventId:z.string().uuid()}).parse(d))
  .handler(async({data,context}) => {
    const {data:event} = await context.supabase.from('listing_review_events').select('*').eq('id',data.eventId).single();
    if(!event) throw new Error('Fant ikke varselet.');
    const {data:isAdmin} = await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
    if(!isAdmin && (event.user_id!==context.userId || event.decision!=='submitted')) throw new Error('Ingen tilgang.');
    if(event.email_status==='sent'||event.email_status==='suppressed') return {status:event.email_status};
    if(event.email_retry_at && new Date(event.email_retry_at).getTime()>Date.now()) return {status:'waiting'};
    const {supabaseAdmin:a} = await import('@/integrations/supabase/client.server');
    try {
      const {data:profile} = await a.from('profiles').select('display_name').eq('id',event.user_id).maybeSingle();
      let recipient = 'post@diargio.com';
      if(event.decision!=='submitted') {
        const {data:u,error} = await a.auth.admin.getUserById(event.user_id);
        if(error || !u.user?.email) throw new Error('Selgers e-postadresse er ikke tilgjengelig.');
        recipient = u.user.email;
      }
      const {sendTemplateEmail} = await import('@/lib/email-templates/send-email');
      const result = await sendTemplateEmail('listing-review',recipient,{idempotencyKey:`listing-review-${event.id}`,templateData:{title:event.title,listingId:event.listing_id,seller:profile?.display_name??'Selger',price:Number(event.price).toLocaleString('nb-NO'),submittedAt:new Date(event.created_at).toLocaleString('nb-NO',{timeZone:'Europe/Oslo'}),decision:event.decision,reason:event.reason}});
      const status = result.sent?'sent':'suppressed';
      const {error} = await a.from('listing_review_events').update({email_status:status,email_error:null,email_retry_at:null}).eq('id',event.id);
      if(error) throw new Error('Varselstatus kunne ikke lagres.');
      return {status};
    } catch(error) {
      const {EmailAPIError} = await import('@lovable.dev/email-js');
      const code = error instanceof EmailAPIError ? error.code : 'send_failed';
      const delay = error instanceof EmailAPIError && error.status===429 ? error.retryAfterSeconds??60 : 60;
      console.error('Listing review notice failed',code);
      await a.from('listing_review_events').update({email_status:'failed',email_error:code,email_retry_at:new Date(Date.now()+delay*1000).toISOString()}).eq('id',event.id);
      return {status:'failed'};
    }
  });