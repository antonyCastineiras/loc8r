var express = require('express');
var router = express.Router();
var ctrlOthers = require('../controllers/others');
var ctrlLocations = require('../controllers/locations')

/* Location Pages */
router.get('/', ctrlLocations.homelist)
router.get('/location/:locationid', ctrlLocations.locationInfo)
router.get('/location/:locationid/reviews/new', ctrlLocations.addReview)
router.post('/location/:locationid/reviews/new', ctrlLocations.doAddReview )

/* GET home page. */
router.get('/about', ctrlOthers.about);

module.exports = router;
