import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";
import API from "../../api/axios";
import Footer from "../../Components/Footer";
import goldLogo from "../../assets/Gold_logo.png";
import orangeLogo from "../../assets/Orange_logo.png";
import allServDark from "../../assets/allserv-dark2.png";
import allServ from "../../assets/allserv.png";
import circleGold from "../../assets/Circle_Gold.png";
import circleOrange from "../../assets/Circle_Orange.png";
import forgetIllustration from "../../assets/forget_illustration1.png";

function AuthenticationModule() {
  const { login, signup, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode state: true = login, false = signup
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");

  // Sync isLogin state with the pathname if it changes
  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // ==========================================
  // LOGIN STATE & HANDLERS
  // ==========================================
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [infoMsg, setInfoMsg] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginFormdata, setLoginFormdata] = useState({
    id: "",
    password: "",
  });

  const handleLoginChange = (e) => {
    let { name, value } = e.target;
    value = value.replace(/\s/g, "");

    setLoginFormdata((prev) => ({
      ...prev,
      [name]: value,
    }));

    setLoginErrors({});
    setInfoMsg("");
  };

  const validateLogin = () => {
    let newErrors = {};

    if (!loginFormdata.id.trim()) {
      newErrors.id = "ID is required";
    }

    if (!loginFormdata.password) {
      newErrors.password = "Password is required";
    }

    setLoginErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlelogin = async (e) => {
    e.preventDefault();

    if (loginSubmitting) return;
    if (!validateLogin()) return;

    setLoginSubmitting(true);

    try {
      await login(loginFormdata);
    } catch (err) {
      console.error("Login Component Caught Error:", err);
      toast.error("Incorrect username or password");
      setLoginErrors({ apiError: "Incorrect username or password" });
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleNoAccount = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  // ==========================================
  // SIGNUP STATE & HANDLERS
  // ==========================================
  const [signupFormdata, setSignupFormdata] = useState({
    role: "Employee",
    id: "",
    fullname: "",
    department: "",
    designation: "",
    email: "",
    phone: "",
    password: "Aditya@123",
    confirmPassword: "Aditya@123",
  });

  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [signupErrors, setSignupErrors] = useState({});
  const [idStatus, setIdStatus] = useState("");
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [verifiedFields, setVerifiedFields] = useState({});
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateSignup = () => {
    let newErrors = {};

    if (!signupFormdata.id.trim()) newErrors.id = "ID is required";
    if (!signupFormdata.fullname.trim()) newErrors.fullname = "Full name is required";
    if (!signupFormdata.department) newErrors.department = "Department is required";

    if (!signupFormdata.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupFormdata.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!signupFormdata.phone) {
      newErrors.phone = "Phone number required";
    } else if (!/^[6-9]\d{9}$/.test(signupFormdata.phone)) {
      newErrors.phone = "Enter valid Indian mobile number";
    }

    if (!signupFormdata.designation) newErrors.designation = "Designation is required";

    if (!signupFormdata.password) {
      newErrors.password = "Password required";
    } else if (signupFormdata.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!signupFormdata.confirmPassword) {
      newErrors.confirmPassword = "Confirm password required";
    } else if (signupFormdata.confirmPassword !== signupFormdata.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setSignupErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupChange = (e) => {
    let { name, value } = e.target;

    if (name === "role") {
      setSignupFormdata({
        role: value,
        id: "",
        fullname: "",
        department: "",
        designation: value === "Student" ? "Student" : "",
        email: "",
        phone: "",
        password: "Aditya@123",
        confirmPassword: "Aditya@123",
      });
      return;
    }

    if (name === "phone") {
      value = value.replace(/\D/g, "");
      value = value.slice(0, 10);
    }

    if (name === "email") {
      value = value.toLowerCase();
    }

    if (["id", "phone", "email", "password", "confirmPassword"].includes(name)) {
      value = value.replace(/\s+/g, "");
    }

    if (name === "id") {
      setIdStatus("");
      setSignupErrors((prev) => ({ ...prev, id: null }));
    }

    setSignupFormdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (signupSubmitting) return;

    const isValid = validateSignup();
    if (!isValid) return;

    setSignupSubmitting(true);
    setSignupErrors({});

    const payload = {
      fullname: signupFormdata.fullname,
      id: signupFormdata.id,
      department: signupFormdata.department,
      designation: signupFormdata.designation,
      email: signupFormdata.email,
      phone: signupFormdata.phone,
      password: signupFormdata.password,
      userType: signupFormdata.role,
    };

    try {
      await signup(payload);
      toast.success("signup successfully you can login now");

      setSignupFormdata({
        role: "Employee",
        id: "",
        fullname: "",
        department: "",
        designation: "",
        email: "",
        phone: "",
        password: "Aditya@123",
        confirmPassword: "Aditya@123",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Try again.";
      toast.error(message);
    } finally {
      setSignupSubmitting(false);
    }
  };

  const handleBlur = async () => {
    if (!signupFormdata.id) {
      setIsAutoFilled(false);
      setVerifiedFields({});
      setIdStatus("");
      return;
    }

    setIdStatus("checking");

    try {
      const res = await API.post("/api/auth/get-ecap-data", {
        institutionId: signupFormdata.id,
        role: signupFormdata.role,
      });

      const data = res.data;

      if (!data || data.error) {
        setIsAutoFilled(false);
        setVerifiedFields({});
        setIdStatus("invalid");
        setSignupErrors((prev) => ({ ...prev, id: "Invalid ID" }));
        return;
      }

      if (signupFormdata.role === "Employee") {
        const autoData = {
          fullname: data?.employeename?.trim() || "",
          department: data?.departmentname || "",
          designation: data?.designation || "",
          phone: data?.mobileno || "",
        };

        setSignupFormdata((prev) => ({
          ...prev,
          ...autoData,
        }));

        const verified = {};
        Object.keys(autoData).forEach((key) => {
          if (autoData[key]) verified[key] = true;
        });
        setVerifiedFields(verified);
      } else {
        const autoData = {
          fullname: data?.studentname?.trim() || "",
          department: data?.branch || "",
          designation: "Student",
          phone: data?.mobilenumber || "",
          email: data?.emailid || "",
        };

        setSignupFormdata((prev) => ({
          ...prev,
          ...autoData,
        }));

        const verified = {};
        Object.keys(autoData).forEach((key) => {
          if (autoData[key]) verified[key] = true;
        });
        setVerifiedFields(verified);
      }

      setIsAutoFilled(true);
      setIdStatus("valid");
      setSignupErrors((prev) => ({ ...prev, id: null }));
    } catch (err) {
      console.error(err);
      setIsAutoFilled(false);
      setVerifiedFields({});
      setIdStatus("invalid");
      setSignupErrors((prev) => ({ ...prev, id: "Invalid ID" }));
    }
  };

  const handleRegisteredUser = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  // ==========================================
  // FORGOT PASSWORD STATE & HANDLERS
  // ==========================================
  const [forgotStep, setForgotStep] = useState(1);
  const [empid, setEmpid] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [lastDigits, setLastDigits] = useState("");

  const sendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!empid) {
      setForgotMessage("Please enter your Employee ID.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotMessage("");

      const res = await API.post("/api/auth/forgot-password", { institutionId: empid });

      setForgotMessage(res.data?.message || "OTP sent successfully.");
      setLastDigits(res.data?.lastDigits || "");
      setForgotStep(2);
    } catch (err) {
      setForgotMessage(err.response?.data?.message || "Employee ID not found or not authorized.");
    } finally {
      setForgotLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp) {
      setForgotMessage("Please enter OTP.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotMessage("");

      const res = await API.post("/api/auth/verify-otp", {
        institutionId: empid,
        otp,
      });

      setForgotMessage(res.data?.message || "OTP verified successfully.");
      setForgotStep(3);
    } catch (err) {
      setForgotMessage(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  const changePassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setForgotMessage("Please fill all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setForgotMessage("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotMessage("Passwords do not match.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotMessage("");

      const res = await API.post("/api/auth/reset-password", {
        institutionId: empid,
        otp,
        newPassword,
      });

      setForgotMessage(res.data?.message || "Password changed successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setForgotMessage(err.response?.data?.message || "Something went wrong.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="bg_container d-flex flex-column" style={{ minHeight: "100vh", overflowX: "hidden" }}>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row align-items-center position-relative header-section w-100">
        <img
          className="logo mb-3 mb-md-0"
          src={theme === "dark" ? goldLogo : orangeLogo}
          style={{ height: "97px" }}
          alt="logo"
        />
        <div className="flex-grow-1 text-center">
          <p
            className="h1 fw-bold m-0 text-center w-100"
            style={{ fontFamily: "Poppins", color: "var(--primary-color)" }}
          >
            Digital Services
          </p>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="main-container flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="container-fluid p-0">
          <div className="row m-0 w-100 align-items-center justify-content-center">

            {location.pathname === "/login" ? (
              <>
                {/* LOGIN FORM */}
                <div className="col-12 col-lg-4 d-flex justify-content-center align-items-center">
                  <form onSubmit={handlelogin} className="login_card shadow w-100 mx-auto" style={{ marginTop: 0 }}>
                    <p className="h5 fw-bold text-center mb-4" style={{ color: "var(--primary-color)", fontFamily: "'Poppins', !important", fontWeight: "bold" }}>LOGIN</p>

                    {/* API ERROR */}
                    {loginErrors.apiError && (
                      <div className="alert alert-danger text-center py-2">
                        {loginErrors.apiError}
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
                          onChange={handleLoginChange}
                          name="id"
                        />
                      </div>
                      {loginErrors.id && (
                        <small className="text-danger">{loginErrors.id}</small>
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
                          type={showLoginPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="Password"
                          value={loginFormdata.password}
                          onChange={handleLoginChange}
                          name="password"
                        />
                        <span
                          className="input-group-text cursor-pointer"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          style={{ cursor: "pointer" }}
                        >
                          <i className={`bi ${showLoginPassword ? "bi-eye-slash" : "bi-eye"} text-secondary`}></i>
                        </span>
                      </div>
                      {loginErrors.password && (
                        <small className="text-danger">{loginErrors.password}</small>
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
                      disabled={loginSubmitting}
                    >
                      {loginSubmitting ? "Logging in..." : "LOGIN"}
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
                  <img src={theme === "dark" ? allServDark : allServ} className="img-fluid" style={{ maxWidth: "80%" }} alt="illustration" />
                </div>

                <div className="col-lg-2 d-none d-lg-block">
                  <img src={theme === "dark" ? circleGold : circleOrange} className="sidelogo" alt="side logo" />
                </div>
              </>
            ) : location.pathname === "/signup" ? (
              <>
                {/* SIGNUP FORM */}
                <div className="col-12 col-lg-8 d-flex justify-content-center align-items-center">
                  <div className="signup_card shadow w-100 mx-auto" style={{ margin: "20px auto" }}>
                    <p className="h5 fw-bold text-center mt-2 mb-4" style={{ color: "var(--primary-color)", fontFamily: "'Poppins', !important", fontWeight: "bold" }}>SIGNUP</p>
                    <hr />

                    <form onSubmit={handleSignup} autoComplete="off">
                      <div className="mb-4">
                        <div className="input-group">
                          <label className={`role-option mx-auto ${signupFormdata.role === 'Student' ? 'active' : ''}`}>
                            <input
                              type="radio"
                              value='Student'
                              checked={signupFormdata.role === "Student"}
                              onChange={handleSignupChange}
                              name='role'
                            />
                            Student
                          </label>

                          <label className={`role-option mx-auto ${signupFormdata.role === 'Employee' ? 'active' : ''}`}>
                            <input
                              type="radio"
                              value='Employee'
                              checked={signupFormdata.role === "Employee"}
                              onChange={handleSignupChange}
                              name='role'
                            />
                            Employee
                          </label>
                        </div>
                      </div>

                      <div className="row">
                        {/* ID */}
                        <div className="col-md-6 mb-4">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-person-fill text-primary"></i>
                            </span>
                            <input
                              autoComplete="id"
                              onChange={handleSignupChange}
                              value={signupFormdata.id}
                              name="id"
                              type="text"
                              className={`form-control ${idStatus === "valid" ? "is-valid" : idStatus === "invalid" ? "is-invalid" : ""}`}
                              required
                              onBlur={handleBlur}
                              placeholder={
                                signupFormdata.role === "Student" ? "Roll No" : "Emp_ID"
                              }
                            />
                            {idStatus === "checking" && (
                              <span className="input-group-text bg-transparent border-start-0">
                                <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span>
                              </span>
                            )}
                          </div>
                          {signupErrors.id && <small className="text-danger mt-1 d-block">{signupErrors.id}</small>}
                          {idStatus === "valid" && !signupErrors.id && <small className="text-success mt-1 d-block">Valid ID</small>}
                        </div>

                        {/* Fullname */}
                        <div className="col-md-6 mb-4">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-person-badge-fill text-primary"></i>
                            </span>
                            <input
                              autoComplete="name"
                              onChange={handleSignupChange}
                              value={signupFormdata.fullname}
                              name="fullname"
                              type="text"
                              className="form-control"
                              placeholder="FullName"
                              required
                              disabled={verifiedFields.fullname}
                            />
                          </div>
                          {signupErrors.fullname && (
                            <small className="text-danger">{signupErrors.fullname}</small>
                          )}
                        </div>

                        {/* Department */}
                        <div className="col-md-6 mb-4">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-building-fill text-primary"></i>
                            </span>
                            <input
                              autoComplete="department"
                              onChange={handleSignupChange}
                              value={signupFormdata.department}
                              name="department"
                              type="text"
                              className="form-control"
                              required
                              placeholder='Department'
                              disabled={verifiedFields.department}
                            />
                          </div>
                          {signupErrors.department && (
                            <small className="text-danger">{signupErrors.department}</small>
                          )}
                        </div>

                        {/* Designation */}
                        <div className="col-md-6 mb-4">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className={`bi ${signupFormdata.role === "Student"
                                ? "bi-mortarboard-fill"
                                : "bi-person-workspace"} text-primary`}></i>
                            </span>
                            <input
                              name="designation"
                              value={signupFormdata.designation}
                              onChange={handleSignupChange}
                              disabled={verifiedFields.designation}
                              className="form-control"
                              placeholder="Designation"
                            />
                          </div>
                          {signupErrors.designation && (
                            <small className="text-danger">{signupErrors.designation}</small>
                          )}
                        </div>

                        {/* Email */}
                        <div className="col-md-6 mb-4">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-envelope-fill text-primary"></i>
                            </span>
                            <input
                              autoComplete="email"
                              onChange={handleSignupChange}
                              value={signupFormdata.email}
                              name="email"
                              type="text"
                              className="form-control"
                              placeholder="Email"
                              required
                              disabled={verifiedFields.email}
                            />
                          </div>
                          {signupErrors.email && (
                            <small className="text-danger">{signupErrors.email}</small>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="col-md-6 mb-4">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-phone-fill text-primary"></i>
                            </span>
                            <input
                              autoComplete="tel"
                              onChange={handleSignupChange}
                              value={signupFormdata.phone}
                              name="phone"
                              type="text"
                              className="form-control"
                              placeholder="Phone Number"
                              required
                              disabled={verifiedFields.phone}
                            />
                          </div>
                          {signupErrors.phone && (
                            <small className="text-danger">{signupErrors.phone}</small>
                          )}
                        </div>

                        {/* Password */}
                        <div className="col-md-6 mb-4">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-lock-fill text-danger"></i>
                            </span>
                            <input
                              autoComplete="new-password"
                              onChange={handleSignupChange}
                              value={signupFormdata.password}
                              name="password"
                              type={showSignupPassword ? "text" : "password"}
                              className="form-control"
                              placeholder="Password"
                              required
                            />
                            <span
                              className="input-group-text cursor-pointer"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              style={{ cursor: "pointer" }}
                            >
                              <i className={`bi ${showSignupPassword ? "bi-eye-slash" : "bi-eye"} text-secondary`}></i>
                            </span>
                          </div>
                          {signupErrors.password && (
                            <small className="text-danger">{signupErrors.password}</small>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="col-md-6 mb-4">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-lock-fill text-danger"></i>
                            </span>
                            <input
                              autoComplete="new-password"
                              onChange={handleSignupChange}
                              value={signupFormdata.confirmPassword}
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              className="form-control"
                              placeholder="Confirm Password"
                              required
                            />
                            <span
                              className="input-group-text cursor-pointer"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              style={{ cursor: "pointer" }}
                            >
                              <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"} text-secondary`}></i>
                            </span>
                          </div>
                          {signupErrors.confirmPassword && (
                            <small className="text-danger">
                              {signupErrors.confirmPassword}
                            </small>
                          )}
                        </div>
                      </div>

                      <button className="submit" disabled={signupSubmitting}>
                        {signupSubmitting ? "Creating Account..." : "Submit"}
                      </button>
                    </form>
                    <p className='mt-2 mb-0 text-center'>Already have an account ?   <span role="button"
                      tabIndex={0} onClick={handleRegisteredUser} className='fw-bold cursor-pointer mb-0' style={{ color: "var(--primary-color)" }}>Login</span></p>
                  </div>
                </div>

                <div className="signup_page col-lg-4 d-none d-lg-block">
                  <img src={theme === "dark" ? circleGold : circleOrange} className="sidelogo" alt="side logo" />
                </div>
              </>
            ) : (
              <>
                {/* FORGOT PASSWORD FORM */}
                <div className="col-12 col-lg-4 d-flex justify-content-center align-items-center">
                  <form onSubmit={(e) => e.preventDefault()} className="login_card shadow w-100 mx-auto" style={{ marginTop: 0 }}>
                    <p className="h5 fw-bold text-center mb-4 " style={{ color: "var(--primary-color)", fontFamily: "'Poppins', !important", fontWeight: "bold" }}>FORGOT PASSWORD</p>

                    {/* STEP 1 – EMAIL */}
                    {forgotStep === 1 && (
                      <>
                        <div className="mb-2">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-person-badge-fill text-primary"></i>
                            </span>
                            <input
                              type="text"
                              placeholder="Enter Employee ID or Student ID"
                              className="form-control"
                              name="empid"
                              value={empid}
                              onChange={(e) => setEmpid(e.target.value)}
                            />
                          </div>
                        </div>
                        <button onClick={sendOtp} disabled={forgotLoading} className="submit">
                          {forgotLoading ? "Sending..." : "Send OTP"}
                        </button>
                      </>
                    )}

                    {/* STEP 2 – OTP */}
                    {forgotStep === 2 && (
                      <>
                        {lastDigits && <p className="text-muted small text-center mb-2">OTP sent to registered mobile ending in ******{lastDigits}</p>}
                        <div className="mb-2">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-shield-lock-fill text-success"></i>
                            </span>
                            <input
                              type="text"
                              placeholder="Enter OTP"
                              className="form-control"
                              name="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                            />
                          </div>
                        </div>
                        <button onClick={verifyOtp} disabled={forgotLoading} className="submit">
                          {forgotLoading ? "Verifying..." : "Verify"}
                        </button>
                      </>
                    )}

                    {/* STEP 3 – NEW PASSWORD */}
                    {forgotStep === 3 && (
                      <>
                        <div className="mb-2">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-lock-fill text-success"></i>
                            </span>
                            <input
                              type="password"
                              placeholder="New Password"
                              value={newPassword}
                              className="form-control"
                              name="password"
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-lock-fill text-success"></i>
                            </span>
                            <input
                              type="password"
                              placeholder="Confirm Password"
                              value={confirmPassword}
                              className="form-control"
                              name="password"
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </div>
                        </div>
                        <button onClick={changePassword} disabled={forgotLoading} className="submit">
                          {forgotLoading ? "Changing..." : "Change Password"}
                        </button>
                      </>
                    )}

                    {forgotMessage && <p className="message text-center mt-2" style={{ color: "var(--danger-color)" }}>{forgotMessage}</p>}

                    <p className="mt-4 text-center">
                      Remember your password?{" "}
                      <span
                        role="button"
                        tabIndex={0}
                        className="fw-bold cursor-pointer"
                        onClick={() => navigate("/login")}
                        style={{ color: "var(--primary-color)" }}
                      >
                        Login
                      </span>
                    </p>
                  </form>
                </div>

                {/* RIGHT SIDE IMAGES */}
                <div className="col-12 col-lg-7 d-flex justify-content-center align-items-center d-none d-lg-flex">
                  <img src={forgetIllustration} className="forget_img" style={{ maxWidth: "55%" }} alt="illustration" />
                </div>

                <div className="col-lg-1 d-none d-lg-block">
                  <img src={theme === "dark" ? circleGold : circleOrange} className="sidelogo" alt="side logo" />
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AuthenticationModule;