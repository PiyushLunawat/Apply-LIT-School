import { useNavigate } from '@remix-run/react';
import Cookies from 'js-cookie';
import React, { useContext } from 'react';
import { Button } from '~/components/ui/button';
import { UserContext } from '~/context/UserContext';

interface HeaderProps {
  subtitle?: boolean;  // Optional subtitle prop
}

export const Header: React.FC<HeaderProps> = ({ subtitle }) => {
    const navigate = useNavigate();

    const { studentData, setStudentData } = useContext(UserContext);

    const handleLogout = () => {
      Cookies.remove('user-token');
      localStorage.removeItem('studentData');
      setStudentData(null); // Reset student data in the context
      navigate('../login');
    };
    // console.log("svs",studentData)
    
  return (
    <header className="flex flex-col gap-3 sm:gap-5 py-8">
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <img onClick={() => navigate('../')} src="/assets/images/lit-logo.svg" alt="LIT Logo" className="w-8 sm:w-14" />
        </div>

        <div className="flex items-center">
          <Button variant="link" onClick={handleLogout} className="text-sm sm:text-base underline">
            Logout
          </Button>
        </div>
      </div>

      {subtitle && <div className="flex flex-col gap-2 sm:gap-4 text-center px-4 ">
        <div className="text-xl sm:text-3xl font-semibold">
          Hey {studentData?.firstName} <span role="img" aria-label="waving-hand">👋</span> Welcome to LIT
        </div>
        <div className="text-xs sm:text-base">Get started with your application process</div>
      </div>}
    </header>
  );
};

export default Header;
