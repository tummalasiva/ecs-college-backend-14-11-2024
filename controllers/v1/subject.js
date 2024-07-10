const subjectService = require("@services/helper/subject");

module.exports = class SubjectController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };
    try {
      const result = await subjectService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await subjectService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const params = req.body;
    const _id = req.params.id;
    try {
      const result = await subjectService.update(_id, params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await subjectService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await subjectService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
