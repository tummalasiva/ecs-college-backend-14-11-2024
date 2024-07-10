const bookQuery = require("@db/library/book/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../../helper/helpers");

module.exports = class BookService {
  static async create(bodyData, files) {
    try {
      let bookCover = "";
      let bookWithTitleExists = await bookQuery.findOne({
        title: { $regex: new RegExp(`^${bodyData.title}`, "i") },
      });
      if (bookWithTitleExists)
        return common.failureResponse({
          message: "Book with the given title already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      if (files && files.bookCover) {
        bookCover = await uploadFileToS3(files.bookCover);
      }

      bodyData.bookCover = bookCover;
      let newBook = await bookQuery.create(bodyData);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Book added successfully!",
        result: newBook,
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
      let books = await bookQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: books,
        message: "Books fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, files) {
    try {
      let bookExistsWithTitle = await bookQuery.findOne({
        _id: { $ne: id },
        title: { $regex: new RegExp(`^${body.title}`, "i") },
      });
      if (bookExistsWithTitle)
        return common.failureResponse({
          message: "Book with the given title already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let bookExists = await bookQuery.findOne({ _id: id });
      if (!bookExists)
        return common.failureResponse({
          message: "Book not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      let bookCover = bookExists.bookCover;

      if (files && files.bookCover) {
        if (bookCover) {
          await deleteFile(bookCover);
        }

        bookCover = await uploadFileToS3(files.bookCover);
      }

      body.bookCover = bookCover;

      let updatedBook = await bookQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (updatedBook) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Book updated successfully!",
          result: updatedBook,
        });
      } else {
        return common.failureResponse({
          message: "Book not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      let bookWithGivenId = await bookQuery.findOne({ _id: id });
      if (!bookWithGivenId)
        return common.failureResponse({
          message: "Book not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      if (bookWithGivenId.bookCover) {
        await deleteFile(bookWithGivenId.bookCover);
      }

      await bookQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Book deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
