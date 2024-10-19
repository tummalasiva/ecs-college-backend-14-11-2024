const cieExamQuery = require("@db/cieExam/queries");
const sectionQuery = require("@db/section/queries");
const examTitleQuery = require("@db/examTitle/queries");
const degreeCodeQuery = require("@db/degreeCode/queries");
const subjectQuery = require("@db/subject/queries");
const academicYearQuery = require("@db/academicYear/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const {
  notFoundError,
  getGrade,
  formatAcademicYear,
} = require("../../helper/helpers");
const ExcelJS = require("exceljs");
const studentQuery = require("@db/student/queries");
const coursOutcomeQuery = require("@db/courseOutcome/queries");
const StudentExamResult = require("@db/studentExamResult/model");
const studentExamResultQuery = require("@db/studentExamResult/queries");
const gradeQuery = require("@db/examGrade/queries");
const semesterQuery = require("@db/semester/queries");
const CoPoMapping = require("@db/coPoMapping/model");
const copoQuery = require("@db/coPoMapping/queries");
const coPsoQuery = require("@db/coPsoMapping/queries");
const CoPsoMapping = require("@db/coPsoMapping/model");
const employeeSubjectMapping = require("@db/employeeSubjectsMapping/queries");
const coursePlanQuery = require("@db/coursePlan/queries");
const labBatchQuery = require("@db/labBatch/queries");

const puppeteer = require("puppeteer");
const path = require("path");

//helpers
const {
  compileTemplate,
  uploadFileToS3,
  deleteFile,
} = require("../../helper/helpers");
const { default: mongoose } = require("mongoose");

// Function to set cell styles
function setCellStyle(
  cell,
  bold = false,
  alignment = "center",
  fillColor = null
) {
  cell.font = { bold };
  cell.alignment = { horizontal: alignment };
  if (fillColor) {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: fillColor },
    };
  }
}

