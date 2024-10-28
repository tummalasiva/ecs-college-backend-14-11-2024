const leaveAuthHelper = require("@services/helper/leaveAuth");

module.exports = class LeaveAuthController {
  async update(req) {
    try {
      const result = await leaveAuthHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    try {
      const result = await leaveAuthHelper.details(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
