import { Link, NavLink } from "@remix-run/react";
import { FileText, FolderClosed, House, ReceiptIndianRupee, UploadIcon, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface SidebarProps {
  student: any;
}

const navItems = [
  {
    title: "Home",
    icon: House,
    to: "/dashboard",
    badge: null
  },
  {
    title: "Application Documents",
    icon: FolderClosed,
    to: "/dashboard/application-documents",
    badge: 1,
    bgColor: "bg-orange-600/20"
  },
  {
    title: "Fee Payment",
    icon: ReceiptIndianRupee,
    to: "/dashboard/fee-payment-setup",
    badge: 1,
    bgColor: "bg-blue-600/20"
  },
  {
    title: "Account Details",
    icon: UserRound,
    to: "/dashboard/account-details",
    badge: 1,
    bgColor: "bg-[#F8E000]/20"
  },
  {
    title: "Personal Documents",
    icon: FileText,
    to: "/dashboard/personal-documents",
    badge: 1,
    bgColor: "bg-emerald-600/20"
  }
];

export default function Sidebar({ student }: SidebarProps) {
  return (
    <div className="max-w-[360px] w-full text-white flex flex-col border-r" style={{ height: `calc(100vh - 52px)`}}>
      {/* User Profile Section */}
      <div className="h-[200px] border-b border-[#2C2C2C]">
        <div className="flex flex-col gap-5 p-8 mt-5">
          <Avatar className="w-[60px] h-[60px]">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text -base font-semibold">{student?.firstName}</h2>
            <p className="text-sm text-normal">{student?.studentDetails?.previousEducation?.nameOfInstitution}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col h-full flex-1 space-y-2 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-8 py-2 hover:bg-gray-900 transition-colors ${
                isActive ? "bg-gray-800" : ""
              }`
            }
          >
            <div className="flex items-center text-base gap-3">
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </div>
            {item.badge && (
              <span className={`${item.bgColor} text-white text-[10px] px-2 py-0.5 rounded-md`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
