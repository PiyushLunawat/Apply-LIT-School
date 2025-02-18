import { useNavigate } from '@remix-run/react';
import Cookies from 'js-cookie';
import { UploadIcon } from 'lucide-react';
import React, { useContext } from 'react';
import { Button } from '~/components/ui/button';
import { UserContext } from '~/context/UserContext';

interface SubHeaderProps {
  subtitle?: string ;
  submessage?: string
  classn?: string;
}

export const SubHeader: React.FC<SubHeaderProps> = ({ subtitle, submessage, classn }) => {
    const navigate = useNavigate();
    const { studentData, setStudentData } = useContext(UserContext);
    
  return (
      <div className="flex flex-col gap-1 sm:gap-2 text-center px-4">
        <div className="text-[22px] sm:text-3xl font-semibold">
          Hey {studentData?.firstName} <span role="img" aria-label="waving-hand">👋</span> {subtitle}
        </div>
        <div className="text-sm sm:text-base font-light sm:font-normal">{submessage}</div>
      </div>
  );
};

export default SubHeader;
