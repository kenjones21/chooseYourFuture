// =============================================================================
// This is a routing file that deals with everything related to the API
// =============================================================================
var router = require('express').Router();
var multiparty = require('multiparty');
//var config = require('../../../config/admin.js');

// Import all models

// GET /api/user return all users
router.get('/emissions_csv', function(req, res, next) {
    console.log("Emissions csv request")
    res.sendFile("./Carbon_Budget.csv", {root: "."})
    console.log("Sent file")
});

router.get('/budget_prob/:temp', function(req, res, next) {
  console.log("Temperature exceedance probability file request")
  res.sendFile("./res/" + req.params.temp, {root: "."})
});

router.get('/smoothed_csv', function(req, res, next) {
    console.log("Smoothed csv request")
    res.sendFile("./res/smoothed.csv", {root: "."})
});

router.get('/comments/:blogPostId', function(req, res, next) {
  Comment.find({blogPostId: req.params.blogPostId}, function(err, comments) {
    if (err) return next(err);
    console.log("Comments: ")
    console.log(comments)
    res.json(comments)
  });
});

module.exports = router;
