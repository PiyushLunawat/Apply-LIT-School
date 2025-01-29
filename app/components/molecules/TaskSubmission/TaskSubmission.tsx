import React from "react";
import { FileText, Image, Video, Link as LinkIcon, Download, Link2Icon, ArrowUpRight, MousePointer2, File, SquarePlay } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface MediaItem {
  type: "image" | "video" | "file" | "link";
  url: string;
  name?: string;
}

interface TaskSubmissionProps {
  mediaItems: MediaItem[];
}

const TaskSubmission: React.FC<TaskSubmissionProps> = ({ mediaItems }) => {
  return (
    <div className="bg-[#1B1B1C] text-white p-1.5 rounded-xl w-full max-w-md mx-auto">
      <h3 className="text-sm font-normal p-2">Your Task Submission</h3>
      <div className="space-y-1.5">
        {mediaItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-[#09090B] p-1.5 rounded-xl"
          >
            <div className="flex items-center text-base font-normal space-x-3">
                <Badge size={'icon'} className="bg-[#1B1B1C] rounded-lg">
                    {item.type === "file" && <File className="text-white w-4 h-4" />}
                    {item.type === "image" && <Image className="text-white w-4 h-4" />}
                    {item.type === "video" && <SquarePlay className="text-white w-4 h-4" />}
                    {item.type === "link" && <MousePointer2 className="text-white w-4 h-4" />}
                </Badge>
                <span className="w-[200px] sm:w-[300px] truncate">{item.name || item.url}</span>
            </div>
            <Badge size={'icon'} className="bg-[#1B1B1C] rounded-lg">
                {item.type !== "link" ? (
                <a href={item.url} download className="text-white">
                    <Download className="w-4 h-4" />
                </a>
                ) : (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ArrowUpRight className="w-4 h-4" />
                </a>
                )}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskSubmission;
