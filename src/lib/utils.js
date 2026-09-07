export const hasEnvVars = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT_REF") &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !==
      "your-publishable-or-anon-key"
);
