"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardFooter, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Eye, Download, CheckCircle, Pencil, Camera, FileLock } from "lucide-react";
import LitIdFront from "~/components/molecules/LitId/LitIdFront";
import LitIdBack from "~/components/molecules/LitId/LitIdBack";
import { UserContext } from "~/context/UserContext";
import { updateStudentData } from "~/utils/studentAPI";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface AccountDetailsProps {
  student: any
}

export default function AccountDetails({ student }: AccountDetailsProps) {
  
  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;

  const [open, setOpen] = useState(false);
  const { studentData, setStudentData } = useContext(UserContext);
  const [details, setDetails] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [bloodGroupInput, setBloodGroupInput] = useState<string>("");
  const [linkedInInput, setLinkedInInput] = useState<string>("");
  const [instagramInput, setInstagramInput] = useState<string>("");

  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (student) {
      setDetails(student);
      setBloodGroupInput(student.bloodGroup || "");      
    }
  }, [student]);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPDF(true); // Optional: For loading state
    try {
      // Capture LitIdFront
      const frontElement = pdfRef.current.querySelector('#front') as HTMLElement;
      if (!frontElement) {
        throw new Error('Front element not found');
      }
      const frontCanvas = await html2canvas(frontElement, {
        scale: 1, 
        useCORS: true, 
        logging: true, 
      });
      const frontImgData = frontCanvas.toDataURL('image/png');
  
      // Capture LitIdBack
      const backElement = pdfRef.current.querySelector('#back') as HTMLElement;
      if (!backElement) {
        throw new Error('Back element not found');
      }
      const backCanvas = await html2canvas(backElement, {
        scale: 2,
        useCORS: true,
        logging: true,
      });
      const backImgData = backCanvas.toDataURL('image/png');
  
      // Initialize jsPDF
      const pdf = new jsPDF('portrait', 'mm', 'a4');
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
  
      // Add LitIdFront to PDF
      const imgPropsFront = pdf.getImageProperties(frontImgData);
      const frontPdfHeight = (imgPropsFront.height * pdfWidth) / imgPropsFront.width;
      pdf.addImage(frontImgData, 'PNG', 0, 0, pdfWidth, frontPdfHeight);
  
      // Add LitIdBack as a new page
      pdf.addPage();
      const imgPropsBack = pdf.getImageProperties(backImgData);
      const backPdfHeight = (imgPropsBack.height * pdfWidth) / imgPropsBack.width;
      pdf.addImage(backImgData, 'PNG', 0, 0, pdfWidth, backPdfHeight);
  
      // Save the PDF
      pdf.save('LitID.pdf');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('An error occurred while generating the PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  

  const handleEditImage = () => {
    document.getElementById("passport-input")?.click();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append("profileImage", file);
        const response = await updateStudentData(formData);

        if (response.status) {
          setStudentData(response.data);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading the image.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle blood group save
  const handleBloodGroup = async () => {
    const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    console.log("bloodGroupInput",bloodGroupInput)
    
    if (!validBloodGroups.includes(bloodGroupInput)) {
      alert(`${bloodGroupInput} Please enter a valid blood group (e.g., A+, O-, AB+).`);
      return;
    }
  
    setLoading(true);
  
    try {
      const formData = new FormData();
      formData.append("bloodGroup", bloodGroupInput.toUpperCase());
      
      const response = await updateStudentData(formData);
      console.log(response, "response blood");
  
      if (response.status) {
        // Update student data with the new blood group and retain the value in the input field
        setDetails(response.data);
        setStudentData({ ...studentData, bloodGroup: response.data.bloodGroup });
        setBloodGroupInput(response.data.bloodGroup); // Update the input field with the new blood group value
      }
    } catch (error) {
      console.error("Error updating blood group:", error);
      alert("An error occurred while updating the blood group.");
    } finally {
      setLoading(false);
    }
  };  

  const handleLinkedInSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("linkedInUrl", linkedInInput);
      const response = await updateStudentData(formData);
  
      if (response.status) {
        setStudentData({ ...studentData, linkedInUrl: linkedInInput });
        setLinkedInInput("");
      }
    } catch (error) {
      console.error("Error updating LinkedIn URL:", error);
      alert("Failed to update LinkedIn URL.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleInstagramSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("instagramUrl", instagramInput);
      const response = await updateStudentData(formData);
  
      if (response.status) {
        setStudentData({ ...studentData, instagramUrl: instagramInput });
        setInstagramInput("");
      }
    } catch (error) {
      console.error("Error updating Instagram URL:", error);
      alert("Failed to update Instagram URL.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="px-4 sm:px-8 py-8 space-y-6">
      {/* 1) User Details Card */}
      <Card className="bg-[#64748B1F] rounded-xl text-white">
        <CardContent className="p-6 ">
          <div className="flex md:flex-row flex-col items-center gap-4 sm:gap-6">
            <div className="w-full sm:w-[250px] h-[285px] bg-[#1F1F1F] flex flex-col items-center justify-center rounded-xl text-sm space-y-4">
              {studentData?.profileUrl || selectedImage ? (
                <div className="w-full h-full relative">
                  <img
                    src={selectedImage || studentData?.profileUrl}
                    alt="Profile Image"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-3 right-2 flex space-x-2">
                    <Button variant="outline" size="icon"
                      className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
                      onClick={handleEditImage}
                    >
                      <Pencil className="w-4 h-4" />
                      <input id="passport-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange}
                      />
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="passport-input"
                  className="cursor-pointer flex flex-col items-center justify-center bg-[#1F1F1F] px-6 rounded-xl border-[#2C2C2C] w-full h-[220px]"
                >
                  <div className="text-center my-auto text-muted-foreground">
                    <Camera className="mx-auto mb-2 w-8 h-8" />
                    <div className="text-wrap">
                      {loading ? 'Uploading your Profile Image...' : 'Upload a Passport size Image of Yourself. Ensure that your face covers 60% of this picture.'}
                    </div>
                  </div>
                  <input id="passport-input" type="file" accept="image/*"className="hidden" onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <div className="w-full">
              {/* Full Name */}
              <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
                <div className="text-sm font-light">Full Name</div>
                <div className="text-xl">
                  {studentData?.firstName + " " + studentData?.lastName || "--"}
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
                <div className="text-sm font-light">Email</div>
                <div className="flex justify-between items-center">
                  <div className="text-xl">{studentData?.email || "--"}</div>
                  <CheckCircle className="h-4 w-4 text-[#00CC92]" />
                </div>
              </div>

              {/* Contact No. */}
              <div className="flex flex-col gap-2 border-b md:border-none border-gray-700 py-4">
                <div className="text-sm font-light">Contact No.</div>
                <div className="flex justify-between items-center">
                  <div className="text-xl">{studentData?.mobileNumber || "--"}</div>
                  <CheckCircle className="h-4 w-4 text-[#00CC92]" />
                </div>
              </div>
            </div>
          </div>

          {/* Institute Name */}
          <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
            <div className="text-sm font-light">Institute Name</div>
            <div className="flex justify-between items-center">
              <div className="text-xl">
                {details?.appliedCohorts?.[details?.appliedCohorts.length - 1]?.applicationDetails?.studentDetails?.previousEducation?.nameOfInstitution || "c--"}
              </div>
              <CheckCircle className="h-4 w-4 text-[#00CC92]" />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
            <div className="text-sm font-light">Date of Birth</div>
            <div className="text-xl">
              {studentData?.dateOfBirth
                ? new Date(studentData?.dateOfBirth).toLocaleDateString()
                : "--"}
            </div>
          </div>

          {/* Gender & Blood Group */}
          <div className="flex lg:flex-row flex-col lg:items-center">
            <div className="flex-1 flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-sm font-light">Gender</div>
              <div className="text-xl text-white">{studentData?.gender || "--"}</div>
            </div>
            <div className="flex-1 flex items-center border-b border-gray-700 py-4">
              {studentData?.bloodGroup ? (
                <div className="flex-1 flex flex-col gap-2">
                  <div className="text-sm font-light">Blood Group</div>
                  <div className="text-xl text-white">{studentData?.bloodGroup}</div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-2">
                  <div className="text-sm font-light">Blood Group</div>
                  <input
                    type="text"
                    value={bloodGroupInput}
                    onChange={(e) => setBloodGroupInput(e.target.value)}
                    placeholder="O+"
                    className="bg-transparent text-xl focus-visible:none border-none focus-visible:outline-none focus-border-none w-full"
                  />
                </div>
              )}
                  {!studentData?.bloodGroup &&
                  <Button size={'lg'} className="rounded-lg" onClick={handleBloodGroup}>
                    Save
                  </Button>}
            </div>
          </div>

          {/* LinkedIn ID + Instagram ID */}
          <div className="flex lg:flex-row flex-col justify-between lg:items-center">
            {/* LinkedIn URL */}
            <div className="flex flex-1 justify-between items-center border-b border-gray-700 py-4">
              <div className="flex flex-col space-y-2">
                <div className="text-sm font-light">LinkedIn ID</div>
                {(studentData?.linkedInUrl !== "" && linkedInInput === "") ? (
                  <div className="text-xl">{studentData?.linkedInUrl || "--"}</div>
                ) : (
                  <input
                    value={linkedInInput}
                    onChange={(e) => setLinkedInInput(e.target.value)}
                    placeholder="Enter LinkedIn URL"
                    className="bg-transparent text-muted-foreground text-xl focus-visible:none border-none focus-visible:outline-none focus-border-none w-full"
                  />
                )}
              </div>
              <Button
                className={`${(studentData?.linkedInUrl !== "" && linkedInInput === "") ? "bg-transparent" : ""} rounded-lg`}
                size={(studentData?.linkedInUrl !== "" && linkedInInput === "") ? "icon" : "lg"}
                onClick={() => {
                  if (studentData?.linkedInUrl !== "" && linkedInInput === "") {
                    setLinkedInInput(studentData?.linkedInUrl || "");
                  } else {
                    handleLinkedInSave();
                  }
                }}
              >
                {(studentData?.linkedInUrl !== "" && linkedInInput === "") ? (
                  <Pencil className="h-4 w-4 text-white" />
                ) : (
                  'Save'
                )}
              </Button>
            </div>

            {/* Instagram URL */}
            <div className="flex flex-1 justify-between items-center border-b border-gray-700 py-4">
              <div className="flex flex-col space-y-2">
                <div className="text-sm font-light">Instagram ID</div>
                {(studentData?.instagramUrl !== "" && instagramInput === "") ? (
                  <div className="text-xl">{studentData?.instagramUrl || "--"}</div>
                ) : (
                  <input
                    value={instagramInput}
                    onChange={(e) => setInstagramInput(e.target.value)}
                    placeholder="Enter Instagram URL"
                    className="bg-transparent text-muted-foreground text-xl focus-visible:none border-none focus-visible:outline-none focus-border-none w-full"
                  />
                )}
              </div>
              <Button
                className={`${(studentData?.instagramUrl !== "" && instagramInput === "") ? "bg-transparent" : ""} rounded-lg`}
                size={(studentData?.instagramUrl !== "" && instagramInput === "") ? "icon" : "lg"}
                onClick={() => {
                  if ((studentData?.instagramUrl !== "" && instagramInput === "")) {
                    setInstagramInput(studentData?.instagramUrl || "");
                  } else {
                    handleInstagramSave();
                  }
                }}
              >
                {(studentData?.instagramUrl !== "" && instagramInput === "") ? (
                  <Pencil className="h-4 w-4 text-white" />
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2) LIT ID Card Section */}
      <div className="space-y-6">
        <Card className="relative flex items-center justify-between border p-4 bg-[#64748B1F]">
          <div className="relative flex items-center gap-4">
            <div className="relative group w-16 h-16">
              <img
                src={studentData?.profileUrl || `/assets/images/lit-id-front.svg`}
                alt="LIT ID Card"
                className="w-16 h-16 rounded-xl bg-white py-1"
              />
              {student?.bloodGroup ?
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setOpen(true)}>
                    <Eye className="text-white w-6 h-6" />
                </div> :
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <FileLock className="text-white w-6 h-6" />
                </div>
              }
            </div>
            <div className="flex-1">
              <h4 className="text-xl sm:text-2xl font-medium">LIT ID Card</h4>
              <p className="text-sm sm:text-base">
                {student?.bloodGroup ? 
                  'Carry your identity as a creator, innovator, and learner wherever you go.' : 
                  'Complete filling in your blood group to generate your ID Card'
                }
              </p>
            </div>
          </div>

          {student?.bloodGroup &&
            <Button size="xl" variant="outline" className="flex items-center gap-2" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4" />
              {isGeneratingPDF? 'Downloading...' : 'Download'}
            </Button>
          }
        </Card>

        <div
          style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '400px', }}
          ref={pdfRef}
          id="pdf-content"
        >
          <div className="flex flex-col gap-6 items-center justify-center p-4">
            <div id="front">
              <LitIdFront data={details} />
            </div>
            <div id="back">
              <LitIdBack data={details} ScanUrl="" />
            </div>
          </div>
        </div>


        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl py-2 px-6 h-[90vh] overflow-y-auto">
            <div className="flex gap-4 items-center justify-center">
              <div className="w-1/2">
                <LitIdFront data={studentData} />
              </div>
              <div className="w-1/2">
                <LitIdBack data={studentData} ScanUrl="" />
              </div>
            </div>
            
            <Button size="xl" variant="outline" className="w-fit flex items-center gap-2 mx-auto mt-4"
              onClick={handleDownloadPDF} >
              <Download className="h-4 w-4" />
              {isGeneratingPDF? 'Downloading...' : 'Download'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};