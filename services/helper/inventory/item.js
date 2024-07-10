const itemQuery = require("@db/inventory/item/queries");
const departmentQuery = require("@db/department/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { notFoundError, compileTemplate } = require("../../../helper/helpers");
const schoolQuery = require("@db/school/queries");
const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");

module.exports = class ItemService {
  static async create(req) {
    try {
      const { name, department, brand, description, itemId } = req.body;

      const [departmentData, itemExists] = await Promise.all([
        departmentQuery.findOne({ _id: department }),
        itemQuery.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } }),
      ]);

      if (!departmentData) return notFoundError("Departments not found");
      if (itemExists)
        return common.failureResponse({
          message: "Item already exists",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newItem = await itemQuery.create({
        ...req.body,
        addedBy: req.employee._id,
        school: req.schoolId,
      });

      return common.successResponse({
        result: newItem,
        statusCode: httpStatusCode.ok,
        message: "New item added to inventory!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { name, department, brand, description, itemId } = req.body;

      const [departmentData, itemExistsWithName] = await Promise.all([
        departmentQuery.findOne({ _id: department }),
        itemQuery.findOne({
          _id: { $ne: req.params.id },
          name: { $regex: new RegExp(`^${name}$`, "i") },
        }),
      ]);

      if (!departmentData)
        return notFoundError("Department with given id was not found!");
      if (itemExistsWithName)
        return common.failureResponse({
          message: "Item already exists with this name!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let updatedItem = await itemQuery.updateOne(
        { _id: req.params.id },
        req.body,
        {
          new: true,
        }
      );

      return common.successResponse({
        result: updatedItem,
        message: "Item updated successfully!",
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
      let totalItems = await itemQuery.findAll({
        ...filter,
      });

      return common.successResponse({
        result: totalItems,
        statusCode: httpStatusCode.ok,
        message: "All items fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadPdf(req) {
    try {
      const [school, item] = await Promise.all([
        schoolQuery.findOne({
          _id: req.schoolId,
        }),
        itemQuery.findAll({
          school: req.schoolId,
        }),
      ]);

      if (!school) return notFoundError("School not found");
      if (!item.length) return notFoundError("No items found");

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
      const content = await compileTemplate("inventoryItem", {
        setting: school,
        data: item,
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
          "Content-Length": pdf.length,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadExcel(req) {
    try {
      const itemData = await itemQuery.findAll({
        school: req.schoolId,
      });

      const workBook = new ExcelJS.Workbook();

      const sheet = workBook.addWorksheet(`Inventory_Items`);

      const header = ["S.No.", "Item Id", "Item Name", "Department", "Brand"];

      sheet.addRow(header);

      for (let item of itemData) {
        let newRow = [
          itemData.indexOf(item) + 1,
          item.itemId,
          item.name,
          item.department?.name,
          item.brand,
        ];

        sheet.addRow(newRow);
      }

      // Iterate through each row and cell to apply alignment styling
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          // Apply horizontal and vertical alignment to center the content
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });
      });
      // Get the first row
      const firstRow = sheet.getRow(1);

      // Iterate through each cell in the first row and apply bold styling
      firstRow.eachCell((cell) => {
        cell.font = { bold: true };
      });

      sheet.columns.forEach((column, columnIndex) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 0
          );
        });
        column.width = maxLength + 2; // Add some extra width for padding
      });

      let data = workBook.xlsx.writeBuffer();

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: data,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Length": data.length,
        },
      });
    } catch (error) {
      throw error;
    }
  }
};
