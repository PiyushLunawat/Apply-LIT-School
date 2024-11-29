import React, { useContext, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Header from '../organisms/Header/Header';
import AccountDetailsForm from '../molecules/AccountDetailsForm/AccountDetailsForm';
import ApplicationDetailsForm from '../molecules/ApplicationDetailsForm/ApplicationDetailsForm';
import Footer from '../organisms/Footer/Footer';
import { PaymentFailedDialog, PaymentSuccessDialog } from '../molecules/PaymentDialog/PaymentDialog';
import ApplicationTaskForm from '../molecules/ApplicationTaskForm/ApplicationTaskForm';
import Task01 from '../molecules/Task01/Task01';
import Task02 from '../molecules/Task02/Task02';
import { redirect, useNavigate } from '@remix-run/react';
import { getCurrentStudent, getStudents } from '~/utils/studentAPI';
import { UserContext } from '~/context/UserContext';

// Extend the global Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const ApplicationStep1: React.FC = () => {
  const [studentData, setStudentData] = useState<any>(null);

  // Initialize from localStorage when the component mounts
  useEffect(() => {
    const storedData = localStorage.getItem('studentData');

    if (storedData) {
      setStudentData(JSON.parse(storedData));
    }
  }, []);
  const navigate = useNavigate();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [second, setSecond] = useState(false);

  const handleContinueToDashboard = () => {
    setSecond(true);
    setSuccessDialogOpen(false);
  };

  useEffect(() => {
    async function fetchCurrentStudentData() {
      try {
        console.log('faceofgf  studentData?._id:', studentData?._id);
          const res = await getCurrentStudent(studentData?._id);
            console.log(' student data:', res.data?.applicationDetails?.applicationStatus);
          if(res.data?.applicationDetails?.applicationStatus !== "initiated" &&
            res.data?.applicationDetails?.applicationStatus !== undefined){
              console.log("xxvxvx",res.data?.applicationDetails?.applicationStatus)

              navigate('/dashboard/application-step-2');
            }
            if(res.data?.applicationDetails?.applicationStatus === 'initiated')
              setSecond(true)
      } catch (error) {
        console.log('Error fetching student data:', error);
      }
    }

    fetchCurrentStudentData();
  }, [studentData]);


  return (
    <div className="w-full">
      <Header subtitle={true} />
      <img src="/assets/images/application-process-01.svg" alt="BANNER" className="w-screen my-8 sm:my-12" />
      <div className="w-full px-6 justify-center items-center">
        <div className='max-w-[1000px] mx-auto'>
          
          {!second ? (
            <div className="flex flex-col gap-4 mt-8">
              <AccountDetailsForm/>
              <ApplicationDetailsForm/>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-8">
              <ApplicationTaskForm/>
             
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApplicationStep1;
