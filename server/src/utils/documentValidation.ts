import { DocumentModel } from '../models/Document';

export interface DocumentValidationResult {
    isValid: boolean;
    errors: string[];
    missingDocuments: string[];
}

/**
 * Validates that all required documents are present for a shipment based on transport mode
 * @param shipmentId - The shipment ID
 * @param modeOfTransport - The transport mode ('air', 'sea', 'road')
 * @returns Validation result with errors if any
 */
export async function validateShipmentDocuments(
    shipmentId: string,
    modeOfTransport: string
): Promise<DocumentValidationResult> {
    const errors: string[] = [];
    const missingDocuments: string[] = [];

    try {
        // Get all documents for the shipment
        const documents = await DocumentModel.findByShipmentId(shipmentId);
        const documentTypes = documents.map(doc => doc.document_type);

        // Check for required documents based on transport mode
        if (modeOfTransport === 'sea') {
            // Sea shipments require Bill of Lading (BL)
            if (!documentTypes.includes('bill_of_lading')) {
                errors.push('Bill of Lading (BL) is required for sea shipments');
                missingDocuments.push('bill_of_lading');
            }
        } else if (modeOfTransport === 'air') {
            // Air shipments require Air Waybill (AWB)
            if (!documentTypes.includes('air_waybill')) {
                errors.push('Air Waybill (AWB) is required for air shipments');
                missingDocuments.push('air_waybill');
            }
        }

        // All shipments require invoice and packing list
        if (!documentTypes.includes('invoice')) {
            errors.push('Invoice is required for all shipments');
            missingDocuments.push('invoice');
        }

        if (!documentTypes.includes('packing_list')) {
            errors.push('Packing List is required for all shipments');
            missingDocuments.push('packing_list');
        }

        return {
            isValid: errors.length === 0,
            errors,
            missingDocuments
        };
    } catch (error) {
        console.error('Error validating shipment documents:', error);
        return {
            isValid: false,
            errors: ['Failed to validate documents'],
            missingDocuments: []
        };
    }
}

/**
 * Gets a human-readable label for document type
 */
export function getDocumentTypeLabel(documentType: string): string {
    const labels: Record<string, string> = {
        'invoice': 'Invoice',
        'packing_list': 'Packing List',
        'bill_of_lading': 'Bill of Lading (BL)',
        'air_waybill': 'Air Waybill (AWB)',
        'other': 'Other'
    };
    return labels[documentType] || documentType;
}

/**
 * Gets required document types for a transport mode
 */
export function getRequiredDocumentTypes(modeOfTransport: string): string[] {
    const required = ['invoice', 'packing_list'];

    if (modeOfTransport === 'sea') {
        required.push('bill_of_lading');
    } else if (modeOfTransport === 'air') {
        required.push('air_waybill');
    }

    return required;
}
