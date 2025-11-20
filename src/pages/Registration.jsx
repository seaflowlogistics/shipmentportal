// src/pages/Registration.jsx

import { useState } from "react";
import { useDashboard } from "../context/DashboardContext";

export default function EmployeeRegistration() {
  const { registerEmployee } = useDashboard();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
  });

  const roles = [
    "Admin",
    "Operations Staff",
    "Clearance Staff",
    "Documentation Staff",
    "Manager",
  ];

  const departments = [
    "Operations",
    "Documentation",
    "Finance",
    "HR",
    "Management",
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value, // FIXED
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.role || !form.department) {
      alert("Please fill the required fields");
      return;
    }

    registerEmployee(form);

    alert("Employee registered successfully!");

    setForm({
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
    });
  };

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold mb-2">Register Employee</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-sm border p-6 rounded-xl space-y-4"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium">Full Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium">Role *</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            required
          >
            <option value="">Select role</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium">Department *</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            required
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Register Employee
        </button>
      </form>
    </div>
  );
}
