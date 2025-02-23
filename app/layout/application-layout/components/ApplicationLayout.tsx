import { Outlet, useNavigate } from "@remix-run/react";
import React, { useContext, useEffect, useState } from "react";
import Footer from "~/components/organisms/Footer/Footer";
import Header from "~/components/organisms/Header/Header";
import { Skeleton } from "~/components/ui/skeleton";
import { UserContext } from "~/context/UserContext";
import { getCurrentStudent } from "~/utils/studentAPI";

export default function ApplicationLayout() {
  const { studentData, setStudentData } = useContext(UserContext); 
  const [loading, setLoading] = useState(true);
  const [subtitle, setSubtitle] = useState("");
  const [submessage, setSubmessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCurrentStudentData() {
      if (!studentData?._id) {
        setLoading(false);
        return;
      }
      try {
        const res = await getCurrentStudent(studentData._id);
        const status = res.data?.applicationDetails?.applicationStatus;
        const isVerified = res.data?.cousrseEnrolled?.[res.data.cousrseEnrolled.length - 1]?.tokenFeeDetails?.verificationStatus;
        // if (status === undefined || status === "") {
        //   setSubtitle('Welcome to LIT');
        //   setSubmessage('Get started with your application process');
        //   navigate("/application");
        // } else if (["initiated"].includes(status)) {
        //   setSubtitle('Welcome to LIT');
        //   setSubmessage(`Dive into the ${res.data?.program?.name} Course`);
        //   navigate("/application/task");
        // } else if (["selected"].includes(status) && isVerified === 'paid') {
        //   navigate("/dashboard");
        // } else {
        //     if(status === 'Interview Scheduled') {
        //       setSubtitle('Welcome to LIT');
        //       setSubmessage(`Book your interview call with our counsellors.`);
        //     } else if(isVerified === 'pending') {
        //       setSubtitle('Your Payment is being verified');
        //       setSubmessage(`You may access your dashboard once your payment has been verified.`);
        //     } else if(isVerified === 'flagged') {
        //       setSubtitle('Your Payment verification failed');
        //       setSubmessage(`You may access your dashboard once your payment has been verified.`);
        //     } else if(isVerified === 'paid') {
        //       setSubtitle('Your Payment is verified');
        //       setSubmessage(`You may access your dashboard.`);
        //     }  else {
        //       setSubtitle('');
        //       setSubmessage(``);
        //     }
        //   navigate("/application/status");
        // }
      } catch (error) {
        console.log("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentStudentData();
  }, [studentData, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
        <Header />      
        <div className="p-0">
            <Outlet />
        </div>
        <Footer />
    </div>
  );
}
