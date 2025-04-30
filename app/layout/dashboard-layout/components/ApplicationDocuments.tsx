"use client";

import { useContext, useEffect, useState } from "react";
import { getCurrentStudent } from "~/api/studentAPI";
import { UserContext } from "~/context/UserContext";

interface Document {
  name: string;
  description?: string;
  path: string;
}

interface ApplicationDocumentsProps {
  student: any;
  onSelectTab: (path: string) => void;
}

export default function ApplicationDocuments({ student, onSelectTab }: ApplicationDocumentsProps) {
  const [tabs, setTabs] = useState<Document[]>([
    {
      name: "Personal and General Details",
      description: "Access your personal and general information.",
      path: "personal-details",
    },
    {
      name: "Course Dive",
      description: "Access your submitted tasks and feedback",
      path: "course-dive",
    },
    {
      name: "Interview Feedback",
      description: "Access your first interview feedback",
      path: "interview-feedback",
    },
  ]);

  return (
    <div className="px-4 sm:px-8 py-8 space-y-3">
      {tabs.map((doc, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 sm:p-6 bg-[#64748B1F] border rounded-xl cursor-pointer hover:bg-[#64748B33]"
          onClick={() => onSelectTab(doc.path)}
        >
          <div className="flex items-center gap-4">
            <div className="h-16 !w-16 justify-center flex items-center rounded-full bg-[#00CC921F]">
              <img src="/assets/images/personal-document-icon.svg" className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg/5 sm:text-2xl text-white">{doc.name}</h3>
              <p className="text-xs sm:text-base text-white/70">
                {doc.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
