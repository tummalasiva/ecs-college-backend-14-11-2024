const academicYearService = require("@services/helper/academicYear");

module.exports = class AcademicYearController {
  async create(req) {
    const params = { ...req.body, schoolId: req.schoolId };
    try {
      const result = await academicYearService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await academicYearService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await academicYearService.listPublic(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    const _id = req.params.id;
    try {
      const result = await academicYearService.update(
        _id,
        bodyData,
        req.employee
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleActiveStatus(req) {
    const _id = req.params.id;
    try {
      const result = await academicYearService.toggleActiveStatus(
        _id,
        req.employee
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await academicYearService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await academicYearService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
