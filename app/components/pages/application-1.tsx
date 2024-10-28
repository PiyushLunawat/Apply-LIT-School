import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Header from '../organisms/Header/Header';
import PersonalDetails from '../molecules/PersonalDetailsForm/PersonalDetailsForm';
import PreviousEducation from '../molecules/PreviousEducation/PreviousEducation';
import EmergencyContactDetails from '../molecules/EmergencyContactDetails/EmergencyContactDetails';
import ParentalInformation from '../molecules/ParentalInformation/ParentalInformation';
import Footer from '../organisms/Footer/Footer';
import { PaymentFailedDialog, PaymentSuccessDialog } from '../molecules/PaymentDialog/PaymentDialog';
import CourseDive from '../molecules/CourseDive/CourseDive';
import Task01 from '../molecules/Task01/Task01';
import Task02 from '../molecules/Task02/Task02';


export const ApplicationStep1: React.FC = () => {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [failedDialogOpen, setFailedDialogOpen] = useState(false);
  const [part2, setPart2] = useState(false);

  const handlePayment = () => {
    setPart2(true);
    // Simulate payment logic
    const paymentSuccess = true; // Simulate a payment success or failure
    if (paymentSuccess) {
      setSuccessDialogOpen(true);
    } else {
      setFailedDialogOpen(true);
    }
  };

  return (
    <div className="w-full">
      <Header subtitle={true} />
      <img src="/assets/images/application-process-01.svg" alt="BANNER" className="w-screen my-8 sm:my-12" />
      <div className="w-full px-6  justify-center items-center">
        <div className='max-w-[1000px] mx-auto'>
          
          {!part2 ? (
          <div className="flex flex-col gap-4 mt-8">
            <PersonalDetails/>
            <PreviousEducation/>
            <EmergencyContactDetails/>
            <ParentalInformation/>
              
              <div className="flex justify-between items-center mt-6">
                <Button variant="link">Clear Form</Button>
                <Button size="xl" className='space-y-1 bg-[#00AB7B] hover:bg-[#00AB7B]/90' onClick={handlePayment}>Pay INR 500.00 and Submit</Button>
              </div>
          </div>
          ) : (
          <div className="flex flex-col gap-4 mt-8">
              <CourseDive/>
              <Task01/>
              <Task02/>
              
              <div className="flex justify-between items-center mt-6">
                <Button variant="link" className=''>Back</Button>
                <Button size="xl" className='space-y-1' >Submit Application</Button>
              </div>
          </div>
          )}
        </div>
      </div>
      <Footer />
      <PaymentSuccessDialog open={successDialogOpen} setOpen={setSuccessDialogOpen} type='step1' mail='johndoe@gmail.com'/>
      <PaymentFailedDialog open={failedDialogOpen} setOpen={setFailedDialogOpen} type='step1' mail='johndoe@gmail.com'/>
    </div>
  );
};

export default ApplicationStep1;
