import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import Layout from "./Layout";
import Landing from "./pages/Landing";
import Browse from "./pages/Browse";
import PostItem from "./pages/PostItem";
import MyPostings from "./pages/MyPostings";
import ItemDetail from "./pages/ItemDetail";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import CommunitySpace from "./pages/CommunitySpace";
import Account from "./pages/Account";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="container">Loading…</div>;
  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="account" element={<Account />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="browse" element={<Protected><Browse /></Protected>} />
        <Route path="post" element={<Protected><PostItem /></Protected>} />
        <Route path="my-postings" element={<Protected><MyPostings /></Protected>} />
        <Route path="item/:id" element={<ItemDetail />} />
        <Route path="profile" element={<Protected><Profile /></Protected>} />
        <Route path="wishlist" element={<Protected><Wishlist /></Protected>} />
        <Route path="community" element={<CommunitySpace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
