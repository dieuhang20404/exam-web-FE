// src/components/UserProfile.jsx

export default function UserProfile({
  navigate,
  showProfileMenu,
  setShowProfileMenu,
}) {

  return (

    <div
      className="user-info"
      onClick={() =>
        setShowProfileMenu(!showProfileMenu)
      }
    >

      <div className="avatar"></div>

      <div>

        <h4>Nguyễn Văn A</h4>

        <p>nva@gmail.com</p>

      </div>

      {
        showProfileMenu && (

          <div className="profile-popup">

            <div
              className="popup-item"
              onClick={() =>
                navigate("/student/profile")
              }
            >
              Tài khoản
            </div>

            <div className="popup-item">
              Đăng xuất
            </div>

          </div>

        )
      }

    </div>

  );
}