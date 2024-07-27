// Dependencies
const accountHelper = require("@services/helper/account");

module.exports = class Account {
  /**
   * create mentee account
   * @method
   * @name create
   * @param {Object} req -request data.
   * @param {Object} req.body -request body contains user creation deatils.
   * @param {String} req.body.secretCode - secrate code to create mentor.
   * @param {String} req.body.name - name of the user.
   * @param {Boolean} req.body.isAMentor - is a mentor or not .
   * @param {String} req.body.email - user email.
   * @param {String} req.body.password - user password.
   * @returns {JSON} - response contains account creation details.
   */

  async create(req) {
    try {
      const createdAccount = await accountHelper.create(req);
      return createdAccount;
    } catch (error) {
      return error;
    }
  }

  async checkIfLoggedIn(req) {
    try {
      const createdAccount = await accountHelper.checkIfLoggedIn(req);
      return createdAccount;
    } catch (error) {
      return error;
    }
  }

  async refreshToken(req) {
    try {
      const token = await accountHelper.refreshToken(req);
      return token;
    } catch (error) {
      return error;
    }
  }

  /**
   * login user account
   * @method
   * @name login
   * @param {Object} req -request data.
   * @param {Object} req.body -request body contains user login deatils.
   * @param {String} req.body.email - user email.
   * @param {String} req.body.password - user password.
   * @returns {JSON} - returns susccess or failure of login details.
   */

  async login(req) {
    const params = req.body;
    try {
      const loggedInAccount = await accountHelper.login(params);
      return loggedInAccount;
    } catch (error) {
      return error;
    }
  }

  async getCurrentUser(req) {
    try {
      const loggedInAccount = await accountHelper.getCurrentUser(req);
      return loggedInAccount;
    } catch (error) {
      return error;
    }
  }

  /**
   * logout user account
   * @method
   * @name logout
   * @param {Object} req -request data.
   * @param {Object} req.decodedToken - it contains user token informations.
   * @param {string} req.body.loggedInId - user id.
   * @param {string} req.body.refreshToken - refresh token.
   * @param {String} req.decodedToken._id - userId.
   * @returns {JSON} - accounts loggedout.
   */

  async logout(req) {
    const params = req.body;
    params.loggedInId = req.decodedToken._id;
    try {
      const loggedOutAccount = await accountHelper.logout(params);
      return loggedOutAccount;
    } catch (error) {
      return error;
    }
  }

  /**
   * generate access token
   * @method
   * @name generateToken
   * @param {Object} req -request data.
   * @param {string} req.body.refreshToken - refresh token.
   * @returns {JSON} - access token info
   */

  async generateToken(req) {
    const params = req.body;
    try {
      const createdToken = await accountHelper.generateToken(params);
      return createdToken;
    } catch (error) {
      return error;
    }
  }

  /**
   * generate otp
   * @method
   * @name generateOtp
   * @param {Object} req -request data.
   * @param {string} req.body.email - user email.
   * @returns {JSON} - otp success response
   */

  async generateOtp(req) {
    const params = req.body;
    try {
      const result = await accountHelper.generateOtp(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  /**
   * Reset password
   * @method
   * @name resetPassword
   * @param {Object} req -request data.
   * @param {string} req.body.email - user email.
   * @param {string} req.body.otp - user otp.
   * @param {string} req.body.password - user password.
   * @returns {JSON} - password reset response
   */

  async resetPassword(req) {
    const params = req.body;
    try {
      const result = await accountHelper.resetPassword(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async changePassword(req) {
    try {
      const result = await accountHelper.changePassword(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async changePasswordForUser(req) {
    try {
      const result = await accountHelper.changePasswordForUser(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
