import React from 'react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { StarIcon, FileTextIcon, ShieldAlertIcon } from 'lucide-react';

const LITMUSTestReview: React.FC = () => {
  return (
    <div className="max-w-[1152px] mx-auto space-y-6 p-6 bg-[#1B1B1C] border border-[#2C2C2C] text-white rounded-lg shadow-lg">
      {/* Achievement Card */}
      <div className="flex items-center p-6 bg-[#151515] border border-[#2C2C2C] rounded-xl mb-6">
        <div className="w-1/3 p-4">
          <Badge className="bg-[#00AB7B] text-[#00AB7B] rounded-lg p-4 text-center">
            <div className="text-xl font-semibold">CREATIVE CRUSADER</div>
            <div className="text-sm font-normal text-gray-300">Greater Marketer</div>
            <div className="text-xs font-light text-gray-500">Challenge Clearance: 76%</div>
          </Badge>
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-lg font-medium">You are eligible for a 15% waiver on your fee</p>
          <p className="text-sm text-gray-400">
            With a challenge clearance of 76%, you may avail a discount of INR 15,400/- on your fee.
            Access your payment portal to find out and keep track of your fee payments.
          </p>
          <Button className="mt-4 bg-green-600 text-white">Access Payment Portal</Button>
        </div>
      </div>

      {/* Document Download */}
      <div className="flex justify-between items-center p-4 bg-[#2C2C2C] rounded-lg">
        <div className="flex items-center space-x-2">
          <FileTextIcon className="text-white w-5 h-5" />
          <span>SBI_Challenge_01.pdf</span>
        </div>
        <Button className="bg-green-600 text-white">Access Payment Portal</Button>
      </div>

      {/* Scores Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-[#2C2C2C] rounded-lg p-4">
          <span className="text-lg font-semibold">Weighted Total Score</span>
          <span className="flex items-center text-yellow-500 text-lg font-semibold">
            <ShieldAlertIcon className="mr-2" />
            72/100
          </span>
        </div>

        {/* Performance Rating */}
        <div className="flex items-center justify-between bg-[#151515] p-4 rounded-lg">
          <span className="text-base font-semibold">Performance Rating</span>
          <div className="flex space-x-1">
            {Array(5).fill(0).map((_, i) => (
              <StarIcon key={i} className="text-yellow-500 w-5 h-5" />
            ))}
          </div>
        </div>

        {/* Criteria List */}
        <div className="grid grid-cols-2 gap-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4 bg-[#2C2C2C] rounded-lg space-y-2">
              <h4 className="text-sm font-medium">Criteria</h4>
              <p className="text-xs text-gray-400">
                Criteria Description Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed euismod, lectus vel consectetur volutpat, ex elit varius nisi, eu accumsan
                est mauris id ex.
              </p>
              <div className="flex justify-between items-center text-yellow-500 font-semibold">
                <span>24/30</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Feedback</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#2C2C2C] p-4 rounded-lg">
            <h4 className="text-sm font-medium">Strengths</h4>
            <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
            </ul>
          </div>
          <div className="bg-[#2C2C2C] p-4 rounded-lg">
            <h4 className="text-sm font-medium">Weaknesses</h4>
            <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
            </ul>
          </div>
          <div className="bg-[#2C2C2C] p-4 rounded-lg">
            <h4 className="text-sm font-medium">Opportunities</h4>
            <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
            </ul>
          </div>
          <div className="bg-[#2C2C2C] p-4 rounded-lg">
            <h4 className="text-sm font-medium">Threats</h4>
            <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
              <li>Influencer Cost Breakdown</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LITMUSTestReview;
