import { getCurrentStudent } from "~/api/studentAPI";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import ApplicationDocuments from "../components/ApplicationDocuments";
import { Skeleton } from "~/components/ui/skeleton";
import PersonalDetailsTab from "../components/personal-details";
import CourseDiveTab from "../components/course-dive";
import InterviewFeedbackTab from "../components/interview-feedback";
import LitmusTestTab from "../components/litmus-test-d";

import { useSearchParams } from "@remix-run/react"; // 👈 import this

export default function ApplicationDocumentsDashboard() {
  const { studentData } = useContext(UserContext);
  const [student, setStudent] = useState<any>();
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams(); // 👈

  useEffect(() => {
    if (studentData?._id) {
      const fetchStudentData = async () => {
        try {
          const student = await getCurrentStudent(studentData._id);
          setStudent(student);
        } catch (error) {
          console.error("Failed to fetch student data:", error);
        }
      };
      fetchStudentData();
    }
  }, [studentData]);

  // 👇 Sync state to URL query param on tab change
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("selectedTab", tab);
      return newParams;
    });
  };

  // 👇 Read tab from URL on mount or URL change
  useEffect(() => {
    const tabFromUrl = searchParams.get("selectedTab");
    if (tabFromUrl) {
      setSelectedTab(tabFromUrl);
    }
  }, [searchParams]);

  const renderTabContent = () => {
    switch (selectedTab) {
      case "personal-details":
        return <PersonalDetailsTab student={student} onSelectTab={handleTabChange} />;
      case "course-dive":
        return <CourseDiveTab student={student} onSelectTab={handleTabChange} />;
      case "interview-feedback":
        return <InterviewFeedbackTab student={student} onSelectTab={handleTabChange} />;
      case "litmus-test":
        return <LitmusTestTab student={student} onSelectTab={handleTabChange} />;
      default:
        return (
          <>
            <div className="py-8 sm:py-[52px] px-[52px] bg-[#FF791F1A] border-b space-y-4 sm:space-y-8">
              <Badge className="text-sm border-[#FF791F] text-[#FF791F] bg-[#FF791F]/10">
                Application Documents
              </Badge>
              <div className="flex lg:flex-row flex-col gap-2 justify-between items-start lg:items-end">
                <div>
                  {student ? (
                    <h1 className="text-3xl sm:text-4xl font-normal">
                      {student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.programDetail?.name}
                      <div className="text-xl sm:text-2xl">
                        {new Date(
                          student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.startDate
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </h1>
                  ) : (
                    <div className="space-y-2">
                      <Skeleton className="w-[150px] sm:w-[200px] bg-white/10 h-9 " />
                      <Skeleton className="w-[300px] sm:w-[250px] bg-white/10 h-6 " />
                    </div>
                  )}
                </div>
                <p className="max-w-[360px] w-full text-sm sm:text-base">
                  Access all your submission documents, task reports and personal information forms
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <ApplicationDocuments student={student} onSelectTab={handleTabChange} />
            </div>
          </>
        );
    }
  };

  return <div>{renderTabContent()}</div>;
}
