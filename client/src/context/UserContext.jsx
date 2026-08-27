import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUsers, fetchCurrentUser } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [demoUsers, setDemoUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('borrowbox_is_logged_in') === 'true');
  const [loadingUsers, setLoadingUsers] = useState(true);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const isLogged = localStorage.getItem('borrowbox_is_logged_in') === 'true';
      
      // Load all users first so demo users list is populated
      const res = await fetchUsers();
      let usersList = [];
      if (res.data && res.data.data) {
        usersList = res.data.data;
        setDemoUsers(usersList);
      }

      if (isLogged) {
        try {
          const meRes = await fetchCurrentUser();
          if (meRes.data && meRes.data.data) {
            setCurrentUser(meRes.data.data);
            setIsLoggedIn(true);
            setLoadingUsers(false);
            return;
          }
        } catch (err) {
          console.warn('Failed to load authenticated user profile, resetting to demo mode:', err.message);
          localStorage.removeItem('borrowbox_is_logged_in');
          setIsLoggedIn(false);
        }
      }

      // Default demo mode loading
      if (usersList.length > 0) {
        const savedId = localStorage.getItem('borrowbox_demo_user_id');
        const found = usersList.find((u) => u._id === savedId);
        if (found) {
          setCurrentUser(found);
        } else {
          setCurrentUser(usersList[0]);
          localStorage.setItem('borrowbox_demo_user_id', usersList[0]._id);
        }
      } else {
        throw new Error('No users returned from server');
      }
    } catch (err) {
      console.warn('Failed to load users from backend:', err.message);
      // Fallback mock users if DB hasn't finished connecting
      const fallbackUsers = [
        {
          _id: '65f000000000000000000001',
          name: 'Alex Johnson',
          email: 'alex.j@campus.edu',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          department: 'Computer Science & Engineering',
        },
        {
          _id: '65f000000000000000000002',
          name: 'Sarah Chen',
          email: 'sarah.c@campus.edu',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          department: 'Electrical & Communication Eng',
        },
        {
          _id: '65f000000000000000000003',
          name: 'Marcus Vance',
          email: 'marcus.v@campus.edu',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          department: 'Mechanical Engineering',
        },
      ];
      setDemoUsers(fallbackUsers);
      
      const isLogged = localStorage.getItem('borrowbox_is_logged_in') === 'true';
      if (isLogged) {
        localStorage.removeItem('borrowbox_is_logged_in');
        setIsLoggedIn(false);
      }
      
      const savedId = localStorage.getItem('borrowbox_demo_user_id');
      const found = fallbackUsers.find((u) => u._id === savedId);
      if (found) {
        setCurrentUser(found);
      } else {
        setCurrentUser(fallbackUsers[0]);
        localStorage.setItem('borrowbox_demo_user_id', fallbackUsers[0]._id);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const switchUser = (user) => {
    if (localStorage.getItem('borrowbox_is_logged_in') === 'true') {
      return; // Cannot switch demo user while logged in
    }
    setCurrentUser(user);
    localStorage.setItem('borrowbox_demo_user_id', user._id);
  };

  const login = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('borrowbox_demo_user_id', userData._id);
    localStorage.setItem('borrowbox_is_logged_in', 'true');
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('borrowbox_is_logged_in');
    localStorage.removeItem('borrowbox_demo_user_id');
    setIsLoggedIn(false);
    loadUsers();
  };

  return (
    <UserContext.Provider
      value={{
        demoUsers,
        currentUser,
        isLoggedIn,
        switchUser,
        login,
        logout,
        loadingUsers,
        refreshUsers: loadUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
