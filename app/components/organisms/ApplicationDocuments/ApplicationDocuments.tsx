"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { File as FileIcon, Download, Upload, FilePenLine, FilePen } from "lucide-react";
import { getCurrentStudent, uploadStudentDocuments } from "~/utils/studentAPI"; // Ensure correct path
import { UserContext } from "~/context/UserContext";

interface Document {
  id: string;
  name: string;
  description?: string;
}

const ApplicationDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Personal and General Details",
      description: "Access your submitted application document, which contains all your personal and general information.",
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
    <div className="p-8 space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-6 bg-[#64748B1F] border rounded-xl"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 justify-center flex items-center rounded-full bg-[#00CC921F]">
              <img src="/assets/images/personal-document-icon.svg" className="w-6 h-6"/>
            </div>
            <div>
              <h3 className="font-medium text-2xl text-white">{doc.name}</h3>
              <p className="text-base text-">
                {doc.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicationDocuments;
