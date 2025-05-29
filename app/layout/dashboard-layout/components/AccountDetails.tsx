/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Camera,
  CheckCircle,
  Download,
  FileLock,
  Plus,
  SquarePen,
} from "lucide-react";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import { updateStudentData } from "~/api/studentAPI";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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
  const { studentData, setStudentData } = useContext(UserContext);
  const [details, setDetails] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  const [uploadCount, setUploadCount] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>("");

  useEffect(() => {
    if (student) {
      setDetails(student);
      setBloodGroupInput(student.bloodGroup || "");
      setLinkedInInput(student?.linkedInUrl || "");
      setEditLinkedInInput(!student?.linkedInUrl);
      setInstagramInput(student?.instagramUrl || "");
      setEditInstagramInput(!student?.instagramUrl);
      setAddSocials(student?.linkedInUrl && student?.instagramUrl);
      // Initialize upload count from student data or localStorage
      const storedCount =
        localStorage.getItem(`uploadCount_${student._id}`) ||
        student.profileUploadCount ||
        0;
      setUploadCount(Number(storedCount));
    }
  }, [student]);

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
        // alert("An error occurred while uploading the image.");
      } finally {
        setLoading(false);
      }
    }
  };

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

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;

    setIsGeneratingPDF(true);

    try {
      // TODO add generate PDF logic here
      console.log("Generating PDF for student:", student._id);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-8 space-y-6">
      {/* User Details Card */}
      <Card className="bg-[#64748B1F] rounded-xl text-white">
        <CardContent className="p-6 ">
          <div className="flex md:flex-row flex-col items-center gap-4 sm:gap-6">
            <div className="w-full sm:w-[250px] h-[285px] bg-[#1F1F1F] flex flex-col items-center justify-center rounded-xl text-sm space-y-4">
              {student?.profileUrl || selectedImage ? (
                <div className="w-full h-full relative">
                  <img
                    src={selectedImage || student?.profileUrl}
                    alt="id card"
                    className="w-full h-full object-cover rounded-lg"
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

      {/* LIT ID Card Section - SIMPLIFIED */}
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
              {!student?.bloodGroup && (
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
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              <Download className="h-4 w-4" />
              {isGeneratingPDF ? "Generating PDF..." : "Download ID Card"}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
