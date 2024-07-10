const offerLetterService = require("@services/helper/offerLetter");

module.exports = class OfferLetterController {
  async create(req) {
    let body = req.body;
    let bodyData = {
      ...body,
      createdBy: req.employee._id,
      school: req.schoolId,
    };
    try {
      const result = await offerLetterService.create(bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await offerLetterService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    const _id = req.params.id;
    try {
      const result = await offerLetterService.update(
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
      const result = await offerLetterService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await offerLetterService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
