"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardFooter, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Eye, Download, CheckCircle, Pencil, XIcon, Camera, SaveIcon } from "lucide-react";
import LitIdFront from "~/components/molecules/LitId/LitIdFront";
import LitIdBack from "~/components/molecules/LitId/LitIdBack";
import { UserContext } from "~/context/UserContext";
import { getCurrentStudent } from "~/utils/studentAPI";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Input } from "postcss";


const AccountDetails = () => {
  const [open, setOpen] = useState(false);
  const { studentData, setStudentData } = useContext(UserContext);
  const [details, setDetails] = useState<any>();
  const [loading, setLoading] = useState(false);  

  const [imagePreview, setImagePreview] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [bloodGroupInput, setBloodGroupInput] = useState<string>("");

  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const student = await getCurrentStudent(studentData._id);
        setDetails(student.data);
        setBloodGroupInput(student.data.bloodGroup || "");
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };
    fetchStudentData();
  }, [studentData]);


  // Capture the LitId container (both front/back) and export to PDF.
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;

    try {
      // Capture DOM element as Canvas
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2, // Increase scale for better resolution
      });
      const imgData = canvas.toDataURL("image/png");

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions to fit A4
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgWidth = pdfWidth;
      const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

      // Add captured image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, pdfImgWidth, pdfImgHeight);

      // Save PDF
      pdf.save("LitID.pdf");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  /**
   * Handle saving the selected image
   */
  const handleImageSave = async () => {
    if (!imagePreview) {
      alert("Please select an image to upload.");
      return;
    }
    setLoading(true);
    try {
      // Assuming the API expects form-data for image uploads
      const formData = new FormData();
      formData.append("profileImage", imagePreview);

      const response = await updateStudentData(studentData._id, formData); // Implement this function in studentAPI

      if (response.success) {
        // Update context with new profileUrl
        setStudentData({ ...studentData, profileUrl: response.data.profileUrl });
        setDetails(response.data);
        alert("Profile image updated successfully.");
        // Clean up
        setImagePreview(null);
        setPreviewUrl("");
      } else {
        alert("Failed to update profile image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("An error occurred while uploading the image.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle blood group save
   */
  const handleBloodGroup = async () => {
    if (!bloodGroupInput) {
      alert("Please enter your blood group.");
      return;
    }

    setLoading(true);

    try {
      const response = await updateStudentData(studentData._id, { bloodGroup: bloodGroupInput }); // Implement this function in studentAPI

      if (response.success) {
        setDetails(response.data);
        setStudentData({ ...studentData, bloodGroup: response.data.bloodGroup });
        alert("Blood group updated successfully.");
      } else {
        alert("Failed to update blood group.");
      }
    } catch (error) {
      console.error("Error updating blood group:", error);
      alert("An error occurred while updating the blood group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 text-white">
      {/* 1) User Details Card */}
      <Card className="bg-[#64748B1F] rounded-xl text-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
             <div className="w-full sm:w-[232px] h-[308px] bg-[#1F1F1F] flex flex-col items-center justify-center rounded-xl text-sm space-y-4">
              {previewUrl ? (
                <div className="w-full h-full relative">
                  <img
                    src={previewUrl}
                    alt="Passport Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      className="p-2 bg-white/10 mix-blend-difference border border-white rounded-full hover:bg-white/20"
                      onClick={() => {
                        setImagePreview(null);
                        setPreviewUrl('')
                      }}
                    >
                      <XIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 flex space-x-2">
                    <button
                      className="flex gap-1 items-center p-2 bg-white/10 mix-blend-difference border border-white rounded-full hover:bg-white/20"
                      onClick={() => {handleImageSave()
                      }}
                    >
                      <SaveIcon className="w-5 h-5 text-white" />Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                <label
                  htmlFor="passport-input"
                  className="cursor-pointer flex flex-col items-center justify-center items-center bg-[#1F1F1F] px-6 rounded-xl border-[#2C2C2C] w-full h-[220px]"
                >
                  <div className="text-center my-auto text-muted-foreground">
                    <Camera className="mx-auto mb-2 w-8 h-8" />
                    <div className="text-wrap">
                      Upload a Passport size Image of Yourself. Ensure that your face covers
                      60% of this picture.
                    </div>
                  </div>
                  <input
                    id="passport-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImagePreview(file);
                        // setPreviewUrl(imageUrl);
                        setStudentData({ ...studentData, profileUrl: file });
                      }
                    }}
                  />
                </label>
                </>
              )}
            </div>
            <div className="">
              {/* Full Name */}
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-normal">Full Name</div>
                  <div className="text-xl">
                    {details?.firstName + " " + details?.lastName || "--"}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <div className="text-sm ">Email</div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <div className="text-xl">{details?.email || "--"}</div>
                  <CheckCircle className="h-4 w-4 text-[#00CC92]" />
                </div>
              </div>

              {/* Contact No. */}
              <div className="flex flex-col gap-2">
                <div className="text-sm ">Contact No.</div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <div className="text-xl">{details?.mobileNumber || "--"}</div>
                  <CheckCircle className="h-4 w-4 text-[#00CC92]" />
                </div>
              </div>
            </div>
          </div>

          {/* Institute Name */}
          <div className="flex flex-col gap-2">
            <div className="text-sm ">Institute Name</div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <div className="text-xl">
                {
                  details?.applicationDetails?.studenDetails?.previousEducation
                    ?.nameOfInstitution || "--"
                }
              </div>
              <CheckCircle className="h-4 w-4 text-[#00CC92]" />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <div className="flex flex-col gap-2">
              <div className="text-sm ">Date of Birth</div>
              <div className="text-xl">
                {details?.dateOfBirth
                  ? new Date(details?.dateOfBirth).toDateString()
                  : "--"}
              </div>
            </div>
          </div>

          {/* Gender & Blood Group */}
          <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
            <div className="flex-1 space-y-2">
              <div className="text-sm ">Gender</div>
              <div className="text-xl text-white">{details?.gender || "--"}</div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="text-sm ">Blood Group</div>
              {details?.bloodGroup ?
                <div className="text-xl text-white">{details?.gender}</div> : 
                <div className="flex justify-between items-center">
                  <input className="border-none"/>
                  <Button size={'sm'} className="" onClick={()=> handleBloodGroup()}>Save</Button>
                </div>
              }
            </div>
          </div>

          {/* LinkedIn ID + Instagram ID */}
          <div className="flex justify-between items-center gap-2 border-b border-gray-700 pb-2">
            <div className="flex flex-1 justify-between items-center">
              <div className="flex flex-col">
                <div className="text-sm ">LinkedIn ID</div>
                <div className="text-xl">{details?.linkedInUrl || "--"}</div>
              </div>
              <Button
                className="bg-transparent rounded-md"
                variant="ghost"
                size="icon"
              >
                <Pencil className="h-4 w-4 text-white" />
              </Button>
            </div>
            <div className="flex flex-1 justify-between items-center">
              <div className="flex flex-col">
                <div className="text-sm ">Instagram ID</div>
                <div className="text-xl">{details?.instagramUrl || "--"}</div>
              </div>
              <Button
                className="bg-transparent rounded-md"
                variant="ghost"
                size="icon"
              >
                <Pencil className="h-4 w-4 text-white" />
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
                src="/assets/images/lit-id-front.svg"
                alt="LIT ID Card"
                className="w-16 h-16 rounded-xl bg-white py-1"
              />
              {/* Eye icon overlay to open modal */}
              <div
                className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <Eye className="text-white w-6 h-6" />
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-medium">LIT ID Card</h4>
              <p className="text-base">
                Carry your identity as a creator, innovator, and learner wherever
                you go.
              </p>
            </div>
          </div>

          <Button
            size="xl"
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </Card>

        <div className="hidden" ref={pdfRef} id="pdf-content">
          <div className="flex flex-col gap-6 items-center justify-center p-4">
            <LitIdFront data={details} ImageUrl="https://github.com/shadcn.png" />
            <LitIdBack data={details} ScanUrl="" />
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl py-2 px-6 h-[90vh] overflow-y-auto">
            <div className="flex gap-4 items-center justify-center">
              <div className="w-1/2">
                <LitIdFront
                  data={details}
                  ImageUrl="https://github.com/shadcn.png"
                />
              </div>
              <div className="w-1/2">
                <LitIdBack data={details} ScanUrl="" />
              </div>
            </div>
            {/* If you also want a Download Button inside the dialog */}
            <Button
              size="xl"
              variant="outline"
              className="w-fit flex items-center gap-2 mx-auto mt-4"
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AccountDetails;
