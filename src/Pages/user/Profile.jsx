import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";

function Profile() {

  const { user, updateUser, getPrimaryRole } = useAuth();

  const [formData, setFormData] = useState({
    fullname: "",
    id: "",
    department: "",
    designation: "",
    email: "",
    phone: "",
    role: getPrimaryRole()
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);


  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.name || "",
        id: user.institutionId || "",
        department: user.department || "",
        designation: user.designation || "",
        email: user.email || "",
        phone: user.phone || "",
        role: getPrimaryRole() || ""
      });
      if (user.profileImage) {
        setImagePreview(`${import.meta.env.VITE_BACKEND_URL}/uploads/profile/${user.profileImage}?v=${Date.now()}`);
      } else if (user.institutionId) {
        setImagePreview(`https://info.aec.edu.in/aec/employeephotos/${user.institutionId}.jpg`);
      } else {
        setImagePreview(null);
      }
    }


  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await API.post(
        "/api/auth/profile-change",
        formData
      );

      setImagePreview(`${import.meta.env.VITE_BACKEND_URL}/uploads/profile/${res.data.image}?v=${Date.now()}`);

      // VERY IMPORTANT
      updateUser({ profileImage: res.data.image });

      setSelectedFile(null);

    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert("Image upload failed: " + (err.response?.data?.message || err.message || "Unknown error"));
    }
  };



  // Validation
  const validate = () => {
    let newErrors = {};

    if (!formData.fullname.trim())
      newErrors.fullname = "Full name required";

    if (!formData.id.trim())
      newErrors.id = "ID required";

    if (!formData.department.trim())
      newErrors.department = "Department required";

    if (!/^[6-9]\d{9}$/.test(formData.phone))
      newErrors.phone = "Enter valid Indian mobile number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      await API.put("/api/auth/update-profile", {
        name: formData.fullname,
        institutionId: formData.id,
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone
      });

      alert("Profile Updated Successfully");

    } catch (err) {
      setErrors({
        apiError: err.response?.data?.message || "Update failed"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row">

        {/* LEFT SIDE USER SUMMARY */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm p-4 text-center">
            <div className="text-center">

              <div style={{ position: "relative", display: "inline-block" }}>

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="profile"
                    onError={() => setImagePreview(null)}
                    className="rounded-circle shadow"
                    style={{ width: 120, height: 120, objectFit: "cover" }}
                  />

                ) : formData.fullname ? (
                  <div
                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center shadow"
                    style={{ width: 120, height: 120, fontSize: 40 }}
                  >
                    {formData.fullname?.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center shadow"
                    style={{ width: 120, height: 120, fontSize: 40 }}>
                    <i className="bi bi-person fs-1"></i>
                  </div>
                )}

                <label
                  className="btn btn-sm btn-light shadow"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    borderRadius: "50%"
                  }}
                >
                  <i className="bi bi-camera-fill fs-6 text-primary"></i>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>

              </div>

              {selectedFile && (
                <div className="mt-2">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleImageUpload}
                  >
                    Save Photo
                  </button>
                </div>
              )}
            </div>


            <h5 className="fw-bold mt-3">{formData.fullname}</h5>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="col-md-8">
          <div className="card shadow-sm p-4">
            <h4 className="mb-4">Edit Profile</h4>

            {errors.apiError &&
              <div className="alert alert-danger">
                {errors.apiError}
              </div>
            }

            <form onSubmit={handleSubmit}>

              <div className="row">

                <div className="col-md-6 mb-3">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    className="form-control"
                    disabled
                  />
                  {errors.fullname && <small className="text-danger">{errors.fullname}</small>}
                </div>

                <div className="col-md-6 mb-3">
                  <label>
                    Institution Id
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    className="form-control"
                    disabled
                  />
                  {errors.id && <small className="text-danger">{errors.id}</small>}
                </div>

                <div className="col-md-6 mb-3">
                  <label>
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    className="form-control"
                    disabled
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    className="form-control"
                    disabled
                  />
                  {errors.department && <small className="text-danger">{errors.department}</small>}
                </div>

                <div className="col-md-6 mb-3">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                  />
                  {errors.phone && <small className="text-danger">{errors.phone}</small>}
                </div>

                <div className="col-md-6 mb-3">
                  <label>Email</label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    className="form-control text-uppercase"
                    disabled
                  />
                </div>

              </div>

              <div className="text-end mt-3">
                <button
                  type="submit"
                  className="btn px-4"
                  style={{ backgroundColor: "#00306e", color: "#fff" }}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
