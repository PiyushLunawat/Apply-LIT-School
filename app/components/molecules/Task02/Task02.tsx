import React, { useState } from 'react';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { FileTextIcon, RefreshCcwIcon, XIcon } from 'lucide-react';

const Task02: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };
  
  return (
    <div className="flex flex-col gap-6 mt-8">
        <Badge size="xl" className='flex-1 bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center '>
        Task 02
      </Badge>

      <div className="space-y-6">
        <div>
          <Label htmlFor="strategy" className="text-base text-[#FFFF00]">
            Influencer Marketing Strategy
          </Label>
          <div className="text-2xl text-white mt-2">
            For Rapido (a bike taxi service), identify five influencers you believe would be a good fit for their social media campaigns. For each influencer, explain why you chose them and how they align with Rapido's brand perception and community goals.
          </div>
        </div>

        <div className="flex items-center justify-between w-full border border-dashed border-gray-600 rounded-lg p-4">
        <label className="text-gray-500 w-full">
          {!file && (
            <>
              Upload a pdf file of up to 20mb
              <input type="file" className="hidden" onChange={handleFileChange} />
            </>
          )}
        </label>
        <Button
          className="bg-[#7E22CE] text-white px-4 py-2 rounded-md border border-transparent hover:bg-[#6b21a8] transition duration-300"
        >
          Upload File
        </Button>
      </div>

      {file && (
        <div className="flex items-center bg-[#007AFF] text-white p-3 rounded-lg w-full">
          <FileTextIcon className="mr-2" />
          <span className="flex-1">{file.name}</span>
          <div className="flex items-center space-x-2">
            <button onClick={removeFile} className="p-2 bg-white rounded-full">
              <XIcon className="text-[#007AFF]" />
            </button>
          </div>
        </div>
      )}

        <div className="flex items-center justify-between w-full border border-dashed border-gray-600 rounded-xl p-1.5">
      <label className="text-gray-500">
        Upload a pdf file of up to 20mb
        <input type="file" className="hidden" />
      </label>
      <Button
        className="bg-[#7E22CE] text-white px-4 py-2 rounded-xl border border-transparent hover:bg-[#6b21a8] transition duration-300"
      >
        Upload File
      </Button>
    </div>

      </div>
    </div>
  );
};

export default Task02;
