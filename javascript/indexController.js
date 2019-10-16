function IndexController() {
  this.locationCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAFOpil_7wi0vIL3bki50rWRHbAJQ3pE7q_dbqDsXOz8OGX0O-HpErZJls7LTJaMzs4MAbvBwBf81s/pub?gid=905377423&single=true&output=csv";
  this.populateTable();
  this.initTableSearch();
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
      var body = _this.buildTableBody(results.data);
      document.querySelectorAll('#location-list tbody')[0].outerHTML = body;
      _this.initLinkTracking();
    }
  });
};

/*
 * @todo: Use a templating engine rather than JS
 */
IndexController.prototype.buildTableBody = function(data) {
  var body = '<tbody class="govuk-table__body">';
  for(var i = 0; i < data.length; i++)
  {
    var _data = data[i];
    if (!_data["Timestamp"].length && _data['Approved'] !== "TRUE") {
      continue;
    }

    var googleMapsURL = 'http://maps.google.com/?q='+ [
      _data['Address line 1'],
      _data['Address line 2'],
      _data['Town / City'],
      _data['County'],
      _data['Postcode']
    ].join(', ');

    body += '<tr class="govuk-table__row">';
      /* LOCATION DETAILS */
      body += '<td class="govuk-table__cell">';
        // organisation name
        body += '<a href="' + googleMapsURL + '" target="_blank" class="govuk-link"><h3 class="govuk-heading-s govuk-!-margin-top-3">' + _data['Organisation name(s)'] + '</h3></a>';

        // address
        body +=  _data['Address line 1'] + '<br/>';
        if( _data['Address line 2'] ) body += _data['Address line 2'] + ', ';
        if( _data['Town / City'] ) body += _data['Town / City'] + ', ';
        if( _data['County'] ) body += _data['County'] + ', ';
        body += '<br/>' + _data['Postcode'];

        // room location
        body += '<p class="govuk-body govuk-!-margin-top-5"><strong>Room location: </strong>'
            + _data['Where is the multi faith room located in the building? (For example 6th floor, opposite meeting room 612)']
          + '</p>';

        // notes
        if( _data['Any notes or things to be aware of?'] )
          body += '<p class="govuk-body"><strong>Notes: </strong>' + _data['Any notes or things to be aware of?'] + '</p>';

        // date added
        body += '<p class="govuk-body"><strong>Date added: </strong>' + _data['Timestamp'] + '</p>';

        // build the google maps query
        body += '<p class="govuk-body govuk-!-margin-top-5"><a class="govuk-link" href="'+ googleMapsURL +'" target="_blank">View on Google Maps</a></p>';
      body += '</td>';
    body += '</tr>';
  }

  // when no results
  if (!data.length){
    body += '<tr class="govuk-table__row">';
      body += '<td class="govuk-table__cell" colspan="9">No data found</td>';
    body += '</tr>'
  }

  body += '</tbody>';
  return body;
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
