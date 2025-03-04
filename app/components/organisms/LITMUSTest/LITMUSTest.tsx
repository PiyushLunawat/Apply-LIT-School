import React, { useContext, useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Upload, Clock, FileTextIcon, RefreshCw, X, Link2Icon, XIcon, UploadIcon, Download, ArrowUpRight, LoaderCircle, Link2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCohorts, getCurrentStudent, GetInterviewers, submitLITMUSTest } from '~/utils/studentAPI'; // Import your API function
import { UserContext } from '~/context/UserContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';
import ScholarshipSlabCard from '~/components/molecules/scholarshipSlabCard/scholarshipSlabCard';
import JudgementCriteriaCard from '~/components/molecules/JudgementCriteriaCard/JudgementCriteriaCard';
import { useNavigate } from '@remix-run/react';
import { Badge } from '~/components/ui/badge';
import { SchedulePresentation } from '../schedule-presentation-dialog/schedule-presentation';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { Progress } from '~/components/ui/progress';
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import axios from 'axios';

const getColor = (index: number) => {
  const colors = [ 'text-emerald-600', 'text-[#3698FB]', 'text-[#FA69E5]', 'text-orange-600'];
  return colors[index % 4];
};

const getBgColor = (index: number) => {
  const colors = ['bg-emerald-600/20', 'bg-[#3698FB]/20', 'bg-[#FA69E5]/20', 'bg-orange-600/20'];
  return colors[index % 4];
};

const litmusTestSchema = z.object({
  tasks: z.array(
    z.object({
      configItems: z.array(
        z.object({
          type: z.string(),
          answer: z.any(),
        })
      ),
    })
  ),
});

type LitmusTestFormValues = z.infer<typeof litmusTestSchema>;

interface ConfigItem {
  type: string;
  answer: any;
}

interface Task {
  configItems: ConfigItem[];
}

