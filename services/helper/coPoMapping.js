const coPoMappingQuery = require("@db/coPoMapping/queries");
const courseOutcomeQuery = require("@db/courseOutcome/queries");
const programOutcomeQuery = require("@db/programOutcome/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const geminiModel = require("../../configs/geminiModel");

module.exports = class CoPoMappingService {
  static async create(req) {
    const { coId, poId } = req.body;
    try {
      let coPoMappingExists = await coPoMappingQuery.findOne({ coId, poId });
      if (coPoMappingExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Co-Po Mapping already exists!",
          responseCode: "CLIENT_ERROR",
        });
      const courseOutcome = await courseOutcomeQuery.findOne({ _id: coId });
      if (!courseOutcome)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course outcome not found!",
          responseCode: "CLIENT_ERROR",
        });

      const programOutcome = await programOutcomeQuery.findOne({ _id: poId });
      if (!programOutcome)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Program outcome not found!",
          responseCode: "CLIENT_ERROR",
        });

      const prompt = `Given the following Course Outcome (CO) and Program Outcome (PO), determine the level of contribution of the CO to the PO. The contribution level should be an integer on a scale from 1 to 3, where:

Low Contribution: The CO has a minimal impact or relevance to the PO. It addresses only a small aspect of the PO with limited depth or scope.

Moderate Contribution: The CO contributes to the PO in a meaningful way, addressing several aspects of the PO with moderate depth and scope.

High Contribution: The CO significantly impacts the PO, addressing most or all aspects of the PO with substantial depth and scope.

Course Outcome (CO): ${courseOutcome.description}.

Program Outcome (PO): ${programOutcome.description}.

Output the contribution level as a single integer (1, 2, or 3) only, without any additional explanation.`;

      let contributionLevel = await geminiModel.generateContent([prompt]);
      console.log(contributionLevel, "contriution level");

      if (!contributionLevel)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Failed to generate contribution level",
          responseCode: "SERVER_ERROR",
        });

      if (contributionLevel.response.text().length > 1)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: contributionLevel.response.text(),
          responseCode: "CLIENT_ERROR",
        });

      const newDoc = await coPoMappingQuery.create({
        ...req.body,
        coId,
        poId,
        contributionLevel: parseInt(contributionLevel.response.text()),
      });
      return common.successResponse({
        statusCode: httpStatusCode.created,
        message: "CoPo Mapping created successfully!",
        data: newDoc,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await coPoMappingQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: list,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { coId, poId } = req.query;
      const coPoMappingExists = await coPoMappingQuery.findOne({
        _id: { $ne: req.params.id },
        coId,
        poId,
      });
      if (coPoMappingExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Co-Po Mapping already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const updatedDoc = await coPoMappingQuery.updateOne(
        { _id: req.params.id },
        req.body
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "CoPo Mapping updated successfully!",
        data: updatedDoc,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await coPoMappingQuery.deleteOne({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "CoPo Mapping deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
