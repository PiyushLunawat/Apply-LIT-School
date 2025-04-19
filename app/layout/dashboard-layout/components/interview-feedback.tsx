import { ArrowLeft, CheckCircle, CircleCheckBig, CircleMinus, Clock } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { getCurrentStudent } from "~/api/studentAPI";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import LitmusTest from "./LitmusTest";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

interface InterviewFeedbackProps {
  student: any;
  onSelectTab: (path: string) => void;
}

export default function InterviewFeedbackTab({ student, onSelectTab }: InterviewFeedbackProps) {
  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const applicationDetails = latestCohort?.applicationDetails;
  
  return (
    <div className="px-4 py-8 sm:p-[52px] space-y-8 text-white">
      <div className="flex flex-row sm:flex-col gap-4 items-center sm:items-start">
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => onSelectTab("")}/>
        <Badge className="text-sm w-fit border-[#FF791F] text-[#FF791F] bg-[#FF791F]/10">
          Interview Feedback
        </Badge>
      </div>
      {/* Interview Feedback */}
      <div className='w-full z-10 bg-[#09090B] border border-[#2C2C2C] text-white p-4 sm:p-6 mx-auto rounded-xl justify-between items-start'>
        <ul className="ml-4 sm:ml-6 space-y-2 list-disc">
          {applicationDetails?.applicationTestInterviews[applicationDetails?.applicationTestInterviews.length - 1]?.feedback[applicationDetails?.applicationTestInterviews[applicationDetails?.applicationTestInterviews.length - 1]?.feedback.length - 1]?.comments?.map((feedback: any, index: any) => (
            feedback?.length > 0 && 
            <li className="text-sm sm:text-base" key={index}>
              {feedback}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
