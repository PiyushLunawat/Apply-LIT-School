import React, { createContext, useCallback, useEffect, useState } from "react";
import { getCurrentStudent } from "~/api/studentAPI";

interface UserContextType {
  studentData: any;
  setStudentData: (data: any) => void;
  refreshStudentData: () => Promise<void>;
  isRefreshing: boolean;
}

export const UserContext = createContext<UserContextType>({
  studentData: {},
  setStudentData: () => {},
  refreshStudentData: async () => {},
  isRefreshing: false,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [studentData, setStudentData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Initialize from localStorage when the component mounts
  useEffect(() => {
    const storedData = localStorage.getItem("studentData");

    if (storedData) {
      setStudentData(JSON.parse(storedData));
    }
  }, []);

  // Function to refresh student data from the API
  const refreshStudentData = useCallback(async () => {
    if (!studentData || !studentData._id) {
      console.log("Cannot refresh: No student ID available");
      return;
    }

    try {
      setIsRefreshing(true);
      console.log("Refreshing student data...");
      const freshData = await getCurrentStudent(studentData._id);

      if (freshData) {
        // Update localStorage
        localStorage.setItem("studentData", JSON.stringify(freshData));
        // Update context
        setStudentData(freshData);
        console.log("Student data refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing student data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedData = localStorage.getItem("studentData");
      if (updatedData) {
        setStudentData(JSON.parse(updatedData));
      } else {
        setStudentData(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        studentData,
        setStudentData,
        refreshStudentData,
        isRefreshing,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
