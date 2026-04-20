type RequestAuth = {
  session: import("@supabase/supabase-js").Session;
  userId: string;
  displayName: string;
  initials: string;
};

declare namespace App {
  interface Locals {
    auth: RequestAuth | null;
  }
}
