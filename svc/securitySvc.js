"use strict"
let massiveConnect = require('../config/massiveConnect');
let Promise = require('bluebird');
let moment = require('moment');

let db = null;

// massiveConnect.then( mdb => {
//    db = mdb;
//    listsFind = Promise.promisify( db.list.find, {context:db.list});
//    run = Promise.promisify(db.run, {context:db});
//    saveDoc = Promise.promisify(db.saveDoc, {context:db});
//    saveList = Promise.promisify(db.list.save, {context:db.list});
//    //destroyDoc = Promise.promisify(db.destroy, {context:db});
//    saveFieldDefinition = Promise.promisify(db.listfields.save, {context:db.listfields});
//    deleteFieldDefinition = Promise.promisify(db.listfields.destroy, {context:db.listfields});
// });
//
// class list  {
//
//   getLists() {
//     return listsFind({}).then(results => {
//        return results;
//     });
//   }
//
//   getListDefinition(name) {
//     //console.log("definition");
//     let sql = "select lf.* from list l inner join listFields lf on l.id = lf.listId where l.name=$1 order by sort";
//     return run(sql, [name]). then (results => {
//        return results;
//     });
//   }
//
//   saveListDefinition ( item ) {
//     //console.log(item);
//     if(item.hasOwnProperty('deleted')) {
//       delete item.deleted;
//       return deleteFieldDefinition(item);
//     } else {
//       return saveFieldDefinition(item);
//     }
//   }
//
//   updateList( list )  {
//     return saveList(list)
//       .then( results => {
//         if(!list.id)  {
//           saveDoc('list_'+list.name, {})
//             .then(record => {
//               this.deleteListDataById(list.name, record.id);
//             });
//         }
//         return results;
//       });
//   }
//
//   updateListDefinition (item){
//     let results = [];
//     console.log('item is array ' + Array.isArray(item));
//     if(Array.isArray(item)) {
//       return Promise.all(item.map(e => {
//         this.saveListDefinition(e);
//       }))
//       .then( result => result)
//       .catch(ex => {
//         console.log(ex);
//       });
//     }
//
//     // let deleted = item.hasOwnProperty('deleted');
//     // if(deleted) delete item.deleted;
//     // return (deleted ? deleteFieldDefinition(item) : saveFieldDefinition(item))
//     this.saveListDefinition(item)
//     .then( result => result)
//     .catch(ex => {
//       console.log(ex);
//     });
//   }
//
//   getListData(name, filter, options, callback) {
//     // var i = Date.now();
//     // console.log(Date.now() + " First db call " + i);
//     this.getListDefinition(name).then(definition => {
//        if(options.colSort)  {
//          if(options.colSort === 'id') {
//            options.order = 'id';
//          } else {
//            let castType = '';
//            let colType = definition.filter( m => {
//              return m.name === options.colSort;
//            })
//            if(colType.length){
//              castType = this.castAs(colType[0].datatype);
//            }
//            options.order = "(body->>'" + options.colSort + "')" + castType + options.direction + " nulls last";
//          }
//        }
//        db['list_'+name].findDoc(filter, options, function(err, results) {
//           let rc = [];
//           if(err) {
//              console.log(err);
//           }else {
//              //console.log(results);
//              results.forEach(item => {
//                 let body = item;//.body;
//                 body.id = item.id;
//                 definition.forEach(field => {
//                    if(!body[field.name])   {
//                       body[field.name] = null;
//                    }
//                 });
//                 rc.push(body);
//              });
//           }
//           let list = { list : rc, def : definition };
//           //console.log(list);
//           // console.log(Date.now() + " returning " + i);
//           callback(err, list);
//        });
//     });
//   }
//
//   getListDataById(name, id, callback) {
//     this.getListDefinition(name).then(definition => {
//
//        db['list_'+name].find({id : id}, function(err, results) {
//           let rc = [];
//           results.forEach(item => {
//              let body = item.body;
//              body.id = item.id;
//              definition.forEach(field => {
//                 if(!body[field.name])   {
//                    body[field.name] = null;
//                 }
//              });
//              rc.push(body);
//           });
//           let items = { list : rc, def : definition };
//           callback(err, items);
//        });
//     });
//   }
//
//   saveListBatch(name, items ) {
//     let results = [];
//     let self = this;
//     return Promise.each(items, function(item) {
//        return self.saveListEntry( 'list_'+name, item).then(obj => {
//           results.push(obj);
//           return obj
//        });
//     }).then( function (data) {
//        console.log(data);
//        return results;
//     });
//   }
//
//   saveListEntry(name, item) {
//     return this.getListDefinition(name).then( def => {
//        let obj = {}
//        if(item.id) {
//           obj.id = item.id;
//        }
//        def.forEach( field => {
//           if(item[field.name]) {
//             switch (field.datatype) {
//               case "INTEGER":
//                 obj[field.name] = parseInt(item[field.name]);
//                 break;
//               case "FLOAT":
//                 obj[field.name] = parseFloat(item[field.name]);
//                 break;
//               case "BOOL":
//                 obj[field.name] = item[field.name]==0;
//                 break;
//               case "DATE":
//                 let dt = moment(item[field.name], 'DD-MMM-YYYY');
//                 //Date.parse(item[field.name]);
//                 obj[field.name] = dt.format('DD-MMM-YYYY');
//                 break;
//               default:
//                 obj[field.name] = item[field.name];
//                 break;
//             }
//
//           }
//        });
//
//        return obj;
//     }).then( obj => {
//        return saveDoc('list_'+name, obj);
//     });
//   }
//
//   deleteListDataById(name, id, callback) {
//     db['list_'+name].destroy( {id:id}, callback );
//   }
//
//   castAs(type)  {
//     console.info(type);
//     switch (type) {
//       case 'DATE':
//         return '::date';
//         break;
//       default:
//         return "";
//     }
//   }
// }
//
// module.exports = list;
