"use client";

import { useActionState } from "react";
import { login } from "@/app/auth/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, { error: null });

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="field">
        E-posta
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
        />
      </label>
      <label className="field">
        Şifre
        <input
          required
          type="password"
          name="password"
          autoComplete="current-password"
          minLength={6}
        />
      </label>
      {state?.error ? <p className="error-text">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Giriş yapılıyor..." : "Giriş yap"}
      </button>
    </form>
  );
}
