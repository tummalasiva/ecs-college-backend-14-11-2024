const studentActivityService = require("@services/helper/studentActivity");

module.exports = class StudentActivityController {
  async create(req) {
    const bodyData = {
      ...req.body,
      school: req.schoolId,
      addedBy: req.employee,
    };
    try {
      const result = await studentActivityService.create(bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await studentActivityService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = { ...req.body, school: req.schoolId };
    const _id = req.params.id;
    try {
      const result = await studentActivityService.update(
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
      const result = await studentActivityService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await studentActivityService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
