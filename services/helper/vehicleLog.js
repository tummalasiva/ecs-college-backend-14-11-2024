const vehicleLogQuery = require("@db/transport/vehicleLog/queries");
const routeQuery = require("@db/transport/route/queries");
const vehicleQuery = require("@db/transport/vehicle/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");
const {
  uploadFileToS3,
  compileTemplate,
  getDateRange,
} = require("../../helper/helpers");
const puppeteer = require("puppeteer");
const path = require("path");

module.exports = class VehicleLogService {
  static async create(req) {
    try {
      const { route, vehicle, date, departureTime, readingAtDeparture } =
        req.body;

      const vehicleExists = await vehicleQuery.findOne({
        _id: vehicle,
      });
      if (!vehicleExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Vehicle not found!",
        });

      const routeExists = await routeQuery.findOne({
        _id: route,
        vehicle: vehicle,
      });

      if (!routeExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Route not found!",
        });

      let data = {};

      data["vehicle"] = vehicle;
      data["route"] = route;
      data["date"] = new Date(date);
      data["departureTime"] = departureTime;
      data["readingAtDeparture"] = {
        reading: readingAtDeparture,
      };

      if (req.files) {
        if (req.files.departureImage) {
          let file = await uploadFileToS3(req.files.departureImage);
          if (file) {
            data["readingAtDeparture"]["image"] = file;
          }
        }
      }

      data["createdBy"] = req.employee._id;

      let newLog = await vehicleLogQuery.create(data);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Vehicle log added successfully!",
        result: newLog,
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
      let vehicleLogs = await vehicleLogQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: vehicleLogs,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { id } = req.params;
      const { arrivalTime, readingAtArrival, spareUse } = req.body;

      let updatedSpareUse = JSON.parse(spareUse);

      let log = await vehicleLogQuery.findOne({ _id: id });

      let data = {};
      data["arrivalTime"] = arrivalTime;
      data["spareUse"] = updatedSpareUse;
      data["tripCompleted"] = true;
      data["readingAtArrival"] = {
        reading: readingAtArrival,
      };
      data["totalDistanceTravelled"] =
        Number(readingAtArrival) - Number(log.readingAtDeparture.reading);

      if (req.files) {
        if (req.files.arrivalImage) {
          let file = await uploadFileToS3(req.files.arrivalImage);

          if (file) {
            data["readingAtArrival"]["image"] = file;
          }
        }
      }

      let updatedLog = await vehicleLogQuery.updateOne(
        { _id: id },
        { $set: data },
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Vehicle log updated successfully!",
        result: updatedLog,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      await vehicleLogQuery.delete({
        _id: id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Log deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadPdf(req) {
    const { route, vehicle, fromDate, toDate } = req.params;

    try {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);

      endDate.setDate(endDate.getDate() + 1);
      startDate.setDate(startDate.getDate() - 1);

      const vehiclelogs = await vehicleLogQuery.findAll({
        vehicle,
        route,
        createdAt: { $gte: startDate, $lt: endDate },
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

      const content = await compileTemplate("vehiclelog", {
        data: vehiclelogs,
        vehicle: vehicle,
        setting,
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
        },
      });

      //   res.set({
      //     "Content-Type": "application/pdf",
      //     "Content-Disposition": "attachment; filename=issue_return.pdf",
      //     "Content-Length": pdf.length,
      //   });
      //   res.send(pdf);
    } catch (error) {
      throw error;
    }
  }
};
