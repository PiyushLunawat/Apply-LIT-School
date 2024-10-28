import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Upload, Clock, FileText, RefreshCw, X, FileTextIcon } from 'lucide-react';

const LITMUSTest: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-start px-6 py-12 bg-[#1B1B1C] border border-[#2C2C2C] text-white rounded-3xl shadow-md w-[1152px] mx-auto space-y-6">
      {/* Title and Guidelines */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Take the LITMUS test to avail scholarship opportunities.
        </h2>
        <p className="text-sm mb-4">
          Here are a few guidelines to adhere to while you work on your LITMUS Challenge:
        </p>
        <ul className="text-sm list-disc ml-5 space-y-1 px-6">
          <li>Utilize a LIT Learning Methodology</li>
          <li>Propose unique and innovative ideas</li>
          <li>Ensure your submission aligns with the norms of accepting the LITMUS challenge</li>
          <li>Adhere to the given word limit for each submission file and task</li>
        </ul>
      </div>

      {/* Document Display */}
      <div className="flex items-center justify-between w-full p-1.5 bg-[#2C2C2C] rounded-xl">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="text-white rounded-xl hover:bg-[#1a1a1d]">
            <FileText className="w-5 h-5" />
          </Button>
          <span className="text-white">SBI_Challenge.doc</span>
        </div>
        <Button variant="outline" size="icon" className="text-white rounded-xl hover:bg-[#1a1a1d]">
          <Upload className="w-5 h-5" />
        </Button>
      </div>

      {/* Challenge Image with Text Overlay */}
      <div className="relative w-full h-48 bg-gray-700 rounded-lg overflow-hidden">
        <img
          src="/assets/images/challenge-placeholder.svg"
          alt="Challenge Placeholder"
          className="object-cover w-full h-full opacity-40"
        />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="text-white space-y-2">
            <h3 className="text-xl font-semibold">
              Pitch Your <span className="text-yellow-400">Business</span> Idea!
            </h3>
            <p className="text-sm">
              We would like you to pitch an innovative product/service business idea to be considered for our in-house LITMUS Scholarship.
            </p>
            <p className="text-xs text-gray-300">
              Showcase your brilliance & business acumen, keeping the feasibility and potential impact of your idea in mind.
            </p>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className={`flex justify-center items-center gap-2 px-6 py-2 sm:py-4 border bg-[#FFFFFF33] rounded-full text-sm sm:text-2xl`}>
        <Clock className='w-4 h-4 sm:w-6 sm:h-6 text-[#00A3FF]' />
        7 days
      </div>

      {/* File Upload Section */}
      <div className="w-full">
        <div className="flex items-center justify-between w-full h-16 border-2 border-dashed rounded-xl p-1.5">
          <label className="w-full pl-3 text-muted-foreground cursor-pointer">
            Upload pdf files of up to 20mb each
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              multiple
              accept="application/pdf"
            />
          </label>
          <Button className="text-white px-6 py-[18px] rounded-xl">
            Upload Files
          </Button>
        </div>

        {/* Display uploaded files */}
        {files.length > 0 && (
          <div className="flex mt-4 gap-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center bg-[#007AFF] h-[52px] text-white p-1.5 rounded-xl w-fit">
                <Button size="icon" className='bg-[#3698FB] rounded-xl mr-2'>
                  <FileTextIcon className="w-5" />
                </Button>
                <span className="flex-1 mr-2 truncate">{file.name}</span>
                <div className="flex items-center space-x-2">
                  <Button size="icon" className='bg-[#3698FB] rounded-xl'>
                    <RefreshCw className="w-4" />
                  </Button>
                  <Button size="icon" className='bg-[#3698FB] rounded-xl' onClick={() => removeFile(index)}>
                    <X className="w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button size="xl" className="mt-8" disabled={files.length === 0}>
        Make Challenge Submission
      </Button>
    </div>
  );
};

export default LITMUSTest;
