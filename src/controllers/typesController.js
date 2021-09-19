const { Types } = require('../db.js');




exports.obtenerTypes = async (req, res) => {
    const arrTypes = [];
    const typesDB = await Types.findAll();
    for (const data of typesDB) {
        arrTypes.push(data.dataValues);
    }
    res.json(arrTypes);
}