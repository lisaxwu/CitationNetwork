'use strict'
const db = require('./db.js');
const graphql = require('graphql');

const NodeType = require('./types/NodeType');
const NodeTypeType = require('./types/NodeTypeType');
const node = {
  type: NodeType,
  args: {
    id: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    },
    neighbor_types: {
      type: new graphql.GraphQLList(NodeTypeType)
    },
    min_degrees: {
      type: graphql.GraphQLInt
    },
    limit: {
      type: graphql.GraphQLInt
    }
  },
  resolve(root, args, _) {
    const session = db.session();
    return session
      .run("match(n) where id(n) = " + args.id + " return n, labels(n) as type")
      .then(function(results) {
        session.close();
        let result = results.records[0];
        let node = {};
        node.attributes = JSON.stringify(result.get("n"));
        node.type = result.get("type")[0];
        node.id = args.id;
        node.args = args;
        return node;
      })
      .catch(function(error) {
        console.log(error);
      });
  },
};

module.exports = node;
