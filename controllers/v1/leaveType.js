const leaveTypeService = require("@services/helper/leaveType");

module.exports = class LeaveTypeController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };
    try {
      const result = await leaveTypeService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await leaveTypeService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = { ...req.body, school: req.schoolId };
    const _id = req.params.id;
    try {
      const result = await leaveTypeService.update(_id, bodyData, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await leaveTypeService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
