const fs = require('fs');
const path = require('path');

module.exports = function() {
  try {
    const licenseFilePath = path.join(__dirname, 'license.txt');
    return fs.readFileSync(licenseFilePath, 'utf8').trim();
  } catch (error) {
    console.error('Error reading license.txt:', error);
    return 'License text not available';
  }
};