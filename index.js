'use strict'
const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./data/schema');
const morgan = require('morgan');
const bodyParser = require('body-parser')
const http = require('http')
const request = require('request');
const app = express();

app.use(morgan('combined'));

app.use('/graphql', graphqlHTTP({
	schema: schema,
	graphiql: true
}));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
	extended: false
}));

app.post('/expand_node', function(req, res) {
	var id = req.body.id;
	var min_degree = req.body.min_degree
	var categories = '';
	if (req.body['filter[]']) {
		categories = 'neighbor_types: ['
		var filter = []
		filter = filter.concat(req.body['filter[]'])
		for (var i in filter) {
			categories = categories + filter[i].toUpperCase() + ','
		}
		categories += ']'
	}

	var query = '{ node(id:'+id+', min_degrees:'+min_degree+','+categories+',limit:10){id, degree, attributes,out_neighbors{id, attributes, degree},\
				in_neighbors{id, attributes, degree}}}'
	request('http://picwo.com:2222/graphql?query='+query, function (error, response, body) {
		console.log(body);
	  if (!error && response.statusCode == 200) {
	    res.send(body)
	  }
	})
})

app.listen(3000, () => {
	console.log('Listening on port 3000');
});
