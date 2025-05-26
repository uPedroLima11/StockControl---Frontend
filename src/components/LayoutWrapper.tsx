"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";
import Sidebar from "./sidebar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isHome = pathname === "/";

  const isPublicPage =
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/esqueci" || 
    pathname === "/alteracao"; 

  if (isHome) {
    return (
      <>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </>
    );
  }

  if (isPublicPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex  ">
      <Sidebar />
      <main className="flex-1 overflow-y-auto max-h-screen">{children}</main>
    </div>
  );
}
