const subjectQuery = require("@db/subject/queries");
const classQuery = require("@db/class/queries");
const sectionQuery = require("@db/section/queries");
const employeeQuery = require("@db/employee/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const studentAttendanceQuery = require("@db/attendance/studentAttendance/queries");
const schoolQuery = require("@db/school/queries");
const sessionQuery = require("@db/session/queries");
const academicYearQuery = require("@db/academicYear/queries");
const studentQuery = require("@db/student/queries");
const {
  notFoundError,
  stripTimeFromDate,
  getFirstAndLastDateOfMonth,
  getDateRange,
  compileTemplate,
} = require("../../helper/helpers");
const StudentAttendance = require("@db/attendance/studentAttendance/model");
const puppeteer = require("puppeteer");
const moment = require("moment");
const { default: mongoose } = require("mongoose");

module.exports = class StudentAttendanceService {
  static async list(req) {
    try {
      const { classId, sectionId, date } = req.query;
      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return notFoundError("Current active Academic Year not found");

      const students = await studentQuery.findAll({
        "academicInfo.class": classId,
        "academicInfo.section": sectionId,
        academicYear: currentAcademicYear._id,
        active: true,
      });

      let studentIds = students.map((s) => s._id.toString());

      let attendanceList = await studentAttendanceQuery.findAll({
        school: req.schoolId,
        student: { $in: studentIds },
        date: stripTimeFromDate(date),
      });

      let modifiedList = [];
      for (let student of students) {
        let attendance = attendanceList.find(
          (a) => a.student._id.toHexString() === student._id.toHexString()
        );
        if (attendance) {
          modifiedList.push(attendance);
        } else {
          let newAtt = {
            student: student,
            attendanceStatus: "present",
          };

          modifiedList.push(newAtt);
        }
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student attendance fetched successfully",
        result: modifiedList,
      });
    } catch (error) {
      throw error;
    }
  }
  static async update(req) {
    try {
      const { date, attendanceData, classId } = req.body;
      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return notFoundError("Active academic year not found");
      let schoolWithGivenId = await schoolQuery.findOne({ _id: req.schoolId });
      if (!schoolWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Institute not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (!schoolWithGivenId.studentAttendenceType)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Please specify the method of attendance for the student in the institute settings",
          responseCode: "CLIENT_ERROR",
        });

      let attendanceType = schoolWithGivenId.studentAttendenceType;

      if (attendanceType === "classWise") {
        // add any required authentication regarding who can take the attendance

        const bulkOps = attendanceData.map((item) => {
          return {
            updateOne: {
              filter: {
                school: req.schoolId,
                date: stripTimeFromDate(date),
                student: item.student,
                academicYear: currentAcademicYear._id,
                class: classId,
                attendanceType: "classWise",
              },
              update: {
                $set: { attendanceStatus: item.attendanceStatus },
              },
              upsert: true,
            },
          };
        });

        await StudentAttendance.bulkWrite(bulkOps);

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Student attendance updated successfully",
        });
      } else if (attendanceType === "sessionWise") {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Session Wise attendance not supported yet!",
          responseCode: "CLIENT_ERROR",
        });
      } else if (attendanceType === "subjectWise") {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject Wise attendance not supported yet!",
          responseCode: "CLIENT_ERROR",
        });
      } else {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid attendance method!",
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async getAttendanceReport(req) {
    try {
      const { academicYearId, classId, sectionId, month, year } = req.query;

      const { fromDate, toDate } = getFirstAndLastDateOfMonth(year, month);

      if (!fromDate || !toDate)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide date range and role",
          responseCode: "CLIENT_ERROR",
        });

      let students = await studentQuery.findAll({
        school: req.schoolId,
        "academicInfo.class": classId,
        "academicInfo.section": sectionId,
        academicYear: academicYearId,
        active: true,
      });

      const { startOfDay, endOfDay } = getDateRange(fromDate, toDate);

      const results = [];

      for (const student of students) {
        const attendanceRecords = await studentAttendanceQuery.findAll({
          school: req.schoolId,
          student: student._id,
          date: { $gte: startOfDay, $lte: endOfDay },
        });

        const workingDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(
          (record) => record.attendanceStatus === "present"
        ).length;
        const percentagePresent =
          workingDays > 0 ? (presentDays / workingDays) * 100 : 0;

        results.push({
          student: student.basicInfo.name,
          workingDays,
          presentDays,
          percentagePresent: percentagePresent.toFixed(2),
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student attendance report fetched successfully",
        result: results,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAttendanceOverview(req) {
    try {
      const { classId, date } = req.query;

      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return notFoundError("No active academic year found");

      const results = await StudentAttendance.aggregate([
        {
          $match: {
            class: mongoose.Types.ObjectId(classId),
            date: stripTimeFromDate(date),
            academicYear: currentAcademicYear._id,
          },
        },
        {
          // Lookup to populate the student document to get the section information
          $lookup: {
            from: "students",
            localField: "student",
            foreignField: "_id",
            as: "studentInfo",
          },
        },
        {
          // Unwind the studentInfo array to work with individual student documents
          $unwind: "$studentInfo",
        },
        {
          // Group by section and calculate total present and total absent counts
          $group: {
            _id: "$studentInfo.academicInfo.section",
            totalAbsent: {
              $sum: {
                $cond: [{ $eq: ["$attendanceStatus", "absent"] }, 1, 0],
              },
            },
            totalPresent: {
              $sum: {
                $cond: [{ $eq: ["$attendanceStatus", "present"] }, 1, 0],
              },
            },
            totalStudents: {
              $addToSet: "$student",
            },
          },
        },
        {
          // Calculate the percentage of present students
          $project: {
            section: "$_id",
            totalAbsent: 1,
            totalPresent: 1,
            totalStudents: { $size: "$totalStudents" },
            percentage: {
              $multiply: [
                { $divide: ["$totalPresent", { $size: "$totalStudents" }] },
                100,
              ],
            },
          },
        },
        {
          $lookup: {
            from: "sections",
            localField: "_id",
            foreignField: "_id",
            as: "sectionInfo",
          },
        },
        {
          $unwind: "$sectionInfo",
        },
        {
          // Sort the result by section
          $sort: { "sectionInfo.name": 1 },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Attendance overview fetched successfully",
        result: results,
      });
    } catch (error) {
      throw error;
    }
  }

  static async donwloadAbsentReport(req) {
    try {
      const { date, classId, sectionId } = req.query;
      if (!moment(req.query.date, "YYYY-MM-DD", true).isValid())
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid date format",
          responseCode: "CLIENT_ERROR",
        });

      const [classData, sectionData, academicYearData] = await Promise.all([
        classQuery.findOne({ _id: classId }),
        sectionQuery.findOne({ _id: sectionId, class: classId }),
        academicYearQuery.findOne({ active: true }),
      ]);

      if (!classData) return notFoundError("Class not found");
      if (!sectionData) return notFoundError("Section not found");
      if (!academicYearData)
        return notFoundError("Active Academic year not found");

      console.log(stripTimeFromDate(date), "date");

      const totalAttendance = await studentAttendanceQuery.findAll({
        class: classId,
        date: stripTimeFromDate(date),
        academicYear: academicYearData._id,
        attendanceStatus: "absent",
      });

      console.log(totalAttendance, "totalAttendance");

      const pdfData = {
        absentAttendace: totalAttendance,
        className: classData.name,
        date: moment(date).format("YYYY-MM-DD"),
      };
      const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ["--disable-extensions"],
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--hide-scrollbars",
          "--disable-gpu",
          "--mute-audio",
        ],
      });
      const page = await browser.newPage();

      const content = await compileTemplate("student-absent-list", pdfData);

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
        landscape: true,
        margin: {
          left: 5,
          right: 5,
        },
      });

      browser.close();

      return common.successResponse({
        result: pdf,
        statusCode: httpStatusCode.ok,
        meta: {
          "Content-Type": "application/pdf",
          "Content-Length": pdf.length,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAttendanceSummaryForToday(req) {
    try {
      const academicYear = await academicYearQuery.findOne({ active: true });
      if (!academicYear) return notFoundError("No active academic year found");

      let academicYearId = academicYear._id.toString();
      const today = moment().startOf("day").toDate();

      // Get all active students for the given academic year
      const students = await studentQuery.findAll({
        school: req.schoolId,
        academicYear: academicYearId,
        active: true,
      });

      // Get all attendance records for today
      const attendanceRecords = await StudentAttendance.find({
        school: mongoose.Types.ObjectId(req.schoolId),
        academicYear: mongoose.Types.ObjectId(academicYearId),
        date: today,
      }).lean();

      const totalStudents = students.length;
      let totalPresent = 0;
      let totalAbsent = 0;
      let attendanceNotTaken = 0;

      const attendanceMap = attendanceRecords.reduce((acc, record) => {
        acc[record.student.toString()] = record.attendanceStatus;
        return acc;
      }, {});

      students.forEach((student) => {
        const studentId = student._id.toString();
        if (attendanceMap[studentId] === "present") {
          totalPresent++;
        } else if (attendanceMap[studentId] === "absent") {
          totalAbsent++;
        } else {
          attendanceNotTaken++;
        }
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fetched today's attendance summary successfully!",
        result: {
          totalStudents,
          totalPresent,
          totalAbsent,
          attendanceNotTaken,
        },
      });
    } catch (error) {
      throw error;
    }
  }
};
