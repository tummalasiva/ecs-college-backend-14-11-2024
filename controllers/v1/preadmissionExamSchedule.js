const preadmissionExamScheduleService = require("@services/helper/preadmission/examSchedule");

module.exports = class PreadmissionExamScheduleController {
  async create(req) {
    const bodyData = { ...req.body, school: req.schoolId };

    try {
      const result = await preadmissionExamScheduleService.create(bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await preadmissionExamScheduleService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const id = req.params.id;
    const bodyData = req.body;
    try {
      const result = await preadmissionExamScheduleService.update(id, bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await preadmissionExamScheduleService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getVenueDetails(req) {
    try {
      const result = await preadmissionExamScheduleService.getVenueDetails(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async sendVenueDetailsToStudents(req) {
    try {
      const result =
        await preadmissionExamScheduleService.sendVenueDetailsToStudents(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async enableExamLink(req) {
    try {
      const result = await preadmissionExamScheduleService.enableExamLink(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async getExamDetails(req) {
    try {
      const result = await preadmissionExamScheduleService.getExamDetails(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async submitResult(req) {
    try {
      const result = await preadmissionExamScheduleService.submitResult(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
