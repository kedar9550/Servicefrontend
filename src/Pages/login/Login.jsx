import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Loader from "../../Components/Loader";

function Login() {
  const { login, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [infoMsg, setInfoMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loginFormdata, setLoginFormdata] = useState({
    id: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  const handleNoAccount = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  const handlechange = (e) => {
    let { name, value } = e.target;
    value = value.replace(/\s/g, "");

    setLoginFormdata((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when typing
    setErrors({});
    setInfoMsg("");
  };

  const validate = () => {
    let newErrors = {};

    if (!loginFormdata.id.trim()) {
      newErrors.id = "ID is required";
    }

    if (!loginFormdata.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlelogin = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!validate()) return;

    setSubmitting(true);

    try {
      await login(loginFormdata);
      //navigate("/");
    } catch (err) {
      if (err.response?.data?.message) {
        setErrors({ apiError: err.response.data.message });
      } else {
        setErrors({ apiError: "Invalid credentials. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg_container" style={{ height: "100vh", overflow: "hidden" }}>
      <div className="container-fluid">
        <div className="row">

          {/* HEADER */}
          <div className="col-12 d-flex flex-column flex-md-row align-items-center position-relative header-section">
            <img
              className="logo mb-3 mb-md-0"
              src={theme === "dark" ? "/Gold_logo.png" : "/Orange_logo.png"}
              style={{ height: "97px" }}
              alt="logo"
            />
            <div className="flex-grow-1 text-center">
              <p
                className="h1 fw-bold m-0 text-center w-100"
                style={{ fontFamily: "Poppins", color: "var(--primary-color)" }}
              >
                Ticket Generation
              </p>
            </div>
          </div>

          <div className="main-container row w-100 m-0">
            {/* LOGIN FORM */}
            <div className="col-12 col-lg-4 d-flex justify-content-center align-items-center">
              <form onSubmit={handlelogin} className="login_card shadow w-100 mx-auto">

                <p className="h5 fw-bold text-center mb-4" style={{ color: "var(--primary-color)", fontFamily: "'Poppins', !important", fontWeight: "bold" }}>LOGIN</p>

                {/* API ERROR */}
                {errors.apiError && (
                  <div className="alert alert-danger text-center py-2">
                    {errors.apiError}
                  </div>
                )}

                {/* INFO MESSAGE */}
                {infoMsg && (
                  <div className="alert alert-info text-center py-2">
                    {infoMsg}
                  </div>
                )}

                {/* ID FIELD */}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person-fill text-primary"></i>
                    </span>
                    <input
                      autoComplete="username"
                      type="text"
                      className="form-control"
                      placeholder="ID"
                      value={loginFormdata.id}
                      onChange={handlechange}
                      name="id"
                    />
                  </div>
                  {errors.id && (
                    <small className="text-danger">{errors.id}</small>
                  )}
                </div>

                {/* PASSWORD FIELD */}
                <div className="mb-2">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock-fill text-danger"></i>
                    </span>
                    <input
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Password"
                      value={loginFormdata.password}
                      onChange={handlechange}
                      name="password"
                    />
                    <span
                      className="input-group-text cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer" }}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-secondary`}></i>
                    </span>
                  </div>
                  {errors.password && (
                    <small className="text-danger">{errors.password}</small>
                  )}
                </div>

                {/* FORGOT PASSWORD TEXT */}
                <div className="text-end mb-3">
                  <span
                    role="button"
                    className="small fw-semibold"
                    style={{ color: "var(--primary-color)", cursor: "pointer" }}
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot Password?
                  </span>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  className="submit"
                  disabled={submitting}
                >
                  {submitting ? "Logging in..." : "LOGIN"}
                </button>

                <p className="mt-4 text-center">
                  Don't have an account?{" "}
                  <span
                    role="button"
                    tabIndex={0}
                    className="fw-bold cursor-pointer"
                    onClick={handleNoAccount}
                    style={{ color: "var(--primary-color)" }}
                  >
                    Signup
                  </span>
                </p>
              </form>
            </div>

            {/* RIGHT SIDE IMAGES */}
            <div className="col-12 col-lg-6 d-flex justify-content-center align-items-center d-none d-lg-flex">
              <img src={theme === "dark" ? "/allserv-dark2.png" : "/allserv.png"} className="img-fluid" style={{ maxWidth: "80%" }} alt="illustration" />
            </div>

            <div className="col-lg-2 d-none d-lg-block">
              <img src={theme === "dark" ? "/Circle_Gold.png" : "/Circle_Orange.png"} className="sidelogo" alt="side logo" />
            </div>
          </div>

        </div>
      </div>

      <div className="auth-footer">
        <p>
          Designed & Developed by{" "}
          <span className="brand">IT Applications</span>
        </p>
      </div>
    </div>
  );
}

export default Login;