const splashNewsService = require("@services/helper/splashNews");

module.exports = class SplashNewsController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };
    const files = req.files;
    try {
      const result = await splashNewsService.create(params, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await splashNewsService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await splashNewsService.listPublic(req);
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
      const result = await splashNewsService.update(
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
      const result = await splashNewsService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleEnable(req) {
    const _id = req.params.id;
    try {
      const result = await splashNewsService.toggleEnable(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await splashNewsService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
