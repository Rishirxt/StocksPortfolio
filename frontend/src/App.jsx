import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import BrowseStocks from "./pages/BrowseStocks";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";


function AppContent() {
  const location = useLocation();

  const hideNavbarPaths = ["/", "/login", "/register"]; // Hide navbar on initial load and auth pages

  return (
    <>
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}

      <Routes>
        {/* Default route shows login page */}
        <Route path="/" element={<Login />} />

        {/* Main authenticated pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/browse" element={<BrowseStocks />} />
        <Route path="/profile" element={<Profile />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </>
  );
}


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
