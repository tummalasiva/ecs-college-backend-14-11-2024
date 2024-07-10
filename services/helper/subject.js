const subjectQuery = require("@db/subject/queries");
const classQuery = require("@db/class/queries");
const employeeQuery = require("@db/employee/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class SubjectService {
  static async create(body) {
    try {
      if (
        !Array.isArray(body.subjectTeachers) ||
        !body.subjectTeachers.length
      ) {
        return common.failureResponse({
          message: "Please mention the subject teachers",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const subjectExist = await subjectQuery.findOne({
        name: { $regex: new RegExp(`^${body.name}$`, "i") },
        class: body.class,
        school: body.school,
      });
      if (subjectExist) {
        return common.failureResponse({
          message: "Subject already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const classExist = await classQuery.findOne({
        _id: ObjectId(body.class),
      });
      if (!classExist) {
        return common.failureResponse({
          message: "Class not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      body.fallbackClass = classExist;

      for (let teacher of body.subjectTeachers) {
        const teacherExist = await employeeQuery.findOne({
          _id: ObjectId(teacher),
        });
        if (!teacherExist) {
          return common.failureResponse({
            message: "Teacher not found!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });
        }
      }

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
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }

      let subjectList = await subjectQuery.findAll(filter);

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
      if (body.subjectTeachers) {
        if (
          !Array.isArray(body.subjectTeachers) ||
          !body.subjectTeachers.length
        ) {
          return common.failureResponse({
            message: "Please mention the subject teachers",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      let otherSubjectWithGivenName = await subjectQuery.findOne({
        name: { $regex: new RegExp(`^${body.name}`, "i") },
        class: body.class,
        _id: { $ne: id },
      });

      if (otherSubjectWithGivenName)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject with the given name already exists",
          responseCode: "CLIENT_ERROR",
        });

      let subjects = await subjectQuery.updateOne({ _id: id }, body);
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
};
