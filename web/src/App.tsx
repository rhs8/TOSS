import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth";
import Layout from "./Layout";
import Landing from "./pages/Landing";
import Browse from "./pages/Browse";
import PostItem from "./pages/PostItem";
import ItemDetail from "./pages/ItemDetail";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container">Loading…</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="browse" element={<Protected><Browse /></Protected>} />
        <Route path="post" element={<Protected><PostItem /></Protected>} />
        <Route path="item/:id" element={<ItemDetail />} />
        <Route path="profile" element={<Protected><Profile /></Protected>} />
        <Route path="wishlist" element={<Protected><Wishlist /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
