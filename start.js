var childProcess = require('child_process');

childProcess.exec('node server/server.js');
childProcess.exec('start chrome http://localhost:3000');