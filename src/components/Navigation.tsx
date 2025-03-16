"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaListAlt } from "@react-icons/all-files/fa/FaListAlt";
import { FaRegCalendarCheck } from "@react-icons/all-files/fa/FaRegCalendarCheck";
import { FaCalculator } from "@react-icons/all-files/fa/FaCalculator";
import { FaCog } from "@react-icons/all-files/fa/FaCog";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 pb-[env(safe-area-inset-bottom)] w-full bg-shadow bg-(--background) border-t">
      <div className="flex justify-around p-4">
        <Link
          href="/transactions"
          className={`flex flex-col items-center ${
            pathname === "/transactions" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <span className="flex items-center gap-2">
            <FaListAlt />
            取引履歴
          </span>
        </Link>
        <Link
          href="/inventory"
          className={`flex flex-col items-center ${
            pathname === "/inventory" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <span className="flex items-center gap-2">
            <FaRegCalendarCheck />
            棚卸
          </span>
        </Link>
        <Link
          href="/reports"
          className={`flex flex-col items-center ${
            pathname === "/reports" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <span className="flex items-center gap-2">
            <FaCalculator />
            集計
          </span>
        </Link>
        <Link
          href="/settings"
          className={`flex flex-col items-center ${
            pathname === "/settings" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <span className="flex items-center gap-2">
            <FaCog />
            設定
          </span>
        </Link>
      </div>
    </nav>
  );
}
