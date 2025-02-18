// app/components/application/ApplicationDetails.tsx
import React, { useState } from 'react';
import ApplicationDetailsForm from '../components/ApplicationDetailsForm';
import SubHeader from '~/components/organisms/SubHeader/SubHeader';

export const ApplicationDetails: React.FC = () => {

  return (
    <>  
        <SubHeader subtitle='Welcome to LIT' submessage='Get started with your application process' />
        <img src="/assets/images/application-process-01.svg" alt="BANNER" className="w-screen object-left object-cover overflow-x-auto h-[188px] sm:h-full my-6 sm:my-12" />
          
        <div className="w-full px-4 justify-center items-center">
          <div className='max-w-[1000px] mx-auto'> 
            <ApplicationDetailsForm />
          </div>
        </div>
    </>
  );
};

export default ApplicationDetails;
