const offeredSubjectHelper = require("@services/helper/offeredSubject");

module.exports = class OfferedSubjectController {
  async create(req) {
    try {
      const createdOfferedSubject = await offeredSubjectHelper.create(req);
      return createdOfferedSubject;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const offeredSubjects = await offeredSubjectHelper.list(req);
      return offeredSubjects;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const offeredSubject = await offeredSubjectHelper.update(req);
      return offeredSubject;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await offeredSubjectHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async publishOfferedSubject(req) {
    try {
      const result = await offeredSubjectHelper.publishOfferedSubject(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getOfferedSubjects(req) {
    try {
      const result = await offeredSubjectHelper.getOfferedSubjects(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async registerSubject(req) {
    try {
      const result = await offeredSubjectHelper.registerSubject(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
