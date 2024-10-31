let excelData = [];

document.getElementById("fileUpload").addEventListener("change", handleFileUpload);
document.getElementById("processButton").addEventListener("click", processExcelData);

// Input: Event changes when I uploads Excel file.
// Processing: Read data from file Excel, use FileReader to get the content and convert it into JSON format.
// Output: excelData variable (contain data from file Excel)
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    };
    reader.readAsArrayBuffer(file);
}


// Input: data from excelData in the above handleFileUpload func
// Processing: Analytics the data from file Excel then create and display corresponding badges,
//             use canvas to draw information such as name, title and company.
// Output: Name badges were displayed on preview section.
function processExcelData() {
    const previewSection = document.getElementById("previewSection");
    previewSection.innerHTML = "";

    const badgeWidth = 300;
    const badgeHeight = 200;
    const imageUrl = '/assets/image.png';

    if (excelData.length > 1 && excelData[0].length >= 4) {
        const badgeContainer = document.createElement("div");
        badgeContainer.style.display = "grid";
        badgeContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
        badgeContainer.style.margin = "0";
        badgeContainer.style.padding = "0";
        badgeContainer.style.gap = "0";

        for (let i = 1; i < excelData.length; i++) {
            const row = excelData[i];
            const lastName = row[0] || "";
            const firstName = row[1] || "";
            const jobTitle = row[2] || "";
            const company = row[3] || "";

            const canvas = document.createElement("canvas");
            canvas.width = badgeWidth;
            canvas.height = badgeHeight;

            const context = canvas.getContext("2d");
            const image = new Image();
            image.src = imageUrl;

            image.onload = () => {
                context.drawImage(image, 0, 0, badgeWidth, badgeHeight);

                context.font = "bold 20px Roboto";
                context.fillStyle = "#333";
                context.textAlign = "center";

                const fullName = `${firstName} ${lastName}`.trim();
                if (fullName) {
                    context.fillText(fullName.toUpperCase(), badgeWidth / 2, 80);
                }

                context.font = "16px Roboto";
                context.fillStyle = "#555";

                if (jobTitle) {
                    context.fillText(jobTitle, badgeWidth / 2, 110);
                }

                if (company) {
                    context.fillText(company, badgeWidth / 2, 140);
                }
            };

            badgeContainer.appendChild(canvas);
        }

        previewSection.appendChild(badgeContainer);
    } else {
        alert("File không đúng định dạng. Vui lòng đảm bảo file có các cột: Last Name, First Name, Job Title, Company.");
    }
}
