const subjectQuery = require("@db/subject/queries");
const Subject = require("@db/subject/model");
const studentQuery = require("@db/student/queries");
const academicYearQuery = require("@db/academicYear/queries");
const employeeQuery = require("@db/employee/queries");
const degreeCodeQuery = require("@db/degreeCode/queries");
const semesterQuery = require("@db/semester/queries");
const subjectComponentQuery = require("@db/subjectComponent/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const Student = require("../../db/student/model");
const { default: mongoose } = require("mongoose");

module.exports = class SubjectService {
  static async create(body) {
    try {
      let filter = {
        subjectCode: { $regex: new RegExp(`^${body.subjectCode}^`, "i") },
        degreeCode: body.degreeCode,
      };

      const subjectExist = await subjectQuery.findOne(filter);
      if (subjectExist) {
        return common.failureResponse({
          message: "Subject already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      const allSubjectComponents = await subjectComponentQuery.findAll({});

      let givenSubjectComponentData = body.componentsAndCredits;

      let subjectComponentsAndCredits = [];

      for (let comp of allSubjectComponents) {
        let newItem = {
          component: comp._id,
          credits:
            givenSubjectComponentData.find(
              (c) => c.component === comp._id.toHexString()
            )?.credits || 0,
          hours:
            givenSubjectComponentData.find(
              (c) => c.component === comp._id.toHexString()
            )?.credits * comp.hoursMultiplicationFactor || 0,
        };

        subjectComponentsAndCredits.push(newItem);
      }

      let totalCredits = subjectComponentsAndCredits.reduce(
        (t, c) => t + c.credits,
        0
      );
      let totalHours = subjectComponentsAndCredits.reduce(
        (t, c) => t + c.hours,
        0
      );

      body.totalCredits = totalCredits;
      body.totalHours = totalHours;
      body.componentsAndCredits = subjectComponentsAndCredits;

      const newSubject = await subjectQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Subject with the name ${body.name} has been added successfully!`,
        result: newSubject,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;

      let subjectList = await subjectQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subjects fetched successfully!",
        result: subjectList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      let filter = {
        subjectCode: { $regex: new RegExp(`^${body.subjectCode}^`, "i") },
        _id: { $ne: id },
        degreeCode: body.degreeCode,
      };

      let otherSubjectWithGivenName = await subjectQuery.findOne(filter);

      if (otherSubjectWithGivenName)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject with the given name already exists",
          responseCode: "CLIENT_ERROR",
        });

      let dataToUpdate = { ...body };

      const allSubjectComponents = await subjectComponentQuery.findAll({});

      let givenSubjectComponentData = dataToUpdate.componentsAndCredits;

      let subjectComponentsAndCredits = [];

      for (let comp of allSubjectComponents) {
        let newItem = {
          component: comp._id,
          credits:
            givenSubjectComponentData.find(
              (c) => c.component === comp._id.toHexString()
            )?.credits || 0,
          hours:
            givenSubjectComponentData.find(
              (c) => c.component === comp._id.toHexString()
            )?.credits * comp.hoursMultiplicationFactor || 0,
        };

        subjectComponentsAndCredits.push(newItem);
      }

      let totalCredits = subjectComponentsAndCredits.reduce(
        (t, c) => t + c.credits,
        0
      );
      let totalHours = subjectComponentsAndCredits.reduce(
        (t, c) => t + c.hours,
        0
      );

      dataToUpdate.totalCredits = totalCredits;
      dataToUpdate.totalHours = totalHours;
      dataToUpdate.componentsAndCredits = subjectComponentsAndCredits;

      let subjects = await subjectQuery.updateOne({ _id: id }, dataToUpdate);
      if (subjects) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Subject updated successfully!",
          result: subjects,
        });
      } else {
        return common.failureResponse({
          message: "Subject not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let subjects = await subjectQuery.delete({ _id: id });

      if (subjects) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Subject deleted successfully!",
          result: subjects,
        });
      } else {
        return common.failureResponse({
          message: "Subject not found",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let subject = await subjectQuery.findOne({ _id: id });

      if (subject) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          result: subject,
        });
      } else {
        return common.failureResponse({
          message: "Subject not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async allocateSubjectsToStudents(req) {
    try {
      const { degreeCodes, semester, subjects, studentIds } = req.body;

      if (!Array.isArray(degreeCodes))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Degree codes should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(subjects))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subjects should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let activeAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!activeAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found!",
          responseCode: "CLIENT_ERROR",
        });

      let semesterData = await semesterQuery.findOne({
        _id: semester,
        academicYear: activeAcademicYear._id,
      });
      if (!semesterData)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "No semester found with given ID! || for the current academic year!",
          responseCode: "CLIENT_ERROR",
        });

      let subjectsList = subjects;

      await studentQuery.updateList(
        {
          _id: studentIds,
          "academicInfo.semester": semester,
          "academicInfo.degreeCode": { $in: degreeCodes },
        },
        { $addToSet: { registeredSubjects: { $each: subjectsList } } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subjects allocated successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async getStudentSubject(req) {
    try {
      const { semester } = req.query;

      let student = await studentQuery.findOne({
        "academicInfo.registrationNumber":
          req.student?.academicInfo?.registrationNumber,
        "academicInfo.semester": semester,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: student?.registeredSubjects || [],
      });
    } catch (error) {
      throw error;
    }
  }

  static async getCourseOverView(req) {
    try {
      const employee = await employeeQuery.findOne({
        _id: req.employee,
        active: true,
      });
      if (!employee)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Employee not found",
          responseCode: "CLIENT_ERROR",
        });

      let degreeCodes = await degreeCodeQuery.findAll({
        department: employee.academicInfo.department?._id,
      });

      let courseOverview = await Subject.aggregate([
        {
          $match: {
            degreeCode: { $in: degreeCodes.map((d) => d._id) },
          },
        },
        {
          $lookup: {
            from: "degreecodes",
            localField: "degreeCode",
            foreignField: "_id",
            as: "degreeCode",
          },
        },
        {
          $unwind: {
            path: "$degreeCode",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$subjectCategory",
            data: {
              $push: {
                subjectCode: "$subjectCode",
                subjectName: "$name",
                totalHours: "$totalHours",
                degreeCode: "$degreeCode.degreeCode",
              },
            },
          },
        },

        {
          $lookup: {
            from: "subjectcategories",
            localField: "_id",
            foreignField: "_id",
            as: "subjectCategory",
          },
        },
        {
          $unwind: {
            path: "$subjectCategory",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            data: 1,
            subjectCategory: "$subjectCategory.name",
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: courseOverview,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAllSubjectsOfThisSemesterAndDepartment(req) {
    try {
      const currentEmployee = await employeeQuery.findOne({
        _id: req.employee,
      });
      let departmentOfCurrentEmployee =
        currentEmployee.academicInfo?.department?._id;
      let degreeCodes = await degreeCodeQuery.findAll({
        department: departmentOfCurrentEmployee,
      });
      let currentSemester = await semesterQuery.findOne({ status: "active" });

      let uniqueSubjects = await Student.aggregate([
        {
          $match: {
            "academicInfo.semester": currentSemester._id,
            "academicInfo.degreeCode": { $in: degreeCodes.map((d) => d._id) },
          },
        },
        {
          $unwind: {
            path: "$registeredSubjects",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "registeredSubjects",
            foreignField: "_id",
            as: "registeredSubjects",
          },
        },
        {
          $unwind: {
            path: "$registeredSubjects",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: null,
            uniqueSubjects: { $addToSet: "$registeredSubjects" }, // Add each unique subject to the set
          },
        },
        {
          $project: {
            uniqueSubjects: 1,
            _id: 0,
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: uniqueSubjects[0], // Return the unique subjects array
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAllStudentsForGivenSubject(req) {
    try {
      const { subject } = req.query;
      let currentSemester = await semesterQuery.findOne({ status: "active" });
      if (!currentSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let allStudents = await studentQuery.findAll({
        "academicInfo.semester": currentSemester._id,
        registeredSubjects: { $in: [subject] },
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: allStudents,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getSubjectsForTimeTable(req) {
    try {
      const { degreeCode, year, section } = req.query;

      let currentSemester = await semesterQuery.findOne({ status: "active" });

      let uniqueSubjects = await Student.aggregate([
        {
          $match: {
            "academicInfo.semester": currentSemester._id,
            "academicInfo.degreeCode": mongoose.Types.ObjectId(degreeCode),
            "academicInfo.year": parseInt(year),
            "academicInfo.section": { $in: [mongoose.Types.ObjectId(section)] },
          },
        },
        {
          $unwind: {
            path: "$registeredSubjects",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "registeredSubjects",
            foreignField: "_id",
            as: "registeredSubjects",
          },
        },
        {
          $unwind: {
            path: "$registeredSubjects",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: null,
            uniqueSubjects: { $addToSet: "$registeredSubjects" }, // Add each unique subject to the set
          },
        },
        {
          $project: {
            uniqueSubjects: 1,
            _id: 0,
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: uniqueSubjects[0], // Return the unique subjects array
      });
    } catch (error) {
      throw error;
    }
  }
};
