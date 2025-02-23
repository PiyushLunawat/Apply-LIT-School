import React, { useState, useEffect, useContext } from 'react';
import { verifyOtp, resendOtp, verifyMobileOTP } from '~/utils/authAPI';
import Cookies from 'js-cookie';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '~/components/ui/input-otp';
import { Button } from '~/components/ui/button';
import { MailIcon, Phone } from 'lucide-react';
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
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from 'firebase.config';

const formSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
    generalError: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
interface VerifyOTPProps {
  verificationType: 'contact' | 'email'; 
  contactInfo: string; 
  errorMessage?: string;
  setIsDialogOpen?: (isOpen: boolean) => void;
  onVerificationSuccess?: () => void;
  verificationId?: string;
}

export const VerifyOTP: React.FC<VerifyOTPProps> = ({
  verificationType,
  contactInfo,
  errorMessage,
  setIsDialogOpen,
  onVerificationSuccess,
  verificationId,
}) => {
    const navigate = useNavigate();
    const { studentData, setStudentData } = useContext(UserContext);
    const [timer, setTimer] = useState(59);
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        otp: '',
      },
    });
    
    const { register, handleSubmit, formState: { errors }, reset } = form;    

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
        Cookies.set('user-token', res.token, { expires: 4});

        console.log("resp",res)
        // Store studentData in localStorage
        if (res.studentData) {
        localStorage.setItem('studentData', JSON.stringify(res.studentData));
          const storedData = localStorage.getItem('studentData');
          if (storedData) {
            setStudentData(JSON.parse(storedData));
          }
        }
        if(res.studentData?.appliedCohorts[res.studentData?.appliedCohorts.length - 1]?.status === 'enrolled'){
          navigate('../../dashboard');
        }
        else if(['initated', 'applied'].includes(res.studentData?.appliedCohorts[res.studentData?.appliedCohorts.length - 1]?.status)){
          console.log("navigating")
          console.log('studentData?._id:', studentData?._id);
            // if(res.data?.applicationDetails?.applicationStatus !== "initiated" &&
            //   res.data?.applicationDetails?.applicationStatus !== undefined){
            //     navigate('../../application/status');
            //   }
            // else
              navigate('../../application');
        }
        else{
          navigate('../../application');
        }
      }

      if(verificationType === 'contact' && verificationId){
        // const fullOtp = otp.join('');
        console.log("otp",data.otp);
        console.log("verificationId",verificationId);
        
        const credential = PhoneAuthProvider.credential(verificationId, data.otp);
        try {
          const data = await signInWithCredential(auth, credential);
          // setIsVerified(true);
          console.log(data.user.phoneNumber, "dtaa");

          if (studentData) {
            setStudentData({
              ...studentData,
              isMobileVerified: true,
              mobileNumber: contactInfo,
            });
          }

          if (setIsDialogOpen) { 
            setIsDialogOpen(false); 
          }
        } catch (error) {
          console.error("Error verifying OTP:", error);
        }

        // if (res?.data) {
        //   localStorage.setItem('studentData', JSON.stringify(res.data));
        //   setStudentData(res.data); 
        //   if (setIsDialogOpen) { // Ensure it's defined
        //     setIsDialogOpen(false); 
        //   }
        //   console.log('Mobile number verified successfully.');
        // }
      }
      
    } catch (error) {
      console.error('OTP verification failed:', error);
      form.setError('generalError', { type: 'manual', message: `OTP verification failed. ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await resendOtp({ email: contactInfo });
      setTimer(60);
      form.clearErrors("generalError");
      reset({ otp: '' });
    } catch (error) {
      console.error('Resend OTP failed:', error);
      form.setError('generalError', { type: 'manual', message:`Failed to resend OTP. ${error}` });
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="p-8 sm:p-16">
        <div className="flex justify-center mb-6">
          <img src="/assets/images/otp-verify-icon.svg" alt="Verify OTP" className="w-24 sm:w-32" />
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 text-center text-2xl font-semibold mb-2">
          {verificationType === 'contact' ? 'Verify Your Contact No.' : 'Verify Your Account'}
          <div className="text-center text-base">
            {verificationType === 'contact' ?
                <div className='sm:w-fit sm:flex text-center mx-auto'>
                  <span className='font-light sm:font-normal'>An OTP was sent to your contact no.</span>
                  <span className='flex text-center font-light sm:font-normal mx-auto w-fit items-center'>
                    <Phone className='w-4 h-4 ml-2 mr-1'/> {contactInfo}
                  </span>
                </div> : 
                <div className='sm:w-fit sm:flex text-center mx-auto'>
                  <span className='font-light sm:font-normal'>An OTP was sent to your email</span>
                  <span className='flex text-center font-light sm:font-normal mx-auto w-fit items-center'>
                    <MailIcon className='w-4 h-4 ml-2 mr-1'/> {contactInfo}
                  </span>
                </div>
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
                    <InputOTP maxLength={6} {...field}
                    onChange={(e: any) => {
                    field.onChange(e);
                  }}>
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
              <div className="text-center mt-8">
                <Button size="xl" type="submit" disabled={loading}>
                  {loading ? 'Wait...' : verificationType === 'contact' ? 'Verify' : 'Confirm and Login'}
                </Button>
              </div>
          </form>
        </Form>


        <div className="flex gap-2 text-center items-center justify-center text-base mx-auto mt-2">
          <Button variant="link"className='underline' onClick={handleResendOtp} disabled={loading || timer>0}>
            {loading ? 'Resending OTP...' : 'Resend OTP'}
          </Button>
          {timer > 0 ? `in 00:${timer < 10 ? `0${timer}` : timer}` : ""}
        </div>
      </div>
  );
};

export default VerifyOTP;