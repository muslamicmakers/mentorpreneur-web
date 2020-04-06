function IndexController() {
	this.locationCSV = "https://docs.google.com/spreadsheets/d/1FhG9DojL9VVpJ49GlX1Mwkf9wXcWx_Y_3W8zeYpWEEQ/export?format=csv";

	this.populateTable();
	// this.initTableSearch();
	nunjucks.configure('views', { autoescape: true });
	this.initFilterTags();
}

/************************
 *    POPULATE LIST
 ************************/
IndexController.prototype.populateTable = function () {
	var _this = this;
	Papa.parse(this.locationCSV, {
		header: true,
		download: true,
		complete: function (results) {
			_this.buildTableBody(
				document.querySelectorAll('#mentor-list')[0],
				results.data
			);
			_this.initLinkTracking();
		}
	});
};

/*
 * @todo: Use a templating engine rather than JS
 */
IndexController.prototype.buildTableBody = function (tableBody, mentors) {

	mentors = mentors.map(mentor => {

		if (!mentor["Timestamp"] || !mentor["Timestamp"].length) {
			return null;
		}

		return {
			createdDate: mentor["Timestamp"],
			name: mentor["Name"],
			email: mentor["Email Address"],
			linkedinUrl: mentor["Please provide a link to your professional profile (e.g. LinkedIn)"],
			currentJob: mentor["Current job"],
			bio: mentor["Tell us a little about yourself (Please give a longer description of at least 380 characters)"],
			specialities: this._mapSpecialities(mentor["Please select all of your specialties"]),
			specialitiesOther: mentor["If you have a specialty that wasn't listed please elaborate below."],
			hasPreviouslyMentored: mentor["Have you ever been a mentor in a more formal setting?"],
			preferredFormats: mentor["What format would you like to mentor your mentee?"].split(",")
		}
	})
		.filter(Boolean)
		.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);

	tableBody.innerHTML = nunjucks.render('all-cards.html', { mentors: mentors });
};

IndexController.prototype.initLinkTracking = function () {
	var links = document.getElementsByTagName("a");
	for (var i = 0; i < links.length; i++) {
		links[i].addEventListener(
			'click',
			function (event) {
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
IndexController.prototype.initTableSearch = function () {
	document
		.getElementById("search")
		.addEventListener(
			'keyup',
			this.tableSearch,
			false
		);
};

IndexController.prototype.initFilterTags = function () {
	const filterTags = document.getElementById("filter-tags-list");
	
	filterTags.innerHTML = nunjucks.render('filter-tags-list.html', { tags: ["test", "test2"] });
};

IndexController.prototype.tableSearch = function () {
	var input = document.getElementById("search");
	var filter = input.value.toLowerCase();
	var table = document.getElementById("mentor-list");
	var tr = table.getElementsByTagName("article");

	for (var i = 0; i < tr.length; i++) {

		var td = tr[i].querySelector("#mentor-name");

		if (!td) {
			continue;
		}

		tr[i].style.display = "none";

		const specialities = [...tr[i].querySelector("#specialities-list").getElementsByTagName("span")].map(el => el.innerText);

		var txtValue = td.textContent || td.innerText;

		if (txtValue.toLowerCase().indexOf(filter) > -1) {
			tr[i].style.display = "";
			continue;
		}

		if (specialities.join(" ").toLowerCase().indexOf(filter) > -1) {
			tr[i].style.display = "";
			continue;
		}
	}
};

IndexController.prototype._mapSpecialities = function (string) {

	if (!string) {
		return [];
	}

	let specialities = string.split(",").map(speciality => {
		if (!speciality) {
			return null;
		}

		speciality = speciality.toLowerCase();

		if (speciality.indexOf("technology & tooling") > -1) {
			return { name: "Technology & Tooling", color: "orange" };
		}

		if (speciality.indexOf("marketing/ social/ pr/ content/ ads") > -1) {
			return { name: "Marketing / Social / PR / Content / Ads", color: "orange" };
		}

		if (speciality.indexOf("growth") > -1) {
			return { name: "Growth", color: "orange" };
		}

		if (speciality.indexOf("funding/ seeding") > -1) {
			return { name: "Funding / Seeding", color: "orange" };
		}

		if (speciality.indexOf("customer experience & design") > -1) {
			return { name: "Customer Experience & Design", color: "orange" };
		}

		if (speciality.indexOf("business model/strategy") > -1) {
			return { name: "Business Model / Strategy", color: "orange" };
		}

		if (speciality.indexOf("data based technology") > -1) {
			return { name: "Data Based Technology", color: "gold" };
		}

		if (speciality.indexOf("physical prototyping") > -1) {
			return { name: "Physical Prototyping", color: "gold" };
		}

		if (speciality.indexOf("sales/ customer success/ leads/ pricing") > -1) {
			return { name: "Sales / Customer Success / Leads / Pricing", color: "gold" };
		}

		if (speciality.indexOf("legal (all)/ employment/ hr") > -1) {
			return { name: "Legal / Employment / HR", color: "gold" };
		}

		if (speciality.indexOf("finance/ book-keeping/ admin") > -1) {
			return { name: "Finance / Book-keeping / Admin", color: "gold" };
		}

		if (speciality.indexOf("confidence/ presenting/ pitching") > -1) {
			return { name: "Confidence / Pitching / Presenting", color: "gold" };
		}

		if (speciality.indexOf("soft skills/ management &team skills") > -1) {
			return { name: "Soft Skills / Management & Team Skills", color: "gold" };
		}

		if (speciality.indexOf("cvs/ career strategy/ interviews") > -1) {
			return { name: "CVs / Career Strategy / Interviews", color: "yellow" };
		}

		if (speciality.indexOf("branding/ design/ packaging") > -1) {
			return { name: "Branding / Design / Packaging", color: "yellow" };
		}

		if (speciality.indexOf("community/ memberships") > -1) {
			return { name: "Community / Memberships", color: "yellow" };
		}

		if (speciality.indexOf("film/ photography/ sound/ visual") > -1) {
			return { name: "Film / Photography / Sound / Visual", color: "yellow" };
		}

		if (speciality.indexOf("policy/ campaigning/ ngos") > -1) {
			return { name: "Policy / Campaigning / NGOs", color: "yellow" };
		}

		return null;
	})
		.filter(Boolean);

	return specialities;
};

/************************
 *      INIT
 ************************/
(function () {
	new IndexController();
})();
