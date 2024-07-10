const salaryGradeService = require("@services/helper/salaryGrade");

module.exports = class SalaryGradeController {
  async create(req) {
    try {
      const result = await salaryGradeService.create(req.body);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await salaryGradeService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await salaryGradeService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await salaryGradeService.delete(_id, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteSubBreakups(req) {
    try {
      const result = await salaryGradeService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
