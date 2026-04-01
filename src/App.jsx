import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/login/Login";
import Signup from "./Pages/login/Signup";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Layout from "./layouts/Layout";
import "./App.css";

import Dashboard from "./Pages/common/Dashborad";

import Profile from "./Pages/user/Profile";
import MyTickets from "./Pages/user/MyTickets";
import ChangePassword from "./Pages/user/ChangePassword";
import TicketDetails from "./Pages/user/TicketDetails";
import DeptTickets from "./Pages/deptAdmin/DeptTickets";
import AssignTickets from "./Pages/deptAdmin/AssignTickets";
import TeamMembers from "./Pages/deptAdmin/TeamMembers";
import DeveloperProfile from "./Pages/deptAdmin/DeveloperProfile";
import InProgress from "./Pages/employee/InProgress";
import MyAssignedTickets from "./Pages/employee/MyAssignedTickets";
import Completed from "./Pages/employee/Completes";
import ManageServices from "./Pages/superAdmin/ManageServices";
import ManageAdmins from './Pages/superAdmin/ManageAdmins'
import AddUser from "./Pages/superAdmin/AddUser";
import GenerateTicket from "./Pages/user/GenerateTicket";
import Reports from "./Components/Reports";
import ForgotPassword from "./Pages/login/ForgotPassword";
import Bad_gateway from "./Components/Bad_gateway";
import No_data from "./Components/No_data";
import RejectedTickets from "./Pages/deptAdmin/RejectedTickets";
import { ToastContainer } from "react-toastify";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* USER ROUTES */}
          <Route index element={<Dashboard />} />
          <Route path='generateticket' element={<GenerateTicket />} />
          <Route path="profile" element={<Profile />} />
          <Route path="mytickets" element={<MyTickets />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="ticketdetails/:id" element={<TicketDetails />} />

          {/* DEPARTMENT ADMIN ROUTES */}
          <Route path="dept/tickets" element={<DeptTickets />} />
          <Route path="dept/assign" element={<AssignTickets />} />
          <Route path="dept/team" element={<TeamMembers />} />
          <Route path="dept/developer/:id" element={<DeveloperProfile />} />
          <Route path="dept/reports" element={<Reports />} />
          <Route path='rejected' element={<RejectedTickets />} />

          {/* EMPLOYEE ROUTES */}
          <Route path="dev/InProgress" element={<InProgress />} />
          <Route path="dev/assigned" element={<MyAssignedTickets />} />
          <Route path="dev/completed" element={<Completed />} />


          {/*Super Admin ROUTES */}

          <Route path="super/services" element={<ManageServices />} />
          <Route path='super/service/:serviceId/admins' element={<ManageAdmins />} />
          <Route path='super/add-user' element={<AddUser />} />



          {/* -----404 Bad Gateway------ */}
          <Route path='nodata' element={<No_data />} />

        </Route>

        <Route path='*' element={<Bad_gateway />} />


      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        limit={3}
      />
    </BrowserRouter>
  );
}

export default App;