const courseQuery = require("@db/course/queries");
const courseContentQuery = require("@db/courseContent/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");
const { default: mongoose } = require("mongoose");

module.exports = class CourseContentService {
  static async create(req) {
    try {
      const courseId = req.params.id;

      console.log(courseId, "====");

      let courseWithGivenId = await courseQuery.findOne({ _id: courseId });
      if (!courseWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course not found!",
          responseCode: "CLIENT_ERROR",
        });

      let bodyData =
        typeof req.body.body === "string"
          ? JSON.parse(req.body.body)
          : req.body.body;
      const { title, description } = bodyData;

      let file = req.files?.file;
      let uploadedFile;
      let previousContentChaptersList = 0;

      let previousCourseContents = await courseContentQuery.findOne({
        courseId: courseId,
      });

      if (previousCourseContents) {
        previousContentChaptersList = previousCourseContents.chapters.length;
      }
      if (file) {
        uploadedFile = await uploadFileToS3(file);
      }

      let chapterId = new mongoose.Types.ObjectId();
      let newChapter = await courseContentQuery.updateOne(
        { courseId: courseId },
        {
          $addToSet: {
            chapters: {
              title: title,
              _id: chapterId,
              description: description,
              material: uploadedFile,
              orderSequence: previousContentChaptersList + 1,
            },
          },
        },
        { new: true, upsert: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Chapter Created Successfully!",
        result: newChapter,
      });
    } catch (error) {
      throw error;
    }
  }
  static async updateChapterDetails(req) {
    try {
      let courseId = req.params.id;

      let file = "";
      if (req.files) {
        file = req.files.file;
      }
      //   let bodyData =
      //     typeof req.body.details === "string"
      //       ? JSON.parse(req.body.details)
      //       : req.body.details;

      const { chapterId, title, description } = req.body;

      let course = await courseQuery.findOne({ _id: courseId });
      if (!course)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course not found!",
          responseCode: "CLIENT_ERROR",
        });

      let courseContentWithChapterToUpdate = await courseContentQuery.findOne({
        courseId: courseId,
        "chapters._id": chapterId,
      });

      if (!courseContentWithChapterToUpdate)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Chapter to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let chapterToEdit = courseContentWithChapterToUpdate.chapters.filter(
        (c) => c._id.toHexString() === chapterId
      )[0];

      if (file) {
        if (chapterToEdit.material) {
          await deleteFile(chapterToEdit.material);
        }

        const uploadedFile = await uploadFileToS3(file);

        let updatedChapter = await courseContentQuery.updateOne(
          { courseId: courseId, "chapters._id": chapterId },
          {
            $set: {
              "chapters.$.title": title,
              "chapters.$.description": description,
              "chapters.$.material": uploadedFile,
            },
          },
          { new: true }
        );
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Chapter Updated Successfully!",
          result: updatedChapter,
        });
      } else {
        let updatedChapter = await courseContentQuery.updateOne(
          { courseId: courseId, "chapters._id": chapterId },
          {
            $set: {
              "chapters.$.title": title,
              "chapters.$.description": description,
            },
          },
          { new: true }
        );
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Chapter Updated Successfully!",
          result: updatedChapter,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async deleteChapter(req) {
    try {
      const { chapterId } = req.body;
      let courseId = req.params.id;

      let courseToDelete = await courseQuery.findOne({ _id: courseId });
      if (!courseToDelete) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      let courseContentToUpdate = await courseContentQuery.findOne({
        courseId: courseId,
        "chapters._id": chapterId,
      });

      if (!courseContentToUpdate)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course content to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let chapters = courseContentToUpdate.chapters;
      let chapterToDelete = chapters.filter(
        (c) => c._id.toHexString() == chapterId
      )[0];

      if (chapterToDelete.material) {
        await deleteFile(chapterToDelete.material);
      }

      let totalContentHoursToRemove = 0;

      if (chapterToDelete.contents.length > 0) {
        for (let content of chapterToDelete.contents) {
          totalContentHoursToRemove += content.contentHours;
          if (content.type === "FlashCard") {
            if (content.flashCard.cardType === "Image") {
              await deleteFile(content.flashCard.image);
            }
          } else if (content.type === "Video") {
            await deleteFile(content.video);
          } else if (content.type === "Material") {
            await deleteFile(content.contentMaterial);
          }
        }
      }

      await courseQuery.updateOne(
        { _id: courseId },
        { $inc: { courseHours: -totalContentHoursToRemove } }
      );
      await courseContentQuery.updateOne(
        { courseId: courseId, "chapters._id": chapterId },
        { $pull: { chapters: { _id: chapterId } } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Chapter deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteChapterMaterial(req) {
    try {
      const { chapterId } = req.body;
      const courseId = req.params.id;

      let courseContentWithGivenChapterId = await courseContentQuery.findOne({
        courseId: courseId,
        "chapters._id": chapterId,
      });

      if (!courseContentWithGivenChapterId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course content with the given chapter id was not found!",
          responseCode: "CLIENT_ERROR",
        });

      const chapterToModify = courseContentWithGivenChapterId.chapters.filter(
        (fil) => fil._id.toHexString() === chapterId
      )[0];
      if (!chapterToModify)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Chapter to update was not found!",
          responseCode: "CLIENT_ERROR",
        });
      if (chapterToModify.material) {
        await deleteFile(chapterToModify.material);
      }

      let updatedChapter = await courseContentQuery.updateOne(
        { courseId: courseId, "chapters._id": chapterId },
        { $set: { "chapters.$.material": null } },
        { new: true }
      );
      return common.successResponse({
        result: updatedChapter,
        message: "Chapter material deleted successfully",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async addContentToChapter(req) {
    try {
      const courseId = req.params.id;
      let file = "";
      if (req.files) {
        file = req.files.file;
      }

      let course = await courseQuery.findOne({ _id: courseId });
      if (!course)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course not found!",
          responseCode: "CLIENT_ERROR",
        });

      const bodyData =
        typeof req.body.material === "string"
          ? JSON.parse(req.body.material)
          : req.body.material;

      const {
        title,
        description,
        type,
        orderSequence,
        quiz,
        flashCard,
        chapterId,
        contentHours,
      } = bodyData;

      console.log(bodyData, "========");

      let courseContentToUpdate = await courseContentQuery.findOne({
        courseId: courseId,
        "chapters._id": chapterId,
      });
      if (!courseContentToUpdate)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course content to update was not found",
          responseCode: "CLIENT_ERROR",
        });

      let materialToAdd;
      if (type === "Quiz") {
        materialToAdd = {
          _id: new mongoose.Types.ObjectId(),
          title,
          description,
          orderSequence: orderSequence,
          type: "Quiz",
          quiz: quiz.map((q) => ({
            ...q,
            _id: new mongoose.Types.ObjectId(),
          })),
        };
      } else if (type === "FlashCard") {
        if (flashCard.cardType === "Image") {
          let imageLink = "";

          if (!file)
            return common.failureResponse({
              statusCode: httpStatusCode.not_found,
              message: "Please provide flash card image file!",
              responseCode: "CLIENT_ERROR",
            });

          imageLink = await uploadFileToS3(file);

          materialToAdd = {
            _id: new mongoose.Types.ObjectId(),
            title,
            description,
            orderSequence: orderSequence,
            type: "FlashCard",
            flashCard: {
              cardType: flashCard.cardType,
              image: imageLink,
              _id: new mongoose.Types.ObjectId(),
            },
          };
        } else {
          materialToAdd = {
            _id: new mongoose.Types.ObjectId(),
            title,
            description,
            orderSequence: orderSequence,
            type: "FlashCard",
            flashCard: {
              cardType: flashCard.cardType,
              text: flashCard.text,
              _id: new mongoose.Types.ObjectId(),
            },
          };
        }
      } else if (type === "Video") {
        if (!file)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Please provide video file!",
            responseCode: "CLIENT_ERROR",
          });

        let videoLink = await uploadFileToS3(file);

        materialToAdd = {
          _id: new mongoose.Types.ObjectId(),
          title,
          description,
          orderSequence: orderSequence,
          type: "Video",
          video: videoLink,
        };
      } else if (type === "Material") {
        if (!file)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Please provide file!",
            responseCode: "CLIENT_ERROR",
          });

        const uploadedFile = await uploadFileToS3(file);

        materialToAdd = {
          _id: new mongoose.Types.ObjectId(),
          title,
          description,
          orderSequence: orderSequence,
          type: "Material",
          contentMaterial: uploadedFile,
        };
      } else if (type === "CodePractice") {
        if (!file)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Please provide file!",
            responseCode: "CLIENT_ERROR",
          });

        const uploadedFile = await uploadFileToS3(file);

        materialToAdd = {
          _id: new mongoose.Types.ObjectId(),
          title,
          description,
          orderSequence: orderSequence,
          type: "CodePractice",
          contentMaterial: uploadedFile,
        };
      }

      let updatedChapter = await courseContentQuery.updateOne(
        { courseId: courseId, "chapters._id": chapterId },
        {
          $addToSet: {
            "chapters.$.contents": {
              ...materialToAdd,
              contentHours: contentHours || 0,
            },
          },
        },
        { new: true }
      );

      await courseQuery.updateOne(
        {
          _id: req.params.id,
        },
        { $inc: { courseHours: contentHours || 0 } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Content added successfully",
        result: updatedChapter,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateContent(req) {
    try {
      const courseId = req.params.id;

      let file = "";
      if (req.files) {
        file = req.files.file;
      }
      let { material } = req.body;
      material = typeof material === "string" ? JSON.parse(material) : material;

      const { chapterId, contentId } = material;

      let contentToEdit = await courseContentQuery.findOne({ courseId });
      if (!contentToEdit)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course content to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let chapterToEdit = contentToEdit.chapters.filter(
        (c) => c._id.toHexString() === chapterId
      )[0];

      if (!chapterToEdit)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Chapter to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let contentOfChapterToEdit = chapterToEdit.contents.filter(
        (c) => c._id.toHexString() === contentId
      )[0];

      if (!contentOfChapterToEdit)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Content to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let initialContentHours = contentOfChapterToEdit.contentHours || 0;

      if (contentOfChapterToEdit.type === "Quiz") {
        const quiz = material.quiz
          .filter((q) => q.question != "")
          .map((q) => ({
            ...q,
            _id: q._id ? q._id : new mongoose.Types.ObjectId(),
          }));

        contentToEdit = await courseContentQuery.updateOne(
          {
            "chapters.contents._id": contentId,
          },
          {
            $set: {
              "chapters.$[].contents.$[xxx].quiz": quiz,
              "chapters.$[].contents.$[xxx].title": material.title,
              "chapters.$[].contents.$[xxx].description": material.description,
              "chapters.$[].contents.$[xxx].contentHours":
                material.contentHours,
            },
          },
          { arrayFilters: [{ "xxx._id": contentId }] }
        );
      } else if (contentOfChapterToEdit.type === "FlashCard") {
        if (material.flashCard.cardType === "Image") {
          let updateFields = {
            "chapters.$[].contents.$[xxx].title": material.title,
            "chapters.$[].contents.$[xxx].description": material.description,
            "chapters.$[].contents.$[xxx].flashCard.cardType":
              material.flashCard.cardType,
            "chapters.$[].contents.$[xxx].contentHours": material.contentHours,
          };

          if (file) {
            if (contentOfChapterToEdit.flashCard.image) {
              await deleteFile(contentOfChapterToEdit.flashCard.image);
            }

            let imageLink = await uploadFileToS3(req.files.file);

            updateFields["chapters.$[].contents.$[xxx].flashCard.image"] =
              imageLink;
            updateFields["chapters.$[].contents.$[xxx].flashCard.text"] = null;
          } else {
            updateFields["chapters.$[].contents.$[xxx].flashCard.text"] = null;
          }

          contentToEdit = await courseContentQuery.updateOne(
            {
              "chapters.contents._id": contentId,
            },
            {
              $set: updateFields,
            },
            { arrayFilters: [{ "xxx._id": contentId }] }
          );
        } else {
          contentToEdit = await courseContentQuery.updateOne(
            {
              "chapters.contents._id": contentId,
            },
            {
              $set: {
                "chapters.$[].contents.$[xxx].title": material.title,
                "chapters.$[].contents.$[xxx].description":
                  material.description,
                "chapters.$[].contents.$[xxx].contentHours":
                  material.contentHours,
                "chapters.$[].contents.$[xxx].flashCard": {
                  cardType: material.flashCard.cardType,
                  image: null,
                  text: material.flashCard.text,
                },
              },
            },
            { arrayFilters: [{ "xxx._id": contentId }] }
          );
        }
      } else if (contentOfChapterToEdit.type === "Video") {
        if (file) {
          if (contentOfChapterToEdit.video) {
            await deleteFile(contentOfChapterToEdit.video);
          }

          let videoLink = await uploadFileToS3(req.files.file);

          contentToEdit = await courseContentQuery.updateOne(
            { "chapters.contents._id": contentId },
            {
              $set: {
                "chapters.$[].contents.$[xxx].title": material.title,
                "chapters.$[].contents.$[xxx].contentHours":
                  material.contentHours,
                "chapters.$[].contents.$[xxx].description":
                  material.description,
                "chapters.$[].contents.$[xxx].video": videoLink,
              },
            },
            { arrayFilters: [{ "xxx._id": contentId }] }
          );
        } else {
          contentToEdit = await courseContentQuery.updateOne(
            { "chapters.contents._id": contentId },
            {
              $set: {
                "chapters.$[].contents.$[xxx].title": material.title,
                "chapters.$[].contents.$[xxx].description":
                  material.description,
                "chapters.$[].contents.$[xxx].contentHours":
                  material.contentHours,
              },
            },
            { arrayFilters: [{ "xxx._id": contentId }] }
          );
        }
      } else if (contentOfChapterToEdit.type === "Material") {
        if (file) {
          if (contentOfChapterToEdit.contentMaterial) {
            await deleteFile(contentOfChapterToEdit.contentMaterial);
          }

          let contentMaterial = await uploadFileToS3(req.files.file);

          contentToEdit = await courseContentQuery.updateOne(
            { "chapters.contents._id": contentId },
            {
              $set: {
                "chapters.$[].contents.$[xxx].title": material.title,
                "chapters.$[].contents.$[xxx].description":
                  material.description,
                "chapters.$[].contents.$[xxx].contentMaterial": contentMaterial,
                "chapters.$[].contents.$[xxx].contentHours":
                  material.contentHours,
              },
            },
            { arrayFilters: [{ "xxx._id": contentId }] }
          );
        } else {
          contentToEdit = await courseContentQuery.updateOne(
            { "chapters.contents._id": contentId },
            {
              $set: {
                "chapters.$[].contents.$[xxx].title": material.title,
                "chapters.$[].contents.$[xxx].description":
                  material.description,
                "chapters.$[].contents.$[xxx].contentHours":
                  material.contentHours,
              },
            },
            { arrayFilters: [{ "xxx._id": contentId }] }
          );
        }
      }

      if (initialContentHours !== material.contentHours) {
        await courseQuery.updateOne(
          { _id: courseId },
          {
            $inc: {
              courseHours: material.contentHours,
            },
          }
        );
        await courseQuery.updateOne(
          { _id: courseId },
          {
            $inc: {
              courseHours: -initialContentHours,
            },
          }
        );
      }

      return common.successResponse({
        result: contentToEdit,
        message: "Content updated successfully",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteContent(req) {
    try {
      let courseId = req.params.id;
      let { chapterId, contentId } = req.body;

      let courseContent = await courseContentQuery.findOne({ courseId });
      if (!courseContent)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course content to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let chapterToUpdate = courseContent.chapters.filter(
        (c) => c._id.toHexString() === chapterId
      )[0];

      if (!chapterToUpdate)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Chapter to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let contentToDelete = chapterToUpdate.contents.filter(
        (c) => c._id.toHexString() === contentId
      )[0];

      if (!contentToDelete)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Content to delete was not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (contentToDelete.type === "FlashCard") {
        if (contentToDelete.flashCard.cardType === "Image") {
          await deleteFile(contentToDelete.flashCard.image);
        }
      } else if (contentToDelete.type === "Video") {
        await deleteFile(contentToDelete.video);
      } else if (contentToDelete.type === "Material") {
        await deleteFile(contentToDelete.contentMaterial);
      }

      let newListOfContents = chapterToUpdate.contents.filter(
        (c) => c._id.toHexString() !== contentId
      );

      await courseQuery.updateOne(
        { _id: courseId },
        { $inc: { courseHours: -contentToDelete.contentHours } }
      );

      let updatedContent = await courseContentQuery.updateOne(
        { "chapters._id": chapterId },
        { $set: { "chapters.$.contents": newListOfContents } }
      );

      return common.successResponse({
        result: updatedContent,
        message: "Content deleted successfully",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async changeOrderSequence(req) {
    const courseId = req.params.id;
    const { type, contentId, chapterId } = req.body; //  type = up/down

    try {
      const courseContent = await courseContentQuery.findOne({ courseId });

      if (!courseContent)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course content to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      const chapterToEdit = courseContent.chapters.filter(
        (chapter) => chapter._id.toHexString() === chapterId
      )[0];

      if (!chapterToEdit)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Chapter to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let contentToEdit = chapterToEdit.contents.filter(
        (c) => c._id.toHexString() === contentId
      )[0];

      if (!contentToEdit)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Content to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let allContents = chapterToEdit.contents;
      let indexOfContentToModify = allContents.indexOf(contentToEdit);

      if (type === "up" && indexOfContentToModify !== 0) {
        let secondItemToUpdate = allContents[indexOfContentToModify - 1];
        let newIndex = indexOfContentToModify - 1;
        let newContents = allContents.map((c, i) => {
          if (i === newIndex) return contentToEdit;
          else if (i === indexOfContentToModify) {
            return secondItemToUpdate;
          } else return c;
        });

        await courseContentQuery.updateOne(
          { "chapters.contents._id": contentId },
          {
            $set: {
              "chapters.$[xxx].contents": newContents,
            },
          },
          { arrayFilters: [{ "xxx._id": chapterId }] }
        );

        return common.successResponse({
          message: "Order sequence updated successfully!",
          statusCode: httpStatusCode.ok,
        });
      } else if (
        type === "down" &&
        indexOfContentToModify !== allContents.length - 1
      ) {
        let secondItemToUpdate = allContents[indexOfContentToModify + 1];
        let newIndex = indexOfContentToModify + 1;
        let newContents = allContents.map((c, i) => {
          if (i === newIndex) return contentToEdit;
          else if (i === indexOfContentToModify) {
            return secondItemToUpdate;
          } else return c;
        });

        await courseContentQuery.updateOne(
          { "chapters.contents._id": contentId },
          {
            $set: {
              "chapters.$[xxx].contents": newContents,
            },
          },
          { arrayFilters: [{ "xxx._id": chapterId }] }
        );

        return common.successResponse({
          message: "Order sequence updated successfully!",
          statusCode: httpStatusCode.ok,
        });
      } else {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please select a valid sorting type : up || down",
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async getDetailsStudents(req) {
    try {
      const courseId = req.params.id;

      let courseWithGivenId = await courseQuery.findOne({ _id: courseId });
      if (!courseWithGivenId)
        return common.failureResponse({
          stausCode: httpStatusCode.not_found,
          message: "Course with given id was not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (
        !courseWithGivenId.class
          .map((i) => i.toHexString())
          .includes(req.student.academicInfo.class._id.toHexString())
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "This course is not for your class",
          responseCode: "CLIENT_ERROR",
        });

      let contentOfGivenCourseId = await courseContentQuery.findOne({
        courseId,
      });
      if (!contentOfGivenCourseId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Content of the course was not found!",
          responseCode: "CLIENT_ERROR",
        });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: contentOfGivenCourseId,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getDetailsTeachers(req) {
    try {
      const courseId = req.params.id;

      let courseWithGivenId = await courseQuery.findOne({ _id: courseId });
      if (!courseWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course with given id was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let contentOfGivenCourseId = await courseContentQuery.findOne({
        courseId,
      });

      return common.successResponse({
        result: contentOfGivenCourseId || [],
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }
};
