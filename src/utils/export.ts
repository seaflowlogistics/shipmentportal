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
