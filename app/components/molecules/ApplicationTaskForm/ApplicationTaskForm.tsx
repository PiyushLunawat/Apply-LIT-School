import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { UserContext } from '~/context/UserContext';
import { Button } from '~/components/ui/button';
import { FileTextIcon, Link2Icon, UploadIcon, XIcon } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import { getCohorts, getCurrentStudent, submitApplicationTask } from '~/utils/studentAPI';
import { useNavigate } from '@remix-run/react';

// Define the form schema using Zod
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

  const { control, handleSubmit, setValue, reset } = form;

  // Fetch cohorts and student data
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch cohorts
        const cohortsData = await getCohorts();
        
        // Fetch student data
        const studentResp = await getCurrentStudent(studentData._id);
        setCohort(studentResp.data?.cohort);
        const sData =
          studentResp.data?.applicationDetails?.applicationTasks?.[0]
            ?.applicationTaskDetail?.applicationTasks?.[0];
        setFetchedStudentData(sData);

        // Identify the student's cohort
        const studentCohortId = studentData?.cohort;
        const foundCohort = cohortsData.data.find(
          (c: any) => c._id === studentCohortId
        );

        if (!foundCohort) {
          console.error('Cohort not found for the student.');
          return;
        }

        // Extract cohort tasks
        const cohortTasks = foundCohort?.applicationFormDetail?.[0]?.task || [];

        // Merge cohort tasks with student answers
        const finalTasks = cohortTasks.map((ct: any, tIndex: number) => {
          const existing = sData?.tasks?.[tIndex] || {};

          return {
            configItems: ct.config.map((configItem: any, cIndex: number) => {
              let answer: any = '';

              switch (configItem.type) {
                case 'long':
                case 'short':
                  answer = existing?.text ? existing?.text[cIndex] || '' : '';
                  break;

                case 'link':
                  answer = existing?.links || Array(configItem.maxFiles || 1).fill('');
                  break;

                case 'image':
                  answer = existing?.images || [];
                  break;

                case 'video':
                  answer = existing?.videos || [];
                  break;

                case 'file':
                  answer = existing?.files || [];
                  break;

                default:
                  answer = '';
              }

              return {
                type: configItem.type,
                maxFiles: configItem.maxFiles,
                maxFileSize: configItem.maxFileSize,
                answer,
              };
            }),
          };
        });

        // Prepare the courseDive data
        const courseDiveData = {
          interest: sData?.courseDive?.text1 || '',
          goals: sData?.courseDive?.text2 || '',
        };

        // Initialize the form with fetched data
        reset({
          courseDive: courseDiveData,
          tasks: finalTasks,
        });
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }

    fetchData();
  }, [studentData, reset]);


  const tasks = cohort?.applicationFormDetail?.[0]?.task || [];

  // Handle form submission
  const onSubmit = async (data: FormSchema) => {
    try {
      setLoading(true);

      const formData = new FormData();
      // Append courseDive data
      formData.append('courseDive[text1]', data.courseDive.interest);
      formData.append('courseDive[text2]', data.courseDive.goals);

      // Append tasks data
      data.tasks.forEach((task, tIndex) => {
        task.configItems.forEach((configItem, cIndex) => {
          switch (configItem.type) {
            case 'long':
            case 'short':
              if (typeof configItem.answer === 'string') {
                formData.append(`tasks[${tIndex + 1}].text[${cIndex}]`, configItem.answer);
              }
              break;

            case 'link':
              if (Array.isArray(configItem.answer)) {
                configItem.answer.forEach((link, idx) => {
                  formData.append(`tasks[${tIndex + 1}].links[${idx}]`, link);
                });
              }
              break;

            case 'image':
            case 'video':
            case 'file':
              if (Array.isArray(configItem.answer)) {
                configItem.answer.forEach((f: File, idx: number) => {
                  if (configItem.type === 'image') {
                    formData.append(`tasks[${tIndex + 1}].images[${idx}]`, f);
                  } else if (configItem.type === 'video') {
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

      // Debugging: Log FormData entries
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], '[File]', (pair[1] as File).name);
        } else {
          console.log(pair[0], pair[1]);
        }
      }

      // Submit the form data
      const res = await submitApplicationTask(formData);
      console.log('Submission success => ', res);

      // Redirect upon successful submission
      navigate('/application/status');
    } catch (err) {
      console.error('Failed to submit application task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Word limit handler for text areas
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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Course Dive Section */}
        <div className="flex flex-col gap-6 mt-8">
          <div className="flex-1 bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center py-4 text-2xl rounded-full">
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
                      className="w-full text-white text-base"
                      placeholder="Write up to 120 characters"
                      rows={6}
                      onChange={(e) => wordLimitHandler(e, field, 120)}
                      value={field.value}
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
                      className="w-full text-white text-base"
                      placeholder="Write up to 240 characters"
                      rows={6}
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
                <Label className="text-base text-[#FA69E5] pl-3">{task.title}</Label>
                <div className="text-2xl text-white mt-2 pl-3">{task.description}</div>
              </div>
              {!cohort ? (
                <div className="text-center text-white">
                  No tasks available. Please ensure the cohort data is loaded correctly.
                </div>
              ) : (
                task.config.map((configItem: any, configIndex: number) => (
                  <TaskConfigItem
                    key={configIndex}
                    control={control}
                    taskIndex={taskIndex}
                    configIndex={configIndex}
                    configItem={configItem}
                  />
                ))
              )}
            </div>
          </div>
        ))}

        {/* Form Actions */}
        <div className="flex justify-between items-center mt-8">
          <Button variant="link" type="button" onClick={() => form.reset()}>
            Clear Form
          </Button>
          <Button size="xl" className="space-y-1" type="submit" disabled={loading}>
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

const TaskConfigItem: React.FC<TaskConfigItemProps> = ({
  control,
  taskIndex,
  configIndex,
  configItem,
}) => {
  const fieldName = `tasks.${taskIndex}.configItems.${configIndex}.answer`;

  // Word limit handler for text areas
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
                  className={`w-full text-white text-base mt-2 ${
                    configItem.type === 'short' ? 'h-24' : ''
                  }`}
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
          render={({ field }) => <FileUploadField field={field} configItem={configItem} />}
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
                  {Array.from({ length: configItem.maxFiles || 1 }).map((_, index) => (
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
    <FormItem>
      <FormControl>
        <div className="flex flex-col space-y-2 mt-2">
          {/* Display selected files */}
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center bg-[#007AFF] h-[52px] text-white p-1.5 rounded-xl w-full"
            >
              <Button size="icon" className="bg-[#3698FB] rounded-xl mr-2">
                <FileTextIcon className="w-5" />
              </Button>
              <span className="flex-1">{file.name}</span>
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  className="bg-[#3698FB] rounded-xl"
                  onClick={() => removeFile(index)}
                >
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
                    configItem.type === 'image'
                      ? 'image/*'
                      : configItem.type === 'video'
                      ? 'video/*'
                      : configItem.type === 'file' && configItem.allowedTypes && !configItem.allowedTypes.includes('All')
                      ? configItem.allowedTypes.map((type: string) => `.${type.toLowerCase()}`).join(',')
                      : '*/*'
                  }
                  onChange={handleFileChange}
                />
                <span className="cursor-pointer">
                  {`Upload ${configItem.type}${configItem.maxFiles > 1 ? 's' : ''} (Max size: ${
                    configItem.maxFileSize || 15
                  } MB)`}
                </span>
              </label>
              <Button
                className="flex gap-2 text-white px-6 py-6 rounded-xl"
                onClick={() =>
                  document.querySelector<HTMLInputElement>('input[type="file"]')?.click()
                }
              >
                <UploadIcon className="w-4 h-4" /> Upload {configItem.type}
              </Button>
            </div>
          )}
          {/* Display the number of uploaded files out of maxFiles */}
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
