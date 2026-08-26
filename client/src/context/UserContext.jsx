import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUsers } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [demoUsers, setDemoUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetchUsers();
      if (res.data && res.data.data) {
        const users = res.data.data;
        setDemoUsers(users);
        
        const savedId = localStorage.getItem('borrowbox_demo_user_id');
        const found = users.find((u) => u._id === savedId);
        if (found) {
          setCurrentUser(found);
        } else if (users.length > 0) {
          setCurrentUser(users[0]);
          localStorage.setItem('borrowbox_demo_user_id', users[0]._id);
        }
      }
    } catch (err) {
      console.warn('Failed to load demo users from backend:', err.message);
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
      setCurrentUser(fallbackUsers[0]);
      localStorage.setItem('borrowbox_demo_user_id', fallbackUsers[0]._id);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const switchUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('borrowbox_demo_user_id', user._id);
  };

  return (
    <UserContext.Provider
      value={{
        demoUsers,
        currentUser,
        switchUser,
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
