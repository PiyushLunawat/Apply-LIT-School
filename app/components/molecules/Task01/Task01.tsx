import React from 'react';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';

const Task01: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 mt-8">
        <Badge size="xl" className='flex-1 bg-[#FA69E5]/[0.2] text-[#FA69E5] text-center '>
        Task 01
      </Badge>

      <div className="space-y-6">
        <div className='space-y-1'>
          <Label htmlFor="story" className="text-base font-normal text-[#FA69E5] pl-3">
            Share an embarrassing or adventurous story from your life in 500 words. How did this experience influence your perspective?
          </Label>
          <Textarea
            id="story"
            className="w-full p-4 text-white text-base"
            placeholder="Write up to 500 words"
            rows={6}
          />
        </div>
      </div>
    </div>
  );
};

export default Task01;
