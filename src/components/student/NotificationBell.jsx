import { useEffect, useState } from "react";
import { Bell, BellDot } from "lucide-react";
import { getNotifications } from "../../services/notificationService";

export default function NotificationBell({
  userId,
  showNotification,
  setShowNotification,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // CALL API với Cleanup Function để tránh Race Condition
  useEffect(() => {
    if (!userId) {
      setNotifications([]); // Xóa thông báo cũ nếu userId đăng xuất
      return;
    }

    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getNotifications(userId);
        
        if (active) {
          // Bảo đảm dữ liệu trả về là một mảng
          setNotifications(Array.isArray(res?.data) ? res.data : []);
        }
      } catch (err) {
        console.error("Get notifications error:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function: Sẽ chạy khi userId thay đổi hoặc component unmount
    return () => {
      active = false;
    };
  }, [userId]);

  // Tối ưu hóa hiệu năng bằng cách check độ dài mảng trước
  const hasUnreadNotification = notifications.length > 0 && notifications.some((n) => !n.is_read);

  const togglePopup = () => {
    setShowNotification((prev) => !prev);
  };

  // Hàm xử lý khi click vào từng thông báo (Gợi ý thêm)
  const handleNotificationClick = async (notiId) => {
    // 1. Cập nhật UI local ngay lập tức (Optimistic UI) để người dùng thấy mượt mà
    setNotifications((prev) =>
      prev.map((n) => (n.noti_id === notiId ? { ...n, is_read: true } : n))
    );

    try {
      // 2. Gọi API để cập nhật trạng thái dưới Database ở đây
      // await markNotificationAsRead(notiId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Nếu API lỗi, có thể rollback lại trạng thái cũ tại đây nếu cần
    }
  };

  return (
    <div className="notification" style={{ position: "relative" }}>
      {/* ICON - Chuyển sang button để chuẩn SEO/Accessibility */}
      <button 
        onClick={togglePopup} 
        className="notification-btn"
        aria-label="Toggle notifications"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        {hasUnreadNotification ? (
          <BellDot size={24} className="bell-icon unread-dot" />
        ) : (
          <Bell size={24} className="bell-icon" />
        )}
      </button>

      {/* POPUP */}
      {showNotification && (
        <div className="notification-popup">
          {loading ? (
            <div className="notify-empty">Đang tải...</div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.noti_id}
                onClick={() => handleNotificationClick(n.noti_id)}
                className={`notify-item ${n.is_read ? "read" : "unread"}`}
                style={{ cursor: "pointer" }} // Thêm con trỏ để người dùng biết click được
              >
                {n.content}
              </div>
            ))
          ) : (
            <div className="notify-empty">
              Không có thông báo
            </div>
          )}
        </div>
      )}
    </div>
  );
}