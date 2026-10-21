import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Giriş yap</h1>
        <p className="muted">Takvimine ulaşmak için hesabınla giriş yap.</p>
      </div>
      <LoginForm />
      <p className="muted">
        Hesabın yok mu?{" "}
        <Link href="/auth/sign-up" className="font-medium underline">
          Kayıt ol
        </Link>
      </p>
    </main>
  );
}
