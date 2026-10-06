import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const [state, setState] = useState<{ isAdmin: boolean; checking: boolean }>({ isAdmin: false, checking: true });

  useEffect(() => {
    if (loading) return;
    if (!user) return setState({ isAdmin: false, checking: false });
    void supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setState({ isAdmin: data === true, checking: false }));
  }, [user, loading]);

  return state;
}
