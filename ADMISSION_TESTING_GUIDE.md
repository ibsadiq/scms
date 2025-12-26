# Admission System - Testing Guide

## 🚀 Quick Start

The complete admission system has been implemented. Follow this guide to test all features.

---

## Prerequisites

1. **Backend Running**: Ensure Django backend is running at the configured API base URL
2. **Database Setup**: Admission tables should be created (run migrations)
3. **Test Data**: Optional - create test academic years, classrooms

---

## Testing Flow

### 1. Admin Setup (First-Time Setup)

#### Step 1: Create Academic Year & Classrooms
These are prerequisites for the admission system.

1. Navigate to `/admin/academic-years` and create an academic year
2. Navigate to `/admin/classrooms` and create some classrooms

#### Step 2: Create Admission Session
1. Navigate to `/admin/admissions/sessions`
2. Click "Create Session"
3. Fill in:
   - Session Name: "2024/2025 Admission"
   - Start Date: Choose start date
   - End Date: Choose end date
   - Academic Year: Select the academic year ID
   - Check "Allow Public Applications"
   - Add application instructions (optional)
4. Click "Create"
5. Click "Activate" to make it the active session

#### Step 3: Configure Fee Structures
1. Navigate to `/admin/admissions/fee-structures`
2. Click "Add Fee Structure"
3. For each class you want to accept applications for:
   - Select the session
   - Enter classroom ID
   - Set application fee (e.g., 5000)
   - Check "Application Fee Required"
   - Optionally set entrance exam fee
   - Set acceptance fee
   - Set age requirements
   - Set max applications (e.g., 100)
4. Click "Create"

---

### 2. Public Portal Testing (Parent Flow)

#### Test 1: View Available Sessions
1. Navigate to `/apply`
2. You should see:
   - Active session information
   - Available classes with fees
   - "Start New Application" button
   - "Track Existing Application" button

#### Test 2: Create Application
1. Click "Start New Application"
2. **Step 1 - Select Class**:
   - Choose a class
   - Review fee information
   - Click "Next"
3. **Step 2 - Student Information**:
   - Enter student details (first name, last name, gender, date of birth)
   - Optional: state of origin, LGA, religion, blood group, address
   - Click "Next"
4. **Step 3 - Parent Information**:
   - Enter parent details (name, email, phone)
   - Optional: occupation, relationship
   - Optional: alternative contact
   - Click "Next"
5. **Step 4 - Additional Information**:
   - Optional: previous school, medical conditions, special needs
   - Click "Submit Application"
6. **Result**: You should be redirected to the application view page
7. **Important**: Note down the application number and tracking token (saved in localStorage)

#### Test 3: Track Application
1. Navigate to `/apply/track`
2. Enter:
   - Application number (from step 2)
   - Parent email OR phone
3. Click "Track Application"
4. You should be redirected to the application view page

#### Test 4: View Application & Upload Documents
On the application view page (`/apply/view/{token}`), test:

1. **View Status**: Confirm status shows "DRAFT"
2. **View Payment Info**: Check payment requirements
3. **Upload Document**:
   - Click "Upload Document"
   - Select document type (e.g., Birth Certificate)
   - Choose file (PDF, JPG, or PNG)
   - Add description (optional)
   - Click "Upload"
4. **View Documents**: Confirm document appears in list
5. **Delete Document**: Click trash icon on unverified document

#### Test 5: Submit Application
1. On application view page
2. Ensure application fee is marked as paid (for testing, you may need to update this via admin or API)
3. Click "Submit Application"
4. Confirm status changes to "SUBMITTED"

---

### 3. Admin Portal Testing

#### Test 1: Dashboard
1. Navigate to `/admin/admissions`
2. Verify you see:
   - Active session card
   - Total applications count
   - New submissions count
   - Applications by status breakdown
   - Applications by class breakdown
   - Revenue summary
   - Pending actions cards
3. Click on any pending action card to filter applications

