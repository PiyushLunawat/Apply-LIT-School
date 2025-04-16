import { ArrowLeft, ArrowUpRight, CheckCircle, CircleCheckBig, CircleMinus, Clock, FileTextIcon, HandMetal, ImageIcon, Link2Icon, VideoIcon } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { getCurrentStudent } from "~/api/studentAPI";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import LitmusTest from "./LitmusTest";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import JudgementCriteriaCard from "~/components/molecules/JudgementCriteriaCard/JudgementCriteriaCard";
import InterviewFeedback from "~/components/organisms/InterviewFeedback/InterviewFeedback";

interface LitmusTestTabProps {
  student: any;
  onSelectTab: (path: string) => void;
}

export default function LitmusTestTab({ student, onSelectTab }: LitmusTestTabProps) {
  const [taskOpen, setTaskOpen] = useState(false);
  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;
  const litmusTestDetails = latestCohort?.litmusTestDetails;

  console.log(latestCohort);
  
  return (
    <div className="p-8 sm:p-[52px] space-y-8 text-white">
      <div className="flex flex-row sm:flex-col gap-4 items-center sm:items-start">
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => onSelectTab("")}/>
        <div className="w-full flex justify-between items-center">
          <Badge className="text-sm w-fit border-[#FF791F] text-[#FF791F] bg-[#FF791F]/10">
            Litmus Test
          </Badge>
          <Button variant={'link'} className="underline">
            View Task
          </Button>
        </div>
      </div>
      {/* Personal Details */}
      <div className='bg-[#2C2C2C99] border p-2 w-full rounded-xl'>
        <div className='pl-3'>Your Submissions:</div>
        <div className=''>
          {cohortDetails?.litmusTestDetail[0]?.litmusTasks.map((Task: any, index: any) => (
            <div key={index} className="space-y-3">
            <div>
              <Badge className="px-3 mt-4 text-sm border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10 font-semibold -mb-2">
                Task 0{index+1}
              </Badge>
            </div>
            {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks && 
              <div className="flex flex-wrap gap-1.5">
                {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks?.[index]?.texts?.map((textItem: string, id: number) => (
                  <div key={`text-${id}`} className="w-full flex items-center gap-2 px-4 py-2 border rounded-xl bg-[#09090b]">
                    {textItem}
                  </div>
                ))}
                {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks?.[index]?.links?.map((linkItem: string, id: number) => (
                  <div key={`link-${id}`} className="min-w-1/2 flex flex-1 justify-between items-center gap-2 p-2 border rounded-xl bg-[#09090b]">
                    <div className='flex gap-2 items-center'>
                    <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                      <Link2Icon className="w-5 h-5" />
                    </Badge>
                    <span className=''>
                      {linkItem}
                    </span>
                    </div>
                    <Button size="icon" type="button" className="bg-[#1B1B1C] hover:bg-[#1a1a1d] rounded-xl" onClick={() => window.open(linkItem, "_blank")}>
                      <ArrowUpRight className="w-5" />
                    </Button>
                  </div>
                ))}
                {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks?.[index]?.images?.map((imageItem: string, id: number) => (
                  <div key={`image-${id}`} className="min-w-1/2 flex flex-1 justify-between items-center gap-2 p-2 border rounded-xl bg-[#09090b]">
                    <div className='flex gap-2 items-center'>
                      <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                        <ImageIcon className="w-5 h-5" />
                      </Badge>
                      <span className=''>
                        {imageItem.split('/').pop()}
                      </span>
                    </div>
                    <Button size="icon" type="button" className="bg-[#1B1B1C] hover:bg-[#1a1a1d] rounded-xl" onClick={() => window.open(imageItem, "_blank")}>
                      <ArrowUpRight className="w-5" />
                    </Button>
                  </div>
                ))}
                {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks?.[index]?.videos?.map((videoItem: string, id: number) => (
                  <div key={`video-${id}`} className="min-w-1/2 flex flex-1 justify-between items-center gap-2 p-2 border rounded-xl bg-[#09090b]">
                    <div className='flex gap-2 items-center'>
                    <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                      <VideoIcon className="w-5 h-5" />
                    </Badge>
                    <span className=''>
                      {videoItem.split('/').pop()}
                    </span>
                    </div>
                    <Button size="icon" type="button" className="bg-[#1B1B1C] hover:bg-[#1a1a1d] rounded-xl" onClick={() => window.open(videoItem, "_blank")}>
                      <ArrowUpRight className="w-5" />
                    </Button>
                  </div>
                ))}
                {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks?.[index]?.files?.map((fileItem: string, id: number) => (
                  <div key={`file-${id}`} className="min-w-1/2 flex flex-1 justify-between items-center gap-2 p-2 border rounded-xl bg-[#09090b]">
                    <div className='flex gap-2 items-center'>
                      <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                        <FileTextIcon className="w-5 h-5" />
                      </Badge>
                      <span className=''>
                        {fileItem.split('/').pop()}
                      </span>
                    </div>
                    <Button size="icon" type="button" className="bg-[#1B1B1C] hover:bg-[#1a1a1d] rounded-xl" onClick={() => window.open(fileItem, "_blank")}>
                      <ArrowUpRight className="w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            }
            </div>
          ))}

        </div>
    </div>
      <div className="space-y-4">
        <div className="text-base text-[#F8E000] pl-3">Scores</div>
        <div className="w-full grid grid-cols sm:grid-cols-2 gap-3">
          {cohortDetails?.litmusTestDetail?.[0]?.litmusTasks[0]?.judgmentCriteria.map((criteria: any, index: number) => ( 
            <div key={index} className="px-4 py-6 space-y-4 rounded-xl border ">
              <div className="flex gap-2 items-center text-lg font-semibold ml-1 "><HandMetal className='rotate-90 w-4'/>{criteria?.name}</div>
              {criteria?.description ?
                <div className="text-base font-normal">{criteria?.description}</div> :
                <div className="text-base text-muted-foreground font-normal">No Description Shared</div>
              }
              <div className="text-2xl font-semibold">{litmusTestDetails?.results?.[0]?.score?.[index]?.score}/{litmusTestDetails?.results?.[0]?.score?.[index]?.totalScore}</div>
          </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="text-base text-[#F8E000] pl-3">Feedback</div>
        <InterviewFeedback feedback={litmusTestDetails?.overallFeedback?.[litmusTestDetails?.overallFeedback.length - 1]?.feedback} />
      </div>
    </div>
  );
}
