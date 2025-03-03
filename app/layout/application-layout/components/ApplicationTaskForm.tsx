import React, { useContext, useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { UserContext } from '~/context/UserContext';
import { Button } from '~/components/ui/button';
import {
  ArrowUpRight,
  Download,
  FileIcon,
  FileTextIcon,
  Link2Icon,
  LoaderCircle,
  Phone,
  RefreshCw,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/components/ui/form';
import { getCohorts, getCurrentStudent, submitApplicationTask } from '~/utils/studentAPI';
import { useNavigate } from '@remix-run/react';
import axios from 'axios';

import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Progress } from '~/components/ui/progress';
import { Badge } from '~/components/ui/badge';

const formSchema = z.object({
  courseDive: z.object({
    interest: z.string().nonempty('This field is required'),
    goals: z.string().nonempty('This field is required'),
  }),
  tasks: z.array(
    z.object({
      configItems: z.array(
        z.object({
          type: z.string(),
          answer: z.union([
            z.string().nonempty('This field is required').url('Please enter a valid Link URL'), // For links
            z.string().nonempty('This field is required'), // For text inputs
            z.array(z.any()).nonempty('This field is required'), // For file uploads
          ]),
        })
      ),
    })
  ),
});

type FormSchema = z.infer<typeof formSchema>;

interface ConfigItem {
  type: string;
  answer: any;
}

interface Task {
  configItems: ConfigItem[];
}

const ApplicationTaskForm: React.FC = () => {
  const { studentData } = useContext(UserContext);
  const [cohort, setCohort] = useState<any>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();  
  const [fetchedStudentData, setFetchedStudentData] = useState<any>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseDive: {
        interest: '',
        goals: '',
      },
      tasks: [],
    },
  });

  const { control, handleSubmit, setValue, reset, watch } = form;

  // ------------------ Fetch data from server and reset the form ------------------
  useEffect(() => {
    async function fetchData() {
      try {        
        const studentResp = await getCurrentStudent(studentData._id);

        const applicationTasks = studentResp?.appliedCohorts[studentResp.appliedCohorts.length - 1]?.applicationDetails?.applicationTasks;
        const lastTaskSubmission = applicationTasks[applicationTasks.length - 1]?.applicationTasks?.[0];

        setCohort(studentResp?.appliedCohorts[studentResp.appliedCohorts.length - 1]?.cohortId);
        const sDataTasks = lastTaskSubmission?.tasks || [];
        const cohortTasks =
          studentResp?.appliedCohorts[studentResp.appliedCohorts.length - 1]?.cohortId?.applicationFormDetail?.[0]?.task || [];

        const finalTasks = cohortTasks.map((ct: any, tIndex: number) => {
          const existingTask = sDataTasks[tIndex]?.task || {};
          return {
            configItems: ct.config.map((configItem: any, cIndex: number) => {
              let answer: any = '';
              switch (configItem.type) {
                case 'long':
                case 'short':
                  answer =
                    existingTask.text && existingTask.text[cIndex]
                      ? existingTask.text[cIndex]
                      : '';
                  break;
                case 'link':
                  answer = existingTask.links || [];
                  break;
                case 'image':
                  answer = existingTask.images || [];
                  break;
                case 'video':
                  answer = existingTask.videos || [];
                  break;
                case 'file':
                  answer = existingTask.files || [];
                  break;
                default:
                  answer = '';
                  break;
              }
              return {
                type: configItem.type,
                answer,
              };
            }),
          };
        });

        const courseDiveData = {
          interest: lastTaskSubmission?.courseDive?.text1 || '',
          goals: lastTaskSubmission?.courseDive?.text2 || '',
        };

        const storedFormJSON = localStorage.getItem(`applicationTaskForm-${studentData?.email}`);
        if (storedFormJSON) {
          const parsedForm = JSON.parse(storedFormJSON);
          const isEmpty =
            parsedForm?.courseDive?.interest === "" &&
            parsedForm?.courseDive?.goals === "" &&
            Array.isArray(parsedForm?.tasks) &&
            parsedForm.tasks.length === 0;

          if (isEmpty) {
            reset({
              courseDive: courseDiveData,
              tasks: finalTasks,
            });
          } else {
            reset(parsedForm);
          }
        } else {
          reset({
            courseDive: courseDiveData,
            tasks: finalTasks,
          });
        }

      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }

    fetchData();
  }, [studentData, reset]);

  // ------------------ LOCAL STORAGE SETUP ------------------
  useEffect(() => {
    if (!studentData || !studentData._id) return;
    const existingData = localStorage.getItem(`applicationTaskForm-${studentData?.email}`);
    if (!existingData) {
      const initialData = form.getValues();
      if (studentData?.email)
        localStorage.setItem(`applicationTaskForm-${studentData?.email}`, JSON.stringify(initialData));
    }
  }, [studentData, form]);

  useEffect(() => {
    const storedFormJSON = localStorage.getItem(`applicationTaskForm-${studentData?.email}`);
    if (storedFormJSON) {
      try {
        const parsedForm = JSON.parse(storedFormJSON);
        reset(parsedForm);
      } catch (error) {
        console.error("Error parsing form data from localStorage:", error);
      }
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      if (studentData?.email)
        localStorage.setItem(`applicationTaskForm-${studentData?.email}`, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, studentData?.email]);

  // ------------------ End LOCAL STORAGE SETUP ------------------

  const tasks = cohort?.applicationFormDetail?.[0]?.task || [];

  const onSubmit = async (data: FormSchema) => {
    try {
      setLoading(true);

      // Transform each task so that only keys corresponding to the present config item types are added.
      // Also include courseDive values from the form.
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
              transformedTask[key] = answer;
            } else {
              transformedTask[key].push(answer);
            }
          }
        });
        return transformedTask;
      });

      const payload = {
        _id: "67c4400edfb81b9c4ef535b2",
        taskDataId: "67c4400edfb81b9c4ef535b3",
        tasks: [
          {
            // Include the two strings from courseDive as text1 and text2 respectively.
            courseDive: [data.courseDive.interest, data.courseDive.goals],
            tasks: transformedTasks,
          },
        ],
      };

      console.log("Payload:", payload);
      const res = await submitApplicationTask(payload);
      console.log("Submission success => ", res);
      navigate("/application/status");
      localStorage.removeItem(`applicationTaskForm-${studentData?.email}`);
    } catch (err) {
      console.error("Failed to submit application task:", err);
    } finally {
      setLoading(false);
    }
  };

  const wordLimitHandler = (event: React.ChangeEvent<HTMLTextAreaElement>, field: any, maxWordLimit: number) => {
    const text = event.target.value;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount <= maxWordLimit) {
      field.onChange(text);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Course Dive Section */}
        <div className="flex flex-col gap-6 mt-8">
          <div className="flex-1 bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center py-4 text-2xl rounded-full">
            Course Dive
          </div>
          <div className="space-y-6">
            <FormField
              control={control}
              name="courseDive.interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1 items-center text-base font-normal text-[#00A0E9] pl-3">
                    Why are you interested in joining The LIT School?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="w-full text-white text-base h-[540px] sm:h-[240px]"
                      placeholder="Write up to 120 characters"
                      onChange={(e) => wordLimitHandler(e, field, 120)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="courseDive.goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1 items-center text-base font-normal text-[#00A0E9] pl-3">
                    What are your career goals or aspirations?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="w-full text-white text-base h-[540px] sm:h-[240px]"
                      placeholder="Write up to 240 characters"
                      onChange={(e) => wordLimitHandler(e, field, 240)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Tasks Section */}
        {tasks.map((task: any, taskIndex: number) => (
          <div key={taskIndex} className="flex flex-col gap-6 mt-8">
            <div className="flex-1 bg-[#FA69E5]/[0.2] text-[#FA69E5] text-center py-4 text-2xl rounded-full">
              Task 0{taskIndex + 1}
            </div>
            <div className="space-y-1">
              <div className="mb-4">
                <Label className="text-base font-normal text-[#FA69E5] pl-3">
                  {task.title}
                </Label>
                <div className="text-xl sm:text-2xl text-white mt-2 pl-3">
                  {task.description}
                </div>
              </div>
              {!cohort ? (
                <div className="text-center text-white">
                  No tasks available. Please ensure the cohort data is loaded correctly.
                </div>
              ) : (
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
              )}
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-2 justify-end sm:justify-between items-center mt-8">
          <Button
            variant="link"
            type="button"
            className="underline order-2 sm:order-1"
            onClick={() => form.reset()}
          >
            Clear Form
          </Button>
          <Button size="xl" className="w-full sm:w-fit space-y-1 order-1 sm:order-2" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

interface TaskConfigItemProps {
  control: any;
  taskIndex: number;
  configIndex: number;
  configItem: any;
}

const TaskConfigItem: React.FC<TaskConfigItemProps> = ({ control, taskIndex, configIndex, configItem }) => {
  const fieldName = `tasks.${taskIndex}.configItems.${configIndex}.answer`;

  const wordLimitHandler = (event: React.ChangeEvent<HTMLTextAreaElement>, field: any, maxWordLimit: number) => {
    const text = event.target.value;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount <= maxWordLimit) {
      field.onChange(text);
    }
  };

  switch (configItem.type) {
    case 'long':
    case 'short':
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="w-full text-white text-base mt-2 h-[540px] sm:h-[240px]"
                  placeholder={`Write up to ${configItem.characterLimit} characters`}
                  onChange={(e) => wordLimitHandler(e, field, configItem.characterLimit)}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case 'image':
    case 'video':
    case 'file':
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FileUploadField field={field} configItem={configItem} />
          )}
        />
      );
    case 'link':
      return (
        <FormField
          control={control}
          name={fieldName}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-base font-normal text-[#FA69E5] pl-3">
                {configItem.label || 'Links'}
              </FormLabel>
              <FormControl>
                <div className="flex flex-col space-y-2 mt-2">
                  {Array.from({ length: configItem.characterLimit || 1 }).map((_, index) => (
                    <div key={index} className="relative">
                      <Input
                        type="url"
                        className={`w-full text-white text-base mt-2 !pl-10 ${fieldState?.error ? 'border-red-500' : ''}`}
                        placeholder={`Enter URL ${index + 1}`}
                        value={field.value?.[index] || ''}
                        onChange={(e) => {
                          const newLinks = [...(field.value || [])];
                          newLinks[index] = e.target.value;
                          field.onChange(newLinks);
                        }}
                      />
                      <Link2Icon className="absolute left-3 top-[30px] w-5 h-5" />
                    </div>
                  ))}
                </div>
              </FormControl>
              {fieldState.error && (
                <p className="text-red-500 text-sm">
                  {fieldState.error.message || 'Please enter a valid URL'}
                </p>
              )}
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

const FileUploadField: React.FC<FileUploadFieldProps> = ({ field, configItem }) => {
  const [files, setFiles] = useState<string[]>(field.value || []);
  const [error, setError] = useState<string | null>(null);

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

  const showUploadButton = !configItem.maxFiles || files.length < configItem.maxFiles;

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadProgress(0);
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    const file = selectedFiles[0];
    setFileName(file.name);
    const CHUNK_SIZE = 100 * 1024 * 1024;
    e.target.value = "";
    try {
      setUploading(true);
      let fileUrl = "";
      if (file.size <= CHUNK_SIZE) {
        fileUrl = await uploadDirect(file);
        console.log("uploadDirect File URL:", fileUrl);
      } else {
        fileUrl = await uploadMultipart(file, CHUNK_SIZE);
        console.log("uploadMultipart File URL:", fileUrl);
      }
      appendFile(fileUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const uploadDirect = async (file: File) => {
    const { data } = await axios.post(`https://myfashionfind.shop/student/generate-presigned-url`, {
      bucketName: "dev-application-portal",
      key: generateUniqueFileName(file.name),
    });
    const { url } = data;
    await axios.put(url, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (evt: any) => {
        if (!evt.total) return;
        const percentComplete = Math.round((evt.loaded / evt.total) * 100);
        setUploadProgress(percentComplete);
      },
    });
    return `${url.split("?")[0]}`;
  };

  const uploadMultipart = async (file: File, chunkSize: number) => {
    const uniqueKey = generateUniqueFileName(file.name);
    const initiateRes = await axios.post(`https://myfashionfind.shop/student/initiate-multipart-upload`, {
      bucketName: "dev-application-portal",
      key: uniqueKey,
    });
    const { uploadId } = initiateRes.data;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let totalBytesUploaded = 0;
    const parts: { ETag: string; PartNumber: number }[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const partRes = await axios.post(`https://myfashionfind.shop/student/generate-presigned-url-part`, {
        bucketName: "dev-application-portal",
        key: uniqueKey,
        uploadId,
        partNumber: i + 1,
      });
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
    await axios.post(`https://myfashionfind.shop/student/complete-multipart-upload`, {
      bucketName: "dev-application-portal",
      key: uniqueKey,
      uploadId,
      parts,
    });
    return `https://dev-application-portal.s3.amazonaws.com/${uniqueKey}`;
  };

  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now();
    return `${timestamp}-${originalName}`;
  };

  return (
    <FormItem>
      <FormControl>
        <div className="flex flex-col space-y-2 mt-2">
          {files.map((file, index) => {
            const isLink = typeof file === "string";
            return (
              <div key={index} className="flex items-center bg-[#007AFF] h-[52px] text-white p-1.5 rounded-xl w-full">
                <Badge size="icon" className="bg-[#3698FB] rounded-xl mr-2">
                  <FileTextIcon className="w-5" />
                </Badge>
                <span className="flex-1 text-xs sm:text-base truncate mr-4">
                  {isLink ? (file as string).split('/').pop() : (file as File).name}
                </span>
                <div className="flex items-center space-x-2">
                  {isLink && (
                    <Button size="icon" type="button" variant="ghost" className="bg-[#3698FB] rounded-xl">
                      <a href={file as string} download target="_blank" rel="noopener noreferrer">
                        <ArrowUpRight className="w-5" />
                      </a>
                    </Button>
                  )}
                  <Button size="icon" type="button" className="bg-[#3698FB] rounded-xl" onClick={() => removeFile(index)}>
                    <XIcon className="w-5" />
                  </Button>
                </div>
              </div>
            );
          })}

          {uploading && (
            <div className="flex justify-between items-center bg-[#007AFF] h-[52px] text-white p-1.5 rounded-xl w-full">
              <div className="flex items-center gap-2">
                <Badge size="icon" className="bg-[#3698FB] rounded-xl !p-0 mr-2">
                  <FileTextIcon className="w-5 h-5" />
                </Badge>
                <span className="flex-1 text-xs sm:text-base truncate mr-4">{fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                {uploadProgress === 100 ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Progress className="h-2 w-24" value={uploadProgress} />
                    <span>{uploadProgress}%</span>
                  </>
                )}
                <Button size="icon" type="button" className="bg-[#3698FB] rounded-xl">
                  <XIcon className="w-5" />
                </Button>
              </div>
            </div>
          )}

          {showUploadButton && (
            <div className="flex items-center justify-between w-full h-16 border-2 border-dashed rounded-xl p-1.5">
              <label className="w-full pl-3 text-muted-foreground">
                <input
                  type="file"
                  className="hidden"
                  multiple={configItem.maxFiles > 1}
                  accept={
                    configItem.type === 'image'
                      ? 'image/*'
                      : configItem.type === 'video'
                      ? 'video/*'
                      : configItem.type === 'file' &&
                        configItem.allowedTypes &&
                        !configItem.allowedTypes.includes('All')
                      ? configItem.allowedTypes.map((type: string) => `.${type.toLowerCase()}`).join(',')
                      : '*/*'
                  }
                  onChange={handleFileUpload}
                />
                <span className="cursor-pointer text-xs sm:text-base">
                  {`Upload ${configItem.type}${configItem.maxFiles > 1 ? 's' : ''} (Max size: ${configItem.maxFileSize || 15} MB)`}
                </span>
              </label>
              <Button
                type="button"
                className="flex gap-2 text-white px-6 py-6 rounded-xl"
                onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              >
                <UploadIcon className="w-4 h-4" /> Upload {configItem.type}
              </Button>
            </div>
          )}
          {configItem.maxFiles && (
            <div className="text-sm text-muted-foreground pl-3">
              Uploaded {files.length} of {configItem.maxFiles} file{configItem.maxFiles > 1 ? 's' : ''}
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default ApplicationTaskForm;
