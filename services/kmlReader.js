let fs = require('fs'),
    path = require('path'),
    Promise = require('bluebird'),
    xmlReader = require('read-xml'),
    convert = require('xml-js');

let FILE = path.join(__dirname, './data/DeliveryAreas.kml');
let outletData = require('./outletData').outletData;

const readFile = (address) => {
    return new Promise((response, reject) => {
        let outletInfo = outletData.find((val, x) => {
            return val.address === address;
        });
        if (!outletInfo) {
            return reject({
                status: false,
                message: 'not found',
                err_data: ''
            });
        }
        if (outletInfo.alias === "null") {
            return reject({
                status: false,
                message: 'not found',
                err_data: ''
            });
        }
        xmlReader.readXML(fs.readFileSync(FILE), (err, data) => {
            if (err) {
                console.error(err);
                return reject({
                    status: false,
                    message: 'failed',
                    err_data: err
                });
            }
            let xml = data.content;
            let result = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));
            // If your KML file is different than the one I provided just change
            // result.kml.Document.Placemark['gx:Track']['gx:coord'].
            // As you can see it is similar with the KML file provided.

            let placemark = result.kml.Document.Placemark;

            // for (let i = 0; i < placemark.length; i++) {
            //     let results = result.kml.Document.Placemark._text;
            //     // As I said before you have to split the returned value.
            //     let coordinates = results.split(" ");
            //     let longitude = coordinates[0];
            //     let latitude = coordinates[1];
            //     console.log("lat/long: " + latitude + ", " + longitude);
            // }

            let coordinates = placemark.find((val, index) => {
                return val.name._text === outletInfo.alias;
            })


            return response({
                status: true,
                message: 'Success',
                data: coordinates || []
            });
        });
    });
}


module.exports = {
    readFile: readFile
}