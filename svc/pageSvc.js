"use strict"

let massiveConnect = require('../config/massiveConnect');
let Promise = require('bluebird');
let db = null,
   pageFind = null,
   saveDoc = null;

massiveConnect.then( mdb => {
    db = mdb;
    pageFind = Promise.promisify( db.page.findDoc, {context:db.page});
    saveDoc = Promise.promisify(db.saveDoc, {context:db});
});



class Pages {
   getPages() {
      // Get all pages in app
      return pageFind({}).then(results => {
         return results;
      });
   }


   getPageData(name, callback) {

      pageFind({name:name}, function(err, results) {
         let rc = null;
         if(results.length < 1)  {
            rc = null;
         } else {
            rc = results[0];
         }
         callback(err, rc);
      });
   }

   savePage( page ) {
      return saveDoc('page', page).then(results => {
         return results;
      });
      ;
   }
}

module.exports = Pages;
