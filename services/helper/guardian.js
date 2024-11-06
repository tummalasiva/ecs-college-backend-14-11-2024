const guardianQuery = require("@db/guardian/queries");
const studentQuery = require("@db/student/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");

module.exports = class GuardianService {
  static async list(req) {
    try {
      const { academicYear, degreeCode, section } = req.query;

      const students = await studentQuery.findAll({
        academicYear,
        "academicInfo.degreeCode": degreeCode,
        "academicInfo.section": { $in: [section] },
      });

      let registrationNumbers = students.map(
        (s) => s.academicInfo.registrationNumber
      );
      const guardians = await guardianQuery.find({
        wardRegistrationNumber: { $in: registrationNumbers },
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: guardians,
      });
    } catch (error) {
      throw error;
    }
  }
};
