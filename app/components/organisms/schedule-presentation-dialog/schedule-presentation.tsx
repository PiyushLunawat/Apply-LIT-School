import {
  Edit,
  Mail,
  Download,
  UserMinus,
  RefreshCw,
  Calendar,
  FileSignature,
  Edit2Icon,
  EyeIcon,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { UserContext } from "~/context/UserContext";
import { getCohortById, getCurrentStudent } from "~/api/studentAPI";

interface SchedulePresentationProps {
  student: any;
  interviewer: [];
  eventCategory: string;
  redirectUrl: string;
}

export function SchedulePresentation({ student, interviewer, eventCategory, redirectUrl }: SchedulePresentationProps) {
    const [selectedInterviewer, setSelectedInterviewer] = useState<any | null>(null);

    let latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];


    const handleSelect = (interviewer: any) => {
        setSelectedInterviewer(interviewer);
    };

    const handleScheduleRedirect = () => {
        if (!selectedInterviewer || !student?._id || !latestCohort?.cohortId?._id) return;
        const url = `https://dev.cal.litschool.in/${selectedInterviewer?.personalUrl}/${selectedInterviewer?.events[0]?.eventName || ''}?name=${student?.firstName || ''}${student?.lastName || ''}&email=${student?.email || ''}&litApplicationUserId=${student?._id}&cohortId=${latestCohort?.cohortId?._id}&eventCategory=${eventCategory}&eventId=${selectedInterviewer?.events[0]?._id}&redirectUrl=${redirectUrl}`;
        window.location.href = url;
      };
    
  return (
    <div>
      <div className="grid gap-3">
        {/* Profile Section */}
        <div className="space-y-1">
            <div className="text-2xl font-medium">{eventCategory === 'Application Test Interview' ? 'Application Review' : 'LITMUS Review'}</div>
            <h2 className="text-base font-semibold">
                Select Your Interviewer
            </h2>
            <div className="flex gap-4 h-5 items-center">
                <p className="text-sm text-muted-foreground">{eventCategory === 'Application Test Interview' ? 'Program Application' : 'LITMUS Test'}</p>
                <Separator orientation="vertical" />
                <p className="text-sm text-muted-foreground">
                  {eventCategory === 'Application Test Interview' ?
                    `Submitted application on ${new Date(latestCohort?.applicationDetails?.createdAt).toLocaleDateString()}` :
                    `Submitted on ${new Date(latestCohort?.litmusTestDetails?.createdAt).toLocaleDateString()}`
                  }
                </p>
            </div>
        </div>

        <Separator />

        <div className="flex gap-6 mt-4">
            <div className="w-full space-y-4">
                <div className="flex flex-col items-start space-y-2">
                {interviewer.length > 0 ? (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {interviewer.map((interviewer: any, index: any) => (
                            <div key={interviewer?._id}
                                className={`flex flex-col bg-[#09090B] ${
                                    selectedInterviewer?._id === interviewer?._id ? 'border-white text-white' : 'text-muted-foreground'
                                } border rounded-xl w-full cursor-pointer hover:border-white hover:text-white transition-colors`}
                                onClick={() => handleSelect(interviewer)}
                            >
                                <img src={interviewer?.profileImageUrl || `/assets/images/placeholder-image-${index%3+1}.svg`} alt={interviewer?.email} className={`h-[200px] object-cover rounded-t-xl 
                                ${ selectedInterviewer?._id === interviewer?._id ? '' : 'opacity-75' }`} />
                                <div className="flex flex-col gap-2 p-4">
                                    <div className={` text-base font-medium`}>
                                        {interviewer?.firstName + ' ' + interviewer?.lastName}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full min-h-[300px] h-full flex items-center justify-center text-center text-muted-foreground border rounded-md">
                        <div>No Interviewer Available</div>
                    </div>
                )}
                </div>
                <Button size={"xl"} className="w-full" disabled={!selectedInterviewer} onClick={handleScheduleRedirect}>
                    Select Interview Slot
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
