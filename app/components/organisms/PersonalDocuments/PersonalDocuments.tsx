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
  isMandatory: boolean;
  description?: string;
  status?: "verified" | "flagged" | "updated" | "";
  uploadDate?: string;
  fileUrl?: string;
  docType: string; // Add this property to map doc name to a type
}

const PersonalDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Identity Proof (Aadhar Card)",
      isMandatory: true,
      description: "Mandatory",
      docType: "aadharDocument"
    },
    {
      id: "2",
      name: "12th Grade Marks Sheet",
      isMandatory: true,
      description: "Mandatory",
      docType: "higherSecondaryMarkSheet"
    },
    {
      id: "3",
      name: "10th Grade Marks Sheet",
      isMandatory: true,
      description: "Mandatory",
      docType: "secondarySchoolMarksheet"
    },
    {
      id: "4",
      name: "Graduation Marks Sheet",
      isMandatory: false,
      description: "If you hold a UG Degree",
      docType: "graduationMarkSheet"
    },
  ]);
  const { studentData } = useContext(UserContext);
  const [docs, setDocs] = useState<any>();
  const [loading, setLoading] = useState(false);  
  
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const student = await getCurrentStudent(studentData._id);
        setDocs(student.data?.personalDocsDetails);
        console.log("doc",student.data?.personalDocsDetails);
        
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };
    fetchStudentData();
  }, studentData);

  const handleFileDownload = (fileUrl: string, docType: string) => {
    if (!fileUrl) {
      console.error("No file URL available for download.");
      return;
    }
  
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute('download', `${studentData?.firstName}_${docType}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docId: string,
    docType: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      // Construct the FormData
      const formData = new FormData();
      formData.append('type', docType); 
      formData.append('files', file); // Use docType as the field name

      // Call the API function with FormData
      const response = await uploadStudentDocuments(formData);
      console.log("Upload response:", response);

    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      e.target.value = ""; // Reset the input field
    }
  };
  

  return (
    <div className="p-8 space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-6 bg-[#64748B1F] border rounded-xl"
        >
          <div className="flex items-center gap-4">
          {docs && docs[doc.docType] && docs[doc.docType].length > 0 ? (
            <div className="cursor-pointer h-16 w-16 justify-center flex items-center rounded-full bg-[#00CC921F]">
              PDF
            </div>
          ) : (
            <div className="h-16 w-16 justify-center flex items-center rounded-full bg-[#00CC921F]">
              <img src="/assets/images/personal-document-icon.svg" className="w-6 h-6"/>
            </div>
          )}
            <div>
              <h3 className="font-medium text-2xl text-white">{doc.name}</h3>
              <p className="text-base text-gray-400">
                PDF •{" "}
              {docs && docs[doc.docType] && docs[doc.docType].length > 0 ?
                <><span
                  className={`capitalize 
                    ${docs[doc.docType][0].status === "updated"
                      ? "text-white"
                      : docs[doc.docType][0].status === "verified"
                      ? "text-[#00CC92]"
                      : "text-[#FF503D] underline"}
                  `}
                >
                  {docs[doc.docType][0].status}
                </span>  
                  <span className="text-muted-foreground underline-0"> •{" "}{new Date(docs?.updatedAt).toLocaleDateString()}</span>
                </> :
                <span
                  className={
                    doc.description?.toLowerCase() === "mandatory"
                      ? "text-[#00CC92]"
                      : "text-[#F8E000]"
                  }
                >
                  {doc.description}
                </span>
              }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
          {docs && docs[doc.docType] && docs[doc.docType].length > 0 && (
            (docs[doc.docType][0].status === "verified" || docs[doc.docType][0].status === "updated") && (
              <>
                <Button
                  size="xl"
                  variant="ghost"
                  className="border bg-[#1B1B1C]"
                  onClick={() => handleFileDownload(docs[doc.docType][0].url || "", doc.docType)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  id={`file-input-${doc.id}`}
                  onChange={(e) => handleFileChange(e, doc.id, doc.docType)}
                />
                <Button
                  size="xl"
                  variant="ghost"
                  className="border bg-[#1B1B1C] !px-4"
                  onClick={() =>
                    document.getElementById(`file-input-${doc.id}`)?.click()
                  }
                >
                  <FilePenLine className="h-5 w-5" />
                </Button>
              </>  
              ))}

            {docs && docs[doc.docType] && docs[doc.docType].length > 0 && (
            (docs[doc.docType][0].status === "flagged") && (
              <>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  id={`file-input-${doc.id}`}
                  onChange={(e) => handleFileChange(e, doc.id, doc.docType)}
                />
                <Button
                  size="xl"
                  variant="default"
                  onClick={() =>
                    document.getElementById(`file-input-${doc.id}`)?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Re-Upload File
                </Button>
              </>
            ))}

            {((docs && docs[doc.docType] && docs[doc.docType].length === 0)) && (
              <>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  id={`file-input-${doc.id}`}
                  onChange={(e) => handleFileChange(e, doc.id, doc.docType)}
                />
                <Button
                  size="xl"
                  variant="default"
                  onClick={() =>
                    document.getElementById(`file-input-${doc.id}`)?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </>
            )}

            {doc.fileUrl && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="xl"
                    variant="ghost"
                    className="!p-[18px] border bg-[#1B1B1C]"
                  >
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
