import React from 'react';
import { Separator } from '~/components/ui/separator';

export const Footer: React.FC = () => {
  return (
    <footer className="space-y-6 sm:space-y-10 items-center text-white py-10 sm:py-14 px-4 sm:px-16 lg:px-24">
        <div className="grid sm:flex items-center gap-6 sm:gap-8">
            <img src="/assets/images/lit-logo.svg" alt="LIT Logo" className="h-[60px] sm:h-[80px]" />
            <div className='space-y-2'>
                <div className="font-random text-2xl sm:text-3xl font-bold">Learn Innovate Transform</div>
                <div className="max-w-[300px] sm:max-w-[350px] text-sm sm:text-base font-normal">
                  LIT is a one-of-a-kind experiential learning program for the next generation of learners.
                </div>
            </div>
        </div>

        <Separator className="bg-[#00AB7B]" />
        
        <div className="flex justify-between text-xs sm:text-lg font-normal">
            <div className='w-fit'>
                <span className='text-muted-foreground'>&copy; </span>
                2025 Disruptive Edu Pvt. Ltd.
            </div>
            <div className='w-fit'>All Rights Reserved</div>
        </div>
    </footer>
  );
};

export default Footer;
