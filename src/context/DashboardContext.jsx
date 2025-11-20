import React, { createContext, useContext, useState, useMemo } from "react";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  // ====================================================
  // ALL HOOKS MUST BE INSIDE THIS FUNCTION
  // ====================================================

  // Document state
  const [documents, setDocuments] = useState([]);

  // Activity state
  const [activity, setActivity] = useState([]);

  // Employee state
  const [employees, setEmployees] = useState([]);

  // ====================================================
  // ACTIVITY LOGGER
  // ====================================================
  const logActivity = (message) => {
    setActivity((prev) => [
      {
        id: prev.length + 1,
        message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...prev,
    ]);
  };

  // ====================================================
  // DOCUMENT FUNCTIONS
  // ====================================================
  const registerDocument = (doc) => {
    const newDoc = {
      id: documents.length + 1,
      docId: doc.id,
      customer: doc.customer,
      type: doc.type,
      status: "pending",
      createdAt: new Date(),
      completedAt: null,
    };

    setDocuments((prev) => [newDoc, ...prev]);

    logActivity(`New document registered: ${doc.id}`);
  };

  const updateDocumentStatus = (docId, newStatus) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.docId === docId
          ? {
              ...doc,
              status: newStatus,
              completedAt: newStatus === "completed" ? new Date() : null,
            }
          : doc
      )
    );

    logActivity(`Document ${docId} updated to ${newStatus.toUpperCase()}`);
  };

  // ====================================================
  // EMPLOYEE REGISTRATION FUNCTION
  // ====================================================
  const registerEmployee = (emp) => {
    const newEmployee = {
      id: employees.length + 1,
      ...emp,
      createdAt: new Date(),
    };

    setEmployees((prev) => [newEmployee, ...prev]);

    logActivity(`Employee ${emp.name} registered as ${emp.role}`);
  };

  // ====================================================
  // DASHBOARD SUMMARY (AUTO-UPDATED)
  // ====================================================
  const summary = useMemo(() => {
    const now = new Date();

    const todayRegistered = documents.filter(
      (doc) =>
        new Date(doc.createdAt).toDateString() === now.toDateString()
    ).length;

    const pendingCount = documents.filter(
      (doc) => doc.status === "pending"
    ).length;

    const todayCompleted = documents.filter(
      (doc) =>
        doc.status === "completed" &&
        doc.completedAt &&
        new Date(doc.completedAt).toDateString() === now.toDateString()
    ).length;

    return {
      todayRegistered,
      pendingCount,
      todayCompleted,
    };
  }, [documents]);

  // ====================================================
  // PENDING CLEARANCE LIST
  // ====================================================
  const pendingClearance = useMemo(
    () => documents.filter((d) => d.status === "pending"),
    [documents]
  );

  // ====================================================
  // RECENT ACTIVITY (LATEST 7)
  // ====================================================
  const recentActivity = activity.slice(0, 7);

  // ====================================================
  // EXPORT VALUES
  // ====================================================
  const value = {
    documents,
    employees,
    activity,
    summary,
    pendingClearance,
    recentActivity,

    registerDocument,
    updateDocumentStatus,
    registerEmployee,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Hook for easy access
export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }
  return ctx;
}
