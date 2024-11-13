import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigate } from '@remix-run/react';
import LoginForm from '../organisms/LoginForm/LoginForm';
import ApplicationQNA from '../organisms/ApplicationQNA/ApplicationQNA';
import Footer from '../organisms/Footer/Footer';
import VerifyOTP from '../organisms/VerifyOTP/VerifyOTP';


export const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [showotp, setShowOtp] = useState(false);
    const [email, setEmail] = useState<string>('');
    const handleRegisterClick = () => {
      navigate('../sign-up');
    };

    const handleLoginClick = () => {
      navigate('../dashboard/application-step-1');
    };

  return (
    <div className="w-full">
      <div className="relative">
        <img src="/assets/images/banner.svg" alt="BANNER" className="w-full h-[200px] sm:h-[336px] object-cover" />
        <img src="/assets/images/lit-logo.svg" alt="LIT" className="absolute top-7 left-7 w-8 sm:w-16" />
      </div>
      {!showotp ? (
        <div className='space-y-24'>
          <div className="w-full px-6 mt-8 sm:mt-14 justify-center items-center">
          <div className='max-w-[840px] mx-auto'>
            <div className="gap-4 sm:gap-6 flex flex-col text-center">
              <div className=" text-xl sm:text-3xl font-semibold ">Join the Education Revolution!</div>
              <div className=" text-sm sm:text-base font-semibold ">Access your dashboard by verifying your contact number</div>
            </div>
            <LoginForm setShowOtp={setShowOtp} setEmail={setEmail}/>
            </div>
          </div>
          <ApplicationQNA />
          <Footer />
        </div>) :
        (<VerifyOTP
          verificationType="contact" // or "email"
          contactInfo={email}
          errorMessage="Oops! Looks like you got the OTP wrong, Please Retry."
        />)}
    </div>
  );
};

export default SignUp;
