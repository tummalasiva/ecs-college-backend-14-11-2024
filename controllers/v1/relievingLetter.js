const relievingLetterService = require("@services/helper/relievingLetter");

module.exports = class RelievingLetterController {
  async create(req) {
    let body = req.body;
    let bodyData = {
      ...body,
      createdBy: req.employee._id,
      school: req.schoolId,
    };
    try {
      const result = await relievingLetterService.create(bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await relievingLetterService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    const _id = req.params.id;
    try {
      const result = await relievingLetterService.update(
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
      const result = await relievingLetterService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await relievingLetterService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
