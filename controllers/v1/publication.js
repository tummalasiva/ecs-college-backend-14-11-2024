const publicationHelper = require("@services/helper/publication");

module.exports = class AchivementController {
  async create(req) {
    try {
      const result = await publicationHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await publicationHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await publicationHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  //

  async list(req) {
    try {
      const result = await publicationHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleApproveStatus(req) {
    try {
      const result = await publicationHelper.toggleApproveStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
