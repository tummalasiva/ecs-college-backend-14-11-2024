const studentService = require("@services/helper/student");

module.exports = class StudentController {
  async create(req) {
    let parsedBody =
      typeof req.body.body === "string"
        ? JSON.parse(req.body.body)
        : req.body.body;

    const bodyData = { ...parsedBody, school: parsedBody.schoolId };
    const files = req.files;
    try {
      const result = await studentService.create(bodyData, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await studentService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getCoursePlanStudents(req) {
    try {
      const result = await studentService.getCoursePlanStudents(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async overView(req) {
    try {
      const result = await studentService.overView(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const _id = req.params.id;

    let parsedBody =
      typeof req.body.body === "string"
        ? JSON.parse(req.body.body)
        : req.body.body;

    const bodyData = { ...parsedBody, school: parsedBody.schoolId };
    const files = req.files;
    try {
      const result = await studentService.update(
        _id,
        bodyData,
        req.employee,
        files
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await studentService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await studentService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async promote(req) {
    try {
      const result = await studentService.promote(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async resuffle(req) {
    try {
      const result = await studentService.resuffle(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async studentsResuffleListExcel(req) {
    const bodyData = req.body;
    try {
      const result = await studentService.studentsResuffleListExcel(bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateStudentResuffle(req) {
    const bodyData = req.body;
    try {
      const result = await studentService.updateStudentResuffle(bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async bulkPromotion(req) {
    try {
      const result = await studentService.bulkPromotion(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async bulkAdmissionSheet(req) {
    try {
      const result = await studentService.bulkAdmissionSheet(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async bulkAdmit(req) {
    try {
      const result = await studentService.bulkAdmit(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async bulkUpdateSheet(req) {
    try {
      const result = await studentService.bulkUpdateSheet(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async bulkUpdate(req) {
    try {
      const result = await studentService.bulkUpdate(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async studentListExcel(req) {
    try {
      const result = await studentService.studentListExcel(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async studentListPdf(req) {
    try {
      const result = await studentService.studentListPdf(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateHostelMember(req) {
    try {
      const result = await studentService.updateHostelMember(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async removeHostelMember(req) {
    try {
      const result = await studentService.removeHostelMember(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateTransportMember(req) {
    try {
      const result = await studentService.updateTransportMember(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async removeTransportMember(req) {
    try {
      const result = await studentService.removeTransportMember(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateLibraryMember(req) {
    try {
      const result = await studentService.updateLibraryMember(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async removeLibraryMember(req) {
    try {
      const result = await studentService.removeLibraryMember(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getDashboardStudentDetails(req) {
    try {
      const result = await studentService.getDashboardStudentDetails(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadAllStudentsExcel(req) {
    try {
      const result = await studentService.downloadAllStudentsExcel(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async downloadStudentsExcel(req) {
    try {
      const result = await studentService.downloadStudentsExcel(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadStudentsPdf(req) {
    try {
      const result = await studentService.downloadStudentsPdf(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async updatePhoto(req) {
    try {
      const result = await studentService.updatePhoto(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getBulkStudentAdmitSheet(req) {
    try {
      const result = await studentService.getBulkStudentAdmitSheet(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async bulkStudentAdmit(req) {
    try {
      console.log("controller reached");
      const result = await studentService.bulkStudentAdmit(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async generateIdCard(req) {
    try {
      const result = await studentService.generateIdCard(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async assignMentor(req) {
    try {
      const result = await studentService.assignMentor(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async generateGuardianCredentials(req) {
    try {
      const result = await studentService.generateGuardianCredentials(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async generateSingleGuardianCredential(req) {
    try {
      const result = await studentService.generateSingleGuardianCredential(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateBankInfo(req) {
    try {
      const result = await studentService.updateBankInfo(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getMyCurriculum(req) {
    try {
      const result = await studentService.getMyCurriculum(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getInternalExamSchedules(req) {
    try {
      const result = await studentService.getInternalExamSchedules(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getOnlineExamDetails(req) {
    try {
      const result = await studentService.getOnlineExamDetails(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async submitExam(req) {
    try {
      const result = await studentService.submitExam(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getCourseDetails(req) {
    try {
      const result = await studentService.getCourseDetails(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getStudentsForSectionAllocation(req) {
    try {
      const result = await studentService.getStudentsForSectionAllocation(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async assignSections(req) {
    try {
      const result = await studentService.assignSections(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
