const BookService = require("@services/helper/library/book");
const bookQuery = require("@db/library/book/queries");
const { uploadFileToS3 } = require("../../../helper/helpers");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

jest.mock("@db/library/book/queries");
jest.mock("../../../helper/helpers");
jest.mock("@generics/http-status");
jest.mock("@constants/common");

describe("BookService.create", () => {
  const bodyData = { title: "New Book", author: "John Doe" };
  const files = { bookCover: "new_book_cover.jpg" };

  beforeEach(() => {
    bookQuery.findOne.mockResolvedValue(null);
    uploadFileToS3.mockResolvedValue("new_book_cover_url");
    common.successResponse.mockReturnValue({
      statusCode: httpStatusCode.ok,
      message: "Book added successfully!",
      result: {
        _id: "new_book_id",
        title: "New Book",
        author: "John Doe",
        bookCover: "new_book_cover_url",
      },
    });
  });

  it("should successfully add a new book with a unique title and valid cover image", async () => {
    const result = await BookService.create(bodyData, files);
    expect(bookQuery.findOne).toHaveBeenCalledTimes(1);
    expect(bookQuery.findOne).toHaveBeenCalledWith({
      title: { $regex: /^New Book/i },
    });
    expect(uploadFileToS3).toHaveBeenCalledTimes(1);
    expect(uploadFileToS3).toHaveBeenCalledWith(files.bookCover);
    expect(common.successResponse).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      statusCode: httpStatusCode.ok,
      message: "Book added successfully!",
      result: {
        _id: "new_book_id",
        title: "New Book",
        author: "John Doe",
        bookCover: "new_book_cover_url",
      },
    });
  });
});
