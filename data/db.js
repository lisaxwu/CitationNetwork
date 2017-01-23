const neo4j = require('neo4j-driver');

var v1 = neo4j.v1;
const db = v1.driver('bolt://localhost:7687/', v1.auth.basic('neo4j', '1hghK0COavMeA8'), {
  encrypted: true
});
module.exports = db;

