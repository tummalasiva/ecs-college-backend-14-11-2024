const employeeAttendanceQuery = require("@db/attendance/employeeAttendance/queries");
const EmployeeAttendance = require("@db/attendance/employeeAttendance/model");

const employeeQuery = require("@db/employee/queries");
const academicYearQuery = require("@db/academicYear/queries");
const roleQuery = require("@db/role/queries");
const httpStatusCode = require("@generics/http-status");
const moment = require("moment");
const common = require("@constants/common");
const {
  getDateRange,
  stripTimeFromDate,
  notFoundError,
} = require("../../helper/helpers");
const { default: mongoose } = require("mongoose");

module.exports = class EmployeeAttendanceService {
  static async list(req) {
    try {
      const { roleId, date } = req.query;
      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return notFoundError("Current academic year not found");
      let roleWithGivenId = await roleQuery.findOne({ _id: roleId });
      if (!roleWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Role not found!",
          responseCode: "CLIENT_ERROR",
        });

      let employeesWithGivenRole = await employeeQuery.findAll({
        role: roleId,
        school: req.schoolId,
      });
      if (!employeesWithGivenRole.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Employees with given role were not found!",
          responseCode: "CLIENT_ERROR",
        });

      let employeeIds = employeesWithGivenRole.map((e) => e._id?.toString());

      let attendanceList = await employeeAttendanceQuery.findAll({
        school: req.schoolId,
        academicYear: currentAcademicYear._id,
        employee: { $in: employeeIds },
        date: stripTimeFromDate(date),
      });

      let modifiedList = [];
      for (let employee of employeesWithGivenRole) {
        let attendance = attendanceList.find(
          (a) => a.employee._id.toHexString() === employee._id.toHexString()
        );
        if (attendance) {
          modifiedList.push(attendance);
        } else {
          let newAtt = {
            employee: employee,
            attendanceStatus: "present",
          };

          modifiedList.push(newAtt);
        }
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Employee attendance fetched successfully",
        result: modifiedList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { attendanceData, date } = req.body;
      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return notFoundError("Current academic year not found");

      const bulkOps = attendanceData.map((item) => {
        return {
          updateOne: {
            filter: {
              school: req.schoolId,
              date: stripTimeFromDate(date),
              employee: item.employee,
              academicYear: currentAcademicYear._id,
            },
            update: {
              $set: { attendanceStatus: item.attendanceStatus },
            },
            upsert: true,
          },
        };
      });

      await EmployeeAttendance.bulkWrite(bulkOps);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Employee attendance updated successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAttendanceReport(req) {
    try {
      const { fromDate, toDate, roleId } = req.query;
      if (!fromDate || !toDate || !roleId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide date range and role",
          responseCode: "CLIENT_ERROR",
        });

      let employees = await employeeQuery.findAll({
        role: roleId,
        school: req.schoolId,
      });

      const { startOfDay, endOfDay } = getDateRange(fromDate, toDate);

      const results = [];

      for (const employee of employees) {
        const attendanceRecords = await employeeAttendanceQuery.findAll({
          school: req.schoolId,
          employee: employee._id,
          date: { $gte: startOfDay, $lte: endOfDay },
        });

        const workingDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(
          (record) => record.attendanceStatus === "present"
        ).length;
        const percentagePresent =
          workingDays > 0 ? (presentDays / workingDays) * 100 : 0;

        results.push({
          employee: employee.basicInfo.name,
          workingDays,
          presentDays,
          percentagePresent: percentagePresent.toFixed(2),
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Employee attendance report fetched successfully",
        result: results,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getEmployeeAttendanceSummaryForToday(req) {
    try {
      const academicYear = await academicYearQuery.findOne({ active: true });
      if (!academicYear) return notFoundError("No active academic year found");
      let academicYearId = academicYear._id.toString();
      const today = moment().startOf("day").toDate();

      // Get all active employees for the given academic year
      const employees = await employeeQuery.findAll({
        school: req.schoolId,
        active: true,
      });

      console.log(employees.length, "employees");

      // Get all attendance records for today
      const attendanceRecords = await EmployeeAttendance.find({
        school: mongoose.Types.ObjectId(req.schoolId),
        academicYear: mongoose.Types.ObjectId(academicYearId),
        date: today,
      }).lean();

      console.log(attendanceRecords.length, "attendanceRecords");

      const totalEmployees = employees.length;
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLate = 0;
      let attendanceNotTaken = 0;

      const attendanceMap = attendanceRecords.reduce((acc, record) => {
        acc[record.employee.toString()] = record.attendanceStatus;
        return acc;
      }, {});

      employees.forEach((employee) => {
        const employeeId = employee._id.toString();
        if (attendanceMap[employeeId] === "present") {
          totalPresent++;
        } else if (attendanceMap[employeeId] === "absent") {
          totalAbsent++;
        } else if (attendanceMap[employeeId] === "late") {
          totalLate++;
        } else {
          attendanceNotTaken++;
        }
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fetched today's employee attendance summary successfully!",
        result: {
          totalEmployees,
          totalPresent,
          totalAbsent,
          attendanceNotTaken,
          totalLate,
        },
      });
    } catch (error) {
      throw error;
    }
  }
};
