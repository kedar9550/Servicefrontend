import { useAuth } from "../../context/AuthContext";
import Loader from "../../Components/Loader";
import { useState } from "react";
import SuperAdminDashboard from '../superAdmin/SuperAdminDashbaord'
import AdminDashboard from '../deptAdmin/DeptDashboard'
import EmployeeDashboard from '../employee/EmployeeDashboard'
import UserDashboard from '../user/Dashboard'


const Dashboard = () => {
  const { user, hasRole, isSuperAdmin } = useAuth();
  const [loading] = useState(false);

  if (!user) return null;

  const role = user.role;

  return (
    // <div className="p-4">

    //   {isSuperAdmin() && <SuperAdminDashboard />}

    //   {hasRole("ADMIN") && <AdminDashboard />}

    //   {hasRole("EMPLOYEE") && <EmployeeDashboard />}

    //   {hasRole("USER") && <UserDashboard />}

    //   {loading && <Loader />}
    // </div>

    <div className="p-4">
      {loading ? (
        <Loader />
      ) : isSuperAdmin() ? (
        <SuperAdminDashboard />
      ) : hasRole("ADMIN") ? (
        <AdminDashboard />
      ) : hasRole("EMPLOYEE") ? (
        <EmployeeDashboard />
      ) : hasRole("USER") ? (
        <UserDashboard />
      ) : null}
    </div>
  );
};

export default Dashboard;