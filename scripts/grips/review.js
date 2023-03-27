const fs = require('fs');
const path = require('path');

const directoryPath = 'review';
const fileExtension = '.sigml';

const fileList = fs.readdirSync(directoryPath)
  .filter(file => path.extname(file) === fileExtension)
  .map(file => ({
    name: file,
    value: fs.readFileSync(path.join(directoryPath, file), 'utf-8')
  }));

console.log(fileList);