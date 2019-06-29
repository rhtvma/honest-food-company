const express = require('express'),
    moment = require('moment-timezone'),
    router = express.Router();
let kmlReader = require("../services/kmlReader");


/* GET ALL WC matches listing. */
router.get('/getDeliveryAreas/:address', async (req, res, next) => {
    const {address} = req.params;
    if (!address) {
        return res.status(20).json({
            status: 2,
            message: 'Invalid Address',
            err_data: ''
        });
    }


    try {
        let latLong = [];
        let kmlResult = await kmlReader.readFile(address);
        if (kmlResult.status) {
            const result = kmlResult.data;
            let coordinates = result.Polygon.outerBoundaryIs.LinearRing.coordinates._text;
            coordinates = coordinates.replace(/\n/g, ";").replace(/ /g, '').split(";");
            for (let csData of coordinates) {
                if (csData) {
                    csData = csData.replace(/ /g, '');
                    let coResults = csData.split(",");
                    latLong.push([coResults[0], coResults[1]]);
                }
            }

            return res.status(200)
                .json({
                    status: 1,
                    message: "Success",
                    data: latLong
                });
        }
    } catch (err) {
        return res.status(200).json({
            status: 2,
            message: err.message || "failed",
            data: err
        });
    }
});


module.exports = router;
