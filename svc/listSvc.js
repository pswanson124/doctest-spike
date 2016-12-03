"use strict"
let massiveConnect = require('../config/massiveConnect');
let Promise = require('bluebird');
let moment = require('moment');

let db = null;
let listsFind = null;
let run = null;
let saveDoc = null
let saveList = null
let saveFieldDefinition = null;
let deleteFieldDefinition = null;
let checkSecurityAccess = null

massiveConnect.then( mdb => {
   db = mdb;
   listsFind = Promise.promisify( db.list.find, {context:db.list});
   run = Promise.promisify(db.run, {context:db});
   saveDoc = Promise.promisify(db.saveDoc, {context:db});
   saveList = Promise.promisify(db.list.save, {context:db.list});
   //destroyDoc = Promise.promisify(db.destroy, {context:db});
   saveFieldDefinition = Promise.promisify(db.listfields.save, {context:db.listfields});
   deleteFieldDefinition = Promise.promisify(db.listfields.destroy, {context:db.listfields});

   checkSecurityAccess = Promise.promisify(db.list_checkAccess, {context:db});
});

class list  {

  getLists() {
    return listsFind({}).then(results => {
       return results;
    });
  }

  checkUserAccess(userName, listName) {
    // Check that the user has access to the list.
    return checkSecurityAccess([userName, listName]).then(results => {
      //console.info( results )
      if(results.length === 0)
        return 0;
      return results[0].access_level;
    });
  }

  getListDefinition(userName, listName) {
    return this.checkUserAccess(userName, listName)
      .then( access => {
        if(access < 1)  {
          console.info("rejecting " + userName + ' ' +  listName);
          return Promise.reject("No Access to " + listName);
        }
        //console.log("definition");
        let sql = "select lf.* from list l inner join listFields lf on l.id = lf.listId where l.name=$1 order by sort";
        return run(sql, [listName]). then (results => {
           return results;
        });
      });
  }

  saveListDefinition ( userName, listName, item ) {
    listName = listName.toLowerCase();
    return this.checkUserAccess(userName, listName)
      .then(access => {
        if(access > 2)  {
          //console.log(item);
          if(item.hasOwnProperty('deleted')) {
            delete item.deleted;
            return deleteFieldDefinition(item);
          } else {
            return saveFieldDefinition(item);
          }
        } else {
          Promise.reject("Access denied for " + listName);
        }

      })
  }

  updateList( userName, list )  {
    return saveList(list)
      .then( results => {
        if(!list.id)  {
          saveDoc('list_'+list.name, {})
            .then(record => {
              this.deleteListDataById(list.name, record.id);
            });
        }
        return results;
      });
  }

  updateListDefinition (userName, listName, item){
    listName = listName.toLowerCase();
    let results = [];
    console.log('item is array ' + Array.isArray(item));
    if(Array.isArray(item)) {
      return Promise.all(item.map(e => {
        this.saveListDefinition(userName, listName, e);
      }))
      .then( result => result)
      .catch(ex => {
        console.log(ex);
      });
    }

    // let deleted = item.hasOwnProperty('deleted');
    // if(deleted) delete item.deleted;
    // return (deleted ? deleteFieldDefinition(item) : saveFieldDefinition(item))
    this.saveListDefinition(userName, listName, item)
    .then( result => result)
    .catch(ex => {
      console.log(ex);
    });
  }

  getListData(userName, listName, filter, options, callback) {
    listName = listName.toLowerCase();
    // var i = Date.now();
    // console.log(Date.now() + " First db call " + i);
    this.getListDefinition(userName, listName)
      .then(definition => {
        if(options && options.colSort)  {
          if(options.colSort === 'id') {
            options.order = 'id';
          } else {
            let castType = '';
            let colType = definition.filter( m => {
              return m.name === options.colSort;
            })
            if(colType.length){
              castType = this.castAs(colType[0].datatype);
            }
            options.order = "(body->>'" + options.colSort + "')" + castType + options.direction + " nulls last";
          }
        }
        db['list_'+listName].findDoc(filter, options, function(err, res) {
          let rc = [];
          let results = [];
          if(err) {
            console.log(err);
          } else {
            if(Array.isArray(res))  {
              results = res;
            } else {
              results.push(res);
            }
            //console.log(results);
            results.forEach(item => {
              let body = item;//.body;
              body.id = item.id;
              definition.forEach(field => {
                if(!body[field.name])   {
                  body[field.name] = null;
                }
              });
              rc.push(body);
            });
          }
          let list = { list : rc, def : definition };
          //console.log(list);
          // console.log(Date.now() + " returning " + i);
          callback(err, list);
        });
    })
    .catch( ex => {
      callback(ex, null);
    });
  }

  getListDataById(userName, listName, id, callback) {
    listName = listName.toLowerCase();
    this.getListDefinition(userName, listName).then(definition => {

       db['list_'+listName].find({id : id}, function(err, results) {
          let rc = [];
          results.forEach(item => {
             let body = item.body;
             body.id = item.id;
             definition.forEach(field => {
                if(!body[field.name])   {
                   body[field.name] = null;
                }
             });
             rc.push(body);
          });
          let items = { list : rc, def : definition };
          callback(err, items);
       });
    });
  }

  saveListBatch(userName, listName, items ) {
    listName = listName.toLowerCase();
    let results = [];
    let self = this;
    return Promise.each(items, item => {
       return self.saveListEntry( userName, listName, item).then(obj => {
          results.push(obj);
          return obj
       });
    }).then( data => {
       //console.log(results);
       return results;
    });
  }

  saveListEntry(userName, listName, item) {
    listName = listName.toLowerCase();
    return this.getListDefinition(userName, listName).then( def => {
      let obj = {}
      if(item.id) {
        obj.id = item.id;
      }
      def.forEach( field => {
        if(item[field.name]) {
          switch (field.datatype) {
            case "INTEGER":
              obj[field.name] = parseInt(item[field.name]);
              break;
            case "FLOAT":
              obj[field.name] = parseFloat(item[field.name]);
              break;
            case "BOOL":
              obj[field.name] = item[field.name]==0;
              break;
            case "DATE":
              let dt = moment(item[field.name], 'DD-MMM-YYYY');
              //Date.parse(item[field.name]);
              obj[field.name] = dt.format('DD-MMM-YYYY');
              break;
            default:
              obj[field.name] = item[field.name];
              break;
          }
        }
      });
      return obj;
    }).then( obj => {
      return saveDoc('list_'+listName, obj);
    });
  }

  deleteListDataById(userName, listName, id, callback) {
    listName = listName.toLowerCase();
    this.checkUserAccess(userName, listName)
      .then(results => {
        if(results < 2 )  {
          return Promise.reject("No Access");
        }
        db['list_'+listName].destroy( {id:id}, callback );

      })
  }

  castAs(type)  {
    console.info(type);
    switch (type) {
      case 'DATE':
        return '::date';
        break;
      default:
        return "";
    }
  }
}

module.exports = list;
