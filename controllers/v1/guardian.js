const guardianHelper = require("@services/helper/guardian");

module.exports = class GuardianController {
  async list(req) {
    try {
      const guardians = await guardianHelper.list(req);
      return guardians;
    } catch (error) {
      return error;
    }
  }

  async toggleActiveStatus(req) {
    try {
      const updatedGuardian = await guardianHelper.toggleActiveStatus(req);
      return updatedGuardian;
    } catch (error) {
      return error;
    }
  }
};
