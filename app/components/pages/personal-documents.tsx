import ApplicationHome from "~/components/pages/application";
import { Link } from "@remix-run/react";
import { Clock, ClockArrowUp, FileText, FolderClosed, ReceiptIndianRupee, UserIcon } from "lucide-react";
import Header from "../organisms/Header/Header";
import Sidebar from "../organisms/Sidebar/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import PersonalDocuments from "../organisms/PersonalDocuments/PersonalDocuments";

export default function PersonalDocumentsDashboard() {
  const user = {
    name: "John Walker",
    school: "LIT School"
  };

  return (
  <>
  <Header subtitle={false} classn="" />
  <div className="flex">
    <Sidebar user={user}/>
    <div className="w-full overflow-y-auto" style={{ height: `calc(100vh - 52px)`}}>
      <div className="flex justify-between items-end p-[52px] bg-[#00CC921A] border-b">
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <Badge className="text-sm border-[#00CC92] text-[#00CC92] bg-[#00CC92]/10">
              Personal Documents
            </Badge>
          </div>
          <h1 className="text-4xl font-normal">
            Creator Marketer
            <div className="text-2xl">October, 2024</div>
          </h1>
        </div>
        <p className="max-w-[360px] w-full text-base ">
        Maintain all your personal Identification Documents for this course.
        </p>
      </div>
      <PersonalDocuments />

    </div>
    </div>
  </>
  );
}