const byteBinServer = require("./server/byteBinServer.js");
const server = new byteBinServer();
server.start(process.env.PORT || 80);