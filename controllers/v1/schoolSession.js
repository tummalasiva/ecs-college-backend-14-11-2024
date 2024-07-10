const schoolSessionService = require("@services/helper/schoolSession");

module.exports = class SchoolSessionController {
  async create(req) {
    try {
      const result = await schoolSessionService.create(req.body);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await schoolSessionService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const _id = req.params.id;
    try {
      const result = await schoolSessionService.update(_id, req.body);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await schoolSessionService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await schoolSessionService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
