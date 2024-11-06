const guardianQuery = require("@db/guardian/queries");
const CoursePlan = require("@db/coursePlan/model");
const studentQuery = require("@db/student/queries");
const StudentAttendance = require("@db/attendance/studentAttendance/model");
const employeeQuery = require("@db/employee/queries");
const semesterQuery = require("@db/semester/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");
const announcementQuery = require("@db/announcement/queries");
const examScheduleQuery = require("@db/examSchedule/queries");
const StudentTimeTable = require("@db/studentTimeTable/model");
const slotQuery = require("@db/slot/queries");
const eventQuery = require("@db/event/queries");
const { default: mongoose } = require("mongoose");
const dayjs = require("dayjs");
const { stripTimeFromDate } = require("../../helper/helpers");

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

      let employee = await employeeQuery.findOne({ _id: student.mentor._id });
      if (!employee)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Mentor not found",
          responseCode: "CLIENT_ERROR",
        });

      let data = {
        name: employee.basicInfo.name,
        contactNumber: employee.contactNumber,
        email: employee.academicInfo.email,
        designation: employee.basicInfo.designation,
        department: employee.academicInfo.department,
        photo: employee.photo,
        building: employee.academicInfo.building?.name,
        room: employee.academicInfo.room?.roomNumber,
        cabinNumber: employee.academicInfo.cabinNumber,
      };

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: data,
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
                $cond: [{ $eq: ["$attendanceStatus", "present"] }, 1, 0],
              },
            },
            totalAbsent: {
              $sum: { $cond: [{ $eq: ["$attendanceStatus", "absent"] }, 1, 0] },
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

  static async getDashboardData(req) {
    try {
      const registrationNumber = req.registrationNumber;
      let activeSemester = await semesterQuery.findOne({ active: true });

      let student = await studentQuery.findOne({
        "academicInfo.registrationNumber": registrationNumber,
        "academicInfo.semester": activeSemester._id,
      });

      let sections = student.academicInfo.section;
      let year = student.academicInfo.year;

      let todaysSubjects = await CoursePlan.aggregate([
        {
          $match: {
            year: Number(year),
            section: { $in: sections },
            semester: activeSemester._id,
            // $expr: {
            //   $eq: [
            //     { $dateToString: { format: "%Y-%m-%d", date: "$plannedDate" } },
            //     {
            //       $dateToString: {
            //         format: "%Y-%m-%d",
            //         date: stripTimeFromDate(new Date()),
            //       },
            //     },
            //   ],
            // },
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $unwind: "$subject",
        },
      ]);

      let upcomingExams = await examScheduleQuery.findAll({
        students: { $in: [student._id] },
        date: { $gte: new Date() },
      });

      const allAnnouncements = await announcementQuery.findAll({
        announcementFor: "Parents",
        degreeCodes: { $in: [student.academicInfo.degreeCode?._id] },
        years: { $in: [student.academicInfo.year] },
        semester: activeSemester?._id,
        createdAt: { $gte: dayjs(new Date()).subtract(1, "month").toDate() },
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: { todaysSubjects, upcomingExams, allAnnouncements },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getTimeTable(req) {
    try {
      const registrationNumber = req.registrationNumber;
      let activeSemester = await semesterQuery.findOne({ active: true });

      let student = await studentQuery.findOne({
        "academicInfo.registrationNumber": registrationNumber,
        "academicInfo.semester": activeSemester._id,
      });

      let sections = student.academicInfo.section.map((s) => s._id);
      let year = student.academicInfo.year;

      const filter = {
        year: parseInt(year),
        degreeCode: student.academicInfo.degreeCode?._id,
        semester: activeSemester._id,
      };

      filter.section = {
        $in: sections,
      };

      const groupedTimeTable = await StudentTimeTable.aggregate([
        {
          $match: filter,
        },
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $unwind: "$subject",
        },
        {
          $lookup: {
            from: "slots",
            localField: "slots",
            foreignField: "_id",
            as: "slot",
          },
        },
        {
          $unwind: "$slot",
        },
        {
          $lookup: {
            from: "buildingrooms",
            localField: "room",
            foreignField: "_id",
            as: "room",
          },
        },
        {
          $unwind: "$room",
        },

        {
          $lookup: {
            from: "buildings",
            localField: "building",
            foreignField: "_id",
            as: "building",
          },
        },
        {
          $unwind: "$building",
        },

        {
          $lookup: {
            from: "sections",
            localField: "section",
            foreignField: "_id",
            as: "section",
          },
        },
        {
          $unwind: "$section",
        },
        {
          $group: {
            _id: "$day",
            timetableEntries: { $push: "$$ROOT" },
          },
        },

        {
          $sort: { _id: 1 },
        },
      ]);

      const allSlots = await slotQuery.findAll({ type: "Class" });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: { timetable: groupedTimeTable, slots: allSlots },
      });
    } catch (error) {
      throw error;
    }
  }
};
