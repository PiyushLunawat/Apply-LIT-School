import React, { useContext, useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Upload, Clock, FileTextIcon, RefreshCw, X, Link2Icon, XIcon, UploadIcon, Download, ArrowUpRight, LoaderCircle, Link2, FileIcon, VideoIcon, ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GetInterviewers, submitLITMUSTest } from '~/api/studentAPI'; // Import your API function
import { UserContext } from '~/context/UserContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';
import ScholarshipSlabCard from '~/components/molecules/scholarshipSlabCard/scholarshipSlabCard';
import JudgementCriteriaCard from '~/components/molecules/JudgementCriteriaCard/JudgementCriteriaCard';
import { useNavigate } from '@remix-run/react';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog';
import { Progress } from '~/components/ui/progress';
import axios from 'axios';
import { SchedulePresentation } from '~/components/organisms/schedule-presentation-dialog/schedule-presentation';
import InterviewDetailsCard from './InterviewDetails';

import {
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

const s3Client = new S3Client({
  
});

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
          answer: z.union([
            // for link (URL)
            z.string().nonempty('This field is required').url('Please enter a valid Link URL'),
            // for short/long text
            z.string().nonempty('This field is required'),
            // for files/array
            z.array(z.any()).nonempty('This field is required'),
          ]),
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

interface LitmusTestProps {
  student: any
}

export default function LitmusTest({ student }: LitmusTestProps) {
  
  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;
  // console.log("whwhw",latestCohort);
  
  const [litmusTestDetails, setLitmusTestDetails] = useState<any>(latestCohort?.litmusTestDetails);
  const [status, setStatus] = useState<string>(litmusTestDetails?.status);

  const { studentData } = useContext(UserContext);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interviewer, setInterviewer] = useState<any>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLitmusTestDetails(latestCohort?.litmusTestDetails);
    setStatus(latestCohort?.litmusTestDetails?.status);
  }, [latestCohort]);  

  const storageKey = studentData?.email 
  ? `litmusTestForm-${studentData.email}` 
  : 'litmusTestForm-unknownUser';
  
  const form = useForm<LitmusTestFormValues>({
    resolver: zodResolver(litmusTestSchema),
    mode: 'onChange',
    defaultValues: {
      tasks: [],
    },
  });

  const { control, handleSubmit,reset, setValue, watch, formState: { isValid },  } = form; 

  const tasks = cohortDetails?.litmusTestDetail?.[0]?.litmusTasks || [];

  useEffect(() => {
    if (cohortDetails?.litmusTestDetail?.[0]?.litmusTasks.length > 0) {
      
      setValue(
        'tasks',
        cohortDetails?.litmusTestDetail?.[0]?.litmusTasks.map((task: any) => ({
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
  }, [cohortDetails, reset, storageKey, setValue]);

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
      setLitmusTestDetails(response.data);
      setStatus(response.data?.status);
      handleScheduleInterview();

    } catch (error) {
      console.error('Failed to submit Litmus Test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {

    const data = {
      cohortId: student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?._id,
      role: 'Litmus_test_reviewer',
    };

    setLoading(true);
    
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
    } 
    catch (error) {
      console.error("Error scheduling interview:", error);
    } finally {
      setLoading(false);
    }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://apply-lit-school.vercel.app";

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return null;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['mp4', "mkv", 'webm', 'ogg'].includes(extension)) return 'video';
    if (extension === 'pdf') return 'pdf';
    return 'other';
  };

  return (
    <>
    {status === undefined ? 
      <div className='flex flex-col items-start p-[52px] bg-[#09090B] text-white shadow-md w-full mx-auto space-y-8'>
      <div className=''>
        <div className='text-3xl font-medium'>LITMUS Challenge submission</div>
      </div>
      <div className='w-full space-y-6'>
        <Skeleton className="h-[60px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div> : 
    ['', 'pending'].includes(status) ? 
    <Form {...form}>  
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-start p-[52px] bg-[#09090B] text-white shadow-md w-full mx-auto space-y-6">
            {cohortDetails?.litmusTestDetail?.[0]?.litmusTasks.map((task: any, taskIndex: number) => (
              <div key={taskIndex} className='space-y-7'>
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
                            <div className=''>
                            <img
                              src={file}
                              alt={file.split('/').pop()}
                              className="w-full h-[620px] object-contain rounded-xl"
                            />
                            </div>
                          );
                        case 'video':
                          return (
                            <div className=''>
                            <video controls preload="none" className="h-[420px] rounded-t-xl">
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
                
                <Card className='w-full space-y-4 px-6 py-6 shadow-[0px_4px_32px_rgba(121,121,121,0.2)]'>
                  <div className="flex justify-between items-center">
                    <div className="text-xl sm:text-2xl font-normal pl-3">Judgement Criteria</div>
                  </div>
                  <div className="w-full grid grid-cols sm:grid-cols-2 gap-3">
                    {cohortDetails?.litmusTestDetail?.[0]?.litmusTasks[0]?.judgmentCriteria.map((criteria: any, index: number) => ( 
                      <JudgementCriteriaCard index={index} criteria={criteria?.name} maxPoint={criteria?.points} desc={criteria?.description} />
                    ))}
                  </div>
                </Card>

                {cohortDetails ? 
                  <div className="">
                    <div className="text-xl font-medium pl-3">
                      Your Submission
                    </div>
                    <div className='space-y-3'>
                      {task.submissionTypes.map((configItem: any, configIndex: number) => (
                        <TaskConfigItem
                          key={configIndex}
                          control={control}
                          taskIndex={taskIndex}
                          configIndex={configIndex}
                          configItem={configItem}
                        />
                      ))}
                      </div>
                    </div> :
                    <div className="text-center text-white">
                      No tasks available. Please ensure the cohort data is loaded correctly.
                    </div> 
                }
            </div>
          ))}

            <div className='w-full flex justify-between items-center '>
              <Button size="xl" className='' type="submit" disabled={loading || !isValid}>
                Submit and Book Presentation Session
              </Button>
            </div>

          </div>
        </form>
      </Form>
    :
  // {['submitted', 'interview scheduled', 'interview cancelled', 'completed'].includes(status) &&
  <div className='flex flex-col items-start p-[52px] bg-[#09090B] text-white shadow-md w-full mx-auto space-y-8'>
    <div className=''>
      <div className='text-2xl font-medium'>Congratulations on making your LITMUS Challenge submission!</div>
      {status === 'submitted' && <div className='text-xl font-normal'>You are now required to schedule a call with us to present your work.</div>}
      {status === 'interview scheduled' && <div className='text-xl font-normal'>You are now required to present your work at the selected date and time .</div>}
      {status === 'interview cancelled' && <div className='text-xl font-normal'>You are now required to select a presentation date and time to present your work.</div>}
    </div>
    <div className='bg-[#2C2C2C99] p-4 w-full rounded-xl'>
      <div className='pl-3'>Your LITMUS Challenge Submissions:</div>
      <div className=''>
      {cohortDetails?.litmusTestDetail[0]?.litmusTasks.map((Task: any, index: any) => (
      <div key={index} className="space-y-1">
      <div>
        <Badge className="px-3 mt-4 text-sm border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10 font-semibold -mb-2">
          Task 0{index+1}
        </Badge>
      </div>
      {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks && 
        <div className="flex flex-wrap gap-2">
          {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks?.[index]?.texts?.map((textItem: string, id: number) => (
            <div key={`text-${id}`} className="w-full flex items-center gap-2 mt-2 px-4 py-2 border rounded-xl bg-[#09090b]">
              {textItem}
            </div>
          ))}
          {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks?.[index]?.links?.map((linkItem: string, id: number) => (
            <div key={`link-${id}`} className="min-w-1/2 flex flex-1 justify-between items-center gap-2 mt-2 p-2 border rounded-xl bg-[#09090b]">
              <div className='flex gap-2 items-center'>
              <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                <Link2Icon className="w-5 h-5" />
              </Badge>
              <span className=''>
                {linkItem}
              </span>
              </div>
              <Button size="icon" type="button" className="bg-[#1B1B1C] hover:bg-[#1a1a1d] rounded-xl" onClick={() => window.open(linkItem, "_blank")}>
                <ArrowUpRight className="w-5" />
              </Button>
            </div>
          ))}
          {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks?.[index]?.images?.map((imageItem: string, id: number) => (
            <div key={`image-${id}`} className="min-w-1/2 flex flex-1 justify-between items-center gap-2 mt-2 p-2 border rounded-xl bg-[#09090b]">
              <div className='flex gap-2 items-center'>
                <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                  <ImageIcon className="w-5 h-5" />
                </Badge>
                <span className=''>
                  {imageItem.split('/').pop()}
                </span>
              </div>
              <Button size="icon" type="button" className="bg-[#1B1B1C] hover:bg-[#1a1a1d] rounded-xl" onClick={() => window.open(imageItem, "_blank")}>
                <ArrowUpRight className="w-5" />
              </Button>
            </div>
          ))}
          {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks?.[index]?.videos?.map((videoItem: string, id: number) => (
            <div key={`video-${id}`} className="min-w-1/2 flex flex-1 justify-between items-center gap-2 mt-2 p-2 border rounded-xl bg-[#09090b]">
              <div className='flex gap-2 items-center'>
              <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                <VideoIcon className="w-5 h-5" />
              </Badge>
              <span className=''>
                {videoItem.split('/').pop()}
              </span>
              </div>
              <Button size="icon" type="button" className="bg-[#1B1B1C] hover:bg-[#1a1a1d] rounded-xl" onClick={() => window.open(videoItem, "_blank")}>
                <ArrowUpRight className="w-5" />
              </Button>
            </div>
          ))}
          {litmusTestDetails?.litmusTasks?.[litmusTestDetails?.litmusTasks.length - 1]?.tasks?.[index]?.files?.map((fileItem: string, id: number) => (
            <div key={`file-${id}`} className="min-w-1/2 flex flex-1 justify-between items-center gap-2 mt-2 p-2 border rounded-xl bg-[#09090b]">
              <div className='flex gap-2 items-center'>
                <Badge size="icon" className="text-white rounded-lg bg-[#1B1B1C]">
                  <FileTextIcon className="w-5 h-5" />
                </Badge>
                <span className=''>
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
    {['submitted'].includes(status) &&
      <div className='w-full flex justify-between items-center '>
        <Button size="xl" className='' type="button" disabled={loading} onClick={() => handleScheduleInterview()}>
          Book a Presentation Session
        </Button>
      </div>
    }
    {['interview scheduled', 'interview cancelled'].includes(status) &&
      <InterviewDetailsCard student={student}/> }
  </div>

  }

   {/* <>
      <InterviewFeedback
      fileName="Application_0034.pdf"
      strengths={strengths}
      status={`rejected`}
      weaknesses={weaknesses}
      opportunities={opportunities}
      threats={threats}
      date="3 September, 2024"
          />
        </> */}
        
  <div className="flex flex-col items-start p-[52px] pt-2 space-y-8">
    <div className='flex justify-between px-3 w-full'>
      <div className="flex gap-4 items-center text-3xl font-semibold text-white">
        <img src="/assets/images/scholarship-slabs.svg" alt="scholarship-slabs" className="h-9 "/>
        Scholarship Slabs
      </div>
    </div>
    <div className="w-full grid grid-cols sm:grid-cols-2 gap-3">
      {cohortDetails?.litmusTestDetail?.[0]?.scholarshipSlabs.map((slab: any, index: number) => ( 
        <ScholarshipSlabCard ind={index} title={slab?.name} waiverAmount={slab?.percentage+"%"} clearanceRange={slab?.clearance+"%"} desc={slab?.description} color={getColor(index)} bg={getBgColor(index)} />
      ))}
    </div>
  </div>

  <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
  <DialogTitle></DialogTitle>
    <DialogContent className="max-w-2xl">
      <SchedulePresentation student={student} interviewer={interviewer} eventCategory='Litmus Test Review' redirectUrl={`${baseUrl}/dashboard/litmus-task`}/>
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadProgress(0);
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    const fileKey = generateUniqueFileName(file.name);

    if (file.size > configItem.maxFileSize * 1024 * 1024 ) {
      setError(`${configItem.type} size exeeds ${configItem.maxFileSize} MB`);
      return;
    }
    
    setFileName(fileKey);

    const CHUNK_SIZE = 100 * 1024 * 1024;
    e.target.value = "";

    try {
      setUploading(true);
      let fileUrl = "";
      if (file.size <= CHUNK_SIZE) {
        fileUrl = await uploadDirect(file, fileKey);
        console.log("uploadDirect File URL:", fileUrl);
      } else {
        fileUrl = await uploadMultipart(file, fileKey, CHUNK_SIZE);
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

  const uploadDirect = async (file: File, fileKey: string) => {
    const { data } = await axios.post(`https://dev.apply.litschool.in/student/generate-presigned-url`, {
      bucketName: "dev-application-portal",
      key: fileKey,
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

  const uploadMultipart = async (file: File, fileKey: string, chunkSize: number) => {
    const uniqueKey = fileKey;

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
    const sanitizedName = originalName.replace(/\s+/g, '-');
    return `${timestamp}-${sanitizedName}`;
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
                <Badge size="icon" className="bg-[#3698FB] rounded-xl mr-2">
                  <FileTextIcon className="w-5" />
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
                <Button size="icon" type="button" className="bg-[#1B1B1C] rounded-xl">
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
