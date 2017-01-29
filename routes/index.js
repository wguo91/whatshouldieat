"use strict";
var express = require("express");
var router = express.Router();
var Yelp = require("yelp");

// set up Yelp
var yelp = new Yelp({
  consumer_key: process.env.YELP_CONSUMER_KEY,
  consumer_secret: process.env.YELP_CONSUMER_SECRET,
  token: process.env.YELP_TOKEN,
  token_secret: process.env.YELP_TOKEN_SECRET
});

const conversionConstant = 0.000621371;
var _bizList = null;
var _lastType = null;

router.get("/", function(req, res) {
  res.render("index", {title: "What should I eat?"});
  _bizList = null;
});
router.get("/request*", function(req, res) {
  res.redirect("/");
});
router.post("/request/:type", function(req, res) {
  var url, bizInfo, rejectionMsg;
  var address = req.body.address;
  var currentType = req.params.type;
  // _bizList not initialized
  if(_bizList === null || currentType !== _lastType) {
    let msg = generateErrorMsg();
    // validation
    req.checkBody({
      "address": {
        notEmpty: true,
        errorMessage: msg
      }
    });
    req.getValidationResult().then(function(result) {
      var errors = result.array();
      if(errors.length != 0) {
        res.render("index", {
          errors: errors[0].msg,
          title: "What should I eat?"
        });
      } else {
        // set up HTTP request to Yelp API
        yelp.search({
          term: currentType,
          location: address,
          radius_filter: 10000,
          limit: 10
        })
        .then(function(searchResults) {
          _bizList = searchResults.businesses;
          bizInfo = generateBizInfo(_bizList);
          rejectionMsg = generateRejectionMsg(bizInfo.categories);
          res.render("map", {
            bizInfo: bizInfo,
            title: "What should I eat?",
            rejectionMsg: rejectionMsg,
            myAddress: address
          });
        })
        .catch(function(err) {
          console.error(err);
        });
      }
      _lastType = currentType;
    });
  // _bizList initialized but empty
  } else if(_bizList.length === 0) {
    _bizList = null;
    req.flash("errors", "No more fucking choices. Try a different location.");
    res.redirect("/");
  // _bizList not empty
  } else {
    bizInfo = generateBizInfo(_bizList);
    rejectionMsg = generateRejectionMsg(bizInfo.categories);
    res.render("map", {
      bizInfo: bizInfo,
      title: "What should I eat?",
      rejectionMsg: rejectionMsg,
      myAddress: address
    });
  }
});

function generateBizInfo(bizList) {
  var idx = Math.floor(Math.random()*(bizList.length));
  var biz = bizList[idx];
  // remove biz from array to prevent the same recommendation
  bizList.splice(idx, 1);
  // convert distance to miles
  var commentary = [];
  // generate commentary
  if(biz.review_count > 100) {
    let reviews = Math.floor(biz.review_count / 50) * 50;
    commentary.push("The place has over " + reviews + " fucking reviews!");
  }
  if(biz.rating > 3.5) {
    commentary.push("The place has a fucking  " + biz.rating + " star rating!");
  }
  if(biz.distance < 5000) {
    var miles = biz.distance * conversionConstant;
    commentary.push("This place is only a fucking " + miles.toFixed(2) + " miles away!");
  }
  var commentaryIdx = Math.floor(Math.random()*(commentary.length));
  if(commentary.length === 0) {
    commentary.push("Wait, nevermind. This place sucks.");
  }
  return {
    name: biz.name,
    address: biz.location.display_address[0],
    lat: biz.location.coordinate.latitude,
    lng: biz.location.coordinate.longitude,
    categories: biz.categories,
    url: biz.url,
    commentary: commentary[commentaryIdx]
  };
}
function generateErrorMsg() {
  var msgArray = [
    "You have to put in an address.",
    "Bad input, buddy.",
    "Do you want a recommendation or not?",
    "That's not a valid address."
  ];
  return msgArray[Math.floor(Math.random()*(msgArray.length))];
}
function generateRejectionMsg(categories) {
  var idx = Math.floor(Math.random()*(categories.length));
  var category = categories[idx][0].split("(");
  var msgArray = [
    "No, that place is shit.",
    "No, I hate " + category[0] + ".",
    "Not into " + category[0] + "."
  ];
  return msgArray[Math.floor(Math.random()*(msgArray.length))];
}
module.exports = router;
