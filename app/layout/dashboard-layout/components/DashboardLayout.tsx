import { Outlet, useNavigate } from "@remix-run/react";
import { useContext, useEffect, useState } from "react";
import { getCurrentStudent } from "~/api/studentAPI";
import Header from "~/components/organisms/Header/Header";
import Sidebar from "~/components/organisms/Sidebar/Sidebar";
import { UserContext } from "~/context/UserContext";

export default function DashboardLayout() {
 const { studentData, setStudentData } = useContext(UserContext); 
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCurrentStudentData() {
      if (!studentData?._id) {
        setLoading(false);
        return;
      }
      try {
        const student = await getCurrentStudent(studentData._id);
        if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'reviewing'){
          navigate('../../application/status');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'applied'){
          navigate('../../application/task');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'initiated'){
          navigate('../../application');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'dropped'){
          navigate('../../application/new-application');
        }
      } catch (error) {
        console.log("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentStudentData();
  }, [studentData, navigate]);
  
  return (
    <div className="">
        <Header classn="shadow-[0px_4px_24px_0px_rgba(100,116,139,0.2)]" />
        <div className="flex flex-col sm:flex-row border-b h-[calc(100vh-52px)] " >
            <div className="max-w-[300px] lg:max-w-[360px] w-full order-2 sm:order-1">
              <Sidebar />
            </div>
            <div className="overflow-y-auto w-full order-1 sm:order-2 h-[calc(100vh-117px)] sm:h-full" >
                <Outlet/>
            </div>
        </div>
    </div>
  );
}
