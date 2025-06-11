import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@remix-run/react";
import axios from "axios";
import {
  ArrowUpRight,
  Clipboard,
  ClipboardCheck,
  FileTextIcon,
  HandMetal,
  ImageIcon,
  Link2,
  Link2Icon,
  LoaderCircle,
  UploadIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GetInterviewers, submitLITMUSTest } from "~/api/studentAPI"; // Import your API function
import JudgementCriteriaCard from "~/components/molecules/JudgementCriteriaCard/JudgementCriteriaCard";
import ScholarshipSlabCard from "~/components/molecules/scholarshipSlabCard/scholarshipSlabCard";
import { SchedulePresentation } from "~/components/organisms/schedule-presentation-dialog/schedule-presentation";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
import { Textarea } from "~/components/ui/textarea";
import { UserContext } from "~/context/UserContext";
import InterviewDetailsCard from "./InterviewDetails";

import { S3Client } from "@aws-sdk/client-s3";
import InterviewFeedback from "~/components/organisms/InterviewFeedback/InterviewFeedback";
import { LitmusFeedbackForm } from "~/components/organisms/LitmusFeedbackForm/LitmusFeedbackForm";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

const s3Client = new S3Client({});

const getColor = (index: number) => {
  const colors = [
    "text-emerald-600",
    "text-[#3698FB]",
    "text-[#FA69E5]",
    "text-orange-600",
  ];
  return colors[index % 4];
};

const getBgColor = (index: number) => {
  const colors = [
    "bg-emerald-600/20",
    "bg-[#3698FB]/20",
    "bg-[#FA69E5]/20",
    "bg-orange-600/20",
  ];
  return colors[index % 4];
};

const validateLinks = (values: LitmusTestFormValues) => {
  let errors: Record<string, string> = {};

  values.tasks.forEach((task, taskIndex) => {
    task.configItems.forEach((configItem, configIndex) => {
      if (configItem.type === "link") {
        const fieldName = `tasks.${taskIndex}.configItems.${configIndex}.answer`;
        configItem.answer.forEach((link, linkIndex) => {
          const result = z.string().url().safeParse(link);
          if (!result.success) {
            errors[`${fieldName}.${linkIndex}`] = "Please enter a valid URL";
          }
        });
      }
    });
  });

  return errors;
};

const litmusTestSchema = z.object({
  tasks: z.array(
    z.object({
      configItems: z.array(
        z.discriminatedUnion("type", [
          // For 'link' type: array of URLs
          z.object({
            type: z.literal("link"),
            answer: z
              .array(z.string().url("Please enter a valid URL"))
              .nonempty("At least one link is required"),
          }),
          // For 'short' and 'long' types: single string
          z.object({
            type: z.literal("short"),
            answer: z.string().nonempty("This field is required"),
          }),
          z.object({
            type: z.literal("long"),
            answer: z.string().nonempty("This field is required"),
          }),
          // For file upload types: array of files
          z.object({
            type: z.literal("image"),
            answer: z.array(z.any()).nonempty("This field is required"),
          }),
          z.object({
            type: z.literal("video"),
            answer: z.array(z.any()).nonempty("This field is required"),
          }),
          z.object({
            type: z.literal("file"),
            answer: z.array(z.any()).nonempty("This field is required"),
          }),
        ])
      ),
    })
  ),
});

type LitmusTestFormValues = z.infer<typeof litmusTestSchema>;

interface ConfigItem {
  type: string;
  answer: any;
}

interface LitmusTestProps {
  student: any;
}

