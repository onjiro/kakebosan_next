"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 transition-colors"
    >
      ログアウト
    </button>
  );
} 