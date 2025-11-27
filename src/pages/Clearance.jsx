// src/pages/Clearance.jsx
import { useDashboard } from "../context/DashboardContext";

export default function Clearance() {
  const { pendingClearance, updateDocumentStatus } = useDashboard();

  const markCompleted = (id) => {
    updateDocumentStatus(id, "completed");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-2">Clearance</h2>
      <p className="text-gray-700 mb-4">
        Use this page to mark pending documents as completed. The dashboard
        will automatically update pending and completed counts.
      </p>

      {pendingClearance.length === 0 ? (
        <p className="text-sm text-gray-500">No pending documents for clearance.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b">
                <th className="py-2 pr-4">Document ID</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {pendingClearance.map((doc) => (
                <tr key={doc.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    {doc.id}
                  </td>
                  <td className="py-2 pr-4 text-gray-700">{doc.customer}</td>
                  <td className="py-2 pr-4 text-gray-700">{doc.type}</td>
                  <td className="py-2 pr-4 text-right">
                    <button
                      onClick={() => markCompleted(doc.id)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
                    >
                      Mark Completed
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