#### Test 2: Applications List
1. Navigate to `/admin/admissions/applications`
2. Test filters:
   - Search by name, email, or application number
   - Filter by status dropdown
   - Filter by session
   - Click quick filter buttons (New Submissions, etc.)
   - Click "Clear Filters"
3. Test pagination:
   - Click next/previous buttons if you have multiple pages
4. Test export:
   - Click "Export CSV"
   - Confirm CSV file downloads
5. Click on an application row to view details

#### Test 3: Application Detail & Workflow
Navigate to `/admin/admissions/applications/{id}` and test each workflow action:

##### A. Start Review
1. Click "Start Review"
2. Confirm in dialog
3. Verify status changes to "UNDER_REVIEW"

##### B. Request Documents
1. Click "Request Documents"
2. Enter notes (e.g., "Please upload birth certificate")
3. Confirm
4. Verify status changes to "DOCUMENTS_PENDING"

##### C. Verify Documents
1. Click eye icon to view uploaded document
2. Click green check icon to verify
3. Confirm document shows "Verified" badge

##### D. Reject Document (Optional)
1. Click red X icon on unverified document
2. Enter rejection reason
3. Confirm

##### E. Schedule Exam
1. Click "Schedule Exam"
2. Enter:
   - Exam date
   - Exam time
   - Venue (e.g., "Main Hall")
3. Confirm
4. Verify status changes to "EXAM_SCHEDULED"

##### F. Mark Exam Completed
1. Click "Mark Exam Completed"
2. Verify status changes to "EXAM_COMPLETED"

##### G. Schedule Interview (Optional)
1. Click "Schedule Interview"
2. Enter interview details
3. Confirm
4. Verify status changes to "INTERVIEW_SCHEDULED"

##### H. Approve Application
1. Click "Approve Application"
2. Enter approval notes (optional)
3. Confirm
4. Verify status changes to "APPROVED"

##### I. Test Parent Accepting Offer
1. As parent, go to `/apply/view/{token}`
2. Click "Accept Offer"
3. Verify status changes to "ACCEPTED"

##### J. Enroll Student
1. As admin, on application detail page
2. Click "Enroll Student"
3. Confirm the action
4. Verify:
   - Status changes to "ENROLLED"
   - Toast shows success message with username
   - Student account is created in the system

##### K. Reject Application (Alternative Flow)
1. From any non-terminal state
2. Click "Reject Application"
3. Enter rejection reason
4. Confirm
5. Verify status changes to "REJECTED"

##### L. Withdraw Application
1. Click "Withdraw"
2. Enter withdrawal reason
3. Confirm
4. Verify status changes to "WITHDRAWN"

##### M. Admin Notes
1. Scroll to "Admin Notes" section
2. Type notes in textarea
3. Click "Save Notes"
4. Refresh page and verify notes are saved

#### Test 4: Sessions Management
1. Navigate to `/admin/admissions/sessions`
2. **View Sessions**: Confirm all sessions listed
3. **Create Session**:
   - Click "Create Session"
   - Fill in all fields
   - Click "Create"
4. **Edit Session**:
   - Click "Edit" on a session
   - Modify fields
   - Click "Update"
5. **Activate Session**:
   - Click "Activate" on inactive session
   - Confirm
   - Verify session shows "Active" badge
6. **View Statistics**:
   - Click "Statistics" button
   - Should navigate to dashboard filtered by session

#### Test 5: Fee Structures
1. Navigate to `/admin/admissions/fee-structures`
2. **Filter by Session**: Select a session from dropdown
3. **Create Fee Structure**:
   - Click "Add Fee Structure"
   - Fill in all fields:
     - Session
     - Classroom ID
     - Application fee
     - Check "Application Fee Required"
     - Entrance exam fee (optional)
     - Check "Entrance Exam Required" if applicable
     - Set pass score
     - Acceptance fee
     - Check requirements
     - Age range
     - Max applications
   - Click "Create"
4. **Edit Fee Structure**:
   - Click "Edit" on a fee structure
   - Modify fields
   - Click "Update"
5. **View Fee Structure**: Confirm all fee details display correctly

---

## Test Scenarios

