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

const puppeteer = require("puppeteer");
const path = require("path");

//helpers
const {
  compileTemplate,
  uploadFileToS3,
  deleteFile,
} = require("../../helper/helpers");
const { default: mongoose } = require("mongoose");

const calculateCOAttainment = (studentResults, coData) => {
  // Create an object to store attainment summary for each CO
  const coSummary = {};

  // Loop through each student's exam result
  studentResults.forEach((result) => {
    result.answeredQuestions.forEach((question) => {
      question.co.forEach((co) => {
        const coId = coData.find(
          (c) => c._id?.toHexString() === co?._id?.toHexString()
        )?.coId;
        const minimumMarks = question.minimumMarksForCoAttainment;
        const obtainedMarks = question.obtainedMarks;

        // Initialize CO in summary if not already present
        if (!coSummary[coId]) {
          coSummary[coId] = {
            totalStudents: 0,
            attainedStudents: 0,
            attainmentPercentage: 0,
          };
        }

        // Increment the total students count for this CO
        coSummary[coId].totalStudents++;

        // Check if the student attained the CO
        if (obtainedMarks >= minimumMarks) {
          coSummary[coId].attainedStudents++;
        }
      });
    });
  });

  // Calculate attainment percentage for each CO
  Object.keys(coSummary).forEach((coId) => {
    const total = coSummary[coId].totalStudents;
    const attained = coSummary[coId].attainedStudents;
    coSummary[coId].attainmentPercentage = ((attained / total) * 100).toFixed(
      2
    );
  });

  return coSummary;
};

