import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@remix-run/react';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';
import { loginOTP } from '~/utils/api';

interface LoginFormProps {
  setShowOtp: React.Dispatch<React.SetStateAction<boolean>>; 
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

// Define the Zod schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export const LoginForm: React.FC<LoginFormProps> = ({ setShowOtp, setEmail }) => {
  const navigate = useNavigate();

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
      console.log("Submitted data:", data);
      await loginOTP(data);
      setEmail(data.email);
      setShowOtp(true);
    } catch (error) {
      setError('email', { message: 'Sign-up failed. Please try again.' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email" className="text-sm font-normal pl-3">Enter your Email</Label>
              <FormControl>
                <Input id="email" type="email" placeholder="johndoe@gmail.com" {...field} />
              </FormControl>
              {errors.email && (
                <Label className="flex gap-1 items-center text-sm text-[#FF503D] font-normal pl-3">
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </Label>
              )}
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-between items-center mt-6">
          <Button onClick={handleRegisterClick} size="xl" variant="ghost">Register</Button>
          <Button type="submit" className="flex-1 space-y-1" size="xl">Send OTP</Button>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
