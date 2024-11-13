const internalExamQuery = require("@db/internalExam/queries");
const semesterQuery = require("@db/semester/queries");
const EmployeeSubjectMapping = require("@db/employeeSubjectsMapping/model");
const assessmentPlanQuery = require("@db/assessmentPlan/queries");
const studentQuery = require("@db/student/queries");
const studentExamResultQuery = require("@db/studentExamResult/queries");
const degreeCodeQuery = require("@db/degreeCode/queries");
const gradeQuery = require("@db/examGrade/queries");
const httpStatusCode = require("@generics/http-status");
const StudentExamResult = require("@db/studentExamResult/model");
const common = require("@constants/common");
const ExcelJS = require("exceljs");
const coursOutcomeQuery = require("@db/courseOutcome/queries");
const CoPoMapping = require("@db/coPoMapping/model");
const copoQuery = require("@db/coPoMapping/queries");
const coPsoQuery = require("@db/coPsoMapping/queries");
const CoPsoMapping = require("@db/coPsoMapping/model");
const employeeSubjectMapping = require("@db/employeeSubjectsMapping/queries");
const subjectQuery = require("@db/subject/queries");
const path = require("path");
const {
  formatAcademicYear,
  notFoundError,
  getGrade,
} = require("../../helper/helpers");
const { default: mongoose } = require("mongoose");

