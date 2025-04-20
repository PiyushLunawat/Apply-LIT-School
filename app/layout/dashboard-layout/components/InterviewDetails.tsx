import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription,
    CardContent,
    CardFooter 
  } from "~/components/ui/card"
  import { Button } from "~/components/ui/button"
  import { CalendarIcon, Mail, Clock, XOctagon, TimerOff, ScreenShare } from "lucide-react"  
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { SchedulePresentation } from "~/components/organisms/schedule-presentation-dialog/schedule-presentation";
import { useEffect, useState } from "react";
import { GetInterviewers } from "~/api/studentAPI";
import Feedback from "~/components/molecules/Feedback/Feedback";

  interface InterviewDetailsCardProps {
    student: any
  }
  
export default function InterviewDetailsCard({ student }: InterviewDetailsCardProps) {
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewer, setInterviewer] = useState<any>([]);
  
    const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
    const cohortDetails = latestCohort?.cohortId;
    const litmusTestDetails = latestCohort?.litmusTestDetails;
    const lastInterview = latestCohort?.litmusTestDetails?.litmusTestInterviews?.[latestCohort?.litmusTestDetails?.litmusTestInterviews.length - 1];
    
    const [formattedTime, setFormattedTime]= useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
  
    useEffect(() => {
      const interval = setInterval(() => {
        setFormattedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }));
      }, 1000);
  
      return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    
    const formattedDate = new Date(lastInterview?.meetingDate).toLocaleDateString('en-US', {
        weekday: 'long',  // Full day name (e.g., "Monday")
        month: 'long',    // Full month name (e.g., "October")
        day: 'numeric'    // Day of the month (e.g., "14")
      });
      
    const meetingStart = lastInterview?.meetingDate && lastInterview?.startTime
    ? new Date(`${new Date(lastInterview.meetingDate).toDateString()} ${lastInterview.startTime}`)
    : null;

    // Enable the Join Meeting button if the current time is at least 10 minutes before the meeting start time.
    // That is, current time must be >= (meetingStart - 10 minutes).
    const joinMeetingEnabled = meetingStart
      ? new Date().getTime() >= meetingStart.getTime() - 10 * 60000
      : false;

      let durationMin = "";
      if (lastInterview?.startTime && lastInterview?.endTime) {
        // Create Date objects using a fixed date so we can compare the times.
        const startDate = new Date(`1970/01/01 ${lastInterview.startTime}`);
        const endDate = new Date(`1970/01/01 ${lastInterview.endTime}`);
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffMin = Math.round(diffMs / 60000);
        durationMin = `${diffMin} min`;
      }
      
    if (!lastInterview) {
        return null;
    }

    const handleScheduleInterview = async () => {
  
      const data = {
        cohortId: latestCohort?.cohortId?._id,
        role: 'Litmus_test_reviewer',
      };
      
      const response = await GetInterviewers(data);
    
      const payload = {
        emails: response.data,
        eventCategory: "Litmus Test Review", 
      };
      try {
        const response = await fetch(
          "https://dev.cal.litschool.in/api/application-portal/get-all-users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        
        setInterviewOpen(true);
        if (!response.ok) {
          throw new Error(`Failed to schedule interview: ${response.statusText}`);
        }
    
        const result = await response.json();
        setInterviewer(result.data)
        // console.log("Interview scheduled successfully:", result.data);
      } 
      catch (error) {
        console.error("Error scheduling interview:", error);
        // alert("Failed to schedule interview. Please try again later.");
      }
    };

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://apply-lit-school.vercel.app";

    const handleCancel = (bookingId: string) => {
      const url = `https://dev.cal.litschool.in/meetings/cancel/${bookingId}?redirectUrl=${baseUrl}/dashboard/litmus-task`;
      window.location.href = url;
    };

    return (
      <div className="space-y-6">

        {litmusTestDetails?.status === 'interview cancelled' && 
          <Card className="max-w-6xl mx-auto px-8 py-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex gap-2 items-center">
              <ScreenShare className="w-4 h-4" />
              <span className="flex-1">Proceed to reschedule your presentation session with our counsellor.</span>
            </div>
            <Button size={'xl'} variant="default" className="w-full sm:w-fit" onClick={() => handleScheduleInterview()}
            >
              Book a Presentation session
            </Button>
          </Card>
        }

        {litmusTestDetails?.litmusTestInterviews.slice().reverse().map((interview: any, index: any) => (
          <Card key={index} className={`max-w-6xl mx-auto md:flex md:flex-row rounded-2xl sm:rounded-3xl ${interview?.meetingStatus === 'cancelled' ? 'border-[#FF503D66] opacity-50 min-h-[680px]' : index === 0 ? 'min-h-[680px]' : 'opacity-50 min-h-[500px]'} `}>
            {/* Left Section */}
            <div className={`md:w-1/2 px-8 py-12 flex flex-col gap-8 justify-between ${interview?.meetingStatus === 'cancelled' ? 'bg-[#FF503D66] ' : 'bg-[#1B1B1C]'} !rounded-tl-2xl sm:!rounded-tl-3xl rounded-t-2xl sm:rounded-l-3xl sm:rounded-t-none rounded-l-none`}>
              <div className="space-y-4 sm:space-y-6">
                <div className="text-xl sm:text-2xl sm:text-3xl font-semibold">
                  LIT Challenge Presentaion - {cohortDetails?.programDetail?.name} Program
                </div>
                <div className="w-fit px-3 py-2 flex items-center gap-2 text-sm font-medium rounded-full border border-[#00A3FF]">
                  <Clock className="h-4 w-4 text-[#00A3FF]" />
                  <span>{durationMin}</span>
                </div>
                <div className="">
                  {interview?.description}
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <Avatar className="w-[54px] h-[54px]">
                  <AvatarImage src={interview?.profileImage} alt="@Interviewer" />
                  <AvatarFallback className="font-semibold">{interview?.ownerFirstName[0]}{interview?.ownerLastName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="text-xl font-medium">{interview?.ownerFirstName} {interview?.ownerLastName}</div>
                  <div className="">Interviewer</div>
                </div>
              </div>
            </div>
      
            {/* Right Section */}
            <div className="md:w-1/2 px-8 py-12 space-y-6 flex flex-col justify-between">
              {(interview?.meetingStatus !== 'cancelled' && index !== 0) &&
                <div className="flex gap-2 items-center text-2xl">
                  <TimerOff className="w-6 h-6 "/>
                  <span className="flex-1">This meeting is over</span>
                </div>
              }
              <div className="space-y-10 sm:space-y-12">
                {interview?.meetingStatus === 'cancelled' &&
                  <div className="flex gap-2 items-center text-2xl text-[#FF503D]">
                    <XOctagon className="w-6 h-6 "/>
                    <span className="flex-1">This meeting was cancelled by you</span>
                  </div>
                }
                <div className="space-y-2 sm:space-y-4">
                    <p className="text-sm sm:text-base font-normal text-[#64748B]">
                      Your Presentation Session has been booked for
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-semibold">
                        {formattedDate} 
                    </h3>
                </div>
                <div className="space-y-2 sm:space-y-4">
                <p className="text-xl sm:text-2xl font-semibold uppercase">
                    {interview?.startTime}{' '} 
                    <span className="text-sm sm:text-base font-light text-muted-foreground lowercase">to</span>{' '}
                    {interview?.endTime}
                </p>
                <div className='flex flex-wrap justify-start text-start text-sm sm:text-base font-normal'>
                    Your meeting link has been mailed to you at
                    <span className='flex font-medium w-fit items-center'>
                    <Mail className='w-4 h-4 mx-1'/> 
                    {student?.email}
                    </span>
                </div>
                </div>
              </div>
      
              {interview?.meetingStatus == 'cancelled' ?
              <div className="space-y-6">
                <div className="">
                  <div className="text-base text-muted-foreground">{new Date(interview?.updatedAt).toLocaleDateString()}</div>
                  <div className="text-xl text-muted-foreground">Reason for Cancelling:</div>
                </div>
                <div className="text-base sm:text-xl">{interview?.cancelReason}</div>
              </div> : 
              index === 0 &&
                <div>
                  <Button size={'xl'} variant="default" className="w-full"
                    onClick={() => window.open(interview?.meetingUrl, "_blank")} 
                    disabled={!joinMeetingEnabled}
                  >
                    Join Meeting
                  </Button>
                  <div className="flex justify-between items-center mt-3 sm:mt-6">
                    <p className="text-[#64748B] text-sm sm:text-base font-normal">
                      Time zone: <span className="text-[#00A3FF] uppercase">IST ({formattedTime})</span>
                    </p>
                    <Button variant="link" className="underline " onClick={() => handleCancel(interview?.bookingId)}>
                      Cancel Meeting
                    </Button>
                  </div>
                </div>
              }
            </div>
          </Card>
        ))}

      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
      <DialogTitle></DialogTitle>
        <DialogContent className="max-h-[70vh] sm:max-h-[90vh] sm:max-w-2xl overflow-y-auto">
          <SchedulePresentation student={student} interviewer={interviewer} eventCategory='Litmus Test Review' redirectUrl={`${baseUrl}/dashboard/litmus-task`}/>
        </DialogContent>
      </Dialog>
      </div >
    )
  }
  