const classQuery = require("@db/class/queries");
const sectionQuery = require("@db/section/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const studentAttendanceQuery = require("@db/attendance/studentAttendance/queries");
const schoolQuery = require("@db/school/queries");
const academicYearQuery = require("@db/academicYear/queries");
const studentQuery = require("@db/student/queries");
const timetableQuery = require("@db/studentTimeTable/queries");
const coursePlanQuery = require("@db/coursePlan/queries");
const CoursePlan = require("@db/coursePlan/model");
const StudentTimeTable = require("@db/studentTimeTable/model");
const employeeQuery = require("@db/employee/queries");
const degreeCodeQuery = require("@db/degreeCode/queries");

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
const ExcelJS = require("exceljs");

module.exports = class StudentAttendanceService {
  static async getTodaysCourses(req) {
    try {
      // await CoursePlan.deleteMany({});
      // await StudentAttendance.deleteMany({});
      // await StudentTimeTable.deleteMany({});

      const { date } = req.query;
      const currentSemester = await semesterQuery.findOne({ active: true });
      if (!currentSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active semester found!",
          responseCode: "CLIENT_ERROR",
        });

      const formattedDate = new Date(date).toISOString().split("T")[0];

      let coursePlan = await coursePlanQuery.findAll({
        $expr: {
          $or: [
            {
              $and: [
                {
                  $eq: [
                    "$facultyAssigned",
                    mongoose.Types.ObjectId(req.employee),
                  ],
                },
                {
                  $eq: ["$semester", currentSemester._id],
                },
                {
                  $eq: [
                    {
                      $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$plannedDate",
                      },
                    },
                    formattedDate,
                  ],
                },
              ],
            },
            {
              $and: [
                {
                  $eq: [
                    "$facultyAssigned",
                    mongoose.Types.ObjectId(req.employee),
                  ],
                },
                {
                  $eq: ["$semester", currentSemester._id],
                },
                {
                  $eq: [
                    {
                      $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$plannedDate",
                      },
                    },
                    formattedDate,
                  ],
                },
              ],
            },
          ],
        },
      });
      if (!coursePlan.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No classes today!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: coursePlan,
      });
    } catch (error) {
      throw error;
    }
  }
  // done
  static async list(req) {
    try {
      const { date, coursePlanId } = req.query;

      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear) return notFoundError("Academic Year not found");

      const semesterData = await semesterQuery.findOne({
        academicYear: currentAcademicYear._id,
        active: true,
      });

      const formattedDate = new Date(date).toISOString().split("T")[0];

      let coursePlan = await coursePlanQuery.findOne({
        _id: coursePlanId,
      });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Attendance recordsssssss not found!",
          responseCode: "CLIENT_ERROR",
        });

      let attendanceList = await studentAttendanceQuery.findAll({
        school: req.schoolId,
        semester: semesterData._id,
        section: coursePlan.section?._id,
        subject: coursePlan.subject?._id,
        attendanceType: coursePlan.courseType,
        year: coursePlan.year,
        $expr: {
          $eq: [
            { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            formattedDate,
          ],
        },
        faculty: coursePlan.facultyAssigned?._id,
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
        result: modifiedList.sort((a, b) =>
          a.student?.basicInfo?.name?.localeCompare(b.student?.basicInfo?.name)
        ),
      });
    } catch (error) {
      throw error;
    }
  }
  // done
  static async update(req) {
    try {
      const { attendanceData } = req.body;

      let schoolWithGivenId = await schoolQuery.findOne({ _id: req.schoolId });
      if (!schoolWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Institute not found!",
          responseCode: "CLIENT_ERROR",
        });

      let attendanceInstance = await studentAttendanceQuery.findOne({
        _id: attendanceData[0]?._id,
      });
      if (!attendanceInstance)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Attendance record not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (attendanceInstance.attendanceFreezed)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Attendance is already frozen for this date!",
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

  // done
  static async getStudentAttendanceForSingleSubject(req) {
    try {
      const { coursePlanId } = req.query;

      let coursePlan = await coursePlanQuery.findOne({ _id: coursePlanId });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      let filter = {
        subject: coursePlan.subject._id,
        section: coursePlan.section?._id,
        year: parseInt(coursePlan.year),
        attendanceType: coursePlan.courseType,
        faculty: coursePlan.facultyAssigned?._id,
        semester: coursePlan.semester?._id,
      };

      let allAttendance = await StudentAttendance.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: "$student",
            attendanceRecords: {
              $push: {
                date: "$date",
                attendanceStatus: "$attendanceStatus",
              },
            },
            totalClasses: {
              $sum: 1,
            },
            totalPresents: {
              $sum: {
                $cond: [{ $eq: ["$attendanceStatus", "present"] }, 1, 0],
              },
            },
            totalAbsents: {
              $sum: {
                $cond: [{ $eq: ["$attendanceStatus", "absent"] }, 1, 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "_id",
            as: "studentInfo",
          },
        },
        {
          $unwind: "$studentInfo",
        },
        {
          $project: {
            studentName: "$studentInfo.basicInfo.name",
            studentRegistrationNumber:
              "$studentInfo.academicInfo.registrationNumber",
            attendanceRecords: 1,
            totalPresents: 1,
            totalAbsents: 1,
            total: "$totalClasses",
            totalConducted: { $add: ["$totalPresents", "$totalAbsents"] },

            presentPercentage: {
              $cond: {
                if: {
                  $gt: [{ $add: ["$totalPresents", "$totalAbsents"] }, 0],
                },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        "$totalPresents",
                        { $add: ["$totalPresents", "$totalAbsents"] },
                      ],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
        {
          $sort: {
            studentName: 1,
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student attendance fetched successfully",
        result: allAttendance,
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
        {
          $match: {
            student: req.student._id,
            semester: mongoose.Types.ObjectId(semester),
          },
        },
        {
          $group: {
            _id: {
              subject: "$subject",
              attendanceType: "$attendanceType",
            },
            totalAttendance: {
              $sum: 1,
            },
            presentAttendance: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$attendanceStatus", "present"],
                  },
                  1,
                  0,
                ],
              },
            },
            attendanceData: {
              $push: {
                labBatch: "$labBatch",
                faculty: "$faculty",
                date: "$date",
                attendanceStatus: "$attendanceStatus",
              },
            },
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "_id.subject",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $unwind: {
            path: "$subject",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            subject: 1,
            attendanceData: 1,
            totalAttendance: 1,
            presentAttendance: 1,
            courseType: "$_id.attendanceType",
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

  static async getAttendanceReportInBreaks(req) {
    try {
      const { coursePlanId, ranges = [] } = req.query;

      let coursePlan = await coursePlanQuery.findOne({ _id: coursePlanId });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      let filter = {
        subject: coursePlan.subject._id,
        section: coursePlan.section?._id,
        year: parseInt(coursePlan.year),
        attendanceType: coursePlan.courseType,
        faculty: coursePlan.facultyAssigned?._id,
        semester: coursePlan.semester?._id,
      };

      const pipeline = [
        {
          $match: filter,
        },
        {
          $group: {
            _id: "$student",
            totalPresent: {
              $sum: {
                $cond: [{ $eq: ["$attendanceStatus", "present"] }, 1, 0],
              },
            },
            totalClasses: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            totalPresent: 1,
            totalClasses: 1,
            percentage: {
              $multiply: [{ $divide: ["$totalPresent", "$totalClasses"] }, 100],
            },
          },
        },
      ];

      console.log(
        ranges.map((r) => [Number(r.from), Number(r.to)]),
        "mapping"
      );
      // Step 2: Build the `$switch` branches dynamically based on ranges
      const switchBranches = ranges
        .map((r) => [Number(r.from), Number(r.to)])
        .map(([min, max]) => {
          console.log(min, max, "min max");
          return {
            case: {
              $and: [
                { $gte: ["$percentage", min] },
                { $lt: ["$percentage", max] },
              ],
            },
            then: `${min}-${max}%`,
          };
        });

      // Step 3: Add the `$switch` stage to assign attendance ranges
      pipeline.push({
        $addFields: {
          attendanceRange: {
            $switch: {
              branches: switchBranches,
              default: "No Data",
            },
          },
        },
      });

      pipeline.push({
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      });

      pipeline.push({
        $unwind: "$student",
      });

      // Step 4: Group by the new `attendanceRange` field and count students
      pipeline.push(
        {
          $group: {
            _id: "$attendanceRange",
            count: { $sum: 1 },
            students: {
              $push: { student: "$student", percentage: "$percentage" },
            },
          },
        },
        {
          $project: {
            _id: 1,
            count: 1,
            students: 1,
          },
        }
      );

      const attendanceData = await StudentAttendance.aggregate(pipeline);

      const workbook = new ExcelJS.Workbook();

      for (let data of attendanceData) {
        const worksheet = workbook.addWorksheet(data._id);
        let HEADER = [
          "S.No",
          "Registration Number",
          "Name",
          "Attendance Percentage",
        ];
        worksheet.addRow(HEADER);
        for (let studentData of data.students) {
          let newRow = [
            data.students.indexOf(studentData) + 1,
            studentData.student.academicInfo.registrationNumber,
            studentData.student.basicInfo.name,
            studentData.percentage,
          ];
          worksheet.addRow(newRow);
        }
        const firstRow = worksheet.getRow(1);

        // Iterate through each cell in the first row and apply bold styling
        firstRow.eachCell((cell) => {
          cell.font = { bold: true };
        });

        worksheet.columns.forEach((column, columnIndex) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            maxLength = Math.max(
              maxLength,
              cell.value ? cell.value.toString().length : 0
            );
          });
          column.width = maxLength + 2; // Add some extra width for padding
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
      }

      let buffer = await workbook.xlsx.writeBuffer();

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student Attendance sheet downloaded successfully!",
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

  static async getStudentWithBelowAttendance(req) {
    try {
      const employee = await employeeQuery.findOne({
        _id: req.employee,
        active: true,
      });
      if (!employee) return notFoundError("Employee not found!");

      let department = employee.academicInfo.department?._id;

      let degreeCodes = await degreeCodeQuery.findAll({ department });
      let activeSemester = await semesterQuery.findOne({ active: true });
      if (!activeSemester) return notFoundError("Active semester not found!");

      let allStudents = await studentQuery.findAll({
        "academicInfo.degreeCode": { $in: degreeCodes.map((d) => d._id) },
        "academicInfo.semester": activeSemester._id,
      });

      let school = await schoolQuery.findOne({});
      let mandatoryAttendancePercentage = school.mandatoryAttendancePercentage;

      if (!mandatoryAttendancePercentage)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Mandatory attendance percentage not found!",
          responseCode: "CLIENT_ERROR",
        });

      let attendanceData = await StudentAttendance.aggregate([
        {
          $match: {
            student: allStudents.map((s) => s._id),
          },
        },
        {
          $group: {
            _id: "$student",
            totalPresent: {
              $sum: {
                $cond: [{ $eq: ["$attendanceStatus", "present"] }, 1, 0],
              },
            },
            totalClasses: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            totalPresent: 1,
            totalClasses: 1,
            percentage: {
              $multiply: [{ $divide: ["$totalPresent", "$totalClasses"] }, 100],
            },
          },
        },
        {
          $match: {
            percentage: { $lt: mandatoryAttendancePercentage },
          },
        },
        {
          $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: "$student",
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Students with below attendance percentage",
        result: attendanceData,
      });
    } catch (error) {
      throw error;
    }
  }
};
