// src/components/student/Header.jsx

import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import UserProfile from "./UserProfile";

export default function Header({
  navigate,

  keyword,
  setKeyword,

  hasUnreadNotification,
  showNotification,
  setShowNotification,

  showProfileMenu,
  setShowProfileMenu,
}) {

  return (

    <div className="header">

      <UserProfile
        navigate={navigate}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
      />

      <SearchBar
        keyword={keyword}
        setKeyword={setKeyword}
      />

      <NotificationBell
        hasUnreadNotification={hasUnreadNotification}
        showNotification={showNotification}
        setShowNotification={setShowNotification}
      />

    </div>

  );
}