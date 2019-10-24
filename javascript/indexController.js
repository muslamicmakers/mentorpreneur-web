function IndexController() {
  this.locationCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAFOpil_7wi0vIL3bki50rWRHbAJQ3pE7q_dbqDsXOz8OGX0O-HpErZJls7LTJaMzs4MAbvBwBf81s/pub?gid=905377423&single=true&output=csv";
  this.populateTable();
  this.initTableSearch();
  nunjucks.configure('views', { autoescape: true });
}

/************************
 *    POPULATE LIST
 ************************/
IndexController.prototype.populateTable = function() {
  var _this = this;
  Papa.parse(this.locationCSV, {
    header: true,
    download: true,
    complete: function(results) {
      _this.buildTableBody(
        document.querySelectorAll('#location-list tbody')[0],
        results.data
      );
      _this.initLinkTracking();
    }
  });
};

/*
 * @todo: Use a templating engine rather than JS
 */
IndexController.prototype.buildTableBody = function(tableBody, rooms) {
  rooms = rooms.map(function(room){
    if (!room["Timestamp"] || !room["Timestamp"].length || room['Approved'] !== "TRUE") {
      return null;
    }

    // transformData
    return {
      createdAt:          room["Timestamp"],
      organisationName:   room['Organisation name(s)'],
      addressLine1:       room['Address line 1'],
      addressLine2:       room['Address line 2'],
      city:               room['Town / City'],
      county:             room['County'],
      postcode:           room['Postcode'],
      location:           room['Where is the multi faith room located in the building? (For example 6th floor, opposite meeting room 612)'],
      notes:              room['Any notes or things to be aware of?'],
      googleMapsURL:      'http://maps.google.com/?q='+ [
                            room.addressLine1,
                            room.addressLine2,
                            room.city,
                            room.county,
                            room.postcode
                          ].join(', ')
    };
  }).filter( Boolean );

  tableBody.innerHTML = nunjucks.render('table-rows.html', { rooms: rooms });
};

IndexController.prototype.initLinkTracking = function() {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener(
      'click',
      function(event){
        if (window._analytics) {
          window._analytics.trackEvent("linkClicked", event.target.innerText, event.target.href);
        }
      },
      false
    );
  }
};

/************************
 *      SEARCH
 ************************/
IndexController.prototype.initTableSearch = function(){
  document
    .getElementById("table-search")
    .addEventListener(
      'keyup',
      this.tableSearch,
      false
    );
};

IndexController.prototype.tableSearch = function(){
  var input = document.getElementById("table-search");
  var filter = input.value.toUpperCase();
  var table = document.getElementById("location-list");
  var tr = table.getElementsByTagName("tr");
  for (var i = 0; i < tr.length; i++) {
    var td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      var txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
};

/************************
 *      INIT
 ************************/
(function(){
  new IndexController();
})();
