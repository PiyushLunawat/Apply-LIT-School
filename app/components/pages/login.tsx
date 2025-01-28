import React, { useState } from 'react';
import LoginForm from '../organisms/LoginForm/LoginForm';
import ApplicationQNA from '../organisms/ApplicationQNA/ApplicationQNA';
import Footer from '../organisms/Footer/Footer';
import VerifyOTP from '../organisms/VerifyOTP/VerifyOTP';


export const SignUp: React.FC = () => {
    const [showotp, setShowOtp] = useState(false);
    const [email, setEmail] = useState<string>('');

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
                <div className="text-sm sm:text-base font-light sm:font-normal ">Access your dashboard by verifying your Email</div>
              </div>
              <LoginForm setShowOtp={setShowOtp} setEmail={setEmail}/>
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
