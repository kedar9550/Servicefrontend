import { useState } from "react";
import API from '../../api/axios.js'


function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      return setError("New passwords do not match");
    }

    try {
      setLoading(true);

      const res = await API.put(
        "/api/auth/change-password",
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }
      );

      setMessage(res.data.message);
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "90vh", paddingTop: "60px" }}
    >
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "450px" }}>
        <h4 className="text-center mb-4">Change Password</h4>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Old Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              onChange={() => setShowPassword(!showPassword)}
              id="showPass"
            />
            <label className="form-check-label" htmlFor="showPass">
              Show Password
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
