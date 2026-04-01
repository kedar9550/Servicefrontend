// import { useParams } from "react-router-dom";
// import { useState } from "react";

// const ServiceDetails = () => {
//   const { id } = useParams();

//   const [admins, setAdmins] = useState([
//     "Rahul",
//     "Anjali"
//   ]);

//   const [newAdmin, setNewAdmin] = useState("");

//   const addAdmin = () => {
//     if (!newAdmin.trim()) return;
//     setAdmins([...admins, newAdmin]);
//     setNewAdmin("");
//   };

//   const removeAdmin = (name) => {
//     setAdmins(admins.filter(admin => admin !== name));
//   };

//   return (
//     <div className="p-4">

//       <h2 className="fw-bold">
//         Manage Service #{id}
//       </h2>

//       <div className="card shadow-sm rounded-4 border-0 p-4 mt-3">

//         <div className="d-flex gap-3 mb-4">
//           <input
//             type="text"
//             className="form-control rounded-pill"
//             placeholder="Enter admin name"
//             value={newAdmin}
//             onChange={(e) => setNewAdmin(e.target.value)}
//           />

//           <button
//             className="btn btn-primary rounded-pill"
//             onClick={addAdmin}
//           >
//             Add Admin
//           </button>
//         </div>

//         {admins.map((admin, index) => (
//           <div
//             key={index}
//             className="d-flex justify-content-between align-items-center p-2 border rounded-3 mb-2"
//           >
//             <span>{admin}</span>

//             <button
//               className="btn btn-sm btn-danger rounded-pill"
//               onClick={() => removeAdmin(admin)}
//             >
//               Remove
//             </button>
//           </div>
//         ))}

//       </div>

//     </div>
//   );
// };

// export default ServiceDetails;