"use strict"
let assert = require('assert');
let FileSvc = require('../svc/fileSvc');
let express = require('express');
let router = express.Router();

let fileSvc = new FileSvc();


router.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  // res.header("Access-Control-Allow-Methods", "*");
  // res.headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  //console.info("added COR");
  next();
 });

/* GET users listing. */
router.get('/:id', function(req, res, next) {
   let id = req.params.id;
   console.log(id);
   fileSvc.getById(id).then(file => {
          res.contentType(file.type);
          res.end(file.file);
      // res.json(file);
   });
});

router.post('/save', function (req, res, next) {
   let body = req.body;
   let file = { name:body.name }
   file.type = body.file.split(";")[0].split(":")[1];
   file.file = new Buffer(body.file.split(";")[1].split(",")[1], 'base64');
   fileSvc.saveFile( file );
   res.json(file);
});


let download = function (data, filename, mimetype, res) {
    res.writeHead(200, {
        'Content-Type': mimetype,
        'Content-disposition': 'attachment;filename=' + filename,
        'Content-Length': data.length
    });
    res.end(new Buffer(data, 'binary'));
};
// router.get('/:name/definition', function(req, res, next) {
//    let name = req.params.name;
//    assert(name, "Name was not passed into the router get method.");
//    listSvc.getListDefinition(name).then(results => {
//       res.json(results);
//    })
// });


// router.get('/:name', function(req, res, next) {
//    let name = req.params.name;
//    assert(name, "Name was not passed into the router get method.");
//    let page = req.query.page || 0;
//    let pageSize = req.query.pagesize || 10;
//    let filter = req.query.filter || null;
//    //console.log(JSON.parse(filter));
//    let listFilter = {};
//    try {
//       if(filter)  {
//          listFilter = JSON.parse(filter);
//       }
//    } catch(ex) {
//       console.error(ex);
//    }
//    let options = {
//       limit: pageSize,
//       offset: page * pageSize,
//    }
//    listSvc.getListData(name, listFilter, options, function (err, results ) {
//       res.json( { list: results } );
//    });
// });

// router.get('/:name/:id', function(req, res, next) {
//
//    let name = req.params.name,
//       id = req.params.id;
//    assert(name, "Name was not passed into the router get method.");
//    listSvc.getListDataById(name, id, function (err, results ) {
//       res.json( { list: results } );
//    });
// });

// router.get('/:name/save', function(req, res, next) {
//    let name = req.params.name;
//    assert(name, "Name was not passed into the router get method.");
//    let obj = { id:1, firstName:'Paul' + Date.now(), lastName:'Swanson' + Date.now()}
//    listSvc.saveListEntry(name, obj).then(results => {
//       res.json(results);
//    })
// });

// router.get('/:name/testData', function(req, res, next) {
//    let name = req.params.name;
//    assert(name, "Name was not passed into the router get method.");
//    let records = [];
//    for(let i=0; i < 1000; i++)   {
//       let obj = {
//          firstName:chance.company(),
//          lastName:chance.last(),
//          email:chance.email(),
//          field1:chance.guid(),
//          field2:chance.zip(),
//          field3:chance.guid(),
//          field4:chance.guid(),
//          field5:chance.guid(),
//          field6:chance.guid(),
//          field7:chance.guid()
//       }
//       records.push(obj);
//    }
//    listSvc.saveListBatch(name, records).then(results => {
//       res.json(results);
//    });
//
// });

// router.get('/:name/testData2', function(req, res, next) {
//    let name = req.params.name;
//    assert(name, "Name was not passed into the router get method.");
//    let records = [];
//    for(let i=0; i < 1000; i++)   {
//       let obj = {
//          companyName:chance.name(),
//          address1:chance.address(),
//          address2:chance.address(),
//          address3:chance.address(),
//          state:chance.state(),
//          zipcode:chance.zip()
//       }
//       records.push(obj);
//    }
//    listSvc.saveListBatch(name, records).then(results => {
//       res.json(results);
//    });
//
// });


module.exports = router;
