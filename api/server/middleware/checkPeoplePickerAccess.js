const { createPeoplePickerAccess } = require('@aries/api');
const { getRoleByName } = require('~/models');

const checkPeoplePickerAccess = createPeoplePickerAccess({ getRoleByName });

module.exports = {
  checkPeoplePickerAccess,
};
