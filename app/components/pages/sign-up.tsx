import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigate } from '@remix-run/react';
import SignUpForm from '../organisms/SignUpForm/SignUpForm';
import ApplicationQNA from '../organisms/ApplicationQNA/ApplicationQNA';
import Footer from '../organisms/Footer/Footer';
import VerifyOTP from '../organisms/VerifyOTP/VerifyOTP';


export const SignUp: React.FC = () => {
    const navigate = useNavigate();
  const [showotp, setShowOtp] = useState(false);
  const [email, setEmail] = useState<string>('');

    const handleLoginClick = () => {
      navigate('../login');
    };

  return (
    <div className="w-full">
      <div className="relative w-full h-[200px] sm:h-[336px]">
        <img src="/assets/images/banner.svg" alt="BANNER" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/0"></div>
        <img src="/assets/images/lit-logo.svg" alt="LIT" className="absolute top-7 left-7 w-12 sm:w-16"/>
      </div>

      {!showotp ? (
        <div className='space-y-16 sm:space-y-24'>
          <div className="w-full px-4 mt-8 sm:mt-14 justify-center items-center">
            <div className='max-w-[840px] mx-auto space-y-4 sm:space-y-6'>
              <div className="gap-1 sm:gap-4 flex flex-col text-center">
                <div className="text-2xl sm:text-3xl font-semibold ">Join the Education Revolution!</div>
                <div className=" text-sm sm:text-base font-light sm:font-normal ">Register with us to begin your application process</div>
            </div>
            <SignUpForm setShowOtp={setShowOtp} setEmail={setEmail} />
          </div>
         </div>
          <ApplicationQNA />
          <Footer />
        </div>) :
        (<VerifyOTP
          verificationType="email"
          contactInfo={email}
          errorMessage="Oops! Looks like you got the OTP wrong, Please Retry."
          back="login"
          />)}

    </div>
  );
};

export default SignUp;
