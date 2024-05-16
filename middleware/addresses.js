const Address = require('../models/Address')

const getAllAddressesMiddle = async (req, res, next) => {
    const addresses = await Address.find({});
    req.addresses = addresses;
    next();
}

module.exports = getAllAddressesMiddle