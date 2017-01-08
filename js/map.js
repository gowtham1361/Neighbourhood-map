
// These are some of the locations of bangalore that will be shown to the user.
var locations = [{
        title: 'The Forum',
        location: {
            lat: 12.934545,
            lng: 77.611308
        }
    },
    {
        title: 'MTR Hotel',
        location: {
            lat: 12.955155,
            lng: 77.585466
        }
    },
    {
        title: ' Truffles',
        location: {
            lat: 12.971856,
            lng: 77.60095
        }
    },
    {
        title: 'The Leela Palace',
        location: {
            lat: 12.960146,
            lng: 77.648496
        }
    },
    {
        title: 'Sri Sagar (Formerly CTR)',
        location: {
            lat: 12.998344,
            lng: 77.569722
        }
    },
    {
        title: 'Barbeque Nation',
        location: {
            lat: 12.925531,
            lng: 77.637103
        }
    },
    {
        title: 'M Chinnaswamy Stadium',
        location: {
            lat: 12.97883,
            lng: 77.599615
        }
    },
    {
        title: ' UB city',
        location: {
            lat: 12.971508,
            lng: 77.596409
        }
    },
];

//foursquare api credentials
var four_squareApi = {
    ID: 'JEKKICPOXJXLKTOYHA535NWKZK35SI31G2ILXD42IU0ETRPM',
    SECRET: '5UKJWXIY44IKDUVU43WK4VYXBKXNRHKNVTMLYQAB0IDOD3DP'
};


var map;

// Create a new blank array for all the listing markers.
//var markers = [];

//Here i have used the code from GOOGLE MAPS APIS/Window shopping part 1 for displaying the map and the markers and infowindow.

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7413549,
            lng: -73.9980244
        },
        zoom: 13
    });


    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();


    // The following group uses the locations array to create marker attribute for each location on initialize.

    for (var i = 0; i < locations.length; i++) {

        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the marker to our array of locations.
        //changed to use the locations array to have a marker attribute for each location here
        locations[i].marker = marker;
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });
        marker.addListener('click', function() {
            toggleBounce(this);
        });
        bounds.extend(locations[i].location); //change here
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
    //Activate Knockout here because we need the google object it provides.
    ko.applyBindings(new ViewModel);
}

//error handling function for map
function mapFail() {
    alert("oops! looks like google is busy :)) try again later ");
    $("#map").text(' something wrong with the map ,inconvenience regretted try again later');
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    //using the ajax request here to be able to add infowindow content when any location is clicked from the list or the marker.
    //using the id of the marker to access the corresponding location element.
    var index = marker.id;
    var location = locations[index];
    var phoneNo;
    var url = 'https://api.foursquare.com/v2/venues/search?' + 'll=' + locations[index].location.lat + ',' + locations[index].location.lng + '&client_id=' + four_squareApi.ID + '&client_secret=' + four_squareApi.SECRET + '&v=20131016';

    $.getJSON(url, function(data) {
        //storing the  phone number in phoneNo variable
        phoneNo = data.response.venues[0].contact.phone;
        infowindow.setContent('<div>' + '<b>' + marker.title + '</b>' + '</div>' +
            '<div>' + 'phone: ' + phoneNo + '</div>' +
            '<div>' + 'powered by ' + '<b>' + ' Foursquare' + '</b>' + '</div>');
    }).fail(function(err) {
        infowindow.setContent('<div>' + marker.title + '</div>' +
            '<div>' + ' failed to access foursquare :(' + '</div>' +
            '<div>' + 'powered by' + '<b>' + ' ' + ' Foursquare' + '</b>' + '</div>');
    });
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
    }
}


//adding bounce functionality to the marker when clicked.
// code obtained from https://developers.google.com/maps/documentation/javascript/examples/marker-animations
function toggleBounce(marker) {

    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        //to make the bouncing stop after a few ms
        setTimeout(function() {
            marker.setAnimation(null);
        }, 2100);
    }
}

//Location constructor similar to Cat constructor
var Location = function(locationData, id) {

    this.title = locationData.title;
    this.lat = locationData.location.lat;
    this.lng = locationData.location.lng;
    this.marker = locationData.marker;
    this.id = id;
};


// Constructor
// Function expression
var ViewModel = function() {

    var self = this;
    self.locationsList = ko.observableArray([]);
    //using the Location constructor similar to the Cat constructor  in adding more cats video and pushing to the locationList array
    //using the i value to give id's to the locations
    locations.forEach(function(item, i) {
        self.locationsList.push(new Location(item, i));
    });

    // setting up a observable to  be notified by the  input search box.
    self.inputItem = ko.observable('');
    //used live search code from http://opensoul.org/2011/06/23/live-search-with-knockoutjs/
    self.searchFilter = function(value) {
        //remove all the location from the list
        self.locationsList.removeAll();
        //now we need to add the filtering
        //here the locations is the hardcoded list on top of map.js
        for (var y in locations) {
            //add the logic finding whether the indexof() returns a matching value in the looplist array.
            if (locations[y].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                //pushing the matching locations to the self.locationsList ko.observableArray.
                self.locationsList.push(locations[y]);
            }
        }

    };

    //add marker filtering here
    //similar to the searchFilter function
    self.markerFilterfn = function(value) {

        for (var x in locations) {
            //set map for markers as null
            if (locations[x].marker.setMap(map) !== null) {
                locations[x].marker.setMap(null);
            }
            if (locations[x].marker.title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                //setMap to map for the markers filtered
                locations[x].marker.setMap(map);
            }
        }
    };

    //adding the displayInfoBounce function when the list is clicked
    //use the id of the clickedItem to access the corresponding marker and trigger the click event for the corresponding marker
    self.displayInfoBounce = function(clickedItem) {

        var index = clickedItem.id;
        //var marker = markers[index];
        var marker = clickedItem.marker;
        google.maps.event.trigger(marker, 'click');
        // google.maps.trigger(markers[clickedItem.id], 'click');
    };
    self.inputItem.subscribe(self.searchFilter);
    self.inputItem.subscribe(self.markerFilterfn);

};