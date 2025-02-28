// app/components/application/ApplicationDetails.tsx
import React, { useEffect, useState } from 'react';
import ApplicationTaskForm from '../components/ApplicationTaskForm';
import { useNavigate } from '@remix-run/react';
import { getCurrentStudent } from '~/utils/studentAPI';
import SubHeader from '~/components/organisms/SubHeader/SubHeader';

export const ApplicationTask: React.FC = () => {
  const [studentData, setStudentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [subtitle, setSubtitle] = useState("");
    const [submessage, setSubmessage] = useState("");
    const [programName, setProgramName] = useState(studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.cohortId?.programDetail?.name || "");
  
    // useNavigate hook for client-side transitions
    const navigate = useNavigate();
  
    useEffect(() => {
      const storedData = localStorage.getItem("studentData");
      if (storedData) {
        setStudentData(JSON.parse(storedData));
      }
    }, []);
  
    useEffect(() => {
      async function fetchCurrentStudentData() {
        if (!studentData?._id) {
          setLoading(false);
          return;
        }
        try {
          const res = await getCurrentStudent(studentData._id);  
          const status = res.data?.applicationDetails?.applicationStatus;
  
          if (['under review', 'accepted' , 'rejected', 'Interview Scheduled', 'waitlist', 'selected', 'not qualified'].includes(status)) {
            console.log("Navigating to /application/status:", status);
            navigate("/application/status");
          } else if (['initiated', 'on hold'].includes(status)) {
            console.log("Navigating to /application/task:", status);
            navigate("/application/task");
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
    <>
        <SubHeader subtitle='Welcome to LIT' submessage={`Dive into the ${studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.cohortId?.programDetail?.name} Course`} />
        <img src="/assets/images/application-process-01.svg" alt="BANNER" className="w-screen object-left object-cover overflow-x-auto h-[188px] sm:h-full my-6 sm:my-12" />
          
        <div className="w-full px-4 justify-center items-center">
          <div className='max-w-[1000px] mx-auto'> 
            <ApplicationTaskForm />
          </div>
        </div>
    </>
  );
};

export default ApplicationTask;
