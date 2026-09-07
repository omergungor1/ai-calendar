import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import { CalendarApp } from "@/components/calendar-app";

export const dynamic = "force-dynamic";

export default async function TakvimPage() {
  if (!hasEnvVars) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email, avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <CalendarApp
      user={{ id: user.id, email: user.email }}
      profile={profile}
    />
  );
}
