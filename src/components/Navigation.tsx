"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full bg-shadow bg-(--background) border-t">
      <div className="flex justify-around p-4">
        <Link
          href="/transactions"
          className={`flex flex-col items-center ${
            pathname === "/transactions" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <span>取引履歴</span>
        </Link>
        <Link
          href="/inventory"
          className={`flex flex-col items-center ${
            pathname === "/inventory" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <span>棚卸</span>
        </Link>
        <Link
          href="/reports"
          className={`flex flex-col items-center ${
            pathname === "/reports" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <span>集計</span>
        </Link>
        <Link
          href="/settings"
          className={`flex flex-col items-center ${
            pathname === "/settings" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <span>設定</span>
        </Link>
      </div>
    </nav>
  );
}
