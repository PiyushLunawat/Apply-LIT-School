"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

interface SimpleIdCardGeneratorProps {
  student: any;
  className?: string;
}

export default function SimpleIdCardGenerator({
  student,
  className,
}: SimpleIdCardGeneratorProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    if (!student?.bloodGroup) {
      alert("Please add your blood group first to generate your ID card.");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import("html2pdf.js")).default;

      // Create a simple HTML structure for the ID card
      const container = document.createElement("div");

      document.body.appendChild(container);

      // Front card
      const frontCard = document.createElement("div");
      frontCard.style.width = "100%";
      frontCard.style.height = "590px";

      // Profile image container
      const imageContainer = document.createElement("div");
      imageContainer.style.width = "100%";
      imageContainer.style.height = "300px";
      imageContainer.style.backgroundColor = "#f0f0f0";
      imageContainer.style.display = "flex";
      imageContainer.style.alignItems = "center";
      imageContainer.style.justifyContent = "center";

      // Profile image or placeholder
      if (student?.profileUrl) {
        const img = document.createElement("img");
        img.src = student.profileUrl;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.crossOrigin = "anonymous";
        imageContainer.appendChild(img);
      } else {
        const placeholderText = document.createElement("div");
        placeholderText.textContent = `${student?.firstName || ""} ${
          student?.lastName || ""
        }`;
        placeholderText.style.fontSize = "24px";
        placeholderText.style.fontWeight = "bold";
        imageContainer.appendChild(placeholderText);
      }

      frontCard.appendChild(imageContainer);

      // Info section
      const infoSection = document.createElement("div");
      infoSection.style.padding = "20px";

      // ID Badge
      const idBadge = document.createElement("div");
      idBadge.style.display = "inline-block";
      idBadge.style.padding = "5px 10px";
      idBadge.style.backgroundColor = "#f0f0f0";
      idBadge.style.borderRadius = "20px";
      idBadge.style.marginBottom = "15px";
      idBadge.textContent = `LIT${student?.program?.prefix || ""}085`;
      infoSection.appendChild(idBadge);

      // Name
      const name = document.createElement("h2");
      name.textContent = `${student?.firstName || ""} ${
        student?.lastName || ""
      }`;
      name.style.margin = "0 0 10px 0";
      name.style.fontSize = "24px";
      infoSection.appendChild(name);

      // Contact info
      const email = document.createElement("p");
      email.textContent = student?.email || "";
      email.style.margin = "0 0 5px 0";
      email.style.fontSize = "14px";
      email.style.color = "#555";
      infoSection.appendChild(email);

      const phone = document.createElement("p");
      phone.textContent = student?.mobileNumber || "";
      phone.style.margin = "0 0 15px 0";
      phone.style.fontSize = "14px";
      phone.style.color = "#555";
      infoSection.appendChild(phone);

      // Footer
      const footer = document.createElement("div");
      footer.style.display = "flex";
      footer.style.justifyContent = "space-between";
      footer.style.marginTop = "20px";
      footer.style.borderTop = "1px solid #eee";
      footer.style.paddingTop = "10px";

      const schoolName = document.createElement("div");
      schoolName.textContent = "The LIT School";
      schoolName.style.fontWeight = "bold";

      const tagline = document.createElement("div");
      tagline.textContent = "Learn • Innovate • Transform";
      tagline.style.fontSize = "12px";

      footer.appendChild(schoolName);
      footer.appendChild(tagline);
      infoSection.appendChild(footer);

      frontCard.appendChild(infoSection);
      container.appendChild(frontCard);

      // Back card
      const backCard = document.createElement("div");
      backCard.style.width = "100%";
      backCard.style.height = "590px";
      backCard.style.border = "1px solid #ccc";
      backCard.style.borderRadius = "10px";
      backCard.style.overflow = "hidden";
      backCard.style.backgroundColor = "#fff";
      backCard.style.color = "#000";

      // Back card content
      const backContent = document.createElement("div");
      backContent.style.padding = "20px";

      // QR code placeholder
      const qrContainer = document.createElement("div");
      qrContainer.style.width = "100%";
      qrContainer.style.height = "200px";
      qrContainer.style.display = "flex";
      qrContainer.style.alignItems = "center";
      qrContainer.style.justifyContent = "center";
      qrContainer.style.marginBottom = "20px";

      const qrPlaceholder = document.createElement("div");
      qrPlaceholder.style.width = "150px";
      qrPlaceholder.style.height = "150px";
      qrPlaceholder.style.backgroundColor = "#f0f0f0";
      qrPlaceholder.style.display = "flex";
      qrPlaceholder.style.alignItems = "center";
      qrPlaceholder.style.justifyContent = "center";
      qrPlaceholder.style.borderRadius = "10px";
      qrPlaceholder.textContent = "QR Code";
      qrContainer.appendChild(qrPlaceholder);
      backContent.appendChild(qrContainer);

      // Student details
      const detailsTitle = document.createElement("h3");
      detailsTitle.textContent = "Student Details";
      detailsTitle.style.marginBottom = "15px";
      backContent.appendChild(detailsTitle);

      // Blood group
      const bloodGroup = document.createElement("p");
      bloodGroup.textContent = `Blood Group: ${student?.bloodGroup || ""}`;
      bloodGroup.style.margin = "0 0 10px 0";
      backContent.appendChild(bloodGroup);

      // Gender
      const gender = document.createElement("p");
      gender.textContent = `Gender: ${student?.gender || ""}`;
      gender.style.margin = "0 0 10px 0";
      backContent.appendChild(gender);

      // DOB
      const dob = document.createElement("p");
      dob.textContent = `Date of Birth: ${
        student?.dateOfBirth
          ? new Date(student?.dateOfBirth).toLocaleDateString()
          : ""
      }`;
      dob.style.margin = "0 0 10px 0";
      backContent.appendChild(dob);

      // Emergency contact
      const emergencyContact = document.createElement("p");
      emergencyContact.textContent = `Emergency Contact: ${
        student?.appliedCohorts?.[0]?.applicationDetails?.studentDetails
          ?.emergencyContact?.contactNumber || ""
      }`;
      emergencyContact.style.margin = "0 0 10px 0";
      backContent.appendChild(emergencyContact);

      // Footer
      const backFooter = document.createElement("div");
      backFooter.style.position = "absolute";
      backFooter.style.bottom = "20px";
      backFooter.style.left = "20px";
      backFooter.style.right = "20px";
      backFooter.style.textAlign = "center";
      backFooter.style.borderTop = "1px solid #eee";
      backFooter.style.paddingTop = "10px";
      backFooter.textContent = "www.litschool.in • info@litschool.in";
      backContent.appendChild(backFooter);

      backCard.appendChild(backContent);
      container.appendChild(backCard);

      // Generate PDF
      const opt = {
        margin: 0,
        filename: `LIT_ID_Card_${student?.firstName || "Student"}_${
          student?.lastName || ""
        }.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      await html2pdf().from(container).set(opt).save();

      // Clean up
      document.body.removeChild(container);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Failed to generate PDF: ${error.message}. Please try again.`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Button
      size="xl"
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
      onClick={handleGeneratePDF}
      disabled={isGeneratingPDF || !student?.bloodGroup}
    >
      <Download className="h-4 w-4" />
      {isGeneratingPDF ? "Generating PDF..." : "Download ID Card"}
    </Button>
  );
}
