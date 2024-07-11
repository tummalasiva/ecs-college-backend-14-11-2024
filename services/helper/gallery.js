const galleryQuery = require("@db/gallery/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class GalleryService {
  static async create(body, files) {
    try {
      let images = [];
      if (files) {
        if (Array.isArray(files.file)) {
          for (let file of files.file) {
            let link = await uploadFileToS3(file);
            if (link) {
              images.push(link);
            }
          }
        } else {
          let link = await uploadFileToS3(files.file);
          if (link) {
            images.push(link);
          }
        }
      }

      body.images = images;
      let gallery = await galleryQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Gallery added successfully",
        result: gallery,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      let galleryList = await galleryQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: galleryList,
        message: "Galleries fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async listPublic(req) {
    try {
      const { search = {}, schoolId } = req.query;
      let filter = { ...search };
      if (schoolId) {
        filter["school"] = schoolId;
      }
      filter["isPublic"] = true;
      let galleryList = await galleryQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: galleryList,
        message: "Galleries fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async addFiles(req) {
    try {
      const id = req.params.id;
      let files = req.files;

      let galleryWithGivenId = await galleryQuery.findOne({
        _id: id,
      });
      if (!galleryWithGivenId)
        return common.failureResponse({
          message: "Gallery not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let itemFiles = [...galleryWithGivenId.images];

      if (files) {
        if (Array.isArray(files.file)) {
          for (let file of files.file) {
            let fileLink = await uploadFileToS3(file);
            itemFiles.push(fileLink);
          }
        } else {
          let fileLink = await uploadFileToS3(files.file);
          itemFiles.push(fileLink);
        }
      }
      let updatedGallery = await galleryQuery.updateOne(
        { _id: id },
        { $set: { images: itemFiles } },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.accepted,
        message: "Files added successfully",
        result: updatedGallery,
      });
    } catch (error) {
      throw error;
    }
  }

  static async removeFile(req) {
    try {
      const id = req.params.id;
      const { file } = req.body;

      let galleryWithGivenId = await galleryQuery.findOne({
        _id: id,
      });
      if (!galleryWithGivenId)
        return common.failureResponse({
          message: "Gallery not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let fileWithGivenId = galleryWithGivenId.images.find((f) => f === file);
      if (!fileWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "File not found!",
          responseCode: "CLIENT_ERROR",
        });

      await deleteFile(file);

      let itemFiles = [...galleryWithGivenId.images.filter((i) => i !== file)];

      let updatedGallery = await galleryQuery.updateOne(
        { _id: id },
        { $set: { images: itemFiles } },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.accepted,
        message: "File removed successfully",
        result: updatedGallery,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId, files) {
    try {
      let galleryWithGivenId = await galleryQuery.findOne({ _id: id });
      if (!galleryWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Gallery not found!",
          responseCode: "CLIENT_ERROR",
        });
      let images = [...galleryWithGivenId.images];
      if (files) {
        if (Array.isArray(files.file)) {
          for (let file of files.file) {
            let link = await uploadFileToS3(file);
            if (link) {
              images.push(link);
            }
          }
        } else {
          let link = await uploadFileToS3(files.file);
          if (link) {
            images.push(link);
          }
        }
      }

      body.images = images;
      let gallery = await galleryQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (gallery) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Gallery updated successfully!",
          result: gallery,
        });
      } else {
        return common.failureResponse({
          message: "Gallery not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let gallery = await galleryQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Gallery deleted successfully!",
        result: gallery,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let gallery = await galleryQuery.findOne({ _id: id });

      if (gallery) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Gallery fetched successfully!",
          result: gallery,
        });
      } else {
        return common.failureResponse({
          message: "Gallery not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
