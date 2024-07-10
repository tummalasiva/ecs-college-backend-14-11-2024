const firmQuery = require("@db/transport/firm/queries");
const vehicleQuery = require("@db/transport/vehicle/queries");
const tyreQuery = require("@db/transport/maintenance/tyre/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");
const { compileTemplate, getDateRange } = require("../../helper/helpers");
const puppeteer = require("puppeteer");

module.exports = class TyreService {
  static async create(req) {
    try {
      const { firm, vehicle } = req.body;

      const vehicleExists = await vehicleQuery.findOne({
        _id: vehicle,
      });
      if (!vehicleExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Vehicle not found!",
        });

      const firmExists = await firmQuery.findOne({
        _id: firm,
      });

      if (!firmExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Firm not found!",
        });

      let newTyreLog = await tyreQuery.create(req.body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Tyre service log added successfully!",
        result: newTyreLog,
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
      let tyreLogs = await tyreQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: tyreLogs,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { id } = req.params;
      const { firm, vehicle } = req.body;

      const vehicleExists = await vehicleQuery.findOne({
        _id: vehicle,
      });
      if (!vehicleExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Vehicle not found!",
        });

      const firmExists = await firmQuery.findOne({
        _id: firm,
      });

      if (!firmExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Firm not found!",
        });

      let tyreLog = await tyreQuery.updateOne(
        { _id: id },
        { $set: req.body },
        { new: true }
      );

      if (!tyreLog) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Tyre service log not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Tyre service log updated successfully!",
        result: tyreLog,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      await tyreQuery.delete({
        _id: id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Tyre log Log deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadPdf(req) {
    const { vehicle, firm, fromDate, toDate } = req.params;

    try {
      const { startOfDay, endOfDay } = getDateRange(fromDate, toDate);

      const tyreLogs = await tyreQuery.findAll({
        vehicle,
        firm,
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

      const content = await compileTemplate("tyreAndResole", {
        data: tyreLogs,
        vehicle: tyreLogs[0]?.vehicle,
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
