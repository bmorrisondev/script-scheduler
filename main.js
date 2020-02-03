const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path')

const walkSync = function(dir, filelist) {
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + file).isDirectory()) {
      filelist = walkSync(dir + file + '/', filelist);
    }
    else {
      filelist.push({
        fileName: file,
        filePath: path.join(dir, file)
      })
    }
  });
  return filelist;
};

exports.run = function (baseDir) {
  if(!baseDir) {
    throw "baseDir is required."
  }
  
  var scripts = walkSync(baseDir)
  
  scripts.forEach(script => {
    var scriptDefinition = require(script.filePath)
    if(scriptDefinition.enabled) {
      console.log("starting up ", {
        name: script.fileName,
        path: script.filePath,
        schedule: scriptDefinition.schedule
      });
      schedule.scheduleJob(scriptDefinition.schedule, () => {
        var date = new Date();
        console.log(`${date.toLocaleString()}: executing ${script.fileName}.`);
        scriptDefinition.fn();
      })
    }
  });
}
