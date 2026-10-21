import Link from "next/link";

export default function SignUpSuccessPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">E-postanı kontrol et</h1>
      <p className="muted">
        Hesabı doğrulamak için e-postandaki bağlantıya tıkla. Ardından giriş
        yapabilirsin.
      </p>
      <Link href="/auth/login" className="font-medium underline">
        Giriş sayfasına dön
      </Link>
    </main>
  );
}
