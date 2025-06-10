"use client";

import axios from "axios";
import {
  AlertCircle,
  Download,
  Eye,
  LoaderCircle,
  SquarePen,
  Upload,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { uploadStudentDocuments } from "~/api/studentAPI";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Progress } from "~/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface Document {
  id: string;
  name: string;
  isMandatory: boolean;
  description?: string;
  status?: "verified" | "flagged" | "updated" | "";
  uploadDate?: string;
  fileUrl?: string;
  docType: string;
}

interface UploadState {
  uploading: boolean;
  uploadProgress: number;
  fileName: string;
  error: string;
}

interface DownloadState {
  uploading: boolean;
  error: string;
}

interface PersonalDocumentsProps {
  student: any;
}

export default function PersonalDocuments({ student }: PersonalDocumentsProps) {
  const latestCohort =
    student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;

  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>();
  const [selectedDocName, setSelectedDocName] = useState("");
  const [uploadStates, setUploadStates] = useState<{
    [docId: string]: UploadState;
  }>({});
  const [downloadStates, setDownloadStates] = useState<{
    [docId: string]: DownloadState;
  }>({});
  const [docs, setDocs] = useState<any[]>([]);
  const [personalDocuments, setPersonalDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Identity Proof (Aadhar Card)",
      isMandatory: true,
      description: "Mandatory",
      docType: "aadharDocument",
    },
    {
      id: "2",
      name: "10th Grade Marks Sheet",
      isMandatory: true,
      description: "Mandatory",
      docType: "secondarySchoolMarksheet",
    },
    {
      id: "3",
      name: "12th Grade Marks Sheet",
      isMandatory: true,
      description: "Mandatory",
      docType: "higherSecondaryMarkSheet",
    },
    {
      id: "4",
      name: "12th Grade Transfer Certificate",
      isMandatory: true,
      description: "",
      docType: "higherSecondaryTC",
    },
    {
      id: "5",
      name: "Graduation Marks Sheet",
      isMandatory: false,
      description: "If you hold a UG Degree",
      docType: "graduationMarkSheet",
    },
  ]);
  const [parentDocuments, setParentDocuments] = useState<Document[]>([
    {
      id: "6",
      name: "Father’s ID Proof",
      isMandatory: true,
      description: "Mandatory",
      docType: "fatherIdProof",
    },
    {
      id: "7",
      name: "Mother ID Proof",
      isMandatory: true,
      description: "Mandatory",
      docType: "motherIdProof",
    },
  ]);

  useEffect(() => {
    setDocs(latestCohort?.personalDocs?.documents || []);
  }, [student]);

  const handleFileDownload = async (url: string, docName: string) => {
    setDownloadStates((prev) => ({
      ...prev,
      [docName]: {
        uploading: true,
        error: "",
      },
    }));

    try {
      // 1. Fetch the file as Blob
      const response = await fetch(url);
      const blob = await response.blob();

      // 2. Create a temporary object URL for that Blob
      const blobUrl = URL.createObjectURL(blob);

      // 3. Create a hidden <a> and force download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${docName}.pdf`; // or "myImage.png"
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      setDownloadStates((prev) => ({
        ...prev,
        [docName]: {
          ...prev[docName],
          error: `${err}` || "Download failed",
        },
      }));
    } finally {
      setDownloadStates((prev) => ({
        ...prev,
        [docName]: {
          ...prev[docName],
          uploading: false,
        },
      }));
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docId: string,
    docType: string,
    editId?: string
  ) => {
    setError(null);

    setUploadStates((prev) => ({
      ...prev,
      [docId]: { uploading: true, uploadProgress: 0, fileName: "", error: "" },
    }));

    const file = e.target.files?.[0];
    if (!file) return;
    else if (file.size > 5 * 1024 * 1024) {
      setUploadStates((prev) => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          uploading: false,
          error: `File size exceeds 5 MB`,
        },
      }));
      return;
    }
    const fileKey = generateUniqueFileName(file.name);

    // Update fileName for this document
    setUploadStates((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], fileName: fileKey },
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
        docId: editId,
        fileUrl: fileUrl,
      };

      console.log("payload", payload);

      // Call the API function with FormData
      const response = await uploadStudentDocuments(payload);
      console.log("Upload response:", response);
      setDocs(response.data.documents);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploadStates((prev) => ({
        ...prev,
        [docId]: { ...prev[docId], uploading: false },
      }));
      e.target.value = "";
    }
  };

  const uploadDirect = async (file: File, fileKey: string, docId: string) => {
    const { data } = await axios.post(
      `https://dev.apply.litschool.in/student/generate-presigned-url`,
      {
        bucketName: "dev-application-portal",
        key: fileKey,
      }
    );
    const { url } = data;
    await axios.put(url, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (evt: any) => {
        if (!evt.total) return;
        const percentComplete = Math.round((evt.loaded / evt.total) * 100);
        setUploadStates((prev) => ({
          ...prev,
          [docId]: {
            ...prev[docId],
            uploadProgress: Math.min(percentComplete, 100),
          },
        }));
      },
    });
    return `${url.split("?")[0]}`;
  };

  const uploadMultipart = async (
    file: File,
    fileKey: string,
    chunkSize: number,
    docId: string
  ) => {
    const uniqueKey = fileKey;

    const initiateRes = await axios.post(
      `https://dev.apply.litschool.in/student/initiate-multipart-upload`,
      {
        bucketName: "dev-application-portal",
        key: uniqueKey,
      }
    );
    const { uploadId } = initiateRes.data;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let totalBytesUploaded = 0;
    const parts: { ETag: string; PartNumber: number }[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const partRes = await axios.post(
        `https://dev.apply.litschool.in/student/generate-presigned-url-part`,
        {
          bucketName: "dev-application-portal",
          key: uniqueKey,
          uploadId,
          partNumber: i + 1,
        }
      );
      const { url } = partRes.data;
      const uploadRes = await axios.put(url, chunk, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (evt: any) => {
          if (!evt.total) return;
          totalBytesUploaded += evt.loaded;
          const percent = Math.round((totalBytesUploaded / file.size) * 100);
          setUploadStates((prev) => ({
            ...prev,
            [docId]: { ...prev[docId], uploadProgress: Math.min(percent, 100) },
          }));
        },
      });
      parts.push({ PartNumber: i + 1, ETag: uploadRes.headers.etag });
    }
    await axios.post(
      `https://dev.apply.litschool.in/student/complete-multipart-upload`,
      {
        bucketName: "dev-application-portal",
        key: uniqueKey,
        uploadId,
        parts,
      }
    );
    return `https://dev-application-portal.s3.amazonaws.com/${uniqueKey}`;
  };

  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/\s+/g, "-");
    return `${timestamp}-${sanitizedName}`;
  };

  const handleOpenDoc = (doc: string, name: string) => {
    setSelectedDoc(doc);
    setSelectedDocName(name);
    setOpen(true);
  };

  return (
    <div className="px-4 sm:px-8 py-8 space-y-4 sm:space-y-8">
      <div className="space-y-3">
        <div className="text-2xl font-normal pl-3">Personal Documents</div>
        {personalDocuments.map((doc) => {
          // Find the document from `docs` array where name matches doc.docType
          const docDetail =
            docs.length > 0
              ? docs.find((d: any) => d.name === doc.docType)
              : null;

          return (
            <div
              key={doc.id}
              className="flex lg:flex-row flex-col gap-2 lg:items-center items-start lg:justify-between p-4 sm:p-6 bg-[#64748B1F] border rounded-xl"
            >
              <div className="flex items-center gap-4">
                {docDetail ? (
                  <div className="relative group h-16 w-16 justify-center flex items-center rounded-full bg-[#00CC921F] overflow-hidden">
                    <iframe
                      src={docDetail?.url}
                      className="w-full h-full"
                      style={{ border: "none" }}
                    ></iframe>
                    <div
                      className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => handleOpenDoc(docDetail, doc.name)}
                    >
                      <Eye className="text-white w-6 h-6" />
                    </div>
                  </div>
                ) : (
                  <div className="h-16 w-16 justify-center flex items-center rounded-full bg-[#00CC921F]">
                    <img
                      src="/assets/images/personal-document-icon.svg"
                      className="w-6 h-6"
                    />
                  </div>
                )}
                <div className="flex-1 ">
                  <h3 className="font-medium text-lg/5 sm:text-2xl text-white">
                    {doc.name}
                  </h3>
                  <p className="text-xs sm:text-base  mt-2 sm:mt-0">
                    PDF {doc.description ? "• " : ""}
                    {docDetail ? (
                      <>
                        {docDetail.status === "flagged" ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={`capitalize cursor-pointer text-[#FF503D] underline`}
                                  onClick={() =>
                                    handleOpenDoc(docDetail, doc.name)
                                  }
                                >
                                  Document {docDetail.status}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="start">
                                <p className="max-w-[50vw] text-sm">
                                  {
                                    docDetail.feedback?.[
                                      docDetail.feedback.length - 1
                                    ]?.feedbackData
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span
                            className={`capitalize ${
                              docDetail.status === "verification pending"
                                ? "text-white"
                                : docDetail.status === "verified"
                                ? "text-[#00CC92]"
                                : ""
                            }`}
                          >
                            {docDetail.status}
                          </span>
                        )}
                        <span className="text-muted-foreground underline-0">
                          {" "}
                          • {new Date(docDetail?.date).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <span
                        className={
                          doc.description?.toLowerCase() === "mandatory"
                            ? "text-[#00CC92]"
                            : "text-[#F8E000]"
                        }
                      >
                        {doc.description}
                      </span>
                    )}
                  </p>
                  {uploadStates[doc.id]?.error && (
                    <p className="text-xs sm:text-base text-[#FF503D] mt-2 sm:mt-0">
                      {uploadStates[doc.id]?.error}
                    </p>
                  )}
                  {downloadStates[doc.id]?.error && (
                    <p className="text-xs sm:text-base text-[#FF503D] mt-2 sm:mt-0">
                      {downloadStates[doc.id]?.error}
                    </p>
                  )}
                </div>
              </div>

              {uploadStates[doc.id]?.uploading ? (
                <div className="flex items-center gap-2">
                  {uploadStates[doc.id]?.uploadProgress === 100 ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Progress
                        className="h-2 w-24"
                        value={uploadStates[doc.id]?.uploadProgress}
                      />
                      <span>{uploadStates[doc.id]?.uploadProgress}%</span>
                    </>
                  )}
                  <Button
                    size="icon"
                    type="button"
                    className="bg-[#1B1B1C] rounded-xl"
                  >
                    <XIcon className="w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4 w-full sm:w-fit">
                  {docDetail &&
                  ["verified", "verification pending"].includes(
                    docDetail.status
                  ) ? (
                    <>
                      <Button
                        size="xl"
                        variant="ghost"
                        className="flex gap-2 items-center border bg-[#1B1B1C] flex-1"
                        onClick={() =>
                          handleFileDownload(docDetail.url || "", doc.docType)
                        }
                        disabled={downloadStates[doc.docType]?.uploading}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      {docDetail?.status === "verification pending" && (
                        <>
                          {" "}
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            id={`file-input-${doc.id}`}
                            onChange={(e) =>
                              handleFileChange(
                                e,
                                doc.id,
                                doc.docType,
                                docDetail?._id
                              )
                            }
                          />
                          <Button
                            size="xl"
                            variant="ghost"
                            className="border bg-[#1B1B1C] !px-4"
                            onClick={() =>
                              document
                                .getElementById(`file-input-${doc.id}`)
                                ?.click()
                            }
                          >
                            <SquarePen className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </>
                  ) : docDetail && docDetail.status === "flagged" ? (
                    <>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        id={`file-input-${doc.id}`}
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            doc.id,
                            doc.docType,
                            docDetail?._id
                          )
                        }
                      />
                      <Button
                        size="xl"
                        variant="default"
                        className="flex gap-2 items-center flex-1"
                        onClick={() =>
                          document
                            .getElementById(`file-input-${doc.id}`)
                            ?.click()
                        }
                      >
                        <Upload className="h-4 w-4" />
                        Re-Upload File
                      </Button>
                    </>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        id={`file-input-${doc.id}`}
                        onChange={(e) =>
                          handleFileChange(e, doc.id, doc.docType)
                        }
                      />
                      <Button
                        size="xl"
                        variant="default"
                        className="flex gap-2 items-center flex-1"
                        onClick={() =>
                          document
                            .getElementById(`file-input-${doc.id}`)
                            ?.click()
                        }
                      >
                        <Upload className="h-4 w-4" />
                        Upload File
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-3 border-t-2 border-dashed pt-4 sm:pt-8">
        <div className="text-2xl font-normal pl-3">Parent's Documents</div>
        {parentDocuments.map((doc) => {
          // Find the document from `docs` array where name matches doc.docType
          const docDetail =
            docs.length > 0
              ? docs.find((d: any) => d.name === doc.docType)
              : null;

          return (
            <div
              key={doc.id}
              className="flex lg:flex-row flex-col gap-2 lg:items-center items-start lg:justify-between p-4 sm:p-6 bg-[#64748B1F] border rounded-xl"
            >
              <div className="flex items-center gap-4">
                {docDetail ? (
                  <div className="relative group h-16 w-16 justify-center flex items-center rounded-full bg-[#00CC921F] overflow-hidden">
                    <iframe
                      src={docDetail?.url}
                      className="w-full h-full"
                      style={{ border: "none" }}
                    ></iframe>
                    <div
                      className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => handleOpenDoc(docDetail, doc.name)}
                    >
                      <Eye className="text-white w-6 h-6" />
                    </div>
                  </div>
                ) : (
                  <div className="h-16 w-16 justify-center flex items-center rounded-full bg-[#00CC921F]">
                    <img
                      src="/assets/images/personal-document-icon.svg"
                      className="w-6 h-6"
                    />
                  </div>
                )}
                <div className="flex-1 ">
                  <h3 className="font-medium text-lg/5 sm:text-2xl text-white">
                    {doc.name}
                  </h3>
                  <p className="text-xs sm:text-base mt-2 sm:mt-0">
                    Aadhar/PAN Card • PDF •{" "}
                    {docDetail ? (
                      <>
                        {docDetail.status === "flagged" ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={`capitalize cursor-pointer text-[#FF503D] underline`}
                                  onClick={() =>
                                    handleOpenDoc(docDetail, doc.name)
                                  }
                                >
                                  Document {docDetail.status}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="start">
                                <p className="max-w-[50vw] text-sm">
                                  {
                                    docDetail.feedback?.[
                                      docDetail.feedback.length - 1
                                    ]?.feedbackData
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span
                            className={`capitalize  ${
                              docDetail.status === "verification pending"
                                ? "text-white"
                                : docDetail.status === "verified"
                                ? "text-[#00CC92]"
                                : ""
                            }`}
                          >
                            {docDetail.status}
                          </span>
                        )}
                        <span className="text-muted-foreground underline-0">
                          {" "}
                          • {new Date(docDetail?.date).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <span
                        className={
                          doc.description?.toLowerCase() === "mandatory"
                            ? "text-[#00CC92]"
                            : "text-[#F8E000]"
                        }
                      >
                        {doc.description}
                      </span>
                    )}
                  </p>
                  {uploadStates[doc.id]?.error && (
                    <p className="text-xs sm:text-base text-[#FF503D] mt-2 sm:mt-0">
                      {uploadStates[doc.id]?.error}
                    </p>
                  )}
                  {downloadStates[doc.id]?.error && (
                    <p className="text-xs sm:text-base text-[#FF503D] mt-2 sm:mt-0">
                      {downloadStates[doc.id]?.error}
                    </p>
                  )}
                </div>
              </div>

              {uploadStates[doc.id]?.uploading ? (
                <div className="flex items-center gap-2">
                  {uploadStates[doc.id]?.uploadProgress === 100 ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Progress
                        className="h-2 w-24"
                        value={uploadStates[doc.id]?.uploadProgress}
                      />
                      <span>{uploadStates[doc.id]?.uploadProgress}%</span>
                    </>
                  )}
                  <Button
                    size="icon"
                    type="button"
                    className="bg-[#1B1B1C] rounded-xl"
                  >
                    <XIcon className="w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4 w-full sm:w-fit">
                  {docDetail &&
                  ["verified", "verification pending"].includes(
                    docDetail.status
                  ) ? (
                    <>
                      <Button
                        size="xl"
                        variant="ghost"
                        className="flex gap-2 items-center border bg-[#1B1B1C] flex-1"
                        onClick={() =>
                          handleFileDownload(docDetail.url || "", doc.docType)
                        }
                        disabled={downloadStates[doc.docType]?.uploading}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      {docDetail?.status === "verification pending" && (
                        <>
                          {" "}
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            id={`file-input-${doc.id}`}
                            onChange={(e) =>
                              handleFileChange(
                                e,
                                doc.id,
                                doc.docType,
                                docDetail?._id
                              )
                            }
                          />
                          <Button
                            size="xl"
                            variant="ghost"
                            className="border bg-[#1B1B1C] !px-4"
                            onClick={() =>
                              document
                                .getElementById(`file-input-${doc.id}`)
                                ?.click()
                            }
                          >
                            <SquarePen className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </>
                  ) : docDetail && docDetail.status === "flagged" ? (
                    <>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        id={`file-input-${doc.id}`}
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            doc.id,
                            doc.docType,
                            docDetail?._id
                          )
                        }
                      />
                      <Button
                        size="xl"
                        variant="default"
                        className="flex gap-2 items-center flex-1"
                        onClick={() =>
                          document
                            .getElementById(`file-input-${doc.id}`)
                            ?.click()
                        }
                      >
                        <Upload className="h-4 w-4" />
                        Re-Upload File
                      </Button>
                    </>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        id={`file-input-${doc.id}`}
                        onChange={(e) =>
                          handleFileChange(e, doc.id, doc.docType)
                        }
                      />
                      <Button
                        size="xl"
                        variant="default"
                        className="flex gap-2 items-center flex-1"
                        onClick={() =>
                          document
                            .getElementById(`file-input-${doc.id}`)
                            ?.click()
                        }
                      >
                        <Upload className="h-4 w-4" />
                        Upload File
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {docs?.filter(
        (doc: any) =>
          ![
            "graduationMarkSheet",
            "higherSecondaryMarkSheet",
            "secondarySchoolMarksheet",
            "aadharDocument",
            "higherSecondaryTC",
            "fatherIdProof",
            "motherIdProof",
          ].includes(doc.name)
      ).length > 0 && (
        <div className="space-y-3 border-t-2 border-dashed pt-4 sm:pt-8">
          <div className="text-2xl font-normal pl-3">Additional Documents</div>
          {docs
            ?.filter(
              (doc: any) =>
                ![
                  "graduationMarkSheet",
                  "higherSecondaryMarkSheet",
                  "secondarySchoolMarksheet",
                  "aadharDocument",
                  "higherSecondaryTC",
                  "fatherIdProof",
                  "motherIdProof",
                ].includes(doc.name)
            )
            .map((doc: any) => (
              <div
                key={doc?._id}
                className="flex lg:flex-row flex-col gap-2 lg:items-center items-start lg:justify-between p-4 sm:p-6 bg-[#64748B1F] border rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="relative group h-16 w-16 justify-center flex items-center rounded-full bg-[#00CC921F] overflow-hidden">
                    <iframe
                      src={doc?.url}
                      className="w-full h-full"
                      style={{ border: "none" }}
                    ></iframe>
                    <div
                      className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => handleOpenDoc(doc, doc.name)}
                    >
                      <Eye className="text-white w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg/5 sm:text-2xl text-white capitalize">
                      {doc?.name}
                    </h3>
                    <p className="text-xs sm:text-base mt-2 sm:mt-0">
                      DOC{" "}
                      <span className="text-muted-foreground underline-0">
                        {" "}
                        • {new Date(doc?.date).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-fit flex items-center gap-4">
                  <Button
                    size="xl"
                    variant="ghost"
                    className="flex gap-2 items-center border bg-[#1B1B1C] flex-1"
                    onClick={() =>
                      handleFileDownload(doc?.url || "", doc?.documentName)
                    }
                    disabled={downloadStates[doc.documentName]?.uploading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
      {selectedDoc && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTitle></DialogTitle>
          <DialogContent className="max-w-5xl py-2 px-2 sm:px-6 max-h-[70vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col gap-4 justify-center">
              <p className="pl-3">Preview for {selectedDocName}</p>
              <div className="max-w-5xl h-[70vh] justify-center flex items-center rounded-2xl bg-[#09090b] border ">
                <iframe
                  src={selectedDoc?.url}
                  className="mx-auto w-[70%] h-full"
                  style={{ border: "none" }}
                ></iframe>
              </div>
              {selectedDoc?.status === "flagged" ? (
                <div className="flex gap-2 items-center justify-center text-sm sm:text-base text-[#FF503D]">
                  <AlertCircle className="w-4 h-4" />
                  <span className="flex-1">
                    {
                      selectedDoc.feedback?.[selectedDoc.feedback.length - 1]
                        ?.feedbackData
                    }
                  </span>
                </div>
              ) : (
                <Button
                  size="xl"
                  variant="ghost"
                  className="w-full sm:w-fit mx-auto border bg-[#1B1B1C]"
                  onClick={() =>
                    handleFileDownload(selectedDoc?.url || "", selectedDocName)
                  }
                  disabled={downloadStates[selectedDocName]?.uploading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
