import {jwtDecode} from "jwt-decode";


const TOKEN_KEY = "token";
const USER_KEY = "user";

export const setAuth = (token) => {
  if (!token) return;
  
  // Lưu token vào trước
  localStorage.setItem(TOKEN_KEY, token);

  try {
    // Giải mã token an toàn
    const user = jwtDecode(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("❌ Lỗi giải mã Token (JWT Decode Error):", error);
    // Nếu lỗi, tạm thời lưu object rỗng để không bị sập code
    localStorage.setItem(USER_KEY, JSON.stringify({ role: "student" })); 
  }
};

// export const setAuth = (token) => {
//   localStorage.setItem(TOKEN_KEY,token);

//   const user =jwtDecode(token);

//   localStorage.setItem(USER_KEY,JSON.stringify(user));
// };

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = () => {
  const user =
    localStorage.getItem(USER_KEY);

  return user? JSON.parse(user): null;
};

export const getRole = () => {
  const user = getUser();
  return user?.role;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);

  localStorage.removeItem(USER_KEY);
};

