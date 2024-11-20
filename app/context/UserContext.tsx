import React, { createContext, useState, useEffect } from 'react';

interface UserContextType {
  studentData: any;
  setStudentData: (data: any) => void;
}

export const UserContext = createContext<UserContextType>({
  studentData: null,
  setStudentData: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentData, setStudentData] = useState<any>(null);

  // Initialize from localStorage when the component mounts
  useEffect(() => {
    const storedData = localStorage.getItem('studentData');
    if (storedData) {
      setStudentData(JSON.parse(storedData));
    }
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedData = localStorage.getItem('studentData');
      if (updatedData) {
        setStudentData(JSON.parse(updatedData));
      } else {
        setStudentData(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <UserContext.Provider value={{ studentData, setStudentData }}>
      {children}
    </UserContext.Provider>
  );
};
