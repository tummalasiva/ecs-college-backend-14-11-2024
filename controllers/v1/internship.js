const internshipHelper = require("@services/helper/internship");

module.exports = class InternshipController {
  async create(req) {
    try {
      const result = await internshipHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const internships = await internshipHelper.list(req);
      return internships;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const internship = await internshipHelper.update(req);
      return internship;
    } catch (error) {
      return error;
    }
  }

  async approve(req) {
    try {
      const internship = await internshipHelper.approve(req);
      return internship;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const updatedInternship = await internshipHelper.delete(req);
      return updatedInternship;
    } catch (error) {
      return error;
    }
  }
};
