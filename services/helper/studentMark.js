const subjectQuery = require("@db/subject/queries");
const academicYearQuery = require("@db/academicYear/queries");
const classQuery = require("@db/class/queries");
const sectionQuery = require("@db/section/queries");
const schoolQuery = require("@db/school/queries");
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
            active: true,
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

      students = students.map((s) => ({
        ...s,
        maximumMarks: examScheduleData.maximumMarks,
        maximumWrittenMarks: examScheduleData.writtenMarks,
        maximumPracticalMarks: examScheduleData.practicalMarks,
      }));

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: students,
        message: "Student marks fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  // manage mark
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
      let maximumWrittenMarks = examScheduleData.writtenMarks || 0;
      let maximumPracticalMarks = examScheduleData.practicalMarks || 0;

      for (const mark of studentMarks) {
        if (maximumWrittenMarks < mark.obtainedWrittenMarks) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: `Invalid obtained wriitten marks for student ${mark.studentId}: ${mark.obtainedWrittenMarks}. Maximum marks allowed are ${maximumWrittenMarks}`,
            responseCode: "CLIENT_ERROR",
          });
        }

        if (maximumPracticalMarks < mark.obtainedPracticalMarks) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: `Invalid obtained practical marks for student ${mark.studentId}: ${mark.obtainedPracticalMarks}. Maximum marks allowed are ${maximumPracticalMarks}`,
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      // prepare bulk operation
      const bulkOperation = studentMarks.map((mark) => {
        let totalMarksObtained =
          parseFloat(mark.obtainedWrittenMarks || 0) +
          parseFloat(mark.obtainedPracticalMarks || 0);
        let grade = getGrade(maximumMarks, totalMarksObtained, gradesData);

        return {
          updateOne: {
            filter: {
              student: mark.studentId,
              examSchedule: examScheduleData._id,
              school: schoolId,
            },
            update: {
              $set: {
                obtainedWrittenMarks: mark.obtainedWrittenMarks || 0,
                obtainedPracticalMarks: mark.obtainedPracticalMarks || 0,
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

  // manage mark
  static async getbulkUpdateStudentMarks(req) {
    try {
      const { subjectId, classId, examTermId, sectionId } = req.query;

      // Fetch necessary data concurrently
      const [
        examScheduleData,
        subjectData,
        classData,
        examData,
        sectionData,
        currentAcademicYear,
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
        academicYearQuery.findOne({ active: true }),
      ]);

      // Check for missing data
      if (!examScheduleData) return notFoundError("Exam schedule not found!");
      if (!subjectData) return notFoundError("Subject not found!");
      if (!classData) return notFoundError("Class not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!examData) return notFoundError("Exam not found!");
      if (!currentAcademicYear)
        return notFoundError("Active ademic year not found!");

      // Aggregate student data with their marks
      let students = await Student.aggregate([
        {
          $match: {
            "academicInfo.class": mongoose.Types.ObjectId(classId),
            "academicInfo.section": mongoose.Types.ObjectId(sectionId),
            active: true,
            academicYear: currentAcademicYear._id,
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
            obtainedPracticalMarks: 0,
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
          obtainedPracticalMarks: mark.obtainedPracticalMarks || 0,
          grade: mark.grade ? mark.grade.grade : "",
          comment: mark.comment || "",
        };
      });

      const workbook = new ExcelJS.Workbook();

      const sheet = workbook.addWorksheet("student_marks");

      let header_with_practical_and_written = [
        "MARKS_ID",
        "NAME",
        "Roll_NO",
        `OBTAINED_WRITTEN_MARKS - (MAX - ${examScheduleData.writtenMarks})`,
        `OBTAINED_PRACTICAL_MARKS - (MAX - ${examScheduleData.practicalMarks})`,
        "GRADE",
        "COMMENT",
      ];

      let header_with_practical = [
        "MARKS_ID",
        "NAME",
        "Roll_NO",
        `OBTAINED_PRACTICAL_MARKS - (MAX - ${examScheduleData.practicalMarks})`,
        "GRADE",
        "COMMENT",
      ];

      let header_with_written = [
        "MARKS_ID",
        "NAME",
        "Roll_NO",
        `OBTAINED_WRITTEN_MARKS - (MAX - ${examScheduleData.writtenMarks})`,
        "GRADE",
        "COMMENT",
      ];

      if (examScheduleData.writtenMarks && examScheduleData.practicalMarks) {
        sheet.addRow(header_with_practical_and_written);
        for (let student of students) {
          const mark = student.studentMarks || {};
          let newRow = [
            student.studentMarks._id?.toString(),
            student.basicInfo.name,
            student.academicInfo.rollNumber,
            mark.obtainedWrittenMarks,
            mark.obtainedPracticalMarks,
            mark.grade ? mark.grade.grade : "NA",
            mark.comment,
          ];

          sheet.addRow(newRow);
        }
      } else if (
        examScheduleData.writtenMarks &&
        !examScheduleData.practicalMarks
      ) {
        sheet.addRow(header_with_written);
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
      } else if (
        !examScheduleData.writtenMarks &&
        examScheduleData.practicalMarks
      ) {
        sheet.addRow(header_with_practical);
        for (let student of students) {
          const mark = student.studentMarks || {};
          let newRow = [
            student.studentMarks._id?.toString(),
            student.basicInfo.name,
            student.academicInfo.rollNumber,
            mark.obtainedPracticalMarks,
            mark.grade ? mark.grade.grade : "NA",
            mark.comment,
          ];

          sheet.addRow(newRow);
        }
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

  // manage mark
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
        let totalMarks =
          parseFloat(
            d[
              `OBTAINED_WRITTEN_MARKS - (MAX - ${examScheduleData.writtenMarks})`
            ] || 0
          ) +
          parseFloat(
            d[
              `OBTAINED_PRACTICAL_MARKS - (MAX - ${examScheduleData.practicalMarks})`
            ] || 0
          );
        let grade = getGrade(
          examScheduleData.maximumMarks,
          totalMarks,
          gradesData
        );
        return {
          _id: d["MARKS_ID"],
          obtainedWrittenMarks:
            d[
              `OBTAINED_WRITTEN_MARKS - (MAX - ${examScheduleData.writtenMarks})`
            ],
          obtainedPracticalMarks:
            d[
              `OBTAINED_PRACTICAL_MARKS - (MAX - ${examScheduleData.practicalMarks})`
            ],
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

  // manage mark
  static async getbulkUpdateAllSectionStudentMarks(req) {
    try {
      const { subjectId, classId, examTermId } = req.query;

      // Fetch necessary data concurrently
      const [
        examScheduleData,
        subjectData,
        classData,
        examData,
        sectionData,
        academicYearData,
      ] = await Promise.all([
        examScheduleQuery.findOne({
          examTerm: examTermId,
          class: classId,
          subject: subjectId,
        }),
        subjectQuery.findOne({ _id: subjectId }),
        classQuery.findOne({ _id: classId }),
        examTermQuery.findOne({ _id: examTermId }),
        sectionQuery.findAll({ class: classId }),
        academicYearQuery.findOne({ active: true }),
      ]);

      // Check for missing data
      const missingDataMessages = [
        { condition: !examScheduleData, message: "Exam schedule not found!" },
        { condition: !subjectData, message: "Subject not found!" },
        { condition: !classData, message: "Class not found!" },
        { condition: !sectionData.length, message: "Sections not found!" },
        { condition: !examData, message: "Exam not found!" },
        {
          condition: !academicYearData,
          message: "Active Academic Year not found!",
        },
      ];

      for (const { condition, message } of missingDataMessages) {
        if (condition) return notFoundError(message);
      }

      const workbook = new ExcelJS.Workbook();

      for (let section of sectionData) {
        let sheet = workbook.addWorksheet(`${classData.name}-${section.name}`);

        // Aggregate student data with their marks
        let students = await Student.aggregate([
          {
            $match: {
              "academicInfo.class": mongoose.Types.ObjectId(classId),
              active: true,
              academicYear: academicYearData._id,
              "academicInfo.section": section._id,
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
              obtainedPracticalMarks: 0,
              grade: null,
              comment: "",
            });
            student.studentMarks = newMark;
          }
        }

        const studentMarksToSheet = students.map((stud) => {
          const mark = stud.studentMarks || {};
          return {
            _id: mark._id ? mark._id.toString() : "",
            student_name: stud.basicInfo.name,
            obtainedWrittenMarks: mark.obtainedWrittenMarks || 0,
            obtainedPracticalMarks: mark.obtainedPracticalMarks || 0,
            grade: mark.grade ? mark.grade.grade : "",
            comment: mark.comment || "",
          };
        });

        const headers = {
          practicalAndWritten: [
            "MARKS_ID",
            "NAME",
            "Roll_NO",
            `OBTAINED_WRITTEN_MARKS - (MAX - ${examScheduleData.writtenMarks})`,
            `OBTAINED_PRACTICAL_MARKS - (MAX - ${examScheduleData.practicalMarks})`,
            "GRADE",
            "COMMENT",
          ],
          practicalOnly: [
            "MARKS_ID",
            "NAME",
            "Roll_NO",
            `OBTAINED_PRACTICAL_MARKS - (MAX - ${examScheduleData.practicalMarks})`,
            "GRADE",
            "COMMENT",
          ],
          writtenOnly: [
            "MARKS_ID",
            "NAME",
            "Roll_NO",
            `OBTAINED_WRITTEN_MARKS - (MAX - ${examScheduleData.writtenMarks})`,
            "GRADE",
            "COMMENT",
          ],
        };

        const getHeader = () => {
          if (
            examScheduleData.writtenMarks &&
            examScheduleData.practicalMarks
          ) {
            return headers.practicalAndWritten;
          } else if (examScheduleData.writtenMarks) {
            return headers.writtenOnly;
          } else if (examScheduleData.practicalMarks) {
            return headers.practicalOnly;
          }
          return [];
        };

        const header = getHeader();
        sheet.addRow(header);

        students.forEach((student) => {
          const mark = student.studentMarks || {};
          const newRow = [
            student.studentMarks._id?.toString(),
            student.basicInfo.name,
            student.academicInfo.rollNumber,
            examScheduleData.writtenMarks
              ? mark.obtainedWrittenMarks
              : undefined,
            examScheduleData.practicalMarks
              ? mark.obtainedPracticalMarks
              : undefined,
            mark.grade ? mark.grade.grade : "NA",
            mark.comment,
          ].filter((item) => item !== undefined);

          sheet.addRow(newRow);
        });

        sheet.eachRow((row) => {
          row.eachCell((cell) => {
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
            };
          });
        });

        const firstRow = sheet.getRow(1);
        firstRow.eachCell((cell) => {
          cell.font = { bold: true };
        });

        sheet.columns.forEach((column) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            maxLength = Math.max(
              maxLength,
              cell.value ? cell.value.toString().length : 0
            );
          });
          column.width = maxLength + 2; // Add some extra width for padding
        });
      }

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

  static async getExamResult(req) {
    try {
      const { classId, sectionId, examId } = req.query;

      const [
        academicYearData,
        classData,
        sectionData,
        examData,
        examScheduleData,
      ] = await Promise.all([
        academicYearQuery.findOne({ active: true }),
        classQuery.findOne({ _id: classId }),
        sectionQuery.findOne({ _id: sectionId, class: classId }),
        examTermQuery.findOne({ _id: examId }),
        examScheduleQuery.findAll({ examTerm: examId, class: classId }),
      ]);

      if (!academicYearData)
        return notFoundError("No active academic year found");
      if (!classData) return notFoundError("Class not found");
      if (!sectionData) return notFoundError("Section not found");
      if (!examData) return notFoundError("Exam not found");
      if (!examScheduleData.length)
        return notFoundError("Exam schedules not found for this exam");

      let students = await studentQuery.findAll({
        "academicInfo.class": classId,
        "academicInfo.section": sectionId,
        academicYear: academicYearData._id,
        active: true,
      });

      let studentIds = students.map((s) => s._id);
      const result = await StudentMark.aggregate([
        {
          $match: {
            student: { $in: studentIds },
          },
        },
        {
          $lookup: {
            from: "examschedules",
            localField: "examSchedule",
            foreignField: "_id",
            as: "examScheduleDetails",
            pipeline: [
              {
                $match: {
                  examTerm: examData._id,
                  class: classData._id,
                },
              },
            ],
          },
        },
        {
          $unwind: "$examScheduleDetails",
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
          $addFields: {
            obtainedMarks: {
              $add: ["$obtainedWrittenMarks", "$obtainedPracticalMarks"],
            },
          },
        },
        {
          $group: {
            _id: {
              student: "$student",
              subject: "$subjectDetails._id",
            },
            subjectData: {
              $first: {
                subject: "$subjectDetails",
                obtainedMarks: "$obtainedMarks",
                totalMarks: "$examScheduleDetails.maximumMarks",
                percentage: {
                  $multiply: [
                    {
                      $divide: [
                        "$obtainedMarks",
                        "$examScheduleDetails.maximumMarks",
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id.student",
            subjects: {
              $push: "$subjectData",
            },
            totalMarks: {
              $sum: "$subjectData.totalMarks",
            },
            obtainedMarks: {
              $sum: "$subjectData.obtainedMarks",
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

  static async downloadExamResult(req) {
    try {
      const { classId, sectionId, examId, studentId } = req.query;

      const [
        academicYearData,
        classData,
        sectionData,
        examData,
        examScheduleData,
        studentData,
        schoolData,
      ] = await Promise.all([
        academicYearQuery.findOne({ active: true }),
        classQuery.findOne({ _id: classId }),
        sectionQuery.findOne({ _id: sectionId, class: classId }),
        examTermQuery.findOne({ _id: examId }),
        examScheduleQuery.findAll({ examTerm: examId, class: classId }),
        studentQuery.findOne({ _id: studentId }),
        schoolQuery.findOne({ _id: req.schoolId }),
      ]);

      if (!academicYearData)
        return notFoundError("No active academic year found");
      if (!classData) return notFoundError("Class not found");
      if (!sectionData) return notFoundError("Section not found");
      if (!examData) return notFoundError("Exam not found");
      if (!examScheduleData.length)
        return notFoundError("Exam schedules not found for this exam");
      if (!studentData) return notFoundError("Student data not found");

      const result = await StudentMark.aggregate([
        {
          $match: {
            student: mongoose.Types.ObjectId(studentId),
          },
        },
        {
          $lookup: {
            from: "examschedules",
            localField: "examSchedule",
            foreignField: "_id",
            as: "examScheduleDetails",
            pipeline: [
              {
                $match: {
                  examTerm: examData._id,
                  class: classData._id,
                },
              },
            ],
          },
        },
        {
          $unwind: "$examScheduleDetails",
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
          $addFields: {
            obtainedMarks: {
              $add: ["$obtainedWrittenMarks", "$obtainedPracticalMarks"],
            },
          },
        },
        {
          $group: {
            _id: {
              student: "$student",
              subject: "$subjectDetails._id",
            },
            subjectData: {
              $first: {
                subject: "$subjectDetails",
                obtainedMarks: "$obtainedMarks",
                totalMarks: "$examScheduleDetails.maximumMarks",
                percentage: {
                  $multiply: [
                    {
                      $divide: [
                        "$obtainedMarks",
                        "$examScheduleDetails.maximumMarks",
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id.student",
            subjects: {
              $push: "$subjectData",
            },
            totalMarks: {
              $sum: "$subjectData.totalMarks",
            },
            obtainedMarks: {
              $sum: "$subjectData.obtainedMarks",
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

      const data = {
        settings: schoolData,
        schClass: classData,
        section: sectionData,
        student: studentData,
        examTitle: examData.title,
        studentMarks: result[0],
        subjectMarks: result[0]?.subjects,
        totalMarks: result[0]?.obtainedMarks,
        totalMax: result[0]?.totalMarks,
        percentage: result[0]?.percentage,
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

      const content = await compileTemplate("studentExamReport", data);

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
        margin: {
          top: 15,
          left: 15,
          right: 15,
          bottom: 10,
        },
      });
      await browser.close();

      return common.successResponse({
        result: pdf,
        message: "PDF generated successfully",
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

  static async getGraphDataSubjectWise(req) {
    try {
      const { classId, sectionId, examTermIds, subjectIds } = req.query;

      // Validate input arrays
      if (!Array.isArray(subjectIds) || !subjectIds.length) {
        return common.failureResponse({
          message: "Subjects should be a non-empty list of subject IDs!",
          statusCode: httpStatusCode.bad_request,
        });
      }

      if (!Array.isArray(examTermIds) || !examTermIds.length) {
        return common.failureResponse({
          message: "Exam terms should be a non-empty list of exam term IDs!",
          statusCode: httpStatusCode.bad_request,
        });
      }

      const [currentAcademicYear, classData, sectionData, examTerms] =
        await Promise.all([
          academicYearQuery.findOne({ active: true }),
          classQuery.findOne({ _id: classId }),
          sectionQuery.findOne({ _id: sectionId, class: classId }),
          examTermQuery.findAll({ _id: { $in: examTermIds } }),
        ]);

      // Fetch current academic year
      if (!currentAcademicYear) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      // Validate class and section
      if (!classData) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Class with the given ID was not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (!sectionData) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Section with the given ID was not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      // Fetch exam terms
      if (examTerms.length !== examTermIds.length) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "One or more exam terms were not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const allExamTitles = examTerms.map((ex) => ex.title);

      // Fetch students
      const students = await studentQuery.findAll({
        "academicInfo.class": classId,
        "academicInfo.section": sectionId,
        academicYear: currentAcademicYear._id,
        active: true,
      });
      const studentIds = students.map((s) => s._id);
      const totalStudentsCount = students.length;

      // Fetch exam schedules
      const examSchedules = await examScheduleQuery.findAll({
        exam: { $in: examTermIds },
        subject: { $in: subjectIds },
        class: classId,
      });

      // Group schedules by exam and subject
      const schedulesByExamAndSubject = examSchedules.reduce(
        (acc, schedule) => {
          const examId = schedule.examTerm?._id?.toHexString();
          const subjectId = schedule.subject?._id?.toHexString();
          if (!acc[examId]) acc[examId] = {};
          acc[examId][subjectId] = schedule;
          return acc;
        },
        {}
      );

      // Initialize rawData
      const rawData = {};

      // Calculate percentages
      for (const examTerm of examTerms) {
        rawData[examTerm.title] = {};
        for (const schedule of examSchedules) {
          const subjectId = schedule.subject?._id?.toHexString();
          const examId = schedule.examTerm?._id?.toHexString();
          if (examId !== examTerm?._id?.toHexString()) continue;

          const marks = await studentMarkQuery.findAll({
            student: { $in: studentIds },
            subject: schedule.subject?._id,
            examSchedule: schedule._id,
          });

          const totalMarks = marks.reduce(
            (total, mark) =>
              total +
              parseFloat(
                mark.obtainedWrittenMarks + mark.obtainedPracticalMarks
              ),
            0
          );
          const totalMaxMarks = schedule.maximumMarks * totalStudentsCount;
          const averageMarks = totalMarks / totalStudentsCount;
          const totalAverage = totalMaxMarks / totalStudentsCount;

          console.log(
            schedule.maximumMarks,
            totalMaxMarks,
            totalMarks,
            averageMarks,
            totalStudentsCount,
            totalAverage,
            "=hhh=="
          );
          const percentage = (averageMarks / totalAverage) * 100;
          rawData[examTerm.title][schedule.subject.name] =
            Number(percentage.toFixed(0)) || 0;
        }
      }

      // Prepare final result
      const result = {};
      for (const schedule of examSchedules) {
        const subjectName = schedule.subject?.name;
        if (!result[subjectName]) {
          result[subjectName] = {
            label: subjectName,
            data: [],
          };
        }

        examTerms.forEach((examTerm, index) => {
          result[subjectName].data[index] =
            rawData[examTerm.title][subjectName] || 0;
        });
      }

      // Convert result to array
      const dataArray = Object.values(result);

      return common.successResponse({
        result: { labels: allExamTitles, dataSets: dataArray },
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getGraphDataDivisionWise(req) {
    try {
      const { classId, examTermIds, sectionIds } = req.query;

      if (!Array.isArray(sectionIds) || !sectionIds.length) {
        return common.failureResponse({
          message: "Sections should be a non-empty list of section IDs!",
          statusCode: httpStatusCode.bad_request,
        });
      }

      if (!Array.isArray(examTermIds) || !examTermIds.length) {
        return common.failureResponse({
          message: "Exam terms should be a non-empty list of exam term IDs!",
          statusCode: httpStatusCode.bad_request,
        });
      }

      let [currentAcademicYear, classData, examTerms, sectionData] =
        await Promise.all([
          academicYearQuery.findOne({ active: true }),
          classQuery.findOne({ _id: classId }),
          examTermQuery.findAll({ _id: { $in: examTermIds } }),
          sectionQuery.findAll({ _id: { $in: sectionIds }, class: classId }),
        ]);

      // Fetch current academic year
      if (!currentAcademicYear) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      // Validate class and section
      if (!classData) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Class with the given ID was not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (sectionData.length !== sectionIds.length) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "One or more sections were not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      // Fetch exam terms
      if (examTerms.length !== examTermIds.length) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "One or more exam terms were not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      let allExamTitles = examTerms.map((ex) => ex.title);

      let examSchedulesForTheGivenExamTerms = await examScheduleQuery.findAll({
        examTerm: { $in: examTermIds },
        class: classId,
      });

      let rawData = {};

      for (let examTerm of examTerms) {
        rawData[examTerm.title] = {};

        for (let section of sectionData) {
          let allStudentsOfThisSection = await studentQuery.findAll({
            academicYear: currentAcademicYear._id,
            "academicInfo.class": classId,
            "academicInfo.section": section._id,
            active: true,
          });
          let allStudentIds = allStudentsOfThisSection.map((s) => s._id);
          let studentsCount = allStudentIds.length;

          let examScheduleIds = examSchedulesForTheGivenExamTerms
            .filter(
              (e) => e.examTerm._id.toHexString() === examTerm._id.toHexString()
            )
            .map((e) => e._id);

          let studentMarks = await studentMarkQuery.findAll({
            student: { $in: allStudentIds },
            examSchedule: { $in: examScheduleIds },
          });

          let totalMarks = studentMarks.reduce(
            (total, value) =>
              total +
              (parseFloat(value.obtainedWrittenMarks || 0) +
                parseFloat(value.obtainedPracticalMarks || 0)),
            0
          );
          let totalMaxMarks = examSchedulesForTheGivenExamTerms.reduce(
            (t, c) => t + parseFloat(c.maximumMarks || 0),
            0
          );

          let average = totalMarks / studentsCount || 0;

          let totalAverage = totalMaxMarks / studentsCount;

          let percentage = (Number(average) / Number(totalAverage)) * 100;
          rawData[examTerm.title][section.name] = Number(
            percentage ? percentage.toFixed(0) : 0
          );
        }
      }

      let result = {};

      for (let section of sectionData) {
        result[section.name] = {};

        result[section.name]["label"] = section.name;
        result[section.name]["data"] = [];

        for (let i = 0; i < Object.keys(rawData).length; i++) {
          let key = Object.keys(rawData)[i];

          result[section.name]["data"][i] = rawData[key][section.name];
        }
      }

      let dataArray = [];
      for (let key of Object.keys(result)) {
        dataArray.push(result[key]);
      }

      return common.successResponse({
        result: { labels: allExamTitles, dataSets: dataArray },
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }
};
