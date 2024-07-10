const vendorQuery = require("@db/inventory/vendor/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../../helper/helpers");

module.exports = class VendorService {
  static async create(req) {
    const { basicInfo, addressInfo, bankInfo, schoolId } = JSON.parse(
      req.body.body
    );
    const school = schoolId;
    console.log(req.body, "body");
    try {
      let vendorExistsWithThisName = await vendorQuery.findOne({
        "basicInfo.name": {
          $regex: new RegExp(`^${basicInfo.name.trim()}`, "i"),
        },
        school,
      });
      if (vendorExistsWithThisName)
        return common.failureResponse({
          message: "Vendor with this name already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let photo = "";
      if (req.files && req.files.photo) {
        photo = await uploadFileToS3(req.files.photo);
      }

      let newVendor = await vendorQuery.create({
        ...JSON.parse(req.body.body),
        photo,
        addedBy: req.employee._id,
        school,
      });

      return common.successResponse({
        message: "Vendor added successfully!",
        result: newVendor,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    const { basicInfo, addressInfo, bankInfo, schoolId } = JSON.parse(
      req.body.body
    );

    try {
      let vendorToUpdate = await vendorQuery.findOne({
        _id: req.params.id,
        school: schoolId,
      });
      if (!vendorToUpdate)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Vendor not found!",
          responseCode: "CLIENT_ERROR",
        });

      let vendorWithGivenName = await vendorQuery.findOne({
        _id: { $ne: request.params.id },
        "basicInfo.name": {
          $regex: new RegExp(`^${basicInfo.name.trim()}`, "i"),
        },
        school: req.schoolId,
      });

      if (vendorWithGivenName)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Vendor with this name already exists!",
          responseCode: "CLIENT_ERROR",
        });

      let photo = vendorToUpdate.photo;
      if (req.files && req.files.photo) {
        if (photo) {
          await deleteFile(photo);
        }
        photo = await uploadFileToS3(req.files.photo);
      }

      req.body.photo = photo;

      let updatedVendor = await vendorQuery.updateOne(
        { _id: req.params.id },
        JSON.parse(req.body.body),
        { new: true }
      );

      return common.successResponse({
        message: "Vendor updated successfully!",
        result: updatedVendor,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const filter = { ...search };

      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }

      const vendors = await vendorQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Vendors are fetched successfully!",
        result: vendors,
      });
    } catch (error) {
      throw error;
    }
  }
};
