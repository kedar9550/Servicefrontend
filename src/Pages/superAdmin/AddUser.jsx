import { useState } from "react";
import Loader from "../../Components/Loader";
import API from '../../api/axios';
import { toast } from "react-toastify";

export default function AddUser() {

  const [formData, setFormData] = useState({
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [verifiedFields, setVerifiedFields] = useState({});

  const togglePassword = () => setShowPassword(prev => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword(prev => !prev);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "role") {
      setFormData({
        role: value,
        id: '',
        fullname: '',
        department: '',
        designation: value === "Student" ? "Student" : "",
        email: '',
        phone: '',
        password: 'Aditya@123',
        confirmPassword: 'Aditya@123'
      });
      setVerifiedFields({});
      setIsAutoFilled(false);
      return;
    }

    if (name === "phone") {
        value = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "email") {
        value = value.toLowerCase();
    }

    if (["id", "phone", "email", "password", "confirmPassword"].includes(name)) {
        value = value.replace(/\s+/g, "");
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = async () => {
    if (!formData.id) {
        setIsAutoFilled(false);
        setVerifiedFields({});
        return;
    }

    try {
        const res = await API.post("/api/auth/get-ecap-data", {
            institutionId: formData.id,
            role: formData.role,
        });

        const data = res.data;

        if (!data || data.error) {
            setIsAutoFilled(false); 
            setVerifiedFields({});
            return;
        }

        if (formData.role === "Employee") {
            const autoData = {
                fullname: data?.employeename?.trim() || "",
                department: data?.departmentname || "",
                designation: data?.designation || "",
                phone: data?.mobileno || "",
            };

            setFormData((prev) => ({ ...prev, ...autoData }));

            const verified = {};
            Object.keys(autoData).forEach(key => { if (autoData[key]) verified[key] = true; });
            setVerifiedFields(verified);

        } else {
            const autoData = {
                fullname: data?.studentname?.trim() || "",
                department: data?.branch || "",
                designation: 'Student',
                phone: data?.mobilenumber || "",
                email: data?.emailid || "",
            };

            setFormData((prev) => ({ ...prev, ...autoData }));

            const verified = {};
            Object.keys(autoData).forEach(key => { if (autoData[key]) verified[key] = true; });
            setVerifiedFields(verified);
        }

        setIsAutoFilled(true); 

    } catch (err) {
        console.error("ECAP Error:", err);
        setIsAutoFilled(false); 
        setVerifiedFields({});
    }
  };

  const validate = () => {
    let errs = "";
    if (formData.password?.length < 6) errs = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) errs = "Passwords do not match";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs = "Invalid email format";
    if (!/^[6-9]\d{9}$/.test(formData.phone)) errs = "Enter valid Indian mobile number";
    
    if (errs) {
      setError(errs);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!validate()) return;

    setLoading(true);

    const payload = {
        fullname: formData.fullname,
        id: formData.id,
        department: formData.department,
        designation: formData.designation,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.role 
    };

    try {
      await API.post("api/auth/register", payload);
      
      toast.success("User Created Successfully 🎉");

      setFormData({
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
      setVerifiedFields({});
      setIsAutoFilled(false);

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {loading && <Loader />}
      <h3 className="fw-bold mb-4">Add New User</h3>

      <div className="card shadow-sm border-0 rounded-4 p-4">
        <form onSubmit={handleSubmit} autoComplete="off">

          {/* Role Selection */}
          <div className="mb-4 d-flex gap-4">
            {["Student", "Employee"].map(r => (
              <label key={r} className="form-check cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={formData.role === r}
                  onChange={handleChange}
                  className="form-check-input"
                />
                <span className="ms-2">{r}</span>
              </label>
            ))}
          </div>

          <div className="row g-3">
            {/* ID */}
            <div className="col-md-6 mb-2">
              <label className="form-label">{formData.role === "Student" ? "Roll No" : "Emp ID"}</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person-fill text-primary"></i></span>
                <input
                  type="text"
                  className="form-control"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </div>
            </div>

            {/* Fullname */}
            <div className="col-md-6 mb-2">
              <label className="form-label">Full Name</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person-badge-fill text-primary"></i></span>
                <input
                  type="text"
                  className="form-control"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  disabled={verifiedFields.fullname}
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div className="col-md-6 mb-2">
              <label className="form-label">Department</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-building-fill text-primary"></i></span>
                <input
                  type="text"
                  className="form-control"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={verifiedFields.department}
                  required
                />
              </div>
            </div>

            {/* Designation */}
            <div className="col-md-6 mb-2">
              <label className="form-label">Designation</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className={`bi ${formData.role === "Student" ? "bi-mortarboard-fill" : "bi-person-workspace"} text-primary`}></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  disabled={verifiedFields.designation}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="col-md-6 mb-2">
              <label className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope-fill text-primary"></i></span>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={verifiedFields.email}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="col-md-6 mb-2">
              <label className="form-label">Phone</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-phone-fill text-primary"></i></span>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={verifiedFields.phone}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="col-md-6 mb-2">
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock-fill text-danger"></i></span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="btn btn-outline-secondary" onClick={togglePassword}>
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="col-md-6 mb-2">
              <label className="form-label">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock-fill text-danger"></i></span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="btn btn-outline-secondary" onClick={toggleConfirmPassword}>
                  <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <div className="mt-4 text-end">
            <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}