const graphql = require('graphql'); 
const paper = require('./paper');
const node = require('./node');
const schema = new graphql.GraphQLSchema({
     query: new graphql.GraphQLObjectType({
         name: 'Query',
         fields: {
            paper,
            node 
         }
     })
});

module.exports = schema;
