const departmentService = require("@services/helper/department");

module.exports = class DepartmentController {
  async create(req) {
    const params = req.body;
    try {
      const result = await departmentService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await departmentService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    const _id = req.params.id;
    try {
      const result = await departmentService.update(
        _id,
        bodyData,
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
      const result = await departmentService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await departmentService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
