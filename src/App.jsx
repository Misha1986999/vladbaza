import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import BottomNav from './components/BottomNav.jsx'
import Home from './pages/Home.jsx'
import ListingDetail from './pages/ListingDetail.jsx'
import NewListing from './pages/NewListing.jsx'
import EditListing from './pages/EditListing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import Chat from './pages/Chat.jsx'
import Messages from './pages/Messages.jsx'
import GroupChat from './pages/GroupChat.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route
            path="/new"
            element={
              <RequireAuth>
                <NewListing />
              </RequireAuth>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <RequireAdmin>
                <EditListing />
              </RequireAdmin>
            }
          />
          <Route
            path="/messages"
            element={
              <RequireAuth>
                <Messages />
              </RequireAuth>
            }
          />
          <Route
            path="/chat/:id"
            element={
              <RequireAuth>
                <Chat />
              </RequireAuth>
            }
          />
          <Route
            path="/group-chat"
            element={
              <RequireAuth>
                <GroupChat />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPanel />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>
      <footer className="border-t border-ink/10 py-6 text-center text-sm text-ink/50 pb-24 sm:pb-6">
        ВладБаза — объявления Владивостока
      </footer>
      <BottomNav />
    </div>
  )
}
