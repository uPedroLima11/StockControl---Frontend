"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { useEffect, useState } from "react";
import { use2FASession } from "@/hooks/use2FASession";
import CustomNotification from "./NotificacaoCustom";
import Cookies from "js-cookie";
import LoginNotificationHandler from "./LoginNotificacao"; 

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { verificarERedirecionar, notifications, removeNotification } = use2FASession();

  const isHome = pathname === "/";
  const isNoDarkModePage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/esqueci" ||
    pathname === "/alteracao" ||
    pathname.startsWith("/catalogo/");
  const [modoDark, setModoDark] = useState(false);

  const isPublicPage =
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/esqueci" ||
    pathname === "/alteracao" ||
    pathname === "/pt" ||
    pathname.startsWith("/catalogo/");

  useEffect(() => {
    if (!isPublicPage && !isHome) {
      const token = Cookies.get("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const initialTimer = setTimeout(() => {
        verificarERedirecionar();
      }, 1000);

      const interval = setInterval(verificarERedirecionar, 30000);

      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }
  }, [pathname, isPublicPage, isHome, verificarERedirecionar]);

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
      root.style.setProperty("--cor-fundo", "#0A1929");
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#cccccc");
    }
  };

  if (isHome) {
    return (
      <>
        <Navbar />
        <main>{children}</main>
      </>
    );
  }

  if (isPublicPage || isNoDarkModePage) {
    return (
      <>
        {notifications.map((notification) => (
          <CustomNotification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
        <LoginNotificationHandler />
        <main>{children}</main>
      </>
    );
  }

  return (
    <div className="flex">
      {notifications.map((notification) => (
        <CustomNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
      <LoginNotificationHandler />
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto max-h-screen bg-white"
        style={{ backgroundColor: modoDark ? "#0A1929" : "#cccccc" }}
      >
        {children}
      </main>
    </div>
  );
}