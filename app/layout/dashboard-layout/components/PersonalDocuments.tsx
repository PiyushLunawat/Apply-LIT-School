"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { File as FileIcon, Download, Upload, FilePenLine, FilePen, Eye, Pen, LoaderCircle, XIcon } from "lucide-react";
import { getCurrentStudent, uploadStudentDocuments } from "~/utils/studentAPI"; // Ensure correct path
import { UserContext } from "~/context/UserContext";
import axios from "axios";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";

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

interface UploadState {
  uploading: boolean;
  uploadProgress: number;
  fileName: string;
}

interface PersonalDocumentsProps {
  student: any
}

export default function PersonalDocuments({ student }: PersonalDocumentsProps) {
  
  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;

  const [personalDocs, setPersonalDocs] = useState<any>();
  const [docUrl, setDocUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploadStates, setUploadStates] = useState<{ [docId: string]: UploadState }>({});

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
  const [docs, setDocs] = useState<any>();
  
  useEffect(() => {
    setDocs(student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.personalDocs);
  }, [student]);

  const handleFileDownload = (fileUrl: string, docType: string) => {
    if (!fileUrl) {
      console.error("No file URL available for download.");
      return;
    }
  
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute('download', `${student?.firstName}_${docType}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async ( e: React.ChangeEvent<HTMLInputElement>, docId: string, docType: string
  ) => {
    setError(null);

    setUploadStates(prev => ({
      ...prev,
      [docId]: { uploading: true, uploadProgress: 0, fileName: "" }
    }));

    const file = e.target.files?.[0];
    if (!file) return;
    const fileKey = generateUniqueFileName(file.name);
    
    // Update fileName for this document
    setUploadStates(prev => ({
      ...prev,
      [docId]: { ...prev[docId], fileName: fileKey }
    }));

    const CHUNK_SIZE = 100 * 1024 * 1024;
    e.target.value = "";

    try {
      let fileUrl = "";
      if (file.size <= CHUNK_SIZE) {
        fileUrl = await uploadDirect(file, fileKey, docId);
        console.log("uploadDirect File URL:", fileUrl);
      } else {
        fileUrl = await uploadMultipart(file, fileKey, CHUNK_SIZE, docId);
        console.log("uploadMultipart File URL:", fileUrl);
      }

      const payload = {
        type: docType,
        cohortId: cohortDetails?._id,
        // docId: "67c81216d2ecd4704d9188a4",
        fileUrl: fileUrl,
      };

      console.log("payload", payload);
    
      // Call the API function with FormData
      const response = await uploadStudentDocuments(payload);
      console.log("Upload response:", response);
      setDocs(response.data);

    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploadStates(prev => ({
        ...prev,
        [docId]: { ...prev[docId], uploading: false }
      }));
      e.target.value = "";
    }
  };

  const uploadDirect = async (file: File, fileKey: string, docId: string) => {
    const { data } = await axios.post(`https://dev.apply.litschool.in/student/generate-presigned-url`, {
      bucketName: "dev-application-portal",
      key: fileKey,
    });
    const { url } = data;
    await axios.put(url, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (evt: any) => {
        if (!evt.total) return;
        const percentComplete = Math.round((evt.loaded / evt.total) * 100);
        setUploadStates(prev => ({
          ...prev,
          [docId]: { ...prev[docId], uploadProgress: Math.min(percentComplete, 100) }
        }));
      },
    });
    return `${url.split("?")[0]}`;
  };

  const uploadMultipart = async (file: File, fileKey: string, chunkSize: number, docId: string) => {
    const uniqueKey = fileKey;

    const initiateRes = await axios.post(`https://dev.apply.litschool.in/student/initiate-multipart-upload`, {
      bucketName: "dev-application-portal",
      key: uniqueKey,
    });
    const { uploadId } = initiateRes.data;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let totalBytesUploaded = 0;
    const parts: { ETag: string; PartNumber: number }[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const partRes = await axios.post(`https://dev.apply.litschool.in/student/generate-presigned-url-part`, {
        bucketName: "dev-application-portal",
        key: uniqueKey,
        uploadId,
        partNumber: i + 1,
      });
      const { url } = partRes.data;
      const uploadRes = await axios.put(url, chunk, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (evt: any) => {
          if (!evt.total) return;
          totalBytesUploaded += evt.loaded;
          const percent = Math.round((totalBytesUploaded / file.size) * 100);
           setUploadStates(prev => ({
            ...prev,
            [docId]: { ...prev[docId], uploadProgress: Math.min(percent, 100) }
          }));
        },
      });
      parts.push({ PartNumber: i + 1, ETag: uploadRes.headers.etag });
    }
    await axios.post(`https://dev.apply.litschool.in/student/complete-multipart-upload`, {
      bucketName: "dev-application-portal",
      key: uniqueKey,
      uploadId,
      parts,
    });
    return `https://dev-application-portal.s3.amazonaws.com/${uniqueKey}`;
  };

  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/\s+/g, '-');
    return `${timestamp}-${sanitizedName}`;
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
                      ${docs[doc.docType][docs[doc.docType].length-1].status === "updated"
                        ? "text-white"
                        : docs[doc.docType][docs[doc.docType].length-1].status === "verified"
                        ? "text-[#00CC92]"
                        : "text-[#FF503D] underline"}
                    `}
                  >
                    {docs[doc.docType][docs[doc.docType].length-1].status}
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
            (docs[doc.docType][docs[doc.docType].length-1].status === "verified" || docs[doc.docType][docs[doc.docType].length-1].status === "updated") && (
              <>
                <Button
                  size="xl"
                  variant="ghost"
                  className="border bg-[#1B1B1C]"
                  onClick={() => handleFileDownload(docs[doc.docType][docs[doc.docType].length-1].url || "", doc.docType)}
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
                  <Pen className="h-4 w-4" />
                </Button>
              </>  
              ))}

            {docs && docs[doc.docType] && docs[doc.docType].length > 0 && (
            (docs[doc.docType][docs[doc.docType].length-1].status === "flagged") && (
              uploadStates[doc.id]?.uploading ?
              <div className="flex items-center gap-2">
                {uploadStates[doc.id]?.uploadProgress === 100 ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Progress className="h-2 w-24" value={uploadStates[doc.id]?.uploadProgress} />
                    <span>{uploadStates[doc.id]?.uploadProgress}%</span>
                  </>
                )}
                <Button size="icon" type="button" className="bg-[#1B1B1C] rounded-xl">
                  <XIcon className="w-5" />
                </Button>
              </div> : <>
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

            {((docs === undefined || (docs[doc.docType] && docs[doc.docType].length === 0))) && (
              uploadStates[doc.id]?.uploading ?
              <div className="flex items-center gap-2">
                {uploadStates[doc.id]?.uploadProgress === 100 ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Progress className="h-2 w-24" value={uploadStates[doc.id]?.uploadProgress} />
                    <span>{uploadStates[doc.id]?.uploadProgress}%</span>
                  </>
                )}
                <Button size="icon" type="button" className="bg-[#1B1B1C] rounded-xl">
                  <XIcon className="w-5" />
                </Button>
              </div> : <>
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
                    <Pen className="h-4 w-4" />
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

      <div className="text-3xl pt-4 px-6">Additional Documents</div>
      {docs?.adminUploadedocuments?.length > 0 && docs?.adminUploadedocuments.map((doc: any) => (
        <div
          key={doc?._id}
          className="flex items-center justify-between p-6 bg-[#64748B1F] border rounded-xl"
        >
          <div className="flex items-center gap-4">
            <div className="cursor-pointer h-16 w-16 justify-center flex items-center rounded-full bg-[#00CC921F]">
              DOC
            </div>
            <div>
              <h3 className="font-medium text-2xl text-white capitalize">{doc?.documentName}</h3>
              <p className="text-base text-gray-400">
                DOC <span className="text-muted-foreground underline-0"> •{" "}{new Date(doc?.date).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              size="xl"
              variant="ghost"
              className="border bg-[#1B1B1C]"
              onClick={() => handleFileDownload(doc?.url || "", doc?.documentName)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

