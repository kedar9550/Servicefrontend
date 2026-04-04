import React from "react";

function StatCard({ title, value, icon, colorHex, bgColorHex, baseValue }) {
    const progressPercent = baseValue && baseValue > 0 ? (Math.min(value / baseValue, 1)) * 100 : 0;

    return (
        <div
            className="card border-0 shadow-sm rounded-4 p-3 p-md-4 h-100"
            style={{
                backgroundColor: bgColorHex || "var(--stat-card-bg)",
                transition: "transform 0.2s ease-in-out, box-shadow 0.2s"
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.classList.add('shadow-lg');
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.classList.remove('shadow-lg');
            }}
        >
            <div className="d-flex align-items-center gap-3 mb-3">
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: colorHex,
                        color: "#fff"
                    }}
                >
                    {icon}
                </div>
                <h6 className="fw-medium text-secondary mb-0">{title}</h6>
            </div>
            <h2 className="fw-bold m-0" style={{ color: colorHex }}>{value}</h2>

            {baseValue !== undefined && (
                <div className="progress mt-3" style={{ height: "6px" }}>
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${progressPercent}%`, backgroundColor: colorHex }}
                        aria-valuenow={progressPercent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    ></div>
                </div>
            )}
        </div>
    );
}

export default StatCard;