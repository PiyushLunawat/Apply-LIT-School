import React, { useState } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Slider } from '~/components/ui/slider';
import { Badge } from '~/components/ui/badge';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Checkbox } from '~/components/ui/checkbox';

const FeedbackForm: React.FC = () => {
  const [rating, setRating] = useState(72);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleItemSelect = (item: string) => {
    setSelectedMood((prevMood) => (prevMood === item ? null : item));
  };

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood); // Only one mood can be selected at a time
  };

  return (
    <div className="flex flex-col gap-6 mt-8 items-center max-w-[1000px] mx-auto text-white">
      <Badge size="xl" className='flex-1 w-full px-auto bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center '>
        Feedback Form
      </Badge>

      <div className="space-y-8 w-full">
        <div className="flex-1 space-y-6">
          <Label className='text-base font-normal pl-3 text-[#00A3FF]'>How did you find out about The LIT School?</Label>
          <Textarea className="w-full h-[120px] p-4 text-white text-base" placeholder="Write up to 60 words" />
        </div>

        <div className="flex-1 space-y-6">
          <Label className='text-base font-normal pl-3 text-[#00A3FF]'>How was your experience during the Counselling Call?</Label>
          <Textarea className="w-full h-[120px] p-4 text-white text-base" placeholder="Write up to 60 words" />
        </div>

        <div className="flex-1 space-y-6">
          <Label className="text-base font-normal pl-3">Drag the emoji to rate your counsellor!</Label>
          <div className="bg-[#1F1F1F] p-6 flex items-center rounded-xl space-x-4">
            <Slider
              defaultValue={[rating]}
              max={100}
              step={1}
              onValueChange={(value) => setRating(value[0])} // Update rating on change
            />
            <span className="text-lg font-semibold">{rating}/100</span>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <Label className='text-base font-normal pl-3 text-[#00A3FF]'>
            What was the one thing that played a key role in your decision-making
            to join The LIT School?
          </Label>
          <div className="flex flex-wrap gap-2">
            {[
              'Content Creation',
              'Experiential Learning',
              'Unemployment',
              'Curriculum',
              'Environment',
              'Challenges',
            ].map((item) => (
              <Button
                key={item}
                variant="outline"
                size="xl"
                className={`rounded-xl p-4`}
                onClick={() => handleItemSelect(item)}
              >
                {item}
              </Button>
            ))}
          </div>
          <Textarea className="w-full h-[120px] p-4 text-white text-base" placeholder="Write up to 60 words" />
        </div>

        <div className="flex-1 space-y-6">
          <Label className='text-base font-normal pl-3 text-[#00A3FF]'>Do you have any feedback on the Counselling Process? (Not Compulsory)</Label>
          <Textarea className="w-full h-[120px] p-4 text-white text-base" placeholder="Write up to 60 words" />
        </div>

        <div className="flex-1 space-y-6">
          <Label className='text-base font-normal pl-3 text-[#00A3FF]'>What’s your mood regarding the Counselling Process?</Label>
          <div className="flex justify-between gap-2">
            {['Excited', 'Curious', 'Nervous'].map((mood) => (
              <div
                key={mood}
                className={`flex flex-1 items-center space-x-2 p-6 rounded-2xl cursor-pointer bg-[#27272A99]`}
                onClick={() => handleMoodSelect(mood)}
              >
                <Checkbox checked={selectedMood === mood} onClick={() => handleMoodSelect(mood)} />
                <Label className="text-2xl font-semibold">{mood}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between w-full pt-4">
        <Button variant="link" className="text-white">Clear Form</Button>
        <Button size="xl" className="bg-[#00AB7B] text-white">View Results</Button>
      </div>
    </div>
  );
};

export default FeedbackForm;
