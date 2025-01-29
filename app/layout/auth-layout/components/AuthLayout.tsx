// app/components/auth/AuthLayout.tsx
import React from 'react';
import { Outlet, useLocation, useNavigate } from '@remix-run/react';
import ApplicationQNA from './ApplicationQNA';
import Footer from '~/components/organisms/Footer/Footer';

const AuthLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on URL
  const isLoginActive = location.pathname.includes("/auth/login");
  const isRegisterActive = location.pathname.includes("/auth/sign-up");

  return (
    <div className="w-full">
      <div className="relative w-full h-[200px] sm:h-[336px]">
        <img src="/assets/images/banner.svg" alt="BANNER" className="w-full h-full object-cover hidden sm:block" />
        <img src="/assets/images/banner-mobile.svg" alt="BANNER" className="w-full h-full object-cover sm:hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/0"></div>
        <img src="/assets/images/lit-logo.svg" alt="LIT" className="absolute top-7 left-7 w-12 sm:w-16"/>
        
        <div className="relative bottom-5 flex justify-center mx-auto sm:hidden">
            <div className="flex bg-[#27272A] rounded-full">
            <button className={`px-6 py-2 rounded-full transition-bg duration-300 ease-in-out text-white
                ${ isLoginActive ? "bg-[#FF791F]" : "bg-transparent" }`}
                onClick={() => navigate("/auth/login")} >
                Login
            </button>
            <button className={`px-6 py-2 rounded-full transition-bg duration-800 ease-in-out text-white 
                ${ isRegisterActive ? "bg-[#00A3FF]" : "bg-transparent" }`}
                onClick={() => navigate("/auth/sign-up")} >
                Register
            </button>
            </div>
        </div>
      </div>

      
      <div className="space-y-16 sm:space-y-24">
        <div className="w-full px-4 mt-14 justify-center items-center">
          <div className='max-w-[840px] mx-auto space-y-4 sm:space-y-6'>
            <Outlet />
          </div>
        </div>
        <ApplicationQNA />
        <Footer />
      </div>
    </div>
  );
};

export default AuthLayout;
