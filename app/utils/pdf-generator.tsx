import QRCode from "qrcode";

interface StudentData {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  profileUrl?: string;
  bloodGroup?: string;
  gender?: string;
  dateOfBirth?: string;
  linkedInUrl?: string;
  instagramUrl?: string;
  fatherName?: string;
  motherName?: string;
  emergencyContact?: string;
  address?: string;
  _id?: string;
  program?: {
    prefix: string;
  };
}

export const generateIDCardPDF = async (student: StudentData) => {
  try {
    // Dynamic imports for better performance
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    // Create container for rendering
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      top: -10000px;
      left: 0;
      width: 1000px;
      height: 700px;
      background: white;
      display: flex;
      gap: 50px;
      justify-content: center;
      align-items: center;
      padding: 50px;
    `;

    // Generate QR code first
    const qrCanvas = document.createElement("canvas");
    const vCardParams = new URLSearchParams({
      firstName: student?.firstName || "",
      lastName: student?.lastName || "",
      phone: student?.mobileNumber || "",
      email: student?.email || "",
      profileUrl: student?.profileUrl || "",
      linkedIn: student?.linkedInUrl || "",
      instagram: student?.instagramUrl || "",
    });

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://apply-lit-school.vercel.app";
    const vCardURL = `${baseUrl}/id/${student?._id}?${vCardParams.toString()}`;

    await QRCode.toCanvas(qrCanvas, vCardURL, {
      width: 120,
      margin: 1,
    });

    // Front card HTML
    const frontCard = document.createElement("div");
    frontCard.innerHTML = `
  <div style="width: 400px; height: 590px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    
    <div style="height: 288px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #e5e7eb;">
      <img src="${
        student?.profileUrl || "https://github.com/shadcn.png"
      }" style="width: 100%; height: 100%; object-fit: cover;" alt="profile_pic" crossorigin="anonymous" />
    </div>

    <div style="padding: 16px; flex: 1;">
      <div style="margin-bottom: 12px; display: flex;">
        <div style="
            padding: 8px 16px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <span style="font-size: 14px; font-weight: 500; color: #111827; align-items: center;
            justify-content: center; display: flex">
                LIT${student?.program?.prefix || "NBA"}085
            </span>
        </div>
      </div>
      <div>
        <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 4px 0;">${
          student?.firstName || ""
        } ${student?.lastName || ""}</h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 2px 0;">${
          student?.email || ""
        }</p>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">${
          student?.mobileNumber || ""
        }</p>
      </div>
    </div>

    <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 18px; font-weight: 700; color: #111827;">The LIT School</span>
      <div style="display: flex; align-items: center; font-size: 12px;">
        <span style="color: #111827;">Learn</span>
        <span style="color: #3b82f6; margin: 0 4px;">•</span>
        <span style="color: #111827;">Innovate</span>
        <span style="color: #3b82f6; margin: 0 4px;">•</span>
        <span style="color: #111827;">Transform</span>
      </div>
    </div>
  </div>
`;

    // Back card HTML
    const backCard = document.createElement("div");
    backCard.innerHTML = `
  <div style="width: 400px; height: 590px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">

    <div style="height: 288px; background: #f9fafb; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div style="width: 128px; height: 128px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div id="qr-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"></div>
      </div>
    </div>

    <div style="padding: 16px; flex: 1;">
      <div style="margin-bottom: 16px;">
        <div style="width: 48px; height: 48px; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <img src="/assets/icons/lit_logo.svg" alt="lit_logo" />
        </div>
        <div style="font-size: 14px; line-height: 1.4;">
          <p style="color: #6b7280; margin: 0 0 8px 0;"><span style="font-weight: 500;">Mother's Name:</span> ${
            student?.motherName || "N/A"
          }</p>
          <p style="color: #6b7280; margin: 0 0 8px 0;"><span style="font-weight: 500;">Emergency Contact:</span> ${
            student?.emergencyContact || "N/A"
          }</p>
          <p style="color: #6b7280; margin: 0 0 8px 0;"><span style="font-weight: 500;">Blood Group:</span> ${
            student?.bloodGroup || "N/A"
          }</p>
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;"><span style="font-weight: 500;">Address:</span> ${
            student?.address || "Jayanagar, Bengaluru"
          }</p>
        </div>
      </div>
    </div>

    <div style="padding: 12px 16px; font-size: 12px; color: #6b7280;">
  <div>
    <p style="margin: 0 0 4px 0;"><span style="font-weight: 500;">Issued On:</span> ${new Date().toLocaleDateString()}</p>
    <p style="margin: 0 0 8px 0;"><span style="font-weight: 700;">Expiry Date:</span> ${new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
    ).toLocaleDateString()}</p>
  </div>
  <div style="display: flex; align-items: center;">
    <span style="color: #111827;">www.litschool.in</span>
    <span style="color: #3b82f6; margin: 0 8px;">•</span>
    <span style="color: #111827;">info@litschool.in</span>
  </div>
</div>


  </div>
`;

    container.appendChild(frontCard);
    container.appendChild(backCard);
    document.body.appendChild(container);

    // Add QR code to the back card
    const qrContainer = backCard.querySelector("#qr-container");
    if (qrContainer) {
      qrContainer.appendChild(qrCanvas);
    }

    // Wait for images to load
    const images = container.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map((img) => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
            setTimeout(() => resolve(true), 3000);
          }
        });
      })
    );

    // Additional wait for rendering
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Capture with html2canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight - 20);

    // Clean up
    document.body.removeChild(container);

    // Save PDF
    const fileName = `LIT_ID_Card_${student?.firstName || "Student"}_${
      student?.lastName || "Card"
    }.pdf`;
    pdf.save(fileName);

    console.log("PDF generated successfully!");
  } catch (error) {
    console.error("Error in PDF generation:", error);

    // Clean up on error
    const existingContainer = document.getElementById(
      "pdf-generation-container"
    );
    if (existingContainer) {
      document.body.removeChild(existingContainer);
    }

    // Try fallback method
    await generateSimplePDF(student);
  }
};

// Fallback PDF generation method
const generateSimplePDF = async (student: StudentData) => {
  try {
    const { default: jsPDF } = await import("jspdf");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add content to PDF
    pdf.setFontSize(20);
    pdf.text("LIT SCHOOL ID CARD", 20, 30);

    pdf.setFontSize(14);
    pdf.text(
      `Name: ${student?.firstName || ""} ${student?.lastName || ""}`,
      20,
      50
    );
    pdf.text(`Email: ${student?.email || ""}`, 20, 65);
    pdf.text(`Phone: ${student?.mobileNumber || ""}`, 20, 80);
    pdf.text(`Blood Group: ${student?.bloodGroup || ""}`, 20, 95);
    pdf.text(`Emergency Contact: ${student?.emergencyContact || ""}`, 20, 110);

    pdf.text("Additional Information:", 150, 50);
    pdf.text(`Mother's Name: ${student?.motherName || ""}`, 150, 65);
    pdf.text(`Address: ${student?.address || ""}`, 150, 80);
    pdf.text(`Issued: ${new Date().toLocaleDateString()}`, 150, 95);

    pdf.save(`LIT_ID_Card_${student?.firstName || "Student"}.pdf`);
    console.log("Fallback PDF generated successfully");
  } catch (error) {
    console.error("Error in fallback PDF generation:", error);
    throw new Error("Failed to generate PDF using fallback method");
  }
};
