export const getPriorityColor = (priority) => {
    switch (priority) {
        case "HIGH":
            return "bg-danger text-white";
        case "MEDIUM":
            return "bg-warning text-dark";
        case "LOW":
            return "bg-primary text-white";
        default:
            return "bg-secondary text-white";
    }
};

export const getStatusColor = (status) => {
    switch (status) {
        case "OPEN":
        case "UNASSIGNED":
            return "bg-info text-dark";
        case "ASSIGNED":
            return "bg-primary text-white";
        case "IN_PROGRESS":
            return "bg-warning text-dark";
        case "RESOLVED":
        case "CLOSED":
            return "bg-success text-white";
        case "REJECTED":
            return "bg-danger text-white";
        default:
            return "bg-secondary text-white";
    }
};