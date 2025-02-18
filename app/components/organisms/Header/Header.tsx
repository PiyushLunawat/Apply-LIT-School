import { useNavigate } from '@remix-run/react';
import Cookies from 'js-cookie';
import { UploadIcon } from 'lucide-react';
import React, { useContext } from 'react';
import { Button } from '~/components/ui/button';
import { UserContext } from '~/context/UserContext';

interface HeaderProps {
  classn?: string;
}

export const Header: React.FC<HeaderProps> = ({ classn }) => {
    const navigate = useNavigate();
    const { studentData, setStudentData } = useContext(UserContext);

    const handleLogout = () => {
      Cookies.remove('user-token');
      localStorage.removeItem('studentData');
      setStudentData(null);
      navigate('../auth/login');
    };
    
  return (
    <header className={`flex flex-col gap-2 sm:gap-4 py-2 ${classn}`}>
      <div className="px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center">
              <img onClick={() => navigate('../')} src="/assets/images/lit-logo.svg" alt="LIT Logo" className="w-6" />
          </div>

          <div className="flex items-center">
              <Button variant="ghost" onClick={handleLogout} className="flex gap-2 px-0 hover:bg-background text-sm sm:text-base">
                <UploadIcon className="w-4 h-4 -rotate-90" />Logout
              </Button>
          </div>
      </div>
    </header>
  );
};

export default Header;
