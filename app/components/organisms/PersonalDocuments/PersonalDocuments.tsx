"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { File, CheckCircle, AlertCircle, Download, Upload, FilePenLine } from "lucide-react";

interface Document {
  id: string;
  name: string;
  isMandatory: boolean;
  description?: string;
  status?: "verified" | "flagged" | "updated" | "pending";
  uploadDate?: string;
  fileUrl?: string;
}

const PersonalDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Identity Proof (Aadhar Card)",
      isMandatory: true,
      description: "Mandatory",
      status: "verified",
      uploadDate: "13 Dec, 2024",
      fileUrl: "/path/to/aadhar.pdf",
    },
    {
      id: "2",
      name: "12th Grade Marks Sheet",
      isMandatory: true,
      description: "Mandatory",
      status: "updated",
      uploadDate: "13 Dec, 2024",
      fileUrl: "/path/to/12th.pdf",
    },
    {
      id: "3",
      name: "10th Grade Marks Sheet",
      isMandatory: true,
      description: "Mandatory",
      status: "flagged",
      uploadDate: "13 Dec, 2024",
    },
    {
      id: "4",
      name: "Graduation Marks Sheet",
      isMandatory: false,
      description: "If you hold a UG Degree",
      status: "pending",
    },
  ]);

  const handleFileUpload = (documentId: string, file: File) => {
    console.log(`File uploaded for document ID: ${documentId}`, file);
    // Handle the file upload logic here
  };

  const handleFileDownload = (fileUrl: string) => {
    // Logic to download the file
    console.log(`Downloading file from URL: ${fileUrl}`);
  };

  return (
    <div className="p-8 space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-6 bg-[#64748B1F] border rounded-xl"
        >
          <div className="flex items-center gap-4">
            <File className="h-16 w-16 text-green-600 p-4 rounded-full bg-[#00CC921F]" />
            <div>
              <h3 className="font-medium text-white">{doc.name}</h3>
              <p className="text-sm text-gray-400">
                PDF •{" "}
                <span
                  className={`${
                    doc.description?.toLowerCase() === "mandatory"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {doc.description}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {doc.status === "verified" && (
              <>
                {/* <Badge className="bg-green-500 text-white">
                  Verified • {doc.uploadDate}
                </Badge> */}
                <Button size="xl" 
                  variant="ghost" className="border bg-[#1B1B1C]"
                  onClick={() => handleFileDownload(doc.fileUrl || "")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}

            {doc.status === "updated" && (
              <>
                {/* <Badge className="bg-blue-500 text-white">
                  Updated • {doc.uploadDate}
                </Badge> */}
                <Button size="xl" 
                  variant="ghost" className="border bg-[#1B1B1C]"
                  onClick={() => handleFileDownload(doc.fileUrl || "")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}

            {doc.status === "flagged" && (
              <>
                {/* <Badge className="bg-red-500 text-white">
                  Document Flagged • {doc.uploadDate}
                </Badge> */}
                <Button size="xl" variant="default">
                  <Upload className="h-4 w-4 mr-2" />
                  Re-Upload File
                </Button>
              </>
            )}

            {doc.status === "pending" && (
              <Button size="xl" variant="default">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            )}

            {doc.fileUrl && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="xl" variant="ghost" className=" !p-[18px] border bg-[#1B1B1C]">
                    <FilePenLine className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <div className="text-white">
                    {/* Replace with actual PDF viewer */}
                    <p>Preview for {doc.name}</p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PersonalDocuments;
