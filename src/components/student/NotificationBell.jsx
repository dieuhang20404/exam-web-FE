// src/components/NotificationBell.jsx

import {
  Bell,
  BellDot,
} from "lucide-react";

export default function NotificationBell({
  hasUnreadNotification,
  showNotification,
  setShowNotification,
}) {

  return (

    <div
      className="notification"
      onClick={() =>
        setShowNotification(!showNotification)
      }
    >

      {
        hasUnreadNotification ? (
          <BellDot size={24} />
        ) : (
          <Bell size={24} />
        )
      }

      {
        showNotification && (

          <div className="notification-popup">

            {
              hasUnreadNotification ? (

                <div className="notify-item">
                  Bạn có bài kiểm tra mới
                </div>

              ) : (

                <div className="notify-empty">
                  Chưa có thông báo chưa đọc
                </div>

              )
            }

          </div>

        )
      }

    </div>

  );
}