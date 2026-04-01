// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const PublicRoute = ({ children }) => {
//   const { user, loading } = useAuth();

//   if (loading) return null;

//   return user ? <Navigate to="/" replace /> : children;
// };

// export default PublicRoute;


import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../Components/Loader";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Loader/>
    );
  }

  return user ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
