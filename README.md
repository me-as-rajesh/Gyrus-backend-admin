




























API Documentation & Route Analysis
1. Admin Routes (adminRoutes.js)
POST /api/admin/login
Login for admin.
Body: { username, password }
Response: { success, message, admin }

GET /api/admin/admins
List all admins (password excluded).

POST /api/admin/admins
Create new admin.
Body: { username, password, role }

PUT /api/admin/admins/:id
Update admin info.
Body: { username, role }

DELETE /api/admin/admins/:id
Delete admin.

GET /api/admin/allstudents
Get all students from all groups.

GET /api/admin/plans
List teachers and their plan status.

2. Group Routes (groupRoutes.js)
POST /api/groups
Create group.
Body: { groupName, class, section, teacherEmail, students }

GET /api/groups/teacher/:email/students
Get all students for teacher’s groups.

GET /api/groups
List all groups.

GET /api/groups/teacher/:email
Get groups by teacher email.

GET /api/groups/:id
Get group by ID (multiple duplicate routes, returns group details).

PUT /api/groups/:id
Update group.

DELETE /api/groups/:id
Delete group.

3. Teacher Routes (teacherRoutes.js)
POST /api/teachers/join-request
Teacher registration (pending status).

PATCH /api/teachers/join-requests/:id
Approve/reject join request.

GET /api/teachers/join-requests/pending
List pending requests.

POST /api/teachers/login
Teacher login (sends OTP to email).

POST /api/teachers/verify-otp
Verify OTP and return JWT.

GET /api/teachers
List approved teachers.

GET /api/teachers/:id
Get teacher by ID.

PUT /api/teachers/:id
Update teacher.

DELETE /api/teachers/:id
Delete teacher.

GET /api/teachers/email/:email
Get teacher by email.

4. Student Auth Routes (studentAuth.js)
POST /api/student/login
Student login by name and regNo.
Returns student, group, tests, teacher info.

GET /api/student/teacher-data/:email
Get teacher, groups, and tests by teacher email.

GET /api/student/student-data/:name/:regNo
Get student’s group, tests, teacher by name/regNo.

5. Test Routes (testRoutes.js)
GET /api/tests?groupId=...
Get tests for a group.

POST /api/tests
Create new test.

GET /api/tests/student?groupId=...
Get upcoming tests for student’s group.

GET /api/tests/teacher-tests/:email
Get all tests for all groups of a teacher.

6. Question Routes (questionRoutes.js)
GET /api/questions/all-questions
Get 20 valid MCQ questions.
7. OTP Routes (otpRoutes.js)
POST /api/otp/send
Send OTP to phone (Fast2SMS).

POST /api/otp/verify
Verify OTP for phone.

8. Reports Routes (reportsRoutes.js)
GET /api/reports/:email
Get reports by teacher email.

GET /api/reports/:id
Get report by ID.

POST /api/reports
Create report.

PATCH /api/reports/:id
Update report.

DELETE /api/reports/:id
Delete report.

9. Info Routes (infoRoutes.js)
GET /api/info/teacher/:email
Get all groups for a teacher.

GET /api/info/group-with-tests/:groupId
Get group and its tests.

10. Fetch Routes (fetchRoutes.js)
GET /api/fetch/teachers/:id
Get teacher by ID.

GET /api/fetch/teachers/email/:email
Get teacher by email.

GET /api/fetch/teachers
List all teachers.

POST /api/fetch/contact-admin
Send contact message to admin.

General Notes
Most routes use standard RESTful patterns.
Some routes (especially in groupRoutes.js) are duplicated for the same endpoint (/:id).
Error handling is mostly consistent, but some routes could benefit from more detailed validation.
OTP and login flows are implemented for both teachers (email) and students (phone).
Data aggregation for teacher/student info is handled via Mongoose queries and aggregation pipelines.
