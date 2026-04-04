import React, { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import Footer from "../../Components/Footer";

const ForgotPassword = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [empid, setEmpid] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastDigits, setLastDigits] = useState("");

  // ---------------- SEND OTP ----------------
  const sendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!empid) {
      setMessage("Please enter your Employee ID.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/api/auth/forgot-password", { institutionId: empid });

      setMessage(res.data?.message || "OTP sent successfully.");
      setLastDigits(res.data?.lastDigits || "");
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Employee ID not found or not authorized.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- VERIFY OTP ----------------
  const verifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp) {
      setMessage("Please enter OTP.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/api/auth/verify-otp", {
        institutionId: empid,
        otp,
      });

      setMessage(res.data?.message || "OTP verified successfully.");
      setStep(3);
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CHANGE PASSWORD ----------------
  const changePassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setMessage("Please fill all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/api/auth/reset-password", {
        institutionId: empid,
        otp,
        newPassword,
      });

      setMessage(res.data?.message || "Password changed successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg_container d-flex flex-column" style={{ height: "100vh", overflow: "hidden" }}>
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


          <div className="main-container flex-grow-1 row w-100 m-0 p-0">
            {/* FORGOT PASSWORD FORM */}
            <div className="col-12 col-lg-4 d-flex justify-content-center align-items-center">
              <form className="login_card shadow w-100 mx-auto">
                <p className="h5 fw-bold text-center mb-4 " style={{ color: "var(--primary-color)", fontFamily: "'Poppins', !important", fontWeight: "bold" }}>FORGOT PASSWORD</p>
                {/* STEP 1 – EMAIL */}
                {step === 1 && (
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
                    <button onClick={sendOtp} disabled={loading} className="submit">
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </>
                )}

                {/* STEP 2 – OTP */}
                {step === 2 && (
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
                    <button onClick={verifyOtp} disabled={loading} className="submit">
                      {loading ? "Verifying..." : "Verify"}
                    </button>
                  </>
                )}

                {/* STEP 3 – NEW PASSWORD */}
                {step === 3 && (
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
                    <button onClick={changePassword} disabled={loading} className="submit">
                      {loading ? "Changing..." : "Change Password"}
                    </button>
                  </>
                )}

                {message && <p className="message">{message}</p>}
              </form>
            </div>
            {/* RIGHT SIDE IMAGES */}
            <div className="col-12 col-lg-7 d-flex justify-content-center align-items-center d-none d-lg-flex">
              <img src="/forget_illustration1.png" className="forget_img" style={{ maxWidth: "55%" }} alt="illustration" />
            </div>

            <div className="col-lg-1 d-none d-lg-block">
              <img src={theme === "dark" ? "/Circle_Gold.png" : "/Circle_Orange.png"} className="sidelogo" alt="side logo" />
            </div>
          </div>




        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;