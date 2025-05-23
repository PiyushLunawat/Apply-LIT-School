"use client";

import {
  Camera,
  CheckCircle,
  Download,
  Eye,
  FileLock,
  Plus,
  SquarePen,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import type React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { updateStudentData } from "~/api/studentAPI";
import LitIdBack from "~/components/molecules/LitId/LitIdBack";
import LitIdFront from "~/components/molecules/LitId/LitIdFront";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { UserContext } from "~/context/UserContext";

interface AccountDetailsProps {
  student: any;
}

export default function AccountDetails({ student }: AccountDetailsProps) {
  const latestCohort =
    student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;

  const [open, setOpen] = useState(false);
  const { studentData, setStudentData } = useContext(UserContext);
  const [details, setDetails] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [bloodGroupInput, setBloodGroupInput] = useState<string>("");
  const [bloodGroupError, setBloodGroupError] = useState<string>("");
  const [linkedInInput, setLinkedInInput] = useState<string>("");
  const [linkedInError, setLinkedInError] = useState<string>("");
  const [editLinkedInInput, setEditLinkedInInput] = useState<boolean>(
    student?.linkedInUrl
  );
  const [instagramInput, setInstagramInput] = useState<string>("");
  const [instagramError, setInstagramError] = useState<string>("");
  const [editInstagramInput, setEditInstagramInput] = useState<boolean>(
    student?.instagramUrl
  );
  const [addSocials, setAddSocials] = useState<boolean>(false);

  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const hiddenFrontCardRef = useRef<HTMLDivElement>(null);
  const hiddenBackCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (student) {
      setDetails(student);
      setBloodGroupInput(student.bloodGroup || "");
      setLinkedInInput(student?.linkedInUrl || "");
      setEditLinkedInInput(!student?.linkedInUrl);
      setInstagramInput(student?.instagramUrl || "");
      setEditInstagramInput(!student?.instagramUrl);
      setAddSocials(student?.linkedInUrl && student?.instagramUrl);
    }
  }, [student]);

  // Function to capture components as images and create PDF
  const captureComponentsAndCreatePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      // Create hidden container for rendering components
      const hiddenContainer = document.createElement("div");
      hiddenContainer.style.position = "absolute";
      hiddenContainer.style.left = "-9999px";
      hiddenContainer.style.top = "-9999px";
      hiddenContainer.style.width = "400px"; // Match component width
      hiddenContainer.style.height = "590.11px"; // Match component height
      document.body.appendChild(hiddenContainer);

      // Create front card container
      const frontCardContainer = document.createElement("div");
      frontCardContainer.style.width = "400px";
      frontCardContainer.style.height = "590.11px";
      hiddenContainer.appendChild(frontCardContainer);

      // Create back card container
      const backCardContainer = document.createElement("div");
      backCardContainer.style.width = "400px";
      backCardContainer.style.height = "590.11px";
      hiddenContainer.appendChild(backCardContainer);

      // Render components in hidden containers
      const ReactDOM = (await import("react-dom")).default;
      ReactDOM.render(<LitIdFront data={student} />, frontCardContainer);
      ReactDOM.render(<LitIdBack data={student} />, backCardContainer);

      // Wait for components to render and images to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fix image CORS issues by adding crossOrigin attribute to all images
      const images = hiddenContainer.querySelectorAll("img");
      images.forEach((img) => {
        img.crossOrigin = "anonymous";
      });

      // Wait for images to load
      await Promise.all(
        Array.from(images).map((img) => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => {
                console.error("Image failed to load:", img.src);
                resolve(false);
              };
            }
          });
        })
      );

      // Use html2canvas to capture the components
      const html2canvas = (await import("html2canvas")).default;

      // Capture front card
      console.log("Capturing front card...");
      const frontCanvas = await html2canvas(frontCardContainer, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
      });

      // Capture back card
      console.log("Capturing back card...");
      const backCanvas = await html2canvas(backCardContainer, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
      });

      // Clean up hidden container
      document.body.removeChild(hiddenContainer);

      // Convert canvases to image data URLs
      const frontImageData = frontCanvas.toDataURL("image/png", 1.0);
      const backImageData = backCanvas.toDataURL("image/png", 1.0);

      // Create PDF with pdf-lib
      const pdfDoc = await PDFDocument.create();

      // Add pages with the same aspect ratio as the cards
      // Use actual dimensions of the ID card (400px × 590.11px)
      const aspectRatio = 590.11 / 400;
      const width = 400 * 0.75; // Convert px to points (1px ≈ 0.75pt)
      const height = width * aspectRatio;

      const frontPage = pdfDoc.addPage([width, height]);
      const backPage = pdfDoc.addPage([width, height]);

      // Convert data URLs to PDF-compatible images
      const frontImageBytes = await fetch(frontImageData).then((res) =>
        res.arrayBuffer()
      );
      const backImageBytes = await fetch(backImageData).then((res) =>
        res.arrayBuffer()
      );

      const frontImage = await pdfDoc.embedPng(frontImageBytes);
      const backImage = await pdfDoc.embedPng(backImageBytes);

      // Draw images on pages, fitting to page dimensions
      frontPage.drawImage(frontImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });

      backPage.drawImage(backImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });

      // Save the PDF
      const pdfBytes = await pdfDoc.save();

      // Download the PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `LIT_ID_Card_${student?.firstName || "Student"}_${
        student?.lastName || ""
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      console.log("PDF generated successfully!");
      setIsGeneratingPDF(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGeneratingPDF(false);
      alert(`Failed to generate PDF: ${error.message}. Please try again.`);
    }
  };

  // Alternative approach using visible components
  const captureVisibleComponentsAndCreatePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      // First, ensure the dialog is open
      if (!open) {
        setOpen(true);
        // Wait for the dialog to open and components to render
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Check if refs are available
      if (!frontCardRef.current || !backCardRef.current) {
        throw new Error(
          "Card components not found. Please try opening the preview first."
        );
      }

      // Fix image CORS issues by adding crossOrigin attribute to all images
      const frontImages = frontCardRef.current.querySelectorAll("img");
      const backImages = backCardRef.current.querySelectorAll("img");

      const allImages = [...Array.from(frontImages), ...Array.from(backImages)];
      allImages.forEach((img) => {
        img.crossOrigin = "anonymous";
      });

      // Wait for images to load
      await Promise.all(
        allImages.map((img) => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => {
                console.error("Image failed to load:", img.src);
                resolve(false);
              };
            }
          });
        })
      );

      // Use html2canvas to capture the components
      const html2canvas = (await import("html2canvas")).default;

      // Capture front card
      console.log("Capturing front card...");
      const frontCanvas = await html2canvas(frontCardRef.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
      });

      // Capture back card
      console.log("Capturing back card...");
      const backCanvas = await html2canvas(backCardRef.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
      });

      // Convert canvases to image data URLs
      const frontImageData = frontCanvas.toDataURL("image/png", 1.0);
      const backImageData = backCanvas.toDataURL("image/png", 1.0);

      // Create PDF with pdf-lib
      const pdfDoc = await PDFDocument.create();

      // Add pages with the same aspect ratio as the cards
      // Use actual dimensions of the ID card (400px × 590.11px)
      const aspectRatio = 590.11 / 400;
      const width = 400 * 0.75; // Convert px to points (1px ≈ 0.75pt)
      const height = width * aspectRatio;

      const frontPage = pdfDoc.addPage([width, height]);
      const backPage = pdfDoc.addPage([width, height]);

      // Convert data URLs to PDF-compatible images
      const frontImageBytes = await fetch(frontImageData).then((res) =>
        res.arrayBuffer()
      );
      const backImageBytes = await fetch(backImageData).then((res) =>
        res.arrayBuffer()
      );

      const frontImage = await pdfDoc.embedPng(frontImageBytes);
      const backImage = await pdfDoc.embedPng(backImageBytes);

      // Draw images on pages, fitting to page dimensions
      frontPage.drawImage(frontImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });

      backPage.drawImage(backImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });

      // Save the PDF
      const pdfBytes = await pdfDoc.save();

      // Download the PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `LIT_ID_Card_${student?.firstName || "Student"}_${
        student?.lastName || ""
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      console.log("PDF generated successfully!");
      setIsGeneratingPDF(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGeneratingPDF(false);
      alert(`Failed to generate PDF: ${error.message}. Please try again.`);
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle blood group save
  const handleBloodGroup = async () => {
    if (!bloodGroupInput) {
      setBloodGroupError("Please select a blood group");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("bloodGroup", bloodGroupInput);

      const response = await updateStudentData(formData);
      console.log(response, "response blood");

      if (response.status) {
        setDetails(response.data);
        setStudentData({
          ...studentData,
          bloodGroup: response.data.bloodGroup,
        });
        setBloodGroupInput(response.data.bloodGroup);
        setBloodGroupError("");
      }
    } catch (error) {
      console.error("Error updating blood group:", error);
      setBloodGroupError("An error occurred while updating the blood group.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSave = async () => {
    const isValidLinkedIn = (url: string) => {
      if (!url) return true;
      return (
        typeof url === "string" &&
        /^https:\/\/(www\.)?linkedin\.com\/.+$/.test(url)
      );
    };

    if (!isValidLinkedIn(linkedInInput)) {
      setLinkedInError("Invalid LinkedIn URL");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("linkedInUrl", linkedInInput);
      const response = await updateStudentData(formData);

      if (response.status) {
        setStudentData({ ...studentData, linkedInUrl: linkedInInput });
        setEditLinkedInInput(false);
        setLinkedInError("");
      }
    } catch (error) {
      console.error("Error updating LinkedIn URL:", error);
      setLinkedInError("Failed to update LinkedIn URL.");
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
        setEditInstagramInput(false);
        setInstagramError("");
      }
    } catch (error) {
      console.error("Error updating Instagram URL:", error);
      setInstagramError("Failed to update Instagram URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-8 space-y-6">
      {/* Hidden components for rendering */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={hiddenFrontCardRef}>
          <LitIdFront data={student} />
        </div>
        <div ref={hiddenBackCardRef}>
          <LitIdBack data={student} />
        </div>
      </div>

      {/* 1) User Details Card */}
      <Card className="bg-[#64748B1F] rounded-xl text-white">
        <CardContent className="p-6 ">
          <div className="flex md:flex-row flex-col items-center gap-4 sm:gap-6">
            <div className="w-full sm:w-[250px] h-[285px] bg-[#1F1F1F] flex flex-col items-center justify-center rounded-xl text-sm space-y-4">
              {student?.profileUrl || selectedImage ? (
                <div className="w-full h-full relative">
                  <img
                    src={selectedImage || student?.profileUrl}
                    alt="Profile Image"
                    className="w-full h-full object-cover rounded-lg"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <label
                  htmlFor="passport-input"
                  className="cursor-pointer flex flex-col items-center justify-center bg-[#1F1F1F] px-6 rounded-xl border-[#2C2C2C] w-full h-[220px]"
                >
                  <div className="text-center my-auto text-muted-foreground">
                    <Camera className="mx-auto mb-2 w-8 h-8" />
                    <div className="text-wrap">
                      {loading
                        ? "Uploading your Profile Image..."
                        : "Upload a Passport size Image of Yourself. Ensure that your face covers 60% of this picture."}
                    </div>
                  </div>
                  <input
                    id="passport-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <div className="w-full">
              {/* Full Name */}
              <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
                <div className="text-xs sm:text-sm font-light">Full Name</div>
                <div className="text-base sm:text-xl">
                  {student
                    ? `${student?.firstName} ${student?.lastName}`
                    : "--"}
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
                <div className="text-xs sm:text-sm font-light">Email</div>
                <div className="flex justify-between items-center">
                  <div className="text-base sm:text-xl">
                    {student?.email || "--"}
                  </div>
                  <CheckCircle className="h-4 w-4 text-[#00CC92]" />
                </div>
              </div>

              {/* Contact No. */}
              <div className="flex flex-col gap-2 border-b md:border-none border-gray-700 py-4">
                <div className="text-xs sm:text-sm font-light">Contact No.</div>
                <div className="flex justify-between items-center">
                  <div className="text-base sm:text-xl">
                    {student?.mobileNumber || "--"}
                  </div>
                  <CheckCircle className="h-4 w-4 text-[#00CC92]" />
                </div>
              </div>
            </div>
          </div>

          {/* Institute Name */}
          <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
            <div className="text-xs sm:text-sm font-light">Institute Name</div>
            <div className="flex justify-between items-center">
              <div className="text-base sm:text-xl">
                {details?.appliedCohorts?.[details?.appliedCohorts.length - 1]
                  ?.applicationDetails?.studentDetails?.previousEducation
                  ?.nameOfInstitution || "--"}
              </div>
              <CheckCircle className="h-4 w-4 text-[#00CC92]" />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
            <div className="text-xs sm:text-sm font-light">Date of Birth</div>
            <div className="text-base sm:text-xl">
              {student?.dateOfBirth
                ? new Date(student?.dateOfBirth).toLocaleDateString()
                : "--"}
            </div>
          </div>

          {/* Gender & Blood Group */}
          <div className="flex lg:flex-row flex-col lg:border-b border-gray-700 lg:items-center">
            <div className="flex-1 flex flex-col gap-2 lg:border-none border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Gender</div>
              <div className="text-base sm:text-xl text-white">
                {student?.gender || "--"}
              </div>
            </div>
            <div className="flex-1 flex items-center lg:border-none border-b border-gray-700 py-4">
              {student?.bloodGroup ? (
                <div className="flex-1 flex flex-col gap-2">
                  <div className="text-xs sm:text-sm font-light">
                    Blood Group
                  </div>
                  <div className="text-base sm:text-xl text-white">
                    {student?.bloodGroup}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-2">
                  <div className="text-xs sm:text-sm font-light">
                    Blood Group
                  </div>
                  <Select
                    value={bloodGroupInput}
                    onValueChange={setBloodGroupInput}
                  >
                    <SelectTrigger className="bg-transparent border-none text-base sm:text-xl focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                  {bloodGroupError && (
                    <div className="text-sm text-[#FF503D]">
                      {bloodGroupError}
                    </div>
                  )}
                </div>
              )}
              {!student?.bloodGroup && (
                <Button
                  size={"lg"}
                  className="rounded-lg"
                  onClick={handleBloodGroup}
                >
                  Save
                </Button>
              )}
            </div>
          </div>

          {/* LinkedIn ID + Instagram ID */}
          <div className="flex lg:flex-row flex-col justify-between lg:border-b border-gray-700 lg:items-center">
            {/* LinkedIn URL */}
            {(addSocials || student?.linkedInUrl) && (
              <div className="flex flex-1 justify-between items-center lg:border-none border-b border-gray-700 py-4">
                <div className="flex flex-1 flex-col space-y-2">
                  <div className="text-xs sm:text-sm font-light">
                    LinkedIn ID
                  </div>
                  <input
                    readOnly={!editLinkedInInput}
                    value={linkedInInput}
                    onChange={(e) => setLinkedInInput(e.target.value)}
                    placeholder="Enter LinkedIn URL"
                    className="bg-transparent text-white text-base sm:text-xl focus-visible:none border-none focus-visible:outline-none focus-border-none w-full"
                  />
                  {linkedInError && (
                    <div className="text-sm text-[#FF503D]">
                      {linkedInError}
                    </div>
                  )}
                </div>
                <Button
                  className={`${
                    editLinkedInInput ? "" : "bg-transparent hover:bg-[#09090b]"
                  } rounded-lg lg:mr-4`}
                  size={editLinkedInInput ? "lg" : "icon"}
                  onClick={() => {
                    if (editLinkedInInput) {
                      handleLinkedInSave();
                    } else {
                      setEditLinkedInInput(true);
                    }
                  }}
                >
                  {editLinkedInInput ? (
                    "Save"
                  ) : (
                    <SquarePen className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Instagram URL */}
            {(addSocials || student?.instagramUrl) && (
              <div className="flex flex-1 justify-between items-center lg:border-none border-b border-gray-700 py-4">
                <div className="flex flex-1 flex-col space-y-2">
                  <div className="text-xs sm:text-sm font-light">
                    Instagram ID
                  </div>
                  <input
                    readOnly={!editInstagramInput}
                    value={instagramInput}
                    onChange={(e) => setInstagramInput(e.target.value)}
                    placeholder="Enter Instagram URL"
                    className="bg-transparent text-base sm:text-xl focus-visible:none border-none focus-visible:outline-none focus-border-none w-full"
                  />
                  {instagramError && (
                    <div className="text-sm text-[#FF503D]">
                      {instagramError}
                    </div>
                  )}
                </div>
                <Button
                  className={`${
                    editInstagramInput
                      ? ""
                      : "bg-transparent hover:bg-[#09090b]"
                  } rounded-lg`}
                  size={editInstagramInput ? "lg" : "icon"}
                  onClick={() => {
                    if (editInstagramInput) {
                      handleInstagramSave();
                    } else {
                      setEditInstagramInput(true);
                    }
                  }}
                >
                  {editInstagramInput ? (
                    "Save"
                  ) : (
                    <SquarePen className="flex-1 h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
          {!addSocials && (
            <Button
              size={"xl"}
              className="w-full sm:w-fit my-2"
              onClick={() => setAddSocials(true)}
            >
              <Plus className="h-4 w-4" /> Add Social
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 2) LIT ID Card Section */}
      <div className="space-y-6">
        <Card className="relative flex flex-col lg:flex-row gap-3 items-center justify-between border p-4 bg-[#64748B1F]">
          <div className="relative flex items-center gap-4">
            <div className="relative group w-16 h-16">
              <img
                src={student?.profileUrl || `/assets/images/lit-id-front.svg`}
                alt="LIT ID Card"
                className="w-16 h-16 rounded-xl bg-white py-1"
                crossOrigin="anonymous"
              />
              {student?.bloodGroup ? (
                <div
                  className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setOpen(true)}
                >
                  <Eye className="text-white w-6 h-6" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <FileLock className="text-white w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-xl sm:text-2xl font-medium">LIT ID Card</h4>
              <p className="text-sm sm:text-base">
                {student?.bloodGroup
                  ? "Carry your identity as a creator, innovator, and learner wherever you go."
                  : "Complete filling in your blood group to generate your ID Card"}
              </p>
            </div>
          </div>

          {student?.bloodGroup && (
            <Button
              size="xl"
              variant="outline"
              className="flex w-full lg:w-fit items-center gap-2"
              onClick={captureComponentsAndCreatePDF}
            >
              <Download className="h-4 w-4" />
              {isGeneratingPDF ? "Generating PDF..." : "Download"}
            </Button>
          )}
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTitle></DialogTitle>
          <DialogContent className="flex justify-center items-start max-w-[90vw] sm:max-w-4xl py-2 px-6 max-h-[70vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row mx-auto gap-4 items-center justify-center">
                <div className="w-1/2 sm:w-full" ref={frontCardRef}>
                  <LitIdFront data={student} />
                </div>
                <div className="w-1/2 sm:w-full" ref={backCardRef}>
                  <LitIdBack data={student} />
                </div>
              </div>

              <Button
                size="xl"
                variant="outline"
                className="w-fit flex items-center gap-2 mx-auto mt-4"
                onClick={captureVisibleComponentsAndCreatePDF}
              >
                <Download className="h-4 w-4" />
                {isGeneratingPDF ? "Generating PDF..." : "Download"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
