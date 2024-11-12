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
import { useNavigate } from '@remix-run/react';

// Extend the global Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const ApplicationStep1: React.FC = () => {
  const navigate = useNavigate();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [failedDialogOpen, setFailedDialogOpen] = useState(false);
  const [part2, setPart2] = useState(false);

  const handleContinueToDashboard = () => {
    setPart2(true); // Set part2 to true to move to the next part of the form
    setSuccessDialogOpen(false); // Close the dialog
  };

  // Define the loadScript function
  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    
    if (!res) {
      alert("Failed to load Razorpay. Please check your internet connection.");
      return;
    }
  
    // Fetch order details from your backend
    const data = await fetch("http://localhost:4000/student/application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 500 * 100, 
        currency: "INR",
        receipt: "order_rcptid_11",
      })
    }).then((t) => t.json());
  
    const options = {
      key: "rzp_test_1wAgBK19fS5nhr", 
      amount: data.amount,
      currency: data.currency,
      name: "The LIT School",
      description: "Application Fee Payment",
      image: "/assets/images/lit-logo-dark.svg",
      order_id: data.id, // Pass the `id` obtained from the server
      handler: function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
        console.log(response);
        setSuccessDialogOpen(true);
        // You could also make a call to verify payment on your backend
      },
      prefill: {
        name: "John Doe",
        email: "johndoe@gmail.com",
        contact: "9999999999",
      },
      theme: { color: "#00AB7B" },
    };
  
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleSubmit = () => {
    navigate('../dashboard/application-step-2');
  };

  return (
    <div className="w-full">
      <Header subtitle={true} />
      <img src="/assets/images/application-process-01.svg" alt="BANNER" className="w-screen my-8 sm:my-12" />
      <div className="w-full px-6 justify-center items-center">
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
                <Button variant="link" className='' onClick={() => setPart2(false)}>Back</Button>
                <Button size="xl" className='space-y-1' onClick={handleSubmit}>Submit Application</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <PaymentSuccessDialog open={successDialogOpen} setOpen={setSuccessDialogOpen} type='step1' mail='johndoe@gmail.com' onContinue={handleContinueToDashboard}/>
      <PaymentFailedDialog open={failedDialogOpen} setOpen={setFailedDialogOpen} type='step1' mail='johndoe@gmail.com' onContinue={handleSubmit}/>
    </div>
  );
};

export default ApplicationStep1;
