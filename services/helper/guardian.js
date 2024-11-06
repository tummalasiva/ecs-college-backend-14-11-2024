const guardianQuery = require("@db/guardian/queries");
const studentQuery = require("@db/student/queries");
const StudentAttendance = require("@db/attendance/studentAttendance/model");
const employeeQuery = require("@db/employee/queries");
const semesterQuery = require("@db/semester/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");
const { default: mongoose } = require("mongoose");

module.exports = class GuardianService {
  static async list(req) {
    try {
      const { academicYear, degreeCode, section } = req.query;

      const students = await studentQuery.findAll({
        academicYear,
        "academicInfo.degreeCode": degreeCode,
        "academicInfo.section": { $in: [section] },
      });

      let registrationNumbers = students.map(
        (s) => s.academicInfo.registrationNumber
      );
      const guardians = await guardianQuery.findAll({
        wardRegistrationNumber: { $in: registrationNumbers },
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: guardians,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getProctorDetails(req) {
    try {
      const { semester } = req.query;

      const student = await studentQuery.findOne({
        "academicInfo.registrationNumber": req.registrationNumber,
        "academicInfo.semester": semester,
      });
      if (!student)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student not found",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: student.mentor,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getSemesters(req) {
    try {
      const students = await studentQuery.findAll({
        "academicInfo.registrationNumber": req.registrationNumber,
      });
      let semesters = students.map((s) => s.academicInfo.semester?._id);

      let allSemesters = await semesterQuery.findAll({
        _id: { $in: semesters },
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: allSemesters,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAllSubjects(req) {
    try {
      const { semester } = req.query;

      const student = await studentQuery.findOne({
        "academicInfo.registrationNumber": req.registrationNumber,
        "academicInfo.semester": semester,
      });

      if (!student)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student not found",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: student.registeredSubjects,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAttendance(req) {
    try {
      const { subject, semester } = req.query;

      let student = await studentQuery.findOne({
        "academicInfo.registrationNumber": req.registrationNumber,
        "academicInfo.semester": semester,
      });

      const filter = {
        subject: mongoose.Types.ObjectId(subject),
        semester: mongoose.Types.ObjectId(semester),
        student: student._id,
      };

      let attendanceData = await StudentAttendance.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: null,
            totalPresent: {
              $sum: {
                $cond: [{ $eq: ["$attendanceStatus", "Present"] }, 1, 0],
              },
            },
            totalAbsent: {
              $sum: { $cond: [{ $eq: ["$attendanceStatus", "Absent"] }, 1, 0] },
            },
            totalClasses: { $sum: 1 },
            data: {
              $push: {
                date: "$date",
                attendanceStatus: "$attendanceStatus",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            present: "$totalPresent",
            absent: "$totalAbsent",
            totalClasses: "$totalClasses",
            data: 1,
            percentage: {
              $divide: [{ $multiply: ["$totalPresent", 100] }, "$totalClasses"],
            },
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: attendanceData[0],
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleActiveStatus(req) {
    try {
      const updatedDoc = await guardianQuery.updateOne({ _id: req.params.id }, [
        { $set: { active: { $eq: ["$active", false] } } },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Guardian status updated successfully!",
        result: updatedDoc,
      });
    } catch (error) {
      throw error;
    }
  }
};
