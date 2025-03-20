"use client";

import { useContext, useEffect, useState } from "react";
import { getCurrentStudent } from "~/utils/studentAPI"; // Ensure correct path
import { UserContext } from "~/context/UserContext";

interface Document {
  id: string;
  name: string;
  description?: string;
}

interface ApplicationDocumentsProps {
  student: any
}

export default function ApplicationDocuments({ student }: ApplicationDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Personal and General Details",
      description: "Access your personal and general information.",
    },
    {
      id: "2",
      name: "Course Dive",
      description: "Access your submitted tasks and feedback",
    },
    {
      id: "3",
      name: "Interview Feedback",
      description: "Access your first interview feedback",
    },
    {
      id: "4",
      name: "LITMUS Test",
      description: "Access your LITMUS Test submission along with the accompanying feedback.",
    },
  ]);
  const { studentData } = useContext(UserContext);
  const [docs, setDocs] = useState<any>();
  
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const student = await getCurrentStudent(studentData._id);
        setDocs(student.data);
        console.log("doc",student.data?.personalDocsDetails);
        
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };
    fetchStudentData();
  }, []);

  return (
    <div className="px-4 sm:px-8 py-8 space-y-4">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-4 sm:p-6 bg-[#64748B1F] border rounded-xl cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="h-16 !w-16 justify-center flex items-center rounded-full bg-[#00CC921F]">
              <img src="/assets/images/personal-document-icon.svg" className="w-6 h-6"/>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg/5 sm:text-2xl text-white">{doc.name}</h3>
              <p className="text-xs sm:text-base text-">
                {doc.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
