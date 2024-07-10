const fileUploadService = require("@services/helper/fileUpload");

module.exports = class FileUploadController {
  async create(req) {
    try {
      const result = await fileUploadService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await fileUploadService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async showDocuments(req) {
    const _id = req.params.id;
    try {
      const result = await fileUploadService.showDocuments(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    // const params = req.body
    const _id = req.params.id;
    try {
      const result = await fileUploadService.update(_id, req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await fileUploadService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
