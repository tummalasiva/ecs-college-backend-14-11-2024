const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");
const {
  compileTemplate,
  getDateRange,
  notFoundError,
  getFirstAndLastDateOfMonth,
} = require("../../helper/helpers");
const puppeteer = require("puppeteer");

const bookQuery = require("@db/library/book/queries");
const employeeQuery = require("@db/employee/queries");
const classQuery = require("@db/class/queries");
const issueQuery = require("@db/library/issue/queries");
const Issue = require("@db/library/issue/model");
const StudentActivity = require("@db/studentActivity/model");
const { default: mongoose, mongo } = require("mongoose");
const schoolQuery = require("@db/school/queries");
const academicYearQuery = require("@db/academicYear/queries");
const studentQuery = require("@db/student/queries");
const Student = require("@db/student/model");
const EmployeeAttendance = require("@db/attendance/employeeAttendance/model");
const StudentAttendance = require("@db/attendance/studentAttendance/model");

const moment = require("moment");

// function calculateGroupByData(issues, bookData, groupBy) {
//     const result = issues.reduce((acc, issue) => {
//       const dateGrouping = getDateGrouping(issue.issueDate, groupBy);
//       const bookIndex = bookData.findIndex(
//         (book) => book._id.toString() === issue.book._id.toString()
//       );

//       if (bookIndex !== -1) {
//         bookData[bookIndex].issue += 1;
//         bookData[bookIndex].balance -= 1;

//         const groupIndex = acc.findIndex(
//           (item) => item.dateGrouping === dateGrouping
//         );
//         if (groupIndex !== -1) {
//           acc[groupIndex].issue += 1;
//           acc[groupIndex].balance -= 1;
//         } else {
//           acc.push({
//             dateGrouping,
//             issue: 1,
//             returnData: 0,
//             balance: bookData[bookIndex].balance,
//             groupBy,
//           });
//         }
//       }

//       if (issue.submitted === "yes") {
//         const returnDateGrouping = getDateGrouping(issue.returnDate, groupBy);

//         const returnGroupIndex = acc.findIndex(
//           (item) => item.dateGrouping === returnDateGrouping
//         );
//         if (returnGroupIndex !== -1) {
//           acc[returnGroupIndex].returnData += 1;
//           acc[returnGroupIndex].balance += 1;
//         } else {
//           acc.push({
//             dateGrouping: returnDateGrouping,
//             issue: 0,
//             returnData: 1,
//             balance: bookData[bookIndex].balance,
//             groupBy,
//           });
//         }
//       }

//       return acc;
//     }, []);

//     // Sort the result array by dateGrouping in ascending order
//     result.sort((a, b) => new Date(a.dateGrouping) - new Date(b.dateGrouping));

//     return result;
//   }

// function getDateGrouping(date, groupBy) {
//     if (groupBy === "daily") {
//       return date.toISOString().split("T")[0];
//     } else if (groupBy === "weekly") {
//       return getWeekNumber(date);
//     } else if (groupBy === "monthly") {
//       return `${date.getFullYear()}-${date.getMonth() + 1}`;
//     }
//   }

//   function getWeekNumber(date) {
//     const startDate = new Date(date.getFullYear(), 0, 1);
//     const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
//     const weekNumber = Math.ceil((days + 1) / 7);
//     return weekNumber;
//   }

function generateDateRanges(fromDate, toDate, groupByData) {
  const dateArray = [];
  const dateRangeArray = [];
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);

  let currentDate = new Date(startDate);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  };

  const addWeeks = (date, weeks) => {
    const result = new Date(date);
    result.setDate(result.getDate() + weeks * 7);
    return result;
  };

  while (currentDate <= endDate) {
    dateArray.push(formatDate(currentDate));
    switch (groupByData) {
      case "daily":
        currentDate = addDays(currentDate, 1);
        break;
      case "weekly":
        const endOfWeek = addDays(currentDate, 6);
        dateRangeArray.push(
          `${formatDate(currentDate)}-${formatDate(endOfWeek)}`
        );
        currentDate = addWeeks(currentDate, 1);
        break;
      case "monthly":
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
        dateRangeArray.push(
          `${currentDate.getFullYear()}-${(
            "0" +
            (currentDate.getMonth() + 1)
          ).slice(-2)}`
        );
        currentDate = addMonths(currentDate, 1);
        currentDate.setDate(1);
        break;
      default:
        break;
    }
  }

  return groupByData === "daily" ? dateArray : dateRangeArray;
}

