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

  const [modoDark, setModoDark] = useState<boolean | undefined>(undefined);

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
    if (typeof window !== "undefined") {
      if (!isNoDarkModePage) {
        const temaSalvo = localStorage.getItem("modoDark");
        const ativado = temaSalvo === "true";
        setModoDark(ativado);
        
        const handleThemeChange = (e: CustomEvent) => {
          const novoTema = e.detail.modoDark;
          setModoDark(novoTema);
          aplicarTema(novoTema);
        };

        window.addEventListener('themeChanged', handleThemeChange as EventListener);
        
        return () => {
          window.removeEventListener('themeChanged', handleThemeChange as EventListener);
        };
      } else {
        setModoDark(false);
        aplicarTema(false);
      }
    }
  }, [pathname, isNoDarkModePage]);

  const aplicarTema = (ativado: boolean) => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (ativado) {
        root.classList.add("dark");
        root.style.setProperty("--cor-fundo", "#0A1929");
        document.body.style.backgroundColor = "#0A1929";
      } else {
        root.classList.remove("dark");
        root.style.setProperty("--cor-fundo", "#e4ecf4");
        document.body.style.backgroundColor = "#e4ecf4";
      }
    }
  };

  if (modoDark === undefined && !isNoDarkModePage && !isPublicPage && !isHome) {
    return (
      <div className="flex">
        <div className="flex-1 overflow-y-auto max-h-screen bg-gray-200">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

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
    <div 
      className="flex min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: modoDark ? '#0A1929' : '#e4ecf4'
      }}
    >
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
        className="flex-1 overflow-y-auto max-h-screen transition-colors duration-300"
        style={{
          backgroundColor: modoDark ? '#0A1929' : '#e4ecf4'
        }}
      >
        {children}
      </main>
    </div>
  );
}