interface StudentData {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  profileUrl?: string;
  bloodGroup?: string;
  gender?: string;
  dateOfBirth?: string;
  appliedCohorts?: any[];
  linkedInUrl?: string;
  instagramUrl?: string;
  fatherName?: string;
  emergencyContact?: string;
  address?: string;
  _id?: string;
  program?: any;
}

// Improved PDF generation with better error handling and loading
export const generateIDCardPDF = async (student: StudentData) => {
  try {
    console.log("Starting PDF generation with student data:", student);

    // Import libraries
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    // Create a visible container for debugging (we'll hide it after)
    const container = document.createElement("div");
    container.id = "pdf-generation-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "1000px";
    container.style.height = "700px";
    container.style.backgroundColor = "#ffffff";
    container.style.padding = "50px";
    container.style.display = "flex";
    container.style.gap = "50px";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.zIndex = "9999";
    container.style.border = "2px solid red"; // For debugging

    // Create card containers
    const frontContainer = document.createElement("div");
    frontContainer.id = "front-card-container";

    const backContainer = document.createElement("div");
    backContainer.id = "back-card-container";

    container.appendChild(frontContainer);
    container.appendChild(backContainer);
    document.body.appendChild(container);

    console.log("Container created and added to DOM");

    // Import and render components using innerHTML approach
    const frontHTML = `
      <div id="lit-id-front" style="width: 400px; height: 590px; background: white; border: 1px solid #ccc;">
        <div style="width: 398px; height: 355px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
          <img src="${student?.profileUrl || "https://github.com/shadcn.png"}" 
               style="width: 398px; height: 355px; object-fit: cover;" 
               crossorigin="anonymous" />
        </div>
        <div style="padding: 16px; background: white; height: 235px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="padding: 8px 16px; background: white; border: 1px solid #d9d9d9; border-radius: 50px; display: inline-block; margin-bottom: 12px;">
              <span style="color: #000; font-size: 16px; font-weight: 500;">LIT${
                student?.program?.prefix || "NBA"
              }085</span>
            </div>
            <div style="margin-bottom: 12px;">
              <h2 style="color: #000; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">${
                student?.firstName || ""
              } ${student?.lastName || ""}</h2>
              <p style="color: #4f4f4f; font-size: 14px; margin: 0;">${
                student?.email || ""
              }</p>
              <p style="color: #4f4f4f; font-size: 14px; margin: 0;">${
                student?.mobileNumber || ""
              }</p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 4px;">
            <span style="color: #000; font-size: 16px; font-weight: 600;">The LIT School</span>
            <span style="color: #000; font-size: 16px;">Learn • Innovate • Transform</span>
          </div>
        </div>
      </div>
    `;

    const backHTML = `
      <div id="lit-id-back" style="width: 400px; height: 590px; background: white; border: 1px solid #ccc; display: flex; flex-direction: column;">
        <div style="padding: 60px; display: flex; justify-content: center;">
          <div style="width: 168px; height: 168px; background: #ededed; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <div style="font-size: 12px; color: #666;">
            <QRCodeCanvas value={vCardURL} size={168} />
            </div>
          </div>
        </div>
        <div style="padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div style="width: 48px; height: 54px; background: #ccc; border-radius: 4px;"></div>
          <div>
            <p style="color: #4f4f4f; font-size: 14px; margin: 0 0 8px 0;">Father's Name: ${
              student?.fatherName || "John Doe"
            }</p>
            <p style="color: #4f4f4f; font-size: 14px; margin: 0 0 8px 0;">Emergency Contact: ${
              student?.emergencyContact || student?.mobileNumber || "--"
            }</p>
            <p style="color: #4f4f4f; font-size: 14px; margin: 0 0 8px 0;">Blood Group: ${
              student?.bloodGroup || "O+"
            }</p>
          </div>
          <div>
            <p style="color: #4f4f4f; font-size: 14px; margin: 0 0 8px 0;">Address: ${
              student?.address || "Sample Address, City, State 123456"
            }</p>
          </div>
          <div>
            <p style="color: #4f4f4f; font-size: 14px; margin: 0 0 4px 0;">Issued On: ${new Date().toLocaleDateString()}</p>
            <p style="color: #4f4f4f; font-size: 14px; font-weight: 600; margin: 0;">Expiry Date: ${new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000
            ).toLocaleDateString()}</p>
          </div>
          <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid #e5e5e5;">
            <p style="color: #4f4f4f; font-size: 12px; text-align: center; margin: 0;">www.litschool.in • info@litschool.in</p>
          </div>
        </div>
      </div>
    `;

    frontContainer.innerHTML = frontHTML;
    backContainer.innerHTML = backHTML;

    console.log("HTML content added to containers");

    // Wait for images to load
    const images = container.querySelectorAll("img");
    const imagePromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve(true);
        } else {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true); // Continue even if image fails
          // Timeout after 5 seconds
          setTimeout(() => resolve(true), 5000);
        }
      });
    });

    await Promise.all(imagePromises);
    console.log("All images loaded");

    // Additional wait for rendering
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("About to capture with html2canvas");

    // Capture with html2canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: true, // Enable logging for debugging
      useCORS: true,
      allowTaint: false,
      width: 1000,
      height: 700,
      scrollX: 0,
      scrollY: 0,
    });

    console.log("Canvas captured successfully", canvas.width, canvas.height);

    // Create PDF
    const pdfInstance = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    console.log("Image data created, length:", imgData.length);

    // Add image to PDF
    const pdfWidth = pdfInstance.internal.pageSize.getWidth();
    const pdfHeight = pdfInstance.internal.pageSize.getHeight();

    pdfInstance.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight - 20);

    // Clean up
    document.body.removeChild(container);

    // Save PDF
    const fileName = `LIT_ID_Card_${student?.firstName || "Student"}_${
      student?.lastName || "Card"
    }.pdf`;
    pdfInstance.save(fileName);

    console.log("PDF saved successfully:", fileName);
  } catch (error) {
    console.error("Detailed error in PDF generation:", error);

    // Clean up container if it exists
    const existingContainer = document.getElementById(
      "pdf-generation-container"
    );
    if (existingContainer) {
      document.body.removeChild(existingContainer);
    }

    throw error;
  }
};

