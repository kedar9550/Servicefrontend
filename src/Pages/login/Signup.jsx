import { useNavigate } from "react-router-dom";
import { useState } from 'react'
import React from 'react'
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from '../../api/axios';
import { useTheme } from "../../context/ThemeContext";

function Signup() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [signupFormdata, setSignupFormdata] = useState({
        role: 'Employee',
        id: '',
        fullname: '',
        department: '',
        designation: '',
        email: '',
        phone: '',
        password: 'Aditya@123',
        confirmPassword: 'Aditya@123'
    })

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const [verifiedFields, setVerifiedFields] = useState({}); // Track which fields were auto-filled
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegisteredUser = (e) => {
        e.preventDefault();
        navigate("/login");
    }

    const validate = () => {
        let newErrors = {};

        if (!signupFormdata.id.trim()) newErrors.id = "ID is required";

        if (!signupFormdata.fullname.trim()) newErrors.fullname = "Full name is required";

        if (!signupFormdata.department)
            newErrors.department = "Department is required";


        if (!signupFormdata.email.trim())
            newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupFormdata.email))
            newErrors.email = "Invalid email format";

        if (!signupFormdata.phone)
            newErrors.phone = "Phone number required";
        else if (!/^[6-9]\d{9}$/.test(signupFormdata.phone))
            newErrors.phone = "Enter valid Indian mobile number";

        if (!signupFormdata.designation)
            newErrors.designation = 'Designation is required'

        if (!signupFormdata.password)
            newErrors.password = "Password required";
        else if (signupFormdata.password.length < 6)
            newErrors.password = "Password must be at least 6 characters";


        if (!signupFormdata.confirmPassword)
            newErrors.confirmPassword = "Confirm password required";
        else if (signupFormdata.confirmPassword !== signupFormdata.password)
            newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "role") {


            setSignupFormdata({
                role: value,
                id: '',
                fullname: '',
                department: '',
                designation: value === "Student" ? "Student" : "",
                email: '',
                phone: '',
                password: 'Aditya@123',
                confirmPassword: 'Aditya@123'

            })
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

        setSignupFormdata((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSignup = async (e) => {

        e.preventDefault();

        if (submitting) return;

        const isValid = validate();
        if (!isValid) return;

        setSubmitting(true);
        setErrors({});

        const payload = {
            fullname: signupFormdata.fullname,
            id: signupFormdata.id,
            department: signupFormdata.department,
            designation: signupFormdata.designation,
            email: signupFormdata.email,
            phone: signupFormdata.phone,
            password: signupFormdata.password,
            userType: signupFormdata.role // Mapping role to userType
        };

        try {
            await signup(payload);

            toast.success("Signup successful. Please login");

            setSignupFormdata({
                role: "Employee",
                id: "",
                fullname: "",
                department: "",
                designation: "",
                email: "",
                phone: "",
                password: "Aditya@123",
                confirmPassword: "Aditya@123"
            });

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Something went wrong. Try again.";

            toast.error(message);
        }
        finally {
            setSubmitting(false);
        }
    };

    const handleBlur = async () => {
        if (!signupFormdata.id) {
            setIsAutoFilled(false);
            setVerifiedFields({});
            return;
        }

        try {
            const res = await API.post("/api/auth/get-ecap-data", {
                institutionId: signupFormdata.id,
                role: signupFormdata.role,
            });

            const data = res.data;

            if (!data || data.error) {
                setIsAutoFilled(false); // allow manual entry
                setVerifiedFields({});
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
                    ...autoData
                }));

                // Only lock fields that have non-empty data
                const verified = {};
                Object.keys(autoData).forEach(key => {
                    if (autoData[key]) verified[key] = true;
                });
                setVerifiedFields(verified);

            } else {
                const autoData = {
                    fullname: data?.studentname?.trim() || "",
                    department: data?.branch || "",
                    designation: 'Student',
                    phone: data?.mobilenumber || "",
                    email: data?.emailid || "",
                };

                setSignupFormdata((prev) => ({
                    ...prev,
                    ...autoData
                }));

                const verified = {};
                Object.keys(autoData).forEach(key => {
                    if (autoData[key]) verified[key] = true;
                });
                setVerifiedFields(verified);
            }

            setIsAutoFilled(true); // 

        } catch (err) {
            console.error(err);
            setIsAutoFilled(false); // allow manual entry
            setVerifiedFields({});
        }
    };

    return (
        <div className='bg_container d-flex flex-column'>
            <div className="container-fluid flex-grow-1">
                <div className="row">
                    <div className="col-12 d-flex flex-column flex-md-row align-items-center position-relative header-section ">
                        <img
                            className="logo mb-3 mb-md-0"
                            src={theme === "dark" ? "/Gold_logo.png" : "/Orange_logo.png"}
                            style={{ height: "97px" }}
                        />

                        <div className="flex-grow-1 text-center">
                            <p
                                className="h1 fw-bold m-0 w-100 text-center"
                                style={{ fontFamily: "Poppins", color: "var(--primary-color)" }}
                            >
                                Ticket Generation
                            </p>
                        </div>
                    </div>
                    <div className="col-12 col-lg-8 d-flex justify-content-center align-items-center">
                        <div className="signup_card shadow w-100 mx-auto">
                            <p className="h5 fw-bold text-center mt-2 mb-4" style={{ color: "var(--primary-color)", fontFamily: "'Poppins', !important", fontWeight: "bold" }}>SIGNUP</p>
                            <hr />


                            {/* {errors.apiError && (
                            <div className="alert alert-danger text-center py-2">
                                {errors.apiError}
                            </div>
                        )} */}

                            <form onSubmit={handleSignup} autoComplete="off">
                                <div className="mb-4">
                                    <div className="input-group">


                                        <label className={`role-option mx-auto ${signupFormdata.role === 'Student' ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                value='Student'
                                                checked={signupFormdata.role === "Student"}
                                                onChange={handleChange}
                                                name='role'

                                            />
                                            Student
                                        </label>

                                        <label className={`role-option mx-auto ${signupFormdata.role === 'Employee' ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                value='Employee'
                                                checked={signupFormdata.role === "Employee"}
                                                onChange={handleChange}
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
                                                onChange={handleChange}
                                                value={signupFormdata.id}
                                                name="id"
                                                type="text"
                                                className="form-control"
                                                required
                                                onBlur={handleBlur}
                                                placeholder={
                                                    signupFormdata.role === "Student" ? "Roll No" : "Emp_ID"
                                                }
                                            />
                                        </div>
                                        {errors.id && <small className="text-danger">{errors.id}</small>}
                                    </div>

                                    {/* Fullname */}
                                    <div className="col-md-6 mb-4">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-person-badge-fill text-primary"></i>
                                            </span>
                                            <input
                                                autoComplete="name"
                                                onChange={handleChange}
                                                value={signupFormdata.fullname}
                                                name="fullname"
                                                type="text"
                                                className="form-control"
                                                placeholder="FullName"
                                                required
                                                disabled={verifiedFields.fullname}
                                            />
                                        </div>
                                        {errors.fullname && (
                                            <small className="text-danger">{errors.fullname}</small>
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
                                                onChange={handleChange}
                                                value={signupFormdata.department}
                                                name="department"
                                                type="text"
                                                className="form-control"
                                                required
                                                placeholder='Department'
                                                disabled={verifiedFields.department}
                                            />

                                        </div>
                                        {errors.department && (
                                            <small className="text-danger">{errors.department}</small>
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
                                                onChange={handleChange}
                                                disabled={verifiedFields.designation}
                                                className="form-control"
                                                placeholder="Designation"

                                            />

                                        </div>
                                        {errors.designation && (
                                            <small className="text-danger">{errors.designation}</small>
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
                                                onChange={handleChange}
                                                value={signupFormdata.email}
                                                name="email"
                                                type="text"
                                                className="form-control"
                                                placeholder="Email"
                                                required
                                                disabled={verifiedFields.email}
                                            />
                                        </div>
                                        {errors.email && (
                                            <small className="text-danger">{errors.email}</small>
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
                                                onChange={handleChange}
                                                value={signupFormdata.phone}
                                                name="phone"
                                                type="text"
                                                className="form-control"
                                                placeholder="Phone Number"
                                                required
                                                disabled={verifiedFields.phone}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <small className="text-danger">{errors.phone}</small>
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
                                                onChange={handleChange}
                                                value={signupFormdata.password}
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                className="form-control"
                                                placeholder="Password"
                                                required
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

                                    {/* Confirm Password */}
                                    <div className="col-md-6 mb-4">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-lock-fill text-danger"></i>
                                            </span>
                                            <input
                                                autoComplete="new-password"
                                                onChange={handleChange}
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
                                        {errors.confirmPassword && (
                                            <small className="text-danger">
                                                {errors.confirmPassword}
                                            </small>
                                        )}
                                    </div>

                                </div>





                                <button className="submit" disabled={submitting}>
                                    {submitting ? "Creating Account..." : "Submit"}
                                </button>
                            </form>
                            <p className='mt-2 mb-0 text-center'>Already have an account ?   <span role="button"
                                tabIndex={0} onClick={handleRegisteredUser} className='fw-bold cursor-pointer mb-0' style={{ color: "var(--primary-color)" }}>Login</span></p>

                        </div>
                    </div>
                    <div className="signup_page col-lg-4 d-none d-lg-block">
                        <img src={theme === "dark" ? "/Circle_Gold.png" : "/Circle_Orange.png"} className="sidelogo" alt="side logo" />
                    </div>
                </div>
            </div>

            <div className="auth-footer pb-2" style={{ color: "var(--text-color)", fontSize: "14px", fontWeight: "500" }}>
                Designed and Developed by <span style={{ color: "var(--primary-color)" }}>IT Applications</span>
            </div>
        </div>
    )
}

export default Signup