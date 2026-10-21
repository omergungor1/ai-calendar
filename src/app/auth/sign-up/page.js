import Link from "next/link";
import { SignUpForm } from "./sign-up-form";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Kayıt ol</h1>
        <p className="muted">E-posta ve şifre ile yeni bir hesap oluştur.</p>
      </div>
      <SignUpForm />
      <p className="muted">
        Zaten hesabın var mı?{" "}
        <Link href="/auth/login" className="font-medium underline">
          Giriş yap
        </Link>
      </p>
    </main>
  );
}
