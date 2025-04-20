import React, { useState } from 'react';
import { AlertCircle, Mail } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@remix-run/react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/components/ui/form';
import { loginOTP } from '~/api/authAPI';
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog';
import VerifyOTP from './VerifyOTP';

interface LoginFormProps {
}

// Define the Zod schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export const LoginForm: React.FC<LoginFormProps> = ({ }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const { handleSubmit, formState: { errors }, setError, control } = form;

  const handleRegisterClick = () => {
    navigate('../sign-up');
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setLoading(true);
      console.log("Submitted data:", data);
      const res = await loginOTP(data);
      console.log("Error:", res);
      setEmail(data.email);
      setShowOtp(true);
    } catch (error: any) {
      console.log(error);
      setError('email', {
        type: 'manual', 
        message: error.message || 'An unexpected error occurred', // Display the error message
      });
    } finally{
      setLoading(false);
    }
  };

  return (
    <>
    <div className="gap-1 sm:gap-4 flex flex-col text-center">
        <div className="text-2xl sm:text-3xl font-semibold ">Join the Education Revolution!</div>
        <div className="text-sm sm:text-base font-light sm:font-normal ">Access your dashboard by verifying your Email</div>
    </div>
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1 relative">
              <Label htmlFor="email" className="text-sm font-normal pl-3">Enter your Email</Label>
              <FormControl>
                <Input id="email" type="email" className='pr-10' placeholder="john@gmail.com" {...field} />
              </FormControl>
              <Mail className="absolute right-3 top-[42px] w-5 h-5" />
              {errors.email && (
                <Label className="flex gap-1 items-center text-[#FF503D] text-xs sm:text-sm font-normal pl-3">
                  {errors.email.message}
                </Label>
              )}
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-between items-center mt-6">
          <Button onClick={handleRegisterClick} type="button" size="xl" variant="ghost" className='bg-[#27272A] hidden sm:block'>
            Register
          </Button>
          <Button type="submit" className="flex-1 space-y-1" size="xl" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </div>
      </form>
    </Form>

    <Dialog open={showOtp} onOpenChange={setShowOtp}>
    <DialogTitle></DialogTitle>
      <DialogContent className='flex flex-col gap-6 sm:gap-8 bg-[#1C1C1C] rounded-3xl max-w-[90vw] sm:max-w-2xl lg:max-w-4xl overflow-y-auto mx-auto !p-0'>
      <VerifyOTP
          verificationType="email"
          contactInfo={email}
          errorMessage="Oops! Looks like you got the OTP wrong, Please Retry."
        />
      </DialogContent>
    </Dialog>
    </>
  );
};

export default LoginForm;
