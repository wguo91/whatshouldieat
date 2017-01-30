"use strict";
var express = require("express");
var router = express.Router();
var Yelp = require("yelp");

var yelp = new Yelp({
  consumer_key: process.env.YELP_CONSUMER_KEY,
  consumer_secret: process.env.YELP_CONSUMER_SECRET,
  token: process.env.YELP_TOKEN,
  token_secret: process.env.YELP_TOKEN_SECRET
});

const apiKey = process.env.GOOGLE_API_KEY;
const pageTitle = "What should I eat?";
const metersToMiles = 0.000621371;

// Yelp search constants
const limit = 15;
const radiusFilter = 10000;

var _bizList = null;
var _lastSearchTerm = null;

// homepage
router.get("/", function(req, res) {
  _bizList = null;
  res.render("index", {
    title: pageTitle,
    apiKey: apiKey
  });
});

// other pages with no routes will redirect to homepage
router.get("/request*", function(req, res) {
  res.redirect("/");
});

// request search results
router.post("/request/:type", function(req, res) {
  var url, bizInfo, rejectMsg, drinkMsg, msg;
  var userAddress = req.body.address;
  var searchTerm = req.params.type;
  /**
   * CASE 1: _bizList not initialized (user has not begun searching)
   *         OR user requests to search a different term (i.e. drinks or food)
   */
  if(_bizList === null || searchTerm !== _lastSearchTerm) {
    msg = getErrorMsg();
    req.checkBody({
      "address": {
        notEmpty: true,
        errorMessage: msg
      }
    });
    req.getValidationResult().then(function(result) {
      var errors = result.array();
      if(errors.length !== 0) {
        res.render("index", {
          errors: errors[0].msg,
          title: pageTitle,
          apiKey: apiKey
        });
      } else {
        yelp.search({
          term: searchTerm,
          location: userAddress,
          radius_filter: radiusFilter,
          limit: limit
        })
        .then(function(results) {
          _bizList = results.businesses;
          bizInfo = getBizInfo(_bizList);
          rejectMsg = getRejectMsg(bizInfo.categories);
          drinkMsg = getDrinkMsg();
          res.render("map", {
            bizInfo: bizInfo,
            title: pageTitle,
            rejectMsg: rejectMsg,
            drinkMsg: drinkMsg,
            userAddress: userAddress,
            apiKey: apiKey
          });
        })
        .catch(function(err) {
          // if search failed
          req.flash("errors", "Not a valid address, buddy.");
          res.redirect("/");
        });
      }
      _lastSearchTerm = searchTerm;
    });
  /* CASE 2: _bizList initialized but empty (user ran out of options) */
  } else if(_bizList.length === 0) {
    _bizList = null;
    req.flash("errors", "No more choices. Try a different location.");
    res.redirect("/");
  /* CASE 3: _bizList not empty (user searches again) */
  } else {
    bizInfo = getBizInfo(_bizList);
    rejectMsg = getRejectMsg(bizInfo.categories);
    drinkMsg = getDrinkMsg();
    res.render("map", {
      bizInfo: bizInfo,
      title: pageTitle,
      rejectMsg: rejectMsg,
      drinkMsg: drinkMsg,
      userAddress: userAddress,
      apiKey: apiKey
    });
  }
});

/**
 * methods: getBizInfo(), getErrorMsg(), getDrinkMsg(),
 *          getRejectMsg()
 */
function getBizInfo(bizList) {
  var reviews, miles, commentsIdx, comments = [];
  const bizRatingCutoff = 3.5;
  const bizDistanceCutoff = 5000;
  const bizReviewCutoff = 100;
  // choose a business at random
  var bizIdx = Math.floor(Math.random()*(bizList.length));
  var biz = bizList[bizIdx];
  // remove selected biz to prevent the same recommendation from occurring twice
  bizList.splice(bizIdx, 1);
  // get commentary based on certain conditions
  if(biz.review_count > bizReviewCutoff) {
    reviews = Math.floor(biz.review_count/100)*100;
    comments.push("This place has over "+reviews+
      " reviews on Yelp. Just wow.");
  }
  if(biz.rating > bizRatingCutoff) {
    comments.push("This place has a "+biz.rating+
      " star rating on Yelp. Whoa.");
  }
  if(biz.distance < bizDistanceCutoff) {
    // convert to miles and round to the nearest two decimal places
    miles = (biz.distance*metersToMiles).toFixed(2);
    comments.push("You're only "+miles+
      "  miles away from this place. Go now.");
  }
  // default commentary if above criteria not met
  if(comments.length === 0) {
    comments.push("Wait, nevermind. This place sucks.");
  }
  // randomly choose a comment
  commentsIdx = Math.floor(Math.random()*(comments.length));
  // return object containing necessary biz info
  return {
    name: biz.name,
    address: biz.location.display_address[0],
    lat: biz.location.coordinate.latitude,
    lng: biz.location.coordinate.longitude,
    categories: biz.categories,
    comments: comments[commentsIdx],
    url: biz.url,
  };
}
function getErrorMsg() {
  var msgArray = [
    "You have to put in an address.",
    "Bad input, buddy.",
    "Do you want a recommendation or not?",
    "That's not a valid address."
  ];
  return msgArray[Math.floor(Math.random()*(msgArray.length))];
}
function getDrinkMsg() {
  var msgArray = [
    "I'm thirsty.",
    "Can I get a drink?"
  ];
  return msgArray[Math.floor(Math.random()*(msgArray.length))];
}
function getRejectMsg(categories) {
  var idx = Math.floor(Math.random()*(categories.length));
  var category = categories[idx][0].split("(");
  var msgArray = [
    "No, that place is shit.",
    "Skip that shit. Next.",
    "No, I hate " + category[0] + ".",
    "Not into " + category[0] + "."
  ];
  return msgArray[Math.floor(Math.random()*(msgArray.length))];
}
module.exports = router;
