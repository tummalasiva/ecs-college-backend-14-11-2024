const employeeQuery = require("@db/employee/queries");
const classQuery = require("@db/class/queries");
const sectionQuery = require("@db/section/queries");
const subjectQuery = require("@db/subject/queries");
const schoolQuery = require("@db/school/queries");
const teacherActivityQuery = require("@db/teacherActivity/queries");

const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { getDateRange } = require("../../helper/helpers");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class EmployeeService {
  static async create(body) {
    const { class: schoolClass, section, subject } = body;
    try {
      const classExists = await classQuery.findOne({
        _id: ObjectId(schoolClass),
        school: body.school,
      });
      if (!classExists) {
        return common.failureResponse({
          message: "Class not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const sectionExists = await sectionQuery.findOne({
        _id: ObjectId(section),
        class: schoolClass,
        school: body.school,
      });
      if (!sectionExists) {
        return common.failureResponse({
          message: "Section not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const subjectExists = await subjectQuery.findOne({
        _id: ObjectId(subject),
        class: schoolClass,
        school: body.school,
      });
      if (!subjectExists) {
        return common.failureResponse({
          message: "Subject not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      body.fallbackClass = classExists;
      body.fallbackSection = sectionExists;
      body.fallbackSubject = subjectExists;

      const newActivity = await teacherActivityQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Activity added successfully!",
        result: newActivity,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    let filter = { ...search };

    if (filter.from && filter.to) {
      const { endOfDay, startOfDay } = getDateRange(filter.from, filter.to);
      filter["createdAt"] = {
        $gte: startOfDay,
        $lt: endOfDay,
      };
      delete filter.from;
      delete filter.to;
    }

    if (req.schoolId) {
      filter["school"] = req.schoolId;
    }
    try {
      let employeeList = await teacherActivityQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Teacher activities fetched successfully",
        result: employeeList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, currentUser) {
    try {
      const { class: schoolClass, section, subject } = body;

      let activityWithGivenId = await teacherActivityQuery.findOne({ _id: id });
      if (!activityWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Teacher activity not found!",
          responseCode: "CLIENT_ERROR",
        });

      console.log(activityWithGivenId.createdBy._id, "createdBy");
      console.log(currentUser._id, "current user");

      if (
        activityWithGivenId.createdBy?._id?.toHexString() !==
          currentUser._id.toHexString() ||
        currentUser.role.name !== "SUPER ADMIN"
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          messgae: "Permission denied",
          responseCode: "CLIENT_ERROR",
        });
      }

      const classExists = await classQuery.findOne({
        _id: ObjectId(schoolClass),
        school: activityWithGivenId.school,
      });
      if (!classExists) {
        return common.failureResponse({
          message: "Class not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const sectionExists = await sectionQuery.findOne({
        _id: ObjectId(section),
        class: schoolClass,
        school: activityWithGivenId.school,
      });
      if (!sectionExists) {
        return common.failureResponse({
          message: "Section not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const subjectExists = await subjectQuery.findOne({
        _id: ObjectId(subject),
        class: schoolClass,
        school: activityWithGivenId.school,
      });
      if (!subjectExists) {
        return common.failureResponse({
          message: "Subject not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      body.fallbackClass = classExists;
      body.fallbackSection = sectionExists;
      body.fallbackSubject = subjectExists;

      let updatedActivity = await teacherActivityQuery.updateOne(
        { _id: id },
        body,
        {
          new: true,
        }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Activity updated successfully!",
        result: updatedActivity,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let employee = await teacherActivityQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Employee deleted successfully",
        result: employee,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let employeeData = await employeeQuery.findOne({ _id: id });

      if (employeeData) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Employee fetched successfully",
          result: employeeData,
        });
      } else {
        return common.failureResponse({
          message: "Failed to find the employee details",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
