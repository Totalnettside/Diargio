CREATE OR REPLACE FUNCTION public.send_art_order_message(_order uuid,_body text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.art_orders; cid uuid; actor uuid=auth.uid();
BEGIN
 SELECT * INTO o FROM public.art_orders WHERE id=_order;
 IF actor IS NULL OR NOT FOUND OR actor NOT IN (o.buyer_id,o.seller_id) OR o.paid_at IS NULL THEN RAISE EXCEPTION 'Order conversation unavailable'; END IF;
 IF length(trim(_body))=0 OR length(_body)>4000 THEN RAISE EXCEPTION 'Invalid message'; END IF;
 PERFORM 1 FROM public.art_orders WHERE id=_order FOR UPDATE;
 SELECT id INTO cid FROM public.conversations WHERE listing_id=o.listing_id AND buyer_id=o.buyer_id AND seller_id=o.seller_id LIMIT 1;
 IF cid IS NULL THEN INSERT INTO public.conversations(listing_id,buyer_id,seller_id) VALUES(o.listing_id,o.buyer_id,o.seller_id) RETURNING id INTO cid; END IF;
 INSERT INTO public.messages(conversation_id,sender_id,body) VALUES(cid,actor,trim(_body));
 RETURN cid;
END; $$;
REVOKE ALL ON FUNCTION public.send_art_order_message(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.send_art_order_message(uuid,text) TO authenticated;