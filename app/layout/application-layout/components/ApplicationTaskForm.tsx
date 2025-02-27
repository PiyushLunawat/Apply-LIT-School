import React, { useContext, useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { UserContext } from '~/context/UserContext';
import { Button } from '~/components/ui/button';
import { Download, FileTextIcon, Link2Icon, Phone, RefreshCw, UploadIcon, XIcon } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import { getCohorts, getCurrentStudent, submitApplicationTask } from '~/utils/studentAPI';
import { useNavigate } from '@remix-run/react';

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
    // Remove hardcoded defaultValues; we will initialize (or reset) the form
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
        // Fetch the student's data
        console.log("ffef",studentData?._id);
        
        const studentResp = await getCurrentStudent(studentData._id);

        console.log("ffef",studentResp);
  
        const applicationTasks = studentResp?.appliedCohorts[studentResp.appliedCohorts.length - 1]?.applicationDetails?.applicationTasks;
        // Get the last task submission from the array, if it exists
        const lastTaskSubmission =  applicationTasks[applicationTasks.length - 1]?.applicationTasks?.[0];
  
        // Store the cohort for referencing later
        setCohort(studentResp?.appliedCohorts[studentResp.appliedCohorts.length - 1]?.cohortId);
  
        // The tasks array from the saved data, if any
        const sDataTasks = lastTaskSubmission?.tasks || [];
  
        // The "application" tasks from the cohort structure
        const cohortTasks =
        studentResp?.appliedCohorts[studentResp.appliedCohorts.length - 1]?.cohortId?.applicationFormDetail?.[0]?.task || [];
  
        // Build our final tasks array by merging the config from "cohortTasks"
        // with the actual saved values from "sDataTasks".
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
  
        // Prepare the courseDive data from the server if available
        const courseDiveData = {
          interest: lastTaskSubmission?.courseDive?.text1 || '',
          goals: lastTaskSubmission?.courseDive?.text2 || '',
        };
  
        const storedFormJSON = localStorage.getItem(`applicationTaskForm-${studentData?.email}`);
  if (storedFormJSON) {
    const parsedForm = JSON.parse(storedFormJSON);

    // Check if it's effectively empty
    const isEmpty =
      parsedForm?.courseDive?.interest === "" &&
      parsedForm?.courseDive?.goals === "" &&
      Array.isArray(parsedForm?.tasks) &&
      parsedForm.tasks.length === 0;

    if (isEmpty) {
      // If empty, reset to the new data
      reset({
        courseDive: courseDiveData,
        tasks: finalTasks,
      });
    } else {
      // Otherwise, use what was stored in local storage
      reset(parsedForm);
    }
  } else {
    // If nothing is in local storage at all, just reset to the new data
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
  
  // ------------------ LOCAL STORAGE SETUP FOR APPLICATION TASK FORM ------------------
  // 1. Initialize localStorage for "applicationTaskForm" if it doesn't exist.
  useEffect(() => {
    // Only run if studentData is available
    if (!studentData || !studentData._id) return;
    const existingData = localStorage.getItem(`applicationTaskForm-${studentData?.email}`);
    if (!existingData) {
      // Initialize with the current form values (after fetchData has reset the form)
      // Use form.getValues() to capture the current state.
      const initialData = form.getValues();
      if (studentData?.email)
      localStorage.setItem(`applicationTaskForm-${studentData?.email}`, JSON.stringify(initialData));
    }
  }, [studentData, form]);
  
  // 2. On mount, if localStorage data exists, load it and reset the form.
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
  
  // 3. Whenever the form data changes, update localStorage.
  useEffect(() => {
    const subscription = watch((value) => {
      if(studentData?.email)
      localStorage.setItem(`applicationTaskForm-${studentData?.email}`, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, studentData?.email]);
  
  // ------------------ End LOCAL STORAGE SETUP ------------------
  
  const tasks = cohort?.applicationFormDetail?.[0]?.task || [];
  
  const onSubmit = async (data: FormSchema) => {
    try {
      setLoading(true);
  
      const formData = new FormData();
      // courseDive => text1, text2
      formData.append("courseDive[text1]", data.courseDive.interest);
      formData.append("courseDive[text2]", data.courseDive.goals);
  
      // tasks => each configItem's answer
      data.tasks.forEach((task, tIndex) => {
        task.configItems.forEach((configItem, cIndex) => {
          switch (configItem.type) {
            case "long":
            case "short":
              if (typeof configItem.answer === "string") {
                formData.append(`tasks[${tIndex + 1}].text[${cIndex}]`, configItem.answer);
              }
              break;
            case "link":
              if (Array.isArray(configItem.answer)) {
                configItem.answer.forEach((link, idx) => {
                  formData.append(`tasks[${tIndex + 1}].links[${idx}]`, link);
                });
              }
              break;
            case "image":
            case "video":
            case "file":
              if (Array.isArray(configItem.answer)) {
                configItem.answer.forEach((f: File, idx: number) => {
                  if (configItem.type === "image") {
                    formData.append(`tasks[${tIndex + 1}].images[${idx}]`, f);
                  } else if (configItem.type === "video") {
                    formData.append(`tasks[${tIndex + 1}].videos[${idx}]`, f);
                  } else {
                    formData.append(`tasks[${tIndex + 1}].files[${idx}]`, f);
                  }
                });
              }
              break;
            default:
              break;
          }
        });
      });
  
      // Debug the FormData
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], "[File]", (pair[1] as File).name);
        } else {
          console.log(pair[0], pair[1]);
        }
      }
  
      // send to your API
      const res = await submitApplicationTask(formData);
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
          <div className='flex-1 bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center py-4 text-2xl rounded-full'>
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
            <div className='flex-1 bg-[#FA69E5]/[0.2] text-[#FA69E5] text-center py-4 text-2xl rounded-full'>
              Task 0{taskIndex + 1}
            </div>
            <div className='space-y-1'>
              <div className='mb-4'>
                <Label className="text-base font-normal text-[#FA69E5] pl-3">
                  {task.title}
                </Label>
                <div className="text-xl sm:text-2xl text-white mt-2 pl-3">
                  {task.description}
                </div>
              </div>
              { !cohort ? 
                <div className="text-center text-white">
                  No tasks available. Please ensure the cohort data is loaded correctly.
                </div> : 
                <div className='space-y-3'>
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
              }
            </div>
          </div>
        ))}
  
        <div className="flex flex-col sm:flex-row gap-2 justify-end sm:justify-between items-center mt-8">
          <Button variant="link" type='button' className='underline order-2 sm:order-1' onClick={() => form.reset() }>Clear Form</Button>
          <Button size="xl" className='w-full sm:w-fit space-y-1 order-1 sm:order-2' type="submit" disabled={loading}>
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
                  className={`w-full text-white text-base mt-2 h-[540px] sm:h-[240px]`}
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
                        className={`w-full text-white text-base mt-2 !pl-10 ${
                          fieldState?.error ? 'border-red-500' : ''
                        }`}
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
  const [files, setFiles] = useState<File[]>(field.value || []);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      let fileArray = Array.from(selectedFiles);
      const totalFiles = files.length + fileArray.length;
      if (configItem.maxFiles && totalFiles > configItem.maxFiles) {
        setError(`You can upload up to ${configItem.maxFiles} files.`);
        return;
      }
      const maxSize = (configItem.maxFileSize || 15) * 1024 * 1024;
      for (let file of fileArray) {
        if (file.size > maxSize) {
          setError(`Each file must be less than ${configItem.maxFileSize} MB.`);
          return;
        }
      }
      const newFiles = [...files, ...fileArray];
      setFiles(newFiles);
      field.onChange(newFiles);
      setError(null);
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    field.onChange(newFiles);
  };
  
  const showUploadButton = !configItem.maxFiles || files.length < configItem.maxFiles;

  const downloadFile = (file: string) => {
    // const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = file;
    a.download = file.split('/').pop() || "Task";
    a.click();
    URL.revokeObjectURL(file);
  };
  
  return (
    <FormItem>
      <FormControl>
        <div className="flex flex-col space-y-2 mt-2">
          {files.map((file, index) => {
            const isLink = typeof file === "string";
            return (
            <div key={index} className="flex items-center bg-[#007AFF] h-[52px] text-white p-1.5 rounded-xl w-full">
              <Button size="icon" type='button' className='bg-[#3698FB] rounded-xl mr-2'>
                <FileTextIcon className="w-5" />
              </Button>
              <span className="flex-1 text-xs sm:text-base truncate mr-4">
                {isLink ? (file as string).split('/').pop() : file.name}
              </span>
              <div className="flex items-center space-x-2">
                {isLink && (
                  <Button size="icon" type='button' variant="ghost" className="bg-[#3698FB] rounded-xl">
                    <a href={file} download target="_blank" rel="noopener noreferrer">
                      <Download className="w-5" />
                    </a>
                  </Button>
                )}
                <Button size="icon" type='button' className='bg-[#3698FB] rounded-xl' onClick={() => removeFile(index)}>
                  <XIcon className="w-5" />
                </Button>
              </div>
            </div>
          )})}
          {showUploadButton && (
            <div className="flex items-center justify-between w-full h-16 border-2 border-dashed rounded-xl p-1.5">
              <label className="w-full pl-3 text-muted-foreground">
                <input
                  type="file"
                  className="hidden"
                  multiple={configItem.maxFiles > 1}
                  accept={
                    configItem.type === 'image' ? 'image/*' :
                    configItem.type === 'video' ? 'video/*' :
                    configItem.type === 'file' && configItem.allowedTypes && !configItem.allowedTypes.includes('All') ?
                      configItem.allowedTypes.map((type: string) => `.${type.toLowerCase()}`).join(',') : '*/*'
                  }
                  onChange={handleFileChange}
                />
                <span className="cursor-pointer text-xs sm:text-base">
                  {`Upload ${configItem.type}${configItem.maxFiles > 1 ? 's' : ''} (Max size: ${configItem.maxFileSize || 15} MB)`}
                </span>
              </label>
              <Button type='button' className="flex gap-2 text-white px-6 py-6 rounded-xl" onClick={() => document.querySelector<HTMLInputElement>(`input[type="file"]`)?.click()}>
                <UploadIcon className='w-4 h-4'/> Upload {configItem.type}
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
