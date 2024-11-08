const curriculumHelper = require("@services/helper/curriculum");

module.exports = class CurriculumController {
  async update(req) {
    try {
      const updatedCurriculum = await curriculumHelper.update(req);
      return updatedCurriculum;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const deletedCurriculum = await curriculumHelper.delete(req);
      return deletedCurriculum;
    } catch (error) {
      return error;
    }
  }

  async deleteDetail(req) {
    try {
      const deletedCurriculum = await curriculumHelper.deleteDetail(req);
      return deletedCurriculum;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const curriculumById = await curriculumHelper.list(req);
      return curriculumById;
    } catch (error) {
      return error;
    }
  }
};