module.exports = class ReportService {
  static async groupedLibraryData(req) {
    const { groupByData, fromDate, toDate } = req.query;
    try {
      if (!fromDate || !toDate || !groupByData) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide date range and group by data",
          responseCode: "CLIENT_ERROR",
        });
      }

      let { startOfDay, endOfDay } = getDateRange(fromDate, toDate);

      let allIssues = await issueQuery.findAll({});

      const dateRanges = generateDateRanges(fromDate, toDate, groupByData);

      const results = [];

      if (groupByData === "daily") {
        for (let date of dateRanges) {
          let issues = allIssues.filter(
            (issue) => issue.issueDate.toISOString().split("T")[0] === date
          );

          let submissions = allIssues.filter(
            (issue) =>
              issue.submissionDate &&
              issue.submissionDate.toISOString().split("T")[0] === date
          );

          let newData = {
            groupByData: date,
            totalIssues: issues.reduce((acc, issue) => acc + issue.quantity, 0),
            totalReturns: submissions.reduce(
              (acc, issue) => acc + issue.quantity,
              0
            ),
          };

          results.push(newData);
        }
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fetched Successfully!",
        result: results,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getStudentActivityReport(req) {
    try {
      const { academicYearId, studentId } = req.query;

      const activities = await StudentActivity.aggregate([
        {
          $match: {
            student: new mongoose.Types.ObjectId(studentId),
            school: new mongoose.Types.ObjectId(req.schoolId),
            academicYear: new mongoose.Types.ObjectId(academicYearId),
          },
        },
        {
          $lookup: {
            from: "academicyears",
            localField: "academicYear",
            foreignField: "_id",
            as: "academicYear",
          },
        },
        {
          $unwind: "$academicYear",
        },
        {
          $lookup: {
            from: "students",
            localField: "student",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: "$student",
        },
        {
          $lookup: {
            from: "sections",
            localField: "student.academicInfo.section",
            foreignField: "_id",
            as: "student.academicInfo.section",
          },
        },
        {
          $unwind: "$student.academicInfo.section",
        },
        {
          $addFields: {
            sectionName: "$student.academicInfo.section.name",
            studentName: "$student.basicInfo.name",
            activityDate: "$createdAt",
            activityName: "$name",
          },
        },
        {
          $project: {
            studentName: 1,
            sectionName: 1,
            activityDate: 1,
            activity: 1,
            activityName: 1,
            description: 1,
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fetched student activities Successfully!",
        result: activities,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getStudentActivityReportPdf(req) {
    try {
      const { academicYearId, studentId } = req.query;
      const [schoolData, academicYearData, studentData] = await Promise.all([
        schoolQuery.findOne({ _id: req.schoolId }),
        academicYearQuery.findOne({ _id: academicYearId }),
        studentQuery.findOne({ _id: studentId }),
      ]);

      if (!schoolData) return notFoundError("School not found");
      if (!academicYearData) return notFoundError("Academic Year not found");

      const activities = await StudentActivity.aggregate([
        {
          $match: {
            student: new mongoose.Types.ObjectId(studentId),
            school: new mongoose.Types.ObjectId(req.schoolId),
            academicYear: new mongoose.Types.ObjectId(academicYearId),
          },
        },
        {
          $lookup: {
            from: "academicyears",
            localField: "academicYear",
            foreignField: "_id",
            as: "academicYear",
          },
        },
        {
          $unwind: "$academicYear",
        },
        {
          $lookup: {
            from: "students",
            localField: "student",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: "$student",
        },
        {
          $lookup: {
            from: "sections",
            localField: "student.academicInfo.section",
            foreignField: "_id",
            as: "student.academicInfo.section",
          },
        },
        {
          $unwind: "$student.academicInfo.section",
        },
        {
          $addFields: {
            sectionName: "$student.academicInfo.section.name",
            studentName: "$student.basicInfo.name",
            activityDate: "$createdAt",
            activityName: "$name",
          },
        },
        {
          $project: {
            studentName: 1,
            sectionName: 1,
            activityDate: 1,
            activity: 1,
            activityName: 1,
            description: 1,
          },
        },
      ]);

      let formattedData = activities.map((a) => ({
        date: moment(a.createdAt).format("DD/MM/YYYY"),
        activityName: a.activityName,
        description: a.description,
      }));

      let pdfData = {
        schoolName: schoolData.name,
        acdemicYearFrom: academicYearData.from,
        academicYearTo: academicYearData.to,
        studentDetails: {
          name: studentData.basicInfo.name,
          class: studentData.academicInfo.class?.name,
          section: studentData.academicInfo.section?.name,
        },
        activities: formattedData,
      };

      const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ["--disable-extension"],
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--hide-scrollbars",
          "--disable-gpu",
          "--mute-audio",
        ],
      });
      const page = await browser.newPage();

      const content = await compileTemplate("studentActivityReport", pdfData);

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
        statusCode: httpStatusCode.ok,
        message: "Generated student activity report successfully!",
        result: pdf,
        meta: {
          "Content-Type": "application/pdf",
          "Content-Length": pdf.length,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getStudentReport(req) {
    try {
      const { academicYearId, groupBy } = req.query;
      const academicYear = await academicYearQuery.findOne({
        _id: academicYearId,
      });
      if (!academicYear) return notFoundError("Academic year not found");

      if (groupBy === "class") {
        const students = await Student.aggregate([
          {
            $match: {
              school: new mongoose.Types.ObjectId(req.schoolId),
              academicYear: new mongoose.Types.ObjectId(academicYearId),
              active: true,
            },
          },
          {
            $lookup: {
              from: "classes",
              localField: "academicInfo.class",
              foreignField: "_id",
              as: "classDetails",
            },
          },
          {
            $unwind: "$classDetails",
          },
          {
            $group: {
              _id: {
                classId: "$academicInfo.class",
                gender: "$basicInfo.gender",
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $group: {
              _id: "$_id.classId",
              maleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "male"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              femaleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "female"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              totalCount: {
                $sum: "$count",
              },
            },
          },
          {
            $lookup: {
              from: "classes",
              localField: "_id",
              foreignField: "_id",
              as: "classDetails",
            },
          },
          {
            $project: {
              _id: 0,
              classId: "$_id",
              className: {
                $arrayElemAt: ["$classDetails.name", 0],
              },
              maleCount: 1,
              femaleCount: 1,
              totalCount: 1,
            },
          },
        ]);

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Fetched student report successfully!",
          result: students,
        });
      } else if (groupBy === "gender") {
        const students = await Student.aggregate([
          {
            $match: {
              school: new mongoose.Types.ObjectId(req.schoolId),
              academicYear: new mongoose.Types.ObjectId(academicYearId),
              active: true,
            },
          },
          {
            $group: {
              _id: null,
              maleCount: {
                $sum: {
                  $cond: [{ $eq: ["$basicInfo.gender", "male"] }, 1, 0],
                },
              },
              femaleCount: {
                $sum: {
                  $cond: [{ $eq: ["$basicInfo.gender", "female"] }, 1, 0],
                },
              },

              totalCount: {
                $sum: 1,
              },
            },
          },
        ]);

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Fetched student report successfully!",
          result: students,
        });
      } else if (groupBy === "vehicle") {
        const students = await Student.aggregate([
          {
            $match: {
              active: true,
              "otherInfo.transportMember": true,
              academicYear: new mongoose.Types.ObjectId(academicYearId),
            },
          },
          {
            $group: {
              _id: {
                vehicle: "$transportInfo.vehicle",
                gender: "$basicInfo.gender",
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $group: {
              _id: "$_id.vehicle",
              maleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "male"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              femaleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "female"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              totalCount: {
                $sum: "$count",
              },
            },
          },
          {
            $lookup: {
              from: "vehicles",
              localField: "_id",
              foreignField: "_id",
              as: "vehicle",
            },
          },
          {
            $unwind: "$vehicle",
          },
          {
            $addFields: {
              vehicleNumber: "$vehicle.number",
            },
          },
          {
            $project: {
              maleCount: 1,
              femaleCount: 1,
              totalCount: 1,
              vehicleNumber: 1,
            },
          },
        ]);

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Fetched student report successfully!",
          result: students,
        });
      } else if (groupBy === "hostel") {
        const students = await Student.aggregate([
          {
            $match: {
              "otherInfo.hostelMember": true,
              academicYear: new mongoose.Types.ObjectId(academicYearId),
              active: true,
            },
          },
          {
            $group: {
              _id: {
                hostel: "$hostelInfo.hostel",
                gender: "$basicInfo.gender",
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $group: {
              _id: "$_id.hostel",
              maleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "male"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              femaleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "female"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              totalCount: {
                $sum: "$count",
              },
            },
          },
          {
            $lookup: {
              from: "hostels",
              localField: "_id",
              foreignField: "_id",
              as: "hostel",
            },
          },
          {
            $unwind: "$hostel",
          },
          {
            $addFields: {
              hostelName: "$hostel.name",
            },
          },
          {
            $project: {
              maleCount: 1,
              femaleCount: 1,
              totalCount: 1,
              hostelName: 1,
            },
          },
        ]);

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Fetched student report successfully!",
          result: students,
        });
      } else if (groupBy === "library") {
        const students = await Student.aggregate([
          {
            $match: {
              active: true,
              "otherInfo.libraryMember": true,
              academicYear: new mongoose.Types.ObjectId(academicYearId),
            },
          },
          {
            $facet: {
              maleCount: [
                {
                  $match: { "basicInfo.gender": "male" },
                },
                {
                  $count: "count",
                },
              ],
              femaleCount: [
                {
                  $match: { "basicInfo.gender": "female" },
                },
                {
                  $count: "count",
                },
              ],
              totalCount: [
                {
                  $count: "count",
                },
              ],
            },
          },
          {
            $project: {
              maleCount: { $arrayElemAt: ["$maleCount.count", 0] },
              femaleCount: { $arrayElemAt: ["$femaleCount.count", 0] },
              totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
            },
          },
        ]);

        console.log(students, "students");

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Fetched student report successfully!",
          result: students,
        });
      } else {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid group by parameter!",
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async downloadStudentReport(req) {
    try {
      const { academicYearId, groupBy } = req.query;
      const academicYear = await academicYearQuery.findOne({
        _id: academicYearId,
      });

      if (!academicYear) return notFoundError("Academic year not found");
      const schoolData = await schoolQuery.findOne({ _id: req.schoolId });
      if (!schoolData) return notFoundError("School not found");

      if (groupBy === "class") {
        const students = await Student.aggregate([
          {
            $match: {
              school: new mongoose.Types.ObjectId(req.schoolId),
              academicYear: new mongoose.Types.ObjectId(academicYearId),
              active: true,
            },
          },
          {
            $lookup: {
              from: "classes",
              localField: "academicInfo.class",
              foreignField: "_id",
              as: "classDetails",
            },
          },
          {
            $unwind: "$classDetails",
          },
          {
            $group: {
              _id: {
                classId: "$academicInfo.class",
                gender: "$basicInfo.gender",
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $group: {
              _id: "$_id.classId",
              maleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "male"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              femaleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "female"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              totalCount: {
                $sum: "$count",
              },
            },
          },
          {
            $lookup: {
              from: "classes",
              localField: "_id",
              foreignField: "_id",
              as: "classDetails",
            },
          },
          {
            $project: {
              _id: 0,
              classId: "$_id",
              className: {
                $arrayElemAt: ["$classDetails.name", 0],
              },
              maleCount: 1,
              femaleCount: 1,
              totalCount: 1,
            },
          },
        ]);

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
        const content = await compileTemplate("studentClassReport", {
          school: schoolData,
          data: students.map((s) => ({ ...s, academicYear })),
        });

        await page.setContent(content);

        const pdf = await page.pdf({
          format: "A4",
          margin: {
            top: 20,
            left: 5,
            right: 5,
          },
        });
        browser.close();

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Fetched student report successfully!",
          result: pdf,
          meta: {
            "Content-Type": "application/pdf",
            "Content-Length": pdf.length,
          },
        });
      } else if (groupBy === "gender") {
        const students = await Student.aggregate([
          {
            $match: {
              school: new mongoose.Types.ObjectId(req.schoolId),
              academicYear: new mongoose.Types.ObjectId(academicYearId),
              active: true,
            },
          },
          {
            $group: {
              _id: null,
              maleCount: {
                $sum: {
                  $cond: [{ $eq: ["$basicInfo.gender", "male"] }, 1, 0],
                },
              },
              femaleCount: {
                $sum: {
                  $cond: [{ $eq: ["$basicInfo.gender", "female"] }, 1, 0],
                },
              },

              totalCount: {
                $sum: 1,
              },
            },
          },
        ]);

        let data = {
          maleCount: students[0]?.maleCount,
          femaleCount: students[0]?.femaleCount,
          totalCount: students[0]?.totalCount,
          academicYear: academicYear,
          groupBy: groupBy,
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
        const content = await compileTemplate("studentGenderReport", {
          school: schoolData,
          data: data,
        });

        await page.setContent(content);

        const pdf = await page.pdf({
          format: "A4",
          margin: {
            top: 20,
            left: 5,
            right: 5,
          },
        });
        browser.close();

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Fetched student report successfully!",
          result: pdf,
          meta: {
            "Content-Type": "application/pdf",
            "Content-Length": pdf.length,
          },
        });
      } else if (groupBy === "vehicle") {
        const students = await Student.aggregate([
          {
            $match: {
              active: true,
              "otherInfo.transportMember": true,
              academicYear: new mongoose.Types.ObjectId(academicYearId),
            },
          },
          {
            $group: {
              _id: {
                vehicle: "$transportInfo.vehicle",
                gender: "$basicInfo.gender",
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $group: {
              _id: "$_id.vehicle",
              maleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "male"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              femaleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "female"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              totalCount: {
                $sum: "$count",
              },
            },
          },
          {
            $lookup: {
              from: "vehicles",
              localField: "_id",
              foreignField: "_id",
              as: "vehicle",
            },
          },
          {
            $unwind: "$vehicle",
          },
          {
            $addFields: {
              vehicleNumber: "$vehicle.number",
            },
          },
          {
            $project: {
              maleCount: 1,
              femaleCount: 1,
              totalCount: 1,
              vehicleNumber: 1,
            },
          },
        ]);

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
        const content = await compileTemplate("studentVehicleReport", {
          school: schoolData,
          data: students.map((s) => ({
            ...s,
            totalStudents: s.totalCount,
            maleStudents: s.maleCount,
            femaleStudents: s.femaleCount,
            academicYear: academicYear,
            groupBy: groupBy,
          })),
        });

        await page.setContent(content);

        const pdf = await page.pdf({
          format: "A4",
          margin: {
            top: 20,
            left: 5,
            right: 5,
          },
        });
        browser.close();

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Fetched student report successfully!",
          result: pdf,
          meta: {
            "Content-Type": "application/pdf",
            "Content-Length": pdf.length,
          },
        });
      } else if (groupBy === "hostel") {
        const students = await Student.aggregate([
          {
            $match: {
              "otherInfo.hostelMember": true,
              academicYear: new mongoose.Types.ObjectId(academicYearId),
              active: true,
            },
          },
          {
            $group: {
              _id: {
                hostel: "$hostelInfo.hostel",
                gender: "$basicInfo.gender",
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $group: {
              _id: "$_id.hostel",
              maleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "male"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              femaleCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$_id.gender", "female"],
                    },
                    "$count",
                    0,
                  ],
                },
              },
              totalCount: {
                $sum: "$count",
              },
            },
          },
          {
            $lookup: {
              from: "hostels",
              localField: "_id",
              foreignField: "_id",
              as: "hostel",
            },
          },
          {
            $unwind: "$hostel",
          },
          {
            $addFields: {
              hostelName: "$hostel.name",
            },
          },
          {
            $project: {
              maleCount: 1,
              femaleCount: 1,
              totalCount: 1,
              hostelName: 1,
            },
          },
        ]);

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
        const content = await compileTemplate("studentHostelReport", {
          school: schoolData,
          data: students.map((s) => ({ ...s, academicYear, groupBy })),
        });

        await page.setContent(content);

        const pdf = await page.pdf({
          format: "A4",
          margin: {
            top: 20,
            left: 5,
            right: 5,
          },
        });
        browser.close();

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Fetched student report successfully!",
          result: pdf,
          meta: {
            "Content-Type": "application/pdf",
            "Content-Length": pdf.length,
          },
        });
      } else if (groupBy === "library") {
        let totalStudents = await Student.count({
          school: req.schoolId,
          active: true,
          academicYear: academicYear._id,
        });
        const students = await Student.aggregate([
          {
            $match: {
              active: true,
              "otherInfo.libraryMember": true,
              academicYear: new mongoose.Types.ObjectId(academicYearId),
            },
          },
          {
            $facet: {
              maleCount: [
                {
                  $match: { "basicInfo.gender": "male" },
                },
                {
                  $count: "count",
                },
              ],
              femaleCount: [
                {
                  $match: { "basicInfo.gender": "female" },
                },
                {
                  $count: "count",
                },
              ],
              totalCount: [
                {
                  $count: "count",
                },
              ],
            },
          },
          {
            $project: {
              maleCount: { $arrayElemAt: ["$maleCount.count", 0] },
              femaleCount: { $arrayElemAt: ["$femaleCount.count", 0] },
              totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
            },
          },
        ]);

        let data = {
          totalStudents: totalStudents,
          totalLibraryMembers: students[0]?.totalCount,
          maleMember: students[0]?.maleCount,
          femaleMember: students[0]?.femaleCount,
          academicYear: academicYear,
          groupBy: groupBy,
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
        const content = await compileTemplate("studentLibraryReport", {
          school: schoolData,
          data: data,
        });

        await page.setContent(content);

        const pdf = await page.pdf({
          format: "A4",
          margin: {
            top: 20,
            left: 5,
            right: 5,
          },
        });
        browser.close();

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Fetched student report successfully!",
          result: pdf,
          meta: {
            "Content-Type": "application/pdf",
            "Content-Length": pdf.length,
          },
        });
      } else {
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
        await page.setContent(""); // Empty content
        const pdf = await page.pdf({
          format: "A4",
          margin: {
            top: 20,
            left: 5,
            right: 5,
          },
        });
        browser.close();

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Fetched student report successfully!",
          result: pdf,
          meta: {
            "Content-Type": "application/pdf",
            "Content-Length": pdf.length,
          },
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async getAllEmployeesAttendanceReportForParticularMonth(req) {
    try {
      const { month, year, academicYearId } = req.query;

      const employees = await employeeQuery.findAll({ school: req.schoolId });

      const startDate = moment(`${year}-${month}-01`).startOf("month");
      const endDate = moment(startDate).endOf("month");
      const datesArray = [];

      for (let m = moment(startDate); m.isBefore(endDate); m.add(1, "days")) {
        datesArray.push(m.toDate());
      }

      const pipeline = [
        {
          $match: {
            school: mongoose.Types.ObjectId(req.schoolId),
            academicYear: mongoose.Types.ObjectId(academicYearId),
            date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          },
        },
        {
          $group: {
            _id: { employee: "$employee", date: "$date" },
            attendanceStatus: { $first: "$attendanceStatus" },
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "_id.employee",
            foreignField: "_id",
            as: "employeeDetails",
          },
        },
        { $unwind: "$employeeDetails" },
        {
          $project: {
            _id: 0,
            employeeId: "$employeeDetails._id",
            employeeName: "$employeeDetails.basicInfo.name",
            date: "$_id.date",
            attendanceStatus: 1,
          },
        },
        {
          $group: {
            _id: "$employeeId",
            employeeName: { $first: "$employeeName" },
            attendance: {
              $push: {
                date: "$date",
                attendanceStatus: "$attendanceStatus",
              },
            },
          },
        },
      ];

      const attendanceRecords = await EmployeeAttendance.aggregate(pipeline);
      const attendanceByEmployee = {};

      employees.forEach((employee) => {
        const employeeId = employee._id.toString();
        attendanceByEmployee[employeeId] = {
          employeeId: employeeId,
          employeeName: employee.basicInfo.name,
          attendance: {},
          totalWorkingDays: 0,
          totalPresentDays: 0,
          totalAbsentDays: 0,
        };

        datesArray.forEach((date) => {
          const dateString = moment(date).format("YYYY-MM-DD");
          attendanceByEmployee[employeeId].attendance[dateString] = "NA"; // default to NA
        });
      });

      attendanceRecords.forEach((record) => {
        record.attendance.forEach((att) => {
          const dateString = moment(att.date).format("YYYY-MM-DD");
          attendanceByEmployee[record._id].attendance[dateString] =
            att.attendanceStatus;
        });
      });

      // Calculate total working days, present days, and absent days for each employee
      for (const employeeId in attendanceByEmployee) {
        const employeeRecord = attendanceByEmployee[employeeId];
        datesArray.forEach((date) => {
          const dateString = moment(date).format("YYYY-MM-DD");
          const status = employeeRecord.attendance[dateString];
          if (["late", "present", "absent"].includes(status)) {
            employeeRecord.totalWorkingDays += 1;
            if (status === "present") {
              employeeRecord.totalPresentDays += 1;
            } else if (status === "absent") {
              employeeRecord.totalAbsentDays += 1;
            }
          }
        });
      }

      const finalResult = [];
      Object.keys(attendanceByEmployee).forEach((k) => {
        finalResult.push(attendanceByEmployee[k]);
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fetched employee attendance report successfully!",
        result: finalResult,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getEmployeeAttendanceReport(req) {
    try {
      const { academicYearId, employeeId } = req.query;

      const [academicYearData, schoolData] = await Promise.all([
        academicYearQuery.findOne({ _id: academicYearId }),
        schoolQuery.findOne({ _id: req.schoolId }),
      ]);

      if (!academicYearData) return notFoundError("Academic year not found");
      if (!schoolData) return notFoundError("School not found");

      const fromYear = academicYearData.from;
      const toYear = academicYearData.to;
      const fromMonth = moment(new Date(schoolData.sessionStartMonth)).month();
      const toMonth = moment(new Date(schoolData.sessionEndMonth)).month();

      const startDate = moment(
        `${fromYear}-${String(fromMonth + 1).padStart(2, "0")}-01`
      ).startOf("month");
      const endDate = moment(
        `${toYear}-${String(toMonth + 1).padStart(2, "0")}-01`
      ).endOf("month");
      const datesArray = {};

      for (
        let m = moment(startDate);
        m.isBefore(endDate) || m.isSame(endDate);
        m.add(1, "month")
      ) {
        const monthYear = m.format("YYYY-MM");
        datesArray[monthYear] = [];
        for (
          let d = m.clone().startOf("month");
          d.isBefore(m.clone().endOf("month")) ||
          d.isSame(m.clone().endOf("month"));
          d.add(1, "days")
        ) {
          datesArray[monthYear].push(d.toDate());
        }
      }

      // Aggregate pipeline
      const pipeline = [
        {
          $match: {
            academicYear: mongoose.Types.ObjectId(academicYearId),
            employee: mongoose.Types.ObjectId(employeeId),
            date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          },
        },
        {
          $group: {
            _id: { month: { $substr: ["$date", 0, 7] }, date: "$date" },
            attendanceStatus: { $first: "$attendanceStatus" },
          },
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            date: "$_id.date",
            attendanceStatus: 1,
          },
        },
        {
          $group: {
            _id: "$month",
            attendance: {
              $push: {
                date: "$date",
                attendanceStatus: "$attendanceStatus",
              },
            },
          },
        },
      ];

      const attendanceRecords = await EmployeeAttendance.aggregate(pipeline);

      // Organize the result by month and date
      const attendanceByMonth = {};

      Object.keys(datesArray).forEach((monthYear) => {
        attendanceByMonth[monthYear] = {
          attendance: {},
          totalWorkingDays: 0,
          totalPresentDays: 0,
          totalAbsentDays: 0,
        };

        datesArray[monthYear].forEach((date) => {
          const dateString = moment(date).format("YYYY-MM-DD");
          attendanceByMonth[monthYear].attendance[dateString] = "NA"; // default to absent
        });
      });

      attendanceRecords.forEach((record) => {
        record.attendance.forEach((att) => {
          const dateString = moment(att.date).format("YYYY-MM-DD");
          attendanceByMonth[record._id].attendance[dateString] =
            att.attendanceStatus;
        });
      });

      // Calculate total working days, present days, and absent days for each month
      for (const monthYear in attendanceByMonth) {
        const monthRecord = attendanceByMonth[monthYear];
        Object.keys(monthRecord.attendance).forEach((date) => {
          const status = monthRecord.attendance[date];
          if (["late", "absent", "present"].includes(status)) {
            monthRecord.totalWorkingDays += 1;
            if (status === "present") {
              monthRecord.totalPresentDays += 1;
            } else if (status === "absent") {
              monthRecord.totalAbsentDays += 1;
            }
          }
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fetched employee attendance report successfully!",
        result: attendanceByMonth,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAllStudentsAttendanceReportForParticularMonth(req) {
    try {
      const { month, year, academicYearId, classId, sectionId } = req.query;

      const students = await studentQuery.findAll({
        school: req.schoolId,
        academicYear: academicYearId,
        active: true,
        "academicInfo.class": classId,
        "academicInfo.section": sectionId,
      });

      const startDate = moment(
        `${year}-${String(month).padStart(2, "0")}-01`
      ).startOf("month");
      const endDate = moment(startDate).endOf("month");
      const datesArray = [];

      for (
        let m = moment(startDate);
        m.isBefore(endDate) || m.isSame(endDate);
        m.add(1, "days")
      ) {
        datesArray.push(m.toDate());
      }

      const pipeline = [
        {
          $match: {
            school: mongoose.Types.ObjectId(req.schoolId),
            academicYear: mongoose.Types.ObjectId(academicYearId),
            date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          },
        },
        {
          $group: {
            _id: { student: "$student", date: "$date" },
            attendanceStatus: { $first: "$attendanceStatus" },
          },
        },
        {
          $lookup: {
            from: "students",
            localField: "_id.student",
            foreignField: "_id",
            as: "studentDetails",
            pipeline: [
              {
                $match: {
                  "academicInfo.class": new mongoose.Types.ObjectId(classId),
                  "academicInfo.section": new mongoose.Types.ObjectId(
                    sectionId
                  ),
                  academicYear: new mongoose.Types.ObjectId(academicYearId),
                  school: new mongoose.Types.ObjectId(req.schoolId),
                  active: true,
                },
              },
            ],
          },
        },
        { $unwind: "$studentDetails" },
        {
          $project: {
            _id: 0,
            studentId: "$studentDetails._id",
            studentName: "$studentDetails.basicInfo.name",
            date: "$_id.date",
            attendanceStatus: 1,
          },
        },
        {
          $group: {
            _id: "$studentId",
            studentName: { $first: "$studentName" },
            attendance: {
              $push: {
                date: "$date",
                attendanceStatus: "$attendanceStatus",
              },
            },
          },
        },
      ];

      const attendanceRecords = await StudentAttendance.aggregate(pipeline);
      const attendanceByStudent = {};

      students.forEach((student) => {
        const studentId = student._id.toString();
        attendanceByStudent[studentId] = {
          studentId: studentId,
          studentName: student.basicInfo.name,
          attendance: {},
          totalWorkingDays: 0,
          totalPresentDays: 0,
          totalAbsentDays: 0,
        };

        datesArray.forEach((date) => {
          const dateString = moment(date).format("YYYY-MM-DD");
          attendanceByStudent[studentId].attendance[dateString] = "NA"; // default to NA
        });
      });

      attendanceRecords.forEach((record) => {
        record.attendance.forEach((att) => {
          const dateString = moment(att.date).format("YYYY-MM-DD");
          attendanceByStudent[record._id].attendance[dateString] =
            att.attendanceStatus;
        });
      });

      // Calculate total working days, present days, and absent days for each student
      for (const studentId in attendanceByStudent) {
        const studentRecord = attendanceByStudent[studentId];
        datesArray.forEach((date) => {
          const dateString = moment(date).format("YYYY-MM-DD");
          const status = studentRecord.attendance[dateString];
          if (["late", "present", "absent"].includes(status)) {
            studentRecord.totalWorkingDays += 1;
            if (status === "present") {
              studentRecord.totalPresentDays += 1;
            } else if (status === "absent") {
              studentRecord.totalAbsentDays += 1;
            }
          }
        });
      }

      const finalResult = Object.values(attendanceByStudent);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fetched student attendance report successfully!",
        result: finalResult,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getStudentAttendanceReport(req) {
    try {
      const { academicYearId, studentId } = req.query;

      const [academicYearData, schoolData] = await Promise.all([
        academicYearQuery.findOne({ _id: academicYearId }),
        schoolQuery.findOne({ _id: req.schoolId }),
      ]);

      if (!academicYearData) return notFoundError("Academic year not found");
      if (!schoolData) return notFoundError("School not found");

      const fromYear = academicYearData.from;
      const toYear = academicYearData.to;
      const fromMonth = moment(new Date(schoolData.sessionStartMonth)).month();
      const toMonth = moment(new Date(schoolData.sessionEndMonth)).month();

      const startDate = moment(
        `${fromYear}-${String(fromMonth + 1).padStart(2, "0")}-01`
      ).startOf("month");
      const endDate = moment(
        `${toYear}-${String(toMonth + 1).padStart(2, "0")}-01`
      ).endOf("month");
      const datesArray = {};

      for (
        let m = moment(startDate);
        m.isBefore(endDate) || m.isSame(endDate);
        m.add(1, "month")
      ) {
        const monthYear = m.format("YYYY-MM");
        datesArray[monthYear] = [];
        for (
          let d = m.clone().startOf("month");
          d.isBefore(m.clone().endOf("month")) ||
          d.isSame(m.clone().endOf("month"));
          d.add(1, "days")
        ) {
          datesArray[monthYear].push(d.toDate());
        }
      }

      // Aggregate pipeline
      const pipeline = [
        {
          $match: {
            academicYear: mongoose.Types.ObjectId(academicYearId),
            student: mongoose.Types.ObjectId(studentId),
            date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          },
        },
        {
          $group: {
            _id: { month: { $substr: ["$date", 0, 7] }, date: "$date" },
            attendanceStatus: { $first: "$attendanceStatus" },
          },
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            date: "$_id.date",
            attendanceStatus: 1,
          },
        },
        {
          $group: {
            _id: "$month",
            attendance: {
              $push: {
                date: "$date",
                attendanceStatus: "$attendanceStatus",
              },
            },
          },
        },
      ];

      const attendanceRecords = await StudentAttendance.aggregate(pipeline);

      // Organize the result by month and date
      const attendanceByMonth = {};

      Object.keys(datesArray).forEach((monthYear) => {
        attendanceByMonth[monthYear] = {
          attendance: {},
          totalWorkingDays: 0,
          totalPresentDays: 0,
          totalAbsentDays: 0,
        };

        datesArray[monthYear].forEach((date) => {
          const dateString = moment(date).format("YYYY-MM-DD");
          attendanceByMonth[monthYear].attendance[dateString] = "NA"; // default to NA
        });
      });

      attendanceRecords.forEach((record) => {
        record.attendance.forEach((att) => {
          const dateString = moment(att.date).format("YYYY-MM-DD");
          attendanceByMonth[record._id].attendance[dateString] =
            att.attendanceStatus;
        });
      });

      // Calculate total working days, present days, and absent days for each month
      for (const monthYear in attendanceByMonth) {
        const monthRecord = attendanceByMonth[monthYear];
        Object.keys(monthRecord.attendance).forEach((date) => {
          const status = monthRecord.attendance[date];
          if (["late", "absent", "present"].includes(status)) {
            monthRecord.totalWorkingDays += 1;
            if (status === "present") {
              monthRecord.totalPresentDays += 1;
            } else if (status === "absent") {
              monthRecord.totalAbsentDays += 1;
            }
          }
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fetched student attendance report successfully!",
        result: attendanceByMonth,
      });
    } catch (error) {
      throw error;
    }
  }
};
