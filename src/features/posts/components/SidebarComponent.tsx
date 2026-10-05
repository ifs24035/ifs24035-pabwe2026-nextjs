"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  IconLayoutGrid,
  IconUserStar,
  IconUsers,
  IconUserCircle,
  IconChevronRight,
  IconCamera,
} from "@tabler/icons-react";

type SidebarComponentProps = {
  isSidebarOpen: boolean;
  onCloseMobile: () => void;
};

function SidebarComponent({ isSidebarOpen, onCloseMobile }: SidebarComponentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMeActive = searchParams?.get("is_me") === "1";

  const navItems = [
    {
      href: "/",
      label: "Semua Postingan",
      icon: IconLayoutGrid,
      active: pathname === "/" && !isMeActive,
    },
    {
      href: "/?is_me=1",
      label: "Postingan Saya",
      icon: IconUserStar,
      active: pathname === "/" && isMeActive,
    },
    {
      href: "/users",
      label: "Daftar Pengguna",
      icon: IconUsers,
      active: pathname === "/users" || pathname.startsWith("/users/"),
    },
    {
      href: "/profile",
      label: "Profil Saya",
      icon: IconUserCircle,
      active: pathname === "/profile" || pathname.startsWith("/profile/"),
    },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div
          data-testid="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 p-4 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Menu Utama
              </p>
              <nav className="mt-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      data-testid={`sidebar-link-${item.label
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        item.active
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={20}
                          className={
                            item.active
                              ? "text-white"
                              : "text-slate-400 group-hover:text-slate-600"
                          }
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.active && <IconChevronRight size={16} />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mx-1 rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50 via-white to-cyan-50/60 p-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <IconCamera size={16} stroke={2.4} />
                <p className="text-xs font-bold">Bagikan Momenmu</p>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                Unggah cover menarik dan tulis deskripsi seru agar postinganmu
                dilihat banyak orang.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/60 border border-slate-200/70">
            <p className="text-xs font-semibold text-slate-700">Praktikum PABWE 2026</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Next.js &middot; TypeScript &middot; Redux
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SidebarComponent;
