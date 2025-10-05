"use client";

import { useEffect, useState } from "react";
import CustomNotification from "./NotificacaoCustom";

interface NotificationData {
  message: string;
  type: "success" | "error" | "info";
}

export default function LoginNotificationHandler() {
  const [notification, setNotification] = useState<NotificationData | null>(null);

  useEffect(() => {
    const message = localStorage.getItem('login_success_message');
    const type = localStorage.getItem('login_success_type') as "success" | "error" | "info";

    if (message && type) {
      setNotification({ message, type });
      
      localStorage.removeItem('login_success_message');
      localStorage.removeItem('login_success_type');
    }
  }, []);

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