import { S3Client } from "@aws-sdk/client-s3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@remix-run/react";
import axios from "axios";
import {
  ArrowUpRight,
  Clipboard,
  ClipboardCheck,
  FileTextIcon,
  Link2,
  Link2Icon,
  LoaderCircle,
  UploadIcon,
  XIcon,
} from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { submitApplicationTask } from "~/api/studentAPI";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import { Textarea } from "~/components/ui/textarea";
import { UserContext } from "~/context/UserContext";

const s3Client = new S3Client({});

const validateLinks = (values: FormSchema) => {
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

// ------------------ ZOD Schema ------------------
const formSchema = z.object({
  courseDive: z.object({
    interest: z.string().nonempty("This field is required"),
    goals: z.string().nonempty("This field is required"),
  }),
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

// ------------------ Types ------------------
type FormSchema = z.infer<typeof formSchema>;

interface ApplicationTaskFormProps {
  student: any;
}

export default function ApplicationTaskForm({
  student,
}: ApplicationTaskFormProps) {
  const latestCohort =
    student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohort = latestCohort?.cohortId;
  const applicationTasks = latestCohort?.applicationDetails?.applicationTasks;

  const { studentData } = useContext(UserContext);
  const [id, setId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isTopVisible, setIsTopVisible] = useState(true);
  const [isBottomVisible, setIsBottomVisible] = useState(false);

  const navigate = useNavigate();

  // 1) A constant for the localStorage key
  const storageKey = studentData?.email
    ? `applicationTaskForm-${studentData.email}`
    : "applicationTaskForm-unknownUser";

  // ------------------ React Hook Form Setup ------------------
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      courseDive: {
        interest: "",
        goals: "",
      },
      tasks: [],
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isValid },
  } = form;

  // ------------------ Fetch Data + Initialize ------------------
  useEffect(() => {
    async function fetchData() {
      try {
        if (!studentData?._id) return;

        setId(applicationTasks[0]?._id);
        // The last submission’s first item (if it exists)
        const lastTaskSubmission =
          applicationTasks[applicationTasks.length - 1]?.applicationTasks?.[0];

        setTaskId(lastTaskSubmission?._id);

        // Build final tasks structure for React Hook Form
        const sDataTasks = lastTaskSubmission?.tasks || [];
        const cohortTasks = cohort?.applicationFormDetail?.[0]?.task || [];

        const finalTasks = cohortTasks.map((ct: any, tIndex: number) => {
          const existingTask = sDataTasks[tIndex] || {};
          console.log("lastTaskSubmission", existingTask);
          return {
            configItems: ct.config.map((configItem: any, cIndex: number) => {
              let answer: any = "";
              switch (configItem.type) {
                case "long":
                case "short":
                  // fill from existingTask.text array
                  answer =
                    existingTask.text && existingTask.text[cIndex]
                      ? existingTask.text[cIndex]
                      : "";
                  break;
                case "link":
                  answer = existingTask.links || [];
                  break;
                case "image":
                  answer = existingTask.images || [];
                  break;
                case "video":
                  answer = existingTask.videos || [];
                  break;
                case "file":
                  answer = existingTask.files || [];
                  break;
                default:
                  answer = "";
                  break;
              }
              return {
                type: configItem.type,
                answer,
              };
            }),
          };
        });

        // Fill in the "courseDive" text from last submission
        const courseDiveData = {
          interest: lastTaskSubmission?.courseDive[0] || "",
          goals: lastTaskSubmission?.courseDive[1] || "",
        };

        // Check localStorage
        const storedFormJSON = localStorage.getItem(storageKey);
        if (storedFormJSON) {
          const parsedForm = JSON.parse(storedFormJSON);
          const isEmpty =
            parsedForm?.courseDive?.interest === "" &&
            parsedForm?.courseDive?.goals === "" &&
            Array.isArray(parsedForm?.tasks) &&
            parsedForm.tasks.every(
              (task: any) =>
                Array.isArray(task.configItems) &&
                task.configItems.every((configItem: any) => {
                  if (["short", "long"].includes(configItem.type))
                    return configItem.answer === "";
                  if (
                    ["file", "image", "video", "link"].includes(configItem.type)
                  )
                    return (
                      Array.isArray(configItem.answer) &&
                      configItem.answer.length === 0
                    );
                  return true; // If new types are added later, they should default to "empty"
                })
            );

          if (isEmpty) {
            // If localStorage is empty, use server data
            console.log("finalTasks", courseDiveData, finalTasks);

            reset({
              courseDive: courseDiveData,
              tasks: finalTasks,
            });
          } else {
            // Otherwise, use localStorage
            reset(parsedForm);
          }
        } else {
          // No localStorage, use server data
          reset({
            courseDive: courseDiveData,
            tasks: finalTasks,
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData();
  }, [student, reset, storageKey]);

  // 2) If localStorage is empty, set it to our initial data
  useEffect(() => {
    if (!studentData || !studentData._id) return;
    const existingData = localStorage.getItem(storageKey);
    if (!existingData) {
      const initialData = form.getValues();
      localStorage.setItem(storageKey, JSON.stringify(initialData));
    }
  }, [studentData, form, storageKey]);

  // 3) Re-hydrate on refresh
  useEffect(() => {
    const storedFormJSON = localStorage.getItem(storageKey);
    if (storedFormJSON) {
      try {
        const parsedForm = JSON.parse(storedFormJSON);
        reset(parsedForm);
      } catch (error) {
        console.error("Error parsing form data from localStorage:", error);
      }
    }
  }, [reset, storageKey]);

  useEffect(() => {
    const topObserver = new IntersectionObserver(
      ([entry]) => setIsTopVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    const bottomObserver = new IntersectionObserver(
      ([entry]) => setIsBottomVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (topRef.current) topObserver.observe(topRef.current);
    if (bottomRef.current) bottomObserver.observe(bottomRef.current);

    return () => {
      if (topRef.current) topObserver.unobserve(topRef.current);
      if (bottomRef.current) bottomObserver.unobserve(bottomRef.current);
    };
  }, []);

  // 4) Save on changes
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, storageKey]);

  // ------------------ On Submit ------------------
  const onSubmit = async (data: FormSchema) => {
    try {
      setLoading(true);
      // Transform tasks into final shape for the server
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
            key = "text";
          }

          if (key) {
            if (!(key in transformedTask)) {
              transformedTask[key] = [];
            }
            if (Array.isArray(answer)) {
              transformedTask[key] = answer; // e.g. links, files
            } else {
              transformedTask[key].push(answer); // single text
            }
          }
        });
        return transformedTask;
      });

      // Final payload
      const payload = {
        taskDataId: taskId,
        isSubmit: true,
        tasks: [
          {
            courseDive: [data.courseDive.interest, data.courseDive.goals],
            tasks: transformedTasks,
          },
        ],
      };

      console.log("Submitting Payload:", payload);
      const res = await submitApplicationTask(payload);
      console.log("Submission success => ", res);

      // Clear local storage and navigate on success
      localStorage.removeItem(storageKey);
      navigate("/application/status");
    } catch (err) {
      console.error("Failed to submit application task:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (data: FormSchema) => {
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

      // Transform tasks into final shape for the server
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
            key = "text";
          }

          if (key) {
            if (!(key in transformedTask)) {
              transformedTask[key] = [];
            }
            if (Array.isArray(answer)) {
              transformedTask[key] = answer; // e.g. links, files
            } else {
              transformedTask[key].push(answer); // single text
            }
          }
        });
        return transformedTask;
      });

      // Final payload
      const payload = {
        taskDataId: taskId,
        tasks: [
          {
            courseDive: [data.courseDive.interest, data.courseDive.goals],
            tasks: transformedTasks,
          },
        ],
      };

      console.log("Submitting Payload:", payload);
      const res = await submitApplicationTask(payload);
      console.log("Submission success => ", res);
      form.clearErrors();

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to submit application task:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  function handleClearForm() {
    localStorage.removeItem(storageKey);

    form.reset({
      courseDive: { interest: "", goals: "" },
      tasks: [],
    });
  }

  // A helper for limiting word count
  const wordLimitHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    field: any,
    maxWordLimit: number
  ) => {
    const text = event.target.value;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount <= maxWordLimit) {
      field.onChange(text);
    }
  };

  // Get the tasks from the cohort data
  const tasks = cohort?.applicationFormDetail?.[0]?.task || [];

  const getFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (!extension) return null;
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension))
      return "image";
    if (["mp4", "mkv", "webm", "ogg"].includes(extension)) return "video";
    if (extension === "pdf") return "pdf";
    return "other";
  };

  // Render
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Course Dive Section */}
        <div ref={topRef} />
        <div className="flex flex-col gap-6 mt-8">
          <div className="flex-1 bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center py-4 text-2xl rounded-full">
            Course Dive
          </div>
          <div className="space-y-6">
            {/* interest */}
            <FormField
              control={form.control}
              name="courseDive.interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1 items-center text-xl sm:text-2xl font-normal text-[#00A0E9] pl-3">
                    Why are you interested in joining The LIT School?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="w-full text-white text-base h-[240px]"
                      placeholder="Write up to 120 words"
                      onChange={(e) => wordLimitHandler(e, field, 120)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage className="pl-3" />
                </FormItem>
              )}
            />

            {/* goals */}
            <FormField
              control={form.control}
              name="courseDive.goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1 items-center text-xl sm:text-2xl font-normal text-[#00A0E9] pl-3">
                    What are your career goals or aspirations?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="w-full text-white text-base h-[240px]"
                      placeholder="Write up to 240 words"
                      onChange={(e) => wordLimitHandler(e, field, 240)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage className="pl-3" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Tasks Section */}
        {tasks.map((task: any, taskIndex: number) => (
          <div key={taskIndex} className="flex flex-col gap-6 mt-8">
            <div className="flex-1 bg-[#FA69E5]/[0.2] text-[#FA69E5] text-center py-4 text-2xl rounded-full">
              Task {String(taskIndex + 1).padStart(2, "0")}
            </div>
            <div className="space-y-5">
              <div className="flex flex-col gap-3">
                <div className="">
                  <Label className="text-xl sm:text-2xl font-normal text-[#FA69E5] pl-3">
                    {task.title}
                  </Label>
                  <div className="text-base text-white mt-2 pl-3">
                    {task.description}
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <div className="text-lg font-normal text-muted-foreground pl-3">
                    Resources
                  </div>
                  {task?.resources?.resourceFiles.map(
                    (file: any, index: number) => {
                      const fileType = getFileType(file);

                      switch (fileType) {
                        case "pdf":
                          return (
                            <div className="w-full min-h-[400px] max-h-[400px] sm:min-h-[500px] sm:max-h-[600px] justify-center flex items-center rounded-xl">
                              <iframe
                                src={file}
                                className="mx-auto w-full min-h-[400px] max-h-[400px] sm:min-h-[500px] sm:max-h-[600px] rounded-xl"
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
                                onClick={() => window.open(file, "_blank")}
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
                                onClick={() => window.open(file, "_blank")}
                              >
                                <ArrowUpRight className="w-5 h-5" />
                              </Button>

                              <video
                                controls
                                preload="none"
                                className="min-h-[400px] max-h-[500px] w-full rounded-xl "
                              >
                                <source src={file} type="video/mp4" />
                                Your browser does not support the video tag.
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
                                onClick={() => window.open(file, "_blank")}
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
                          <span className="text-white truncate">{link}</span>
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

              {/* If no cohort found */}
              {!cohort ? (
                <div className="text-center text-white">
                  No tasks available. Please ensure the cohort data is loaded
                  correctly.
                </div>
              ) : (
                // Else show each config item
                <div className="">
                  <div className="text-lg font-normal text-[#00A0E9] pl-3">
                    Your Submission
                  </div>
                  <div className="space-y-3">
                    {task.config.map((configItem: any, configIndex: number) => (
                      <TaskConfigItem
                        key={configIndex}
                        control={control}
                        taskIndex={taskIndex}
                        configIndex={configIndex}
                        configItem={configItem}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Submit + Clear */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end sm:justify-between items-center mt-8">
          <Button
            variant="link"
            type="button"
            className="underline order-2 sm:order-1"
            onClick={handleClearForm}
          >
            Clear Form
          </Button>
          <Button
            size="xl"
            className="w-full sm:w-fit space-y-1 order-1 sm:order-2"
            type="submit"
            disabled={loading || uploading}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
        {!isTopVisible && !isBottomVisible && (
          <Button
            size="xl"
            variant="outline"
            className="fixed bottom-24 right-4 sm:right-44 bg-[#09090b] hover:bg-[#09090b]/80"
            type="button"
            disabled={saveLoading || saved}
            onClick={() => onSave(form.getValues())}
          >
            <div className="sm:hidden flex items-center gap-2">
              {saved ? (
                <ClipboardCheck className="w-4 h-4" />
              ) : saveLoading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
              {saved ? "Saved" : saveLoading ? "Saving" : "Save"}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {saved ? (
                <ClipboardCheck className="w-4 h-4" />
              ) : saveLoading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
              {saved
                ? "Updates Saved"
                : saveLoading
                ? "Saving Updates"
                : "Save Updates"}
            </div>
          </Button>
        )}
        <div ref={bottomRef} />
      </form>
    </Form>
  );
}

// ------------------ Config Item ------------------
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
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (wordCount <= maxWordLimit) {
      field.onChange(text);
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
            <FormItem>
              <FormControl>
                <Textarea
                  className="w-full text-white text-base mt-2 h-[240px]"
                  placeholder={`Write up to ${configItem.characterLimit} characters`}
                  onChange={(e) =>
                    wordLimitHandler(e, field, configItem.characterLimit)
                  }
                  value={field.value}
                />
              </FormControl>
              <FormMessage className="pl-3" />
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
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-base font-normal text-[#FA69E5] pl-3">
                {configItem.label || "Links"}
              </FormLabel>
              <FormControl>
                <div className="flex flex-col space-y-2 mt-2">
                  {Array.from({ length: configItem.characterLimit || 1 }).map(
                    (_, index) => {
                      const linkValue = field.value?.[index] || "";
                      const error = Array.isArray(fieldState.error)
                        ? fieldState.error[index]
                        : fieldState.error;
                      return (
                        <div key={index} className="relative">
                          <Input
                            className={`w-full text-white text-base mt-2 pl-10 ${
                              error ? "border-red-500" : ""
                            }`}
                            placeholder={`Enter URL ${index + 1}`}
                            value={linkValue}
                            onChange={(e) => {
                              const newLinks = [...(field.value || [])];
                              newLinks[index] = e.target.value;
                              field.onChange(newLinks);
                            }}
                          />
                          <Link2Icon className="absolute left-3 top-[30px] w-5 h-5" />
                          {error && (
                            <p className="text-[#FF503D] text-sm pl-3 mt-1">
                              {error.message}
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </FormControl>
              {/* <FormMessage className='pl-3'/> */}
            </FormItem>
          )}
        />
      );

    default:
      return null;
  }
};

// ------------------ File Upload Field ------------------
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
    const fileKey = generateUniqueFileName(
      file.name,
      "application_task_resource"
    );

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
    return fileKey;
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

    return uniqueKey;
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

  const generateUniqueFileName = (originalName: string, folder?: string) => {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/\s+/g, "-");
    return `${folder}/${timestamp}-${sanitizedName}`;
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
      <FormMessage className="pl-3" />
    </FormItem>
  );
};
