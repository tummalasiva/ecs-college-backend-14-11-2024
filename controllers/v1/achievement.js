const achievementHelper = require("@services/helper/achievement");

module.exports = class AchivementController {
  async create(req) {
    try {
      const result = await achievementHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await achievementHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await achievementHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await achievementHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleApproveStatus(req) {
    try {
      const result = await achievementHelper.toggleApproveStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
