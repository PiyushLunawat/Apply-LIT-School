import React, { useState } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Slider } from '~/components/ui/slider';
import { Badge } from '~/components/ui/badge';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';

const FeedbackForm: React.FC = () => {
  const [rating, setRating] = useState(72);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleItemSelect = (item: string) => {
    setSelectedMood((prevMood) => (prevMood === item ? null : item));
  };
  
  const handleMoodSelect = (mood: string) => {
    setSelectedMood((prevMood) => (prevMood === mood ? null : mood));
  };

  return (
    <div className="flex flex-col gap-6 mt-8 items-center max-w-[1000px] mx-auto text-white">
      <Badge size="xl" className='flex-1 bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center '>
        Feedback Form
      </Badge>

      <div className="space-y-6 w-full">
      <div className="flex-1 space-y-1">
        <Label className='text-[#00A3FF]'>How did you find out about The LIT School?</Label>
        <Textarea placeholder="Write up to 60 words" maxLength={60} />
        </div>

        <div className="flex-1 space-y-1">
        <Label className='text-[#00A3FF]'>How was your experience during the Counselling Call?</Label>
        <Textarea placeholder="Write up to 60 words" maxLength={60} />
        </div>

        <div className="flex-1 space-y-1">
        <Label>Drag the emoji to rate your counsellor!</Label>
        <div className="flex items-center space-x-4">
        <Slider defaultValue={[33]} max={100} step={1} />

          <span className="text-lg font-semibold">{rating}/100</span>
        </div>
        </div>

        <div className="flex-1 space-y-1">
        <Label className='text-[#00A3FF]'>
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
              size="lg"
              className={`rounded-xl p-4${
                selectedMood === item ? 'bg-purple-600 text-white' : ''
              }`}
              onClick={() => handleItemSelect(item)}
            >
              {item}
            </Button>
          ))}
        </div>
        </div>

        <div className="flex-1 space-y-1">
        <Label className='text-[#00A3FF]'>Do you have any feedback on the Counselling Process? (Not Compulsory)</Label>
        <Textarea placeholder="Write up to 60 words" maxLength={60} />
        </div>

        <div className="flex-1 space-y-1">
        <Label className='text-[#00A3FF]'>What’s your mood regarding the Counselling Process?</Label>
        <div className="flex justify-between space-x-4">
          {['Excited', 'Curious', 'Nervous'].map((mood) => (
            <Button
              key={mood}
              variant="outline"
              size="lg"
              className={`${
                selectedMood === mood ? 'bg-purple-600 text-white' : ''
              }`}
              onClick={() => handleMoodSelect(mood)}
            >
              {mood}
            </Button>
          ))}
        </div>
        </div>
      </div>

      <div className="flex justify-between w-full pt-4">
        <Button variant="link" className="text-white">
          Clear Form
        </Button>
        <Button size='xl' className="bg-[#00AB7B] text-white">View Results</Button>
      </div>
    </div>
  );
};

export default FeedbackForm;
