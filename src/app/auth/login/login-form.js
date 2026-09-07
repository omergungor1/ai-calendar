"use client";

import { useActionState } from "react";
import { login } from "@/app/auth/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, { error: null });

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        E-posta
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-200"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Şifre
        <input
          required
          type="password"
          name="password"
          autoComplete="current-password"
          minLength={6}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-200"
        />
      </label>
      {state?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Giriş yapılıyor..." : "Giriş yap"}
      </button>
    </form>
  );
}
