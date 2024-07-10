const preadmissionExamService = require("@services/helper/preadmission/exam");

module.exports = class PreadmissionExamController {
  async create(req) {
    const bodyData = { ...req.body, school: req.schoolId };

    try {
      const result = await preadmissionExamService.create(req, bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await preadmissionExamService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const id = req.params.id;
    const bodyData = req.body;
    try {
      const result = await preadmissionExamService.update(id, bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await preadmissionExamService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
