'use strict'
const db = require('./db.js');
const graphql = require('graphql');

const NodeType = require('./types/NodeType');
const NodeTypeType = require('./types/NodeTypeType');
const paper = {
  type: NodeType,
  args: {
    doi: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    },
    neighbor_types: {
      type: new graphql.GraphQLList(NodeTypeType)
    },
    min_degrees: {
      type: graphql.GraphQLInt
    }
  },
  resolve(root, args, _) {
    const session = db.session();
    return session
      .run("match(p:Paper) where p.doi = {doi} return p, id(p) as id", {
        doi: args.doi
      })
      .then(function(results) {
        session.close();
        let paper = {};
        paper.attributes = JSON.stringify(results.records[0].get("p"));
        paper.id = results.records[0].get("id");
        paper.args = args;
        paper.type = "Paper";
        return paper;
      })
      .catch(function(error) {
        console.log(error);
      });
  },
};

module.exports = paper;
