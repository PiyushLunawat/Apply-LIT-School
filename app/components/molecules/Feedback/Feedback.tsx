import { useNavigate } from "@remix-run/react";
import React, { useState } from "react";
import { GetInterviewers } from "~/api/studentAPI";
import { SchedulePresentation } from "~/components/organisms/schedule-presentation-dialog/schedule-presentation";
import { Button } from "~/components/ui/button"; // Assuming you have a Button component
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import BookYourSeat from "../BookYourSeat/BookYourSeat";

interface FeedbackProps {
  student: any;
  setIsPaymentVerified: React.Dispatch<React.SetStateAction<string | null>>;
}

const Feedback: React.FC<FeedbackProps> = ({
  student,
  setIsPaymentVerified,
}) => {
  const latestCohort =
    student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const applicationDetails = latestCohort?.applicationDetails;
  const applicationStatus = latestCohort?.applicationDetails?.applicationStatus;

  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewer, setInterviewer] = useState<any>([]);
  const navigate = useNavigate();

  const handleReviseApplication = () => {
    navigate("../../application/task");
  };

  const handleScheduleInterview = async () => {
    setInterviewLoading(true);
    const data = {
      cohortId:
        student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId
          ?._id,
      role: "application_interviewer",
    };

    const response = await GetInterviewers(data);
    console.log("list", data, response.data);

    const payload = {
      emails: response.data,
      eventCategory: "Application Test Interview",
    };

    console.log("pay", payload);

    try {
      const response = await fetch(
        "https://cal.litschool.in/api/application-portal/get-all-users",
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
      setInterviewer(result.data);
      console.log("Interview scheduled successfully:", result.data);

      // Optionally set dialog open or show success message
    } catch (error) {
      console.error("Error scheduling interview:", error);
      // alert("Failed to schedule interview. Please try again later.");
    } finally {
      setInterviewLoading(false);
    }
  };

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://apply-lit-school.vercel.app";

  return (
    <div
      className={`${
        ["on hold", "waitlist"].includes(applicationStatus)
          ? "shadow-[0px_4px_32px_rgba(121,121,121,0.2)]"
          : ["accepted", "interview cancelled", "selected"].includes(
              applicationStatus
            )
          ? "shadow-[0px_4px_32px_rgba(0,163,122551,0.2)]"
          : "shadow-[0px_4px_32px_rgba(255,80,61,0.2)]"
      } max-w-[1216px] z-10 bg-[#09090B] border border-[#2C2C2C] text-white px-4 sm:px-6 py-6 sm:py-8 mx-auto rounded-2xl justify-between items-start`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg sm:text-xl font-semibold ">
          {applicationStatus === "on hold" ? "Reason for hold up" : "Feedback"}
        </div>
        <div className="text-xs sm:text-base flex">
          {new Date(applicationDetails?.updatedAt).toLocaleDateString()}
        </div>
      </div>
      {applicationStatus === "on hold" && (
        <ul className="ml-4 sm:ml-6 space-y-2 list-disc">
          {applicationDetails?.applicationTasks[0]?.applicationTasks[0]?.overallFeedback?.[
            applicationDetails?.applicationTasks[0]?.applicationTasks[0]
              ?.overallFeedback.length - 1
          ]?.feedbackData.map((item: any, index: any) => (
            <li className="text-sm sm:text-base" key={index}>
              {item}
            </li>
          ))}
        </ul>
      )}
      {["accepted", "interview cancelled", "rejected"].includes(
        applicationStatus
      ) && (
        <div className="space-y-4">
          {applicationDetails?.applicationTasks[0]?.applicationTasks[0].tasks?.map(
            (task: any, index: any) =>
              task?.feedback?.[task?.feedback.length - 1]?.feedbackData.length >
                0 && (
                <div key={task._id}>
                  <div className="text-sm sm:text-base font-semibold text-[#00A3FF]">
                    Task 0{index + 1}
                  </div>
                  {task?.feedback?.[
                    task?.feedback.length - 1
                  ]?.feedbackData?.map((item: any, i: any) => (
                    <ul key={i} className="ml-4 sm:ml-6 space-y-2 list-disc">
                      <li className="text-sm sm:text-base" key={i}>
                        {item}
                      </li>
                    </ul>
                  ))}
                </div>
              )
          )}
        </div>
      )}
      {
        <div className="space-y-4">
          <ul className="ml-4 sm:ml-6 space-y-2 list-disc">
            {applicationDetails?.applicationTestInterviews[
              applicationDetails?.applicationTestInterviews.length - 1
            ]?.feedback[
              applicationDetails?.applicationTestInterviews[
                applicationDetails?.applicationTestInterviews.length - 1
              ]?.feedback.length - 1
            ]?.comments?.map(
              (feedback: any, index: any) =>
                feedback?.length > 0 && (
                  <li className="text-sm sm:text-base" key={index}>
                    {feedback}
                  </li>
                )
            )}
          </ul>
        </div>
      }
      {["accepted", "interview cancelled", "on hold"].includes(
        applicationStatus
      ) && (
        <div className="flex justify-center mt-8">
          <Button
            size="xl"
            className="w-full sm:w-fit mx-auto px-8"
            disabled={interviewLoading}
            onClick={() => {
              if (applicationStatus === "on hold") {
                handleReviseApplication();
              } else {
                handleScheduleInterview();
              }
            }}
          >
            {applicationStatus === "on hold"
              ? "Revise Your Application"
              : "Schedule Interview"}
          </Button>
        </div>
      )}

      {applicationStatus === "selected" && (
        <BookYourSeat
          cohortId={
            student?.appliedCohorts?.[student?.appliedCohorts.length - 1]
              ?.cohortId?._id
          }
          booked={latestCohort?.cohortId?.filledSeats?.length}
          tokenFee={
            student?.appliedCohorts?.[student?.appliedCohorts.length - 1]
              ?.cohortId?.cohortFeesDetail?.tokenFee
          }
          setIsPaymentVerified={setIsPaymentVerified}
        />
      )}
      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-[90vw] sm:max-w-2xl">
          <SchedulePresentation
            student={student}
            interviewer={interviewer}
            eventCategory="Application Test Interview"
            redirectUrl={`${baseUrl}/application/status`}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feedback;
