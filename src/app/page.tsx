"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import { FaGoogle } from "@react-icons/all-files/fa/FaGoogle";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = await createClient();
      if ((await supabase.auth.getUser()).data.user) {
        router.push("/transactions");
      }
    };

    checkAuth();
  }, [router]);

  const handleGitHubLogin = async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("ログインエラー:", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("ログインエラー:", error.message);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-4">家計簿さん</h1>
          <p className="text-gray-600 text-lg">複式簿記で家計簿を！</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <FaGoogle />
            Googleでログイン
          </button>

          <button
            onClick={handleGitHubLogin}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 cursor-pointer"
          >
            <FaGithub />
            GitHubでログイン
          </button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-gray-600">
          &copy; 2013{" "}
          <a
            href="https://github.com/onjiro"
            className="underline cursor-pointer"
          >
            onjiro
          </a>
        </p>
      </footer>
    </div>
  );
}
