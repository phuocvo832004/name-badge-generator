let excelData = [];
const imageUrl = '/assets/image2.jpg'; 

// Đặt ánh xạ cột mặc định
const defaultColumnMapping = {
    firstName: 'First Name',
    lastName: 'Last Name',
    jobTitle: 'Job Title',
    company: 'Company'
};

// Lưu ánh xạ tùy chỉnh từ người dùng
let customColumnMapping = { ...defaultColumnMapping };

// Đặt sự kiện cho nút upload và nút process
document.getElementById("fileUpload").addEventListener("change", handleFileUpload);
document.getElementById("processButton").addEventListener("click", processExcelData);

// Hàm để xử lý upload file
function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Chỉ lấy sheet đầu tiên cho đơn giản
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Chuyển đổi sheet sang JSON
        excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Hiển thị giao diện cho người dùng nhập tên cột
        showColumnMappingInput();
    };
    
    reader.readAsArrayBuffer(file);
}

// Hàm để hiển thị giao diện cho người dùng nhập tên cột
function showColumnMappingInput() {
    const mappingSection = document.getElementById("mappingSection");
    mappingSection.innerHTML = ""; // Xóa nội dung trước đó

    // Tạo tiêu đề cho phần ánh xạ cột
    const title = document.createElement("h3");
    title.textContent = "Custom Column Mapping";
    mappingSection.appendChild(title);

    // Tạo các input cho từng cột
    for (const key in customColumnMapping) {
        const formGroup = document.createElement("div");
        formGroup.classList.add("form-group", "text-left"); // Thêm lớp Bootstrap cho kiểu dáng

        const label = document.createElement("label");
        label.textContent = `${customColumnMapping[key]}: `;
        label.htmlFor = key; // Thêm thuộc tính htmlFor cho label

        const input = document.createElement("input");
        input.type = "text";
        input.id = key; // Thêm id cho input để tương ứng với label
        input.value = customColumnMapping[key];
        input.classList.add("form-control"); // Thêm lớp Bootstrap cho ô nhập liệu
        input.oninput = (e) => {
            customColumnMapping[key] = e.target.value; // Cập nhật ánh xạ cột tùy chỉnh
        };

        formGroup.appendChild(label);
        formGroup.appendChild(input);
        mappingSection.appendChild(formGroup);
    }
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

    if (excelData.length > 1) {
        const totalRows = excelData.length - 1; // Bỏ dòng tiêu đề
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
                    const rowIdx = page * badgesPerPage + i + 1;
                    if (rowIdx >= excelData.length) break;

                    const row = excelData[rowIdx];

                    // Tìm chỉ số của các cột dựa trên ánh xạ cột tùy chỉnh
                    const firstName = row[getColumnIndex(customColumnMapping.firstName, excelData[0])] || "";
                    const lastName = row[getColumnIndex(customColumnMapping.lastName, excelData[0])] || "";
                    const jobTitle = row[getColumnIndex(customColumnMapping.jobTitle, excelData[0])] || "";
                    const company = row[getColumnIndex(customColumnMapping.company, excelData[0])] || "";

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

// Hàm để lấy chỉ số của cột dựa trên tên cột
function getColumnIndex(columnName, headerRow) {
    const index = headerRow.findIndex(header => header === columnName);
    return index >= 0 ? index : -1; // Trả về -1 nếu không tìm thấy
}
