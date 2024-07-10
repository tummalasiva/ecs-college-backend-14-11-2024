const courseService = require("@services/helper/course");

module.exports = class CourseController {
  async create(req) {
    try {
      const result = await courseService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await courseService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await courseService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await courseService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    try {
      const result = await courseService.details(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async uploadCourseMaterial(req) {
    try {
      const result = await courseService.uploadCourseMaterial(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async deleteCourseMaterial(req) {
    try {
      const result = await courseService.deleteCourseMaterial(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
