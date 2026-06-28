import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import Loader from "../Components/Loader";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // CHECK AUTH ON APP LOAD

  const setupNotifications = async () => {
    try {
      const { requestForToken, onMessageListener } = await import("../firebase");
      const { toast } = await import("react-toastify");
      let token = null;
      try {
        token = await requestForToken();
      } catch (err) {
        toast.error(`FCM Error: ${err.message}`);
        return; // exit early
      }

      if (token) {
        await API.post("/api/auth/save-fcm-token", { fcmToken: token }, { withCredentials: true });
        toast.success("Push Notifications Enabled!");
      } else {
        toast.error("Failed to get FCM Token (Null). Please allow notifications.");
      }

      const unsubscribe = onMessageListener((payload) => {
        console.log("Foreground notification received:", payload);
        toast.info(`${payload.notification.title}: ${payload.notification.body}`);
      });
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (err) {
      console.error("Failed to setup push notifications:", err);
    }
  };

  useEffect(() => {
    let cleanup = null;
    if (user) {
      setupNotifications().then(unsub => cleanup = unsub);
    }
    return () => {
       if (cleanup) cleanup();
    };
  }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await API.get("/api/auth/me", {
          withCredentials: true
        });


        setUser(data.user);

      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);  //loader stops only after API finishes
      }
    };

    checkAuth();
  }, []);




  //  LOGIN

  const login = async (formData) => {
    try {
      setLoading(true);

      const loginPayload = {
        ...formData,
        app: import.meta.env.VITE_APP_NAME
      };

      const { data } = await API.post(
        "/api/auth/login",
        loginPayload,
        { withCredentials: true }
      );

      setUser(data.user);
    } catch (error) {
      console.error("Login Context Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  //  SIGNUP

  const signup = async (formData) => {
    try {
      setLoading(true);

      const { data } = await API.post(
        "/api/auth/register",
        formData,
        { withCredentials: true }
      );

    } catch (error) {
      console.error("Signup Context Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  //   LOGOUT

  const logout = async () => {
    try {
      setLoading(true);

      await API.post(
        "/api/auth/logout",
        {},
        { withCredentials: true }
      );

      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  //   UPDATE USER LOCALLY

  const updateUser = (updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData
    }));
  };


  // Check if user has a role
  const hasRole = (roleName, serviceId = null) => {
    if (!user?.roles) return false;

    return user.roles.some(r => {
      if (r.role !== roleName) return false;

      if (!serviceId) return true;

      return r.service?.toString() === serviceId?.toString();
    });
  };

  // Check if super admin
  const isSuperAdmin = () => hasRole("SUPER_ADMIN");

  const getPrimaryRole = () => {
    if (!user?.roles) return "";

    if (user.roles.some(r => r.role === "SUPER_ADMIN"))
      return "SUPER_ADMIN";

    if (user.roles.some(r => r.role === "ADMIN"))
      return "ADMIN";

    if (user.roles.some(r => r.role === "EMPLOYEE"))
      return "EMPLOYEE";

    return "USER";
  };


  //   GLOBAL AUTH LOADER


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
        hasRole,
        isSuperAdmin,
        getPrimaryRole
      }}
    >
      {children}
      {loading && <Loader />}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);

