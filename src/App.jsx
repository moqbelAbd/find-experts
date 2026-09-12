import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import UserProfile from "./pages/Profile/UserProfile.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import HowItWorks from "./pages/LandingPage/HowItWorks.jsx";
import BecomeExpert from "./pages/Profile/ExpertProfile/BecomeExpert/BecomeExpert.jsx";
import ExpertProfilePage from "./pages/Profile/ExpertProfile/ExpertProfilePage.jsx";
import FindExperts from "./pages/FindExperts/FindExperts.jsx";
import PostsPage from "./pages/PostsPage/PostsPage.jsx";
import CreatePost from "./pages/PostsPage/CreatePost.jsx";
import EditPostPage from "./pages/PostsPage/EditPostPage.jsx";
import PostPage from "./pages/PostsPage/PostPage.jsx";
import BookingPage from "./pages/Book/BookingPage.jsx";
import UserDashboard from "./pages/Dashboard/UserDashboard.jsx";
import ExpertDashboard from "./pages/Dashboard/ExpertDashboard.jsx";
import AdminDashboard from "./pages/Dashboard/Admin/AdminDashboard.jsx";
import ChatPage from "./pages/Chats/ChatPage.jsx";

export default function App() {
    return (
        <BrowserRouter>
        <AuthProvider>
            <Toaster position="top-right" />

                <Routes>
                    {/* Auth pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Main layout wrapper */}
                    <Route element={<Layout />}>

                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/how-it-works" element={<HowItWorks />} />
                        <Route path="/posts" element={<PostsPage />} />
                        <Route path="/post/:id" element={<PostPage />} />
                        <Route path="/find-experts" element={<FindExperts />} />
                        <Route path="/post/edit/:id" element={<EditPostPage />} />                        <Route path="/find-experts" element={<FindExperts />} />
                        <Route path="/profile/:userId" element={<UserProfile />} />
                        <Route path="/expert/:expertId" element={<ExpertProfilePage />} />

                        {/* Protected Routes Group */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/become-expert" element={<BecomeExpert />} />
                            <Route path="/create-post" element={<CreatePost />} />
                            <Route path="/book/:expertId" element={<BookingPage />} />
                            <Route path="/user-dashboard" element={<UserDashboard />} />
                            <Route path="/expert-dashboard/:expertProfileId" element={<ExpertDashboard />} />
                            <Route path="/admin-dashboard" element={<AdminDashboard />} />
                            <Route path="/chats" element={<ChatPage />} />
                        </Route>

                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
        </AuthProvider>
     </BrowserRouter>

    );
}