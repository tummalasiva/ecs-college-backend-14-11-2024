const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const storageQuery = require("@db/storage/queries");
const { convertBytesToHumanReadableSize } = require("../../helper/helpers");

module.exports = class StorageService {
  static async getDetails() {
    try {
      const storage = await storageQuery.findOne({});
      let modifiedData = {
        ...storage,
        totalStorage: convertBytesToHumanReadableSize(storage.totalStorage),
        usedStorage: convertBytesToHumanReadableSize(storage.usedStorage),
      };
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Storage details fetched successfully!",
        result: modifiedData,
      });
    } catch (error) {
      throw error;
    }
  }
};
