import React from 'react';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';
import { HandMetal } from 'lucide-react';

const Task01: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 mt-8">
        <Badge size="xl" className='flex-1 bg-[#FA69E5]/[0.2] text-[#FA69E5] text-center '>
        Task 01
      </Badge>

      <div className="space-y-6">
        <div className='space-y-1'>
          <div className='mb-6'>
            <Label htmlFor="strategy" className="text-base text-[#FA69E5] pl-3">
              Storytelling
            </Label>
            <div className="text-2xl text-white mt-2 pl-3">
              Share an embarrassing or an adventurous story from your life in 500 words. How did this experience influence your perspective?          </div>
          </div>

          <div>
            <Label htmlFor="criteria" className="text-base text-[#FA69E5] pl-3">
              Judgement Criteria
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 mb-8">
              {/* Strengths */}
              <div className="p-6 rounded-xl border border-[#2C2C2C] ">
                <div className="flex gap-2 items-center text-lg font-semibold ml-1 mb-2"><HandMetal className='rotate-90 w-4'/> Criteria</div>
                <ul className="space-y-2 pl-6 list-disc">
                    <li >Criteria Description Lorem ipsum dolor sit amet. Sit nihil consequatur qui soluta excepturi vel blanditiis libero At aspernatur</li>
                </ul>
              </div>
             </div>
          </div>
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
