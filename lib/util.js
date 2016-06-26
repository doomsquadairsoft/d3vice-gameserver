var Guid = require('guid');



var generateGUID = function generateGUID() {
  return Guid.raw();
}



module.exports = {
  generateGUID: generateGUID
}
