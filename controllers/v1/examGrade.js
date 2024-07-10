const examGradeService = require("@services/helper/examGrade");

module.exports = class ExamGradeController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };

    try {
      const result = await examGradeService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await examGradeService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    const _id = req.params.id;
    try {
      const result = await examGradeService.update(_id, bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await examGradeService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await examGradeService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
