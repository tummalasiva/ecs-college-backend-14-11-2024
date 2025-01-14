const curriculumQuery = require("@db/curriculum/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class CurriculumService {
  static async update(req) {
    try {
      const { degreeCode, details } = req.body;
      if (!Array.isArray(details))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Details should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let curriculumWithDegreeExists = await curriculumQuery.findOne({
        degreeCode,
      });
      if (curriculumWithDegreeExists) {
        let updated = await curriculumQuery.updateOne(
          { degreeCode },
          { $addToSet: { details } }
        );
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Curriculum updated successfully!",
          result: updated,
        });
      } else {
        let newCurriculum = await curriculumQuery.create({
          degreeCode,
          details,
        });
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Curriculum updated successfully!",
          result: newCurriculum,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async deleteDetail(req) {
    try {
      let updated = await curriculumQuery.updateOne(
        { "details._id": req.params.id },
        { $pull: { details: { _id: req.params.id } } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Detail deleted successfully!",
        result: updated,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateDetail(req) {
    try {
      const { description, credits } = req.body;

      let updated = await curriculumQuery.updateOne(
        { "details._id": req.params.id },
        {
          $set: {
            "details.$.description": description,
            "details.$.credits": credits,
          },
        }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Detail updated successfully!",
        result: updated,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      let deleted = await curriculumQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Curriculum deleted successfully!",
        result: deleted,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      let { search = {} } = req.query;
      let curriculumList = await curriculumQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: curriculumList,
      });
    } catch (error) {
      throw error;
    }
  }
};
