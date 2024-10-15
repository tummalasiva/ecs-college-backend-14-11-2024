const labBatchQuery = require("@db/labBatch/queries");
const semesterQuery = require("@db/semester/queries");
const academicYearQuery = require("@db/academicYear/queries");
const employeeQuery = require("@db/employee/queries");
const degreeCodeQuery = require("@db/degreeCode/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { notFoundError } = require("../../helper/helpers");

module.exports = class LabBatchHelper {
  static async create(req) {
    try {
      const { degreeCode, name, faculty, year } = req.body;

      const [degreeCodeData, facultyData, academicYearData, semester] =
        await Promise.all([
          degreeCodeQuery.findOne({ _id: degreeCode }),
          employeeQuery.findOne({ _id: faculty }),
          academicYearQuery.findOne({ active: true }),
          semesterQuery.findOne({ active: true }),
        ]);

      if (!degreeCodeData) return notFoundError("Degree code not found!");
      if (!facultyData) return notFoundError("Faculty not found!");
      if (!academicYearData)
        return notFoundError("Active academic year not found!");

      if (
        degreeCodeData.department?._id?.toHexString() !==
        facultyData.academicInfo.department?._id?.toHexString()
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Faculty and Degree Code should belong to the same department",
          responseCode: "CLIENT_ERROR",
        });

      const batchExists = await labBatchQuery.findOne({
        academicYear: academicYearData._id,
        semester: semester._id,
        year,
        degreeCode: degreeCodeData._id,
        faculty: facultyData._id,
        name: { $regex: new RegExp(`^${name}^`, "i") },
      });

      if (batchExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Lab batch already exists for this semester, degree code and academic year",
          responseCode: "CLIENT_ERROR",
        });

      const newBatch = await labBatchQuery.create({
        ...req.body,
        academicYear: academicYearData._id,
        semester: semester._id,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Lab batch created successfully",
        result: newBatch,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const filter = { ...search };
      const labBatches = await labBatchQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: labBatches,
      });
    } catch (error) {
      throw error;
    }
  }

  static async addStudents(req) {
    try {
      const { studentIds } = req.body;
      const labBatch = await labBatchQuery.updateOne(
        { _id: req.params.id },
        { $addToSet: { students: { $each: studentIds } } },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Students added successfully",
        result: labBatch,
      });
    } catch (error) {
      throw error;
    }
  }

  static async removeStudents(req) {
    try {
      const { studentIds } = req.body;
      const labBatch = await labBatchQuery.updateOne(
        { _id: req.params.id },
        { $pullAll: { students: studentIds } },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Students removed successfully",
        result: labBatch,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { degreeCode, semester, name, faculty, year } = req.body;
      const labBatchExists = await labBatchQuery.findOne({
        _id: req.params.id,
      });

      if (!labBatchExists) return notFoundError("Lab batch not found!");

      let labBatchExitsWithThisCredential = await labBatchQuery.findOne({
        _id: { $ne: req.params.id },
        academicYear: labBatchExists.academicYear._id,
        semester: semester,
        degreeCode,
        year,
        faculty: faculty,
        name: { $regex: new RegExp(`^${name}^`, "i") },
      });

      if (labBatchExitsWithThisCredential)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Lab batch already exists for this semester, degree code and academic year",
          responseCode: "CLIENT_ERROR",
        });

      const updatedLabBatch = await labBatchQuery.updateOne(
        { _id: req.params.id },
        req.body,
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Lab batch updated successfully",
        result: updatedLabBatch,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await labBatchQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Lab batch deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
