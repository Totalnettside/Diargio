ALTER TABLE public.bids ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected'));
ALTER TABLE public.bids ADD COLUMN decided_at timestamptz;
CREATE FUNCTION public.guard_bid_decision_insert() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$ BEGIN IF NEW.status <> 'pending' OR NEW.decided_at IS NOT NULL THEN RAISE EXCEPTION 'New bids must be pending'; END IF; RETURN NEW; END; $$;
CREATE TRIGGER guard_bid_decision_insert BEFORE INSERT ON public.bids FOR EACH ROW EXECUTE FUNCTION public.guard_bid_decision_insert();
CREATE FUNCTION public.decide_artwork_bid(_bid_id uuid, _decision text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _bid public.bids;
BEGIN
 IF auth.uid() IS NULL OR _decision NOT IN ('accepted','rejected') OR _decision IS NULL THEN RAISE EXCEPTION 'Invalid decision'; END IF;
 SELECT * INTO _bid FROM public.bids WHERE id = _bid_id AND seller_id = auth.uid() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF _bid.status <> 'pending' THEN RAISE EXCEPTION 'Bid already decided'; END IF;
 UPDATE public.bids SET status = _decision, decided_at = now(), read_at = coalesce(read_at, now()) WHERE id = _bid.id;
 INSERT INTO public.messages(conversation_id, sender_id, body) VALUES (_bid.conversation_id, auth.uid(), CASE WHEN _decision = 'accepted' THEN 'Bud godkjent: ' ELSE 'Bud avslått: ' END || _bid.amount::text || ' kr' || CASE WHEN _decision = 'accepted' THEN E'\nBetaling er ikke gjennomført.' ELSE '' END);
END; $$;
REVOKE ALL ON FUNCTION public.decide_artwork_bid(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decide_artwork_bid(uuid,text) TO authenticated;