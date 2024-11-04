const announcementHelper = require("@services/helper/announcement");

module.exports = class AnnouncementController {
  async create(req) {
    try {
      const result = await announcementHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await announcementHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await announcementHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await announcementHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
