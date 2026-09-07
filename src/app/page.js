import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (hasEnvVars) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      redirect("/takvim");
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Takvim</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Haftanı gör, konuşarak ekle.
        </h1>
        <p className="max-w-lg text-stone-600">
          Arkadaşlarını davet et, onayladıklarının takvimini gör. Yapılacaklar
          günlerden bağımsız durur.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/auth/login" className="btn-primary">
          Giriş yap
        </Link>
        <Link href="/auth/sign-up" className="btn-ghost">
          Kayıt ol
        </Link>
      </div>
    </main>
  );
}
