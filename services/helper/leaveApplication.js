const employeeQuery = require("@db/employee/queries");
const academicYearQuery = require("@db/academicYear/queries");
const studentQuery = require("@db/student/queries");
const leaveTypeQuery = require("@db/leaveType/queries");
const leaveApplicationQuery = require("@db/leaveApplication/queries");
const semesterQuery = require("@db/semester/queries");
const academicCalenderQuery = require("@db/academicCalender/queries");
const leaveAuthQuery = require("@db/leaveAuth/queries");
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

      if (dayjs(leaveStartDate).diff(leaveEndDate) >= 0)
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
          appliedBy: employee,
          leaveType: leaveTypeId,
          semester: activeSemester._id,
          academicYear: activeAcademicYear._id,
          description,
        });

        return common.successResponse({
          result: newLeaveApplication,
          message: "Leave application submitted successfully!",
          statusCode: httpStatusCode.ok,
        });
      }

      // case 2: Employees cannot apply for leaves if maximum leaves against this leave type is <= total leaves applied in this academic year
      let maximumLeaveApplicable = 12 * leaveType.numberOfLeaves;
      let allLeavedAppliedByCurrentEmployeeInThisAcademicYearForCurrentLeaveType =
        await leaveApplicationQuery.findAll({
          appliedBy: employee,
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
          appliedBy: employee,
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
          appliedBy: employee,
          leaveType: leaveTypeId,
          semester: activeSemester._id,
          academicYear: activeAcademicYear._id,
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

        const { endOfDay, startOfDay } = getDateRange(
          monthStartDate,
          monthStart
        );

        let allLeavedAppliedByCurrentEmployeeInPreviousMonthYearForCurrentLeaveType =
          await leaveApplicationQuery.findAll({
            appliedBy: employee,
            leaveType: leaveTypeId,
            academicYear: activeAcademicYear._id,
            leaveStatus: "approved",
            createdAt: { $gte: startOfDay, $lt: endOfDay },
          });

        let startMonth = new Date(monthStartDate).getMonth() + 1;
        let endMonth = new Date(monthStart).getMonth() + 1;
        let difference =
          endMonth - startMonth > 0
            ? endMonth - startMonth + 1
            : (endMonth - startMonth) * -1 + 1;

        let maximumLeaveApplicable = leaveType.numberOfLeaves * difference;
        let leavesLeftToBeTaken =
          maximumLeaveApplicable -
          allLeavedAppliedByCurrentEmployeeInPreviousMonthYearForCurrentLeaveType.length;

        let totalLeavesApplicable =
          leavesLeftToBeTaken > leaveType.carryForwardCount
            ? leaveType.carryForwardCount
            : leavesLeftToBeTaken;

        if (totalLeavesApplicable <= totalDays) {
          let newLeaveApplication = await leaveApplicationQuery.create({
            totalDays: totalLeavesApplicable,
            startDate: leaveStartDate,
            endDate: leaveEndDate,
            files: fileList,
            subject,
            appliedByType: "employee",
            appliedBy: employee,
            leaveType: leaveTypeId,
            semester: activeSemester._id,
            academicYear: activeAcademicYear._id,
            description,
          });

          return common.successResponse({
            result: newLeaveApplication,
            message: "Leave application submitted successfully!",
            statusCode: httpStatusCode.ok,
          });
        }
      }

      return common.failureResponse({
        statusCode: httpStatusCode.bad_request,
        message: "Insufficient leave credits left!",
        responseCode: "CLIENT_ERROR",
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
        academicYear: activeAcademicYear._id,
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

  static async delete(req) {
    try {
      let application = await leaveApplicationQuery.findOne({
        appliedBy: req.student?._id || req.employee,
        _id: req.params.id,
      });
      if (!application)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Leave application was not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (application.leaveStatus === "approved")
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Cannot delete an approved leave application!",
          responseCode: "CLIENT_ERROR",
        });

      await leaveApplicationQuery.delete({
        _id: req.params.id,
        leaveStatus: { $ne: "approved" },
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Leave application deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async approveLeave(req) {
    try {
      const leaveId = req.params.id;

      let initialLeaveApplication = await leaveApplicationQuery.findOne({
        _id: leaveId,
      });
      if (!initialLeaveApplication)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Leave application was not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (
        initialLeaveApplication.leaveType?.needsGuardianApproval &&
        !initialLeaveApplication.approvedByGuardian
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Leave application needs to be approved by a guardian first!",
          responseCode: "CLIENT_ERROR",
        });
      }

      let updatedLeaveApplication = await leaveApplicationQuery.updateOne(
        { _id: leaveId },
        { $set: { leaveStatus: "approved", approvedBy: req.employee } },
        { new: true }
      );

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

      const leaveApplicationExits = await leaveApplicationQuery.findOne({
        _id: id,
      });
      if (!leaveApplicationExits)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Leave application not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (leaveApplicationExits.leaveStatus === "approved")
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Leave application cannot be rejected once it is approved!",
          responseCode: "CLIENT_ERROR",
        });

      const leaveApplication = await leaveApplicationQuery.updateOne(
        { _id: id },
        {
          leaveStatus: "rejected",
          approvedBy: req.employee,
        },
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Leave is rejected successfully!!!",
        result: leaveApplication,
      });
    } catch (err) {
      throw err;
    }
  }

  static async listMyApplications(req) {
    try {
      const leaveApplications = await leaveApplicationQuery.findAll({
        appliedBy: req.employee || req.student._id,
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

  static async listApplicationsForApproval(req) {
    try {
      // as a proctor
      // as a authority;

      let studentsUnderCurrentEmployee = await studentQuery.findAll({
        mentor: req.employee,
      });
      let employeesUnderMyAuthority = await leaveAuthQuery.findOne({
        canBeApprovedBy: req.employee,
      });

      const leaveApplications = await leaveApplicationQuery.findAll({
        $or: [
          { appliedBy: studentsUnderCurrentEmployee.map((s) => s._id) },
          {
            appliedBy: employeesUnderMyAuthority?.employees?.map((e) => e._id),
          },
        ],
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
        _id: req.employee,
      });

      let departmentOfCurrentEmployee = employee.academicInfo?.department?._id;
      console.log(departmentOfCurrentEmployee, "departmentOfCurrentEmployee");
      let allLeaveTypes = await leaveTypeQuery.findAll({
        leaveTypeFor: "Employee",
        departments: { $in: [departmentOfCurrentEmployee] },
      });

      const activeAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!activeAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found!",
          responseCode: "CLIENT_ERROR",
        });

      let data = [];

      const { endDate: monthEnd, startDate: monthStart } =
        getCurrentMonthRange();
      const { startOfDay, endOfDay } = getDateRange(monthStart, monthEnd);

      for (let leaveType of allLeaveTypes) {
        let newData = {
          name: leaveType.name,
          _id: leaveType._id,
          allLeaves: leaveType.numberOfLeaves,
          maximumLeaves: leaveType.numberOfLeaves * 12,
        };

        let allLeaveApplicationsAppliedForThisMonth =
          await leaveApplicationQuery.findAll({
            academicYear: activeAcademicYear._id,
            appliedBy: req.employee,
            leaveType: leaveType._id,
            leaveStatus: "approved",
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          });

        newData["availableLeaves"] =
          newData.allLeaves - allLeaveApplicationsAppliedForThisMonth.length;

        if (leaveType.canCarryForward) {
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

          const { endOfDay, startOfDay } = getDateRange(
            monthStartDate,
            monthStart
          );

          let allLeavedAppliedByCurrentEmployeeInPreviousMonthYearForCurrentLeaveType =
            await leaveApplicationQuery.findAll({
              appliedBy: employee,
              leaveType: leaveType._id,
              academicYear: activeAcademicYear._id,
              leaveStatus: "approved",
              createdAt: { $gte: startOfDay, $lt: endOfDay },
            });

          let startMonth = new Date(monthStartDate).getMonth() + 1;
          let endMonth = new Date(monthStart).getMonth() + 1;
          let difference =
            endMonth - startMonth > 0
              ? endMonth - startMonth + 1
              : (endMonth - startMonth) * -1 + 1;

          let maximumLeaveApplicable = leaveType.numberOfLeaves * difference;
          let leavesLeftToBeTaken =
            maximumLeaveApplicable -
            allLeavedAppliedByCurrentEmployeeInPreviousMonthYearForCurrentLeaveType.length;

          let totalLeavesApplicable =
            leavesLeftToBeTaken > leaveType.carryForwardCount
              ? leaveType.carryForwardCount
              : leavesLeftToBeTaken;

          newData["allLeaves"] = newData.allLeaves + totalLeavesApplicable;
          newData["leavesLeftToBeTaken"] =
            newData.leavesLeftToBeTaken + totalLeavesApplicable;
        }

        data.push(newData);
      }
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: data,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getLeavesAppliedByUserReport(req) {
    try {
      const { academicYear, userId } = req.query;

      const leaveApplications = await leaveApplicationQuery.findAll({
        academicYear,
        appliedBy: userId,
        leaveStatus: "approved",
      });

      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet(`Leave-Applied-${userId}`);

      const HEADER = [
        "S.NO",
        "Leave Type",
        "Total Days",
        "From Date",
        "To Date",
        "Subject",
        "Description",
        "Approved By",
      ];

      worksheet.addRow(HEADER);

      let row1 = worksheet.getRow(1);

      row1.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center" };
      });

      for (let app of leaveApplications) {
        let newRow = [
          leaveApplications.indexOf(app) + 1,
          app.leaveType.name,
          app.totalDays,
          dayjs(app.startDate).format("DD/MM/YYYY"),
          dayjs(app.endDate).format("DD/MM/YYYY"),
          app.subject,
          app.description,
          app.approvedBy?.basicInfo?.name,
        ];

        worksheet.addRow(newRow);
      }

      worksheet.columns.forEach((column, index) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 0
          );
        });

        column.width = maxLength + 2;
      });

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          // Apply horizontal and vertical alignment to center the content
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });
      });

      let buffer = await workbook.xlsx.writeBuffer();

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: buffer,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
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

  static async getMyWardApplications(req) {
    try {
      const student = await studentQuery.findOne({
        "academicInfo.registarionNumber": req.registartionNumber,
      });
      if (!student)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student not found",
          responseCode: "CLIENT_ERROR",
        });

      let allLeavesAppliedByStudent = await leaveApplicationQuery.findAll({
        appliedBy: student._id,
        needsGuardianApproval: true,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: allLeavesAppliedByStudent,
      });
    } catch (error) {
      throw error;
    }
  }

  static async approveMyWardLeave(req) {
    try {
      let leaveApplication = await leaveApplicationQuery.findOne({
        _id: req.params.id,
      });
      if (!leaveApplication)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Leave application not found",
          responseCode: "CLIENT_ERROR",
        });

      if (leaveApplication.leaveStatus === "approved") {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Leave application is already approved",
          responseCode: "CLIENT_ERROR",
        });
      }

      let updatedLeave = await leaveApplicationQuery.updateOne(
        { _id: req.params.id },
        { $set: { approvedByGuardian: true } }
      );
      if (!updatedLeave)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Failed to approve leave application",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Leave application approved successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
