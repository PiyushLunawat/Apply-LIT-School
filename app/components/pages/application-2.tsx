import React, { useContext, useEffect, useState } from 'react';
import Header from '../organisms/Header/Header';
import Footer from '../organisms/Footer/Footer';
import ProgressBar from '../molecules/ProgressBar/ProgressBar';
import BookYourSeat from '../molecules/BookYourSeat/BookYourSeat';
import Review from '../organisms/Review/Review';
import { getCurrentStudent, getStudents } from '~/utils/studentAPI';
import { useNavigate } from '@remix-run/react';


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
    <div className="w-full">
      <Header subtitle={false} />
      
      <div className="max-w-[1216px] mx-8 sm:mx-16 xl:mx-auto justify-center items-center space-y-20">
        <Review />
        
        <div className='space-y-4 sm:space-y-6 ' >
          <ProgressBar currentStage={2} />
          <img src="/assets/images/application-process-02.svg" alt="BANNER" className="w-full rounded-xl sm:rounded-3xl" /> 
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApplicationStep2;
