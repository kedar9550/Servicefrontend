import React from "react";
import { useParams, Link } from "react-router-dom";
import { Mail, Phone, ArrowLeft } from "lucide-react";

function DeveloperProfile() {
  const developerData = [
    {
      id: 1,
      name: "Kedarnath",
      role: "React Developer",
      email: "kedarnath@company.com",
      phone: "+1 (555) 123-4567",
      status: "available",
      activeTickets: 5,
      completed: 142,
      totalTickets: 147,
      hoursWorked: 1230,
      memberSince: "March 2019",
      skills: ["Network", "Security", "VPN"]
    }
  ];

  const { id } = useParams();
  const navigate = useNavigate();

  const developer = developerData.find(
    (dev) => dev.id === parseInt(id)
  );

  if (!developer) return <div>Developer not found</div>;

  const initials = developer.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="container-fluid p-4">

      {/* Back */}
      <Link to="dept/team" className="text-decoration-none mb-3 d-inline-block">
        <ArrowLeft size={18} className="me-2" />
        Back to Team Members
      </Link>

      <div className="row g-4">

        {/* LEFT SIDE PROFILE CARD */}
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm rounded-4">

            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: 80,
                  height: 80,
                  background: "linear-gradient(135deg,#2563eb,#1e40af)",
                  fontSize: "24px"
                }}
              >
                {initials}
              </div>

              <div>
                <h4 className="fw-bold mb-0">{developer.name}</h4>
                <p className="text-muted">{developer.role}</p>
                <span className={`badge ${developer.status === "available"
                  ? "bg-success-subtle text-success"
                  : "bg-danger-subtle text-danger"
                  }`}>
                  {developer.status}
                </span>
              </div>
            </div>

            <hr />

            <div className="text-muted small">
              <div className="mb-2">
                <Mail size={16} className="me-2" />
                {developer.email}
              </div>
              <div>
                <Phone size={16} className="me-2" />
                {developer.phone}
              </div>
            </div>

            <hr />

            <h6>Skills</h6>
            <div className="d-flex flex-wrap gap-2">
              {developer.skills.map((skill, i) => (
                <span key={i} className="badge bg-primary-subtle text-primary">
                  {skill}
                </span>
              ))}
            </div>

            <hr />

            <p className="mb-1"><strong>Member Since</strong></p>
            <p className="text-muted">{developer.memberSince}</p>

          </div>
        </div>

        {/* RIGHT SIDE CONTENT */}
        <div className="col-lg-8">

          <h3 className="fw-bold mb-4">Overview</h3>

          <div className="row g-3 mb-4">

            <div className="col-md-6">
              <div className="card p-3 shadow-sm rounded-4">
                <small>Total Tickets</small>
                <h4 className="fw-bold">{developer.totalTickets}</h4>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card p-3 shadow-sm rounded-4">
                <small>Completed Tickets</small>
                <h4 className="fw-bold text-success">
                  {developer.completed}
                </h4>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card p-3 shadow-sm rounded-4">
                <small>Active Tickets</small>
                <h4 className="fw-bold text-warning">
                  {developer.activeTickets}
                </h4>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card p-3 shadow-sm rounded-4">
                <small>Hours Worked</small>
                <h4 className="fw-bold text-primary">
                  {developer.hoursWorked}
                </h4>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default DeveloperProfile;