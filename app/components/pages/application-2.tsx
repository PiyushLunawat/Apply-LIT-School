import React, { useContext, useEffect, useState } from 'react';
import Header from '../organisms/Header/Header';
import Footer from '../organisms/Footer/Footer';
import ProgressBar from '../molecules/ProgressBar/ProgressBar';
import BookYourSeat from '../molecules/BookYourSeat/BookYourSeat';
import Review from '../organisms/Review/Review';
import { getCurrentStudent, getStudents } from '~/utils/studentAPI';
import { useNavigate } from '@remix-run/react';
import { Card } from '../ui/card';


export const ApplicationStep2: React.FC = () => {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [failedDialogOpen, setFailedDialogOpen] = useState(false);
  const [part2, setPart2] = useState(false);
  // const [name, setName] = useState("");
  // const [status, setStatus] = useState("");
  // const [studentData, setStudentData] = useState<any>(null);

  // // Initialize from localStorage when the component mounts
  // useEffect(() => {
  //   const storedData = localStorage.getItem('studentData');
  //   if (storedData) {
  //     setStudentData(JSON.parse(storedData));
  //   }
  // }, []);

  // useEffect(() => {
  //   async function fetchCurrentStudentData() {
  //     try {

  //         const res = await getCurrentStudent(studentData?._id);
  //         console.log(' student data:', res.data?.applicationDetails?.applicationStatus);
  //         setName(res.data?.firstName);
  //         setStatus(res.data?.applicationDetails?.applicationStatus)
         
  //     } catch (error) {
  //       console.log('Error fetching student data:', error);
  //     }
  //   }

  //   fetchCurrentStudentData();
  // }, [studentData]);

  // const handlePayment = () => {
  //   setPart2(true);
  //   const paymentSuccess = true;
  //   if (paymentSuccess) {
  //     setSuccessDialogOpen(true);
  //   } else {
  //     setFailedDialogOpen(true);
  //   }
  // };

  return (
    !part2 ? 
    <div className="w-full">
      <Header subtitle="" /> 
      <div className="max-w-[1216px] mx-8 sm:mx-16 xl:mx-auto justify-center items-center space-y-20">
        <Review /> 
        <div className='space-y-4 sm:space-y-6 ' >
          <ProgressBar currentStage={2} />
          <img src="/assets/images/application-process-02.svg" alt="BANNER" className="w-full rounded-xl sm:rounded-3xl" /> 
        </div>
      </div>
      <Footer />
    </div> : 
    <div className="w-full">
      <Header subtitle="Your Payment is being verified" submessage='You may access your dashboard once your payment has been verified'/>
      <img src="/assets/images/application-process-02.svg" alt="BANNER" className="w-screen my-8 sm:my-12" />
      <div className="w-full px-6 justify-center items-center">
        <Card className='max-w-4xl mx-auto px-6 py-8'>
          <div className='mx-4 space-y-4'>
            <div className='flex justify-between items-center'>
              <div className='text-2xl font-normal'>Payment Receipt is being verified</div>
              <div className='font-normal'>3 September, 2024</div>
            </div>
            {true ? 
              <div className='font-normal'>Paid via Bank Transfer to LITschool</div> :
              <div className='font-normal'>Paid via Cash to LITschool</div>
            }
            <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
              <img src={'/assets/images/application-process-02.svg'} alt="Uploaded receipt" className="mx-auto h-full  "/>
            </div>
          </div>
        </Card>

        <Footer />
      </div>
    </div>
  );
};

export default ApplicationStep2;
