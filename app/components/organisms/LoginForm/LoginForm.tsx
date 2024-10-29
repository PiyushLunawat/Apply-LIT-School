import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useNavigate } from '@remix-run/react';

interface LoginFormProps {
  setShowOtp: React.Dispatch<React.SetStateAction<boolean>>; // Passing the setShowOtp function from parent
}

export const LoginForm: React.FC<LoginFormProps> = ({ setShowOtp }) => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('../sign-up');
  };


    const handleVerifyClick = () => {
      setShowOtp(true); // This will set showotp to true in the parent component
    };

  return (
    <div className="flex flex-col gap-4 mt-8">
              <div className='flex-1 space-y-1'>
                <Label htmlFor="contact" className='text-sm font-normal pl-3'>Enter your Email</Label>
                <Input id="contact" type="tel" placeholder="johndoe@gmail.com" />
                <Label htmlFor="contact-error" className='flex gap-1 items-center text-sm text-[#FF503D] font-normal pl-3'><AlertCircle className='w-3 h-3'/>This Email has not been registered with us. Kindly register to access your application dashboard.</Label>
              </div>

              <div className="flex gap-2 justify-between items-center mt-6">
                <Button onClick={handleRegisterClick} size="xl" variant="ghost">Register</Button>
                <Button onClick={handleVerifyClick} className='flex-1 space-y-1' size="xl" >Sent OTP</Button>
              </div>
          </div>
  );
};

export default LoginForm;
