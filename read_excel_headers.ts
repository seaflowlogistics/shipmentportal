import * as XLSX from 'xlsx';
const path = require('path');

const filePath = path.join(process.cwd(), 'SHIPMENT_REGISTRY 28-10-2025.xlsx');
console.log(`Reading file from: ${filePath}`);

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON to see headers and data
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length > 0) {
        console.log('First 10 rows:');
        data.slice(0, 10).forEach((row, index) => {
            console.log(`Row ${index}:`, row);
        });
    } else {
        console.log('File is empty');
    }
} catch (error) {
    console.error('Error reading Excel file:', error);
}
