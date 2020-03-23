
function standardizeWikidata(res, imageWidth) {
    if (imageWidth === void 0) { imageWidth = 300; }
    var geojson = {
        type: 'FeatureCollection',
        features: [],
    };
    // list of QIDs
    var qids = [];
    res.results.bindings.forEach(function (o) {
        var qid = o.place.value.split('entity/')[1];
        // only add feature if the feature was not yet seen
        if (qids.indexOf(qid) < 0) {
            geojson.features.push(createFeature(o, imageWidth));
            qids.push(qid);
        }
    });
    return geojson;
}
module.exports.standardizeWikidata = standardizeWikidata;

function createFeature(obj, imageWidth) {
    var mediaName;
    if (obj.image) {
        // if image is available, make path
        mediaName = 'File:' + obj.image.value.split('Path/')[1];
    }
    return {
        type: 'Feature',
        properties: {
            id_wikidata: obj.place.value.split('entity/')[1],
            image: mediaName,
            name: obj.placeLabel.value,
            ispotable: obj.ispotable.value,
        },
        geometry: {
            type: 'Point',
            coordinates: [
                parseFloat(obj.location.value
                    .split(';')[0]
                    .slice(6, -1)
                    .split(' ')[0]),
                parseFloat(obj.location.value
                    .split(';')[0]
                    .slice(6, -1)
                    .split(' ')[1]),
            ],
        },
    };
}
module.exports.createFeature = createFeature;