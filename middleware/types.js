const Type = require('../models/Type')

const getAllTypesMiddle = async (req, res, next) => {
    const types = await Type.find({});
    req.types = types;
    next();
}

module.exports = getAllTypesMiddle