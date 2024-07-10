const employeeQuery = require("@db/employee/queries");
const designationQuery = require("@db/designation/queries");
const departmentQuery = require("@db/department/queries");
const roleQuery = require("@db/role/queries");
const academicYearQuery = require("@db/academicYear/queries");
const sectionQuery = require("@db/section/queries");
const studentQuery = require("@db/student/queries");
const leaveTypeQuery = require("@db/leaveType/queries");
const leaveApplicationQuery = require("@db/leaveApplication/queries");
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
} = require("../../helper/helpers");

const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class LeaveApplicationService {
  static async createEmployee(body, files, employee) {
    try {
      const {
        leaveTypeId,
        startDate,
        endDate,
        subject,
        description,
        totalDays,
        school,
      } = body;

      let file = "";

      if (files && files.file) {
        file = await uploadFileToS3(files.file);
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

      // if employee is of same department as the leaveType department

      // if (
      //   !leaveType.departments.filter(
      //     (d) =>
      //       d._id.toHexString() ==
      //       employee.academicInfo?.department?._id?.toHexString()
      //   ).length
      // )
      //   return common.failureResponse({
      //     statusCode: httpStatusCode.bad_request,
      //     message: "You cannot apply this leave type!",
      //     responseCode: "CLIENT_ERROR",
      //   });

      let leaveStartDate = new Date(startDate);
      let leaveEndDate = new Date(endDate);
      let totalLeaveDaysApplied = parseInt(totalDays);

      if (leaveType.specialType) {
        let newLeaveApplication = await leaveApplicationQuery.create({
          totalDays: parseInt(totalDays),
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          applierRole: employee.role._id,
          applierRoleName: employee.role.name,
          file,
          subject,
          applier: employee._id,
          leaveType: leaveTypeId,
          academicYear: activeAcademicYear._id,
          school,
          description,
        });

        return common.successResponse({
          result: newLeaveApplication,
          message: "Leave application submitted successfully!",
          statusCode: httpStatusCode.ok,
        });
      }

      let currentLeaveCreditForThisLeaveType =
        employee.currentLeaveCredits.filter(
          (d) => d._id.toHexString() == leaveTypeId
        )[0];

      if (!currentLeaveCreditForThisLeaveType)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Please contact administrator to apply for this leave type!",
          responseCode: "CLIENT_ERROR",
        });

      if (
        currentLeaveCreditForThisLeaveType.total -
          currentLeaveCreditForThisLeaveType.totalTaken <
        totalLeaveDaysApplied
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Insufficient leave credits!",
          responseCode: "CLIENT_ERROR",
        });
      }

      let newLeaveApplication = await leaveApplicationQuery.create({
        totalDays: totalLeaveDaysApplied,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        applierRole: employee.role._id,
        applierRoleName: employee.role.name,
        file,
        subject,
        applier: employee._id,
        leaveType: leaveTypeId,
        academicYear: activeAcademicYear._id,
        school,
        description,
      });

      let emp = await employeeQuery.updateOne(
        { _id: employee._id, "currentLeaveCredits.name": leaveType.name },
        {
          $inc: {
            "currentLeaveCredits.$.totalTaken": totalLeaveDaysApplied,
            "currentLeaveCredits.$.total": -totalLeaveDaysApplied,
          },
        }
      );
      return common.successResponse({
        result: newLeaveApplication,
        message: "Leave application submitted successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (err) {
      throw err;
    }
  }

  static async createStudent(body, files, student) {
    try {
      const { leaveTypeId, startDate, endDate, subject, description, school } =
        body;

      let file = "";

      if (files && files.file) {
        file = await uploadFileToS3(files.file);
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

      let studentRole = await roleQuery.findOne({
        name: { $regex: new RegExp(`^${"STUDENT"}$`, "i") },
      });

      let newLeaveApplication = await leaveApplicationQuery.create({
        totalDays: totalLeaveDaysApplied,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        applierRole: studentRole._id,
        applierRoleName: "STUDENT",
        file,
        subject,
        applier: student._id,
        leaveType: leaveTypeId,
        academicYear: activeAcademicYear._id,
        school,
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
