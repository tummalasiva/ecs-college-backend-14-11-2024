const buildingQueries = require("@db/building/queries");
const common = require("@constants/common");
const httpStatusCode = require("@generics/http-status");
const ExcelJS = require("exceljs");
const path = require("path");
const Building = require("@db/building/model");

function convertHeaderToMongoKeyBulkAdd(header) {
  const mappings = {
    Name: "name",
    "Building Type": "buildingType",
    "Number Of Floors": "numberOfFloors",
    Latitude: "location.latitude",
    Logitude: "location.longitude",
  };

  return mappings[header] || header;
}

module.exports = class BuildingService {
  static async create(req) {
    try {
      const { name, buildingType } = req.body;

      let buildingExists = await buildingQueries.findOne({
        name: { $regex: new RegExp(`^${name}^`, "i") },
        buildingType,
        school: req.schoolId,
      });
      if (buildingExists)
        return common.failureResponse({
          message: "Building with the given name already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newBuilding = await buildingQueries.create({
        ...req.body,
        school: req.schoolId,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Building added successfully!",
        result: newBuilding,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };

      const result = await buildingQueries.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Buildings fetched successfully",
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await buildingQueries.delete({ _id: req.params.id });
      return common.successResponse({
        message: "Building deleted successfully!",
        statusCode: httpStatusCode.ok,
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { name, buildingType } = req.body;
      let buildingExists = await buildingQueries.findOne({
        _id: req.params.id,
      });
      if (!buildingExists)
        return common.failureResponse({
          message: "Building not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      let buidingWithGivenCredsExists = await buildingQueries.findOne({
        name: { $regex: new RegExp(`^${name}`, "i") },
        buildingType,
        school: req.schoolId,
        _id: { $ne: req.params.id },
      });
      if (buidingWithGivenCredsExists)
        return common.failureResponse({
          message: "Building with the given name already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let updatedBuilding = await buildingQueries.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Building updated successfully!",
        result: updatedBuilding,
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadSampleSheet(req) {
    try {
      const workBook = new ExcelJS.Workbook();
      let sheet = workBook.addWorksheet(`Add Buildings Sheet`);
      let HEADERS = [
        "Name",
        "Building Type",
        "Number Of Floors",
        "Latitude",
        "Logitude",
      ];
      sheet.addRow(HEADERS);

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

      const filePath = path.join(__dirname, "temp.xlsx");
      const response = await workBook.xlsx.writeBuffer({
        filename: filePath,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: response,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async addBuildingBulk(req) {
    try {
      if (!req.files || !req.files.file)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No file uploaded",
          responseCode: "CLIENT_ERROR",
        });

      let excelFile = req.files.file;

      if (!excelFile.name.endsWith(".xlsx")) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid file format. Please upload an Excel file.",
          responseCode: "CLIENT_ERROR",
        });
      }

      // Read the uploaded Excel file using exceljs
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(excelFile.data);
      const worksheet = workbook.getWorksheet(1); // Assuming there's only one worksheet

      const headers = worksheet.getRow(1).values.slice(1); // Get headers from the first row

      const buildingsToInsert = [];

      worksheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
        if (rowIndex === 1) {
          // Skip the header row
          return;
        }

        // Check if the first cell is empty (assuming the first cell is critical)
        const firstCellValue = row.getCell(1).value;

        // If the first cell is empty, skip this row
        if (!firstCellValue) {
          return;
        }

        const building = {};

        row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
          const header = headers[colIndex - 1]; // Get the header for the current column
          const key = convertHeaderToMongoKeyBulkAdd(header); // Map header to a DB key

          let cellValue;

          // Check if the cell contains a date, hyperlink, or simple value
          if (cell.type === ExcelJS.ValueType.Date) {
            // Handle dates
            cellValue = cell.value; // This will be a JavaScript Date object
          } else if (typeof cell.value === "object" && cell.value?.hyperlink) {
            // Handle hyperlinks
            cellValue = extractHyperlinkText(cell.value);
          } else {
            // Handle simple text or numeric values
            cellValue = cell.value;
          }

          if (key) {
            if (header.includes("Date") && cellValue) {
              // Convert date values to the desired format
              building[key] = moment(cellValue).isValid()
                ? moment(cellValue).toDate()
                : moment(cellValue, "DD/MM/YYYY").toDate();
            } else {
              // Handle boolean conversion for TRUE/FALSE or assign the value directly
              building[key] = ["TRUE", "FALSE"].includes(cellValue)
                ? cellValue === "TRUE"
                  ? true
                  : false
                : cellValue;
            }
          }
        });

        buildingsToInsert.push(building); // Add building object to the list
      });

      for (let building of buildingsToInsert) {
        building["name"] = building.name;
        building["location"] = building.location;
        building["buildingType"] = building.buildingType;
        building["numberOfFloors"] = building.numberOfFloors;
        building["location"] = {
          latitude: building["location.latitude"],
          longitude: building["location.longitude"],
        };
      }

      // Insert new buildings into the database
      await Building.insertMany(buildingsToInsert);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Buildings added successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
