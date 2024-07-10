const teacherActivityService = require("@services/helper/teacherActivity");

module.exports = class TeacherActivityController {
  async create(req) {
    const params = {
      ...req.body,
      school: req.schoolId,
      createdBy: req.employee._id,
      fallbackCreatedBy: req.employee,
    };
    try {
      const result = await teacherActivityService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await teacherActivityService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const params = req.body;
    const _id = req.params.id;
    try {
      const result = await teacherActivityService.update(
        _id,
        params,
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
      const result = await teacherActivityService.delete(_id, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await teacherActivityService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async addFeedback(req) {
    try {
      const result = await teacherActivityService.addFeedback(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async addFeedback(req) {
    try {
      const result = await teacherActivityService.addFeedback(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteFeedback(req) {
    try {
      const result = await teacherActivityService.deleteFeedback(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getFeedbacks(req) {
    try {
      const result = await teacherActivityService.getFeedbacks(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
