const assignmentService = require("@services/helper/assignment");

module.exports = class AssignmentController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };
    const files = req.files;
    try {
      const result = await assignmentService.create(params, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await assignmentService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await assignmentService.listPublic(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    let files = req.files;
    const _id = req.params.id;
    try {
      const result = await assignmentService.update(
        _id,
        bodyData,
        req.employee,
        files
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await assignmentService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await assignmentService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