// Simple fallback method using basic HTML
export const generateSimpleIDCardPDF = async (student: StudentData) => {
  try {
    const jsPDF = (await import("jspdf")).default;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add text content directly to PDF
    pdf.setFontSize(20);
    pdf.text("LIT ID CARD", 20, 30);

    pdf.setFontSize(16);
    pdf.text(
      `Name: ${student?.firstName || ""} ${student?.lastName || ""}`,
      20,
      50
    );
    pdf.text(`Email: ${student?.email || ""}`, 20, 65);
    pdf.text(`Phone: ${student?.mobileNumber || ""}`, 20, 80);
    pdf.text(`Blood Group: ${student?.bloodGroup || ""}`, 20, 95);

    pdf.text("BACK SIDE", 150, 30);
    pdf.text(`Emergency Contact: ${student?.emergencyContact || ""}`, 150, 50);
    pdf.text(`Address: ${student?.address || "Not provided"}`, 150, 65);
    pdf.text(`Issued: ${new Date().toLocaleDateString()}`, 150, 80);

    pdf.save(`LIT_ID_Card_${student?.firstName || "Student"}.pdf`);

    console.log("Simple PDF generated successfully");
  } catch (error) {
    console.error("Error in simple PDF generation:", error);
    throw error;
  }
};

// Alternative method - capture from existing dialog elements
export const generateIDCardPDFFromDialog = async (student: StudentData) => {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    // Wait a bit for dialog to be fully rendered
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find the dialog content
    const dialogContent = document.querySelector(
      '[role="dialog"]'
    ) as HTMLElement;
    if (!dialogContent) {
      throw new Error("Please open the ID card preview dialog first");
    }

    // Capture the entire dialog content
    const canvas = await html2canvas(dialogContent, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: dialogContent.offsetWidth,
      height: dialogContent.offsetHeight,
    });

    // Create PDF
    const pdfInstance = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    // Calculate dimensions
    const pdfWidth = pdfInstance.internal.pageSize.getWidth();
    const pdfHeight = pdfInstance.internal.pageSize.getHeight();

    // Add image to PDF
    pdfInstance.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight - 20);

    // Save PDF
    pdfInstance.save(
      `LIT_ID_Card_${student.firstName}_${student.lastName}.pdf`
    );

    console.log("PDF generated from dialog successfully!");
  } catch (error) {
    console.error("Error generating PDF from dialog:", error);
    throw error;
  }
};