const LITMUSTest: React.FC = () => {
  const { register, watch, formState: { errors }, } = useForm<LitmusTestFormValues>({
    resolver: zodResolver(litmusTestSchema),
  });

  const { studentData } = useContext(UserContext);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [stu, setStu] = useState("");
  const [status, setStatus] = useState("");
  const [student, setStudent] = useState<any>();
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interviewer, setInterviewer] = useState<any>([]);
  const navigate = useNavigate();
  
  const form = useForm<LitmusTestFormValues>({
    resolver: zodResolver(litmusTestSchema),
    defaultValues: {
      tasks: [],
    },
  });

  const { control, handleSubmit, setValue } = form;
  
  useEffect(() => {
    async function fetchCohorts() {
      try {
        const cohortsData = await getCohorts();
        console.log("eda",cohortsData);
        
        setCohorts(cohortsData.data);
      } catch (error) {
        console.error('Error fetching cohorts:', error);
      }
    }
    fetchCohorts();
  }, [setValue, studentData]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const student = await getCurrentStudent(studentData._id); // Pass the actual student ID here
        console.log("vsd",student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.litmusTestDetails);
        setStu(student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.litmusTestDetails?._id); 
        setStudent(student)
        setStatus(student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.litmusTestDetails?.status)

      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };
    fetchStudentData();
  }, [studentData]);

  const getCohort = (cohortId: string) => {
        return cohorts.find((c) => c._id === cohortId);
      };

  const cohort = getCohort(studentData?.appliedCohorts?.[studentData?.appliedCohorts.length - 1]?.cohortId?._id);  

  const tasks = studentData?.appliedCohorts?.[studentData?.appliedCohorts.length - 1]?.cohortId?.litmusTestDetail?.[0]?.litmusTasks || [];
  useEffect(() => {
    if (cohort?.litmusTestDetail?.[0]?.litmusTasks.length > 0) {
      
      setValue(
        'tasks',
        cohort?.litmusTestDetail?.[0]?.litmusTasks.map((task: any) => ({
          configItems: task.submissionTypes.map((configItem: any) => ({
            type: configItem.type,
            answer:
              configItem.type === 'link'
                ? Array(configItem.maxFiles || 1).fill('')
                : configItem.type === 'file' || configItem.type === 'image' || configItem.type === 'video'
                ? []
                : '',
          })),
        }))
      );
    }
  }, [cohort, setValue]);


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
        litmusTaskId: stu,
        tasks: [
          {
            tasks: transformedTasks,
          },
        ],
      };

      console.log("Payload:", payload);

      // Submit the form data using the provided API function
      const response = await submitLITMUSTest(payload);
      console.log('Submission successful:', response);
      handleScheduleInterview();

      // Handle success (e.g., show a success message or redirect)
    } catch (error) {
      console.error('Failed to submit Litmus Test:', error);
      // Handle error (e.g., show an error message)
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {

    const data = {
      cohortId: student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?._id,
      role: 'Litmus_test_reviewer',
    };
    
    const response = await GetInterviewers(data);
    console.log("list", response.data);
  
    const payload = {
      emails: response.data,
      eventCategory: "Litmus Test Review", 
    };

    console.log("pay",payload);
    
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
      console.log("Interview scheduled successfully:", result.data);
  
      // Optionally set dialog open or show success message
    } 
    catch (error) {
      console.error("Error scheduling interview:", error);
      // alert("Failed to schedule interview. Please try again later.");
    }
  };

  return (
    <>
  <Form {...form}>  
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col items-start p-[52px] bg-[#09090B] text-white shadow-md w-full mx-auto space-y-6">
        {/* Title and Guidelines */}
        {cohort?.litmusTestDetail?.[0]?.litmusTasks.map((task: any, taskIndex: number) => (
          <>
          <div>
            <Badge className="text-sm my-4 border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10">
              Task 0{taskIndex+1}
            </Badge>
            <h2 className="text-3xl font-semibold mb-2">
              {task.title}
            </h2>
            <p className="text-xl mb-4">
              {task.description}
            </p>
          </div>

           <div className='w-full space-y-4'>
            {task?.resources?.resourceFiles.map((file: any, index: number) => (
              <div key={index} className="flex items-center justify-between w-full p-1.5 bg-[#2C2C2C] rounded-xl">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    size="icon"
                    className="text-white rounded-xl bg-[#09090b]"
                  >
                    <FileTextIcon className="w-5 h-5" />
                  </Badge>
                  <span className="text-white">{file.split('/').pop()}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon" type='button'
                  className="text-white rounded-xl hover:bg-[#1a1a1d]"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            ))}

            {task?.resources?.resourceLinks.map((link: any, index: number) => (
              <div key={index} className="flex items-center justify-between w-full p-1.5 bg-[#2C2C2C] rounded-xl">
              <div className="flex items-center space-x-2 truncate pr-12">
                <Badge
                  variant="outline"
                  size="icon"
                  className="text-white rounded-xl bg-[#09090b]"
                >
                  <Link2 className="w-5 h-5" />
                </Badge>
                <span className="text-white ">{link}</span>
              </div>
              <Button
                variant="outline"
                size="icon" type='button'
                className="text-white rounded-xl hover:bg-[#1a1a1d]"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Button>
            </div>
            ))}
          </div>
            
          <div className='w-full space-y-4'>
            <div className="flex justify-between items-center">
              <div className="text-xl sm:text-3xl font-semibold">Judgement Criteria</div>
            </div>
            <div className="w-full grid grid-cols sm:grid-cols-2 gap-3">
              {cohort?.litmusTestDetail?.[0]?.litmusTasks[0]?.judgmentCriteria.map((criteria: any, index: number) => ( 
                <JudgementCriteriaCard criteria={criteria?.name} maxPoint={criteria?.points} desc={criteria?.description} />
              ))}
            </div>
          </div>

          { !cohort ? 
            <div className="text-center text-white">
              No tasks available. Please ensure the cohort data is loaded correctly.
            </div> : 
            task.submissionTypes.map((configItem: any, configIndex: number) => (
              <TaskConfigItem
                key={configIndex}
                control={control}
                taskIndex={taskIndex}
                configIndex={configIndex}
                configItem={configItem}
              />
          ))}
        </>))}

        {status === 'submitted' ?
        <div className='w-full flex justify-between items-center '>
          <Button size="xl" className='' type="button" disabled={loading} onClick={() => handleScheduleInterview()}>
            {loading ? 'Scheduling...' : 'Schedule a Call'}
          </Button>
        </div> : 
        <div className='w-full flex justify-between items-center '>
          <Button size="xl" className='' type="submit" disabled={loading}>
            Submit and Book Presentation Session
          </Button>
        </div>
        }

      </div>
    </form>
  </Form>
  <div className="flex flex-col items-start p-[52px] pt-2 space-y-8">
    <div className='flex justify-between px-3 w-full'>
      <div className="flex gap-4 items-center text-3xl font-semibold text-white">
        <img src="/assets/images/scholarship-slabs.svg" alt="scholarship-slabs" className="h-9 "/>
        Scholarship Slabs
      </div>
    </div>
    <div className="w-full grid grid-cols sm:grid-cols-2 gap-3">
      {cohort?.litmusTestDetail?.[0]?.scholarshipSlabs.map((slab: any, index: number) => ( 
        <ScholarshipSlabCard title={slab?.name} waiverAmount={slab?.percentage+"%"} clearanceRange={slab?.clearance+"%"} desc={slab?.description} color={getColor(index)} bg={getBgColor(index)} />
      ))}
    </div>
  </div>

  <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
    <DialogContent className="max-w-2xl">
      <SchedulePresentation interviewer={interviewer} eventCategory='Litmus Test Review'/>
    </DialogContent>
  </Dialog>
  </>
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
    const wordCount = text.split(/\s+/).filter(Boolean).length; // Count the words
  
    if (wordCount <= maxWordLimit) {
      field.onChange(text); // Allow change if under word limit
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
            <FormItem className='w-full'>
              <FormControl>
                <Textarea
                  className={`w-full text-white text-base mt-2 h-[540px] sm:h-[240px]`}
                  placeholder={`Write up to ${configItem.characterLimit} characters`}
                  rows={configItem.type === 'long' ? 6 : 3}
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
            <FileUploadField
              field={field}
              configItem={configItem}
            />
          )}
        />
      );

      case 'link':
        return (
          <FormField
            control={control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-base font-normal text-[#FA69E5] pl-3">
                  {configItem.label || 'Links'}
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col space-y-2 mt-2">
                    {Array.from({ length: configItem.characterLimit || 1 }).map((_, index) => (
                      <div key={index} className="relative">
                        <Input type='url'
                          className="w-full text-white text-base mt-2 !pl-10"
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
    const { data } = await axios.post(`https://dev.apply.litschool.in/student/generate-presigned-url`, {
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
    const initiateRes = await axios.post(`https://dev.apply.litschool.in/student/initiate-multipart-upload`, {
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
      const partRes = await axios.post(`https://dev.apply.litschool.in/student/generate-presigned-url-part`, {
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
    await axios.post(`https://dev.apply.litschool.in/student/complete-multipart-upload`, {
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
    <FormItem className='w-full'>
      <FormControl>
        <div className="flex flex-col space-y-2 mt-2">
          {/* Display selected files */}
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
          {/* Display the number of uploaded files out of maxFiles */}
          {configItem.maxFiles && (
            <div className="text-sm text-muted-foreground">
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

export default LITMUSTest;
