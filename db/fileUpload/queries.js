// const ObjectId = require('mongoose').Types.ObjectId
const fileUploadModel = require("./model");

module.exports = class SchoolClass {
  static async findOne(filter, projection = {}) {
    try {
      const fileUploadData = await fileUploadModel
        .findOne(filter, projection)
        .lean({
          getters: true,
        });
      return fileUploadData;
    } catch (error) {
      return error;
    }
  }

  static async findAllFile(filter, projection = {}) {
    try {
      const fileUploadData = await fileUploadModel
        .find(filter, projection)
        .lean({
          getters: true,
        });
      return fileUploadData;
    } catch (error) {
      return error;
    }
  }

  static async create(data) {
    try {
      const fileUploadData = await fileUploadModel(data).save();

      return fileUploadData;
    } catch (error) {
      return error;
    }
  }
  static async findByIdAndUpdateFile(filter, update = {}, options = {}) {
    try {
      const fileUpload = await fileUploadModel
        .findByIdAndUpdate(filter, update, options)
        .lean({
          getters: true,
        });
      return fileUpload;
    } catch (error) {
      return error;
    }
  }

  static async updateOneFile(filter, update, options = {}) {
    try {
      const res = await fileUploadModel.updateOne(filter, update, options);
      if (
        (res.n === 1 && res.nModified === 1) ||
        (res.matchedCount === 1 && res.modifiedCount === 1)
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return error;
    }
  }

  static async listFile(page, limit, search) {
    try {
      let data = await fileUploadModel
        .aggregate([
          {
            $match: {
              $or: [{ contentType: new RegExp(search, "i") }],
            },
          },
          {
            $project: {
              contentType: 1,
              link: 1,
            },
          },
          {
            $sort: { contentType: 1 },
          },
          {
            $facet: {
              totalCount: [{ $count: "count" }],
              data: [{ $skip: limit * (page - 1) }, { $limit: limit }],
            },
          },
          {
            $project: {
              data: 1,
              count: {
                $arrayElemAt: ["$totalCount.count", 0],
              },
            },
          },
        ])
        .collation({ locale: "en", caseLevel: false });

      return data;
    } catch (error) {
      return error;
    }
  }

  static async findByIdFile(filter, projection = {}) {
    try {
      const fileData = await fileUploadModel.findById(filter, projection).lean({
        getters: true,
      });
      return fileData;
    } catch (error) {
      return error;
    }
  }

  static async deleteMulti(filter, projection = {}) {
    try {
      const fileData = await fileUploadModel.findById(filter, projection).lean({
        getters: true,
      });
      return fileData;
    } catch (error) {
      return error;
    }
  }
  static async findByIdAndDeleteFile(filter, projection = {}) {
    try {
      const file = await fileUploadModel
        .findByIdAndDelete(filter, projection)
        .lean({
          getters: true,
        });
      return file;
    } catch (error) {
      return error;
    }
  }
};
