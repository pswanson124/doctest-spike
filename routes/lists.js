"use strict"
let assert = require('assert');
let ListSvc = require('../svc/listSvc');
let express = require('express');
let router = express.Router();

var chance = require("chance").Chance();

let listSvc = new ListSvc();


router.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  // res.header("Access-Control-Allow-Methods", "*");
  // res.headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  //console.info("added COR");
  //console.log(Date.now

  // This is a hack until I get some authentication.
  req.userName = 'Paul';

  next();
 });

/* GET users listing. */
router.get('/', function(req, res, next) {
   listSvc.getLists(req.userName).then( results => {
      res.json(results);
   })
});


router.get('/:name/definition', function(req, res, next) {
  let name = req.params.name;
  assert(name, "Name was not passed into the router get method.");
  listSvc.getListDefinition(req.userName, name)
  .then(results => {
    res.json(results);
  })
  .catch(results => {
    res.json(results);
  })
});

router.post('/update', function(req, res, next) {
  let list = req.body;
  listSvc.updateList(req.userName, list)
    .then ( results =>  {
      res.json(results);
    });
});

router.post('/:name/definition', function(req, res, next) {
  let name = req.params.name;
  assert(name, "Name was not passed into the router get method.");
  let obj = req.body;
  console.info(name);
  listSvc.updateListDefinition(req.userName, name, obj)
    .then(results => {
      res.json(results);
    })
    .catch(results => {
      res.json(results);
    });
});

router.get('/:name', function(req, res, next) {
  let name = req.params.name;
  assert(name, "Name was not passed into the router get method.");
  let page = req.query.page || 0;
  let pageSize = req.query.pagesize || 10;
  let filter = unescape(req.query.filter || null);
  let sort = req.query.sort || 'id';
  //console.log(JSON.parse(filter));
  let listFilter = {};
  try {
    //console.info(filter);
    if(filter)  {
      // filter ='companyName like','aa%'
      listFilter = parseFilter(filter); //JSON.parse(filter);
      console.info(listFilter);
    }
  } catch(ex) {
    console.error(ex);
  }
  let descIndex = sort.indexOf(' desc');
  let direction = '';
  if(descIndex > 0) {
    sort = sort.substring(0, descIndex);
    direction = ' desc';
  }
  let options = {
    limit: pageSize,
    offset: page * pageSize,
    colSort : sort,
    direction: direction
  }
  listSvc.getListData(req.userName, name, listFilter, options, function (err, results ) {
    if(err) {
      res.status(401);
      res.send(err);
      return;
    }

    res.json( results );
  });
});

function parseFilter(filter) {
  let rc = {}
  let multiple = filter.split(';;;');
  multiple.forEach( f => {
    let parts = f.split(',');
    if(parts.length === 2)  {
      rc[parts[0]] = '%' + parts[1] + '%';
      return rc; //{ parts[0]: parts[1] }
    } else {
      console.error("filter not applied ["+f+"]");
    }
  });
  return rc;
}

router.get('/:name/:id', function(req, res, next) {
  let name = req.params.name,
    id = req.params.id;
  assert(name, "Name was not passed into the router get method.");
  listSvc.getListDataById(req.userName, name, id, function (err, results ) {
    res.json( results );
  });
});

router.post('/:name/save', function(req, res, next) {
   let name = req.params.name;
   assert(name, "Name was not passed into the router get method.");
   let obj = req.body;
   console.log(obj);
   listSvc.saveListEntry(req.userName, name, obj)
   .then(results => {
      res.json(results);
   })
   .catch( ex => {
     res.status(401);
     res.send(ex);
   });
});

router.delete('/:name/:id', function(req, res, next) {
  let name = req.params.name,
    id = req.params.id;
  assert(name, "Name was not passed into the router delete method.");
  listSvc.deleteListDataById(req.userName, name, id, function (err, results ) {
    res.json( results );
  });
});

router.get('/:name/testData', function(req, res, next) {
   let name = req.params.name;
   assert(name, "Name was not passed into the router get method.");
   let records = [];
   for(let i=0; i < 1000; i++)   {
      let obj = {
         firstName:chance.company(),
         lastName:chance.last(),
         email:chance.email(),
         field1:chance.guid(),
         field2:chance.zip(),
         field3:chance.guid(),
         field4:chance.guid(),
         field5:chance.guid(),
         field6:chance.guid(),
         field7:chance.guid()
      }
      records.push(obj);
   }
   listSvc.saveListBatch(req.userName, name, records).then(results => {
      res.json(results);
   });

});

router.get('/:name/testData2', function(req, res, next) {
   let name = req.params.name;
   assert(name, "Name was not passed into the router get method.");
   let records = [];
   for(let i=0; i < 1000; i++)   {
      let obj = {
         companyName:chance.name(),
         address1:chance.address(),
         address2:chance.address(),
         address3:chance.address(),
         state:chance.state(),
         zipcode:chance.zip()
      }
      records.push(obj);
   }
   listSvc.saveListBatch(req.userName, name, records).then(results => {
      res.json(results);
   });

});


module.exports = router;
