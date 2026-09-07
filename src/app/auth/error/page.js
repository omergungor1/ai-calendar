import Link from "next/link";

export default async function AuthErrorPage({ searchParams }) {
  const params = await searchParams;
  const error = params.error || "Bilinmeyen bir hata oluştu.";

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Kimlik doğrulama hatası</h1>
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      <Link href="/auth/login" className="font-medium underline">
        Giriş sayfasına dön
      </Link>
    </main>
  );
}
