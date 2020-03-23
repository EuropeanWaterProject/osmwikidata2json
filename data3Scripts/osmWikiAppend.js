
var fs = require('fs');
let _ = require('lodash');


// function to pause execution after promise error on data fetching from OSM or Wikidata. Probably 429 or 505 
function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
      now = Date.now();
    }
}

//function to pad codes 4 digits to allow -180 to +180
Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
  }

// dimension of one grid rectangle
var bbox_grid_dimension = {
    lonDim : 5,
    latDim : 5
}

// dimension of total grid to be scanned must be a multiple of bbox_grid_dimension
//longitude is EW, latitude is NS
//cell size 5x5, grid 9x8 and left corner -10,35
var total_grid_size = {
    num_grid_lon : 72,
    num_grid_lat : 35
}

//botton corner of total grid
//bottom left -10 35 by 5x5
var bottom_left = {
    lonMin : -180,
    latMin : -90
}
//first grid rectangle - bottom left
var start_bbox = {
    lonMin: bottom_left.lonMin,
    latMin: bottom_left.latMin,
    lonMax: bottom_left.lonMin + bbox_grid_dimension.lonDim,
    latMax: bottom_left.latMin+ bbox_grid_dimension.latDim
};

// define as an object for indexing
var current_bbox = {};

//define counter variables 
//problem with 4 6
//stopped at 8 4 
var i = 0;
var j = 0;

//define intial box for first pass . Direct assignment caused problems. need to learn new or instance ... 
current_bbox.lonMin = start_bbox.lonMin + (bbox_grid_dimension.lonDim * i);
current_bbox.latMin = start_bbox.latMin + (bbox_grid_dimension.latDim *j) ;
current_bbox.lonMax= start_bbox.lonMax + (bbox_grid_dimension.lonDim * i);
current_bbox.latMax = start_bbox.latMax + (bbox_grid_dimension.latDim *j);

fullJson = [];
emptyfiles =0;
//main loop function call until grid completed
function generateGrid(){
      
       // filename = '../data/osmFountainData/temp_'+current_bbox.lonMin.pad(4)+'_'+current_bbox.latMin.pad(4)+'_'+current_bbox.lonMax.pad(4)+'_'+current_bbox.latMax.pad(4)+'.json';
        filename = '../data/fountainGridTest/fullgrid2_'+current_bbox.lonMin.pad(4)+'_'+current_bbox.latMin.pad(4)+'_'+current_bbox.lonMax.pad(4)+'_'+current_bbox.latMax.pad(4)+'.json';
        fs.readFile(filename, 'utf8', (err, jsonNewRaw) => {  
        //console.log(jsonNewRaw);
        console.log (filename); // for debugging
       var json1 = JSON.parse(jsonNewRaw);
      //  var json1 = jsonNewRaw;
        //console.log("Json Features " + json1.features);
    
        // conflate data
        fullJson =  _.concat(json1.features,fullJson)
       //  console.log('filename '+ filename); // for debugging
        //here we have to recalculate the data
        if (j == total_grid_size.num_grid_lat)
        {
            i++;
            j=0;

        } else
        {
            j++;
        }  
        if (i == total_grid_size.num_grid_lon)
       {
           fs.writeFile('../data/fountainGridTest/full_conflated.json', ' { "type": "FeatureCollection", "features":' + JSON.stringify(fullJson, null, 2) + '}', 'utf8', ()=>{console.log('writtenFullJson')});
        
           return;
       }
       current_bbox.lonMin = start_bbox.lonMin + (bbox_grid_dimension.lonDim * i);
       current_bbox.latMin = start_bbox.latMin + (bbox_grid_dimension.latDim *j) ;
       current_bbox.lonMax= start_bbox.lonMax + (bbox_grid_dimension.lonDim * i);
       current_bbox.latMax = start_bbox.latMax + (bbox_grid_dimension.latDim *j);
     
       //call function to generate next grid cell
       wait(20);
       generateGrid();
       
        });


           // write data to file
    
        }

//call function to create the full grid
generateGrid();

exports.generateGrid = generateGrid;