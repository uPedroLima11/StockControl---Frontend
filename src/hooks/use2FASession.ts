"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface NotificationType {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

export function use2FASession() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);

    const addNotification = (message: string, type: "success" | "error" | "info" = "info") => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const verificarSessao2FA = async (): Promise<{ sessaoValida: boolean, motivo?: string }> => {
        try {
            const token = Cookies.get("token");
            if (!token) {
                return { sessaoValida: false, motivo: "Token não encontrado" };
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/verificar-sessao`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                return { sessaoValida: data.sessaoValida };
            } else if (response.status === 401) {
                Cookies.remove("token");
                return { sessaoValida: false, motivo: "Token inválido" };
            } else if (response.status === 403) {
                return { sessaoValida: false, motivo: "Email não verificado" };
            } else {
                return { sessaoValida: false, motivo: "Erro na verificação" };
            }
        } catch (error) {
            console.error("❌ Erro ao verificar sessão 2FA:", error);
            return { sessaoValida: false, motivo: "Erro de conexão" };
        }
    };

    const verificarERedirecionar = async () => {
        const resultado = await verificarSessao2FA();

        if (!resultado.sessaoValida) {

            Cookies.remove("token");
            localStorage.removeItem("client_key");

            addNotification("Sua sessão expirou. Faça login novamente.", "error");

            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } else {
        }
    };

    return {
        verificarERedirecionar,
        notifications,
        removeNotification
    };
}