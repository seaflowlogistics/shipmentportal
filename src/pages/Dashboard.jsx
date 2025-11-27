// src/pages/Dashboard.jsx
import {
  UserCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useDashboard } from "../context/DashboardContext";

export default function Dashboard() {
  const { summary, pendingClearance, recentActivity } = useDashboard();

  const fullName = "Admin"; // you can later pass this from auth/user data
  const firstLetter = fullName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Top row: Welcome + Today Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Welcome board */}
        <div className="col-span-1 bg-white rounded-2xl shadow-sm border p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {firstLetter}
          </div>
          <div>
            <p className="text-sm text-gray-500">Welcome back,</p>
            <h2 className="text-xl font-semibold text-gray-900">
              {fullName}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Working at <span className="font-medium">Seaflow Logistics · Operations</span>
            </p>
          </div>
        </div>

        {/* Today summary cards */}
        <div className="col-span-1 xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total documents registered today */}
          <div className="bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Documents Registered Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary.todayRegistered}
              </p>
            </div>
          </div>

          {/* Pending clearance */}
          <div className="bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending Clearance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary.pendingCount}
              </p>
            </div>
          </div>

          {/* Completed today */}
          <div className="bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tasks Completed Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary.todayCompleted}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Pending Clearance + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending clearance list */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Clearance
            </h3>
            <span className="text-xs text-gray-500">
              {pendingClearance.length} record
              {pendingClearance.length !== 1 && "s"}
            </span>
          </div>

          {pendingClearance.length === 0 ? (
            <p className="text-sm text-gray-500">No pending clearance items 🎉</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b">
                    <th className="py-2 pr-4">Document ID</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Created At</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClearance.map((doc) => (
                    <tr key={doc.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium text-gray-900">
                        {doc.id}
                      </td>
                      <td className="py-2 pr-4 text-gray-700">
                        {doc.customer}
                      </td>
                      <td className="py-2 pr-4 text-gray-700">{doc.type}</td>
                      <td className="py-2 pr-4 text-gray-500">
                        {new Date(doc.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-100">
                          Pending
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent activity list */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <span className="text-xs text-gray-500">
              Last {recentActivity.length} events
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500">
              No activity yet. Start registering shipments.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between text-sm"
                >
                  <div className="flex-1">
                    <p className="text-gray-800">{item.message}</p>
                  </div>
                  <span className="ml-2 text-xs text-gray-400 whitespace-nowrap">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
