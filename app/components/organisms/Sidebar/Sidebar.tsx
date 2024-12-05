import { Link, NavLink } from "@remix-run/react";
import { FileText, FolderClosed, ReceiptIndianRupee, UploadIcon, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface SidebarProps {
  user: {
    name?: string;
    school?: string;
    avatar?: string;
  };
}

const navItems = [
  {
    title: "Application Documents",
    icon: FolderClosed,
    to: "/dashboard/documents",
    badge: null
  },
  {
    title: "Fee Payment",
    icon: ReceiptIndianRupee,
    to: "/dashboard/payment",
    badge: 1
  },
  {
    title: "Account Details",
    icon: UserRound,
    to: "/dashboard/account",
    badge: null
  },
  {
    title: "Personal Documents",
    icon: FileText,
    to: "/dashboard/personal",
    badge: 1
  }
];

export default function Sidebar({ user }: SidebarProps) {
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
            <h2 className="text -base font-semibold">{user.name}</h2>
            <p className="text-sm text-normal">{user.school}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col h-full flex-1 space-y-2 p-8">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between hover:bg-gray-800 transition-colors ${
                isActive ? "bg-gray-800" : ""
              }`
            }
          >
            <div className="flex items-center text-sm gap-3">
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </div>
            {item.badge && (
              <span className="bg-[#1388FF33] text-white text-[10px] px-2 py-0.5 rounded-md">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
