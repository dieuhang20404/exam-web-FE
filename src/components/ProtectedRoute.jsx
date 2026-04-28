import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../store/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  const role = getRole();

  if (!token) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;