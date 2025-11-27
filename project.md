

1. **Project Overview**

• **Purpose**: To build / update a shipment portal web application
where users can log in, manage shipments, view status, etc.

• **Objectives**:
o Provide **role-based access**(Admin & Assistant, Accounts & Assistant, ClearanceManager& Assistant)

o Allow users to **create,** **update,** **and** **monitor**shipment records

o Maintain a **dashboard**for high-level shipment insights

o Enforce **data validation**, **audit trail**, and **secure access**

**2.** User Roles & Permissions

**Role** | **Description** | **Permissions / Access** | **Key Features**

**Admin& Assistant** | Portal super-admin | Full CRUD on shipments, manage users, view audit logs | Create users, assign roles, delete shipments, escalate issues

**Accounts & Assistant** | Approver for shipments | Review, approve, reject or request changes on shipments & payment updates | Approve shipments, reject shipments with reason, request changes, Payments updates and send
notifications

**ClearanceManager & Assistant** | Operational | Create and update shipments, but limited admin-level controls | Enter shipment data, upload documents, view shipment list

**Login**: Each role should have separate login credentials. On login,
the UI should detect the role and load the correct dashboard + menu
options.

3. **User Flows/Journeys**

a) Admin Login Flow

> 1. Admin navigates to the portal login page.
>
> 2. Admin enters username + password.
>
> 3. On successful login →Admin Dashboard.
>
> 4. Dashboard shows summary: total shipments, pending shipments, user
> management section, reports, and logs.
>
> 5. Admin can go to **User Management** to add / remove / edit users.

b) Clearence Agent—Create a Shipment

> 1. ClearenceAgent logs in→Agent Dashboard.
>
> 2. Clicks “Create Shipment”.
>
> 3. Shipment form opens.
>
> o Fields: Shipment ID (auto-generated),ExporterDetails,vendorDetails, Item Description, Weight, Dimensions,Value, Pickup Date, Expected Delivery Date, Mode of Transport, Status (Default =“New”), Documents (invoice, packinglistforall jobs (Based on sea andairshipment have to attach BL (sea) or AWB( Air shipment)).(refer old PDF sheet)
>
> 4. Agent fills in details and uploads required documents.
>
> 5. Validation:
>
> **Mandatory**: Exporter,Customer, Weight, Value Pickup Date
>
> **Format check**: Date fields must follow DD-MM-YYYY, Weight must be numeric, Value must be numeric
>
> **File uploads**: Only PDF, JPEG allowed; file size limit =10 MB
>
> 6. Agent clicks**Submit**.
>
> 7. On submit→Save shipment record →status changes to “Created”→Redirect to “Shipment Details” view page.
>
> 8. Email notification (to Manager / Admin) aboutnew shipment (if required).
>
> c) AccountsManager —Approve Shipment
>
> 1. Manager logs in →Manager Dashboard.
>
> 2. Sees a list/table of shipments in “Created” status, awaiting approval.
>
> 3. Clicking a shipment row→opens Shipment Detail page.
>
> 4. On Detail page:
>
> o View all fields + documents.
>
> o Buttons:**Approve**, **Reject**, **Request** **Changes**.
>
> 5. If **Approve**: status changes to “Approved”→update record, send email to Agent / Admin.
>
> 6. If **Reject**: show a modal / field to ask for“Reason for Rejection”→Manager enters reason →status changes to “Rejected”→email to Agent with reason.
>
> 7. If **Request** **Changes**: open the shipment form in editable mode (or show fields to be changed) →Manager changes fields→“Request Changes” (or“Send back”)→status =“Changes Requested”→Agent gets notification.

d) Dashboard / Reporting

> • Each role (based on permission) sees a Dashboard:
>
> o **Admin**: All shipments,by status, by time period, user-wise shipments.
>
> o **Manager**: Pending approvals, shipments approved, shipments rejected.
>
> o **Agent**: My shipments, status, shipments delivered / pending.
>
• Reports: Export to Excel / PDF.

4. Functional Requirements (Screen-wise)

Here is a breakdown of important screens/modules, with field-level and action-level details:

**Login Page**

> • **Fields**:
>
> o Username (text)
>
> o Password (password)
>
> o (Optional) 2FA Code (if implemented)
>
> • **Buttons / Actions**:
>
> o **Login**→ Validate credentials→Role-based redirect
>
> o **Forgot Password**→Opens“Reset Password” flow
>
> • **Validation**:
>
> o Username: required
>
> o Password: required
>
> o If 2FA: code required

**Dashboard (per Role)**

