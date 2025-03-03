import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription,
    CardContent,
    CardFooter 
  } from "~/components/ui/card"
  import { Button } from "~/components/ui/button"
  import { CalendarIcon, Mail, Clock } from "lucide-react"  

  interface InterviewDetailsCardProps {
    student: any
  }
  
export default function InterviewDetailsCard({ student }: InterviewDetailsCardProps) {

    const lastInterview = student?.applicationDetails?.applicationTestInterviews?.[student?.applicationDetails?.applicationTestInterviews.length - 1];
    
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const formattedDate = new Date(lastInterview?.meetingDate).toLocaleDateString('en-US', {
        weekday: 'long',  // Full day name (e.g., "Monday")
        month: 'long',    // Full month name (e.g., "October")
        day: 'numeric'    // Day of the month (e.g., "14")
      });
      
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
        return <div>No interviews found.</div>;
    }
  
    return (
      <Card className="max-w-6xl min-h-[680px] mx-auto md:flex md:flex-row rounded-2xl sm:rounded-3xl ">
        {/* Left Section */}
        <div className="md:w-1/2 px-8 py-12 flex flex-col justify-between bg-[#1B1B1C] !rounded-tl-2xl sm:!rounded-tl-3xl rounded-t-2xl sm:rounded-l-3xl sm:rounded-t-none rounded-l-none ">
        <div className="space-y-4 sm:space-y-6">
          <div className="text-2xl sm:text-3xl font-semibold">
            LIT Admissions Interview - {student?.program?.name} Program
          </div>
          <div className="w-fit px-3 py-2 flex items-center gap-2 text-sm font-medium rounded-full border border-[#00A3FF]">
            <Clock className="h-4 w-4 text-[#00A3FF]" />
            <span>{durationMin}</span>
          </div>

          <h2 className="text-base sm:text-xl font-normal">
            Ready to be a part of our LIT community? ✨
          </h2>
  
          <h2 className="text-base sm:text-xl font-normal">
            Your session has been booked.
          </h2>

          <div className="">
            <p className="text-base sm:text-xl font-normal">
                During this session, we’ll walk you through our:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base font-normal space-y-1">
                <li>Unique LIT Learning Methodology</li>
                <li>Exciting EPIC Curriculum</li>
                <li>Beautiful Campus</li>
            </ul>
          </div>
        </div>

        </div>
  
        {/* Right Section */}
        <div className="md:w-1/2 px-8 py-12 space-y-6 flex flex-col justify-between">
          <div className="space-y-10 sm:space-y-12">
            <div className="space-y-2 sm:space-y-4">
                <p className="text-sm sm:text-base font-normal text-[#64748B]">
                    Your Counselling Session has been booked for
                </p>
                <h3 className="text-2xl sm:text-3xl font-semibold">
                    {formattedDate} 
                </h3>
            </div>
            <div className="space-y-2 sm:space-y-4">
            <p className="text-xl sm:text-2xl font-semibold uppercase">
                {lastInterview?.startTime}{' '} 
                <span className="text-sm sm:text-base font-light text-muted-foreground lowercase">to</span>{' '}
                {lastInterview?.endTime}
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
  
          <div>
            <Button
            size={'xl'}
            variant="default"
            className="w-full"
            onClick={() => window.open(lastInterview?.meetingUrl, "_blank")} // Open meeting link in new tab
          >
              Join Meeting
            </Button>
            <p className="mt-3 sm:mt-6 text-[#64748B] text-sm sm:text-base font-normal">
              Time zone: <span className="text-[#00A3FF] uppercase">IST ({formattedTime})</span>
            </p>
          </div>
        </div>
      </Card>
    )
  }
  