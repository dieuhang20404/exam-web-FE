// src/components/UserProfile.jsx

export default function UserProfile({
  navigate,
  user,
  showProfileMenu,
  setShowProfileMenu,
}) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className="user-info"
      onClick={() =>
        setShowProfileMenu(!showProfileMenu)
      }
    >
      <div className="avatar"></div>

      <div>
        <h4>
          {user?.full_name || "Đang tải..."}
        </h4>

        <p>
          {user?.email || ""}
        </p>
      </div>

      {showProfileMenu && (
        <div className="profile-popup">
          <div
            className="popup-item"
            onClick={() =>
              navigate("/student/profile")
            }
          >
            Tài khoản
          </div>

          <div
            className="popup-item"
            onClick={handleLogout}
          >
            Đăng xuất
          </div>
        </div>
      )}
    </div>
  );
}