const employeeQuery = require("@db/employee/queries");
const designationQuery = require("@db/designation/queries");
const departmentQuery = require("@db/department/queries");
const roleQuery = require("@db/role/queries");
const academicYearQuery = require("@db/academicYear/queries");
const sectionQuery = require("@db/section/queries");
const studentQuery = require("@db/student/queries");
const leaveTypeQuery = require("@db/leaveType/queries");
const leaveApplicationQuery = require("@db/leaveApplication/queries");
const semesterQuery = require("@db/semester/queries");
const academicCalenderQuery = require("@db/academicCalender/queries");
const ExcelJS = require("exceljs");
// const path = require("path");
// packages
const puppeteer = require("puppeteer");
const path = require("path");
const moment = require("moment");
//helpers
const {
  compileTemplate,
  uploadFileToS3,
  deleteFile,
  getMonthStartAndEndMonth,
  getCurrentMonthRange,
  getDateRange,
} = require("../../helper/helpers");

const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const dayjs = require("dayjs");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class LeaveApplicationService {
  static async createEmployeeLeaveApplication(body, files, employee) {
    try {
      const {
        leaveTypeId,
        startDate,
        endDate,
        subject,
        description,
        totalDays,
      } = body;

      let fileList = [];

      if (files) {
        if (Array.isArray(files.file)) {
          for (let file of files.file) {
            let uploadedFile = await uploadFileToS3(file);
            fileList.push(uploadedFile);
          }
        } else {
          let uploadedFile = await uploadFileToS3(files.file);
          fileList.push(uploadedFile);
        }
      }

      const activeAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!activeAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      const activeSemester = await semesterQuery.findOne({
        active: true,
        academicYear: activeAcademicYear?._id,
      });
      if (!activeSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let leaveType = await leaveTypeQuery.findOne({
        _id: leaveTypeId,
        school,
      });
      if (!leaveType)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Leave type not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (leaveType.leaveTypeFor === "Student")
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Employees cannot create leave in student category!",
          responseCode: "CLIENT_ERROR",
        });

      let leaveStartDate = new Date(startDate);
      let leaveEndDate = new Date(endDate);
      let totalLeaveDaysApplied = parseInt(totalDays);

      if (dayjs(leaveStartDate).diff(leaveEndDate) <= 0)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Start date should be before end date!",
          responseCode: "CLIENT_ERROR",
        });

      // case 1: If leaveType is special can create as many leaves as needed;
      if (leaveType.specialType) {
        let newLeaveApplication = await leaveApplicationQuery.create({
          totalDays: parseInt(totalDays),
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          files: fileList,
          subject,
          appliedByType: "employee",
          appliedBy: employee._id,
          leaveType: leaveTypeId,
          semester: activeSemester._id,
          description,
        });

        return common.successResponse({
          result: newLeaveApplication,
          message: "Leave application submitted successfully!",
          statusCode: httpStatusCode.ok,
        });
      }

      // case 2: Employees cannot apply for leaves if maximum leaves against this leave type is < total leaves applied in this academic year
      let maximumLeaveApplicable = 12 * leaveType.numberOfLeaves;
      let allLeavedAppliedByCurrentEmployeeInThisAcademicYearForCurrentLeaveType =
        await leaveApplicationQuery.findAll({
          appliedBy: employee._id,
          leaveType: leaveTypeId,
          academicYear: activeAcademicYear._id,
          leaveStatus: "approved",
        });

      if (
        maximumLeaveApplicable <=
        allLeavedAppliedByCurrentEmployeeInThisAcademicYearForCurrentLeaveType.length +
          totalDays
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No available leaves available for current leave type",
          responseCode: "CLIENT_ERROR",
        });

      // case 3: if for the given month leave of this leave type is already applied and leaves can be carried forward , then check the total available leaves and then apply for leave;
      let maximumLeaveApplicableForCurrentMonth = leaveType.numberOfLeaves;

      const { endDate: monthEnd, startDate: monthStart } =
        getCurrentMonthRange();
      const { startOfDay, endOfDay } = getDateRange(monthStart, monthEnd);

      let allLeavedAppliedByCurrentEmployeeInThisMonthYearForCurrentLeaveType =
        await leaveApplicationQuery.findAll({
          appliedBy: employee._id,
          leaveType: leaveTypeId,
          academicYear: activeAcademicYear._id,
          leaveStatus: "approved",
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        });

      if (
        maximumLeaveApplicableForCurrentMonth >=
        allLeavedAppliedByCurrentEmployeeInThisMonthYearForCurrentLeaveType.length +
          totalDays
      ) {
        let newLeaveApplication = await leaveApplicationQuery.create({
          totalDays: totalLeaveDaysApplied,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          files: fileList,
          subject,
          appliedByType: "employee",
          appliedBy: employee._id,
          leaveType: leaveTypeId,
          semester: activeSemester._id,
          description,
        });

        return common.successResponse({
          result: newLeaveApplication,
          message: "Leave application submitted successfully!",
          statusCode: httpStatusCode.ok,
        });
      } else if (
        maximumLeaveApplicableForCurrentMonth <
          allLeavedAppliedByCurrentEmployeeInThisMonthYearForCurrentLeaveType.length +
            totalDays &&
        leaveType.canCarryForward
      ) {
        // get total leaves not taken in the previous months and if is greater than 0 then check what is the maximum caryforward count;
        let academicCalender = await academicCalenderQuery.findOne({
          academicYear: activeAcademicYear._id,
        });
        if (!academicCalender)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Academic calender not found!",
            responseCode: "CLIENT_ERROR",
          });

        let firstAcademicSemesterStartData = academicCalender.terms.find(
          (t) => t.semester === "First Academic Semester"
        )?.classesStartDate;
        if (!firstAcademicSemesterStartData)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Academic start date not found!",
            responseCode: "CLIENT_ERROR",
          });

        const { startDate: monthStartDate } = getCurrentMonthRange(
          firstAcademicSemesterStartData
        );
      }

      let newLeaveApplication = await leaveApplicationQuery.create({
        totalDays: totalLeaveDaysApplied,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        files: fileList,
        subject,
        appliedByType: "employee",
        appliedBy: employee._id,
        leaveType: leaveTypeId,
        semester: activeSemester._id,
        description,
      });

      return common.successResponse({
        result: newLeaveApplication,
        message: "Leave application submitted successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (err) {
      throw err;
    }
  }

  static async createStudentLeaveApplication(body, files, student) {
    try {
      const { leaveTypeId, startDate, endDate, subject, description } = body;

      let fileList = [];

      if (files) {
        if (Array.isArray(files.file)) {
          for (let file of files.file) {
            let uploadedFile = await uploadFileToS3(file);
            fileList.push(uploadedFile);
          }
        } else {
          let uploadedFile = await uploadFileToS3(files.file);
          fileList.push(uploadedFile);
        }
      }

      const activeAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!activeAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      const activeSemester = await semesterQuery.findOne({
        active: true,
        academicYear: activeAcademicYear?._id,
      });
      if (!activeAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      let leaveType = await leaveTypeQuery.findOne({
        _id: leaveTypeId,
      });
      if (!leaveType)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Leave type not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (leaveType.leaveTypeFor === "Employee")
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Students cannot create leave in Employee category!",
          responseCode: "CLIENT_ERROR",
        });

      let leaveStartDate = new Date(startDate);
      let leaveEndDate = new Date(endDate);
      let totalLeaveDaysApplied = parseInt(
        moment(leaveEndDate).diff(leaveStartDate, "days")
      );

      if (totalLeaveDaysApplied <= 0)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Start date should be before end date!",
          responseCode: "CLIENT_ERROR",
        });

      let newLeaveApplication = await leaveApplicationQuery.create({
        totalDays: totalLeaveDaysApplied,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        files: fileList,
        subject,
        appliedByType: "student",
        semester: activeSemester._id,
        appliedBy: student._id,
        leaveType: leaveTypeId,
        academicYear: activeAcademicYear._id,
        description,
        approvedByGuardian: leaveType.needsGuardianApproval ? false : true,
      });

      return common.successResponse({
        result: newLeaveApplication,
        message: "Leave application submitted successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (err) {
      throw err;
    }
  }

  static async approveLeave(req) {
    try {
      const leaveId = req.params.id;

      let initialLeaveApplication = await leaveApplicationQuery.findOne({
        _id: leaveId,
        school: req.schoolId,
      });
      if (!initialLeaveApplication)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Leave application was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let updatedLeaveApplication = await leaveApplicationQuery.updateOne(
        { _id: leaveId },
        { $set: { leaveStatus: "approved", approvedBy: req.employee._id } },
        { new: true }
      );

      if (
        initialLeaveApplication.leaveStatus === "rejected" &&
        initialLeaveApplication.leaveType.leaveTypeFor === "Employee"
      ) {
        await employeeQuery.updateOne(
          { "currentLeaveCredits._id": updatedLeaveApplication.leaveType },
          {
            $inc: {
              "currentLeaveCredits.$.total": -updatedLeaveApplication.totalDays,
              "currentLeaveCredits.$.totalTaken":
                +updatedLeaveApplication.totalDays,
            },
          }
        );
      }
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Leave application approved successfully!",
        result: updatedLeaveApplication,
      });
    } catch (err) {
      throw err;
    }
  }

  static async rejectLeave(req) {
    try {
      const id = req.params.id;

      const leaveApplication = await leaveApplicationQuery.updateOne(
        { _id: id },
        {
          leaveStatus: "rejected",
          approvedBy: req.employee._id,
        },
        { new: true }
      );

      if (leaveApplication.leaveType.leaveTypeFor === "Employee") {
        await employeeQuery.updateOne(
          { "currentLeaveCredits._id": leaveApplication.leaveType },
          {
            $inc: {
              "currentLeaveCredits.$.total": leaveApplication.totalDays,
              "currentLeaveCredits.$.totalTaken": -leaveApplication.totalDays,
            },
          }
        );
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Leave is rejected successfully!!!",
        result: leaveApplication,
      });
    } catch (err) {
      throw err;
    }
  }

  static async list(req) {
    try {
      const allRoles = await roleQuery.findAll({});

      const allRoleNames = allRoles.map((r) => r.name);

      if (["SUPER ADMIN", "ADMIN"].includes(req.employee.role.name)) {
        let leaveApplications = await leaveApplicationQuery.findAll({
          applierRoleName: { $in: allRoleNames },
        });
        return common.successResponse({
          result: leaveApplications,
          statusCode: httpStatusCode.ok,
          message: "Leave applications fetched successfully!",
        });
      } else if (req.employee.role.name === "TEACHER") {
        let allSectionsThatDoesHaveCurrentEmployeeAsTheSectionTeacher =
          await sectionQuery.findAll({
            sectionTeacher: req.employee._id,
            school: req.schoolId,
          });
        let allSectionIds =
          allSectionsThatDoesHaveCurrentEmployeeAsTheSectionTeacher.map(
            (s) => s._id
          );
        let allStudentsInTheseSections = await studentQuery.findAll({
          school: req.schoolId,
          "academicInfo.section": { $in: allSectionIds },
        });
        let studentIds = allStudentsInTheseSections.map((s) => s._id);
        let allLeaveApplications = await leaveApplicationQuery.findAll({
          school: req.schoolId,
          applier: { $in: studentIds },
        });
        return common.successResponse({
          result: allLeaveApplications,
          statusCode: httpStatusCode.ok,
          message: "Leave applications fetched successfully!",
        });
      } else if (req.employee.role.name === "PRINCIPAL") {
        let allLeaveApplications = await leaveApplicationQuery.findAll({
          school: req.schoolId,
          applierRoleName: "STUDENT",
        });
        return common.successResponse({
          result: allLeaveApplications,
          statusCode: httpStatusCode.ok,
          message: "Leave applications fetched successfully!",
        });
      } else
        return common.failureResponse({
          message: "Invalid request",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
    } catch (error) {
      throw error;
    }
  }

  static async listEmployeeApplications(req) {
    try {
      const leaveApplications = await leaveApplicationQuery.findAll({
        applier: req.employee._id,
        school: req.schoolId,
      });
      return common.successResponse({
        result: leaveApplications,
        message: "All leaves fetched successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async listStudentApplications(req) {
    try {
      const leaveApplications = await leaveApplicationQuery.findAll({
        applier: req.student._id,
        school: req.schoolId,
      });
      return common.successResponse({
        result: leaveApplications,
        message: "All leaves fetched successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async employeeLeaveCredits(req) {
    try {
      const employee = await employeeQuery.findOne({
        _id: req.employee._id,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: employee?.currentLeaveCredits,
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadExcel(req) {
    try {
    } catch (error) {}
  }

  static async downloadPdf(req) {
    try {
    } catch (error) {}
  }
};
