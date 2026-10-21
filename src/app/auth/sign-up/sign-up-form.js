"use client";

import { useActionState } from "react";
import { signup } from "@/app/auth/actions";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signup, { error: null });

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="field">
        Görünen ad
        <input type="text" name="display_name" autoComplete="name" />
      </label>
      <label className="field">
        E-posta
        <input required type="email" name="email" autoComplete="email" />
      </label>
      <label className="field">
        Şifre
        <input
          required
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={6}
        />
      </label>
      {state?.error ? <p className="error-text">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Kayıt oluşturuluyor..." : "Kayıt ol"}
      </button>
    </form>
  );
}
