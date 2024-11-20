import React, { useContext, useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { UserContext } from '~/context/UserContext';
import { getCohorts } from '~/utils/api';
import { Button } from '~/components/ui/button';
import { FileTextIcon, RefreshCw, XIcon } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import { submitApplicationTask } from '~/utils/studentAPI';

const formSchema = z.object({
  courseDive: z.object({
    interest: z.string().max(120, 'Maximum 120 characters').nonempty('This field is required'),
    goals: z.string().max(240, 'Maximum 240 characters').nonempty('This field is required'),
  }),
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

type FormSchema = z.infer<typeof formSchema>;

const ApplicationTaskForm: React.FC = () => {
  const { studentData } = useContext(UserContext);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const { control, handleSubmit, setValue, watch } = form;

  useEffect(() => {
    async function fetchCohorts() {
      try {
        const cohortsData = await getCohorts();
        setCohorts(cohortsData.data);
      } catch (error) {
        console.error('Error fetching cohorts:', error);
      }
    }
    fetchCohorts();
  }, []);

  const getCohort = (cohortId: string) => {
    return cohorts.find((c) => c._id === cohortId);
  };

  const cohort = getCohort(studentData?.cohort);

  const tasks = cohort?.applicationFormDetail?.[0]?.task || [];

  // Initialize tasks in form state
  useEffect(() => {
    setValue(
      'tasks',
      tasks.map((task: any) => ({
        configItems: task.config.map((configItem: any) => ({
          type: configItem.type,
          answer: configItem.type === 'link' ? [''] : '',
        })),
      }))
    );
  }, [tasks, setValue]);

  const onSubmit = async (data: FormSchema) => {
    try {
      setLoading(true);
  
      // Map form data to the expected structure
      const mappedData = {
        courseDive: {
          text1: data.courseDive.interest,
          text2: data.courseDive.goals,
        },
        tasks: data.tasks.map((task) => {
          const taskData: {
            text?: string;
            images?: File[];
            videos?: string[];
            files?: (File | string)[];
            links?: string[];
          } = {};
  
          task.configItems.forEach((configItem) => {
            const { type, answer } = configItem;
            switch (type) {
              case 'long':
              case 'short':
                taskData.text = answer;
                break;
              case 'image':
                taskData.images = answer;
                break;
              case 'video':
                taskData.videos = answer;
                break;
              case 'file':
                taskData.files = answer;
                break;
              case 'link':
                taskData.links = Array.isArray(answer) ? answer : [answer];
                break;
              default:
                break;
            }
          });
  
          return taskData;
        }),
      };
  
      await submitApplicationTask(mappedData);
      // Handle success (e.g., show a success message or redirect)
    } catch (error) {
      console.error('Failed to submit application task:', error);
    } finally {
      setLoading(false);
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
            {/* Interest Field */}
            <FormField
              control={control}
              name="courseDive.interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal text-[#00A0E9] pl-3">
                    Why are you interested in joining The LIT School?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      maxLength={120}
                      className="w-full text-white text-base"
                      placeholder="Write up to 120 characters"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Goals Field */}
            <FormField
              control={control}
              name="courseDive.goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal text-[#00A0E9] pl-3">
                    What are your career goals or aspirations?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      maxLength={240}
                      className="w-full text-white text-base"
                      placeholder="Write up to 240 characters"
                      rows={6}
                      {...field}
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
                <Label className="text-base text-[#FA69E5] pl-3">
                  {task.title}
                </Label>
                <div className="text-2xl text-white mt-2 pl-3">
                  {task.description}
                </div>
              </div>
              { !cohort ? 
                <div className="text-center text-white">
                  No tasks available. Please ensure the cohort data is loaded correctly.
                </div> : 
                task.config.map((configItem: any, configIndex: number) => (
                  <TaskConfigItem
                    key={configIndex}
                    control={control}
                    taskIndex={taskIndex}
                    configIndex={configIndex}
                    configItem={configItem}
                  />
                ))
              }
            </div>
          </div>
        ))}

        <div className="flex justify-end items-center mt-8">
           <Button size="xl" className='space-y-1' type="submit" disabled={loading}>
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
                  maxLength={configItem.characterLimit}
                  className={`w-full text-white text-base mt-2 ${configItem.type === 'short' ? 'h-24' : ''}`}
                  placeholder={`Write up to ${configItem.characterLimit} characters`}
                  rows={configItem.type === 'long' ? 6 : 3}
                  {...field}
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
            <FormItem className='flex-1 space-y-1 relative'>
              <FormControl>
                <Input
                  className="w-full text-white text-base mt-2"
                  placeholder="Enter URL here"
                  {...field}
                />
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
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      let fileArray = Array.from(selectedFiles);

      // Apply maxFiles limit
      if (configItem.maxFiles && fileArray.length > configItem.maxFiles) {
        setError(`You can upload up to ${configItem.maxFiles} files.`);
        return;
      }

      // Apply maxFileSize limit
      const maxSize = (configItem.maxFileSize || 15) * 1024 * 1024; // Convert MB to bytes
      for (let file of fileArray) {
        if (file.size > maxSize) {
          setError(`Each file must be less than ${configItem.maxFileSize} MB.`);
          return;
        }
      }

      // Apply allowedTypes
      let acceptTypes = '';
      switch (configItem.type) {
        case 'image':
          acceptTypes = 'image/*';
          break;
        case 'video':
          acceptTypes = 'video/*';
          break;
        case 'file':
          if (configItem.allowedTypes && !configItem.allowedTypes.includes('All')) {
            acceptTypes = configItem.allowedTypes.map((type: string) => `.${type.toLowerCase()}`).join(',');
          } else {
            acceptTypes = '';
          }
          break;
        default:
          acceptTypes = '';
      }

      setFiles(fileArray);
      field.onChange(fileArray);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    field.onChange(newFiles);
  };

  return (
    <FormItem>
      <FormControl>
        <div className="flex flex-col space-y-2 mt-2">
          {/* Display selected files */}
          {files.map((file, index) => (
            <div key={index} className="flex items-center bg-[#007AFF] h-[52px] text-white p-1.5 rounded-xl w-full">
              <Button size="icon" className='bg-[#3698FB] rounded-xl mr-2'>
                <FileTextIcon className="w-5" />
              </Button>
              <span className="flex-1">{file.name}</span>
              <div className="flex items-center space-x-2">
                <Button size="icon" className='bg-[#3698FB] rounded-xl' onClick={() => removeFile(index)}>
                  <XIcon className="w-5" />
                </Button>
              </div>
            </div>
          ))}

          {/* File upload input */}
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
              <span className="cursor-pointer">
                {`Upload ${configItem.type}${configItem.maxFiles > 1 ? 's' : ''} (Max size: ${configItem.maxFileSize || 15} MB)`}
              </span>
            </label>
            <Button className="text-white px-6 py-[18px] rounded-xl" onClick={() => document.querySelector<HTMLInputElement>(`input[type="file"]`)?.click()}>
              Upload {configItem.type}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default ApplicationTaskForm;
