
let mediaUrlManip = require('./mediaUrlManip.js')
let getMediaNameFromUrl = mediaUrlManip.getMediaNameFromUrl;
let getMapillaryId  = mediaUrlManip.getMapillaryId ;

let getFlickrJson  = mediaUrlManip.getFlickrJson;


//standardize OSM data for European Water Project geojson file
//convert way coordinates to a single point via simple averaging

 async function standardizeOsm(data) {
        // loop through features
       var length = data.features.length;
     //   console.log (length);
     //   console.log(JSON.stringify(data.features,null,2))
        
   data.features.forEach(f => {

    //for  (const f of data.features) {
          // create a new property object and populate it with the existing data according to the "standard_properties"
          if (f.properties) {
            if(f.properties.type=="way")
            {
                longitude = 0;
                latitude = 0;
                counter = 0;
                f.geometry.coordinates[0].forEach(element => {
                //    console.log("point " +element);
                    counter++;
                    longitude += element[0];
                    latitude += element[1];       
                });
                longitude = longitude/counter;
                latitude = latitude/counter;
            //    console.log("coordinates "+ longitude +" " + latitude);
                f.geometry.coordinates[0] = longitude;
                f.geometry.coordinates[1] = latitude;
                f.geometry.type = "Point";
            }
            let mediaName;
    
            // only use image URL if the URL is from wikimedia commons
            if (f.properties.tags.hasOwnProperty('image') && f.properties.tags.image.includes('wikimedia.org')) {
              mediaName = getMediaNameFromUrl(f.properties.tags.image);
              // if there is a wikicommons name defined, use that (but only if it points to a  file, not a category)
            } else if (f.properties.tags.hasOwnProperty('wikimedia_commons') && f.properties.tags.wikimedia_commons.includes('File:')) {
              // todo: get file url from file name     
              mediaName = f.properties.tags.wikimedia_commons;
            } 
            let mapillary;
            if (f.properties.tags.hasOwnProperty('mapillary')) {
              mapillary = getMapillaryId (f.properties.tags.mapillary);
            } else if  (f.properties.tags.hasOwnProperty('image') && f.properties.tags.image.includes('mapillary')) {
              mapillary = getMapillaryId (f.properties.tags.image);
            }
            let source;
            if  (f.properties.tags.hasOwnProperty('source') && f.properties.tags.source.includes('mapillary')) {
              source = getMapillaryId (f.properties.tags.source);
            }
            /*let flickr;
           let flickrAuthor;
          
            if  (f.properties.tags.hasOwnProperty('flickr')){

           const result = await getFlickrJson(f.properties.tags.flickr);
           console.log(result);
           if(result.url !="")
           {
           flickr = result.url;
           flickrAuthor = result.author;
           }

            getFlickrJson(f.properties.tags.flickr).then(data =>{
            console.log(data);
            flickr = data.url;
            flickrAuthor = data.author;
            console.log(data.url);
            });
            }*/
          
         
            // only use image URL if the URL is from wikimedia commons

            let refill;
            if (f.properties.tags.hasOwnProperty(['drinking_water:refill'])) {
              refill = f.properties.tags['drinking_water:refill'];
            } 


           const newProps = {
              name: f.properties.tags.name,
              id_osm: f.properties.id || f.id,
              id_wikidata: f.properties.tags.wikidata,
              image: mediaName,
              mapillary: mapillary,
  
              source : source,
              refill : refill,
            };
         //   console.log(newProps);
            f.properties = newProps;
          }
          // delet the geojson "id" property to save space
          delete f.id;
        });
      
        // return data
        return data;
      }
   
module.exports.standardizeOsm = standardizeOsm ;