module.exports = class InternalExamService {
  // create method for faculties and hods
  static async create(req) {
    try {
      const {
        subject,
        section,
        examTitle,
        passingMarks,
        questions,
        students,
        duration,
        enableAnswerUpload,
      } = req.body;

      if (!Array.isArray(JSON.parse(questions)))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Questions should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let assessmentPlanForThisSubject = await assessmentPlanQuery.findOne({
        subject,
        "plan.examTitle": examTitle,
      });
      if (!assessmentPlanForThisSubject)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Assessment Plan not found for this subject!",
          responseCode: "CLIENT_ERROR",
        });

      const currentSemester = await semesterQuery.findOne({ active: true });
      if (!currentSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active semester found!",
          responseCode: "CLIENT_ERROR",
        });

      let employeeSubjectMappingForThisEmployee =
        await employeeSubjectMapping.findOne({
          employee: req.employee,
          semester: currentSemester._id,
          subjects: {
            $elemMatch: {
              subject,
              section,
            },
          },
        });

      if (!employeeSubjectMappingForThisEmployee)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "You are not assigned to this subject in this semester!",
          responseCode: "CLIENT_ERROR",
        });

      const details = assessmentPlanForThisSubject.plan.find(
        (e) => e.examTitle?._id?.toHexString() === examTitle
      );

      if (
        details?.maximumMarks !=
        JSON.parse(questions).reduce(
          (t, c) => t + parseFloat(c.maximumMarks),
          0
        )
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "The total maximum marks should match the sum of all question's maximum marks!",
          responseCode: "CLIENT_ERROR",
        });
      const { count, multipleQuestionsCanBeSet, maximumMarks } = details;

      // if multiple questions can be set then
      if (multipleQuestionsCanBeSet) {
        if (
          !Array.isArray(JSON.parse(students)) ||
          !JSON.parse(students).length
        )
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Students should be an array!",
            responseCode: "CLIENT_ERROR",
          });

        let examWithGivenSetOfStudentsExists = await internalExamQuery.findAll({
          subject,
          semester: currentSemester._id,
          students: { $in: JSON.parse(students) },
          examTitle: examTitle,
          year: parseInt(employeeSubjectMappingForThisEmployee.year),
          createdBy: req.employee,
        });

        if (
          examWithGivenSetOfStudentsExists.length &&
          examWithGivenSetOfStudentsExists.length >= count
        )
          return common.failureResponse({
            statusCode: httpStatusCode.conflict,
            message: `This exam can be created only ${count} time/times in a semester for the given set of students`,
            responseCode: "CLIENT_ERROR",
          });
        else if (
          !examWithGivenSetOfStudentsExists.length ||
          (examWithGivenSetOfStudentsExists.length &&
            examWithGivenSetOfStudentsExists.length !== count)
        ) {
          let newExam = await internalExamQuery.create({
            examIndex: examWithGivenSetOfStudentsExists.length + 1,
            subject,
            examTitle,
            passingMarks,
            maximumMarks: JSON.parse(questions).reduce(
              (t, c) => t + parseFloat(c.maximumMarks),
              0
            ),
            semester: currentSemester._id,
            year: employeeSubjectMappingForThisEmployee.year,
            questions: JSON.parse(questions),
            createdBy: req.employee,
            section,
            students: JSON.parse(students),
            duration,
            enableAnswerUpload: enableAnswerUpload ? true : false,
          });

          return common.successResponse({
            statusCode: httpStatusCode.created,
            message: "Internal Exam created successfully!",
            responseCode: "SUCCESS",
            result: newExam,
          });
        }
      } else {
        let examWithGivenSetOfStudentsExists = await internalExamQuery.findAll({
          subject,
          semester: currentSemester._id,
          section: section,
          examTitle: examTitle,
          year: parseInt(employeeSubjectMappingForThisEmployee.year),
          createdBy: req.employee,
        });

        if (
          examWithGivenSetOfStudentsExists.length &&
          examWithGivenSetOfStudentsExists.length >= count
        )
          return common.failureResponse({
            statusCode: httpStatusCode.conflict,
            message: `This exam can be created only ${count} time/times in a semester for the given set of students`,
            responseCode: "CLIENT_ERROR",
          });
        else if (
          !examWithGivenSetOfStudentsExists.length ||
          (examWithGivenSetOfStudentsExists.length &&
            examWithGivenSetOfStudentsExists.length < count)
        ) {
          let students = await studentQuery.findAll({
            "academicInfo.semester": currentSemester._id,
            "academicInfo.year": employeeSubjectMappingForThisEmployee.year,
            "academicInfo.section": { $in: [section] },
            registeredSubjects: { $in: [subject] },
          });
          let newExam = await internalExamQuery.create({
            examIndex: examWithGivenSetOfStudentsExists.length + 1,
            subject,
            section,
            examTitle,
            passingMarks,
            maximumMarks: JSON.parse(questions).reduce(
              (t, c) => t + parseFloat(c.maximumMarks),
              0
            ),
            semester: currentSemester._id,
            year: employeeSubjectMappingForThisEmployee.year,
            questions: JSON.parse(questions),
            createdBy: req.employee,
            students: students,
            duration,
            enableAnswerUpload: enableAnswerUpload ? true : false,
          });

          return common.successResponse({
            statusCode: httpStatusCode.created,
            message: "Internal Exam created successfully!",
            responseCode: "SUCCESS",
            result: newExam,
          });
        }
      }

      return common.failureResponse({
        statusCode: httpStatusCode.bad_request,
        message: "Invalid request!",
        responseCode: "CLIENT_ERROR",
      });

      // if multiple questions cannot be set then
    } catch (error) {
      throw error;
    }
  }

  // create method for exam co-ordinator and coe
  static async createExternal(req) {
    try {
      const {
        subject,
        examTitle,
        passingMarks,
        questions,
        students,
        duration,
        enableAnswerUpload,
      } = req.body;

      if (!Array.isArray(JSON.parse(questions)))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Questions should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let assessmentPlanForThisSubject = await assessmentPlanQuery.findOne({
        subject,
        "plan.examTitle": examTitle,
      });
      if (!assessmentPlanForThisSubject)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Assessment Plan not found for this subject!",
          responseCode: "CLIENT_ERROR",
        });

      const currentSemester = await semesterQuery.findOne({ active: true });
      if (!currentSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active semester found!",
          responseCode: "CLIENT_ERROR",
        });

      const details = assessmentPlanForThisSubject.plan.find(
        (e) => e.examTitle?._id?.toHexString() === examTitle
      );

      if (
        details?.maximumMarks !=
        JSON.parse(questions).reduce(
          (t, c) => t + parseFloat(c.maximumMarks),
          0
        )
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "The total maximum marks should match the sum of all question's maximum marks!",
          responseCode: "CLIENT_ERROR",
        });
      const { count, multipleQuestionsCanBeSet, maximumMarks } = details;

      // if multiple questions can be set then
      if (multipleQuestionsCanBeSet) {
        if (
          !Array.isArray(JSON.parse(students)) ||
          !JSON.parse(students).length
        )
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Students should be an array!",
            responseCode: "CLIENT_ERROR",
          });

        let examWithGivenSetOfStudentsExists = await internalExamQuery.findAll({
          subject,
          semester: currentSemester._id,
          students: { $in: JSON.parse(students) },
          examTitle: examTitle,
          createdBy: req.employee,
        });

        if (
          examWithGivenSetOfStudentsExists.length &&
          examWithGivenSetOfStudentsExists.length >= count
        )
          return common.failureResponse({
            statusCode: httpStatusCode.conflict,
            message: `This exam can be created only ${count} time/times in a semester for the given set of students`,
            responseCode: "CLIENT_ERROR",
          });
        else if (
          !examWithGivenSetOfStudentsExists.length ||
          (examWithGivenSetOfStudentsExists.length &&
            examWithGivenSetOfStudentsExists.length !== count)
        ) {
          let newExam = await internalExamQuery.create({
            examIndex: examWithGivenSetOfStudentsExists.length + 1,
            subject,
            examTitle,
            passingMarks,
            maximumMarks: JSON.parse(questions).reduce(
              (t, c) => t + parseFloat(c.maximumMarks),
              0
            ),
            semester: currentSemester._id,
            questions: JSON.parse(questions),
            createdBy: req.employee,
            students: JSON.parse(students),
            duration,
            enableAnswerUpload: enableAnswerUpload ? true : false,
          });

          return common.successResponse({
            statusCode: httpStatusCode.created,
            message: "Exam created successfully!",
            responseCode: "SUCCESS",
            result: newExam,
          });
        }
      } else {
        let allStudentsWithThisSubjectThisSemester = await studentQuery.findAll(
          {
            "academicInfo.semester": currentSemester._id,
            registeredSubjects: { $in: [subject] },
          }
        );
        let examWithGivenSetOfStudentsExists = await internalExamQuery.findAll({
          subject,
          semester: currentSemester._id,
          examTitle: examTitle,
          createdBy: req.employee,
          students: {
            $in: allStudentsWithThisSubjectThisSemester.map((s) => s._id),
          },
        });

        if (
          examWithGivenSetOfStudentsExists.length &&
          examWithGivenSetOfStudentsExists.length >= count
        )
          return common.failureResponse({
            statusCode: httpStatusCode.conflict,
            message: `This exam can be created only ${count} time/times in a semester for the given set of students`,
            responseCode: "CLIENT_ERROR",
          });
        else if (
          !examWithGivenSetOfStudentsExists.length ||
          (examWithGivenSetOfStudentsExists.length &&
            examWithGivenSetOfStudentsExists.length < count)
        ) {
          let newExam = await internalExamQuery.create({
            examIndex: examWithGivenSetOfStudentsExists.length + 1,
            subject,

            examTitle,
            passingMarks,
            maximumMarks: JSON.parse(questions).reduce(
              (t, c) => t + parseFloat(c.maximumMarks),
              0
            ),
            semester: currentSemester._id,

            questions: JSON.parse(questions),
            createdBy: req.employee,
            students: allStudentsWithThisSubjectThisSemester.map((s) => s._id),
            duration,
            enableAnswerUpload: enableAnswerUpload ? true : false,
          });

          return common.successResponse({
            statusCode: httpStatusCode.created,
            message: "Internal Exam created successfully!",
            responseCode: "SUCCESS",
            result: newExam,
          });
        }
      }

      return common.failureResponse({
        statusCode: httpStatusCode.bad_request,
        message: "Invalid request!",
        responseCode: "CLIENT_ERROR",
      });

      // if multiple questions cannot be set then
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const filter = { ...search };
      if (req.employee && !filter.createdBy) {
        filter["createdBy"] = req.employee;
      }
      const exams = await internalExamQuery.findAll(filter);
      return common.successResponse({
        result: exams,
        message: "Exams list fetched successfully!",
        responseCode: "SUCCESS",
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const { id } = req.params;
      await internalExamQuery.delete({ _id: id });
      return common.successResponse({
        message: "Exam deleted successfully!",
        responseCode: "SUCCESS",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

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
      const cieExamData = await internalExamQuery.findOne({
        _id: cieExamId,
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
        year,
        questions,
        examTitle,
        students,
      } = cieExamData;

      // Set up student filter
      let studentFilter = {
        _id: { $in: students.map((s) => s._id) },
        active: true,
      };

      // // Handle lab course type
      // if (courseType === "lab") {
      //   const labBatch = await labBatchQuery.findOne({
      //     semester: semesterData._id,
      //     subject: subjectData._id,
      //     section: sectionData._id,
      //     year,
      //     faculty: cieExamData.createdBy?._id,
      //   });

      //   if (!labBatch) {
      //     return common.failureResponse({
      //       statusCode: httpStatusCode.badRequest,
      //       message: "Lab batch not found!",
      //     });
      //   }

      //   studentFilter = { _id: { $in: labBatch.students.map((s) => s._id) } };
      // }

      const workBook = new ExcelJS.Workbook();
      let sheet = workBook.addWorksheet("Marks upload sheet");

      // Fetch the filtered student list
      const finalStudentsList = await studentQuery.findAll(studentFilter);

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
      for (let exam of [cieExamData]) {
        let numberOfQuestions = exam.questions?.length || 0;

        let halfNumber = Math.floor(numberOfQuestions / 2);

        for (let i = 0; i < halfNumber; i++) {
          Row5.push("");
        }
        Row5.push(`${exam.examTitle?.name}-${exam.examIndex}`);

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

      //     // HEADER 4

      let Row6 = ["S.No", "Registration Number", "Name"];
      for (let exam of [cieExamData]) {
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

      //     // HEADER 5
      let Row7 = [];
      for (let student of finalStudentsList) {
        let newRow = [
          finalStudentsList.indexOf(student) + 1,
          student.academicInfo.registrationNumber,
          student.basicInfo.name,
        ];

        for (let exam of [cieExamData]) {
          for (let question of exam.questions) {
            newRow.push("");
          }
        }

        newRow = [...newRow];

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
      const { cieExamId } = req.body;

      const semester = await semesterQuery.findOne({ active: true });
      if (!semester) return notFoundError("Active semester not found");

      const cieExamData = await internalExamQuery.findOne({
        _id: cieExamId,
        semester: semester._id,
      });
      if (!cieExamData)
        return notFoundError("Exam not found in the active semester");

      const gradesData = await gradeQuery.findAll({});

      const { subject: subjectData, section: sectionData, year } = cieExamData;

      let degreeCodeData = await degreeCodeQuery.findOne({
        _id: subjectData.degreeCode,
      });

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
          [cieExamData].forEach((exam) => {
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
                exam: cieExamId,
                semester: semester._id,
                examTitle: cieExamData.examTitle?._id,
                section: sectionData._id,
                maximumMarks: cieExamData?.questions?.reduce(
                  (t, c) => t + c.maximumMarks,
                  0
                ),
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

  static async downloadStudentMarks(req) {
    try {
      const { cieExamId } = req.query;

      const cieExamData = await internalExamQuery.findAll({ _id: cieExamId });
      if (!cieExamData.length)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "CIE Exam not found!",
          responseCode: "NOT_FOUND",
        });

      const grades = await gradeQuery.findAll({});

      const { year, subject: subjectData, section, examTitle } = cieExamData[0];

      const semester = await semesterQuery.findOne({
        _id: cieExamData[0]?.semester?._id,
      });

      const degreeCode = await degreeCodeQuery.findOne({
        _id: subjectData.degreeCode,
      });

      let studentMarks = await studentExamResultQuery.findAll({
        exam: cieExamData,
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
        `Semester - ${`${semester.semesterName}-${formatAcademicYear(
          semester.academicYear?.from,
          semester.academicYear.to
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

  static async getCOAttainment(req) {
    try {
      const { cieExams } = req.query;

      if (!Array.isArray(cieExams))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid exams. Please provide an array of exams.",
          responseCode: "CLIENT_ERROR",
        });

      const cieExamData = await internalExamQuery.findAll({
        _id: { $in: cieExams },
      });

      if (cieExams.length !== cieExamData.length) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid exams. Some exams not found.",
          responseCode: "CLIENT_ERROR",
        });
      }

      let { subject, section, year, semester, courseType } = cieExamData[0];

      let coData = await coursOutcomeQuery.findAll({ subject: subject._id });

      let subjectData = await subjectQuery.findOne({ _id: subject._id });
      if (!subjectData) return notFoundError("Subject not found!");

      let filter = {
        exam: {
          $in: cieExamData.map((e) => e._id),
        },
      };

      let employeeSubjectMappingFilter = {
        subjects: {
          $elemMatch: {
            subject: subject._id,
            section: section._id,
          },
        },
        semester: semester._id,
      };

      let mappings = await employeeSubjectMapping.findAll(
        employeeSubjectMappingFilter
      );

      if (courseType === "lab") {
      }

      console.log(filter, "filter");

      const results = await StudentExamResult.aggregate([
        {
          $match: filter,
        },
        {
          $unwind: "$answeredQuestions", // Unwind the answeredQuestions array to work with each question
        },
        {
          $unwind: "$answeredQuestions.cos", // Unwind the COs array to work with each CO
        },
        {
          $group: {
            _id: "$answeredQuestions.cos", // Group by Course Outcome (CO)
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

      console.log(results, "results");

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: { results, coData, subjectData, faculties: mappings },
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
                $unwind: "$answeredQuestions.cos", // Unwind the COs array to get individual COs
              },
              {
                $group: {
                  _id: "$answeredQuestions.cos", // Group by CO ID
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
                $unwind: "$answeredQuestions.cos", // Unwind the COs array to get individual COs
              },
              {
                $group: {
                  _id: "$answeredQuestions.cos", // Group by CO ID
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
};
