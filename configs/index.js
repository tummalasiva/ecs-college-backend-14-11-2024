require("./mongodb")();
// require('./cache')()
// require("./redis")();

require("./aes256cbc")();
const path = require("path");

global.PROJECT_ROOT_DIRECTORY = path.join(__dirname, "..");
