import React, { useContext, useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Upload, Clock, FileTextIcon, RefreshCw, X, Link2Icon, XIcon, UploadIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCohorts, submitLITMUSTest } from '~/utils/studentAPI'; // Import your API function
import { UserContext } from '~/context/UserContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';
import FeeWaiverCard from '~/components/molecules/FeeWaiverCard/FeeWaiverCard';


const getColor = (index: number) => {
  const colors = ['00CC92', 'FA69E5', 'FF791F', '3698FB'];
  return colors[index % 4]; // Pick color based on index
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
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<LitmusTestFormValues>({
    resolver: zodResolver(litmusTestSchema),
  });

  const { studentData } = useContext(UserContext);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [currCohorts, setCurrCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
        setCohorts(cohortsData.data);
      } catch (error) {
        console.error('Error fetching cohorts:', error);
      }
    }
    fetchCohorts();
  }, [setValue, studentData]);

  const getCohort = (cohortId: string) => {
        return cohorts.find((c) => c._id === cohortId);
      };

  const cohort = getCohort(studentData?.cohort);

  const tasks = cohort?.litmusTestDetail?.[0]?.litmusTasks || [];
  useEffect(() => {
    if (tasks.length > 0) {
      setValue(
        'tasks',
        tasks.map((task: any) => ({
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
  }, [tasks, setValue]);

  // console.log("evedfv",tasks,cohort?.litmusTestDetail?.[0]?.litmusTasks)

  const onSubmit = async (data: LitmusTestFormValues) => {
    try {

      setLoading(true);

      const formData = new FormData();
      
      // Append tasks
      data.tasks.forEach((task, taskIndex) => {
        // const taskKey = `${taskIndex + 1}`;

        task.configItems.forEach((configItem, index) => {
          const { type, answer } = configItem;

          switch (type) {
            case 'long':
            case 'short':
              if (answer) {
                formData.append(`tasks[${taskIndex+1}].text[${index}]`, answer);
              }
              break;

            case 'image':
            case 'video':
            case 'file':
              if (Array.isArray(answer)) {
                answer.forEach((file, idx) => {
                  formData.append(`tasks[${taskIndex+1}].${type}s[${idx}]`, file);
                });
              }
              break;

            case 'link':
              if (Array.isArray(answer)) {
                answer.forEach((link, idx) => {
                  formData.append(`tasks[${taskIndex+1}].links[${idx}]`, link);
                });
              }
              break;

            default:
              break;
          }
        });
      });

      // **Console log the FormData contents**
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: [File] ${pair[1].name}`);
        } else {
          console.log(`${pair[0]}:`, pair[1]);
        }
      }

      // Submit the form data using the provided API function
      const response = await submitLITMUSTest(formData);
      console.log('Submission successful:', response);
      // Handle success (e.g., show a success message or redirect)
    } catch (error) {
      console.error('Failed to submit Litmus Test:', error);
      // Handle error (e.g., show an error message)
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
  <Form {...form}>  
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col items-start p-[52px] bg-[#09090B] border border-[#2C2C2C] text-white shadow-md w-full mx-auto space-y-6">
        {/* Title and Guidelines */}
        {tasks.map((task: any, taskIndex: number) => (
          <>
          <div>
          <h2 className="text-3xl font-semibold mb-2">
            {task.title}
          </h2>
          <p className="text-xl mb-4">
            {task.description}
          </p>
        </div>

        {/* Document Display */}
        <div className="flex items-center justify-between w-full p-1.5 bg-[#2C2C2C] rounded-xl">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="text-white rounded-xl hover:bg-[#1a1a1d]"
            >
              <FileTextIcon className="w-5 h-5" />
            </Button>
            <span className="text-white">SBI_Challenge.doc</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="text-white rounded-xl hover:bg-[#1a1a1d]"
          >
            <Upload className="w-5 h-5" />
          </Button>
        </div>

        {/* Challenge Image with Text Overlay */}
        <div className="w-full h-full  ">
          <iframe
            src={task?.resources?.resourceLink}
            title={task?.resources?.resourceLink}
            className="rounded-xl h-[472px] w-full"
            allowFullScreen
         ></iframe>
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
                ))
              }
        
        </>))}

        <div className='w-full flex justify-between items-center '>
          {/* Submit Button */}
            <Button size="xl" className='' type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Make Challenge Submission'}
          </Button>

          {/* Countdown Timer */}
          <div className={`flex justify-center items-center gap-2 px-6 py-2 sm:py-3 border bg-[#09090B] rounded-full text-sm sm:text-2xl`}>
            <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-[#00A3FF]" />
            {cohort?.litmusTestDetail?.[0]?.litmusTestDuration || "--"} days
          </div>
        </div>

      </div>
    </form>
  </Form>
  <div className="flex flex-col items-start mt-16 space-y-4">
              <div className='flex justify-between px-3 w-full'>
                <div className="flex gap-4 items-center text-3xl font-semibold text-white">
                  <img src="/assets/images/scholarship-slabs.svg" alt="scholarship-slabs" className="h-9 "/>
                  Scholarship Slabs
                </div>
              </div>
              <div className="grid grid-cols sm:grid-cols-2 gap-x-4">
                {cohort?.litmusTestDetail?.[0]?.scholarshipSlabs.map((slab: any, index: number) => ( 
                  <FeeWaiverCard title={slab?.name} waiverAmount={slab?.percentage+"%"} clearanceRange={slab?.clearance+"%"} desc={slab?.description} color={getColor(index)} bg={getColor(index)+'1F'} />
                ))}
              </div>
            </div>
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
                  className={`w-full text-white text-base mt-2 ${configItem.type === 'short' ? 'h-24' : ''}`}
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
  const [files, setFiles] = useState<File[]>(field.value || []);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      let fileArray = Array.from(selectedFiles);

      // Combine existing files with new ones
      const totalFiles = files.length + fileArray.length;

      // Apply maxFiles limit
      if (configItem.maxFiles && totalFiles > configItem.maxFiles) {
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

      // Update files state
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

  // Determine if we should show the upload button
  const showUploadButton = !configItem.maxFiles || files.length < configItem.maxFiles;

  return (
    <FormItem className='w-full'>
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
                <span className="cursor-pointer">
                  {`Upload ${configItem.type}${configItem.maxFiles > 1 ? 's' : ''} (Max size: ${configItem.maxFileSize || 15} MB)`}
                </span>
              </label>
              <Button className="flex gap-2 text-white px-6 py-6 rounded-xl" onClick={() => document.querySelector<HTMLInputElement>(`input[type="file"]`)?.click()}>
                <UploadIcon className='w-4 h-4'/> Upload {configItem.type}
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
