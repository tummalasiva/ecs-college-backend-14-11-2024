const galleryService = require("@services/helper/gallery");

module.exports = class GalleryController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };
    const files = req.files;
    try {
      const result = await galleryService.create(params, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async addFiles(req) {
    try {
      const updatedGallery = await galleryService.addFiles(req);
      return updatedGallery;
    } catch (error) {
      return error;
    }
  }

  async removeFile(req) {
    try {
      const updatedGallery = await galleryService.removeFile(req);
      return updatedGallery;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await galleryService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await galleryService.listPublic(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    const _id = req.params.id;
    const files = req.files;
    try {
      const result = await galleryService.update(
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
      const result = await galleryService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await galleryService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
