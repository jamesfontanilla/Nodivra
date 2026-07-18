import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieSerializeOptions } from "cookie";

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function createSupabaseServerClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieSerializeOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Cookies may be read-only in certain rendering paths.
          }
        },
        remove(name: string, options: CookieSerializeOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Cookies may be read-only in certain rendering paths.
          }
        },
      },
    },
  );
}
