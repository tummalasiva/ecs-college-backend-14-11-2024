const preadmissionEnquiryService = require("@services/helper/preadmission/enquiry");

module.exports = class PreadmissionEnquiryController {
  async create(req) {
    const bodyData = { ...req.body, school: req.schoolId };

    try {
      const result = await preadmissionEnquiryService.create(bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await preadmissionEnquiryService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateStatus(req) {
    try {
      const result = await preadmissionEnquiryService.updateStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await preadmissionEnquiryService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async validateEnquiryId(req) {
    try {
      const result = await preadmissionEnquiryService.validateEnquiryId(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async addExamSchedule(req) {
    try {
      const result = await preadmissionEnquiryService.addExamSchedule(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
