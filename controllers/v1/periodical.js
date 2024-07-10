const periodicalService = require("@services/helper/library/periodical");

module.exports = class PeriodicalController {
  async create(req) {
    const bodyData = { ...req.body, school: req.schoolId };
    const files = req.files;
    try {
      const result = await periodicalService.create(bodyData, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await periodicalService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const id = req.params.id;
    const bodyData = req.body;
    const files = req.files;
    try {
      const result = await periodicalService.update(id, bodyData, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await periodicalService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
