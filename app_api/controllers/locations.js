var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var theEarth = (function() {
	var earthRadius = 6371;

	var getDistanceFromRads = function(rads) {
		return parseFloat(rads * earthRadius)
	};

	var getRadsFromDistance = function(distance) {
		return parseFloat(distance / earthRadius)
	};

	return {
		getDistanceFromRads: getDistanceFromRads,
		getRadsFromDistance: getRadsFromDistance
	};
})();

var sendJsonResponse = function(res, status, content) {
	res.status(status);
	res.json(content);
}

var locationFromParams = function(reqBody) {
	return {
		name: reqBody.name,
		address: reqBody.address,
		facilities: reqBody.facilities,
		coords: [parseFloat(reqBody.lng), parseFloat(reqBody.lat)],
		openingTimes: [{
			days: reqBody.days1,
			opening: reqBody.opening1,
			closing: reqBody.closing1,
			closed: reqBody.closed1
		}, {
			days: reqBody.days2,
			opening: reqBody.opening2,
			closing: reqBody.closing2,
			closed: reqBody.closed2
		}]
	};
}

// INDEX
module.exports.locationsListByDistance = function(req, res) {
	var lng = parseFloat(req.query.lng);
	var lat = parseFloat(req.query.lat);
	var maxDistance = theEarth.getRadsFromDistance(req.query.maxDistance)
	var point = {
		type: "Point",
		coordinates: [lng, lat]
	};
	var geoOptions = {
		spherical: true,
		maxDistance: 2000000,
		limit: 10
	};

	if ( !lng || !lat ) {
		sendJsonResponse(res, 404, { "message": "lattiude and longitude query parameters are requried"});
		return;
	}  

	Loc.geoNear(point, geoOptions, function(err, results, stats) {
		var locations = [];
		if(err) {
			sendJsonResponse(res, 404, err);
		} else {
			for (result in results) {
				locations.push(results[result])
			}
			sendJsonResponse(res, 200, locations);
		}
	});
}
// CREATE
module.exports.locationsCreate = function(req, res) {
	console.log(req.body)
	Loc.create( locationFromParams(req.body), function(err, location) {
		if(err) {
			sendJsonResponse(res, 400, err)
		} else {
			sendJsonResponse(res, 201, location)
		}
	})
}
// READ
module.exports.locationsReadOne = function(req, res) {
	if(req.params && req.params.locationid) {
		Loc.findById(req.params.locationid).exec(function(err, location){
			if(!location) {
				sendJsonResponse(res, 404, { "message": "locationid not found" });
				return;
			} else if(err) {
				sendJsonResponse(res, 404, err);
				return;
			} 
			sendJsonResponse(res, 200, location);
		});
	} else {
		sendJsonResponse(res, 404, { "message": "No locationid in request"});
	}
}
// UPDATE
module.exports.locationsUpdateOne = function(req, res) {
	console.log(req.body)
	if(!req.params.locationid) {
		sendJsonResponse(res, 404, { "message" : "Not found, locationid is required" });
		return;
	}
	Loc.findById(req.params.locationid).select('-reviews -rating').exec(function(err, location) {
		if(!location) {
			sendJsonResponse(res, 404, { "message" : "locationid not found" });
			return;
		} else if(err) {
			sendJsonResponse(res, 400, err);
			return;
		}
		location.name = req.body.name;
		location.address = req.body.address;
		location.facilities = req.body.facilities.split(", ");
		location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
		location.openingTimes = [{
			days: req.body.days1,
			opening: req.body.opening1,
			closing: req.body.closing1,
			closed: req.body.closed1
		},{
			days: req.body.days2,
			opening: req.body.opening2,
			closing: req.body.closing2,
			closed: req.body.closed2
		}];
		location.save(function(err, location) {
			if(err) {
				sendJsonResponse(res, 404, err);
			} else {
				sendJsonResponse(res, 200, location);
			}
		})
	})
}
// DELETE
module.exports.locationsDeleteOne = function(req, res) {
	var locationid = req.params.locationid;
	if(locationid) {
		Loc.findByIdAndRemove(locationid).exec(function(err, location) {
			if(err) {
				sendJsonResponse(res, 404, err);
				return;
			} else {
				sendJsonResponse(res, 204, null);
			}
		});
	} else {
		sendJsonResponse(res, 404, { "message" : "No locationid"});
	}
}


