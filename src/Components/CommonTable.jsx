import React, { useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { TextField, Box } from "@mui/material";
import No_data from "./No_data";


const CommonTable = ({ rows, columns, initialPageSize = 5, Data = "Data" }) => {
    const [searchText, setSearchText] = useState("");

    // 📐 Default Center Alignment & Auto S.No setup
    const centeredColumns = useMemo(() => {
        let finalCols = columns.map(col => ({
            flex: 1,
            minWidth: 150, // Ensures columns don't squish on mobile
            headerAlign: 'center',
            align: 'center',
            ...col,
        }));

        if (!finalCols.find(c => c.field === "sno" || c.headerName === "S.No")) {
            finalCols = [
                { field: "sno", headerName: "S.No", width: 80, minWidth: 80, headerAlign: 'center', align: 'center' },
                ...finalCols
            ];
        }

        return finalCols;
    }, [columns]);

    // 🔍 Global Search & Auto S.No injection into rows
    const finalRows = useMemo(() => {
        const filtered = rows.filter((row) =>
            Object.values(row)
                .join(" ")
                .toLowerCase()
                .includes(searchText.toLowerCase())
        );

        return filtered.map((row, index) => ({
            ...row,
            sno: row.sno || index + 1
        }));
    }, [rows, searchText]);

    // If initial rows are empty, show No_data directly
    if (!rows || rows.length === 0) {
        return <No_data Data={Data} />;
    }

    return (
        <Box
            sx={{
                width: "100%",
                backgroundColor: "var(--card-bg)",
                borderRadius: 3,
                p: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
        >
            {/* Header Row */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 2,
                }}
            >
                <TextField
                    placeholder="Search..."
                    variant="outlined"
                    size="small"
                    sx={{
                        width: 220,
                        "& .MuiInputBase-root": { 
                            fontFamily: "Google Sans",
                            color: "var(--text-color)",
                            backgroundColor: "var(--input-bg)",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--border-color)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--text-color)",
                        },
                        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--primary-color) !important",
                        },
                        "& .MuiInputBase-input::placeholder": {
                            color: "var(--secondary-color)",
                            opacity: 1,
                        }
                    }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </Box>

            {/* DataGrid */}
            <DataGrid
                autoHeight
                rows={finalRows}
                columns={centeredColumns}
                pageSizeOptions={[5, 10, 20]}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: initialPageSize, page: 0 },
                    },
                }}
                slots={{
                    noRowsOverlay: () => <No_data Data={Data} />, // Passing matching Data prop to search results too
                }}
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'}
                sx={{
                    border: "none",
                    fontFamily: "Google Sans",
                    backgroundColor: "transparent !important",
                    "& .MuiDataGrid-main, & .MuiDataGrid-virtualScroller, & .MuiDataGrid-virtualScrollerRenderZone, & .MuiDataGrid-virtualScrollerContent": {
                        backgroundColor: "transparent !important",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "var(--stat-card-bg) !important",
                        fontWeight: "bold",
                        fontFamily: "Google Sans",
                        borderBottom: "1px solid var(--border-color) !important",
                        color: "var(--text-color) !important",
                    },
                    "& .MuiDataGrid-columnHeader": {
                        textAlign: "center",
                        backgroundColor: "transparent !important",
                        color: "var(--text-color) !important",
                    },
                    "& .MuiDataGrid-cell": {
                        display: "flex",
                        alignItems: "center",
                        fontFamily: "Google Sans",
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        lineHeight: 1.5,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        backgroundColor: "transparent !important",
                        color: "var(--text-color) !important",
                        borderBottom: "1px solid var(--border-color) !important",
                        "& > *": {
                            textAlign: "center",
                            display: "inline-block",
                            maxWidth: "100%",
                        }
                    },
                    "& .MuiDataGrid-row": {
                        backgroundColor: "transparent !important",
                        color: "var(--text-color) !important",
                    },
                    "& .MuiDataGrid-row:hover": {
                        backgroundColor: "var(--sidebar-hover) !important",
                    },
                    "& .MuiDataGrid-columnHeaderTitleContainer": {
                        justifyContent: "center",
                        color: "var(--text-color) !important",
                    },
                    "& .MuiDataGrid-footerContainer": {
                        justifyContent: "center",
                        backgroundColor: "transparent !important",
                        borderTop: "1px solid var(--border-color) !important",
                        color: "var(--text-color) !important",
                    },
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                        display: "flex",
                        alignItems: "center",
                    },

                    "& .MuiIconButton-root, & .MuiSelect-icon, & .MuiDataGrid-sortIcon, & .MuiDataGrid-iconButtonContainer": {
                        color: "var(--text-color) !important",
                        backgroundColor: "transparent",
                    },
                    "& .MuiIconButton-root:hover, & .MuiIconButton-root:focus, & .MuiIconButton-root:active": {
                        backgroundColor: "var(--sidebar-hover) !important",
                    },
                    "& .MuiDataGrid-root": {
                        color: "var(--text-color) !important",
                        borderColor: "var(--border-color) !important",
                    },
                }}
            />
        </Box>
    );
};

export default CommonTable;