export default function LitmusTest({ student }: LitmusTestProps) {
  const latestCohort =
    student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;
  // console.log("whwhw",latestCohort);

  const [litmusTestDetails, setLitmusTestDetails] = useState<any>(
    latestCohort?.litmusTestDetails
  );
  const [status, setStatus] = useState<string>(litmusTestDetails?.status);

  const { studentData } = useContext(UserContext);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [interviewer, setInterviewer] = useState<any>([]);
  const navigate = useNavigate();

  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isTopVisible, setIsTopVisible] = useState(true);
  const [isBottomVisible, setIsBottomVisible] = useState(false);

  useEffect(() => {
    setLitmusTestDetails(latestCohort?.litmusTestDetails);
    setStatus(latestCohort?.litmusTestDetails?.status);
    if (
      latestCohort?.litmusTestDetails?.status === "completed" &&
      !latestCohort?.feedbackDetails
    ) {
      setFeedbackOpen(true);
    }
  }, [latestCohort]);

  const storageKey = studentData?.email
    ? `litmusTestForm-${studentData.email}`
    : "litmusTestForm-unknownUser";

  const form = useForm<LitmusTestFormValues>({
    resolver: zodResolver(litmusTestSchema),
    mode: "onChange",
    defaultValues: {
      tasks: [],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isValid },
  } = form;

  const tasks = cohortDetails?.litmusTestDetail?.[0]?.litmusTasks || [];

  useEffect(() => {
    if (cohortDetails?.litmusTestDetail?.[0]?.litmusTasks.length > 0) {
      setValue(
        "tasks",
        cohortDetails?.litmusTestDetail?.[0]?.litmusTasks.map((task: any) => ({
          configItems: task.submissionTypes.map((configItem: any) => ({
            type: configItem.type,
            answer:
              configItem.type === "link"
                ? Array(configItem.maxFiles || 1).fill("")
                : configItem.type === "file" ||
                  configItem.type === "image" ||
                  configItem.type === "video"
                ? []
                : "",
          })),
        }))
      );
    }
  }, [cohortDetails, reset, storageKey, setValue]);

  useEffect(() => {
    const topObserver = new IntersectionObserver(
      ([entry]) => setIsTopVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    const bottomObserver = new IntersectionObserver(
      ([entry]) => setIsBottomVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    console.log("whwhw", topObserver, bottomObserver);

    if (topRef.current) topObserver.observe(topRef.current);
    if (bottomRef.current) bottomObserver.observe(bottomRef.current);

    return () => {
      if (topRef.current) topObserver.unobserve(topRef.current);
      if (bottomRef.current) bottomObserver.unobserve(bottomRef.current);
    };
  }, []);

  useEffect(() => {
    // Skip initial mount if needed
    if (Object.keys(form).length === 0) return;

    localStorage.setItem(storageKey, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      reset(parsedData); // from useForm()
    }
  }, []);

  const onSubmit = async (data: LitmusTestFormValues) => {
    try {
      setLoading(true);
      const transformedTasks = data.tasks.map((task) => {
        const transformedTask: Record<string, any> = { feedback: [] };
        task.configItems.forEach((configItem) => {
          const type = configItem.type.toLowerCase();
          const answer = configItem.answer;
          let key: string | null = null;
          if (type === "link") {
            key = "links";
          } else if (type === "image") {
            key = "images";
          } else if (type === "video") {
            key = "videos";
          } else if (type === "file") {
            key = "files";
          } else if (type === "long" || type === "short" || type === "text") {
            key = "texts";
          }
          if (key) {
            if (!(key in transformedTask)) {
              transformedTask[key] = [];
            }
            if (Array.isArray(answer)) {
              transformedTask[key] = answer;
            } else {
              transformedTask[key].push(answer);
            }
          }
        });
        return transformedTask;
      });

      const payload = {
        litmusTaskId: litmusTestDetails?._id,
        isSubmit: true,
        tasks: [
          {
            tasks: transformedTasks,
          },
        ],
      };

      console.log("Payload:", payload);

      // Submit the form data using the provided API function
      const response = await submitLITMUSTest(payload);
      console.log("Submission successful:", response);
      setLitmusTestDetails(response.data);
      setStatus(response.data?.status);
      handleScheduleInterview();
    } catch (error) {
      console.error("Failed to submit Litmus Test:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (data: LitmusTestFormValues) => {
    const linkErrors = validateLinks(data);

    if (Object.keys(linkErrors).length > 0) {
      // Apply errors to form
      Object.entries(linkErrors).forEach(([field, message]) => {
        form.setError(field as any, { message });
      });
      return;
    }

    try {
      setSaveLoading(true);

      const transformedTasks = data.tasks.map((task) => {
        const transformedTask: Record<string, any> = { feedback: [] };
        task.configItems.forEach((configItem) => {
          const type = configItem.type.toLowerCase();
          const answer = configItem.answer;
          let key: string | null = null;
          if (type === "link") {
            key = "links";
          } else if (type === "image") {
            key = "images";
          } else if (type === "video") {
            key = "videos";
          } else if (type === "file") {
            key = "files";
          } else if (type === "long" || type === "short" || type === "text") {
            key = "texts";
          }
          if (key) {
            if (!(key in transformedTask)) {
              transformedTask[key] = [];
            }
            if (Array.isArray(answer)) {
              transformedTask[key] = answer;
            } else {
              transformedTask[key].push(answer);
            }
          }
        });
        return transformedTask;
      });

      const payload = {
        litmusTaskId: litmusTestDetails?._id,
        tasks: [
          {
            tasks: transformedTasks,
          },
        ],
      };

      console.log("Payload:", payload);

      // Submit the form data using the provided API function
      const response = await submitLITMUSTest(payload);
      console.log("Submission successful:", response);
      form.clearErrors();

      // setLitmusTestDetails(response.data);
      // setStatus(response.data?.status);
      // handleScheduleInterview();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to submit Litmus Test:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    const data = {
      cohortId:
        student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId
          ?._id,
      role: "litmus_interviewer",
    };

    setLoading(true);

    const response = await GetInterviewers(data);
    console.log("list", response.data);

    const payload = {
      emails: response.data,
      eventCategory: "Litmus Test Interview",
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
    } catch (error) {
      console.error("Error scheduling interview:", error);
    } finally {
      setLoading(false);
    }
  };

  const taskScores = litmusTestDetails?.results || [];
  let totalScore = 0;
  let totalPercentage = 0;
  let maxScore = 0;

  taskScores.forEach((task: any) => {
    const taskScore = task?.score?.reduce(
      (acc: any, criterion: any) => acc + criterion.score,
      0
    );
    const taskMaxScore = task?.score?.reduce(
      (acc: any, criterion: any) => acc + Number(criterion.totalScore),
      0
    );
    const taskPercentage = taskMaxScore ? (taskScore / taskMaxScore) * 100 : 0;
    totalScore += taskScore;
    totalPercentage += taskPercentage;
    maxScore += taskMaxScore;
  });

  const avgTaskScore = totalPercentage / taskScores.length;

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://apply-lit-school.vercel.app";

  const getFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (!extension) return null;
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension))
      return "image";
    if (["mp4", "mkv", "webm", "ogg"].includes(extension)) return "video";
    if (extension === "pdf") return "pdf";
    return "other";
  };

  const colorClasses = [
    "text-emerald-600 bg-emerald-600 hover:bg-emerald-600/80 border-emerald-600",
    "text-[#3698FB] bg-[#3698FB] hover:bg-[#3698FB]/80 border-[#3698FB]",
    "text-[#FA69E5] bg-[#FA69E5] hover:bg-[#FA69E5]/80 border-[#FA69E5]",
    "text-orange-600 bg-orange-600 hover:bg-orange-600/80 border-orange-600",
  ];

  const getBadgeColor = (slabName: string): string => {
    const index =
      cohortDetails?.litmusTestDetail?.[0]?.scholarshipSlabs.findIndex(
        (slab: any) => slab.name === slabName
      );
    return index !== -1
      ? colorClasses[index % colorClasses.length]
      : "text-default";
  };

  function getIcon(rating: number, total: number): string {
    const percentage = (rating / total) * 100;

    if (percentage <= 20) return "1-icon.png";
    if (percentage <= 40) return "2-icon.png";
    if (percentage <= 60) return "3-icon.png";
    if (percentage <= 80) return "4-icon.png";
    return "5-icon.png";
  }

  const formatAmount = (value: number | undefined) =>
    value !== undefined
      ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
          Math.round(value)
        )
      : "--";

  return (
    <div className="flex flex-col items-start bg-[#09090B] text-white w-full mx-auto px-4 py-8 sm:p-[52px] space-y-4 sm:space-y-8">
      {status === undefined ? (
        <div className="w-full space-y-4">
          <div className="text-xl sm:text-3xl font-medium pl-4">
            LITMUS Challenge submission
          </div>
          <div className="w-full space-y-6">
            <Skeleton className="h-[60px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      ) : ["", "pending"].includes(status) ? (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {cohortDetails?.litmusTestDetail?.[0]?.litmusTasks.map(
                (task: any, taskIndex: number) => (
                  <div key={taskIndex} className="space-y-7">
                    <div>
                      <Badge className="text-sm my-4 border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10">
                        Task 0{taskIndex + 1}
                      </Badge>
                      <h2 className="text-xl sm:text-3xl font-semibold mb-2">
                        {task.title}
                      </h2>
                      <p className="text-lg sm:text-xl mb-4">
                        {task.description}
                      </p>

                      <div className="w-full space-y-2">
                        <div className="text-base font-normal text-muted-foreground pl-3">
                          Resources
                        </div>
                        {task?.resources?.resourceFiles.map(
                          (file: any, index: number) => {
                            const fileType = getFileType(file);

                            switch (fileType) {
                              case "pdf":
                                return (
                                  <div className="w-full min-h-[500px] max-h-[600px] justify-center flex items-center rounded-xl">
                                    <iframe
                                      src={file}
                                      className="mx-auto w-full min-h-[500px] max-h-[600px] rounded-xl"
                                      style={{ border: "none" }}
                                    />
                                  </div>
                                );
                              case "image":
                                return (
                                  <div className="w-full min-h-[400px] max-h-[500px] bg-[#2C2C2C] flex flex-col items-center text-sm border rounded-xl relative">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      type="button"
                                      className="text-white rounded-xl hover:bg-[#1a1a1d] absolute top-[6px] right-[6px] z-10"
                                      onClick={() =>
                                        window.open(file, "_blank")
                                      }
                                    >
                                      <ArrowUpRight className="w-5 h-5" />
                                    </Button>
                                    <img
                                      src={file}
                                      alt={file.split("/").pop()}
                                      className="min-h-[400px] max-h-[500px] object-contain rounded-xl"
                                    />
                                  </div>
                                );
                              case "video":
                                return (
                                  <div className="w-full min-h-[400px] max-h-[500px] bg-[#2C2C2C] flex flex-col items-center text-sm border rounded-xl relative">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      type="button"
                                      className="text-white rounded-xl hover:bg-[#1a1a1d] absolute top-[6px] right-[6px] z-10"
                                      onClick={() =>
                                        window.open(file, "_blank")
                                      }
                                    >
                                      <ArrowUpRight className="w-5 h-5" />
                                    </Button>

                                    <video
                                      controls
                                      preload="none"
                                      className="min-h-[400px] max-h-[500px] w-full rounded-xl "
                                    >
                                      <source src={file} type="video/mp4" />
                                      Your browser does not support the video
                                      tag.
                                    </video>
                                  </div>
                                );
                              default:
                                return (
                                  <div
                                    key={index}
                                    className="flex gap-2 items-center justify-between w-full p-1.5 bg-[#2C2C2C] rounded-xl"
                                  >
                                    <div className="flex flex-1 items-center space-x-2 truncate">
                                      <Badge
                                        variant="outline"
                                        size="icon"
                                        className="text-white rounded-xl bg-[#09090b]"
                                      >
                                        <FileTextIcon className="w-5 h-5" />
                                      </Badge>
                                      <span className="text-white truncate">
                                        {file.split("/").pop()}
                                      </span>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      type="button"
                                      className="text-white rounded-xl hover:bg-[#1a1a1d]"
                                      onClick={() =>
                                        window.open(file, "_blank")
                                      }
                                    >
                                      <ArrowUpRight className="w-5 h-5" />
                                    </Button>
                                  </div>
                                );
                            }
                          }
                        )}

                        {task?.resources?.resourceLinks.map(
                          (link: any, index: number) => (
                            <div
                              key={index}
                              className="flex gap-2 items-center justify-between w-full p-1.5 bg-[#2C2C2C] rounded-xl"
                            >
                              <div className="flex items-center space-x-2 flex-1 w-[50vw] truncate">
                                <Badge
                                  variant="outline"
                                  size="icon"
                                  className="text-white rounded-xl bg-[#09090b]"
                                >
                                  <Link2 className="w-5 h-5" />
                                </Badge>
                                <span className="text-white truncate">
                                  {link}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                className="text-white rounded-xl hover:bg-[#1a1a1d]"
                                onClick={() => window.open(link, "_blank")}
                              >
                                <ArrowUpRight className="w-5 h-5" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <Card className="w-full space-y-4 px-6 py-6 shadow-[0px_4px_32px_rgba(121,121,121,0.2)]">
                      <div
                        ref={topRef}
                        className="flex justify-between items-center"
                      >
                        <div className="text-xl sm:text-2xl font-normal pl-3">
                          Judgement Criteria
                        </div>
                      </div>
                      <div className="w-full grid grid-cols sm:grid-cols-2 gap-3">
                        {cohortDetails?.litmusTestDetail?.[0]?.litmusTasks[0]?.judgmentCriteria.map(
                          (criteria: any, index: number) => (
                            <JudgementCriteriaCard
                              index={index}
                              criteria={criteria?.name}
                              maxPoint={criteria?.points}
                              desc={criteria?.description}
                            />
                          )
                        )}
                      </div>
                    </Card>

                    {cohortDetails ? (
                      <div className="">
                        <div className="text-base sm:text-xl font-medium pl-3">
                          Your Submission
                        </div>
                        <div className="space-y-3">
                          {task.submissionTypes.map(
                            (configItem: any, configIndex: number) => (
                              <TaskConfigItem
                                key={configIndex}
                                control={control}
                                taskIndex={taskIndex}
                                configIndex={configIndex}
                                configItem={configItem}
                              />
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-white">
                        No tasks available. Please ensure the cohort data is
                        loaded correctly.
                      </div>
                    )}
                  </div>
                )
              )}

              <div className="w-full flex justify-between items-center ">
                <Button
                  size="xl"
                  className=""
                  type="submit"
                  disabled={loading || !isValid}
                >
                  Submit and Book Presentation Session
                </Button>
              </div>
              {isTopVisible && !isBottomVisible && (
                <Button
                  size="xl"
                  variant="outline"
                  className="fixed bottom-24 right-4 sm:right-0 bg-[#09090b] hover:bg-[#09090b]/80"
                  type="button"
                  disabled={saveLoading || saved}
                  onClick={() => onSave(form.getValues())}
                >
                  <div className="sm:hidden flex items-center gap-2">
                    {saved ? (
                      <ClipboardCheck className="w-4 h-4" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                    {saved ? "Saved" : "Save"}
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    {saved ? (
                      <ClipboardCheck className="w-4 h-4" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                    {saved ? "Updates Saved" : "Save Updates"}
                  </div>
                </Button>
              )}
            </div>
          </form>
        </Form>
      ) : (
        // {['submitted', 'interview scheduled', 'interview cancelled', 'completed'].includes(status) &&
        <div className="space-y-8">
          <div
            className={`${
              status === "completed"
                ? "bg-[#64748B1F] border p-6 flex gap-6 rounded-xl"
                : ""
            }`}
          >
            {status === "completed" && (
              <div className="hidden md:flex w-[82px] h-[82px] bg-[#1388FF1F] flex items-center justify-center rounded-full">
                <img
                  src="/assets/icons/congratulation-icon.avif"
                  className="w-8"
                />
              </div>
            )}
            <div className="flex-1 space-y-1">
              {status === "completed" ? (
                <div className="flex gap-4 items-center text-2xl font-medium">
                  {status === "completed" && (
                    <div className="flex md:hidden w-[72px] h-[72px] bg-[#1388FF1F] items-center justify-center rounded-full">
                      <img
                        src="/assets/icons/congratulation-icon.avif"
                        className="w-6"
                      />
                    </div>
                  )}
                  <span className="flex-1">
                    Congratulations on Completing Your Presentation
                  </span>
                </div>
              ) : (
                <div className="text-2xl font-medium pl-4">
                  Congratulations on making your LITMUS Challenge submission!
                </div>
              )}
              {status === "submitted" && (
                <div className="text-xl font-normal pl-4">
                  You are now required to schedule a call with us to present
                  your work.
                </div>
              )}
              {status === "interview scheduled" && (
                <div className="text-xl font-normal pl-4">
                  You are now required to present your work at the selected date
                  and time .
                </div>
              )}
              {status === "interview cancelled" && (
                <div className="text-xl font-normal pl-4">
                  You are now required to select a presentation date and time to
                  present your work.
                </div>
              )}
              {status === "completed" && (
                <div className="text-base font-normal">
                  You are eligible for a scholarship based on your performance.
                  Review your feedback below. Once you set up your fee payment
                  portal this waiver will be directly applied.
                </div>
              )}
            </div>
          </div>
          <div className="bg-[#2C2C2C99] p-4 w-full rounded-xl">
            <div className="pl-3">Your LITMUS Challenge Submissions:</div>
            <div className="">
              {cohortDetails?.litmusTestDetail[0]?.litmusTasks.map(
                (Task: any, index: any) => (
                  <div key={index} className="space-y-3">
                    <div>
                      <Badge className="px-3 mt-4 text-sm border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10 font-semibold -mb-2">
                        Task 0{index + 1}
                      </Badge>
                    </div>
                    {litmusTestDetails?.litmusTasks?.[
                      litmusTestDetails?.litmusTasks.length - 1
                    ]?.tasks && (
                      <div className="flex flex-wrap gap-1.5">
                        {litmusTestDetails?.litmusTasks?.[
                          litmusTestDetails?.litmusTasks.length - 1
                        ]?.tasks?.[index]?.texts?.map(
                          (textItem: string, id: number) => (
                            <div
                              key={`text-${id}`}
                              className="w-full text-sm sm:text-base flex items-center gap-2 px-4 py-2 border rounded-xl bg-[#09090b]"
                            >
                              {textItem}
                            </div>
                          )
                        )}
                        {litmusTestDetails?.litmusTasks?.[
                          litmusTestDetails?.litmusTasks.length - 1
                        ]?.tasks?.[index]?.links?.map(
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
                        {litmusTestDetails?.litmusTasks?.[
                          litmusTestDetails?.litmusTasks.length - 1
                        ]?.tasks?.[index]?.images?.map(
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
                                onClick={() => window.open(imageItem, "_blank")}
                              >
                                <ArrowUpRight className="w-5" />
                              </Button>
                            </div>
                          )
                        )}
                        {litmusTestDetails?.litmusTasks?.[
                          litmusTestDetails?.litmusTasks.length - 1
                        ]?.tasks?.[index]?.videos?.map(
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
                                onClick={() => window.open(videoItem, "_blank")}
                              >
                                <ArrowUpRight className="w-5" />
                              </Button>
                            </div>
                          )
                        )}
                        {litmusTestDetails?.litmusTasks?.[
                          litmusTestDetails?.litmusTasks.length - 1
                        ]?.tasks?.[index]?.files?.map(
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
                                onClick={() => window.open(fileItem, "_blank")}
                              >
                                <ArrowUpRight className="w-5" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
          {["submitted"].includes(status) && (
            <div className="w-full flex justify-between items-center ">
              <Button
                size="xl"
                className=""
                type="button"
                disabled={loading}
                onClick={() => handleScheduleInterview()}
              >
                Book a Presentation Session
              </Button>
            </div>
          )}
          {["interview scheduled", "interview cancelled"].includes(status) && (
            <InterviewDetailsCard student={student} />
          )}
        </div>
      )}

      {status === "completed" ? (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row">
            <div
              className={`!bg-transparent flex flex-col items-center w-full lg:w-[264px] min-h-[300px] p-8 rounded-2xl border ${getBadgeColor(
                litmusTestDetails?.scholarshipDetail?.scholarshipName
              )} relative`}
            >
              <img
                src="/assets/images/bg-lit-icon.svg"
                className="w-[130px] h-[143px] absolute top-[53px]"
              />

              <div
                className={`!bg-transparent text-center italic ${getBadgeColor(
                  litmusTestDetails?.scholarshipDetail?.scholarshipName
                )} text-3xl font-black absolute top-1/2 -translate-y-1/2`}
              >
                {litmusTestDetails?.scholarshipDetail?.scholarshipName}
              </div>

              <div className="space-y-1 text-center absolute bottom-[34px]">
                <div className="text-sm text-white font-normal">
                  {
                    student?.appliedCohorts?.[
                      student?.appliedCohorts.length - 1
                    ]?.cohortId?.programDetail?.name
                  }
                </div>
                <div className="text-xs font-normal text-[#F8E000]">
                  {new Date(
                    student?.appliedCohorts?.[
                      student?.appliedCohorts.length - 1
                    ]?.cohortId?.startDate
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div
              className={`!bg-transparent w-full min-h-[300px] py-4 flex flex-col gap-2 px-4 sm:px-10 rounded-2xl border ${getBadgeColor(
                litmusTestDetails?.scholarshipDetail?.scholarshipName
              )}`}
            >
              <div className="flex flex-col my-auto gap-y-4 sm:gap-y-12">
                <div className="space-y-3 sm:space-y-6">
                  <p className="text-lg sm:text-2xl text-white font-medium">
                    You are eligible for a{" "}
                    {
                      litmusTestDetails?.scholarshipDetail
                        ?.scholarshipPercentage
                    }
                    % waiver on your fee
                  </p>
                  <p className="text-sm sm:text-base text-white">
                    With a challenge clearance of{" "}
                    <span className="font-semibold">
                      {avgTaskScore.toFixed(2) || "--"}%
                    </span>
                    , you may avail a{" "}
                    <span
                      className={`!bg-transparent ${getBadgeColor(
                        litmusTestDetails?.scholarshipDetail?.scholarshipName
                      )}`}
                    >
                      waiver of INR{" "}
                      {formatAmount(
                        cohortDetails?.baseFee *
                          1.18 *
                          0.01 *
                          litmusTestDetails?.scholarshipDetail
                            ?.scholarshipPercentage
                      )}
                      /-
                    </span>{" "}
                    on your fee. Access your payment portal to find out and keep
                    track of your fee payments.
                  </p>
                </div>
                <Button
                  size={"xl"}
                  className={`w-full sm:w-fit mt-4 !text-white ${getBadgeColor(
                    litmusTestDetails?.scholarshipDetail?.scholarshipName
                  )}`}
                  onClick={() => navigate("../fee-payment")}
                >
                  Access Payment Portal
                </Button>
              </div>
            </div>
          </div>
          <Card className="px-6 py-8 space-y-8">
            <div className="flex justify-between items-center">
              <div className="text-xl sm:text-2xl font-medium">
                LITMUS Challenge Review
              </div>
              {/* <div className="text-base sm:text-2xl font-medium ">{new Date().toLocaleDateString(litmusTestDetails?.updatedAt)}</div> */}
            </div>
            <div className="h-0 border-t-2 border-dashed w-full" />
            {litmusTestDetails?.results && (
              <div className="space-y-4">
                <div className="text-base sm:text-2xl font-medium pl-3">
                  Scores
                </div>
                {litmusTestDetails?.scholarshipDetail && (
                  <div className="bg-gradient-to-r from-[#DBA61D] to-[#98710A] flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border rounded-xl p-6">
                    <div className="flex items-center">
                      <img
                        src="/assets/icons/score-icon.svg"
                        className="w-12 h-8"
                      />
                      <div className="text-xl font-semibold">
                        Weighted Total Score
                      </div>
                    </div>
                    <div className="flex gap-2 items-center text-2xl font-semibold">
                      <img
                        src={`/assets/icons/${getIcon(totalScore, maxScore)}`}
                        className="w-6 h-6"
                      />
                      {totalScore ? totalScore : "--"}/{maxScore}
                    </div>
                  </div>
                )}

                {litmusTestDetails?.performanceRating && (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border rounded-xl p-6">
                    <div className="flex items-center">
                      <img
                        src="/assets/icons/rating-icon.svg"
                        className="w-8 h-8"
                      />
                      <div className="text-xl font-semibold">
                        Performance Rating
                      </div>
                    </div>
                    <div className="flex gap-2.5 items-center">
                      {[...Array(5)].map((_, index) => (
                        <img
                          src={`/assets/icons/${
                            5 - index > litmusTestDetails?.performanceRating
                              ? "no-star-icon.svg"
                              : "star-icon.svg"
                          }`}
                          key={index}
                          className={`w-6 h-6 `}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="w-full grid grid-cols md:grid-cols-2 gap-3">
                  {cohortDetails?.litmusTestDetail?.[0]?.litmusTasks[0]?.judgmentCriteria.map(
                    (criteria: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 sm:p-6 flex flex-col gap-4 justify-between rounded-xl border "
                      >
                        <div className="space-y-2">
                          <div className="flex gap-2 items-center text-lg font-semibold ml-1 ">
                            <HandMetal className="rotate-90 w-4" />
                            <span className="flex-1">{criteria?.name}</span>
                          </div>
                          {criteria?.description ? (
                            <div className="text-sm font-normal">
                              {criteria?.description}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground font-normal">
                              No Description Shared
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 items-center text-2xl font-semibold">
                          <img
                            src={`/assets/icons/${getIcon(
                              litmusTestDetails?.results?.[0]?.score?.[index]
                                ?.score,
                              litmusTestDetails?.results?.[0]?.score?.[index]
                                ?.totalScore
                            )}`}
                            className="w-6 h-6"
                          />
                          {
                            litmusTestDetails?.results?.[0]?.score?.[index]
                              ?.score
                          }
                          /
                          {
                            litmusTestDetails?.results?.[0]?.score?.[index]
                              ?.totalScore
                          }
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            <div className="h-0 border-t-2 border-dashed w-full" />
            {litmusTestDetails?.overallFeedback?.[
              litmusTestDetails?.overallFeedback.length - 1
            ]?.feedback && (
              <div className="space-y-4">
                <div className="text-base sm:text-2xl font-medium pl-3">
                  Feedback
                </div>
                <InterviewFeedback
                  feedback={
                    litmusTestDetails?.overallFeedback?.[
                      litmusTestDetails?.overallFeedback.length - 1
                    ]?.feedback
                  }
                />
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div
          ref={bottomRef}
          className="flex flex-col items-start pt-2 space-y-8"
        >
          <div className="flex justify-between px-3 w-full">
            <div className="flex gap-4 items-center text-xl sm:text-3xl font-semibold text-white">
              <img
                src="/assets/images/scholarship-slabs.svg"
                alt="scholarship-slabs"
                className="h-8 sm:h-9"
              />
              Scholarship Slabs
            </div>
          </div>
          <div className="w-full grid grid-cols sm:grid-cols-2 gap-3">
            {cohortDetails?.litmusTestDetail?.[0]?.scholarshipSlabs.map(
              (slab: any, index: number) => (
                <ScholarshipSlabCard
                  index={index}
                  title={slab?.name}
                  waiverAmount={slab?.percentage + "%"}
                  clearanceRange={slab?.clearance + "%"}
                  desc={slab?.description}
                  color={getColor(index)}
                  bg={getBgColor(index)}
                />
              )
            )}
          </div>
        </div>
      )}

      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-2xl max-h-[70vh] sm:max-h-[90vh] overflow-y-auto">
          <SchedulePresentation
            student={student}
            interviewer={interviewer}
            eventCategory="Litmus Test Interview"
            redirectUrl={`${baseUrl}/dashboard/litmus-task`}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={feedbackOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="border mx-auto max-h-[70vh] sm:max-h-[90vh] p-6 sm:p-8 overflow-y-auto max-w-[90vw] sm:max-w-5xl rounded-3xl">
          <LitmusFeedbackForm
            student={student}
            setClose={() => setFeedbackOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TaskConfigItemProps {
  control: any;
  taskIndex: number;
  configIndex: number;
  configItem: any;
}

const TaskConfigItem: React.FC<TaskConfigItemProps> = ({
  control,
  taskIndex,
  configIndex,
  configItem,
}) => {
  const fieldName = `tasks.${taskIndex}.configItems.${configIndex}.answer`;

  const wordLimitHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    field: any,
    maxWordLimit: number
  ) => {
    const text = event.target.value;
    const wordCount = text.split(/\s+/).filter(Boolean).length; // Count the words

    if (wordCount <= maxWordLimit) {
      field.onChange(text); // Allow change if under word limit
    }
  };

  switch (configItem.type) {
    case "long":
    case "short":
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea
                  className={`w-full text-white text-base mt-2 h-[540px] sm:h-[240px]`}
                  placeholder={`Write up to ${configItem.characterLimit} characters`}
                  rows={configItem.type === "long" ? 6 : 3}
                  onChange={(e) =>
                    wordLimitHandler(e, field, configItem.characterLimit)
                  }
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "image":
    case "video":
    case "file":
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FileUploadField field={field} configItem={configItem} />
          )}
        />
      );

    case "link":
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-base font-normal text-[#FA69E5] pl-3">
                {configItem.label || "Links"}
              </FormLabel>
              <FormControl>
                <div className="flex flex-col space-y-2 mt-2">
                  {Array.from({ length: configItem.characterLimit || 1 }).map(
                    (_, index) => (
                      <div key={index} className="relative">
                        <Input
                          type="url"
                          className="w-full text-white text-base mt-2 !pl-10"
                          placeholder={`Enter URL ${index + 1}`}
                          value={field.value?.[index] || ""}
                          onChange={(e) => {
                            const newLinks = [...(field.value || [])];
                            newLinks[index] = e.target.value;
                            field.onChange(newLinks);
                          }}
                        />
                        <Link2Icon className="absolute left-3 top-[30px] w-5 h-5" />
                      </div>
                    )
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    default:
      return null;
  }
};

interface FileUploadFieldProps {
  field: any;
  configItem: any;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  field,
  configItem,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<string[]>(field.value || []);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");

  useEffect(() => {
    setFiles(field.value || []);
  }, [field.value]);

  const appendFile = (fileUrl: string) => {
    const newFiles = [...files, fileUrl];
    setFiles(newFiles);
    field.onChange(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    field.onChange(newFiles);
  };

  const acceptTypes =
    configItem.type === "image"
      ? "image/*"
      : configItem.type === "video"
      ? "video/*"
      : configItem.allowedTypes && !configItem.allowedTypes.includes("All")
      ? configItem.allowedTypes
          .map((t: string) => `.${t.toLowerCase()}`)
          .join(",")
      : "*/*";

  const showUploadButton =
    !configItem.maxFiles || files.length < configItem.maxFiles;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadProgress(0);
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    const fileKey = generateUniqueFileName(file.name);

    if (file.size > configItem.maxFileSize * 1024 * 1024) {
      setError(`${configItem.type} size exeeds ${configItem.maxFileSize} MB`);
      return;
    }

    setFileName(fileKey);

    // Example chunk threshold
    const CHUNK_SIZE = 100 * 1024 * 1024;
    e.target.value = "";

    try {
      setUploading(true);
      let fileUrl = "";
      if (file.size <= CHUNK_SIZE) {
        fileUrl = await uploadDirect(file, fileKey);
      } else {
        fileUrl = await uploadMultipart(file, fileKey, CHUNK_SIZE);
      }
      appendFile(fileUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const uploadDirect = async (file: File, fileKey: string) => {
    const { data } = await axios.post(
      "https://dev.apply.litschool.in/student/generate-presigned-url",
      {
        bucketName: "dev-application-portal",
        key: fileKey,
      }
    );
    const { url } = data;

    await axios.put(url, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (evt: any) => {
        if (!evt.total) return;
        const percentComplete = Math.round((evt.loaded / evt.total) * 100);
        setUploadProgress(percentComplete);
      },
    });
    return url.split("?")[0];
  };

  const uploadMultipart = async (
    file: File,
    fileKey: string,
    chunkSize: number
  ) => {
    const uniqueKey = fileKey;

    // Initiate
    const initiateRes = await axios.post(
      "https://dev.apply.litschool.in/student/initiate-multipart-upload",
      {
        bucketName: "dev-application-portal",
        key: uniqueKey,
      }
    );
    const { uploadId } = initiateRes.data;

    // Upload chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    let totalBytesUploaded = 0;
    const parts: { ETag: string; PartNumber: number }[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const partRes = await axios.post(
        "https://dev.apply.litschool.in/student/generate-presigned-url-part",
        {
          bucketName: "dev-application-portal",
          key: uniqueKey,
          uploadId,
          partNumber: i + 1,
        }
      );
      const { url } = partRes.data;

      const uploadRes = await axios.put(url, chunk, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (evt: any) => {
          if (!evt.total) return;
          totalBytesUploaded += evt.loaded;
          const percent = Math.round((totalBytesUploaded / file.size) * 100);
          setUploadProgress(Math.min(percent, 100));
        },
      });

      parts.push({ PartNumber: i + 1, ETag: uploadRes.headers.etag });
    }

    // Complete
    await axios.post(
      "https://dev.apply.litschool.in/student/complete-multipart-upload",
      {
        bucketName: "dev-application-portal",
        key: uniqueKey,
        uploadId,
        parts,
      }
    );

    return `https://dev-application-portal.s3.amazonaws.com/${uniqueKey}`;
  };

  const handleDeleteFile = async (fileKey: string, index?: number) => {
    // try {
    //   if (!fileKey) {
    //     console.error("Invalid file fURL:", fileKey);
    //     return;
    //   }

    //   // Make sure `fileKey` is actually a string
    //   if (typeof fileKey === "string") {
    //     const deleteCommand = new DeleteObjectCommand({
    //       Bucket: "dev-application-portal",
    //       Key: fileKey,
    //     });
    //     await s3Client.send(deleteCommand);
    //     console.log("File deleted successfully from S3:", fileKey);

    //     // Remove it from the UI
    if (index !== undefined) {
      removeFile(index);
    }
    //   } else {
    //     console.error("The file URL is not valid...", fileKey);
    //   }
    // } catch (error) {
    //   console.error("Error deleting file:", error);
    //   setError("Failed to delete file. Try again.");
    // }
  };

  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/\s+/g, "-");
    return `${timestamp}-${sanitizedName}`;
  };

  return (
    <FormItem>
      <FormControl>
        <div className="flex flex-col space-y-2 mt-2">
          {/* Already-uploaded files */}
          {files.map((file, index) => {
            const isLink = typeof file === "string";
            return (
              <div
                key={index}
                className="flex items-center justify-between bg-[#007AFF] h-[52px] text-white p-1.5 rounded-xl w-full"
              >
                <div className="flex items-center gap-2 flex-1 w-[50vw] truncate">
                  <Badge size="icon" className="bg-[#3698FB] rounded-xl">
                    <FileTextIcon className="w-5" />
                  </Badge>
                  <span className="flex-1 truncate mr-4">
                    {isLink
                      ? (file as string).split("/").pop()
                      : (file as File).name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {isLink && (
                    <Button
                      size="icon"
                      type="button"
                      variant="ghost"
                      className="bg-white/20 hover:bg-white/30 rounded-xl"
                      onClick={() => window.open(file, "_blank")}
                    >
                      <ArrowUpRight className="w-5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    type="button"
                    className="bg-white/20 hover:bg-white/30 rounded-xl"
                    onClick={() => handleDeleteFile(fileName, index)}
                  >
                    <XIcon className="w-5" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Upload in-progress */}
          {uploading && (
            <div className="flex justify-between items-center bg-[#007AFF] h-[52px] text-white p-1.5 rounded-xl w-full">
              <div className="flex flex-1 truncate items-center gap-2">
                <Badge size="icon" className="bg-[#3698FB] rounded-xl">
                  <FileTextIcon className="w-5" />
                </Badge>
                <span className="flex-1 truncate mr-4">{fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                {uploadProgress === 100 ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Progress
                      className="h-2 w-20 sm:w-24"
                      value={uploadProgress}
                    />
                    <span>{uploadProgress}%</span>
                  </>
                )}
                {/* Cancel or close if needed */}
                <Button
                  size="icon"
                  type="button"
                  className="bg-white/20 hover:bg-white/30 rounded-xl"
                  onClick={() => handleDeleteFile(fileName)}
                >
                  <XIcon className="w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Upload button if under maxFiles */}
          {showUploadButton && (
            <div className="flex items-center justify-between w-full h-16 border-2 border-dashed rounded-xl p-1.5">
              <label className="w-full pl-3 text-muted-foreground">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple={configItem.maxFiles > 1}
                  accept={acceptTypes}
                  onChange={handleFileUpload}
                />
                <span className="cursor-pointer text-xs sm:text-base">
                  {`Upload ${configItem.type}${
                    configItem.maxFiles > 1 ? "s" : ""
                  } (Max size: ${configItem.maxFileSize || 15} MB)`}
                </span>
              </label>
              <Button
                type="button"
                disabled={uploading}
                className="flex gap-2 text-white px-6 py-6 rounded-xl"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="w-4 h-4" /> Upload {configItem.type}
              </Button>
            </div>
          )}

          {/* How many files so far */}
          {configItem.maxFiles && (
            <div className="text-sm text-muted-foreground pl-3">
              Uploaded {files.length} of {configItem.maxFiles} file
              {configItem.maxFiles > 1 ? "s" : ""}
            </div>
          )}

          {/* Errors */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
