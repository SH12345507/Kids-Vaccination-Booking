import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splashscreen from "./Components/SplashScreen/SplashScreen";
import Home from "./Pages/HomePanel/Home/Home";
import HospitalSignup from "./Pages/HomePanel/HospitalSignup/HospitalSignup";
import Login from "./pages/HomePanel/Login/Login";
import ParentSignup from "./Pages/HomePanel/ParentSignup/ParentSignup";
import VaccineInfo from "./Pages/HomePanel/VaccineInfo/VaccineInfo";
import VaccineGuidance from "./Pages/HomePanel/VaccineGuidance/VaccineGuidance";
import ForgotPassword from "./Pages/HomePanel/ForgotPassword/ForgotPassword";
import ParentDashboard from "./Pages/ParentPanel/ParentDashboard/ParentDashboard";
import AddChild from "./Pages/ParentPanel/AddChild/AddChild";
import VaccineSchedule from "./Pages/ParentPanel/VaccineSchedule/VaccineSchedule";
import About from "./pages/About/About";
import Settings from "./Pages/ParentPanel/Settings/Settings";
import ChangePassword from "./Pages/ParentPanel/ChangePassword/ChangePassword";
import ManageChildren from "./Pages/ParentPanel/ManageChildren/ManageChildren";
import Notifications from "./Pages/ParentPanel/Notifications/Notifications";
import Profile from "./Pages/ParentPanel/Profile/Profile";
import HospitalDashboard from "./Pages/HospitalPanel/HospitalDashboard/HospitalDashboard";
import ManageStock from "./Pages/HospitalPanel/ManageStock/ManageStock";
import ManageSlots from "./Pages/HospitalPanel/ManageSlots/ManageSlots";
import ManageSchedule from "./Pages/HospitalPanel/ManageSchedule/ManageSchedule";
import ViewAppointments from "./Pages/HospitalPanel/ViewAppointments/ViewAppointments";
import ViewRating from "./Pages/HospitalPanel/ViewRating/ViewRating";
import HSettings from "./Pages/HospitalPanel/HSettings/HSettings";
import HProfile from "./Pages/HospitalPanel/HProfile/HProfile";
import HNotifications from "./Pages/HospitalPanel/HNotifications/HNotifications";
import HChangePassword from "./Pages/HospitalPanel/HChangePassword/HChangePassword";
import Payment from "./Pages/HospitalPanel/Payment/Payment";
import AdminDashboard from "./Pages/AdminPanel/AdminDashboard/AdminDashboard";
import ManageHospitals from "./Pages/AdminPanel/ManageHospitals/ManageHospitals";
import ManageParents from "./Pages/AdminPanel/ManageParents/ManageParents";
import ManagePRatings from "./Pages/AdminPanel/ManageRatings/ManageRatings";
import ASettings from "./Pages/AdminPanel/ASettings/ASettings";
import AProfile from "./Pages/AdminPanel/AProfile/AProfile";
import ANotifications from "./Pages/AdminPanel/ANotifications/ANotifications";
import AChangePassword from "./Pages/AdminPanel/AChangePassword/AChangePassword";
import FloatingMenu from "./Components/FloatingMenu/FloatingMenu";
import HospitalModal from "./Pages/ParentPanel/Hospitalmodal/HospitalModal";




function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <Splashscreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hospital-signup" element={<HospitalSignup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/parent-signup" element={<ParentSignup />} />
        <Route path="/vaccine-info" element={<VaccineInfo />} />
        <Route path="/guidance" element={<VaccineGuidance />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/add-child" element={<AddChild />} />
        <Route path="/vaccine-schedule" element={<VaccineSchedule />} />
        <Route path="/about" element={<About />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/password" element={<ChangePassword />} />
        <Route path="/settings/children" element={<ManageChildren />} />
        <Route path="/settings/notifications" element={<Notifications />} />
        <Route path="/settings/profile" element={<Profile />} />
        <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
        <Route path="/hospital-stock" element={<ManageStock />} />
        <Route path="/hospital-slots" element={<ManageSlots />} />
        <Route path="/hospital-schedule" element={<ManageSchedule />} />
        <Route path="/hospital-appointments" element={<ViewAppointments />} />
        <Route path="/hospital-rating" element={<ViewRating />} />
        <Route path="/hospital-settings" element={<HSettings />} />
        <Route path="/hospital-settings/profile" element={<HProfile />} />
        <Route path="/hospital-settings/notifications" element={<HNotifications />} />
       <Route path="/hospital-settings/password" element={<HChangePassword />} />
       <Route path="/hospital-settings/payment" element={<Payment />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-hospitals" element={<ManageHospitals />} />
        <Route path="/admin-parents" element={<ManageParents />} />
        <Route path="/admin-ratings" element={<ManagePRatings />} />
        <Route path="/admin-settings" element={<ASettings />} />
        <Route path="/admin-settings/profile" element={<AProfile />} />
        <Route path="/admin-settings/notifications" element={<ANotifications />} />
        <Route path="/admin-settings/password" element={<AChangePassword />} />
        <Route path="/hospital-modal" element={<HospitalModal />} />
      </Routes>
       <FloatingMenu />
    </BrowserRouter>
  );
}

export default App;