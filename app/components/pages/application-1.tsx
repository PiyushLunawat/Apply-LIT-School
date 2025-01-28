"use client";

import React, { useContext, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Header from '../organisms/Header/Header';
import AccountDetailsForm from '../molecules/AccountDetailsForm/AccountDetailsForm';
import Footer from '../organisms/Footer/Footer';
import { PaymentFailedDialog, PaymentSuccessDialog } from '../molecules/PaymentDialog/PaymentDialog';
import Task01 from '../molecules/Task01/Task01';
import Task02 from '../molecules/Task02/Task02';
import { redirect, useNavigate } from '@remix-run/react';
import { getCurrentStudent, getStudents } from '~/utils/studentAPI';
import { UserContext } from '~/context/UserContext';
import { Skeleton } from '../ui/skeleton';
import ApplicationTaskForm from '../molecules/ApplicationTaskForm/trash';
import ApplicationDetailsForm from '../molecules/ApplicationDetailsForm/ApplicationDetailsForm';
// import ApplicationTaskForm from '../molecules/ApplicationTaskForm/ApplicationTaskForm';

// Extend the global Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const ApplicationStep1: React.FC = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
            if(res.data?.applicationDetails?.applicationStatus === 'under review'
               || res.data?.applicationDetails?.applicationStatus === 'accepted'
               || res.data?.applicationDetails?.applicationStatus === 'rejected')
               navigate("/application/step-2");
            if(res.data?.applicationDetails?.applicationStatus === 'initiated' || res.data?.applicationDetails?.applicationStatus === 'on hold')
              setSecond(true)
      } catch (error) {
        console.log('Error fetching student data:', error);
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentStudentData();
  }, [studentData]);


  return (
    <div className="w-full">
      <Header subtitle="Welcome to LIT" submessage='Get started with your application process'/>
      <img src="/assets/images/application-process-01.svg" alt="BANNER" className="w-screen object-left object-cover overflow-x-auto h-[188px] sm:h-full my-6 sm:my-12" />
      
      <div className="w-full px-4 justify-center items-center">
        <div className='max-w-[1000px] mx-auto'> 
          {loading ? 
          <div className='space-y-4'>
            <div className='flex gap-2'>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full flex-1" />
                <Skeleton className="h-[52px] rounded-xl w-full flex-1" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full flex-1" />
                <Skeleton className="h-[52px] rounded-xl w-full flex-1" />
              </div>
            </div>
            <div className=" space-y-2">
              <Skeleton className="h-4 w-full flex-1" />
              <Skeleton className="h-[52px] rounded-xl w-full flex-1" />
            </div>
            <div className=" space-y-2">
              <Skeleton className="h-4 w-full flex-1" />
              <Skeleton className="h-[52px] rounded-xl w-full flex-1" />
            </div>
          </div> :
          !second ? (
            <div className="mt-8">
              <ApplicationDetailsForm/>
            </div>
          ) : (
            <div className="mt-8">
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
