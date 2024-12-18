"use client";

import { useState } from "react";
import { Card, CardHeader, CardFooter, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Pencil, Download, Eye, Check, CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import LitIdFront from "~/components/molecules/LitId/LitIdFront";
import LitIdBack from "~/components/molecules/LitId/LitIdBack";

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

  return (
    <div className="p-8 space-y-6">
      {/* User Details Card */}
      <Card className="bg-[#64748B1F] rounded-xl text-white">
      <CardContent className="p-6 space-y-4">
        {/* Full Name */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-normal">Full Name</div>
            <div className="text-xl">John Doe</div>
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
            <div className="text-sm ">Email</div>
           <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <div className="text-xl">johndoe@gmail.com</div>
            <CheckCircle className="h-4 w-4 text-[#00CC92]" />
          </div>
        </div>

        {/* Contact No. */}
        <div className="flex flex-col gap-2">
          <div className="text-sm ">Contact No.</div>
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <div className="text-xl">+91 95568 97688</div>
            <CheckCircle className="h-4 w-4 text-[#00CC92]" />
          </div>
        </div>

        {/* Institute Name */}
        <div className="flex flex-col gap-2">
          <div className="text-sm ">Institute Name</div>
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <div className="text-xl">LIT School</div>
            <CheckCircle className="h-4 w-4 text-[#00CC92]" />
          </div>
        </div>

        {/* Date of Birth */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <div className="flex flex-col gap-2">
            <div className="text-sm ">Date of Birth</div>
            <div className="text-xl">08 March, 2000</div>
          </div>
        </div>

        {/* Gender & Blood Group */}
        <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
          <div className="flex-1 space-y-2">
            <div className="text-sm ">Gender</div>
            <div className="text-xl text-white">Male</div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="text-sm ">Blood Group</div>
            <div className="text-xl text-white">O+</div>
          </div>
        </div>

        {/* LinkedIn ID */}
        <div className="flex justify-between items-center gap-2 border-b border-gray-700 pb-2">
          <div className="flex flex-1 justify-between items-center">
            <div className="flex flex-col">
              <div className="text-sm ">LinkedIn ID</div>
              <div className="text-xl">John Doe</div>
             </div>
              <Button className="bg-transparent rounded-md" variant="ghost" size="icon">
                <Pencil className="h-4 w-4 text-white" />
              </Button>
          </div>  
          <div className="flex flex-1 justify-between items-center">
            <div className="flex flex-col">
              <div className="text-sm ">Instagram ID</div>
              <div className="text-xl">@JohnDoe</div>
            </div>
              <Button className="bg-transparent rounded-md" variant="ghost" size="icon">
                <Pencil className="h-4 w-4 text-white" />
              </Button>
          </div>
        </div>
      </CardContent>
    </Card>


      <div className="space-y-6">
      <Card className="relative flex items-center justify-between border p-4 bg-[#64748B1F] ">
        <div className="relative flex items-center gap-4">
          <div className="relative group w-16 h-16">
            <img
              src="/assets/images/lit-id-front.svg"
              alt="LIT ID Card"
              className="w-16 h-16 rounded-xl bg-white py-1"
            />
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <Eye className="text-white w-6 h-6" />
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-medium">LIT ID Card</h4>
            <p className="text-base ">
              Carry your identity as a creator, innovator, and learner wherever you go.
            </p>
          </div>
        </div>

        {/* Download Button */}
        <Button size="xl" variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </Card>

      {/* Dialog to Display Full ID Card */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl py-2 px-6 h-[90vh] overflow-y-auto">
          <div className="flex gap-4 items-center justify-center">
            <div className="w-1/2">
              <LitIdFront ImageUrl="https://github.com/shadcn.png" />
            </div>
            <div className="w-1/2 ">
              <LitIdBack ScanUrl=""/>
            </div>
          </div>
          <Button size="xl" variant="outline" className="w-fit flex items-center gap-2 mx-auto mt-4">
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
