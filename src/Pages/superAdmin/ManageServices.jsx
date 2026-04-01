import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/Loader";
import API from "../../api/axios";
import serviceIllustration from "../../assets/service_card_illustration.png";
import { Settings, UserPlus, Pencil, Trash2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ManageServices = () => {


  const navigate = useNavigate();
  const { theme } = useTheme();

  const [services, setServices] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: ""
  });

  //  Fetch Services with Stats
  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("api/service/stats");
      setServices(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Open Add Modal
  const handleAdd = () => {
    setIsEdit(false);
    setFormData({ name: "" });
    setShowModal(true);
  };

  // Open Edit Modal (Optional future API)
  const handleEdit = (service) => {
    setIsEdit(true);
    setCurrentId(service._id);
    setFormData({ name: service.name });
    setShowModal(true);
  };

  //  Save Service (Create / Update)
  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      setLoading(true);

      if (isEdit) {
        await API.put(`api/service/${currentId}`, formData);
      } else {
        console.log('service add triggerd', formData)
        await API.post("api/service/add", formData);
      }

      setShowModal(false);
      fetchServices();

    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Delete Service
  const deleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    try {
      setLoading(true);
      await API.delete(`api/service/${id}`);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">

      {loading && <Loader />}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <h2 className="fw-bold m-0 text-nowrap">Manage Services</h2>
        <button
          className="btn btn-primary rounded-pill d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm"
          onClick={handleAdd}
          style={{ width: "fit-content" }}
        >
          <Plus size={20} />
          Add New Service
        </button>
      </div>

      {/* Cards */}
      <div className="row g-4">
        {console.log('service', services)}
        {services.map(service => (
          <div key={service._id} className="col-md-6 col-lg-4">
            <div
              className="card stat-card-adaptive shadow-sm border-0 rounded-4 overflow-hidden h-100"
              style={{
                cursor: "pointer",
                transition: "transform 0.2s",
                backgroundImage: theme === 'dark' ? "url('/Service_card_bg_dark.png')" : "url('/Service_card_bg.png')",
                backgroundSize: "90% auto",
                backgroundPosition: "top center",
                backgroundRepeat: "no-repeat"
              }}
              onClick={() => navigate(`/super/service/${service._id}/admins`)}

              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >

              <div className="p-3 d-flex flex-column h-100">
                {/* Top Section: Icon and Illustration */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: 50, height: 50, backgroundColor: "var(--primary-color)" }}
                  >
                    <Settings className="text-white" size={26} />
                  </div>
                </div>

                {/* Service Name and Edit Icon */}
                <div className="d-flex align-items-center gap-2 mb-3 mt-3">
                  <h3 className="fw-bold m-0" style={{ color: "var(--text-color)" }}>{service.name}</h3>
                  <button
                    className="btn btn-link p-0 text-primary border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(service);
                    }}
                    title="Edit Service"
                  >
                    <Pencil size={18} />
                  </button>
                </div>

                {/* Admin Section */}
                <div className="d-flex align-items-center mb-3 p-2 px-3 rounded-pill shadow-sm border border-secondary" style={{ width: "fit-content", backgroundColor: "var(--input-bg)" }}>
                  <span className="fw-bold text-nowrap me-2 text-warning">Admin :</span>
                  <span className="text-truncate fw-semibold" style={{ color: "var(--text-color)" }}>
                    {service.admins?.length ? service.admins[0]?.name : "No Admin"}
                  </span>
                </div>

                <hr className="my-3 opacity-25" style={{ borderColor: "var(--border-color)" }} />

                {/* Stats Section */}
                <div className="row text-center mt-2">
                  <div className="col-6 border-end" style={{ borderColor: "var(--border-color)" }}>
                    <small className="text-muted fw-medium d-block mb-1">Total Tickets</small>
                    <h4 className="fw-bold m-0" style={{ color: "var(--primary-color)" }}>{service.totalTickets || 0}</h4>
                  </div>
                  <div className="col-6">
                    <small className="text-muted fw-medium d-block mb-1">Total Employees</small>
                    <h4 className="fw-bold m-0" style={{ color: "var(--info-color)" }}>{service.totalEmployees || 0}</h4>
                  </div>
                </div>

                {/* Removal of footer buttons as per user request */}
                <div className="mt-auto"></div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content rounded-4 border-0 shadow">

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {isEdit ? "Edit Service" : "Add New Service"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Service Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-outline-secondary rounded-pill"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary rounded-pill"
                  onClick={handleSave}
                >
                  {isEdit ? "Update Service" : "Create Service"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageServices;