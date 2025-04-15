// app/components/auth/Login.tsx
import React, { useContext, useEffect, useState } from 'react';
import Dashboard from '../components/Dashboard';
import { UserContext } from '~/context/UserContext';
import { getCurrentStudent } from '~/api/studentAPI';

export default function Home(){

    const { studentData } = useContext(UserContext);
    const [student, setStudent] = useState<any>();
    
    useEffect(() => {
      if(studentData?._id)  {
        const fetchStudentData = async () => {
          try {
            const student = await getCurrentStudent(studentData._id); // Pass the actual student ID here
            setStudent(student);          
          } catch (error) {
            console.error("Failed to fetch student data:", error);
          }
        };
        fetchStudentData();
      }
    }, [studentData]);

  return (
    <>
      <Dashboard student={student} />
    </>
  );
};
