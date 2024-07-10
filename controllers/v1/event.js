const eventService = require("@services/helper/event");

module.exports = class NewsController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };
    const files = req.files;
    try {
      const result = await eventService.create(params, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await eventService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await eventService.listPublic(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    let files = req.files;
    const _id = req.params.id;
    try {
      const result = await eventService.update(
        _id,
        bodyData,
        req.employee,
        files
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await eventService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await eventService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
