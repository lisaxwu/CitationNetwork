'use strict'
const graphql = require('graphql'); // CommonJS

var NodeTypeType = new graphql.GraphQLEnumType({
	name: 'NodeType',
	values: {
		PAPER: {
			value: 'Paper'
		},
		FIELD: {
			value: 'Field'
		},
		AUTHOR: {
			value: 'Author'
		},
		CONFERENCE: {
			value: 'Conference'
		},
		JOURNAL: {
			value: 'Journal'
		}
	}
});
module.exports = NodeTypeType;