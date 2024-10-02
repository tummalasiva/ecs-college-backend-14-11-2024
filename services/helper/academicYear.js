const academicYearQuery = require("@db/academicYear/queries");
const schoolQuery = require("@db/school/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const Semester = require("@db/semester/model");

module.exports = class AcademicYearService {
  static async create(body) {
    try {
      if (!body.schoolId)
        return common.failureResponse({
          message: "School ID is required!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      const academicYearExist = await academicYearQuery.findOne({
        from: body.from,
        to: body.to,
      });
      if (academicYearExist) {
        return common.failureResponse({
          message: "Academic year already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const academicYear = await academicYearQuery.create(body);
      let school = await schoolQuery.findOne({ _id: body.schoolId });
      if (!school)
        return common.failureResponse({
          message: "School not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      let semesterData = [
        {
          academicYear: academicYear._id,
          semesterName: school.academicSemester1?.name,
          from: school.academicSemester1?.from,
          to: school.academicSemester1?.to,
        },
        {
          academicYear: academicYear._id,
          semesterName: school.academicSemester2?.name,
          from: school.academicSemester2?.from,
          to: school.academicSemester2?.to,
        },
      ];

      await Semester.insertMany(semesterData);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Academic year created successfully!",
        result: academicYear,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let academicYearList = await academicYearQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: academicYearList,
        message: "Academic years fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async listPublic(req) {
    try {
      let academicYearList = await academicYearQuery.findAll({});
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: academicYearList,
        message: "Academic years fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      let academicYear = await academicYearQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (academicYear) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Academic year updated successfully!",
          result: academicYear,
        });
      } else {
        return common.failureResponse({
          message: "Academic year not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async toggleActiveStatus(id, userId) {
    try {
      let academicYear = await academicYearQuery.updateOne(
        { _id: id },
        [{ $set: { active: { $eq: ["$active", false] } } }],
        {
          new: true,
        }
      );
      if (academicYear) {
        if (academicYear.active) {
          await academicYearQuery.updateList(
            { _id: { $ne: id } },
            { active: false }
          );
        }
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: academicYear.active
            ? "Academic year activated successfully!"
            : "Academic year deactivated successfully!",
          result: academicYear,
        });
      } else {
        return common.failureResponse({
          message: "Academic year not found!",
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
      let academicYear = await academicYearQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Academic year deleted successfully!",
        result: academicYear,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let academicYear = await academicYearQuery.findOne({ _id: id });

      if (academicYear) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Academic year fetched successfully!",
          result: academicYear,
        });
      } else {
        return common.failureResponse({
          message: "Academic year not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
