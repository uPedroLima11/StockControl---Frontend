"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";
import Sidebar from "./sidebar";
import { useEffect, useState } from "react";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isNoDarkModePage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/esqueci" ||
    pathname === "/alteracao";

  const [modoDark, setModoDark] = useState(false);

  useEffect(() => {
    if (!isNoDarkModePage) {
      const temaSalvo = localStorage.getItem("modoDark");
      const ativado = temaSalvo === "true";
      setModoDark(ativado);
      aplicarTema(ativado);
    } else {
      setModoDark(false);
      aplicarTema(false);
    }
  }, [pathname]);

  const aplicarTema = (ativado: boolean) => {
    const root = document.documentElement;
    if (ativado) {
      root.classList.add("dark");
      root.style.setProperty("--cor-fundo", "#20252B");
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#ffffff");
    }
  };

  const isPublicPage =
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/esqueci" ||
    pathname === "/alteracao" ||
    pathname === "/pt";

  if (isHome) {
    return (
      <>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </>
    );
  }

  if (isPublicPage || isNoDarkModePage) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto max-h-screen bg-white"
        style={{ backgroundColor: modoDark ? "#20252B" : "#ffffff" }}
      >
        {children}
      </main>
    </div>
  );
}
