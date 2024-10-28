import React, { useState } from 'react';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { FileTextIcon, RefreshCw, XIcon } from 'lucide-react';

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
          <Label htmlFor="strategy" className="text-base text-[#FFFF00] pl-3">
            Influencer Marketing Strategy
          </Label>
          <div className="text-2xl text-white mt-2 pl-3">
            For Rapido (a bike taxi service), identify five influencers you believe would be a good fit for their social media campaigns. For each influencer, explain why you chose them and how they align with Rapido's brand perception and community goals.
          </div>
        </div>

      

      {file ? (
        <div className="flex items-center bg-[#007AFF] h-[52px] text-white p-1.5 rounded-xl w-full">
          <Button size="icon" className='bg-[#3698FB] rounded-xl mr-2'><FileTextIcon className="w-5" /></Button>
          <span className="flex-1">{file.name}</span>
          <div className="flex items-center space-x-2">

          <Button size="icon" className='bg-[#3698FB] rounded-xl'><RefreshCw className="w-4" /></Button>
          <Button size="icon" className='bg-[#3698FB] rounded-xl' onClick={removeFile}><XIcon className="w-5" /></Button>
          </div>
        </div>
      ) : (
      <div className="flex items-center justify-between w-full h-16 border-2 border-dashed rounded-xl p-1.5">
        <label className="w-full pl-3 text-muted-foreground">
          {!file && (
            <>
              Upload a pdf file of up to 20mb
              <input type="file" className="hidden" onChange={handleFileChange} />
            </>
          )}
        </label>
        <Button className="text-white px-6 py-[18px] rounded-xl">
          Upload File
        </Button>
      </div>
      )}

      </div>
    </div>
  );
};

export default Task02;
