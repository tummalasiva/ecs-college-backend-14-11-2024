const newsService = require("@services/helper/news");

module.exports = class NewsController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };
    const files = req.files;
    try {
      const result = await newsService.create(params, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await newsService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await newsService.listPublic(req);
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
      const result = await newsService.update(
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
      const result = await newsService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await newsService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
