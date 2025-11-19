import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import Navbar from "../components/Navbar";
import ProtectedRoute from "./ProtectedRoute";
import Events from "../pages/Events";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Layout><Home /></Layout> },
  { path: "/register", element: <Layout><Register /></Layout> },
  { path: "/login", element: <Layout><Login /></Layout> },
  {
    path: "/profile",
    element: (
      <Layout>
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/events",
    element: (
      <Layout>
        <ProtectedRoute>
          <Events />
        </ProtectedRoute>
      </Layout>
    ),
  },
]);