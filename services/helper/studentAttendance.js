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
const semesterQuery = require("@db/semester/queries");

module.exports = class StudentAttendanceService {
  static async list(req) {
    try {
      const { date, subject, section, year } = req.query;

      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear) return notFoundError("Academic Year not found");

      const semesterData = await semesterQuery.findOne({
        academicYear: currentAcademicYear._id,
        active: true,
      });
      const formattedDate = new Date(date).toISOString().split("T")[0];

      let attendanceList = await studentAttendanceQuery.findAll({
        school: req.schoolId,
        semester: semesterData._id,
        section: section,
        subject: subject,
        year,
        $expr: {
          $eq: [
            { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            formattedDate,
          ],
        },
        subject: subject,
        faculty: req.employee,
      });

      if (!attendanceList.length) {
        return common.successResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No attendance record found for the given date",
          result: [],
        });
      }

      let modifiedList = [];

      for (let att of attendanceList) {
        if (!att.attendanceStatus) {
          let newAtt = {
            _id: att._id,
            student: att.student,
            attendanceStatus: "present",
          };

          modifiedList.push(newAtt);
        } else {
          let newAtt = {
            _id: att._id,
            student: att.student,
            attendanceStatus: att.attendanceStatus,
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
      const { date, attendanceData, subject, section, year } = req.body;
      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return notFoundError("Active academic year not found");
      const semesterData = await semesterQuery.findOne({
        academicYear: currentAcademicYear._id,
        active: true,
      });
      let schoolWithGivenId = await schoolQuery.findOne({ _id: req.schoolId });
      if (!schoolWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Institute not found!",
          responseCode: "CLIENT_ERROR",
        });

      const bulkOps = attendanceData.map((item) => {
        return {
          updateOne: {
            filter: {
              _id: item._id,
            },
            update: {
              $set: { attendanceStatus: item.attendanceStatus },
            },
          },
        };
      });

      await StudentAttendance.bulkWrite(bulkOps);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student attendance updated successfully",
      });
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

      const [classData, sectionData, academicYearData, schoolData] =
        await Promise.all([
          classQuery.findOne({ _id: classId }),
          sectionQuery.findOne({ _id: sectionId, class: classId }),
          academicYearQuery.findOne({ active: true }),
          schoolQuery.findOne({ _id: req.schoolId }),
        ]);

      if (!classData) return notFoundError("Class not found");
      if (!sectionData) return notFoundError("Section not found");
      if (!academicYearData)
        return notFoundError("Active Academic year not found");

      const totalAttendance = await studentAttendanceQuery.findAll({
        class: classId,
        section: sectionId,
        date: stripTimeFromDate(date),
        academicYear: academicYearData._id,
        attendanceStatus: "absent",
      });

      const pdfData = {
        absentAttendace: totalAttendance,
        className: classData.name,
        sectionName: sectionData.name,
        date: moment(date).format("DD/MM/YYYY"),
        school: schoolData,
        academicYear: academicYearData,
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
        landscape: false,
        margin: 10,
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

  static async getMyAttendance(req) {
    try {
      const { semester } = req.query;

      const result = await StudentAttendance.aggregate([
        // Stage 1: Filter documents by student and semester
        {
          $match: {
            student: req.student?._id,
            semester: mongoose.Types.ObjectId(semester),
          },
        },
        {
          $group: {
            _id: "$subject",
            totalAttendance: { $sum: 1 },
            presentAttendance: {
              $sum: {
                $cond: [{ $eq: ["$attendanceStatus", "present"] }, 1, 0],
              },
            },
            section: { $first: "$section" },
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subjectDetails",
          },
        },
        {
          $unwind: {
            path: "$subjectDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "employeesubjectmappings",
            let: { subjectId: "$_id", sectionId: "$section" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$subjects.subject", "$$subjectId"] }, // Match the subject
                      { $eq: ["$subjects.section", "$$sectionId"] }, // Match the section
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: "employees",
                  localField: "employee",
                  foreignField: "_id",
                  as: "employeeDetails",
                },
              },
              {
                $unwind: "$employeeDetails", // Unwind to flatten the employee details
              },
            ],
            as: "teachingDetails",
          },
        },
        {
          $unwind: {
            path: "$teachingDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            subjectId: "$_id",
            subjectName: "$subjectDetails.name", // Assuming the subject model has a 'name' field
            totalAttendance: 1,
            presentAttendance: 1,
            teacherName: "$teachingDetails.employeeDetails.name", // Assuming employee model has 'name'
            section: "$section",
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fetched student attendance successfully!",
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getStudentAttendanceForSingleSubject(req) {}
};
