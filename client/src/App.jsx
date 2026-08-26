import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import ExplorePage from './pages/ExplorePage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import AddEditItemPage from './pages/AddEditItemPage';
import MyItemsPage from './pages/MyItemsPage';
import MyRequestsPage from './pages/MyRequestsPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
          <Navbar />
          
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<ExplorePage />} />
              <Route path="/items/:id" element={<ItemDetailsPage />} />
              <Route path="/items/new" element={<AddEditItemPage />} />
              <Route path="/items/:id/edit" element={<AddEditItemPage />} />
              <Route path="/my-items" element={<MyItemsPage />} />
              <Route path="/requests" element={<MyRequestsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}
