const semesterQuery = require("@db/semester/queries");
const academicYearQuery = require("@db/academicYear/queries");
const schoolQuery = require("@db/school/queries");
const httpStatusCode = require("@generics/http-status");
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

      let newSemester = await semesterQuery.create({ ...req.body });

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

      if (updatedSemester.active) {
        await semesterQuery.updateMany(
          { _id: { $ne: updatedSemester._id } },
          { $set: { active: false } }
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
