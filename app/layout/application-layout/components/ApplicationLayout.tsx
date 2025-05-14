import { Outlet, useNavigate } from "@remix-run/react";
import React, { useContext, useEffect, useState } from "react";
import Footer from "~/components/organisms/Footer/Footer";
import Header from "~/components/organisms/Header/Header";
import { Skeleton } from "~/components/ui/skeleton";
import { UserContext } from "~/context/UserContext";
import { getCurrentStudent } from "~/api/studentAPI";

export default function ApplicationLayout() {
  const { studentData, setStudentData } = useContext(UserContext); 
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCurrentStudentData() {
      if (!studentData) {
        setLoading(false);
        return;
      }
      try {
        const student = await getCurrentStudent(studentData._id || studentData?.id);
        setStudentData(student)
        if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'enrolled'){
          navigate('../../dashboard');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'reviewing'){
          navigate('../../application/status');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'applied'){
          navigate('../../application/task');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'initiated'){
          navigate('../../application');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'dropped'){
          navigate('../../application/new-application');
        } else {
          navigate('../../application');
        }
      } catch (error) {
        console.log("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentStudentData();
  }, [studentData?.id, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
        <Header />      
        <div className="p-0">
            <Outlet />
        </div>
        <Footer />
    </div>
  );
}
