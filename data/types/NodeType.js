'use strict'
const graphql = require('graphql');
const ObjectType = graphql.GraphQLObjectType;
const StringType = graphql.GraphQLString;
const IntType = graphql.GraphQLInt;
const NonNull = graphql.GraphQLNonNull;
const ListType = graphql.GraphQLList;
const NodeTypeType = require('./NodeTypeType');
const db = require('../db');

function build_query(id, args) {
    let q = "";
    const limit = 2000;
    if (args && args.neighbor_types && args.min_degrees) {
        q += "--(o2) where id(n) = " + id + " and ( ";
        args.neighbor_types.forEach((type) => {
            q += "labels(o) = '" + type + "' or ";
        });
        q = q.replace(/or\s*$/, "");
        q += " ) with n, o, count(o2) as count limit " + limit;
        q += " where count >= " + args.min_degrees + " return o as attributes, id(o) as id, labels(o) as type";
        return q;
    } else if (args && args.neighbor_types) {
        q += " and ( ";
        args.neighbor_types.forEach((type) => {
            q += "labels(o) = '" + type + "' or ";
        });
        q = q.replace(/or\s*$/, "");
        q += " )";
        return " where id(n) = " + id + q + " return o as attributes, id(o) as id, labels(o) as type";
    } else if (args && args.min_degrees) {
        q += "--(o2) where id(n) = " + id + " with n, o, count(o2) as count limit " + limit;
        q += " where count >= " + args.min_degrees + " return o as attributes, id(o) as id, labels(o) as type";
        return q;
    }
    return " where id(n) = " + id + " return o as attributes, id(o) as id, labels(o) as type limit " + (args.limit ? args.limit : 1000);
}

const NodeType = new ObjectType({
    name: 'Node',
    fields: () => ({
        id: {
            type: new NonNull(IntType)
        },
        type: {
            type: new NonNull(NodeTypeType)
        },
        attributes: {
            type: StringType
        },
        degree: {
            type: new NonNull(IntType),
            resolve: (node) => {
                const session = db.session();
                return session.run("match(n)--(o) where id(n) = " + node.id + " return count(o) as count")
                    .then((result) => {
                        session.close();
                        return result.records[0].get("count");
                    });
            }
        },
        in_neighbors: {
            type: new ListType(NodeType),
            resolve: (root, args) => {
                const session = db.session();
                return session.run("match(n)<--(o)" + build_query(root.id, root.args))
                    .then((results) => {
                        session.close();
                        let nodes = [];
                        results.records.forEach((result) => {
                            let node = {};
                            node.attributes = JSON.stringify(result.get("attributes"));
                            node.id = result.get("id");
                            node.type = result.get("type")[0];
                            node.args = root.args;
                            nodes.push(node);
                        });
                        return nodes;
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            }
        },
        out_neighbors: {
            type: new ListType(NodeType),
            resolve: (root, args) => {
                const session = db.session();
                return session.run("match(n)-->(o)" + build_query(root.id, root.args))
                    .then((results) => {
                        session.close();
                        let nodes = [];
                        results.records.forEach((result) => {
                            let node = {};
                            node.attributes = JSON.stringify(result.get("attributes"));
                            node.id = result.get("id");
                            node.type = result.get("type")[0];
                            node.args = root.args;
                            nodes.push(node);
                        });
                        return nodes;
                    }).catch(function(error) {
                        console.log(error);
                    });
            }
        },
    })
});

module.exports = NodeType;
