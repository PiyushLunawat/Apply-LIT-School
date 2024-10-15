import React, { useState, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../../ui/input-otp';
import { Button } from '~/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Label } from '~/components/ui/label';

interface VerifyOTPProps {
  verificationType: 'contact' | 'email'; // Contact or Email
  contactInfo: string; // The phone number or email to display
  onSubmit: (otp: string) => void; // Function to handle OTP submission
  onResend: () => void; // Function to handle OTP resend
  errorMessage?: string; // Optional error message
}

export const VerifyOTP: React.FC<VerifyOTPProps> = ({
  verificationType,
  contactInfo,
  onSubmit,
  onResend,
  errorMessage
}) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  const handleSubmit = () => {
    if (otp.length === 6) {
      onSubmit(otp);
    }
  };

  onResend = () => {
    setTimer(60);
  }

  return (
    <div className="w-full px-6 mt-8 sm:mt-14 justify-center items-center">
      <div className="flex flex-col gap-8 w-full max-w-[840px] bg-[#1C1C1C] p-8 rounded-3xl mx-auto">
        <div className="flex justify-center">
          <img src="/assets/images/otp-verify-icon.svg" alt="Verify OTP" className="" />
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 text-center text-2xl font-semibold mb-2">
          {verificationType === 'contact' ? 'Verify Your Contact No.' : 'Verify Your Account'}
          <div className="text-center text-base">
            {verificationType === 'contact'
              ? `An OTP was sent to your contact no. 📱 ${contactInfo}`
              : `An OTP was sent to your email 📧 ${contactInfo}`}
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
        <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>

        {errorMessage && (
          <Label htmlFor="contact-error" className='flex gap-1 items-center text-sm text-[#FF503D] font-normal pl-3 mt-2'>
            <AlertCircle className='w-3 h-3'/>{errorMessage}</Label>
        )}
        </div>

        <div className="text-center">
          <Button size="xl" className="" onClick={handleSubmit}>
            {verificationType === 'contact' ? 'Confirm and Login' : 'Confirm and Proceed'}
          </Button>
        </div>

        <div className="flex text-center items-center text-base mx-auto">
          <Button variant="link" onClick={onResend} disabled={timer>0}>
            Resend OTP
          </Button>
          {timer > 0 ? `in 00:${timer < 10 ? `0${timer}` : timer}` : ""}
        </div>

      </div>

      <div className="text-center my-8">
       <a href={verificationType === 'contact' ? '/login' : '/sign-up'} className="text-base font-medium text-white hover:underline">
         {verificationType === 'contact' ? '← Login' : '← Registration Page'}
       </a>
      </div>
    </div>
  );
};

export default VerifyOTP;
