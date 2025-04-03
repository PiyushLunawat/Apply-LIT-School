import { Link, NavLink } from "@remix-run/react";
import { FileText, FolderClosed, House, ReceiptIndianRupee, UploadIcon, UserRound } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { UserContext } from "~/context/UserContext";
import { getCurrentStudent } from "~/api/studentAPI";

// interface SidebarProps {
//   student: any;
// }

const navItems = [
  {
    title: "Application Documents",
    icon: FileText,
    to: "/dashboard/application-documents",
    badge: null,
    bgColor: "bg-orange-600/20",
    textColor: "text-[#FF791F]"
  },
  {
    title: "Fee Payment",
    icon: ReceiptIndianRupee,
    to: "/dashboard/fee-payment-setup",
    badge: null,
    bgColor: "bg-blue-600/20",
    textColor: "text-[#1388FF]"
  },
  {
    title: "Account Details",
    icon: UserRound,
    to: "/dashboard/account-details",
    badge: null,
    bgColor: "bg-[#F8E000]/20",
    textColor: "text-[#F8E000]"
  },
  {
    title: "Personal Documents",
    icon: FolderClosed,
    to: "/dashboard/personal-documents",
    badge: null,
    bgColor: "bg-emerald-600/20",
    textColor: "text-[#00CC92]"
  }
];

export default function Sidebar() {
  const { studentData } = useContext(UserContext);
  const [student, setStudent] = useState<any>([]);

  useEffect(() => {
    if(studentData?._id)  {
      const fetchStudentData = async () => {
        try {
          const student = await getCurrentStudent(studentData._id); // Pass the actual student ID here
          setStudent(student);          
        } catch (error) {
          console.error("Failed to fetch student data:", error);
        }
      };
      fetchStudentData();
    }
  }, [studentData]);

  return (
  <>
    <div className="hidden sm:block max-w-[300px] lg:max-w-[360px] w-full text-white flex flex-col border-r" style={{ height: `calc(100vh - 52px)`}}>
      {/* User Profile Section */}
      <div className="h-[200px] border-b border-[#2C2C2C]">
        <div className="flex flex-col gap-5 p-8 ">
          <Avatar className="w-[60px] h-[60px]">
            <AvatarImage src={student?.profileUrl} className="object-cover" />
            <AvatarFallback className="uppercase">{student?.firstName?.[0] || '?'}{student?.lastName?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text -base font-semibold">{student?.firstName} {student?.lastName}</h2>
            <p className="text-sm text-normal">{student?.email}</p>
            <p className="text-sm text-normal">{student?.mobileNumber}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col flex-1 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-8 py-4 hover:bg-gray-900 transition-colors ${
                isActive ? `${item.textColor}` : ""
              }`
            }
          >
            <div className="flex items-center text-base gap-3">
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </div>
            {item.badge && (
              <span className={`${item.bgColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-md`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>

    <div className="sm:hidden w-[100vw] h-[65px] text-white bg-[#64748B1A]">
      <div className="flex flex-1 items-center justify-between px-8">
        {navItems.slice(0, 2).map((item) => (
          <NavLink key={item.title} to={item.to}
            className={({ isActive }) => `flex flex-1 items-center justify-center py-4 transition-colors ${isActive ? item.textColor : ""}`}>
            <item.icon className="w-6 h-6" />
          </NavLink>
        ))}
        <NavLink to={'/dashboard'}
          className={({ isActive }) => `flex flex-1 items-center justify-center py-1 transition-colors`}>
            <Avatar className="w-12 h-12">
              <AvatarImage src={student?.profileUrl} className="object-cover" />
              <AvatarFallback className="uppercase">{student?.firstName?.[0] || '?'}{student?.lastName?.[0] || '?'}</AvatarFallback>
            </Avatar>
        </NavLink>
        {navItems.slice(2).map((item, index) => (
          <NavLink key={item.title} to={item.to}
            className={({ isActive }) => `flex flex-1 items-center justify-center py-4 transition-colors ${isActive ? item.textColor : ""}`}>
            <item.icon className="w-6 h-6" />
          </NavLink>
        ))}
      </div>
    </div>
  </>
  );
}
