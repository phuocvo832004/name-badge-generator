let excelData = [];
const imageUrl = '/assets/background.jpg'; 

document.getElementById("fileUpload").addEventListener("change", handleFileUpload);
document.getElementById("processButton").addEventListener("click", processExcelData);
document.getElementById("omitFirstRow").addEventListener("change", showColumnMappingInput); 

const defaultColumnMapping = {
    firstName: 1,
    lastName: 2,
    jobTitle: 3,
    company: 4
};

let customColumnMapping = { ...defaultColumnMapping };

const defaultColumnMappingValue = ["Last Name", "First Name", "Job Title", "Company"];

// Hàm để xử lý upload file
function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // Check if "Omit First Row" is selected
        const omitFirstRow = document.getElementById('omitFirstRow').checked;

        // Chuyển sheet đầu tiên thành JSON
        let jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Nếu omitFirstRow được chọn, loại bỏ dòng đầu tiên
        if (omitFirstRow) {
            jsonData = jsonData.slice(1); // Loại bỏ dòng đầu tiên
        }

        // Lưu dữ liệu đã tải lên vào excelData
        excelData = jsonData;
        
        // Hiển thị giao diện ánh xạ cột
        showColumnMappingInput();
    };
    
    reader.readAsArrayBuffer(file);
}

document.getElementById("omitFirstRow").addEventListener("change", () => {
    showColumnMappingInput();
    
    const omitFirstRow = document.getElementById("omitFirstRow").checked;
    if (omitFirstRow && excelData.length > 0) {
        excelData = excelData.slice(1); 
    }
});

function showColumnMappingInput() {
    const mappingSection = document.getElementById("mappingSection");
    mappingSection.innerHTML = ""; 

    const card = document.createElement("div");
    card.classList.add("card", "p-4", "shadow");

    const title = document.createElement("h3");
    title.textContent = "Custom Column Mapping";
    title.classList.add("text-center");
    card.appendChild(title);

    const columnNames = ["First Name", "Last Name", "Job Title", "Company"];

    columnNames.forEach((value, index) => {
        const formGroup = document.createElement("div");
        formGroup.classList.add("form-group", "text-left");

        const label = document.createElement("label");
        label.textContent = `Map Column for ${value}: `;
        label.htmlFor = `columnMapping${index}`;

        const select = document.createElement("select");
        select.id = `columnMapping${index}`;
        select.classList.add("form-control");

        // Thêm các options cho dropdown (select)
        for (let i = 0; i < columnNames.length; i++) {
            const option = document.createElement("option");
            option.value = i + 1;
            option.textContent = columnNames[i];
            select.appendChild(option);
        }

        // Set default selected value dựa trên customColumnMapping
        select.value = customColumnMapping[columnNames[index].toLowerCase()] || (index + 1);

        // Cập nhật customColumnMapping khi người dùng thay đổi lựa chọn
        select.onchange = (e) => {
            const selectedColumn = e.target.value;
            if (value === "First Name") {
                customColumnMapping.firstName = parseInt(selectedColumn);
            } else if (value === "Last Name") {
                customColumnMapping.lastName = parseInt(selectedColumn);
            } else if (value === "Job Title") {
                customColumnMapping.jobTitle = parseInt(selectedColumn);
            } else if (value === "Company") {
                customColumnMapping.company = parseInt(selectedColumn);
            }
        };

        formGroup.appendChild(label);
        formGroup.appendChild(select);
        card.appendChild(formGroup);
    });

    const applyButton = document.createElement("button");
    applyButton.textContent = "Apply";
    applyButton.classList.add("btn", "btn-success", "mt-3");
    applyButton.onclick = () => {
        processExcelData();
    };

    card.appendChild(applyButton);
    mappingSection.appendChild(card);
}

// Hàm để xử lý dữ liệu Excel
function processExcelData() {
    const previewSection = document.getElementById("previewSection");
    previewSection.innerHTML = "";

    const pageWidth = 595;
    const pageHeight = 842;

    const usableWidth = pageWidth * 0.96;
    const usableHeight = pageHeight * 0.80;

    const badgeWidth = usableWidth / 2;
    const badgeHeight = usableHeight / 3;

    const startX = pageWidth * 0.02;
    const startY = pageHeight * 0.10;

    if (excelData.length > 0) {
        const totalRows = excelData.length;
        const badgesPerPage = 6;
        const totalPages = Math.ceil(totalRows / badgesPerPage);

        for (let page = 0; page < totalPages; page++) {
            const canvas = document.createElement("canvas");
            canvas.width = pageWidth;
            canvas.height = pageHeight;
            const context = canvas.getContext("2d");

            const image = new Image();
            image.src = imageUrl;

            image.onload = () => {
                context.drawImage(image, 0, 0, pageWidth, pageHeight);

                for (let i = 0; i < badgesPerPage; i++) {
                    const rowIdx = page * badgesPerPage + i;
                    if (rowIdx >= excelData.length) break;

                    const row = excelData[rowIdx];

                    const firstName = row[customColumnMapping.firstName - 1] || ""; 
                    const lastName = row[customColumnMapping.lastName - 1] || "";
                    const jobTitle = row[customColumnMapping.jobTitle - 1] || "";
                    const company = row[customColumnMapping.company - 1] || "";

                    const col = i % 2;
                    const rowPos = Math.floor(i / 2);
                    const x = startX + col * badgeWidth + badgeWidth / 2;
                    const y = startY + rowPos * badgeHeight + badgeHeight / 2;

                    context.font = "bold 20px Roboto";
                    context.fillStyle = "#333";
                    context.textAlign = "center";

                    const fullName = `${firstName} ${lastName}`.trim();
                    let line1 = fullName || "";
                    let line2 = jobTitle || "";
                    let line3 = company || "";

                    let yPositionOffset = 0;
                    if (line1 && line2 && line3) {
                        yPositionOffset = -30;
                        context.fillText(line1.toUpperCase(), x, y + yPositionOffset);
                        context.font = "16px Roboto";
                        context.fillText(line2, x, y + yPositionOffset + 30);
                        context.fillText(line3, x, y + yPositionOffset + 60);
                    } else if (line1 && line2) {
                        yPositionOffset = -15;
                        context.fillText(line1.toUpperCase(), x, y + yPositionOffset);
                        context.font = "16px Roboto";
                        context.fillText(line2, x, y + yPositionOffset + 30);
                    } else if (line1 && line3) {
                        yPositionOffset = -15;
                        context.fillText(line1.toUpperCase(), x, y + yPositionOffset);
                        context.font = "16px Roboto";
                        context.fillText(line3, x, y + yPositionOffset + 30);
                    } else if (line2 && line3) {
                        yPositionOffset = -15;
                        context.font = "16px Roboto";
                        context.fillText(line2, x, y + yPositionOffset);
                        context.fillText(line3, x, y + yPositionOffset + 30);
                    } else {
                        const singleLine = line1 || line2 || line3;
                        yPositionOffset = 0;
                        context.fillText(singleLine.toUpperCase(), x, y + yPositionOffset);
                    }
                }
                previewSection.scrollIntoView({ behavior: 'smooth' });
            };

            previewSection.appendChild(canvas);
        }
    } else {
        alert("File không đúng định dạng. Vui lòng đảm bảo file có các cột: Last Name, First Name, Job Title, Company.");
    }
}

