import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// CSV Export (already exists)
export const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return JSON.stringify(value);
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};

// JSON Export (already exists)
export const exportToJSON = (data: any[], filename: string) => {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};

// Excel Export (NEW)
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// PDF Export (NEW)
export const exportToPDF = (
    data: any[],
    filename: string,
    title: string,
    columns?: string[]
) => {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    // Prepare table data
    const headers = columns || Object.keys(data[0]);
    const tableData = data.map(row =>
        headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value);
        })
    );

    // Add table
    autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 28,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [79, 70, 229] }, // Indigo color
        margin: { top: 28 }
    });

    // Save PDF
    doc.save(`${filename}.pdf`);
};

// Shipment export helper
export const prepareShipmentsForExport = (shipments: any[]) => {
    return shipments.map(s => ({
        'Shipment ID': s.shipment_id,
        'Exporter': s.exporter_name,
        'Receiver': s.receiver_name,
        'Description': s.item_description,
        'Weight': `${s.weight} ${s.weight_unit}`,
        'Value': `${s.currency} ${s.value}`,
        'Mode': s.mode_of_transport.toUpperCase(),
        'Pickup Date': new Date(s.pickup_date).toLocaleDateString(),
        'Delivery Date': new Date(s.expected_delivery_date).toLocaleDateString(),
        'Status': s.status.replace(/_/g, ' ').toUpperCase(),
        'Created': new Date(s.created_at).toLocaleString()
    }));
};

// Audit logs export helper (NEW)
export const prepareAuditLogsForExport = (logs: any[]) => {
    return logs.map(log => ({
        'Timestamp': new Date(log.timestamp).toLocaleString(),
        'User': log.username || 'System',
        'Action': log.action.replace(/_/g, ' '),
        'Entity Type': log.entity_type || 'N/A',
        'Entity ID': log.entity_id || 'N/A',
        'Details': log.details ? JSON.stringify(log.details) : '',
        'IP Address': log.ip_address || 'N/A'
    }));
};
