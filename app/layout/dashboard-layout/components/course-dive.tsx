import {
  ArrowLeft,
  ArrowUpRight,
  FileTextIcon,
  ImageIcon,
  Link2Icon,
  VideoIcon,
} from "lucide-react";
import { getEnvValue } from "~/atoms/envAtoms";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";

const awsUrl = getEnvValue("REMIX_AWS_BASE_URL");
interface CourseDiveProps {
  student: any;
  onSelectTab: (path: string) => void;
}

export default function CourseDiveTab({
  student,
  onSelectTab,
}: CourseDiveProps) {
  const latestCohort =
    student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;
  const applicationTask =
    latestCohort?.cohortId?.applicationFormDetail?.[0]?.task;
  const applicationDetails =
    latestCohort?.applicationDetails?.applicationTasks?.[
      latestCohort?.applicationDetails?.applicationTasks.length - 1
    ]?.applicationTasks?.[0];

  console.log(applicationDetails);

  return (
    <div className="px-4 py-8 sm:p-[52px] space-y-8 text-white">
      <div className="flex flex-row sm:flex-col gap-4 items-center sm:items-start">
        <ArrowLeft
          className="w-6 h-6 cursor-pointer"
          onClick={() => onSelectTab("")}
        />
        <Badge className="text-sm w-fit border-[#FF791F] text-[#FF791F] bg-[#FF791F]/10">
          Course Dive
        </Badge>
      </div>
      {/* Personal Details */}
      <div className="flex flex-col gap-8">
        <div className="text-base font-normal space-y-8">
          {/* interest */}
          <div className="space-y-2">
            <div className="text-[#00A0E9]">
              Why are you interested in joining The LIT School?
            </div>
            {applicationDetails?.courseDive ? (
              <div className="text-sm sm:text-base">
                {applicationDetails?.courseDive?.[0]}
              </div>
            ) : (
              <Skeleton className="h-[100px] w-full rounded-xl" />
            )}
          </div>

          {/* goals */}
          <div className="space-y-2">
            <div className="text-[#00A0E9]">
              What are your career goals or aspirations?
            </div>
            {applicationDetails?.courseDive ? (
              <div className="text-sm sm:text-base">
                {applicationDetails?.courseDive?.[1]}
              </div>
            ) : (
              <Skeleton className="h-[100px] w-full rounded-xl" />
            )}
          </div>
        </div>

        {applicationTask?.map((task: any, index: any) => (
          <div key={index} className="space-y-8">
            <Card className="bg-[#64748B1F] rounded-xl text-white">
              <CardTitle className="bg-[#64748B33] p-6 text-2xl font-medium">
                Task 0{index + 1}
              </CardTitle>
              <CardContent className="text-base p-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-[#FA69E5]">{task?.title}</h4>
                  <p className="text-lg sm:text-text-2xl font-medium">
                    {task?.description}
                  </p>
                </div>

                <div className="bg-[#2C2C2C99] p-2 space-y-2 w-full rounded-xl">
                  <div className="pl-3">Your Submissions</div>
                  <div className="space-y-3">
                    {applicationDetails?.tasks && (
                      <div className="flex flex-wrap gap-1.5">
                        {applicationDetails?.tasks?.[index]?.text?.map(
                          (textItem: string, id: number) => (
                            <div
                              key={`text-${id}`}
                              className="w-full text-sm sm:text-base flex items-center gap-2 px-4 py-2 border rounded-xl bg-[#09090b]"
                            >
                              {textItem}
                            </div>
                          )
                        )}
                        {applicationDetails?.tasks?.[index]?.links?.map(
                          (linkItem: string, id: number) => (
                            <div
                              key={`link-${id}`}
                              className="min-w-1/2 flex flex-1 justify-between items-center gap-2 p-2 border rounded-xl bg-[#09090b]"
                            >
                              <div className="flex gap-2 items-center flex-1 w-[50vw] truncate">
                                <Badge
                                  size="icon"
                                  className="text-white rounded-lg bg-[#1B1B1C]"
                                >
                                  <Link2Icon className="w-5 h-5" />
                                </Badge>
                                <span className="text-sm sm:text-base truncate">
                                  {linkItem}
                                </span>
                              </div>
                              <Button
                                size="icon"
                                type="button"
                                className="bg-[#1B1B1C] hover:bg-[#1a1a1d] rounded-xl"
                                onClick={() => window.open(linkItem, "_blank")}
                              >
                                <ArrowUpRight className="w-5" />
                              </Button>
                            </div>
                          )
                        )}
                        {applicationDetails?.tasks?.[index]?.images?.map(
                          (imageItem: string, id: number) => (
                            <div
                              key={`image-${id}`}
                              className="min-w-1/2 flex flex-1 justify-between items-center gap-2 p-2 border rounded-xl bg-[#09090b]"
                            >
                              <div className="flex gap-2 items-center flex-1 w-[50vw] truncate">
                                <Badge
                                  size="icon"
                                  className="text-white rounded-lg bg-[#1B1B1C]"
                                >
                                  <ImageIcon className="w-5 h-5" />
                                </Badge>
                                <span className="text-sm sm:text-base truncate">
                                  {imageItem.split("/").pop()}
                                </span>
                              </div>
                              <Button
                                size="icon"
                                type="button"
                                className="bg-[#1B1B1C] hover:bg-[#1a1a1d] rounded-xl"
                                onClick={() =>
                                  window.open(
                                    `${awsUrl}/${imageItem}`,
                                    "_blank"
                                  )
                                }
                              >
                                <ArrowUpRight className="w-5" />
                              </Button>
                            </div>
                          )
                        )}
                        {applicationDetails?.tasks?.[index]?.videos?.map(
                          (videoItem: string, id: number) => (
                            <div
                              key={`video-${id}`}
                              className="min-w-1/2 flex flex-1 justify-between items-center gap-2 p-2 border rounded-xl bg-[#09090b]"
                            >
                              <div className="flex gap-2 items-center flex-1 w-[50vw] truncate">
                                <Badge
                                  size="icon"
                                  className="text-white rounded-lg bg-[#1B1B1C]"
                                >
                                  <VideoIcon className="w-5 h-5" />
                                </Badge>
                                <span className="text-sm sm:text-base truncate">
                                  {videoItem.split("/").pop()}
                                </span>
                              </div>
                              <Button
                                size="icon"
                                type="button"
                                className="bg-[#1B1B1C] hover:bg-[#1a1a1d] rounded-xl"
                                onClick={() =>
                                  window.open(
                                    `${awsUrl}/${videoItem}`,
                                    "_blank"
                                  )
                                }
                              >
                                <ArrowUpRight className="w-5" />
                              </Button>
                            </div>
                          )
                        )}
                        {applicationDetails?.tasks?.[index]?.files?.map(
                          (fileItem: string, id: number) => (
                            <div
                              key={`file-${id}`}
                              className="min-w-1/2 flex flex-1 justify-between items-center gap-2 p-2 border rounded-xl bg-[#09090b]"
                            >
                              <div className="flex gap-2 items-center flex-1 w-[50vw] truncate">
                                <Badge
                                  size="icon"
                                  className="text-white rounded-lg bg-[#1B1B1C]"
                                >
                                  <FileTextIcon className="w-5 h-5" />
                                </Badge>
                                <span className="text-sm sm:text-base truncate">
                                  {fileItem.split("/").pop()}
                                </span>
                              </div>
                              <Button
                                size="icon"
                                type="button"
                                className="bg-[#1B1B1C] hover:bg-[#1a1a1d] rounded-xl"
                                onClick={() =>
                                  window.open(`${awsUrl}/${fileItem}`, "_blank")
                                }
                              >
                                <ArrowUpRight className="w-5" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            {applicationDetails?.tasks?.[index]?.feedback.length > 0 && (
              <div className="space-y-4">
                <div className="text-base text-[#F8E000] pl-3">Feedback</div>
                <div className="w-full z-10 bg-[#09090B] border border-[#2C2C2C] text-white p-4 sm:p-6 mx-auto rounded-xl justify-between items-start">
                  <ul className="ml-4 sm:ml-6 space-y-2 list-disc">
                    {applicationDetails?.tasks?.[index]?.feedback?.[
                      applicationDetails?.tasks?.[index]?.feedback.length - 1
                    ]?.feedbackData?.map(
                      (feedback: any, index: any) =>
                        feedback?.length > 0 && (
                          <li className="text-sm sm:text-base" key={index}>
                            {feedback}
                          </li>
                        )
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
