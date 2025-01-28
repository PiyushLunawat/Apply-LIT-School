import { ArrowDown, ArrowDown01, ArrowUp } from 'lucide-react';
import React, { useState } from 'react';

interface QuestionProps {
  question: string;
  answer: string;
}

const ApplicationQNA: React.FC = () => {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const questions: QuestionProps[] = [
    {
      question: 'How will I get the link to attend the program?',
      answer: 'You will receive an email with the program details and a link to join the session once you register.',
    },
    {
      question: 'What if I have questions about registration, attendance, etc?',
      answer: 'Feel free to contact our support team for assistance with any questions regarding registration, attendance, or other queries.',
    },
    {
      question: 'Why is this program free?',
      answer: 'This program is offered for free as part of our initiative to empower learners and provide access to valuable resources.',
    },
    {
      question: 'Will I get the recording of the program?',
      answer: 'Yes, the recording will be made available after the session for all participants.',
    },
    {
      question: 'If I miss attending the class can I attend the repeat?',
      answer: 'You can contact the organizers to see if there is a repeat session, or you can review the session recording later.',
    },
  ];

  return (
    <div className="w-full text-white space-y-16 sm:space-y-24">
        <div className=''>
            <div className="text-center text-2xl sm:text-3xl font-semibold my-8 sm:my-14">Your Application Process</div>

            <img src="/assets/images/application-process-banner.svg" alt="BANNER" className="w-screen hidden sm:block" />
            <div className='sm:hidden'>
                <img src="/assets/images/application-step-01.svg" alt="BANNER" className="w-full" />
                <img src="/assets/images/application-step-02.svg" alt="BANNER" className="w-full" />
                <img src="/assets/images/application-step-03.svg" alt="BANNER" className="w-full" />
            </div>
        </div>

      <div className=''>
        <div className="text-center text-2xl sm:text-3xl font-semibold my-8 sm:my-14">Have Questions?</div>
        <div className="space-y-4 max-w-[840px] mx-auto px-4">
          {questions.map((q, index) => (
            <div
              key={index} onClick={() => toggleQuestion(index)}
              className={`text-white text-base font-semibold transition-all duration-300 space-y-1.5 cursor-pointer ${activeQuestion === index ? '' : ''}`}>
              <div className="min-h-[100px] flex justify-between items-center py-4 sm:py-8 px-6 sm:px-10 rounded-xl sm:rounded-3xl bg-[#1F1F1F] w-full ">
                <span className='text-sm sm:text-base'>{q.question}</span>
                {activeQuestion === index ? <ArrowUp className='h-4 sm:h-6'/>: <ArrowDown className='h-4 sm:h-6'/>}
              </div>
                <div className={`min-h-[100px] flex justify-between items-center py-4 sm:py-8 px-6 sm:px-10 rounded-xl sm:rounded-3xl bg-[#FF791F] transition-all duration-300 ${activeQuestion === index ? '' : 'hidden'}`}>
                  <p className="text-sm sm:text-base text-gray-100">{q.answer}</p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationQNA;
