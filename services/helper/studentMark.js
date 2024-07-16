const subjectQuery = require("@db/subject/queries");
const academicYearQuery = require("@db/academicYear/queries");
const classQuery = require("@db/class/queries");
const sectionQuery = require("@db/section/queries");
const employeeQuery = require("@db/employee/queries");
const studentQuery = require("@db/student/queries");
const studentMarkQuery = require("@db/studentMark/queries");
const StudentMark = require("@db/studentMark/model");
const examGradeQuery = require("@db/examGrade/queries");
const examTermQuery = require("@db/examTerm/queries");
const examScheduleQuery = require("@db/examSchedule/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const Student = require("@db/student/model");
const { default: mongoose } = require("mongoose");
const {
  notFoundError,
  compileTemplate,
  getGrade,
} = require("../../helper/helpers");

const puppeteer = require("puppeteer");
const xlsx = require("xlsx");

//built-in modules
const path = require("path");

const ExcelJS = require("exceljs");

module.exports = class StudentMarkService {
  static async listStudentMarks(req) {
    const { classId, sectionId, examId, subjectId } = req.query;
    const schoolId = req.schoolId;

    try {
      const [
        academicYear,
        classData,
        sectionData,
        examData,
        subjectData,
        examScheduleData,
      ] = await Promise.all([
        academicYearQuery.findOne({ active: true }),
        classQuery.findOne({ _id: classId }),
        sectionQuery.findOne({ _id: sectionId }),
        examTermQuery.findOne({ _id: examId }),
        subjectQuery.findOne({ _id: subjectId }),
        examScheduleQuery.findOne({
          examTerm: examId,
          class: classId,
          subject: subjectId,
        }),
      ]);

      // Check for missing data

      if (!academicYear)
        return notFoundError("Active Academic Year not found!");
      if (!classData) return notFoundError("Class not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!examData) return notFoundError("Exam not found!");
      if (!subjectData) return notFoundError("Subject not found!");
      if (!examScheduleData) return notFoundError("Exam Schedule not found!");

      // Aggregate student data with their marks and grades
      let students = await Student.aggregate([
        {
          $match: {
            "academicInfo.class": mongoose.Types.ObjectId(classId),
            "academicInfo.section": mongoose.Types.ObjectId(sectionId),
            academicYear: mongoose.Types.ObjectId(academicYear._id),
            school: mongoose.Types.ObjectId(schoolId),
          },
        },
        {
          $sort: {
            "academicInfo.rollNumber": 1,
          },
        },
        {
          $lookup: {
            from: "studentmarks",
            localField: "_id",
            foreignField: "student",
            as: "studentMarks",
            pipeline: [
              {
                $match: {
                  examSchedule: mongoose.Types.ObjectId(examScheduleData._id),
                },
              },
              {
                $lookup: {
                  from: "examgrades",
                  localField: "grade",
                  foreignField: "_id",
                  as: "grade",
                },
              },
              {
                $unwind: {
                  path: "$grade",
                  preserveNullAndEmptyArrays: true, // Ensure that marks without grades are still included
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$studentMarks",
            preserveNullAndEmptyArrays: true, // Ensure that students without marks are still included
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: students,
        message: "Student marks fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateStudentsMarks(req) {
    try {
      const { classId, sectionId, examId, subjectId, studentMarks } = req.body;

      // Here studentMarks should come like { studentId: ObjectId, obtainedMarks: marks, comment: "comment"}
      const schoolId = req.schoolId;

      const [
        academicYear,
        classData,
        sectionData,
        examData,
        subjectData,
        examScheduleData,
        gradesData,
      ] = await Promise.all([
        academicYearQuery.findOne({ active: true }),
        classQuery.findOne({ _id: classId }),
        sectionQuery.findOne({ _id: sectionId }),
        examTermQuery.findOne({ _id: examId }),
        subjectQuery.findOne({ _id: subjectId }),
        examScheduleQuery.findOne({
          examTerm: examId,
          class: classId,
          subject: subjectId,
        }),
        examGradeQuery.findAll({}),
      ]);

      // Check for missing data

      if (!academicYear)
        return notFoundError("Active Academic Year not found!");
      if (!classData) return notFoundError("Class not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!examData) return notFoundError("Exam not found!");
      if (!subjectData) return notFoundError("Subject not found!");
      if (!examScheduleData) return notFoundError("Exam Schedule not found!");
      if (!gradesData.length) return notFoundError("Exam grades not found!");

      // Check if marks is an array
      if (!Array.isArray(studentMarks)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Provide marks in array",
          responseCode: "CLIENT_ERROR",
        });
      }

      let maximumMarks = examScheduleData.maximumMarks || 0;

      for (const mark of studentMarks) {
        if (maximumMarks < mark.obtainedMarks) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: `Invalid obtained marks for student ${mark.studentId}: ${mark.obtainedMarks}. Maximum marks allowed are ${maximumMarks}`,
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      // prepare bulk operation
      const bulkOperation = studentMarks.map((mark) => {
        let grade = getGrade(maximumMarks, mark.obtainedMarks, gradesData);

        return {
          updateOne: {
            filter: {
              student: mark.studentId,
              examSchedule: examScheduleData._id,
              school: schoolId,
            },
            update: {
              $set: {
                obtainedWrittenMarks: mark.obtainedMarks,
                examSchedule: examScheduleData._id,
                school: schoolId,
                grade: grade?._id || null,
                comment: mark.comment,
              },
            },
            upsert: true, // Ensure new documents are created if they don't exist
          },
        };
      });

      // Perform bulk write operation
      const result = await studentMarkQuery.bulkWrite(bulkOperation, {
        new: true,
        runValidators: true,
      });

      // Prepare response data
      const updatedMarks = await studentMarkQuery.findAll({
        student: { $in: studentMarks.map((mark) => mark.studentId) },
        examSchedule: examScheduleData._id,
        school: schoolId,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Students marks updated successfully!",
        result: updatedMarks.sort(
          (a, b) =>
            a.student.academicInfo.rollNumber -
            b.student.academicInfo.rollNumber
        ),
      });
    } catch (error) {
      // Improved error handling
      return common.failureResponse({
        statusCode: httpStatusCode.internal_server_error,
        message: error.message,
        responseCode: "SERVER_ERROR",
      });
    }
  }

  static async getbulkUpdateStudentMarks(req) {
    try {
      const { subjectId, classId, examTermId, sectionId } = req.query;

      // Fetch necessary data concurrently
      const [examScheduleData, subjectData, classData, examData, sectionData] =
        await Promise.all([
          examScheduleQuery.findOne({
            examTerm: examTermId,
            class: classId,
            subject: subjectId,
          }),
          subjectQuery.findOne({ _id: subjectId }),
          classQuery.findOne({ _id: classId }),
          examTermQuery.findOne({ _id: examTermId }),
          sectionQuery.findOne({ _id: sectionId }),
        ]);

      // Check for missing data
      if (!examScheduleData) return notFoundError("Exam schedule not found!");
      if (!subjectData) return notFoundError("Subject not found!");
      if (!classData) return notFoundError("Class not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!examData) return notFoundError("Exam not found!");

      // Aggregate student data with their marks
      let students = await Student.aggregate([
        {
          $match: {
            "academicInfo.class": mongoose.Types.ObjectId(classId),
            "academicInfo.section": mongoose.Types.ObjectId(sectionId),
            active: true,
          },
        },
        {
          $lookup: {
            from: "studentmarks",
            localField: "_id",
            foreignField: "student",
            as: "studentMarks",
            pipeline: [
              {
                $match: {
                  examSchedule: mongoose.Types.ObjectId(examScheduleData._id),
                },
              },
              {
                $lookup: {
                  from: "examgrades",
                  localField: "grade",
                  foreignField: "_id",
                  as: "grade",
                },
              },
              {
                $unwind: {
                  path: "$grade",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$studentMarks",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      // Check and create missing student marks
      for (let student of students) {
        if (!student.studentMarks) {
          // Create new StudentMark entry
          const newMark = await studentMarkQuery.create({
            school: student.school,
            examSchedule: examScheduleData._id,
            student: student._id,
            obtainedWrittenMarks: 0,
            obtainedPraticalMarks: 0,
            grade: null,
            comment: "",
          });
          student.studentMarks = newMark;
        }
      }

      // Transform data for the spreadsheet
      const studentMarksToSheet = students.map((stud) => {
        const mark = stud.studentMarks || {};
        return {
          _id: mark._id ? mark._id.toString() : "",
          student_name: stud.basicInfo.name,
          obtainedWrittenMarks: mark.obtainedWrittenMarks || 0,
          obtainedPraticalMarks: mark.obtainedPraticalMarks || 0,
          grade: mark.grade ? mark.grade.grade : "",
          comment: mark.comment || "",
        };
      });

      const workbook = new ExcelJS.Workbook();

      const sheet = workbook.addWorksheet("student_marks");
      let header = [
        "MARKS_ID",
        "NAME",
        "Roll_NO",
        "OBTAINED_MARKS",
        "GRADE",
        "COMMENT",
      ];
      sheet.addRow(header);

      for (let student of students) {
        const mark = student.studentMarks || {};
        let newRow = [
          student.studentMarks._id?.toString(),
          student.basicInfo.name,
          student.academicInfo.rollNumber,
          mark.obtainedWrittenMarks,
          mark.grade ? mark.grade.grade : "NA",
          mark.comment,
        ];

        sheet.addRow(newRow);
      }

      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          // Apply horizontal and vertical alignment to center the content
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });
      });
      // Get the first row
      const firstRow = sheet.getRow(1);

      // Iterate through each cell in the first row and apply bold styling
      firstRow.eachCell((cell) => {
        cell.font = { bold: true };
      });

      sheet.columns.forEach((column, columnIndex) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 0
          );
        });
        column.width = maxLength + 2; // Add some extra width for padding
      });

      const xlsxFile = await workbook.xlsx.writeBuffer();

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: xlsxFile,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        message: "Students marks fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async bulkUpdateStudentMarks(req) {
    try {
      if (!req.files || !req.files.file)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Provide file to update student marks",
          responseCode: "CLIENT_ERROR",
        });
      const file = req.files.file;

      const { subjectId, classId, examTermId, sectionId } = req.body;

      // Fetch necessary data concurrently
      const [
        examScheduleData,
        subjectData,
        classData,
        examData,
        sectionData,
        gradesData,
      ] = await Promise.all([
        examScheduleQuery.findOne({
          examTerm: examTermId,
          class: classId,
          subject: subjectId,
        }),
        subjectQuery.findOne({ _id: subjectId }),
        classQuery.findOne({ _id: classId }),
        examTermQuery.findOne({ _id: examTermId }),
        sectionQuery.findOne({ _id: sectionId }),
        examGradeQuery.findAll({}),
      ]);

      // Check for missing data
      if (!examScheduleData) return notFoundError("Exam schedule not found!");
      if (!subjectData) return notFoundError("Subject not found!");
      if (!classData) return notFoundError("Class not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!examData) return notFoundError("Exam not found!");

      // Validate file type
      const validMimeTypes = [
        "application/vnd.oasis.opendocument.spreadsheet",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "application/vnd.ms-excel",
      ];
      if (!validMimeTypes.includes(file.mimetype)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Provide a valid sheet file",
          responseCode: "CLIENT_ERROR",
        });
      }

      const sheetData = xlsx.read(file.data);
      const sheets = sheetData.SheetNames;

      let data = [];
      sheets.forEach((sheet) => {
        const temp = xlsx.utils.sheet_to_json(sheetData.Sheets[sheet]);
        data = data.concat(temp);
      });

      data = data.map((d) => {
        let grade = getGrade(
          examScheduleData.maximumMarks,
          d["OBTAINED_MARKS"],
          gradesData
        );
        return {
          _id: d["MARKS_ID"],
          obtainedWrittenMarks: d["OBTAINED_MARKS"],
          grade: grade?._id,
          comment: d["COMMENT"],
        };
      });

      let maximumMarks = examScheduleData.maximumMarks;

      for (let mark of data) {
        if (mark.obtainedWrittenMarks > maximumMarks) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Marks cannot be greater than maximum marks",
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      // Prepare bulk operations
      const bulkOperations = data.map((mark) => ({
        updateOne: {
          filter: {
            _id: mark._id,
          },
          update: {
            $set: {
              ...mark,
            },
          },
          upsert: true, // Create new document if it doesn't exist
        },
      }));

      // Perform bulk write operation
      const result = await studentMarkQuery.bulkWrite(bulkOperations, {
        new: true,
        runValidators: true,
      });

      // Check if any operations were matched and modified
      if (result.matchedCount === 0) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No student marks were updated or created",
          responseCode: "CLIENT_ERROR",
        });
      }

      return common.successResponse({
        success: true,
        message: "Students marks updated successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async getSubjectMarksSheet(req) {
    try {
      const { subjectId, classId, examTermId, sectionId } = req.query;

      // check missing data
      const [
        academicYearData,
        examScheduleData,
        classData,
        sectionData,
        subjectData,
      ] = await Promise.all([
        academicYearQuery.findOne({ active: true }),
        examScheduleQuery.findOne({
          examTerm: examTermId,
          class: classId,
          subject: subjectId,
        }),
        classQuery.findOne({ _id: classId }),
        sectionQuery.findOne({ _id: sectionId, class: classId }),
        subjectQuery.findOne({ _id: subjectId, class: classId }),
      ]);

      if (!academicYearData) return notFoundError("Academic year not found");
      if (!examScheduleData) return notFoundError("Exam schedule not found");
      if (!sectionData) return notFoundError("Section not found");
      if (!classData) return notFoundError("Class not found");
      if (!subjectData) return notFoundError("Subject not found");

      const students = await studentQuery.findAll({
        "academicInfo.class": examScheduleData.class,
        "academicInfo.section": sectionData._id,
        academicYear: academicYearData._id,
        active: true,
      });
      const studentIds = students.map((student) => student._id);
      const studentMarks = await studentMarkQuery.findAll({
        examSchedule: examScheduleData._id,
        student: { $in: studentIds },
      });

      const workBook = new ExcelJS.Workbook();

      const sheet = workBook.addWorksheet(subjectData.name);

      const row1 = [
        "S.No",
        "Student_Id",
        "Name",
        "Roll_No",
        "Total",
        "Obtained_Marks",
      ];

      sheet.addRow(row1);

      let totalMarks = examScheduleData.maximumMarks;

      for (let mark of studentMarks) {
        let newRow = [
          studentMarks.indexOf(mark) + 1,
          mark.student._id.toString(),
          mark.student.basicInfo.name,
          mark.student.basicInfo.rollNumber,
          totalMarks,
          mark.obtainedWrittenMarks,
        ];

        sheet.addRow(newRow);
      }

      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          // Apply horizontal and vertical alignment to center the content
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });
      });
      // Get the first row
      const firstRow = sheet.getRow(1);

      // Iterate through each cell in the first row and apply bold styling
      firstRow.eachCell((cell) => {
        cell.font = { bold: true };
      });

      sheet.columns.forEach((column, columnIndex) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 0
          );
        });
        column.width = maxLength + 2; // Add some extra width for padding
      });

      const buffer = await workBook.xlsx.writeBuffer();
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

  // pending
  static async getAllMarksUpdateSheet(req) {
    try {
      const { classId, examId } = req.query;

      const [
        academicYearData,
        classData,
        examData,
        examScheduleData,
        sectionData,
      ] = await Promise.all([
        academicYearQuery.findOne({ active: true }),
        classQuery.findAll({ _id: classId }),
        examTermQuery.findOne({ _id: examId }),
        examScheduleQuery.findAll({ examTerm: examId, class: classId }),
        sectionQuery.findAll({ class: classId }),
      ]);

      if (!academicYearData)
        return notFoundError("No active academic year found");
      if (!classData) return notFoundError("Class not found");
      if (!examData) return notFoundError("Exam not found");
      if (!examScheduleData.length)
        return notFoundError("Exam schedule not found");
      if (!sectionData.length)
        return notFoundError("Sections not found for the given class");

      const examScheduleIds = examScheduleData.map((id) => id._id);
      let sectionsMarksList = [];

      const workbook = new ExcelJS.Workbook();

      for (const section of sectionData) {
        const studentsMarks = await Student.aggregate([
          {
            $match: {
              academicYear: academicYearData._id,
              "academicInfo.section": section._id,
              active: true,
            },
          },
          {
            $lookup: {
              from: "studentmarks",
              localField: "_id",
              foreignField: "student",
              as: "studentMarks",
              pipeline: [
                {
                  $match: {
                    examSchedule: {
                      $in: mongoose.Types.ObjectId(examScheduleData._id),
                    },
                  },
                },
                {
                  $lookup: {
                    from: "examgrades",
                    localField: "grade",
                    foreignField: "_id",
                    as: "grade",
                  },
                },
                {
                  $unwind: {
                    path: "$grade",
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$studentMarks",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);
      }

      sectionsMarksList.map((s) => (s.examDetails = examScheduleData));

      for (let sc of sectionsMarksList) {
        if (sc.studentsMarks.length) {
          sc.studentsMarks.sort(
            (a, b) => a.academicInfo.rollNumber - b.academicInfo.rollNumber
          );
        }
      }

      const pdfData = {
        examDetails: examScheduleData,
        sectionsMarksList,
        mergedArray,
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

      const content = await compileTemplate(
        "student-mark-sheet-all-subjects",
        pdfData
      );

      await page.setContent(content);
      const xlsxPath = path.join("./static", "xlsx.full.min.js");

      await page.addScriptTag({ path: xlsxPath });

      const xlsxFile = await page.evaluate((sections) => {
        var tables = document.body.getElementsByTagName("table");
        let wb = XLSX.utils.book_new();
        for (let i = 0; i < tables.length; i++) {
          let workSheet = XLSX.utils.table_to_sheet(tables[i]);
          XLSX.utils.book_append_sheet(
            wb,
            workSheet,
            `  ${sections[i].sectionName}  `
          );
        }
        return XLSX.write(wb, { type: "binary", bookType: "xlsx" });
      }, sections);

      browser.close();

      const bufferXlsx = new Buffer.from(xlsxFile, "binary");
      res.set(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(bufferXlsx);
    } catch (error) {
      throw error;
    }
  }

  static async getExamResult(req) {
    try {
      const { classId, sectionId, examId } = req.query;

      const [academicYearData, classData, sectionData, examData] =
        await Promise.all([
          academicYearQuery.findOne({ active: true }),
          classQuery.findOne({ _id: classId }),
          sectionQuery.findOne({ _id: sectionId, class: classId }),
          examTermQuery.findOne({ _id: examId }),
        ]);

      if (!academicYearData)
        return notFoundError("No active academic year found");
      if (!classData) return notFoundError("Class not found");
      if (!sectionData) return notFoundError("Section not found");
      if (!examData) return notFoundError("Exam not found");

      const result = await StudentMark.aggregate([
        {
          $lookup: {
            from: "examschedules",
            localField: "examSchedule",
            foreignField: "_id",
            as: "examScheduleDetails",
          },
        },
        {
          $unwind: "$examScheduleDetails",
        },
        {
          $match: {
            "examScheduleDetails.examTerm": examData._id,
          },
        },
        {
          $lookup: {
            from: "examgrades",
            let: {
              obtainedMarks: {
                $add: ["$obtainedWrittenMarks", "$obtainedPraticalMarks"],
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $lte: ["$markFrom", "$$obtainedMarks"],
                      },
                      {
                        $gte: ["$markTo", "$$obtainedMarks"],
                      },
                    ],
                  },
                },
              },
            ],
            as: "gradeDetails",
          },
        },
        {
          $unwind: {
            path: "$gradeDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "examScheduleDetails.subject",
            foreignField: "_id",
            as: "subjectDetails",
          },
        },
        {
          $unwind: "$subjectDetails",
        },
        {
          $project: {
            student: 1,
            subject: "$subjectDetails",
            obtainedMarks: {
              $add: ["$obtainedWrittenMarks", "$obtainedPraticalMarks"],
            },
            totalMarks: "$examScheduleDetails.maximumMarks",
            percentage: {
              $multiply: [
                {
                  $divide: [
                    {
                      $add: ["$obtainedWrittenMarks", "$obtainedPraticalMarks"],
                    },
                    "$examScheduleDetails.maximumMarks",
                  ],
                },
                100,
              ],
            },
            grade: "$gradeDetails.grade",
          },
        },
        {
          $group: {
            _id: "$student",
            subjects: {
              $push: {
                subject: "$subject",
                obtainedMarks: "$obtainedMarks",
                totalMarks: "$totalMarks",
                percentage: "$percentage",
                grade: "$grade",
              },
            },
            totalMarks: {
              $sum: "$totalMarks",
            },
            obtainedMarks: {
              $sum: "$obtainedMarks",
            },
          },
        },
        {
          $addFields: {
            percentage: {
              $multiply: [
                {
                  $divide: ["$obtainedMarks", "$totalMarks"],
                },
                100,
              ],
            },
          },
        },
        {
          $lookup: {
            from: "examgrades",
            let: {
              overallPercentage: "$percentage",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $lte: ["$markFrom", "$$overallPercentage"],
                      },
                      {
                        $gte: ["$markTo", "$$overallPercentage"],
                      },
                    ],
                  },
                },
              },
            ],
            as: "overallGradeDetails",
          },
        },
        {
          $unwind: {
            path: "$overallGradeDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "_id",
            as: "studentDetails",
          },
        },
        {
          $unwind: "$studentDetails",
        },
        {
          $project: {
            _id: 0,
            studentId: "$studentDetails._id",
            student: "$studentDetails",
            subjects: 1,
            totalMarks: 1,
            obtainedMarks: 1,
            percentage: 1,
            overallGrade: "$overallGradeDetails.grade",
          },
        },
      ]);

      return common.successResponse({
        result: result
          .sort(
            (a, b) =>
              a.student?.academicInfo?.rollNumber -
              b.student?.academicInfo?.rollNumber
          )
          .map((m) => ({
            ...m,
            percentage: Number(Number(m.percentage).toFixed(2)),
          })),
        message: "Result fetched successfully",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static downloadExamResult(req) {}

  // get result:

  // [
  //   {
  //     $lookup: {
  //       from: "examschedules",
  //       localField: "examSchedule",
  //       foreignField: "_id",
  //       as: "examScheduleDetails",
  //     },
  //   },
  //   {
  //     $unwind: "$examScheduleDetails",
  //   },
  //   {
  //     $match: {
  //       "examScheduleDetails.examTerm": ObjectId(
  //         "66472d4c555db14c0b7a17bb"
  //       ),
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "examgrades",
  //       let: {
  //         obtainedMarks: {
  //           $add: [
  //             "$obtainedWrittenMarks",
  //             "$obtainedPraticalMarks",
  //           ],
  //         },
  //       },
  //       pipeline: [
  //         {
  //           $match: {
  //             $expr: {
  //               $and: [
  //                 {
  //                   $lte: [
  //                     "$markFrom",
  //                     "$$obtainedMarks",
  //                   ],
  //                 },
  //                 {
  //                   $gte: [
  //                     "$markTo",
  //                     "$$obtainedMarks",
  //                   ],
  //                 },
  //               ],
  //             },
  //           },
  //         },
  //       ],
  //       as: "gradeDetails",
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: "$gradeDetails",
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "subjects",
  //       localField: "examScheduleDetails.subject",
  //       foreignField: "_id",
  //       as: "subjectDetails",
  //     },
  //   },
  //   {
  //     $unwind: "$subjectDetails",
  //   },
  //   {
  //     $project: {
  //       student: 1,
  //       subject: "$subjectDetails",
  //       obtainedMarks: {
  //         $add: [
  //           "$obtainedWrittenMarks",
  //           "$obtainedPraticalMarks",
  //         ],
  //       },
  //       totalMarks:
  //         "$examScheduleDetails.maximumMarks",
  //       percentage: {
  //         $multiply: [
  //           {
  //             $divide: [
  //               {
  //                 $add: [
  //                   "$obtainedWrittenMarks",
  //                   "$obtainedPraticalMarks",
  //                 ],
  //               },
  //               "$examScheduleDetails.maximumMarks",
  //             ],
  //           },
  //           100,
  //         ],
  //       },
  //       grade: "$gradeDetails.grade",
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$student",
  //       subjects: {
  //         $push: {
  //           subject: "$subject",
  //           obtainedMarks: "$obtainedMarks",
  //           totalMarks: "$totalMarks",
  //           percentage: "$percentage",
  //           grade: "$grade",
  //         },
  //       },
  //       totalMarks: {
  //         $sum: "$totalMarks",
  //       },
  //       obtainedMarks: {
  //         $sum: "$obtainedMarks",
  //       },
  //     },
  //   },
  //   {
  //     $addFields: {
  //       percentage: {
  //         $multiply: [
  //           {
  //             $divide: [
  //               "$obtainedMarks",
  //               "$totalMarks",
  //             ],
  //           },
  //           100,
  //         ],
  //       },
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "examgrades",
  //       let: {
  //         overallPercentage: "$percentage",
  //       },
  //       pipeline: [
  //         {
  //           $match: {
  //             $expr: {
  //               $and: [
  //                 {
  //                   $lte: [
  //                     "$markFrom",
  //                     "$$overallPercentage",
  //                   ],
  //                 },
  //                 {
  //                   $gte: [
  //                     "$markTo",
  //                     "$$overallPercentage",
  //                   ],
  //                 },
  //               ],
  //             },
  //           },
  //         },
  //       ],
  //       as: "overallGradeDetails",
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: "$overallGradeDetails",
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "students",
  //       localField: "_id",
  //       foreignField: "_id",
  //       as: "studentDetails",
  //     },
  //   },
  //   {
  //     $unwind: "$studentDetails",
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       studentId: "$studentDetails._id",
  //       student: "$studentDetails",
  //       subjects: 1,
  //       totalMarks: 1,
  //       obtainedMarks: 1,
  //       percentage: 1,
  //       overallGrade: "$overallGradeDetails.grade",
  //     },
  //   },
  // ]
};
