import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { sendWelcomeEmail } from "@/lib/welcome.functions";
import { ProfileForm } from "./ProfileForm";

export function OnboardingDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const sendWelcome = useServerFn(sendWelcomeEmail);

  useEffect(() => {
    if (!user) return setOpen(false);
    void supabase
      .from("profiles")
      .select("onboarded")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setOpen(data ? !data.onboarded : false));
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display">Velkommen til Diargio</DialogTitle>
          <DialogDescription>Fyll inn litt om deg selv for å komme i gang.</DialogDescription>
        </DialogHeader>
        <ProfileForm compact onSaved={() => { setOpen(false); void sendWelcome().catch(() => {}); }} />
      </DialogContent>
    </Dialog>
  );
}