### Scenario 1: Complete Happy Path
1. Admin creates session and activates it
2. Admin creates fee structures for 3 classes
3. Parent visits `/apply` and sees available classes
4. Parent creates application for Primary 1
5. Parent uploads birth certificate
6. Admin reviews application and requests additional documents
7. Parent uploads additional documents
8. Admin verifies all documents
9. Admin schedules exam
10. Admin marks exam as completed
11. Admin approves application
12. Parent accepts offer
13. Admin enrolls student
14. Result: Student account created, status = ENROLLED

### Scenario 2: Rejection Flow
1. Parent creates and submits application
2. Admin reviews application
3. Admin rejects with reason (e.g., "Age requirement not met")
4. Parent sees rejected status with reason

### Scenario 3: Multiple Applications
1. Create 10+ applications with different statuses
2. Test filtering by each status
3. Test search functionality
4. Test pagination
5. Export to CSV and verify all applications included

---

## Features Checklist

### Public Portal
- [ ] View active session and available classes
- [ ] Create new application (4-step form)
- [ ] Track application by number + email/phone
- [ ] View application status
- [ ] View payment information
- [ ] View next steps
- [ ] Upload documents
- [ ] Delete unverified documents
- [ ] Submit draft application
- [ ] Accept admission offer

### Admin Dashboard
- [ ] View session statistics
- [ ] View applications by status
- [ ] View applications by class
- [ ] View revenue summary
- [ ] View pending actions
- [ ] Navigate to filtered views

### Admin Applications
- [ ] List all applications
- [ ] Filter by status
- [ ] Filter by session
- [ ] Search applications
- [ ] Use quick filters
- [ ] Export to CSV
- [ ] Navigate to application details

### Admin Application Detail
- [ ] View complete application
- [ ] Start review
- [ ] Request documents
- [ ] Verify documents
- [ ] Reject documents
- [ ] Schedule exam
- [ ] Mark exam completed
- [ ] Schedule interview
- [ ] Approve application
- [ ] Reject application
- [ ] Enroll student
- [ ] Withdraw application
- [ ] Save admin notes

### Admin Sessions
- [ ] List sessions
- [ ] Create session
- [ ] Edit session
- [ ] Activate session
- [ ] View statistics

### Admin Fee Structures
- [ ] List fee structures
- [ ] Filter by session
- [ ] Create fee structure
- [ ] Edit fee structure

---

## Expected Issues to Check

### Common Issues:
1. **CORS Errors**: Ensure backend CORS is configured
2. **Auth Errors**: Ensure admin is logged in for admin routes
3. **404 Errors**: Ensure backend API endpoints exist
4. **Type Errors**: Check console for any TypeScript errors

### Data Validation:
1. Age validation against class requirements
2. Email format validation
3. Phone number format
4. Date validations (exam date in future, etc.)
5. Required fields enforcement

### UI/UX:
1. Loading states display correctly
2. Error messages are clear
3. Success toasts appear
4. Forms reset after submission
5. Dialogs close properly
6. Mobile responsiveness
7. Dark mode works correctly

---

## Success Criteria

✅ All public portal features work without errors
✅ All admin workflow actions work correctly
✅ Applications transition through all states successfully
✅ Documents can be uploaded and verified
✅ Students can be enrolled from accepted applications
✅ CSV export works
✅ All filters and search work correctly
✅ Mobile responsive on all pages
✅ Dark mode works on all pages

---

## Backend API Configuration

Ensure these are configured in your `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    apiBase: 'http://localhost:8000/api',
    productName: 'ScholAfric',
    appLogo: '/logo.png'
  }
}
```

---

## Next Steps After Testing

1. **Fix any bugs found during testing**
2. **Add email notifications** (backend handles this)
3. **Integrate payment gateway** for fee payments
4. **Add analytics** to track application metrics
5. **Add bulk actions** (approve multiple, export selected, etc.)
6. **Add timeline view** showing application history
7. **Add notifications system** for admins

---

**Last Updated**: December 2024
**Status**: Ready for Testing
**Version**: 1.0
