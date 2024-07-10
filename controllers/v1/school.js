const schoolService = require("@services/helper/school");

module.exports = class SchoolController {
  async create(req) {
    console.log(req.body.bodyData, "body");
    const body =
      typeof req.body.bodyData === "string"
        ? JSON.parse(req.body.bodyData)
        : req.body.bodyData;
    let files = req.files;
    try {
      const result = await schoolService.create(body, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const body =
      typeof req.body.bodyData === "string"
        ? JSON.parse(req.body.bodyData)
        : req.body.bodyData;
    let files = req.files;
    const id = req.params.id;
    try {
      const result = await schoolService.update(id, body, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleActiveStatus(req) {
    const _id = req.params.id;
    try {
      const result = await schoolService.toggleActiveStatus(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await schoolService.listPublic(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await schoolService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const id = req.params.id;
    try {
      const result = await schoolService.details(id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async addFiles(req) {
    try {
      const updatedSchool = await schoolService.addFiles(req);
      return updatedSchool;
    } catch (error) {
      return error;
    }
  }

  async removeFile(req) {
    try {
      const updatedSchool = await schoolService.removeFile(req);
      return updatedSchool;
    } catch (error) {
      return error;
    }
  }
};