> • **Widgets/Panels**:
>
> o Summary cards: Total Shipments, Pending Approval, Rejected, Delivered
>
> o Recent Shipments Table (show last 5–10)
>
> o Action Buttons (Create Shipment for Agents; Manage Users for Admin,etc.)
>
> • **Interactions**:
>
> o Clicking on any summary card or shipment opens detailed view
>
> o Filtering by date / status

**Create Shipment Form**

> • **Fields**:
>
> o Shipment ID (auto)
>
> o Sender Name (text)
>
> o Sender Address (multiline)
>
> o Receiver Name (text)
>
> o Receiver Address (multiline)
>
> o Item Description (text / textarea)
>
> o Weight (number / decimal)
>
> o Dimensions (L × W×H) (decimal)
>
> o Value (currency)
>
> o Pickup Date (date picker)
>
> o Expected Delivery Date (date picker)
>
> o Mode of Transport (dropdown: Air / Sea / Road)
>
> o Status (hidden / auto =“New” or“Created”)
>
> o Documents Upload (multiple files)
>
> • **Buttons**:
>
> o **Submit**→Validate + Save
>
> o **Cancel**→Clear form / go back to Dashboard
>
> • **Validation rules**:
>
> o Required fields (as above)
>
> o Numeric validation forweight, dimensions, value
>
> o Date validation: Pickup Date ≤Expected Delivery Date
>
> o File upload limits +type check

**Shipment Detail Page**

> • **Display Fields**: All the data from the form(read-only unless
> role is Manager and doing“Request Changes”)
>
> • **Document Section**: List of uploaded files withdownload link
>
> • **Buttons (depending on role)**:
>
> o **Approve / Reject / Request Changes**(for Manager)
>
> o **Edit**(if allowed)
>
> o **Back to List**
>
> • **Actions**:
>
> o Approve / Reject / Request Changes has associated status change + maybe popup forreason (if needed)
>
> o On changes: loghistory (audit trail)

**5.Non-functional Requirements**

> • **Authentication & Security**:
>
> o Use HTTPS (TLS) for all data in transit
>
> o Use secure password hashing (e.g. bcrypt)
>
> o Role-based access control strictly enforced
>
> • **Performance**:
>
> o Dashboard load time ≤3 seconds under expected load
>
> o Form submission response within 1–2 seconds
>
> • **Scalability**:
>
> o Should support up to (specify number) shipments in future
>
> o Database indexing on frequently queried columns (status, dates)
>
> • **Usability**:
>
> o Responsive UI —Should work on desktop and tablets
>
> o Clear error messages for validation failures
>
> • **Audit Logging**:
>
> o Log who created / updated / approved / rejected shipments
>
> o Timestamp + user ID for each action

**6. Integration / Data Model**

> • **Database Tables (suggested)**:
>
> o Users (id, username, password_hash, role, created_at, updated_at)
>
> o Shipments (id, shipment_id, sender_name, sender_address,
> receiver_name, receiver_address, description, weight, dimensions,
> value, pickup_date, expected_delivery_date, mode, status, created_by,
> created_at, updated_at)
>
> o Documents (id, shipment_id, file_name, file_path, uploaded_by,
> uploaded_at)
>
> o AuditLog(id, user_id, shipment_id, action, timestamp, remarks)
>
> • **APIs**:
>
> o POST /api/shipments →Create shipment
>
> o GET /api/shipments/:id →Get detail
>
> o PUT /api/shipments/:id →Update shipment (forchanges / approval)
>
> o GET /api/shipments →List shipments (filter by role, status)
>
> o POST /api/users→(Admin only)Create user

**7.Testing / Acceptance Criteria**

> • **Test Cases**:
>
> o Login with each role →Should redirect to correct dashboard
>
> o Create shipment with valid data→Should save + status =“Created”
>
> o Create shipment with missing mandatory field →Show validation error
>
> o Upload invalid file type →Reject upload
>
> o Manager approves shipment →Status changes, email sent
>
> o Manager rejects shipment with reason →Status updates, reason stored
>
> o Dashboard metrics reflect real data
>
> • **Acceptance**:
>
> o All CRUD operations working
>
> o Role-based views are correct
>
> o UI is responsive
>
> o Emails / notifications(if any) sent correctly
>
> o Security checks passed (basic auth, role-based access)

**8.Assumptions & Constraints**

> • Users will have access to modern browsers.
>
> • Internet connection is stable enough for uploads / downloads.
>
> • File storage: server can handle uploaded documents.
>
> • Email system / SMTP is already available (or to be provisioned
> separately).
>
> • No major budget constraints for buildinga moderate-sized web app.
