const coPsoMappingQuery = require("@db/coPsoMapping/queries");
const courseOutcomeQuery = require("@db/courseOutcome/queries");
const programSpecificOutcomeQuery = require("@db/pso/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const geminiModel = require("../../configs/geminiModel");

module.exports = class CoPoMappingService {
  static async create(req) {
    const { coId, psoId } = req.body;

    try {
      let coPsoMappingExists = await coPsoMappingQuery.findOne({ coId, psoId });
      if (coPsoMappingExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Co-Pso Mapping already exists!",
          responseCode: "CLIENT_ERROR",
        });
      const courseOutcome = await courseOutcomeQuery.findOne({ _id: coId });
      if (!courseOutcome)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course outcome not found!",
          responseCode: "CLIENT_ERROR",
        });

      const programOutcome = await programSpecificOutcomeQuery.findOne({
        _id: psoId,
      });
      if (!programOutcome)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Program specific outcome not found!",
          responseCode: "CLIENT_ERROR",
        });

      const prompt = `Given the following Course Outcome (CO) and Program Specific Outcome (PO), determine the level of contribution of the CO to the PO. The contribution level should be an integer on a scale from 1 to 3, where:

Low Contribution: The CO has a minimal impact or relevance to the PO. It addresses only a small aspect of the PO with limited depth or scope.

Moderate Contribution: The CO contributes to the PO in a meaningful way, addressing several aspects of the PO with moderate depth and scope.

High Contribution: The CO significantly impacts the PO, addressing most or all aspects of the PO with substantial depth and scope.

Course Outcome (CO): ${courseOutcome.description}.

Program Specific Outcome (PO): ${programOutcome.description}.

Output the contribution level as a single integer (1, 2, or 3) only, without any additional explanation.`;

      let contributionLevel = await geminiModel.generateContent([prompt]);
      console.log(contributionLevel, "contriution level");

      const newDoc = await coPsoMappingQuery.create({
        ...req.body,
        coId,
        psoId,
        contributionLevel: parseInt(contributionLevel.response.text()),
      });
      return common.successResponse({
        statusCode: httpStatusCode.created,
        message: "Co-Pso Mapping created successfully!",
        data: newDoc,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await coPsoMappingQuery.findAll(search);
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
      const { coId, psoId } = req.query;
      const coPsoMappingExists = await coPsoMappingQuery.findOne({
        _id: { $ne: req.params.id },
        coId,
        psoId,
      });
      if (coPsoMappingExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Co-Pso Mapping already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const updatedDoc = await coPsoMappingQuery.updateOne(
        { _id: req.params.id },
        req.body
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Co-Pso Mapping updated successfully!",
        data: updatedDoc,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await coPsoMappingQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Co-Pso Mapping deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
