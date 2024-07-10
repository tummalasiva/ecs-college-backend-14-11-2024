const meetingService = require("@services/helper/meeting");

module.exports = class MeetingController {
  async create(req) {
    try {
      const result = await meetingService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await meetingService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listStudent(req) {
    try {
      const result = await meetingService.listStudent(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await meetingService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await meetingService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async join(req) {
    try {
      const result = await meetingService.join(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async joinStudent(req) {
    try {
      const result = await meetingService.joinStudent(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
