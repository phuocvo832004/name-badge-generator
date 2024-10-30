// Lắng nghe sự kiện thay đổi file khi người dùng tải file lên
document.getElementById("uploadFile").addEventListener("change", handleFileUpload);

// Lắng nghe sự kiện khi nhấn nút Process
document.getElementById("processButton").addEventListener("click", processExcelData);

// Hàm xử lý file khi tải lên
let excelData = [];  // Biến để lưu dữ liệu Excel
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            alert("File uploaded and processed successfully!");
        };
        reader.readAsArrayBuffer(file);
    }
}

function processExcelData() {
    const previewSection = document.getElementById("previewSection");
    previewSection.innerHTML = "";

    // Kiểm tra dữ liệu có tồn tại và có đủ cột không
    if (excelData.length > 1 && excelData[0].length >= 4) {
        for (let i = 1; i < excelData.length; i++) {
            const row = excelData[i];
            const lastName = row[0] || "";
            const firstName = row[1] || "";
            const jobTitle = row[2] || "";
            const company = row[3] || "";

            const badgeDiv = document.createElement("div");
            badgeDiv.className = "badge";
            badgeDiv.innerHTML = `
                <h5>${firstName} ${lastName}</h5>
                <p>${jobTitle}</p>
                <p>${company}</p>
            `;
            previewSection.appendChild(badgeDiv);
        }
    } else {
        alert("File không đúng định dạng. Vui lòng đảm bảo file có các cột: Last Name, First Name, Job Title, Company.");
    }
}

