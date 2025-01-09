"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardFooter, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Eye, Download, CheckCircle, Pencil } from "lucide-react";
import LitIdFront from "~/components/molecules/LitId/LitIdFront";
import LitIdBack from "~/components/molecules/LitId/LitIdBack";
import { UserContext } from "~/context/UserContext";
import { getCurrentStudent } from "~/utils/studentAPI";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Input } from "postcss";

interface UserDetails {
  fullName: string;
  email: string;
  contactNumber: string;
  instituteName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  linkedinID: string;
}

const AccountDetails = () => {
  const [open, setOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    fullName: "John Doe",
    email: "johndoe~gmail.com",
    contactNumber: "+91 95568 97688",
    instituteName: "LIT School",
    dateOfBirth: "08 March, 2000",
    gender: "Male",
    bloodGroup: "O+",
    linkedinID: "John Doe",
  });

  const { studentData } = useContext(UserContext);
  const [details, setDetails] = useState<any>();
  const [loading, setLoading] = useState(false);  

  // Reference to the container that holds both LitIdFront and LitIdBack
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const student = await getCurrentStudent(studentData._id);
        setDetails(student.data);
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };
    fetchStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData]);

  /**
   * Capture the LitId container (both front/back) and export to PDF.
   */
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

      // Add captured image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, 0); 
      // The last argument '0' for height means auto-scale the image within the PDF width.

      // Save PDF
      pdf.save("LitID.pdf");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  return (
    <div className="p-8 space-y-6 text-white">
      {/* 1) User Details Card */}
      <Card className="bg-[#64748B1F] rounded-xl text-white">
        <CardContent className="p-6 space-y-4">
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
              {details?.gender ?
                <div className="text-xl text-white">{details?.gender}</div> : 
                <div className="flex justify-between "
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
