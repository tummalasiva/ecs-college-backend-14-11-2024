const feeMapQuery = require("@db/fee/feeMap/queries");
const feeMapCategoryQuery = require("@db/fee/feeMapCategory/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const FeeMapCategory = require("../../../db/fee/feeMapCategory/model");

module.exports = class FeeMapCategoryService {
  static async create(req) {
    try {
      const { name, description, amount, feeMapId } = req.body;
      let feeMapWithTheGivenId = await feeMapQuery.findOne({
        _id: feeMapId,
      });
      if (!feeMapWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Fee map not found!",
          responseCode: "CLIENT_ERROR",
        });

      let feeMapCategoryWithTheGivenNameExistsForThisFeeMap =
        await feeMapCategoryQuery.findOne({
          name: { $regex: new RegExp(`^${name}$`, "i") },
          school: req.schoolId,
          feeMap: feeMapId,
        });
      if (feeMapCategoryWithTheGivenNameExistsForThisFeeMap)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Fee map category with this name for the given fee map already exists!",
          responseCode: "CLIENT_ERROR",
        });

      let allFeeMapCategories = await feeMapCategoryQuery.findAll({
        feeMap: feeMapId,
        school: req.schoolId,
      });
      if (allFeeMapCategories.length) {
        let totalFeeMapAmount = feeMapWithTheGivenId.fee;
        let previousTotalFeeMapCategoryAmount = allFeeMapCategories.reduce(
          (total, value) => total + value.amount,
          0
        );

        if (previousTotalFeeMapCategoryAmount + amount > totalFeeMapAmount)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message:
              "Total fee map category amount cannot be more than fee map fee!",
            responseCode: "CLIENT_ERROR",
          });
      }

      let newFeeMapCategory = await feeMapCategoryQuery.create({
        priority: allFeeMapCategories.length + 1,
        name,
        amount,
        feeMap: feeMapId,
        description,
        school: req.schoolId,
      });

      return common.successResponse({
        result: newFeeMapCategory,
        statusCode: httpStatusCode.ok,
        message: "Fee Map Category created successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async createMultiple(req) {
    try {
      const { categories, feeMapId } = req.body;

      if (!Array.isArray(categories)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Categories should be an array!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const feeMapWithTheGivenId = await feeMapQuery.findOne({ _id: feeMapId });
      if (!feeMapWithTheGivenId) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Fee map not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const categoryNames = categories.map((category) => category.name);
      const existingCategories = await feeMapCategoryQuery.findAll({
        name: {
          $in: categoryNames.map((name) => new RegExp(`^${name}$`, "i")),
        },
        school: req.schoolId,
        feeMap: feeMapId,
      });

      if (existingCategories.length > 0) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Fee map category with this name for the given fee map already exists!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const totalAmount = categories.reduce(
        (sum, current) => sum + parseFloat(current.amount),
        0
      );

      const allFeeMapCategories = await feeMapCategoryQuery.findAll({
        feeMap: feeMapId,
        school: req.schoolId,
      });

      if (allFeeMapCategories.length) {
        const totalFeeMapAmount = parseFloat(feeMapWithTheGivenId.fee);
        const previousTotalFeeMapCategoryAmount = allFeeMapCategories.reduce(
          (total, value) => total + parseFloat(value.amount),
          0
        );

        if (
          previousTotalFeeMapCategoryAmount + totalAmount >
          totalFeeMapAmount
        ) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message:
              "Total fee map category amount cannot be more than fee map fee!",
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      await FeeMapCategory.insertMany(
        categories.map((category) => ({
          ...category,
          feeMap: feeMapId,
          school: req.schoolId,
          priority:
            allFeeMapCategories.length + categories.indexOf(category) + 1,
        }))
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fee Map Category created successfully!",
      });
    } catch (error) {
      return common.failureResponse({
        statusCode: httpStatusCode.internal_server_error,
        message: error.message,
        responseCode: "SERVER_ERROR",
      });
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      if (req.schoolId) {
        search["school"] = req.schoolId;
      }
      let feeMapscategories = await feeMapCategoryQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: feeMapscategories,
        message: "Fee Map categories fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { name, amount, description } = req.body;
      let feeMapCategoryId = req.params.id;

      let feeMapcategoryWithTheGivenId = await feeMapCategoryQuery.findOne({
        _id: feeMapCategoryId,
      });

      if (!feeMapcategoryWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Fee map category not found!",
          responseCode: "CLIENT_ERROR",
        });

      let allFeeMapCategories = await feeMapCategoryQuery.findAll({
        feeMap: feeMapcategoryWithTheGivenId.feeMap,
        _id: { $nin: [feeMapCategoryId] },
      });
      let totalAmount = allFeeMapCategories.reduce(
        (total, value) => total + value.amount,
        0
      );
      if (totalAmount + amount > feeMapcategoryWithTheGivenId.feeMap.fee)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Total fee map category amount cannot be more than fee map fee!",
          responseCode: "CLIENT_ERROR",
        });

      let feeMapCategoryWithTheGivenName = await feeMapCategoryQuery.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        feeMap: feeMapcategoryWithTheGivenId.feeMap._id,
      });

      if (
        feeMapCategoryWithTheGivenName &&
        feeMapcategoryWithTheGivenId._id.toHexString() !==
          feeMapCategoryWithTheGivenName._id.toHexString()
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Fee map category with this name for the given fee map already exists!",
          responseCode: "CLIENT_ERROR",
        });

      let updateFeeMapCategory = await feeMapCategoryQuery.updateOne(
        { _id: feeMapCategoryId },
        {
          $set: {
            description,
            name: name.trim(),
            amount,
          },
        },
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fee map category updated successfully",
        result: updateFeeMapCategory,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      let feeMapcategory = await feeMapCategoryQuery.delete({
        _id: req.params.id,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fee Map category deleted successfully!",
        result: feeMapcategory,
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteMultiple(req) {
    const { feeMapCategoryIds } = req.body;

    for (let id of feeMapCategoryIds) {
      if (!mongoose.Types.ObjectId.isValid(id))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide valid fee map category id!",
          responseCode: "CLIENT_ERROR",
        });
    }

    try {
      await feeMapCategoryQuery.deleteMany({ _id: { $in: feeMapCategoryIds } });
      return common.successResponse({
        message: "Deleted successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updatePriority(req) {
    const { type } = req.body;
    const { id } = req.params;

    try {
      let feeMapCategoryToUpdate = await feeMapCategoryQuery.findOne({
        _id: id,
      });
      if (!feeMapCategoryToUpdate)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Fee Category to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let feeMapId = feeMapCategoryToUpdate.feeMap;

      let allFeeCategories = await FeeMapCategory.find({
        feeMap: feeMapId,
      });

      if (type == "up" && feeMapCategoryToUpdate.priority - 1 <= 0)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Priority of given fee map category cannot be modified!",
          responseCode: "CLIENT_ERROR",
        });

      if (
        type == "down" &&
        feeMapCategoryToUpdate.priority + 1 > allFeeCategories.length
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Priority of given fee map category cannot be modified!",
          responseCode: "CLIENT_ERROR",
        });

      if (type == "up") {
        let feeCategoryToReducePriority = await feeMapCategoryQuery.updateOne(
          {
            feeMap: feeMapId,
            priority: feeMapCategoryToUpdate.priority - 1,
          },
          { $set: { priority: feeMapCategoryToUpdate.priority } }
        );
        feeMapCategoryToUpdate = await feeMapCategoryQuery.updateOne(
          { _id: feeMapCategoryToUpdate._id },
          { $set: { priority: feeMapCategoryToUpdate.priority - 1 } }
        );
      } else {
        let feMapCategoryToIncreasePriority =
          await feeMapCategoryQuery.updateOne(
            {
              feeMap: feeMapId,
              priority: feeMapCategoryToUpdate.priority + 1,
            },
            { $set: { priority: feeMapCategoryToUpdate.priority } }
          );
        feeMapCategoryToUpdate = await feeMapCategoryQuery.updateOne(
          { _id: feeMapCategoryToUpdate._id },
          { $set: { priority: feeMapCategoryToUpdate.priority + 1 } }
        );
      }

      return common.successResponse({
        message: "Priority updated",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }
};
