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

export const getSatisfactionColor = (level) => {
    switch (level) {
        case "Very Satisfied":
            return "bg-success-subtle text-success border border-success";
        case "Satisfied":
            return "bg-info-subtle text-info border border-info";
        case "Neutral":
            return "bg-warning-subtle text-warning border border-warning";
        case "Dissatisfied":
            return "bg-danger-subtle text-danger border border-danger";
        case "Very Dissatisfied":
            return "bg-danger text-white";
        default:
            return "bg-secondary-subtle text-secondary";
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