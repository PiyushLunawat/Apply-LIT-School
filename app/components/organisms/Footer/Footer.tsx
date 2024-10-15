import React from 'react';
import { Separator } from '~/components/ui/separator';

export const Footer: React.FC = () => {
  return (
    <footer className="text-white py-14">
      <div className=" px-8 sm:px-16 lg:px-24">
        <div className="space-y-[42px] items-center">
          {/* Left section - Logo and Text */}
          <div className="flex items-center gap-4 sm:gap-8">
            <img src="/assets/images/lit-logo.svg" alt="LIT Logo" className="h-[60px] sm:h-[80px]" />
            <div className='space-y-2 '>
              <div className="text-lg sm:text-3xl font-bold">Learn Innovate Transform</div>
              <div className="max-w-[250px] sm:max-w-[350px] text-xs sm:text-base ">
                LIT is a one-of-a-kind experiential learning program for the next generation of learners.
              </div>
            </div>
          </div>

          <Separator className="bg-[#00AB7B]" />
          
          <div className="flex justify-between text-sm sm:text-lg">
            <div className='w-fit'>&copy; 2024 Disruptive Edu Pvt. Ltd.</div>
            <div className='w-fit'>All Rights Reserved</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
