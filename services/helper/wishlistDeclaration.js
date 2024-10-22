const wishlistDeclarationQuery = require("@db/wishlistDeclaration/queries");
const semesterQuery = require("@db/semester/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class WishlistDeclarationHelper {
  static async create(req) {
    try {
      const { semester, maximumCreditsAllowed, subjectCategories } = req.body;

      if (!Array.isArray(subjectCategories))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject categories should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let semesterExists = await semesterQuery.findOne({ _id: semester });
      if (!semesterExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      const wishlistDeclaration = await wishlistDeclarationQuery.create({
        ...req.body,
        createdBy: req.employee,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Wishlist declaration created successfully!",
        result: wishlistDeclaration,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const wishlistDeclarations = await wishlistDeclarationQuery.findAll(
        search
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: wishlistDeclarations,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(req) {
    try {
      const { id } = req.params;
      const wishlistDeclaration = await wishlistDeclarationQuery.findOne({
        _id: id,
      });

      if (!wishlistDeclaration)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Wishlist declaration not found!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: wishlistDeclaration,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { id } = req.params;
      const { semester, maximumCreditsAllowed, subjectCategories } = req.body;

      if (!Array.isArray(subjectCategories))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject categories should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let semesterExists = await semesterQuery.findOne({ _id: semester });
      if (!semesterExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      const wishlistDeclaration = await wishlistDeclarationQuery.updateOne(
        id,
        {
          ...req.body,
        },
        { new: true }
      );

      if (!wishlistDeclaration)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Wishlist declaration not found!",
          responseCode: "CLIENT_ERROR",
        });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Wishlist declaration updated successfully!",
        result: wishlistDeclaration,
      });
    } catch (error) {
      throw error;
    }
  }
};
