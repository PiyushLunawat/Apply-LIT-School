import React, { useState, useEffect, useContext } from 'react';
import { verifyOtp, resendOtp, verifyMobileOTP } from '~/utils/authAPI';
import Cookies from 'js-cookie';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../../ui/input-otp';
import { Button } from '~/components/ui/button';
import { AlertCircle, MailIcon, Phone, PhoneCallIcon } from 'lucide-react';
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
import { UserContext } from '~/context/UserContext';
import { getCurrentStudent } from '~/utils/studentAPI';

const formSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
});

type FormValues = z.infer<typeof formSchema>;
interface VerifyOTPProps {
  verificationType: 'contact' | 'email'; 
  contactInfo: string; 
  errorMessage?: string;
  setIsDialogOpen?: (isOpen: boolean) => void;
  onVerificationSuccess?: () => void;
  back?: string;
}

export const VerifyOTP: React.FC<VerifyOTPProps> = ({
  verificationType,
  contactInfo,
  errorMessage,
  setIsDialogOpen,
  onVerificationSuccess,
  back
}) => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(59);
    const [resendError, setResendError] = useState<string | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const { studentData, setStudentData } = useContext(UserContext);
    const [loading, setLoading] = useState(false);

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
      setLoading(true);


      if(verificationType === 'email'){
        const res = await verifyOtp({ email: contactInfo, otp: data.otp });
        Cookies.set('user-token', res.token);
        // Store studentData in localStorage
        if (res.studentData) {
          localStorage.setItem('studentData', JSON.stringify(res.studentData));
          const storedData = localStorage.getItem('studentData');
          if (storedData) {
            setStudentData(JSON.parse(storedData));
          }
        }

      if(res.studentData?.litmusTestDetails[0]?.litmusTaskId !== undefined)
        navigate('../dashboard');

      else if(res.studentData?.applicationDetails !== undefined){
       
              console.log('studentData?._id:', studentData?._id);
                const res = await getCurrentStudent(studentData?._id);
                  console.log(' student data:', res.data?.applicationDetails?.applicationStatus);
                if(res.data?.applicationDetails?.applicationStatus !== "initiated" &&
                  res.data?.applicationDetails?.applicationStatus !== undefined){
                    navigate('/dashboard/application-step-2');
                  }
          }
      else
        navigate('../dashboard/application-step-1');
      }

      if(verificationType === 'contact'){
        const res = await verifyMobileOTP({ mobileNumber: contactInfo, otp: data.otp });

        if (res?.data) {
          localStorage.setItem('studentData', JSON.stringify(res.data));
          setStudentData(res.data); 
          if (setIsDialogOpen) { // Ensure it's defined
            setIsDialogOpen(false); 
          }
          console.log('Mobile number verified successfully.');
        }
      }
      
    } catch (error) {
      console.error('OTP verification failed:', error);
      setVerifyError('OTP verification failed. Please check your OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);

      await resendOtp({ email: contactInfo });
      setTimer(60);
      setResendError(null);
    } catch (error) {
      console.error('Resend OTP failed:', error);
      setResendError('Failed to resend OTP. Please try again later.');
    } finally {
      setLoading(false);
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
              ? <div className='w-fit flex items-center text-center mx-auto'>An OTP was sent to your contact no. <Phone className='w-3 h-3 mx-1'/> {contactInfo}</div>
              : <div className='w-fit flex items-center text-center mx-auto'>An OTP was sent to your email <MailIcon className='w-3 h-3 mx-1'/> {contactInfo}</div>
            }
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
            <Button size="xl" type="submit" disabled={loading}>
              {loading ? '...' : verificationType === 'contact' ? 'Verify and Login' : 'Confirm and Login'}
            </Button>
          </div>
      </form>
    </Form>


        <div className="flex gap-2 text-center items-center text-base mx-auto">
          <Button variant="link" onClick={handleResendOtp} disabled={loading || timer>0}>
            {loading ? 'Resending OTP...' : 'Resend OTP'}
          </Button>
          {timer > 0 ? `in 00:${timer < 10 ? `0${timer}` : timer}` : ""}
        </div>

      </div>

      {(verificationType === 'email') && (back === 'login' ? 
        <div className="text-center my-8">
         <a href={'/login'} className="text-base font-medium text-white hover:underline">
           {'← Login'}
         </a>
        </div> : 
        <div className="text-center my-8">
        <a href={'/sign-up'} className="text-base font-medium text-white hover:underline">
          {'← Register'}
        </a>
       </div>)
      }
    </div>
  );
};

export default VerifyOTP;
