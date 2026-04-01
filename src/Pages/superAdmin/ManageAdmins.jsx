import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";
import Loader from "../../Components/Loader";
import { Pencil, Trash2, ArrowLeft, Ticket } from "lucide-react";
import CommonTable from "../../Components/CommonTable";
import No_data from "../../Components/No_data";
import { getPriorityColor, getStatusColor } from "../../Components/StatusColors";

function ManageAdmins() {

  const navigate = useNavigate();
  const { serviceId } = useParams();
  //console.log(serviceId)

  const [loading, setLoading] = useState(false);

  const [serviceInfo, setServiceInfo] = useState(null);
  const [admins, setAdmins] = useState([]);

  const [search, setSearch] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [notFound, setNotFound] = useState(false);

  // New states for Remove Confirmation Modal
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState(null);

  const [serviceTickets, setServiceTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  /* ===============================
     FETCH CURRENT ADMINS
  =================================*/
  const fetchAdmins = async () => {
    try {
      setLoading(true);

      const { data } = await API.get(
        `/api/service/${serviceId}/admins`
      );

      setAdmins(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceInfo = async () => {
    try {
      const { data } = await API.get(`/api/service/${serviceId}`);
      setServiceInfo(data);
    } catch (err) {
      console.error("Failed to fetch service info", err);
    }
  };

  const fetchServiceTickets = async () => {
    try {
      setTicketsLoading(true);
      const { data } = await API.get(`/api/complaints/service/${serviceId}`);

      const formatted = data.map((t, index) => ({
        ...t,
        id: t._id,
        ticketId: t.ticketNumber,
        serviceName: t.service?.name,
        createdDate: t.createdAt && !isNaN(new Date(t.createdAt))
          ? new Date(t.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
          : "--",
        dueDate: t.dueDate && !isNaN(new Date(t.dueDate))
          ? new Date(t.dueDate).toLocaleDateString("en-GB").replace(/\//g, "-")
          : "--",
      }));

      setServiceTickets(formatted);
    } catch (err) {
      console.error("Failed to fetch service tickets", err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchServiceInfo();
    fetchServiceTickets();
  }, [serviceId]);

  /* ===============================
     SEARCH USER
  =================================*/
  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      setLoading(true);
      setNotFound(false);

      const { data } = await API.get(
        `/api/auth/search?query=${search}`
      );

      setSearchedUsers(data);

    } catch (err) {
      if (err.response?.status === 404) {
        setSearchedUsers([]);
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     ASSIGN ADMIN
  =================================*/
  const assignAdmin = async (user) => {
    try {
      setLoading(true);

      await API.post(
        `/api/service/${serviceId}/assign-admin`,
        { user_id: user._id }
      );

      setSearch("");
      setSearchedUsers([]);
      fetchAdmins();

    } catch (err) {
      alert(err.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     REMOVE ADMIN
  =================================*/
  const removeAdmin = async () => {
    if (!adminToRemove) return;

    try {
      setLoading(true);

      await API.delete(
        `/api/service/${serviceId}/admins/${adminToRemove}`
      );

      setShowRemoveModal(false);
      setAdminToRemove(null);
      fetchAdmins();

    } catch (err) {
      alert("Remove failed");
    } finally {
      setLoading(false);
    }
  };
  //console.log(searchedUsers)
  return (
    <div className="container py-4">

      {loading && <Loader />}

      {/* Header */}
      <div className="mb-4">
        <button
          className="btn btn-link text-decoration-none mb-3 p-0 d-flex align-items-center gap-1"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="fw-bold mb-1 mt-2 display-5" style={{ color: "var(--primary-color)" }}>
          {serviceInfo?.name || "Loading..."}
        </h1>
        <h6 className="fw-semibold text-secondary text-uppercase ls-wide">Manage Admin</h6>
      </div>

      {/* SEARCH SECTION */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
        <h6 className="fw-bold mb-3">Search User</h6>

        <div className="d-flex flex-column flex-sm-row gap-3">
          <input
            type="text"
            className="form-control rounded-pill px-4"
            placeholder="Search by EmpID or Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="btn btn-primary rounded-pill px-4 shadow-sm"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchedUsers.length > 0 && (
          <div className="mt-4">
            {searchedUsers.map(user => (
              <div
                key={user._id}
                className="border rounded-4 p-3 mb-2 d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{user.fullname}</strong>
                  <div className="text-muted small">
                    Name: {user.name} <br />
                    Institute ID: {user.institutionId}
                  </div>
                </div>

                <button
                  className="btn btn-success rounded-pill btn-sm"
                  onClick={() => assignAdmin(user)}
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        )}

        {notFound && (
          <div className="mt-4 text-danger">
            User not found.
            <button
              className="btn btn-link"
              onClick={() => navigate("/super/add-user")}
            >
              Create New User
            </button>
          </div>
        )}

      </div>

      {/* CURRENT ADMINS */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
        <h5 className="fw-bold mb-4" style={{ color: "var(--text-color)" }}>Current Admins</h5>

        {admins.length === 0 ? (
          <No_data Data="Admins" />
        ) : (
          <div className="d-flex flex-column gap-3">
            {admins.map(admin => (
              <div
                key={admin._id}
                className="card border rounded-4 p-3 shadow-sm"
                style={{ backgroundColor: "var(--input-bg)" }}
              >
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle overflow-hidden bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0 shadow-sm"
                      style={{ width: 50, height: 50 }}
                    >
                      <img
                        src={`http://info.aec.edu.in/aec/employeephotos/${admin.userId?.institutionId}.jpg`}
                        alt=""
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerText = admin.userId?.name?.charAt(0) || "A";
                        }}
                      />
                    </div>
                    <div className="text-truncate">
                      <h5 className="mb-0 fw-bold text-truncate" style={{ color: "var(--text-color)" }}>{admin.userId?.name}</h5>
                      <span className="text-muted small">Employee ID: {admin.userId?.institutionId}</span>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-danger btn-sm rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdminToRemove(admin.userId._id);
                        setShowRemoveModal(true);
                      }}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SERVICE TICKETS TABLE */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mt-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
            <Ticket size={24} />
          </div>
          <h5 className="fw-bold mb-0" style={{ color: "var(--text-color)" }}>All {serviceInfo?.name} Tickets</h5>
        </div>

        <CommonTable
          loading={ticketsLoading}
          columns={[
            { field: "ticketId", headerName: "Ticket ID", minWidth: 150 },
            {
              field: "title",
              headerName: "Title",
              flex: 2.5,
              align: "left",
              headerAlign: "left",
              minWidth: 120,
              renderCell: (params) => (
                <span className="fw-bold text-wrap" style={{ display: 'inline-block', width: '100%', textAlign: 'left' }}>
                  {params.row.title}
                </span>
              )
            },
            {
              field: "priority",
              headerName: "Priority",
              minWidth: 130,
              renderCell: (params) => (
                <span className={`badge rounded-pill px-3 ${getPriorityColor(params.row.priority)}`}>
                  {params.row.priority}
                </span>
              )
            },
            {
              field: "status",
              headerName: "Status",
              minWidth: 130,
              renderCell: (params) => (
                <span className={`badge rounded-pill px-3 ${getStatusColor(params.row.status)}`}>
                  {params.row.status}
                </span>
              )
            },
            { field: "assignedDevs", headerName: "Assigned To", minWidth: 150, flex: 1.5 },
            { field: "createdDate", headerName: "Created Date", minWidth: 120 },
            { field: "dueDate", headerName: "Due Date", minWidth: 120 },
            {
              field: "action",
              headerName: "Action",
              minWidth: 100,
              sortable: false,
              renderCell: (params) => (
                <button
                  className="btn btn-primary btn-sm rounded-pill px-3"
                  onClick={() => navigate(`/ticketdetails/${params.row._id}`)}
                >
                  View
                </button>
              )
            }
          ]}
          rows={serviceTickets}
          Data="Tickets"
        />
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg p-2">
              <div className="modal-header border-0 pb-0 justify-content-end">
                <button type="button" className="btn-close" onClick={() => setShowRemoveModal(false)}></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="mb-3 text-danger">
                  <Trash2 size={54} strokeWidth={1.5} />
                </div>
                <h3 className="fw-bold mb-2" style={{ color: "var(--text-color)" }}>Remove Admin?</h3>
                <p className="text-muted px-4 mb-0">
                  Are you sure you want to remove this administrator? This action will revoke their access to this service immediately.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4 pt-0 gap-3">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4 fw-semibold border"
                  onClick={() => setShowRemoveModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fw-semibold shadow-sm"
                  onClick={removeAdmin}
                >
                  Confirm Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManageAdmins;