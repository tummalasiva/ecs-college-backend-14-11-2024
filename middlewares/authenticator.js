const jwt = require("jsonwebtoken");

const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const UsersData = require("@db/users/queries");
const emloyeeQueries = require("@db/employee/queries");
const studentQueries = require("@db/student/queries");

function getSecondTwoWordsAfterV1(url) {
  const parts = url.split("/");
  const indexV1 = parts.indexOf("v1");

  if (indexV1 !== -1 && indexV1 < parts.length - 2) {
    return [parts[indexV1 + 1], parts[indexV1 + 2]];
  } else {
    return null; // v1 not found or not enough parts after v1
  }
}

const METHOD_MAP = {
  get: "view",
  post: "add",
  put: "update",
  delete: "delete",
  patch: "update",
};

const PATH_TO_MODULE = {
  dashboard: "Dashboard",
  "manage-institute": "Manage Institute",
  academicYear: "Academic Year",
  "role-permission": "Roles and Permissions",
  "reset-password": "User Password Reset",
  "manage-designation": "Designation",
  "manage-department": "Department",
  employee: "Employee",
  "offer-letter": "Offer Letter",
  "relieving-letter": "Relieving Letter",
  "off-boarding": "Off Boarding",
  "experience-letter": "Experience Letter",
  "teacher-activity": "Teacher Activity",
  enquiries: "Pre-Admission Enquiry",
  exams: "Pre-Admission Exam",
  "exam-schedules": "Pre-Admission Exam Schedule",
  result: "Pre-Admission Result",
  class: "Class",
  section: "Section",
  subject: "Subject",
  "student-attendance": "Student Attendance",
  "employee-attendance": "Employee Attendance",
  "class-routine": "Class Routine",
  overview: "Overview",
  "admit-student": "Admit Student",
  reshuffle: "Resuffle",
  promotion: "Promotion",
  "bulk-admission": "Bulk Admission",
  credential: "Credential",
  "quick-admit": "Quick Admit",
  "id-card": "ID card",
  "student-activity": "Student Activity",
  assignment: "Assignment",
  communication_compose: "Compose",
  communication_report: "Sms Report",
  communication_credentials: "Sms Credentials",
  notice: "Notice",
  news: "News",
  holiday: "Holidays",
  awardsAndAchievements: "Award and Achievement",
  splashNews: "Splash News",
  "calender-events": "Calendar Events",
  gallery: "Gallery",
  notifications: "Sms-Notifications",
  event: "Event",
  "exam-grade": "Exam Grade",
  "exam-term": "Exam Term",
  "exam-schedule": "Exam Schedule",
  "exam-hall-ticket": "Exam Hall Ticket",
  "exam-Attendance": "Exam Attendance",
  "manage-mark": "Manage Mark",
  "exam-result": "Exam Result",
  "marks-card": "Marks Card",
  "consolidated-marks-sheet": "Consolidated Marks Sheet",
  "subject-wise-report": "Subject Wise Report",
  "division-wise-report": "Division Wise Report",
  storage: "Storage",
  courses: "Courses",
  "course-content": "Course Content",
  live: "Live",
  books: "Books",
  periodical: "Periodical",
  "student-library-member": "Student Library Member",
  "employee-library-member": "Employee Library Member",
  "student-issue-return": "Issue and Returns",
  "leave-type": "Leave Type",
  "employee-leave": "Employee Leave",
  "student-leave": "Student Leave",
  "leave-report": "Leave Report",
  item: "Item",
  vendor: "Vendor",
  transaction: "In/Out Transaction",
  stockList: "Stock List",
  issue: "Issue",
  sell: "Sell",
  "study-certificate": "Study Certificate",
  "transfer-certificate": "Transfer Certificate",
  "receipt-book": "Receipt Book",
  "feeMap-category": "Fee Map Category",
  "collect-fees": "Collect Fees",
  "balance-fee": "Balance Fee",
  "fee-overview": "Fee Overview",
  "re-conciliation": "Reconciliation",
  "manage-hostel": "Manage Hostel",
  "manage-room-type": "Manage Room Type",
  "manage-room-bed": "Manage Room Bed",
  "hostel-member": "Hostel Member",
  vehicle: "Vehicle",
  "manage-route": "Manage Route and Trips",
  routes: "Routes",
  "trasport-member": "Transport Member",
  "vehicle-log": "Vehicle Log",
  "vehicle-maintenance": "Vehicle Maintenance",
  "salary-grade": "Salary Grade",
  "make-payment": "Make Payment",
  "library-report": "Library Report",
  "student-attendances": "Student Attendance Report",
  "student-yearly-attendance": "Student Yearly Attendance",
  "employee-attendances": "Employee Attendance Report",
  "employee-yearly-attendance": "Employee Yearly Attendance",
  "student-report": "Student Report",
  "student-activity-report": "Student Activity Report",
  "visitor-info": "Visitor Information",
  "student-checkout": "Student Checkout",
  "help-desk": "Help Desk",
  "guardian-feedback": "Guardian Feedback",
};

const extractURL = (url = "") => {
  let newUrlArray = url.split("/");
  if (newUrlArray.includes("edit-institute")) return "manage-institute";
  else if (
    newUrlArray.includes("add-employee") ||
    newUrlArray.includes("edit-employee")
  )
    return "employee";
  else if (
    newUrlArray.includes("add-student") ||
    newUrlArray.includes("edit-student")
  )
    return "admit-student";
  else if (
    newUrlArray.includes("add-courses") ||
    newUrlArray.includes("edit-courses")
  )
    return "courses";
  else if (newUrlArray.includes("room")) return "live";
};

module.exports = async function (req, res, next) {
  try {
    let internalAccess = false;
    let guestUrl = false;
    const authHeader = req.get("X-auth-token");
    let USER_REQUEST_URL = req.get("X-user-url");
    let REQUESTED_FROM_MOBILE = req.get("isMobile");
    let REQUESTED_MODULE = req.get("moduleName");

    REQUESTED_FROM_MOBILE = REQUESTED_FROM_MOBILE === "true" ? true : false;

    await Promise.all(
      common.internalAccessUrls.map(async function (path) {
        if (req.path.includes(path)) {
          if (
            req.headers.internal_access_token &&
            process.env.INTERNAL_ACCESS_TOKEN ==
              req.headers.internal_access_token
          ) {
            internalAccess = true;
          }
        }
      })
    );
    common.guestUrls.map(function (path) {
      if (req.path.includes(path)) {
        guestUrl = true;
      }
    });

    if (internalAccess || guestUrl) {
      next();
      return;
    }

    if (!authHeader) {
      const authHeader = req.get("X-auth-token");
      if (!authHeader) {
        throw common.failureResponse({
          message: "UNAUTHORIZED_REQUEST",
          statusCode: httpStatusCode.unauthorized,
          responseCode: "UNAUTHORIZED",
        });
      }
    }

    const authHeaderArray = authHeader.split(" ");

    if (authHeaderArray[0] !== "bearer") {
      throw common.failureResponse({
        message: "UNAUTHORIZED_REQUEST",
        statusCode: httpStatusCode.unauthorized,
        responseCode: "UNAUTHORIZED",
      });
    }

    let decodedToken = "";

    try {
      decodedToken = jwt.verify(
        authHeaderArray[1],
        process.env.JWT_PRIVATE_KEY
      );
    } catch (err) {
      err.statusCode = httpStatusCode.unauthorized;
      err.responseCode = "UNAUTHORIZED";
      err.message = "ACCESS_TOKEN_EXPIRED";
      throw err;
    }

    if (!decodedToken) {
      throw common.failureResponse({
        message: "UNAUTHORIZED_REQUEST",
        statusCode: httpStatusCode.unauthorized,
        responseCode: "UNAUTHORIZED",
      });
    }

    if (decodedToken.userType === "employee") {
      let employee = await emloyeeQueries.findOne({ _id: decodedToken._id });

      if (!employee)
        throw common.failureResponse({
          message: "Account does not exist!",
          statusCode: httpStatusCode.unauthorized,
          responseCode: "UNAUTHORIZED",
        });

      if (employee.role.name !== "SUPER ADMIN") {
        req.schoolId = decodedToken.schoolId;
        if (!USER_REQUEST_URL && !REQUESTED_FROM_MOBILE)
          throw common.failureResponse({
            message: "INVALID_REQUEST_URL",
            statusCode: httpStatusCode.bad_request,
            responseCode: "BAD_REQUEST",
          });

        if (REQUESTED_FROM_MOBILE && !REQUESTED_MODULE)
          throw common.failureResponse({
            message: "INVALID_REQUEST",
            statusCode: httpStatusCode.bad_request,
            responseCode: "BAD_REQUEST",
          });
        const controller = getSecondTwoWordsAfterV1(req.originalUrl)[0];

        if (controller !== "account") {
          let rolePermissions = employee.role?.permissions;
          let requiredPermissionModuleName = REQUESTED_FROM_MOBILE
            ? REQUESTED_MODULE
            : PATH_TO_MODULE[USER_REQUEST_URL.split("/").pop()];

          if (!requiredPermissionModuleName) {
            let checkEditAddPath = extractURL(USER_REQUEST_URL);
            requiredPermissionModuleName = REQUESTED_FROM_MOBILE
              ? REQUESTED_MODULE
              : PATH_TO_MODULE[checkEditAddPath];
          }

          if (!requiredPermissionModuleName)
            throw common.failureResponse({
              message: "PERMISSION_DENIED",
              statusCode: httpStatusCode.bad_request,
              responseCode: "CLIENT_ERROR",
            });

          let modulePresent = rolePermissions.filter(
            (r) =>
              r.module.toLowerCase() ===
              requiredPermissionModuleName?.toLowerCase()
          )[0];

          if (
            !modulePresent?.module ||
            !modulePresent.permissions.includes(
              METHOD_MAP[req.method.toLowerCase()]
            )
          ) {
            throw common.failureResponse({
              message: "PERMISSION_DENIED",
              statusCode: httpStatusCode.bad_request,
              responseCode: "CLIENT_ERROR",
            });
          }
        }
      } else {
        if (["post", "put", "patch"].includes(req.method.toLowerCase())) {
          req.schoolId = req.body.schoolId;
          delete req.body.schoolId;
        } else {
          req.schoolId = req.query.schoolId;
        }
      }

      req.employee = employee;

      next();
    } else if (decodedToken.userType === "student") {
      let studentExists = await studentQueries.findOne({
        _id: decodedToken._id,
      });
      if (!studentExists) {
        throw common.failureResponse({
          message: "Account does not exist!",
          statusCode: httpStatusCode.unauthorized,
          responseCode: "UNAUTHORIZED",
        });
      }

      req.schoolId = studentExists.school._id;
      req.student = studentExists;

      next();
    } else {
      req.schoolId = decodedToken.schoolId;
      req.employee = decodedToken._id;
      next();
    }
  } catch (err) {
    next(err);
  }
};
