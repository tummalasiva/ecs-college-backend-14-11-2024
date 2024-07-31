const classQuery = require("@db/class/queries");
const sectionQuery = require("@db/section/queries");
const examAttendanceQuery = require("@db/examAttendance/queries");
const examTermQuery = require("@db/examTerm/queries");
const studentQuery = require("@db/student/queries");
const subjectQuery = require("@db/subject/queries");
const academicYearQuery = require("@db/academicYear/queries");

const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { notFoundError } = require("../../helper/helpers");

module.exports = class ExamAttendanceService {
  static async details(req) {
    try {
      const { classId, sectionId, examTermId, subjectId } = req.query;

      const [
        classData,
        sectionData,
        examTermData,
        subjectData,
        academicYearData,
      ] = await Promise.all([
        classQuery.findOne({ _id: classId }),
        sectionQuery.findOne({ _id: sectionId, class: classId }),
        examTermQuery.findOne({ _id: examTermId }),
        subjectQuery.findOne({ _id: subjectId, class: classId }),
        academicYearQuery.findOne({ active: true }),
      ]);

      if (!classData) return notFoundError("Class not found");
      if (!sectionData) return notFoundError("Section not found");
      if (!examTermData) return notFoundError("Exam term not found");
      if (!subjectData) return notFoundError("Subject not found");
      if (!academicYearData)
        return notFoundError("Active Academic year not specified");

      let students = await studentQuery.findAll({
        "academicInfo.class": classId,
        "academicInfo.section": sectionId,
        school: req.schoolId,
        academicYear: academicYearData._id,
        active: true,
      });

      let examAttendance = await examAttendanceQuery.findOne({
        class: classId,
        section: sectionId,
        examTerm: examTermId,
        subject: subjectId,
      });

      let attendanceData = [];

      if (examAttendance) {
        let attendance = examAttendance.studentsAttendence;
        for (let att of attendance) {
          let studentInAttendance = students.find(
            (s) => s._id.toString() === att.student?._id?.toString()
          );
          if (studentInAttendance) {
            attendanceData.push(att);
          } else {
            let newItem = {
              student: studentInAttendance,
              attendanceStatus: "present",
            };

            attendanceData.push(newItem);
          }
        }
      } else {
        for (let student of students) {
          let newItem = {
            student: student,
            attendanceStatus: "present",
          };

          attendanceData.push(newItem);
        }
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Attendance list fetched successfully!",
        result: attendanceData,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { classId, sectionId, examTermId, subjectId, attendanceData } =
        req.body;

      console.log(req.body, "================================================");

      const [
        classData,
        sectionData,
        examTermData,
        subjectData,
        academicYearData,
      ] = await Promise.all([
        classQuery.findOne({ _id: classId }),
        sectionQuery.findOne({ _id: sectionId, class: classId }),
        examTermQuery.findOne({ _id: examTermId }),
        subjectQuery.findOne({ _id: subjectId, class: classId }),
        academicYearQuery.findOne({ active: true }),
      ]);

      if (!classData) return notFoundError("Class not found");
      if (!sectionData) return notFoundError("Section not found");
      if (!examTermData) return notFoundError("Exam term not found");
      if (!subjectData) return notFoundError("Subject not found");
      if (!academicYearData)
        return notFoundError("Active Academic year not specified");

      let updatedAttendance = await examAttendanceQuery.updateOne(
        {
          class: classId,
          section: sectionId,
          examTerm: examTermId,
          subject: subjectId,
          academicYear: academicYearData._id,
          school: req.schoolId,
        },
        {
          studentsAttendence: attendanceData,
          takenBy: req.employee._id,
        },
        { upsert: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam Attendance updated successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
