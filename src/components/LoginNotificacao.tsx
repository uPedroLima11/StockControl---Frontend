"use client";

import { useEffect, useState } from "react";
import CustomNotification from "./NotificacaoCustom";
import { useTranslation } from "react-i18next";

interface NotificationData {
  message: string;
  type: "success" | "error" | "info";
  translationKey?: string;
}

export default function LoginNotificationHandler() {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const { t: tNotificacoes } = useTranslation("notificacoes");

  useEffect(() => {
    const message = localStorage.getItem('login_success_message');
    const type = localStorage.getItem('login_success_type') as "success" | "error" | "info";
    const translationKey = localStorage.getItem('login_success_translation_key');

    if (message && type) {
      const finalMessage = translationKey ? tNotificacoes(translationKey) : message;
      
      setNotification({ 
        message: finalMessage, 
        type,
        translationKey: translationKey ?? undefined
      });
      
      localStorage.removeItem('login_success_message');
      localStorage.removeItem('login_success_type');
      localStorage.removeItem('login_success_translation_key');
    }
  }, [tNotificacoes]);

  const handleCloseNotification = () => {
    setNotification(null);
  };

  if (!notification) return null;

  return (
    <CustomNotification
      message={notification.message}
      type={notification.type}
      onClose={handleCloseNotification}
      duration={5000}
    />
  );
}