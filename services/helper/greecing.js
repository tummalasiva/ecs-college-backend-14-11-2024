const vehicleQuery = require("@db/transport/vehicle/queries");
const greecingQuery = require("@db/transport/maintenance/greecing/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");
const { compileTemplate, getDateRange } = require("../../helper/helpers");
const puppeteer = require("puppeteer");

module.exports = class GreecingService {
  static async create(req) {
    try {
      const { vehicle } = req.body;

      const vehicleExists = await vehicleQuery.findOne({
        _id: vehicle,
      });
      if (!vehicleExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Vehicle not found!",
        });

      let newGreecing = await greecingQuery.create(req.body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Greecing information added successfully!",
        result: newGreecing,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    let filter = { ...search };
    if (filter.fromDate && filter.toDate) {
      const { startOfDay, endOfDay } = getDateRange(
        filter.fromDate,
        filter.toDate
      );

      filter["date"] = { $gt: startOfDay, $lte: endOfDay };

      delete filter.fromDate;
      delete filter.toDate;
    }
    try {
      let greecingLogs = await greecingQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: greecingLogs,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { id } = req.params;
      const { vehicle } = req.body;

      const vehicleExists = await vehicleQuery.findOne({
        _id: vehicle,
      });
      if (!vehicleExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Vehicle not found!",
        });

      let greecingLog = await greecingQuery.updateOne(
        { _id: id },
        { $set: req.body },
        { new: true }
      );

      if (!greecingLog) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Greecing log not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Greecing log updated successfully!",
        result: greecingLog,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      await greecingQuery.delete({
        _id: id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Greecing Log deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadPdf(req) {
    const { vehicle, fromDate, toDate } = req.params;

    try {
      const { startOfDay, endOfDay } = getDateRange(fromDate, toDate);

      const greecings = await greecingQuery.findAll({
        vehicle,
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      });

      const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ["--disable-extensions"],
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--hide-scrollbars",
          "--disable-gpu",
          "--mute-audio",
        ],
      });
      const page = await browser.newPage();

      const content = await compileTemplate("greecing", {
        data: greecings,
        vehicle: greecings[0]?.vehicle,
      });

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
        margin: {
          top: 20,
          left: 5,
          right: 5,
        },
      });
      browser.close();

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: pdf,
        meta: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=repair_logs.pdf",
          "Content-Length": pdf.length,
        },
      });
    } catch (error) {
      throw error;
    }
  }
};
