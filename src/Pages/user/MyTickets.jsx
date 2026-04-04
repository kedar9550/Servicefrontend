
import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../api/axios";
import { getPriorityColor, getStatusColor } from "../../Components/StatusColors";
import CommonTable from "../../Components/CommonTable";

const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);   // State added
  const [loading, setLoading] = useState(false);

  const FetchMyTickets = async () => {
    try {
      setLoading(true);
      const tecketfetches = await API.get("/api/complaints/my");

      const formatedticketList = tecketfetches.data.map((ticket) => {
        return {
          _id: ticket._id,
          ticketId: ticket.ticketNumber,
          title: ticket.title,
          serviceName: ticket.service?.name, // optional chaining safer
          priority: ticket.priority,
          status: ticket.status,
          createdDate: ticket.createdAt && !isNaN(new Date(ticket.createdAt))
            ? new Date(ticket.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
            : "--",
        };
      });

      setTickets(formatedticketList);   // Save into state
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    FetchMyTickets();
  }, []);

  return (
    <div className="container-fluid pt-4">
      <p className="mb-4 h3 fw-bold" style={{ fontFamily: "Poppins" }}>
        My Tickets
      </p>

      <div className="card shadow-sm p-3">
        <CommonTable
          loading={loading}
          columns={[
            { field: "ticketId", headerName: "Ticket ID", minWidth: 150, flex: 1, align: 'left' },
            {
              field: "title", headerName: "Title", flex: 3, minWidth: 120, maxWidth: 250, renderCell: (params) => (
                <div
                  style={{
                    width: "100%",
                    textAlign: "left",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    lineHeight: "1.4"
                  }}
                  className="fw-bold"
                >
                  {params.row.title}
                </div>
              )
            },
            { field: "serviceName", headerName: "Service Category", minWidth: 150, flex: 1.5 },
            {
              field: "priority",
              headerName: "Priority",
              minWidth: 120,
              renderCell: (params) => (
                <span className={`badge ${getPriorityColor(params.row.priority)}`}>
                  {params.row.priority}
                </span>
              )
            },
            {
              field: "status",
              headerName: "Status",
              minWidth: 120,
              renderCell: (params) => (
                <span className={`badge ${getStatusColor(params.row.status)}`}>
                  {params.row.status}
                </span>
              )
            },
            { field: "createdDate", headerName: "Created Date", minWidth: 150 },
            {
              field: "action",
              headerName: "Action",
              minWidth: 120,
              sortable: false,
              renderCell: (params) => (
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: "#0b5299", color: "#fff" }}
                  onClick={() => navigate(`/ticketdetails/${params.row._id}`)}
                >
                  View
                </button>
              )
            }
          ]}
          rows={tickets.map((t, index) => ({ ...t, id: t._id, sno: index + 1 }))}
          Data="Tickets"
        />
      </div>
    </div>
  );
};


export default MyTickets;