module.exports = class CieExamService {
  static async create(req) {
    try {
      const { examTitle, degreeCode, semester, subject, questions, year } =
        req.body;

      let data = {
        examTitle,
        degreeCode,
        semester,
        subject,
        questions,
        createdBy: req.employee,
        year,
      };

      let dataToCheck = { ...data };
      delete dataToCheck.questions;

      let examExists = await cieExamQuery.findOne(dataToCheck);
      if (examExists)
        return common.failureResponse({
          statusCode: httpStatusCode.conflict,
          message:
            "CIE exam with same title, degree code, semester, subject, and year already exists!",
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

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const cieExams = await cieExamQuery.findAll(search);
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
      const {
        subject,
        section,
        degreeCode,
        academicYear,
        semester,
        cieExams,
        sheetName,
      } = req.query;
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
      // TODO: Implement logic to generate marks update sheet and return it as a downloadable file.

      const workBook = new ExcelJS.Workbook();
      let sheet = workBook.addWorksheet("Marks upload sheet");

      const studentsList = await studentQuery.findAll({
        "academicInfo.degreeCode": degreeCode,
        "academicInfo.section": { $in: [sectionData._id] },
        academicYear: academicYearData._id,
        "registeredSubject.subject": subjectData._id,
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

  static async getSingleMarksUpdateSheet(req) {
    try {
      const {
        subject,
        section,
        degreeCode,
        academicYear,
        semester,
        cieExam,
        year,
      } = req.query;
      const [
        subjectData,
        sectionData,
        degreeCodeData,
        academicYearData,
        cieExamData,
        semesterData,
      ] = await Promise.all([
        subjectQuery.findOne({ _id: subject }),
        sectionQuery.findOne({ _id: section }),
        degreeCodeQuery.findOne({ _id: degreeCode }),
        academicYearQuery.findOne({ _id: academicYear }),
        cieExamQuery.findAll({
          _id: { $in: [cieExam] },
        }),
        semesterQuery.findOne({ _id: semester }),
      ]);

      if (!subjectData) return notFoundError("Subject not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!degreeCodeData) return notFoundError("Degree Code not found!");
      if (!academicYearData) return notFoundError("Academic Year not found!");
      if (!cieExamData) return notFoundError("CIE Exam not found!");
      if (!semesterData) return notFoundError("Semester not found!");

      const workBook = new ExcelJS.Workbook();
      let sheet = workBook.addWorksheet("Marks upload sheet");

      const studentsList = await studentQuery.findAll({
        "academicInfo.degreeCode": degreeCode,
        "academicInfo.section": { $in: [sectionData._id] },
        academicYear: academicYearData._id,
        "registeredSubject.subject": subjectData._id,
        "acdemicInfo.semester": semester,
        "academicInfo.year": year,
      });

      let Row1 = [
        "",
        `Semester - ${`${semesterData.semesterName}-${formatAcademicYear(
          semesterData.academicYear?.from,
          semesterData.academicYear.to
        )}`}`,
      ];
      let Row2 = ["Course Code : ", `${subjectData.subjectCode}`];
      let Row3 = ["Course Title : ", `${subjectData.name}`];

      sheet.addRows([Row1, Row2, Row3]);

      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = "center";
      });

      sheet.getRow(2).eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.alignment = "center";

        if (colNumber === 2) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF00" },
          };
        }
      });

      sheet.getRow(3).eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.alignment = "center";

        if (colNumber === 2) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF00" },
          };
        }
      });

      let Row4 = [];
      sheet.addRow(Row4);

      let Row5 = ["", "", ""];
      for (let exam of cieExamData) {
        let numberOfQuestions = exam.questions?.length || 0;

        let halfNumber = Math.floor(numberOfQuestions / 2);

        for (let i = 0; i < halfNumber; i++) {
          Row5.push("");
        }
        Row5.push(exam.examTitle?.name);

        for (let i = 0; i < halfNumber; i++) {
          Row5.push("");
        }
      }

      sheet.addRow(Row5);

      sheet.getRow(5).eachCell((cell, colNumber) => {
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

      let Row6 = ["S.No", "Registration Number", "Name"];
      for (let exam of cieExamData) {
        for (let question of exam.questions) {
          Row6.push(`${question.questionNumber}-(${question.maximumMarks})`);
        }
      }

      Row6 = [...Row6];

      sheet.addRow(Row6);

      sheet.getRow(6).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = "center";
      });

      // HEADER 5
      let Row7 = [];
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

        Row7.push(newRow);
      }

      sheet.addRows(Row7);

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

  static async uploadMarksSingle(req) {
    try {
      const {
        subject,
        section,
        degreeCode,
        academicYear,
        semester,
        cieExam,
        year,
      } = req.body;

      const [
        subjectData,
        sectionData,
        degreeCodeData,
        academicYearData,
        cieExamData,
        gradesData,
      ] = await Promise.all([
        subjectQuery.findOne({ _id: subject }),
        sectionQuery.findOne({ _id: section }),
        degreeCodeQuery.findOne({ _id: degreeCode }),
        academicYearQuery.findOne({ _id: academicYear }),
        cieExamQuery.findAll({
          _id: { $in: [cieExam] },
        }),
        gradeQuery.findAll({}),
      ]);

      if (!subjectData) return notFoundError("Subject not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!degreeCodeData) return notFoundError("Degree Code not found!");
      if (!academicYearData) return notFoundError("Academic Year not found!");
      if (!cieExamData) return notFoundError("CIE Exam not found!");

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
          for (let question of cieExamData[0].questions) {
            let newAnswer = { ...question };
            let questionIndex = cieExamData[0].questions?.indexOf(question);
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
                academicYear: academicYearData._id,
                year: year,
                semester: semester,
                examTitle: cieExamData.find((e) => e.examTitle?.name === exam)
                  ?.examTitle?._id,
                section: section,
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
        result: { results, coData, subjectData },
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
      const {
        academicYear,
        degreeCode,
        year,
        semester,
        subject,
        section,
        examTitle,
      } = req.query;

      const [
        academicYearData,
        degreeCodeData,
        subjectData,
        sectionData,
        examTitleData,
        semesterData,
        cieExamData,
        grades,
      ] = await Promise.all([
        academicYearQuery.findOne({ _id: academicYear }),
        degreeCodeQuery.findOne({ _id: degreeCode }),
        subjectQuery.findOne({ _id: subject }),
        sectionQuery.findOne({ _id: section }),
        examTitleQuery.findAll({ _id: { $in: [examTitle] } }),
        semesterQuery.findOne({ _id: semester }),
        cieExamQuery.findAll({ examTitle: { $in: [examTitle] } }),
        gradeQuery.findAll({}),
      ]);

      if (!academicYearData) return notFoundError("Academic Year not found!");
      if (!degreeCodeData) return notFoundError("Degree Code not found!");
      if (!subjectData) return notFoundError("Subject not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!examTitleData) return notFoundError("One or more Exam not found!");

      let studentMarks = await studentExamResultQuery.findAll({
        academicYear,
        degreeCode,
        semester,
        year,
        subject,
        section,
        examTitle: { $in: [examTitle] },
      });

      let students = await studentQuery.findAll({
        "academicInfo.registrationNumber": {
          $in: studentMarks.map((m) => m.registrationNumber),
        },
      });

      const workBook = new ExcelJS.Workbook();
      let sheet = workBook.addWorksheet("Marks upload sheet");

      let Row1 = [
        "",
        `Semester - ${`${semesterData.semesterName}-${formatAcademicYear(
          semesterData.academicYear?.from,
          semesterData.academicYear.to
        )}`}`,
      ];
      let Row2 = ["Course Code : ", `${subjectData.subjectCode}`];
      let Row3 = ["Course Title : ", `${subjectData.name}`];

      sheet.addRows([Row1, Row2, Row3]);

      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = "center";
      });

      sheet.getRow(2).eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.alignment = "center";

        if (colNumber === 2) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF00" },
          };
        }
      });

      sheet.getRow(3).eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.alignment = "center";

        if (colNumber === 2) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF00" },
          };
        }
      });

      let Row4 = [];
      sheet.addRow(Row4);

      let Row5 = ["", "", ""];
      for (let exam of cieExamData) {
        let numberOfQuestions = exam.questions?.length || 0;

        let halfNumber = Math.floor(numberOfQuestions / 2);

        for (let i = 0; i < halfNumber; i++) {
          Row5.push("");
        }
        Row5.push(exam.examTitle?.name);

        for (let i = 0; i < halfNumber; i++) {
          Row5.push("");
        }
      }

      sheet.addRow(Row5);

      sheet.getRow(5).eachCell((cell, colNumber) => {
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

      let Row6 = ["S.No", "Registration Number", "Name"];
      for (let exam of cieExamData) {
        for (let question of exam.questions) {
          Row6.push(`${question.questionNumber}-(${question.maximumMarks})`);
        }
      }

      Row6 = [...Row6, "Total", "Grade"];

      sheet.addRow(Row6);

      sheet.getRow(6).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = "center";
      });

      let Row7 = [];
      for (let mark of studentMarks) {
        let student = students.find(
          (s) => s.academicInfo.registrationNumber === mark.registrationNumber
        );

        let newRow = [
          studentMarks.indexOf(mark) + 1,
          student.academicInfo.registrationNumber,
          student.basicInfo.name,
        ];

        let total = 0;
        let grade = "";
        let maximumMarks = "";

        for (let exam of cieExamData) {
          for (let answer of mark.answeredQuestions) {
            newRow.push(answer.obtainedMarks);
            total = total + answer.obtainedMarks;
            maximumMarks = maximumMarks + answer.maximumMarks;
          }
        }

        grade = getGrade(maximumMarks, total, grades)?.grade;

        // for (let exam of cieExamData) {
        //   newRow.push("");
        //

        newRow = [...newRow, total, grade];

        Row7.push(newRow);
      }

      sheet.addRows(Row7);

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
