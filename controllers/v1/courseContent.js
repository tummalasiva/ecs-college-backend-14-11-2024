const courseContentService = require("@services/helper/courseContent");

module.exports = class CourseContentController {
  async create(req) {
    try {
      const result = await courseContentService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateChapterDetails(req) {
    try {
      const result = await courseContentService.updateChapterDetails(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteChapter(req) {
    try {
      const result = await courseContentService.deleteChapter(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteChapterMaterial(req) {
    try {
      const result = await courseContentService.deleteChapterMaterial(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async addContentToChapter(req) {
    try {
      const result = await courseContentService.addContentToChapter(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateContent(req) {
    try {
      const result = await courseContentService.updateContent(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteContent(req) {
    try {
      const result = await courseContentService.deleteContent(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async changeOrderSequence(req) {
    try {
      const result = await courseContentService.changeOrderSequence(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getDetailsStudentslist(req) {
    try {
      const result = await courseContentService.getDetailsStudentslist(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getDetailsTeachers(req) {
    try {
      const result = await courseContentService.getDetailsTeachers(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
