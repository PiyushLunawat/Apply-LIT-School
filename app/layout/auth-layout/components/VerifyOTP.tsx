import React, { useState, useEffect, useContext } from 'react';
import { verifyOtp, resendOtp, verifyMobileOTP } from '~/api/authAPI';
import Cookies from 'js-cookie';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '~/components/ui/input-otp';
import { Button } from '~/components/ui/button';
import { MailIcon, Phone } from 'lucide-react';
import { Label } from '~/components/ui/label';
import { useNavigate, useRevalidator } from '@remix-run/react';
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
import { getCurrentStudent, updateStudentData } from '~/api/studentAPI';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from 'firebase.config';
import { RegisterInterceptor } from '~/utils/interceptor';

const formSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits" })
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
  onResendOtp?: (contact: string) => Promise<void>;
}

export const VerifyOTP: React.FC<VerifyOTPProps> = ({
  verificationType,
  contactInfo,
  errorMessage,
  setIsDialogOpen,
  onVerificationSuccess,
  verificationId,
  onResendOtp
}) => {
    const navigate = useNavigate();
    const { studentData, setStudentData } = useContext(UserContext);
    const [timer, setTimer] = useState(59);
    const [loading, setLoading] = useState(false);
    const { revalidate } = useRevalidator();
    
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

        if (res.success) {
          // If OTP is verified successfully, send the response to the server-side action
          const response = await fetch('/set-cookies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
              userId: res.user.id,
            }),
          });
  
          const result = await response.json();
  
          if (result.success) {
            // Optionally store student data in context or local storage
            localStorage.setItem('studentData', JSON.stringify(res.user));
            setStudentData(res.user);
          } else {
            form.setError('otp', { type: 'manual', message: result.message });
          }
        } else {
          form.setError('otp', { type: 'manual', message: 'OTP verification failed' });
        }

        console.log("resp",res)
        revalidate();
        // Store studentData in localStorage
        await RegisterInterceptor(res.accessToken, res.refreshToken)
        
        const student = await getCurrentStudent(res.user.id);
        if (student) {
          localStorage.setItem('studentData', JSON.stringify(student));
          const storedData = localStorage.getItem('studentData');
          if (storedData) {
            setStudentData(JSON.parse(storedData));
          }
        }

        if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'dropped'){
          navigate('../../new-application');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'enrolled'){
          navigate('../../dashboard');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'reviewing'){
          navigate('../../application/status');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'applied'){
          navigate('../../application/task');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'initiated'){
          navigate('../../application');
        } else {
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

          const response = await updateStudentData({
            mobileNumber: contactInfo,
            isMobileVerified: true,
          });
          console.log("response",response);
          
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
          form.setError('otp', { type: 'manual', message: `${error || `OTP verification failed`}` });
          console.error("Error verifying OTP:", error);
        }
      }
      
    } catch (error) {
      console.log('OTP failed:', error);
      form.setError('otp', { type: 'manual', message: `${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      if (verificationType === 'contact' && onResendOtp) {
        // Use parent's resend logic for contact verification
        await onResendOtp(contactInfo);
        form.clearErrors("otp");
        reset({ otp: '' });
        setTimer(60);
      } else {
        // Existing email resend logic
        await resendOtp({ email: contactInfo });
        setTimer(60);
        form.clearErrors("otp");
        reset({ otp: '' });
      }
    } catch (error) {
      console.error('Resend OTP failed:', error);
      form.setError('otp', { type: 'manual', message:`Failed to resend OTP. ${error}` });
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
                <FormItem className='flex flex-col items-center'>
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