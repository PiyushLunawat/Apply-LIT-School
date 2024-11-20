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
import { useNavigate } from '@remix-run/react';
import { getCurrentStudents, getStudents } from '~/utils/studentAPI';
import { UserContext } from '~/context/UserContext';

// Extend the global Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const ApplicationStep1: React.FC = () => {
  const navigate = useNavigate();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [second, setSecond] = useState(false);
  const [part2, setPart2] = useState(false);

  const handleContinueToDashboard = () => {
    setPart2(true); // Set part2 to true to move to the next part of the form
    setSuccessDialogOpen(false); // Close the dialog
  };

  const { studentData, setStudentData } = useContext(UserContext);
  const [hasFetchedCurrentStudent, setHasFetchedCurrentStudent] = useState<any | null>(null);

  // Fetch current student data when studentData._id is available
  useEffect(() => {
    async function fetchCurrentStudentData() {
      try {
        if (studentData && studentData._id && !hasFetchedCurrentStudent) {
          const data = await getCurrentStudents(studentData._id);
          console.log('SBS', data);
          setHasFetchedCurrentStudent(data);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        if(hasFetchedCurrentStudent?.data?.applicationStatus === 'initiated')
          setSecond(true)
      }
    }

    fetchCurrentStudentData();
  }, [studentData, setStudentData, hasFetchedCurrentStudent]);


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
      <PaymentSuccessDialog open={successDialogOpen} setOpen={setSuccessDialogOpen} type='step1' mail='johndoe@gmail.com' onContinue={handleContinueToDashboard}/>
      {/* <PaymentFailedDialog open={failedDialogOpen} setOpen={setFailedDialogOpen} type='step1' mail='johndoe@gmail.com' onContinue={handleSubmit}/> */}
    </div>
  );
};

export default ApplicationStep1;
