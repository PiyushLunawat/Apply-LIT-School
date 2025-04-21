import { ArrowLeft, ArrowUpRight, CheckCircle, CircleCheckBig, CircleMinus, Clock, FileTextIcon, HandMetal, ImageIcon, Link2, Link2Icon, VideoIcon } from "lucide-react";
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
import { Dialog, DialogClose, DialogContent, DialogTitle } from "~/components/ui/dialog";

interface LitmusTestTabProps {
  student: any;
  onSelectTab: (path: string) => void;
}

export default function LitmusTestTab({ student, onSelectTab }: LitmusTestTabProps) {
  const [taskOpen, setTaskOpen] = useState(false);
  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;
  const litmusTestDetails = latestCohort?.litmusTestDetails;

  const handleViewtask = () => {
    setTaskOpen(true);
  };
  
  <Button variant="link" className="underline" onClick={handleViewtask}>
    View Task
  </Button>
  
  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return null;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['mp4', "mkv", 'webm', 'ogg'].includes(extension)) return 'video';
    if (extension === 'pdf') return 'pdf';
    return 'other';
  };

  const taskScores = litmusTestDetails?.results || [];
  let totalScore = 0;
  let totalPercentage = 0;
  let maxScore = 0;

  taskScores.forEach((task: any) => {
    const taskScore = task?.score?.reduce((acc: any, criterion: any) => acc + criterion.score, 0);
    const taskMaxScore = task?.score?.reduce((acc: any, criterion: any) => acc + Number(criterion.totalScore), 0);
    const taskPercentage = taskMaxScore ? (taskScore / taskMaxScore) * 100 : 0;
    totalScore += taskScore;
    totalPercentage += taskPercentage;
    maxScore += taskMaxScore;
  });

  const avgTaskScore = totalPercentage / taskScores.length;

  const formatAmount = (value: number | undefined) =>
    value !== undefined
      ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(value))
      : "--";

  return (
    // student ? 
    // <div className='w-full p-8 sm:p-[52px] space-y-8'>
    //   <div className="space-y-3">
    //     <Skeleton className="h-[60px] w-full rounded-xl" />
    //     <Skeleton className="h-[60px] w-full rounded-xl" />
    //     <Skeleton className="h-[60px] w-full rounded-xl" />
    //   </div>
    //   <Skeleton className="h-[400px] w-full rounded-xl" />
    // </div> :
    <div className="px-4 py-8 sm:p-[52px] space-y-8 text-white">
      <div className="flex flex-row sm:flex-col gap-4 items-center sm:items-start">
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => onSelectTab("")}/>
        <div className="w-full flex justify-between items-center">
          <Badge className="text-sm w-fit border-[#FF791F] text-[#FF791F] bg-[#FF791F]/10">
            LITMUS Test
          </Badge>
          <Button variant={'link'} className="underline" onClick={handleViewtask}>
            View Task
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {litmusTestDetails?.scholarshipDetail && 
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border rounded-xl p-6">
            <div className="flex gap-2.5 items-center">
              <img src="/assets/icons/fee-wavier-icon.svg" className="w-12 h-8" />
              <div className="text-xl font-semibold">{litmusTestDetails?.scholarshipDetail?.scholarshipPercentage}% Waiver availed on the program fee</div>
            </div>
            <div className="flex text-[#1388FF] text-xl font-normal">
              Scholarship of INR {formatAmount(litmusTestDetails?.scholarshipDetail?.scholarshipPercentage * cohortDetails?.baseFee * 0.01)}/-
            </div>
          </div>
        }

        {litmusTestDetails?.scholarshipDetail && 
          <div className="bg-gradient-to-r from-[#DBA61D] to-[#98710A] flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border rounded-xl p-6">
            <div className="flex items-center">
              <img src="/assets/icons/score-icon.svg" className="w-12 h-8" />
              <div className="text-xl font-semibold">Weighted Total Score</div>
            </div>
            <div className="flex gap-2 text-2xl font-semibold">
              {totalScore ? totalScore : '--'}/{maxScore}
            </div>
          </div>
        }

        {litmusTestDetails?.performanceRating && 
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border rounded-xl p-6">
            <div className="flex items-center">
              <img src="/assets/icons/rating-icon.svg" className="w-8 h-8" />
              <div className="text-xl font-semibold">Performance Rating</div>
            </div>
            <div className="flex gap-2.5 items-center">
              {[...Array(5)].map((_, index) => (
                <img src={`/assets/icons/${(5 - index) > litmusTestDetails?.performanceRating ? 'no-star-icon.svg' : 'star-icon.svg'}`} key={index} className={`w-6 h-6 `} />
              ))}
            </div>
          </div>
        }
      </div>

      {/* Personal Details */}
      {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks &&
        <div className='bg-[#2C2C2C99] border p-4 w-full rounded-xl'>
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
                      <div key={`text-${id}`} className="w-full text-sm sm:text-base flex items-center gap-2 px-4 py-2 border rounded-xl bg-[#09090b]">
                        {textItem}
                      </div>
                    ))}
                    {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks?.[index]?.links?.map((linkItem: string, id: number) => (
                      <div key={`link-${id}`} className="min-w-1/2 flex flex-1 justify-between items-center gap-2 p-2 border rounded-xl bg-[#09090b]">
                        <div className='flex gap-2 items-center flex-1 w-[50vw] truncate'>
                        <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                          <Link2Icon className="w-5 h-5" />
                        </Badge>
                        <span className='text-sm sm:text-base truncate'>
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
                        <div className='flex gap-2 items-center flex-1 w-[50vw] truncate'>
                          <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                            <ImageIcon className="w-5 h-5" />
                          </Badge>
                          <span className='text-sm sm:text-base truncate'>
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
                        <div className='flex gap-2 items-center flex-1 w-[50vw] truncate'>
                        <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                          <VideoIcon className="w-5 h-5" />
                        </Badge>
                        <span className='text-sm sm:text-base truncate'>
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
                        <div className='flex gap-2 items-center flex-1 w-[50vw] truncate'>
                          <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                            <FileTextIcon className="w-5 h-5" />
                          </Badge>
                          <span className='text-sm sm:text-base truncate'>
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
      }
      {litmusTestDetails?.results &&
        <div className="space-y-4">
          <div className="text-base text-[#F8E000] pl-3">Scores</div>
          <div className="w-full grid grid-cols md:grid-cols-2 gap-3">
            {cohortDetails?.litmusTestDetail?.[0]?.litmusTasks[0]?.judgmentCriteria.map((criteria: any, index: number) => ( 
              <div key={index} className="p-4 sm:p-6 flex flex-col gap-4 justify-between rounded-xl border ">
                <div className="space-y-2">
                  <div className="flex gap-2 items-center text-lg font-semibold ml-1 "><HandMetal className='rotate-90 w-4'/><span className="flex-1">{criteria?.name}</span></div>
                  {criteria?.description ?
                    <div className="text-sm font-normal">{criteria?.description}</div> :
                    <div className="text-sm text-muted-foreground font-normal">No Description Shared</div>
                  }
                </div>
                <div className="text-2xl font-semibold">{litmusTestDetails?.results?.[0]?.score?.[index]?.score}/{litmusTestDetails?.results?.[0]?.score?.[index]?.totalScore}</div>
              </div>
            ))}
          </div>
        </div>
      }
      {litmusTestDetails?.overallFeedback?.[litmusTestDetails?.overallFeedback.length - 1]?.feedback &&
        <div className="space-y-4">
          <div className="text-base text-[#F8E000] pl-3">Feedback</div>
          <InterviewFeedback 
            feedback={litmusTestDetails?.overallFeedback?.[litmusTestDetails?.overallFeedback.length - 1]?.feedback} 
          />
        </div>
      }
      <Dialog open={taskOpen} onOpenChange={setTaskOpen} >
        <DialogTitle></DialogTitle>
        <DialogContent className="border mx-auto max-h-[70vh] sm:max-h-[90vh] p-6 sm:p-8 overflow-y-auto max-w-[90vw] sm:max-w-5xl rounded-3xl">
        <div className="flex flex-col items-start text-white shadow-md w-full mx-auto space-y-6">
          <div className='text-xl sm:text-3xl font-medium'>LITMUS Challenge submission</div>
            {cohortDetails?.litmusTestDetail?.[0]?.litmusTasks.map((task: any, taskIndex: number) => (
              <div key={taskIndex} className='space-y-7'>
                <div>
                  <Badge className="text-sm my-4 border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10">
                    Task 0{taskIndex+1}
                  </Badge>
                  <h2 className="text-xl sm:text-3xl font-semibold mb-2">
                    {task.title}
                  </h2>
                  <p className="text-base sm:text-xl mb-4">
                    {task.description}
                  </p>

                  <div className='w-full space-y-2'>
                    <div className="text-lg font-normal text-muted-foreground pl-3">
                      Resources
                    </div>
                    {task?.resources?.resourceFiles.map((file: any, index: number) => {
                      const fileType = getFileType(file);

                      switch (fileType) {
                        case 'pdf':
                          return (
                            <div className="w-full min-h-[500px] max-h-[600px] justify-center flex items-center rounded-xl">
                              <iframe src={file} className="mx-auto w-full min-h-[500px] max-h-[600px] rounded-xl" style={{ border: 'none' }} />
                            </div>
                          );
                        case 'image':
                          return (
                            <div className="w-full min-h-[400px] max-h-[500px] bg-[#2C2C2C] flex flex-col items-center text-sm border rounded-xl relative">
                              <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                className="text-white rounded-xl hover:bg-[#1a1a1d] absolute top-[6px] right-[6px] z-10"
                                onClick={() => window.open(file, "_blank")}
                              >
                                <ArrowUpRight className="w-5 h-5" />
                              </Button>
                              <img
                                src={file}
                                alt={file.split('/').pop()}
                                className="min-h-[400px] max-h-[500px] object-contain rounded-xl"
                              />
                            </div>
                          );
                        case 'video':
                          return (
                            <div className="w-full min-h-[400px] max-h-[500px] bg-[#2C2C2C] flex flex-col items-center text-sm border rounded-xl relative">
                              <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                className="text-white rounded-xl hover:bg-[#1a1a1d] absolute top-[6px] right-[6px] z-10"
                                onClick={() => window.open(file, "_blank")}
                              >
                                <ArrowUpRight className="w-5 h-5" />
                              </Button>
  
                              <video controls preload="none" className="min-h-[400px] max-h-[500px] w-full rounded-xl ">
                                <source src={file} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          );
                        default:
                          return (
                            <div key={index} className="flex gap-2 items-center justify-between w-full p-1.5 bg-[#2C2C2C] rounded-xl">
                              <div className="flex flex-1 items-center space-x-2 truncate">
                                <Badge
                                  variant="outline"
                                  size="icon"
                                  className="text-white rounded-xl bg-[#09090b]"
                                  >
                                  <FileTextIcon className="w-5 h-5" />
                                </Badge>
                                <span className="text-white truncate">{file.split('/').pop()}</span>
                              </div>
                              <Button variant="outline" size="icon" type='button'
                                className="text-white rounded-xl hover:bg-[#1a1a1d]"
                                onClick={() => window.open(file, "_blank")}
                                >
                                <ArrowUpRight className="w-5 h-5" />
                              </Button>
                            </div>
                          )}}
                        )}
  
                    {task?.resources?.resourceLinks.map((link: any, index: number) => (
                      <div key={index} className="flex gap-2 items-center justify-between w-full p-1.5 bg-[#2C2C2C] rounded-xl">
                      <div className="flex items-center space-x-2 flex-1 w-[50vw] truncate">
                        <Badge
                          variant="outline"
                          size="icon"
                          className="text-white rounded-xl bg-[#09090b]"
                          >
                          <Link2 className="w-5 h-5" />
                        </Badge>
                        <span className="text-white truncate">{link}</span>
                      </div>
                      <Button variant="outline" size="icon" type='button'
                        className="text-white rounded-xl hover:bg-[#1a1a1d]"
                        onClick={() => window.open(link, "_blank")}
                        >
                        <ArrowUpRight className="w-5 h-5" />
                      </Button>
                    </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
