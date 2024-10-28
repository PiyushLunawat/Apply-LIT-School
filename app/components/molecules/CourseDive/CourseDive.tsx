import React from 'react';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';

const CourseDive: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 mt-8">
        <Badge size="xl" className='flex-1 bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center '>
        Course Dive
      </Badge>

      <div className="space-y-6">
        <div className='space-y-1'>
          <Label htmlFor="interest" className="text-base font-normal text-[#00A0E9] pl-3">
            Why are you interested in joining The LIT School?
          </Label>
          <Textarea
            id="interest"
            className="w-full text-white text-base"
            placeholder="Write up to 120 words"
            rows={6}
          />
        </div>

        <div className='space-y-1'>
          <Label htmlFor="goals" className="text-base font-normal text-[#00A0E9] pl-3">
            What are your career goals or aspirations?
          </Label>
          <Textarea
            id="goals"
            className="w-full text-white text-base"
            placeholder="Write up to 240 words"
            rows={6}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDive;
