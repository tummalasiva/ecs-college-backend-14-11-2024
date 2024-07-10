const salaryGradeQuery = require("@db/salaryGrade/queries");
const SalaryGrade = require("@db/salaryGrade/model");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class SalaryGradeController {
  static async create(body) {
    try {
      const gradeExist = await salaryGradeQuery.findOne({
        grade: { $regex: new RegExp(`^${body.grade}`, "i") },
      });
      if (gradeExist) {
        return common.failureResponse({
          message: "Grade already exist",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      let count = (await SalaryGrade.count({})) + 1;
      let prefix = "Grade";
      if (count < 10) {
        prefix = prefix + "000";
      } else if (count > 9 && count < 100) {
        prefix = prefix + "00";
      } else if (count > 99 && count < 1000) {
        prefix = prefix + "0";
      }
      let gradeCode = prefix + count;
      body.gradeCode = gradeCode;
      const newSalaryGrade = await salaryGradeQuery.create(body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Salary Grade created successfully",
        result: newSalaryGrade,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await salaryGradeQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Salary Grade fetched successfully",
        result: list,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const updatedGrade = await salaryGradeQuery.updateOne(
        { _id: req.params.id },
        { $set: { ...req.body } },
        { new: true }
      );
      if (!updatedGrade)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Salary Grade not found",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Salary Grade updated successfully",
        result: updatedGrade,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await salaryGradeQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Salary Grade deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteSubBreakups(req) {
    try {
      const subBreakups = await salaryGradeQuery.updateOne(
        { "breakups._id": req.params.id },
        { $pull: { breakups: { _id: req.params.id } } },
        { new: true }
      );
      if (!subBreakups)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Salary Grade not found",
          responseCode: "CLIENT_ERROR",
        });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Breakups is deleted successfully!!!",
        result: subBreakups,
      });
    } catch (error) {
      throw error;
    }
  }
};
