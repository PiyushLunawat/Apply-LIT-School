import { XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { Slider } from "~/components/ui/slider";
import { submitLitmusFeedback } from "~/api/studentAPI";

interface LitmusFeedbackFormProps {
  student: any;
  setClose: () => void;
}

export function LitmusFeedbackForm({ student, setClose }: LitmusFeedbackFormProps) {
  let latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const [loading, setLoading] = useState(false);

  const [sources, setSources] = useState<string>("");
  const [counsellingExperience, setCounsellingExperience] = useState("");
  const [rating, setRating] = useState(0);
  const [decisionFactors, setDecisionFactors] = useState<string[]>([]);
  const [customTagDesc, setCustomTagDesc] = useState("");
  const [feelings, setFeelings] = useState<string>("");
  const [feedback1, setFeedback1] = useState("");

  const handleSourceToggle = (option: string) => {
    if (sources.includes(option)) {
      setSources("");
    } else {
      setSources(option);
    }
  };
  
  const handleDecisionToggle = (value: string) => {
    setDecisionFactors((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleFeelingToggle = (value: string) => {
    if (sources.includes(value)) {
      setFeelings("");
    } else {
      setFeelings(value);
    }
  };

  const handleSubmit = async () => {
    const payload = [
      { question: "How did you find out about The LIT School?", answer: sources },
      { question: "How was your experience during the Counselling Call?", answer: counsellingExperience },
      { question: "Rate your ounsellor", answer: `${rating}/100` },
      { question: "What was the one thing that played a key role in your decision-making to join The LIT School?", answer: decisionFactors },
      { question: "decision-making description", answer: customTagDesc },
      { question: "How do you feel after the Counselling Process? ", answer: feelings },
      { question: "Do you have any feedback on the Counselling Process?", answer: feedback1 },
    ];
    console.log(payload);
    try {
      setLoading(true);
      const res = await submitLitmusFeedback({
        cohortId: latestCohort?.cohortId?._id,
        feedbackData: payload,
      });
      console.log("feeb", res);
      
      setClose(); 
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // optionally show a toast or error message to user
    } finally {
      setLoading(false);
    }
  };

  function getIcon(rating: number, total: number): string {
    const percentage = (rating / total) * 100;
  
    if (percentage <= 20) return "1-icon.png";
    if (percentage <= 40) return "2-icon.png";
    if (percentage <= 60) return "3-icon.png";
    if (percentage <= 80) return "4-icon.png";
    return "5-icon.png";
  }  

  return (
    <div className="flex flex-col items-start text-white shadow-md w-full mx-auto space-y-8">
      <div className="text-2xl sm:text-4xl font-normal space-y-2">
        <h2 className="flex items-center gap-2">👋 Hey {student?.firstName},</h2>
        <p>Let us know about your onboarding experience</p>
      </div>

      {/* Sources */}
      <div className="space-y-3 w-full">
        <p className="text-base text-[#00A3FF] pl-3">How did you find out about The LIT School?</p>
        <div className="flex flex-wrap gap-2">
          {["Instagram", "Word of Mouth", "LinkedIn", "Facebook", "An Event"].map((option) => (
            <div key={option} className="relative cursor-pointer" onClick={() => handleSourceToggle(option)}>
              <input
                type="checkbox"
                id={option}
                checked={sources.includes(option)}
                readOnly
                className="peer hidden"
              />
              <div className="p-4 text-base font-medium rounded-xl border peer-checked:border-white">
                {option}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Counselling Experience */}
      <div className="space-y-3 w-full">
        <p className="text-base text-[#00A3FF] pl-3">How was your experience during the Counselling Call?</p>
        <Textarea
          placeholder="Write up to 60 words"
          className="w-full p-4 h-[120px] text-base focus:outline-none"
          value={counsellingExperience}
          onChange={(e) => setCounsellingExperience(e.target.value)}
        />
      </div>

      {/* Slider */}
      <div className="space-y-2 w-full">
        <p className="text-base pl-3">Drag the emoji to rate your counsellor!</p>
        <div className="bg-[#1F1F1F] rounded-xl p-6 flex items-center gap-2">
          <Slider value={[rating]} min={0} max={100} step={1} onValueChange={([val]) => setRating(val)} />
          <img src={`/assets/icons/${getIcon(rating, 100)}`} className="w-6"/>
          <span className="text-2xl font-semibold">{rating}/100</span>
        </div>
      </div>

      {/* Decision Factors */}
      <div className="space-y-2 w-full">
        <p className="text-base text-[#00A3FF] pl-3">What was the one thing that played a key role in your decision-making to join The LIT School?</p>
        <div className="flex flex-wrap gap-2">
            {["Experiential Learning", "Employment", "Curriculum", "Environment", "Challenges"].map((option) => (
                <div key={option} className="relative cursor-pointer" onClick={() => handleDecisionToggle(option)}>
                <input
                    type="checkbox"
                    id={option}
                    checked={decisionFactors.includes(option)}
                    readOnly
                    className="peer hidden"
                />
                <div className="text-base font-medium p-4 rounded-xl border peer-checked:border-white">
                    {option}
                </div>
                </div>
            ))}
        </div>
        {/* Custom Tag */}
        <div className="space-y-2 w-full">
            <div className="flex flex-wrap gap-2">
            {decisionFactors?.map((tag, index) => (
              <div key={index} className="flex items-center gap-2 bg-[#1388FF] rounded-xl px-4 py-3 text-sm">
                {tag}
                <XIcon
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => setDecisionFactors(prev => prev.filter(f => f !== tag))}
                  />
              </div>
            ))}
            </div>
            <Textarea
            placeholder="Write up to 60 words"
            className="w-full p-4 h-[120px] text-base focus:outline-none"
            value={customTagDesc}
            onChange={(e) => setCustomTagDesc(e.target.value)}
            />
        </div>
      </div>

      {/* Feelings */}
      <div className="space-y-2 w-full">
        <p className="text-base text-[#00A3FF] pl-3">
          How do you feel after the Counselling Process? <span className="text-xs text-muted-foreground">(Not Compulsory)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {["Excited", "Curious", "Nervous"].map((option) => (
            <div
              key={option}
              className={`bg-[#27272A99] p-4 rounded-xl flex gap-2 flex-1 items-center cursor-pointer`}
              onClick={() => handleFeelingToggle(option)}
            >
              <Checkbox id={option} checked={feelings.includes(option)} />
              <div className="text-base font-medium leading-none grid gap-1.5 leading-none">
                  {option}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback 1 */}
      <div className="space-y-2 w-full">
        <p className="text-base text-[#00A3FF] pl-3">
          Do you have any feedback on the Counselling Process? <span className="text-xs text-muted-foreground">(Not Compulsory)</span>
        </p>
        <Textarea
          placeholder="Write up to 60 words"
          className="w-full p-4 h-[120px] text-base focus:outline-none"
          value={feedback1}
          onChange={(e) => setFeedback1(e.target.value)}
        />
      </div>

      {/* Submit */}
      <div className="w-full">
        <Button size="xl" onClick={handleSubmit} disabled={loading}>
          Submit Feedback
        </Button>
      </div>
    </div>
  );
}
