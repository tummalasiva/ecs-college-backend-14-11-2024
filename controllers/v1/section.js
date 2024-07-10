const sectionService = require("@services/helper/section");

module.exports = class SectionController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };
    try {
      const result = await sectionService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await sectionService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await sectionService.listPublic(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = { ...req.body, school: req.schoolId };
    const _id = req.params.id;
    try {
      const result = await sectionService.update(_id, bodyData, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await sectionService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await sectionService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