module.exports = class CieExamService {
  static async create(req) {
    try {
      const { examTitle, questions, coursePlanId, passingMarks, maximumMarks } =
        req.body;

      const semester = await semesterQuery.findOne({ active: true });
      if (!semester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let coursePlan = await coursePlanQuery.findOne({
        _id: coursePlanId,
        semester: semester._id,
        facultyAssigned: req.employee,
      });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Plan not found or not assigned to the faculty!",
          responseCode: "CLIENT_ERROR",
        });

      let data = {
        examTitle,
        semester: semester._id,
        subject: coursePlan.subject?._id,
        section: coursePlan.section?._id,
        courseType: coursePlan.courseType,
        questions,
        createdBy: req.employee,
        year: coursePlan.year,
        passingMarks,
        maximumMarks,
      };

      let dataToCheck = { ...data };
      delete dataToCheck.questions;
      delete dataToCheck.passingMarks;
      delete dataToCheck.maximumMarks;

      let examExists = await cieExamQuery.findOne(dataToCheck);
      if (examExists)
        return common.failureResponse({
          statusCode: httpStatusCode.conflict,
          message:
            "CIE exam with same title, degree code, semester, subject,section, and year already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const createdCieExam = await cieExamQuery.create(data);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "CIE exam created successfully!",
        result: createdCieExam,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { examTitle, questions, coursePlanId, passingMarks, maximumMarks } =
        req.body;

      const semester = await semesterQuery.findOne({ active: true });
      if (!semester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let coursePlan = await coursePlanQuery.findOne({
        _id: coursePlanId,
        semester: semester._id,
        facultyAssigned: req.employee,
      });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Plan not found or not assigned to the faculty!",
          responseCode: "CLIENT_ERROR",
        });

      let data = {
        examTitle,
        semester: semester._id,
        subject: coursePlan.subject?._id,
        section: coursePlan.section?._id,
        courseType: coursePlan.courseType,
        questions,
        createdBy: req.employee,
        year: coursePlan.year,
        passingMarks,
        maximumMarks,
        _id: { $ne: mongoose.Types.ObjectId(req.params.id) },
      };

      let dataToCheck = { ...data };
      delete dataToCheck.questions;
      delete dataToCheck.passingMarks;
      delete dataToCheck.maximumMarks;

      let examExists = await cieExamQuery.findOne(dataToCheck);
      if (examExists)
        return common.failureResponse({
          statusCode: httpStatusCode.conflict,
          message:
            "CIE exam with same title, degree code, semester, subject,section, and year already exists!",
          responseCode: "CLIENT_ERROR",
        });

      delete data._id;
      const createdCieExam = await cieExamQuery.updateOne(
        { _id: req.params.id },
        data
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "CIE exam updated successfully!",
        result: createdCieExam,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const semester = await semesterQuery.findOne({ active: true });
      if (!semester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });
      const cieExams = await cieExamQuery.findAll({
        ...search,
        semester: semester._id,
        createdBy: req.employee,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: cieExams,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await cieExamQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "CIE exam deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async getMarksUpdateSheet(req) {
    try {
      const { subject, section, degreeCode, cieExam, year } = req.query;
      let semester = await semesterQuery.findOne({ active: true });
      if (semester)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Semester not found!",
          responseCode: "CLIENT_ERROR",
        });
      const [subjectData, sectionData, degreeCodeData, cieExamData, coData] =
        await Promise.all([
          subjectQuery.findOne({ _id: subject }),
          sectionQuery.findOne({ _id: section }),
          degreeCodeQuery.findOne({ _id: degreeCode }),
          cieExamQuery.findAll({
            _id: { $in: [cieExam] },
          }),
          coursOutcomeQuery.findAll({ subject: subject }),
        ]);

      if (!subjectData) return notFoundError("Subject not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!degreeCodeData) return notFoundError("Degree Code not found!");
      if (!cieExamData) return notFoundError("CIE Exam not found!");
      if (!coData) return notFoundError("Co-Data not found!");
      // TODO: Implement logic to generate marks update sheet and return it as a downloadable file.

      const workBook = new ExcelJS.Workbook();
      let sheet = workBook.addWorksheet("Marks upload sheet");

      const studentsList = await studentQuery.findAll({
        "academicInfo.degreeCode": degreeCode,
        "academicInfo.section": { $in: [sectionData._id] },
        academicYear: semester.academicYear?._id,
        registeredSubjects: subjectData._id,
      });

      let Header1 = ["", `Semester - ${semester}`];

      sheet.addRow(Header1);

      sheet.addRow(["Course Code : ", `${subjectData.subjectCode}`]);
      sheet.addRow(["Course Title : ", `${subjectData.name}`]);

      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = "center";
      });

      sheet.getRow(2).eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.alignment = "center";

        if (colNumber === 2) {
          // Specific column (like Registration Number)
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF00" }, // Yellow background
          };
        }
      });

      sheet.getRow(3).eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.alignment = "center";

        if (colNumber === 2) {
          // Specific column (like Registration Number)
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF00" }, // Yellow background
          };
        }
      });

      sheet.addRow([]);

      // Add headers
      let Header2 = ["", "", "COs Mapped"];

      for (let exam of cieExamData) {
        console.log(exam.questions, "exc");
        for (let question of exam.questions) {
          Header2.push(question.co?.map((c) => c.coId)?.join(","));
        }
      }

      sheet.addRow(Header2);

      let TestRow = ["", "", ""];
      for (let exam of cieExamData) {
        let numberOfQuestions = exam.questions?.length || 0;

        let halfNumber = Math.floor(numberOfQuestions / 2);

        for (let i = 0; i < halfNumber; i++) {
          TestRow.push("");
        }
        TestRow.push(exam.examTitle?.name);

        for (let i = 0; i < halfNumber; i++) {
          TestRow.push("");
        }
      }

      sheet.addRow(TestRow);

      sheet.getRow(6).eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.alignment = "center";
        if (colNumber > 3) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "C0C0C0" }, // Yellow background
          };
        }
      });

      // HEADER 4

      let Header4 = ["S.No", "Registration Number", "Name"];
      for (let exam of cieExamData) {
        for (let question of exam.questions) {
          Header4.push(question.questionNumber);
        }
      }

      for (let exam of cieExamData) {
        Header4.push(`Total ${exam.examTitle?.name}`);
      }

      Header4 = [...Header4, "Final CIE", "Final SEE", "Grade"];

      sheet.addRow(Header4);

      // HEADER 5
      let HEADER5 = [];
      for (let student of studentsList) {
        let newRow = [
          studentsList.indexOf(student) + 1,
          student.academicInfo.registrationNumber,
          student.basicInfo.name,
        ];

        for (let exam of cieExamData) {
          for (let question of exam.questions) {
            newRow.push("");
          }
        }

        for (let exam of cieExamData) {
          newRow.push("");
        }

        newRow = [...newRow, "", "", ""];

        HEADER5.push(newRow);
      }

      sheet.addRows(HEADER5);

      //

      // Increase width of specific columns if required
      sheet.getColumn(1).width = 15; // Column 1 width
      sheet.getColumn(2).width = 30; // Column 2 width for Registration Number

      // Center align the content of each row
      sheet.eachRow({ includeEmpty: true }, (row) => {
        row.eachCell((cell) => {
          cell.alignment = { horizontal: "center" }; // Center align each cell
        });
      });

      const columnStartIndex = 3; // Start adjusting from column 3 onwards

      // Loop through each column starting from the specified column index
      for (let i = columnStartIndex; i <= sheet.columnCount; i++) {
        let maxColumnLength = 0;

        // Loop through each row of the column to calculate the maximum content width
        sheet.getColumn(i).eachCell((cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 0;
          if (columnLength > maxColumnLength) {
            maxColumnLength = columnLength;
          }
        });

        // Set the column width to the maximum length plus a padding of 2
        sheet.getColumn(i).width = maxColumnLength + 2;
      }

      const filePath = path.join(__dirname, "temp.xlsx");
      const response = await workBook.xlsx.writeBuffer({
        filename: filePath,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: response,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async uploadMarks(req) {
    try {
      const {
        subject,
        section,
        degreeCode,
        academicYear,
        semester,
        cieExams,
        sheetName,
      } = req.body;

      const [
        subjectData,
        sectionData,
        degreeCodeData,
        academicYearData,
        cieExamData,
        coData,
      ] = await Promise.all([
        subjectQuery.findOne({ _id: subject }),
        sectionQuery.findOne({ _id: section }),
        degreeCodeQuery.findOne({ _id: degreeCode }),
        academicYearQuery.findOne({ _id: academicYear }),
        cieExamQuery.findAll({
          _id: { $in: cieExams },
        }),
        coursOutcomeQuery.findAll({ subject: subject }),
      ]);

      if (!subjectData) return notFoundError("Subject not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!degreeCodeData) return notFoundError("Degree Code not found!");
      if (!academicYearData) return notFoundError("Academic Year not found!");
      if (!cieExamData) return notFoundError("CIE Exam not found!");
      if (!coData) return notFoundError("Co-Data not found!");

      const file = req.files?.file; // Make sure your middleware handles file upload properly

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.data);

      const sheet = workbook.getWorksheet(1); // Assuming the relevant data is in the first worksheet

      const headers = {};
      const data = [];

      // Identify the row that contains headers (make sure it's the correct row)
      const headerRow = sheet.getRow(7); // Assuming your header is at row 7

      // Ensure that the headerRow is valid
      if (!headerRow || headerRow.cellCount === 0) {
        throw new Error("Header row is not valid or empty.");
      }

      // Map headers to their column numbers
      headerRow.eachCell((cell, colNumber) => {
        const headerText = cell.value;
        if (
          headerText &&
          (headerText.includes("Total") ||
            headerText.includes("Final") ||
            headerText.includes("Grade"))
        ) {
          headers[headerText.trim()] = colNumber; // Map the header text to its column number
        }
      });

      // Now iterate through the remaining rows and extract data based on header positions
      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 7) {
          // Make sure to skip the header row
          console.log(headers["Final CIE"]);
          const rowData = {
            registrationNumber: row.getCell(2)?.value || "", // Assuming registration number is in column 2

            Total_CIE: headers["Final CIE"]
              ? row.getCell(headers["Final CIE"])?.value || ""
              : "",
            Total_SEE: headers["Final SEE"]
              ? row.getCell(headers["Final SEE"])?.value || ""
              : "",
            Grade: headers["Grade"]
              ? row.getCell(headers["Grade"])?.value || ""
              : "",
          };

          // Dynamically add Total T1, Total T2, ..., based on cieExamData
          cieExamData.forEach((exam) => {
            const examTotalHeader = `Total ${exam.examTitle.name}`;
            rowData[examTotalHeader] = headers[examTotalHeader]
              ? row.getCell(headers[examTotalHeader])?.value || ""
              : "";
          });

          data.push(rowData);
        }
      });

      console.log(data, "data");

      let marksToUpdate = [];

      for (let mark of data) {
        let exams = Object.keys(mark)
          .map((k) => k.split(" ")[1])
          .filter((k) => k);
        console.log(exams, "exams");
        for (let exam of exams) {
          let updateOperation = {
            updateOne: {
              filter: {
                registrationNumber: mark.registrationNumber,
                subject: subjectData._id,
                degreeCode: degreeCodeData._id,
                academicYear: academicYearData._id,
                semester: semester,
                examTitle: cieExamData.find((e) => e.examTitle?.name === exam)
                  ?.examTitle?._id,
                maximumMarks: cieExamData
                  .find((e) => e.examTitle?.name === exam)
                  ?.questions?.reduce((t, c) => t + c.maximumMarks, 0),
              },
              update: {
                marksObtained: mark[`Total ${exam}`],
              },

              upsert: true,
            },
          };
          marksToUpdate.push(updateOperation);
        }
      }

      console.log(marksToUpdate, "marks to update");

      await StudentExamResult.bulkWrite(marksToUpdate);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: data,
      });
    } catch (error) {
      console.error("Error uploading marks:", error);
      throw error;
    }
  }

  // static async getSingleMarksUpdateSheet(req) {
  //   try {
  //     const { subject, section, degreeCode, cieExam, year } = req.query;
  //     const semester = await semesterQuery.findOne({ active: true });
  //     if (!semester)
  //       return common.failureResponse({
  //         statusCode: httpStatusCode.badRequest,
  //         message: "Semester not found!",
  //       });
  //     const [
  //       subjectData,
  //       sectionData,
  //       degreeCodeData,
  //       cieExamData,
  //       semesterData,
  //     ] = await Promise.all([
  //       subjectQuery.findOne({ _id: subject }),
  //       sectionQuery.findOne({ _id: section }),
  //       degreeCodeQuery.findOne({ _id: degreeCode }),
  //       cieExamQuery.findAll({
  //         _id: { $in: [cieExam] },
  //       }),
  //       semesterQuery.findOne({ _id: semester }),
  //     ]);

  //     if (!subjectData) return notFoundError("Subject not found!");
  //     if (!sectionData) return notFoundError("Section not found!");
  //     if (!degreeCodeData) return notFoundError("Degree Code not found!");
  //     if (!cieExamData) return notFoundError("CIE Exam not found!");
  //     if (!semesterData) return notFoundError("Semester not found!");

  //     const workBook = new ExcelJS.Workbook();
  //     let sheet = workBook.addWorksheet("Marks upload sheet");

  //     const studentsList = await studentQuery.findAll({
  //       "academicInfo.degreeCode": degreeCode,
  //       "academicInfo.section": { $in: [sectionData._id] },
  //       academicYear: semester.academicYear?._id,
  //       registeredSubject: { $in: [subject] },
  //       "acdemicInfo.semester": semester._id,
  //       "academicInfo.year": year,
  //     });

  //     let Row1 = [
  //       "",
  //       `Semester - ${`${semesterData.semesterName}-${formatAcademicYear(
  //         semesterData.academicYear?.from,
  //         semesterData.academicYear.to
  //       )}`}`,
  //     ];
  //     let Row2 = ["Course Code : ", `${subjectData.subjectCode}`];
  //     let Row3 = ["Course Title : ", `${subjectData.name}`];

  //     sheet.addRows([Row1, Row2, Row3]);

  //     sheet.getRow(1).eachCell((cell) => {
  //       cell.font = { bold: true };
  //       cell.alignment = "center";
  //     });

  //     sheet.getRow(2).eachCell((cell, colNumber) => {
  //       cell.font = { bold: true };
  //       cell.alignment = "center";

  //       if (colNumber === 2) {
  //         cell.fill = {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "FFFF00" },
  //         };
  //       }
  //     });

  //     sheet.getRow(3).eachCell((cell, colNumber) => {
  //       cell.font = { bold: true };
  //       cell.alignment = "center";

  //       if (colNumber === 2) {
  //         cell.fill = {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "FFFF00" },
  //         };
  //       }
  //     });

  //     let Row4 = [];
  //     sheet.addRow(Row4);

  //     let Row5 = ["", "", ""];
  //     for (let exam of cieExamData) {
  //       let numberOfQuestions = exam.questions?.length || 0;

  //       let halfNumber = Math.floor(numberOfQuestions / 2);

  //       for (let i = 0; i < halfNumber; i++) {
  //         Row5.push("");
  //       }
  //       Row5.push(exam.examTitle?.name);

  //       for (let i = 0; i < halfNumber; i++) {
  //         Row5.push("");
  //       }
  //     }

  //     sheet.addRow(Row5);

  //     sheet.getRow(5).eachCell((cell, colNumber) => {
  //       cell.font = { bold: true };
  //       cell.alignment = "center";
  //       if (colNumber > 3) {
  //         cell.fill = {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "C0C0C0" }, // Yellow background
  //         };
  //       }
  //     });

  //     // HEADER 4

  //     let Row6 = ["S.No", "Registration Number", "Name"];
  //     for (let exam of cieExamData) {
  //       for (let question of exam.questions) {
  //         Row6.push(`${question.questionNumber}-(${question.maximumMarks})`);
  //       }
  //     }

  //     Row6 = [...Row6];

  //     sheet.addRow(Row6);

  //     sheet.getRow(6).eachCell((cell) => {
  //       cell.font = { bold: true };
  //       cell.alignment = "center";
  //     });

  //     // HEADER 5
  //     let Row7 = [];
  //     for (let student of studentsList) {
  //       let newRow = [
  //         studentsList.indexOf(student) + 1,
  //         student.academicInfo.registrationNumber,
  //         student.basicInfo.name,
  //       ];

  //       for (let exam of cieExamData) {
  //         for (let question of exam.questions) {
  //           newRow.push("");
  //         }
  //       }

  //       newRow = [...newRow];

  //       Row7.push(newRow);
  //     }

  //     sheet.addRows(Row7);

  //     // Increase width of specific columns if required
  //     sheet.getColumn(1).width = 15; // Column 1 width
  //     sheet.getColumn(2).width = 30; // Column 2 width for Registration Number

  //     // Center align the content of each row
  //     sheet.eachRow({ includeEmpty: true }, (row) => {
  //       row.eachCell((cell) => {
  //         cell.alignment = { horizontal: "center" }; // Center align each cell
  //       });
  //     });

  //     const columnStartIndex = 3; // Start adjusting from column 3 onwards

  //     // Loop through each column starting from the specified column index
  //     for (let i = columnStartIndex; i <= sheet.columnCount; i++) {
  //       let maxColumnLength = 0;

  //       // Loop through each row of the column to calculate the maximum content width
  //       sheet.getColumn(i).eachCell((cell) => {
  //         const columnLength = cell.value ? cell.value.toString().length : 0;
  //         if (columnLength > maxColumnLength) {
  //           maxColumnLength = columnLength;
  //         }
  //       });

  //       // Set the column width to the maximum length plus a padding of 2
  //       sheet.getColumn(i).width = maxColumnLength + 2;
  //     }

  //     const filePath = path.join(__dirname, "temp.xlsx");
  //     const response = await workBook.xlsx.writeBuffer({
  //       filename: filePath,
  //     });
  //     return common.successResponse({
  //       statusCode: httpStatusCode.ok,
  //       result: response,
  //       meta: {
  //         "Content-Type":
  //           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //       },
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  static async getSingleMarksUpdateSheet(req) {
    try {
      const { cieExamId } = req.query;

      // Fetch active semester data
      const semesterData = await semesterQuery.findOne({ active: true });
      if (!semesterData) {
        return common.failureResponse({
          statusCode: httpStatusCode.badRequest,
          message: "Semester not found!",
        });
      }

      // Fetch CIE exam data
      const cieExamData = await cieExamQuery.findOne({
        _id: cieExamId,
        semester: semesterData._id,
      });
      if (!cieExamData) {
        return common.failureResponse({
          statusCode: httpStatusCode.badRequest,
          message: "Exam not found in the active semester!",
        });
      }

      const {
        subject: subjectData,
        section: sectionData,
        courseType,
        year,
        questions,
        examTitle,
      } = cieExamData;

      // Set up student filter
      let studentFilter = {
        "academicInfo.section": sectionData._id,
        registeredSubject: subjectData._id,
        "academicInfo.semester": semesterData._id,
        "academicInfo.year": year,
        active: true,
      };

      // Handle lab course type
      if (courseType === "lab") {
        const labBatch = await labBatchQuery.findOne({
          semester: semesterData._id,
          subject: subjectData._id,
          section: sectionData._id,
          year,
          faculty: cieExamData.createdBy?._id,
        });

        if (!labBatch) {
          return common.failureResponse({
            statusCode: httpStatusCode.badRequest,
            message: "Lab batch not found!",
          });
        }

        studentFilter = { _id: { $in: labBatch.students.map((s) => s._id) } };
      }

      // Fetch the filtered student list
      const finalStudentsList = await studentQuery.findAll(studentFilter);

      // Set up the Excel workbook and sheet
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Marks Upload Sheet");

      // Add header rows
      const semesterDetails = `Semester - ${
        semesterData.semesterName
      }-${formatAcademicYear(
        semesterData.academicYear.from,
        semesterData.academicYear.to
      )}`;
      const headerRows = [
        ["", semesterDetails],
        ["Course Code : ", subjectData.subjectCode] -
          `${cieExamData.courseType?.toUpperCase()}`,
        ["Course Title : ", subjectData.name],
        [],
        Array(Math.floor(questions.length / 2) + 3)
          .fill("")
          .concat(examTitle.name),
      ];
      sheet.addRows(headerRows);

      // Style header rows
      [1, 2, 3].forEach((rowNum) =>
        sheet.getRow(rowNum).eachCell((cell, col) => {
          setCellStyle(cell, true, "center", col === 2 ? "FFFF00" : null);
        })
      );
      setCellStyle(sheet.getRow(5).getCell(4), true, "center", "C0C0C0");

      // Add question headers
      const questionHeaders = [
        "S.No",
        "Registration Number",
        "Name",
        ...questions.map((q) => `${q.questionNumber} (${q.maximumMarks})`),
      ];
      sheet
        .addRow(questionHeaders)
        .eachCell((cell) => setCellStyle(cell, true));

      // Add student rows
      finalStudentsList.forEach((student, index) => {
        const studentRow = [
          index + 1,
          student.academicInfo.registrationNumber,
          student.basicInfo.name,
          ...Array(questions.length).fill(""),
        ];
        sheet.addRow(studentRow);
      });

      // Set column widths
      sheet.getColumn(1).width = 15;
      sheet.getColumn(2).width = 30;

      // Adjust column widths based on content length
      for (let i = 3; i <= sheet.columnCount; i++) {
        const maxLength =
          Math.max(
            ...sheet
              .getColumn(i)
              .values.map((v) => (v ? v.toString().length : 0))
          ) + 2;
        sheet.getColumn(i).width = maxLength;
      }

      // Center-align all cells
      sheet.eachRow((row) => row.eachCell((cell) => setCellStyle(cell)));

      // Export the workbook
      const filePath = path.join(__dirname, "temp.xlsx");
      const responseBuffer = await workbook.xlsx.writeBuffer();
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: responseBuffer,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      console.error("Error generating marks update sheet:", error);
      throw error;
    }
  }

  static async uploadMarksSingle(req) {
    try {
      const { cieExamId } = req.body;

      const semester = await semesterQuery.findOne({ active: true });
      if (!semester) return notFoundError("Active semester not found");

      const cieExamData = await cieExamQuery.findOne({
        createdBy: req.employee,
        _id: cieExamId,
        semester: semester._id,
      });
      if (!cieExamData)
        return notFoundError("CIE Exam not found in the active semester");

      const gradesData = await gradeQuery.findAll({});

      const { subject: subjectData, section: sectionData, year } = cieExamData;

      let excelFile = req.files?.file;

      if (!excelFile || !excelFile.name.endsWith(".xlsx")) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid file format. Please upload an Excel file.",
          responseCode: "CLIENT_ERROR",
        });
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(excelFile.data);

      const sheet = workbook.getWorksheet(1); // Assuming the relevant data is in the first worksheet

      const headers = {};
      const data = [];

      // Identify the row that contains headers (make sure it's the correct row)
      const headerRow = sheet.getRow(6); // Assuming your header is at row 7

      // Ensure that the headerRow is valid
      if (!headerRow || headerRow.cellCount === 0) {
        throw new Error("Header row is not valid or empty.");
      }

      // Map headers to their column numbers
      headerRow.eachCell((cell, colNumber) => {
        const headerText = cell.value;
        if (
          headerText &&
          !(
            headerText.includes("S.No") ||
            headerText.includes("Registration Number") ||
            headerText.includes("Name")
          )
        ) {
          headers[headerText.trim()] = colNumber; // Map the header text to its column number
        }
      });

      // Now iterate through the remaining rows and extract data based on header positions
      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 6) {
          // Make sure to skip the header row

          const answeredQuestions = [];
          for (let question of cieExamData.questions) {
            let newAnswer = { ...question };
            let questionIndex = cieExamData.questions?.indexOf(question);
            let obtainedMarks = row.getCell(2 + questionIndex + 2).value || 0;
            newAnswer["obtainedMarks"] = obtainedMarks;
            newAnswer["coAttained"] =
              obtainedMarks - question.minimumMarksForCoAttainment >= 0
                ? true
                : false;

            answeredQuestions.push(newAnswer);
          }

          const rowData = {
            registrationNumber: row.getCell(2)?.value || "", // Assuming registration number is in column 2
            answeredQuestions,
            Grade: headers["Grade"]
              ? row.getCell(headers["Grade"])?.value || ""
              : "",
          };

          // Dynamically add Total T1, Total T2, ..., based on cieExamData
          cieExamData.forEach((exam) => {
            const examTotalHeader = `Total ${exam.examTitle.name}`;
            rowData[examTotalHeader] = headers[examTotalHeader]
              ? row.getCell(headers[examTotalHeader])?.value || ""
              : "";
          });

          data.push(rowData);
        }
      });

      let marksToUpdate = [];

      for (let mark of data) {
        let exams = Object.keys(mark)
          .map((k) => k.split(" ")[1])
          .filter((k) => k);
        for (let exam of exams) {
          let updateOperation = {
            updateOne: {
              filter: {
                registrationNumber: mark.registrationNumber,
                subject: subjectData._id,
                degreeCode: degreeCodeData._id,
                academicYear: semester.academicYear?._id,
                year: year,
                semester: semester._id,
                examTitle: cieExamData.find((e) => e.examTitle?.name === exam)
                  ?.examTitle?._id,
                section: sectionData._id,
                maximumMarks: cieExamData
                  .find((e) => e.examTitle?.name === exam)
                  ?.questions?.reduce((t, c) => t + c.maximumMarks, 0),
              },
              update: {
                marksObtained: mark.answeredQuestions.reduce(
                  (t, c) => t + c.obtainedMarks,
                  0
                ),
                answeredQuestions: mark?.answeredQuestions,
                grade: getGrade(
                  mark.answeredQuestions.reduce(
                    (t, c) => t + c.maximumMarks,
                    0
                  ),
                  mark.answeredQuestions.reduce(
                    (t, c) => t + c.obtainedMarks,
                    0
                  ),
                  gradesData
                )?.grade,
              },

              upsert: true,
            },
          };
          marksToUpdate.push(updateOperation);
        }
      }

      await StudentExamResult.bulkWrite(marksToUpdate);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: data,
        message: "Marks uploaded successfully!",
      });
    } catch (error) {
      console.error("Error uploading marks:", error);
      throw error;
    }
  }

  static async getCOAttainment(req) {
    try {
      const {
        degreeCode,
        semester,
        year,
        examTitles,
        subject,
        academicYear,
        section,
      } = req.query;
      if (!Array.isArray(examTitles))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Invalid exam titles. Please provide an array of exam titles.",
          responseCode: "CLIENT_ERROR",
        });

      let coData = await coursOutcomeQuery.findAll({ subject });

      let subjectData = await subjectQuery.findOne({ _id: subject });
      if (!subjectData) return notFoundError("Subject not found!");

      let filter = {
        examTitle: {
          $in: examTitles.map((e) => mongoose.Types.ObjectId(e)),
        },
        subject: mongoose.Types.ObjectId(subject),
        semester: mongoose.Types.ObjectId(semester),
        academicYear: mongoose.Types.ObjectId(academicYear),
        degreeCode: mongoose.Types.ObjectId(degreeCode),
        // year: year,
      };

      if (section) {
        filter["section"] = mongoose.Types.ObjectId(section);
      }

      let employeeSubjectMappingFilter = {
        "subjects.subject": subject,
        semester,
        degreeCode,
        academicYear,
      };

      if (section) {
        employeeSubjectMappingFilter["subjects.section"] = section;
      }

      let mappings = await employeeSubjectMapping.findAll(filter);

      const results = await StudentExamResult.aggregate([
        {
          $match: filter,
        },
        {
          $unwind: "$answeredQuestions", // Unwind the answeredQuestions array to work with each question
        },
        {
          $unwind: "$answeredQuestions.co", // Unwind the COs array to work with each CO
        },
        {
          $group: {
            _id: "$answeredQuestions.co", // Group by Course Outcome (CO)
            totalAttempts: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $gte: ["$answeredQuestions.obtainedMarks", 0] },
                      { $eq: ["$answeredQuestions.obtainedMarks", null] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            }, // Count students who attempted the question
            totalAttained: {
              $sum: {
                $cond: [
                  { $eq: ["$answeredQuestions.coAttained", true] }, // Count students who attained the CO
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: "courseoutcomes",
            localField: "_id",
            foreignField: "_id",
            as: "courseOutcomeDetails",
          },
        },
        {
          $unwind: "$courseOutcomeDetails",
        },
        {
          $project: {
            courseOutcomeDetails: 1,
            coId: "$_id", // The CO ID
            attainmentPercentage: {
              $multiply: [
                { $divide: ["$totalAttained", "$totalAttempts"] },
                100,
              ], // Calculate the percentage of students who attained the CO
            },
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: { results, coData, subjectData, faculties: mappings },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getCOAttainmentCourseLevel(req) {
    try {
      const {
        degreeCode,
        semester,
        year,
        examTitles,
        subjects, // Expect a list of subjects
        academicYear,
        section,
      } = req.query;

      // Validate examTitles as an array
      if (!Array.isArray(examTitles)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Invalid exam titles. Please provide an array of exam titles.",
          responseCode: "CLIENT_ERROR",
        });
      }

      // Validate subjects as an array
      if (!Array.isArray(subjects) || subjects.length === 0) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide a list of subjects.",
          responseCode: "CLIENT_ERROR",
        });
      }

      let finalResults = [];

      // Iterate over each subject to calculate CO and course-level attainment
      for (const subject of subjects) {
        // Fetch CO data related to the subject
        let coData = await coursOutcomeQuery.findAll({ subject });

        // Create filter based on query parameters
        let filter = {
          examTitle: {
            $in: examTitles.map((e) => mongoose.Types.ObjectId(e)),
          },
          subject: mongoose.Types.ObjectId(subject),
          semester: mongoose.Types.ObjectId(semester),
          academicYear: mongoose.Types.ObjectId(academicYear),
          degreeCode: mongoose.Types.ObjectId(degreeCode),
        };

        // Add section to filter if provided
        if (section) {
          filter["section"] = mongoose.Types.ObjectId(section);
        }

        // Aggregation pipeline to get CO and Course-level attainment
        const results = await StudentExamResult.aggregate([
          {
            $match: filter,
          },
          {
            $unwind: "$answeredQuestions", // Unwind the answeredQuestions array
          },
          {
            $unwind: "$answeredQuestions.co", // Unwind the COs array for each question
          },
          {
            $group: {
              _id: "$answeredQuestions.co", // Group by CO (Course Outcome)
              totalAttempts: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $gte: ["$answeredQuestions.obtainedMarks", 0] },
                        { $eq: ["$answeredQuestions.obtainedMarks", null] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              }, // Sum total students who attempted the CO
              totalAttained: {
                $sum: {
                  $cond: [
                    { $eq: ["$answeredQuestions.coAttained", true] },
                    1,
                    0,
                  ],
                },
              }, // Sum total students who attained the CO
            },
          },
          {
            $group: {
              _id: null, // Group all COs together to calculate Course-level data
              totalCourseAttempts: { $sum: "$totalAttempts" }, // Sum of all attempts for the course
              totalCourseAttained: { $sum: "$totalAttained" }, // Sum of all attained for the course
            },
          },
          {
            $project: {
              _id: 0, // Remove the _id field
              courseAttainmentPercentage: {
                $multiply: [
                  { $divide: ["$totalCourseAttained", "$totalCourseAttempts"] },
                  100,
                ], // Calculate the overall course-level attainment percentage
              },
              totalCourseAttempts: 1,
              totalCourseAttained: 1,
            },
          },
        ]);

        // Calculate status based on target attainment (Assuming a default target)
        let givenSubject = await subjectQuery.findOne({ _id: subject });
        const targetAttainment = givenSubject?.targetAttainmentPercentage || 80; // Default target attainment, you can also fetch this from the database
        const avgAttainment = results[0]?.courseAttainmentPercentage || 0;
        const status = avgAttainment >= targetAttainment ? "Met" : "Not Met";
        const gap = (avgAttainment - targetAttainment).toFixed(2);

        let studentFilter = {
          registeredSubjects: { $in: [subject] },
          "academicInfo.semester": semester,
        };

        if (section) {
          studentFilter["academicInfo.section"] = { $in: [section] };
        }

        let students = await studentQuery.findAll({
          ...studentFilter,
        });

        // Prepare final result for the subject
        const result = {
          courseName: givenSubject?.name, // Replace with actual course name if needed
          totalStudents: students.length,
          cos: coData.length, // Total COs
          avgAttainment: `${avgAttainment.toFixed(2)}%`,
          targetAttainment: `${targetAttainment}%`,
          gap: `${gap}%`, // Add the gap field
          status: status,
        };

        // Add result to finalResults array
        finalResults.push(result);
      }

      // Return the final calculated results for all subjects
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: finalResults,
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadStudentMarks(req) {
    try {
      const { cieExamId } = req.query;

      // Fetch active semester
      const semester = await semesterQuery.findOne({ active: true });
      if (!semester) return notFoundError("Active semester not found");

      // Validate CIE exam data
      const cieExamData = await cieExamQuery.findOne({
        createdBy: req.employee,
        semester: semester._id,
        _id: cieExamId,
      });
      if (!cieExamData) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid CIE Exam ID or not created by current employee",
          responseCode: "CLIENT_ERROR",
        });
      }

      const {
        subject: subjectData,
        section,
        year,
        examTitle,
        questions,
      } = cieExamData;
      const grades = await gradeQuery.findAll({});

      // Fetch student marks and details
      const studentMarks = await studentExamResultQuery.findAll({
        semester: semester._id,
        year,
        subject: subjectData._id,
        section,
        examTitle: { $in: [examTitle._id] },
      });

      const students = await studentQuery.findAll({
        "academicInfo.registrationNumber": {
          $in: studentMarks.map((m) => m.registrationNumber),
        },
      });

      // Initialize Excel workbook
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Marks upload sheet");

      // Helper function to format rows
      const addRow = (row, options = {}) => {
        const rowRef = sheet.addRow(row);
        if (options.bold) {
          rowRef.eachCell((cell) => (cell.font = { bold: true }));
        }
        if (options.center) {
          rowRef.eachCell(
            (cell) => (cell.alignment = { horizontal: "center" })
          );
        }
        if (options.fillColumn) {
          options.fillColumn.forEach((col) => {
            rowRef.getCell(col).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFF00" },
            };
          });
        }
        return rowRef;
      };

      // Header rows setup
      const semesterName = `${semester.semesterName}-${formatAcademicYear(
        semester.academicYear?.from,
        semester.academicYear.to
      )}`;
      addRow(["", `Semester - ${semesterName}`], { bold: true, center: true });
      addRow(
        [
          "Course Code:",
          `${
            subjectData.subjectCode
          } - ${cieExamData.courseType?.toUpperCase()}`,
        ],
        {
          bold: true,
          center: true,
          fillColumn: [2],
        }
      );
      addRow(["Course Title:", subjectData.name], {
        bold: true,
        center: true,
        fillColumn: [2],
      });

      // Empty row and exam title row
      sheet.addRow([]);
      const titleRow = Array(Math.floor(questions.length / 2) + 3).fill("");
      titleRow.push(cieExamData.examTitle?.name);
      sheet.addRow(titleRow);

      // Set up the header for student data
      const headerRow = [
        "S.No",
        "Registration Number",
        "Name",
        ...questions.map((q) => `${q.questionNumber}-(${q.maximumMarks})`),
        "Total",
        "Grade",
      ];
      addRow(headerRow, { bold: true, center: true });

      // Populate student marks
      const studentRows = studentMarks.map((mark, index) => {
        const student = students.find(
          (s) => s.academicInfo.registrationNumber === mark.registrationNumber
        );
        const obtainedMarks = mark.answeredQuestions.map(
          (aq) => aq.obtainedMarks
        );
        const total = obtainedMarks.reduce((sum, marks) => sum + marks, 0);
        const grade =
          getGrade(
            total,
            obtainedMarks.reduce(
              (sum, aq, i) => sum + questions[i].maximumMarks,
              0
            ),
            grades
          )?.grade || "";

        return [
          index + 1,
          student?.academicInfo.registrationNumber || "",
          student?.basicInfo.name || "",
          ...obtainedMarks,
          total,
          grade,
        ];
      });
      sheet.addRows(studentRows);

      // Adjust column widths
      sheet.columns.forEach((column, idx) => {
        column.width =
          Math.max(...column.values.map((v) => (v ? v.toString().length : 0))) +
          2;
        if (idx >= 2) column.alignment = { horizontal: "center" };
      });

      // Write workbook to buffer and send response
      const response = await workbook.xlsx.writeBuffer();
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: response,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getPOAttainment(req) {
    try {
      const {
        degreeCode,
        semester,
        year,
        examTitles,
        subject,
        academicYear,
        section,
      } = req.query;
      if (!Array.isArray(examTitles))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Invalid exam titles. Please provide an array of exam titles.",
          responseCode: "CLIENT_ERROR",
        });

      let filter = {
        examTitle: {
          $in: examTitles.map((e) => mongoose.Types.ObjectId(e)),
        },
        subject: mongoose.Types.ObjectId(subject),
        semester: mongoose.Types.ObjectId(semester),
        academicYear: mongoose.Types.ObjectId(academicYear),
        degreeCode: mongoose.Types.ObjectId(degreeCode),
        // year: year,
      };

      if (section) {
        filter["section"] = mongoose.Types.ObjectId(section);
      }

      const subjectData = await subjectQuery.findOne({ _id: subject });
      if (!subjectData) return notFoundError("Subject not found!");

      let coData = await coursOutcomeQuery.findAll({ subject });
      let copoData = await copoQuery.findAll({
        coId: { $in: coData.map((c) => c._id) },
      });

      const pipeline = [
        {
          $lookup: {
            from: "studentexamresults", // Your collection for exam results
            pipeline: [
              {
                $match: filter,
              },
              {
                $unwind: "$answeredQuestions", // Unwind the answered questions to get each CO
              },
              {
                $unwind: "$answeredQuestions.co", // Unwind the COs array to get individual COs
              },
              {
                $group: {
                  _id: "$answeredQuestions.co", // Group by CO ID
                  totalAttempts: {
                    $sum: {
                      $cond: [
                        {
                          $or: [
                            { $gte: ["$answeredQuestions.obtainedMarks", 0] },
                            { $eq: ["$answeredQuestions.obtainedMarks", null] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  totalAttained: {
                    $sum: {
                      $cond: [
                        { $eq: ["$answeredQuestions.coAttained", true] },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
              // Step 2: Calculate Attainment Percentage
              {
                $project: {
                  _id: 1, // Include CO ID
                  totalAttempts: 1,
                  totalAttained: 1,
                  attainmentPercentage: {
                    $cond: [
                      { $gt: ["$totalAttempts", 0] },
                      {
                        $multiply: [
                          { $divide: ["$totalAttained", "$totalAttempts"] },
                          100,
                        ],
                      },
                      0, // Return 0 if no attempts
                    ],
                  },
                },
              },
            ],
            as: "coAttainments",
          },
        },
        {
          $unwind: "$coAttainments",
        },

        // Step 3: Map CO to PO
        {
          $lookup: {
            from: "copomappings", // Your CoPoMapping collection
            localField: "coAttainments._id", // CO ID from coAttainments
            foreignField: "coId", // CO ID in CoPoMapping
            as: "coPoMapping",
          },
        },

        {
          $unwind: "$coPoMapping",
        },

        // // Step 4: Calculate weighted PO attainment
        {
          $group: {
            _id: "$coPoMapping.poId", // Group by PO ID
            weightedPoAttainment: {
              $sum: {
                $multiply: [
                  "$coAttainments.attainmentPercentage", // CO Attainment Percentage
                  "$coPoMapping.contributionLevel", // Contribution level from CO to PO
                ],
              },
            },
            totalContributionLevel: {
              $sum: "$coPoMapping.contributionLevel", // Sum of contribution levels for normalization
            },
          },
        },

        // // Step 5: Calculate final PO attainment as a percentage
        {
          $project: {
            poId: "$_id", // PO ID
            _id: 0,
            poAttainment: {
              $cond: [
                { $gt: ["$totalContributionLevel", 0] }, // If totalContributionLevel is > 0
                {
                  $divide: ["$weightedPoAttainment", "$totalContributionLevel"],
                }, // Calculate PO attainment percentage
                0, // Else, set attainment to 0
              ],
            },
          },
        },
      ];

      const poAttainmentResults = await CoPoMapping.aggregate(pipeline);

      let copsoData = await coPsoQuery.findAll({
        coId: { $in: coData.map((c) => c._id) },
      });

      const pipeline2 = [
        {
          $lookup: {
            from: "studentexamresults", // Your collection for exam results
            pipeline: [
              {
                $match: filter,
              },
              {
                $unwind: "$answeredQuestions", // Unwind the answered questions to get each CO
              },
              {
                $unwind: "$answeredQuestions.co", // Unwind the COs array to get individual COs
              },
              {
                $group: {
                  _id: "$answeredQuestions.co", // Group by CO ID
                  totalAttempts: {
                    $sum: {
                      $cond: [
                        {
                          $or: [
                            { $gte: ["$answeredQuestions.obtainedMarks", 0] },
                            { $eq: ["$answeredQuestions.obtainedMarks", null] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  totalAttained: {
                    $sum: {
                      $cond: [
                        { $eq: ["$answeredQuestions.coAttained", true] },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
              // Step 2: Calculate Attainment Percentage
              {
                $project: {
                  _id: 1, // Include CO ID
                  totalAttempts: 1,
                  totalAttained: 1,
                  attainmentPercentage: {
                    $cond: [
                      { $gt: ["$totalAttempts", 0] },
                      {
                        $multiply: [
                          { $divide: ["$totalAttained", "$totalAttempts"] },
                          100,
                        ],
                      },
                      0, // Return 0 if no attempts
                    ],
                  },
                },
              },
            ],
            as: "coAttainments",
          },
        },
        {
          $unwind: "$coAttainments",
        },

        // Step 3: Map CO to PO
        {
          $lookup: {
            from: "copsomappings", // Your CoPoMapping collection
            localField: "coAttainments._id", // CO ID from coAttainments
            foreignField: "coId", // CO ID in CoPoMapping
            as: "coPsoMapping",
          },
        },

        {
          $unwind: "$coPsoMapping",
        },

        // // Step 4: Calculate weighted PO attainment
        {
          $group: {
            _id: "$coPsoMapping.psoId", // Group by PO ID
            weightedPoAttainment: {
              $sum: {
                $multiply: [
                  "$coAttainments.attainmentPercentage", // CO Attainment Percentage
                  "$coPsoMapping.contributionLevel", // Contribution level from CO to PO
                ],
              },
            },
            totalContributionLevel: {
              $sum: "$coPsoMapping.contributionLevel", // Sum of contribution levels for normalization
            },
          },
        },

        // // Step 5: Calculate final PO attainment as a percentage
        {
          $project: {
            psoId: "$_id", // PO ID
            _id: 0,
            psoAttainment: {
              $cond: [
                { $gt: ["$totalContributionLevel", 0] }, // If totalContributionLevel is > 0
                {
                  $divide: ["$weightedPoAttainment", "$totalContributionLevel"],
                }, // Calculate PO attainment percentage
                0, // Else, set attainment to 0
              ],
            },
          },
        },
      ];

      const psoAttainmentResults = await CoPsoMapping.aggregate(pipeline2);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: {
          poAttainmentResults,
          subjectData,
          copoData,
          psoAttainmentResults,
          copsoData,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getPSOAttainment(req) {
    try {
      const {
        degreeCode,
        semester,
        year,
        examTitles,
        subject,
        academicYear,
        section,
      } = req.query;
      if (!Array.isArray(examTitles))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Invalid exam titles. Please provide an array of exam titles.",
          responseCode: "CLIENT_ERROR",
        });

      let filter = {
        examTitle: {
          $in: examTitles.map((e) => mongoose.Types.ObjectId(e)),
        },
        subject: mongoose.Types.ObjectId(subject),
        semester: mongoose.Types.ObjectId(semester),
        academicYear: mongoose.Types.ObjectId(academicYear),
        degreeCode: mongoose.Types.ObjectId(degreeCode),
        // year: year,
      };

      if (section) {
        filter["section"] = mongoose.Types.ObjectId(section);
      }

      const subjectData = await subjectQuery.findOne({ _id: subject });
      if (!subjectData) return notFoundError("Subject not found!");

      let coData = await coursOutcomeQuery.findAll({ subject });
      let copsoData = await coPsoQuery.findAll({
        coId: { $in: coData.map((c) => c._id) },
      });

      const pipeline = [
        {
          $lookup: {
            from: "studentexamresults", // Your collection for exam results
            pipeline: [
              {
                $match: filter,
              },
              {
                $unwind: "$answeredQuestions", // Unwind the answered questions to get each CO
              },
              {
                $unwind: "$answeredQuestions.co", // Unwind the COs array to get individual COs
              },
              {
                $group: {
                  _id: "$answeredQuestions.co", // Group by CO ID
                  totalAttempts: {
                    $sum: {
                      $cond: [
                        {
                          $or: [
                            { $gte: ["$answeredQuestions.obtainedMarks", 0] },
                            { $eq: ["$answeredQuestions.obtainedMarks", null] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  totalAttained: {
                    $sum: {
                      $cond: [
                        { $eq: ["$answeredQuestions.coAttained", true] },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
              // Step 2: Calculate Attainment Percentage
              {
                $project: {
                  _id: 1, // Include CO ID
                  totalAttempts: 1,
                  totalAttained: 1,
                  attainmentPercentage: {
                    $cond: [
                      { $gt: ["$totalAttempts", 0] },
                      {
                        $multiply: [
                          { $divide: ["$totalAttained", "$totalAttempts"] },
                          100,
                        ],
                      },
                      0, // Return 0 if no attempts
                    ],
                  },
                },
              },
            ],
            as: "coAttainments",
          },
        },
        {
          $unwind: "$coAttainments",
        },

        // Step 3: Map CO to PO
        {
          $lookup: {
            from: "copsomappings", // Your CoPoMapping collection
            localField: "coAttainments._id", // CO ID from coAttainments
            foreignField: "coId", // CO ID in CoPoMapping
            as: "coPsoMapping",
          },
        },

        {
          $unwind: "$coPsoMapping",
        },

        // // Step 4: Calculate weighted PO attainment
        {
          $group: {
            _id: "$coPsoMapping.psoId", // Group by PO ID
            weightedPoAttainment: {
              $sum: {
                $multiply: [
                  "$coAttainments.attainmentPercentage", // CO Attainment Percentage
                  "$coPsoMapping.contributionLevel", // Contribution level from CO to PO
                ],
              },
            },
            totalContributionLevel: {
              $sum: "$coPsoMapping.contributionLevel", // Sum of contribution levels for normalization
            },
          },
        },

        // // Step 5: Calculate final PO attainment as a percentage
        {
          $project: {
            poId: "$_id", // PO ID
            _id: 0,
            poAttainment: {
              $cond: [
                { $gt: ["$totalContributionLevel", 0] }, // If totalContributionLevel is > 0
                {
                  $divide: ["$weightedPoAttainment", "$totalContributionLevel"],
                }, // Calculate PO attainment percentage
                0, // Else, set attainment to 0
              ],
            },
          },
        },
      ];

      const poAttainmentResults = await CoPsoMapping.aggregate(pipeline);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: { poAttainmentResults, subjectData, copsoData },
      });
    } catch (error) {
      throw error;
    }
  }
};
