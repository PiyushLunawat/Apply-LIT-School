import React, { useState, useEffect } from 'react';
import { verifyOtp, resendOtp } from '~/utils/api';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../../ui/input-otp';
import { Button } from '~/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Label } from '~/components/ui/label';
import { useNavigate } from '@remix-run/react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
});

type FormValues = z.infer<typeof formSchema>;
interface VerifyOTPProps {
  verificationType: 'contact' | 'email'; // Contact or Email
  contactInfo: string; // The phone number or email to display
  errorMessage?: string; // Optional error message
}

export const VerifyOTP: React.FC<VerifyOTPProps> = ({
  verificationType,
  contactInfo,
  errorMessage
}) => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(59);
    const [resendError, setResendError] = useState<string | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);

    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        otp: '',
      },
      });

    const { register, handleSubmit, formState: { errors } } = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: { otp: '' },
    });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      console.log("otpp", data.otp);
      const res = await verifyOtp({ email: contactInfo, otp: data.otp });
      console.log("response",res)
      navigate('../dashboard/application-step-1');
    } catch (error) {
      console.error('OTP verification failed:', error);
      setVerifyError('OTP verification failed. Please check your OTP and try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email: contactInfo });
      setTimer(60);
      setResendError(null);
    } catch (error) {
      console.error('Resend OTP failed:', error);
      setResendError('Failed to resend OTP. Please try again later.');
    }
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
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                      <InputOTPSeparator />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

          {(resendError || verifyError) && (
            <Label htmlFor="contact-error" className='flex gap-1 items-center text-sm justify-start text-[#FF503D] font-normal pl-3 mt-2'>
              <AlertCircle className='w-3 h-3'/>{resendError  || verifyError}
            </Label>
          )}

          {errors.otp && (
            <Label className="text-sm text-red-500 mt-2">{errors.otp.message}</Label>
          )}
          
          <div className="text-center mt-4">
            <Button size="xl" type="submit">
              {verificationType === 'contact' ? 'Confirm and Login' : 'Confirm and Proceed'}
            </Button>
          </div>
      </form>
    </Form>


        <div className="flex gap-2 text-center items-center text-base mx-auto">
          <Button variant="link" onClick={handleResendOtp} disabled={timer>0}>
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
