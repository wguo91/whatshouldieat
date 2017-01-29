"use strict";
/**
 * methods: initAutocomplete(), geolocate()
 */
window.onload = function() {
  // initializes Google's Places API
  function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
      (document.getElementById("address")), {types: ['geocode']});
  }
  // bias the autocomplete object to the user's geographical location
  function geolocate() {
    // browser supplies navigator.geolocation object
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var circle = new google.maps.Circle({
          center: geolocation,
          radius: position.coords.accuracy
        });
        autocomplete.setBounds(circle.getBounds());
      });
    }
  }
  var autocomplete;
  var address = document.getElementById("address");
  initAutocomplete();
  address.addEventListener("focus", geolocate, false);
};
