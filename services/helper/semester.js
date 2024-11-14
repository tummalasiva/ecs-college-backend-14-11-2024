const semesterQuery = require("@db/semester/queries");
const academicYearQuery = require("@db/academicYear/queries");
const schoolQuery = require("@db/school/queries");
const httpStatusCode = require("@generics/http-status");
const Semester = require("@db/semester/model");
const common = require("@constants/common");
const { notFoundError } = require("../../helper/helpers");

module.exports = class SemesterService {
  static async create(req) {
    try {
      const { academicYearId, semesterName, from, to } = req.body;
      const [academicYearData] = await Promise.all([
        academicYearQuery.findOne({ _id: academicYearId }),
      ]);

      if (!academicYearData)
        return notFoundError("Academic year data not found");

      let semesterWithGivenNameExists = await semesterQuery.findOne({
        academicYear: academicYearId,
        semesterName: { $regex: new RegExp(`^${semesterName}$`, "i") },
      });

      if (semesterWithGivenNameExists)
        return common.failureResponse({
          message:
            "Semester with this name already exists for the given academic year!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newSemester = await semesterQuery.create({
        ...req.body,
        isDefault: "no",
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Semester created successfully",
        result: newSemester,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      let semesterExists = await semesterQuery.findOne({ _id: req.params.id });
      if (!semesterExists)
        return common.failureResponse({
          message: "Semester not found",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      if (
        req.body.semesterName?.trim() !== semesterExists.semesterName?.trim() &&
        semesterExists.isDefault === "yes"
      )
        return common.failureResponse({
          message: "Default semester names cannot be updated",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const updatedSemester = await semesterQuery.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );
      if (!updatedSemester)
        return common.failureResponse({
          message: "Semester not found",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      if (updatedSemester.status === "active") {
        await Semester.updateMany(
          { _id: { $ne: req.params.id }, status: "active" },
          { $set: { status: "inactive" } }
        );
      }
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Semester updated successfully",
        result: updatedSemester,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const filter = { ...search };
      const semesters = await semesterQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Semesters fetched successfully",
        result: semesters,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await semesterQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Semester deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
