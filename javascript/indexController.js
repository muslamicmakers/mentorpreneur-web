function IndexController() {
	this.locationCSV = "https://docs.google.com/spreadsheets/d/1FhG9DojL9VVpJ49GlX1Mwkf9wXcWx_Y_3W8zeYpWEEQ/export?format=csv";
	this.selectedTags = [];

	this.populateList();
	nunjucks.configure('views', { autoescape: true });
	this.initFilterTags();
}

/************************
 *    POPULATE LIST
 ************************/
IndexController.prototype.populateList = function () {
	var _this = this;
	Papa.parse(this.locationCSV, {
		header: true,
		download: true,
		complete: function (results) {
			_this.buildTableBody(
				document.querySelectorAll('#mentor-list')[0],
				results.data
			);
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


/************************
 *      FILTERING
 ************************/
IndexController.prototype.initFilterTags = function () {
	const filterTagsElement = document.getElementById("filter-tags-list");

	const tags = [
		{ name: "Technology & Tooling", color: "orange", value: "technology & tooling" },
		{ name: "Marketing / Social / PR / Content / Ads", color: "orange", value: "marketing/ social/ pr/ content/ ads" },
		{ name: "Growth", color: "orange", value: "growth" },
		{ name: "Funding / Seeding", color: "orange", value: "funding/ seeding" },
		{ name: "Customer Experience & Design", color: "orange", value: "customer experience & design" },
		{ name: "Business Model / Strategy", color: "orange", value: "business model/strategy" },
		{ name: "Data Based Technology", color: "gold", value: "data based technology" },
		{ name: "Physical Prototyping", color: "gold", value: "physical prototyping" },
		{ name: "Sales / Customer Success / Leads / Pricing", color: "gold", value: "sales/ customer success/ leads/ pricing" },
		{ name: "Legal / Employment / HR", color: "gold", value: "legal (all)/ employment/ hr" },
		{ name: "Finance / Book-keeping / Admin", color: "gold", value: "finance/ book-keeping/ admin" },
		{ name: "Confidence / Pitching / Presenting", color: "gold", value: "confidence/ presenting/ pitching" },
		{ name: "Soft Skills / Management & Team Skills", color: "gold", value: "soft skills/ management &team skills" },
		{ name: "CVs / Career Strategy / Interviews", color: "yellow", value: "cvs/ career strategy/ interviews" },
		{ name: "Branding / Design / Packaging", color: "yellow", value: "branding/ design/ packaging" },
		{ name: "Community / Memberships", color: "yellow", value: "community/ memberships" },
		{ name: "Film / Photography / Sound / Visual", color: "yellow", value: "film/ photography/ sound/ visual" },
		{ name: "Policy / Campaigning / NGOs", color: "yellow", value: "policy/ campaigning/ ngos" }
	]

	filterTagsElement.innerHTML = nunjucks.render('filter-tags-list.html', { tags: tags });

	tags.forEach(tag => {
		document
			.getElementById("tag-" + tag.value)
			.addEventListener(
				'click',
				(event) => {

					if (!event || !event.srcElement || !event.srcElement.innerText) {
						return;
					}

					const sanitized = event.srcElement.innerText.toLowerCase();

					document.getElementById(event.srcElement.id).classList.toggle("selected");

					if (this.selectedTags.indexOf(sanitized) > -1) {
						this.selectedTags = this.selectedTags.filter(t => t.indexOf(sanitized) < 0);
						this.filterTable();
						return;
					}

					this.selectedTags.push(sanitized);
					this.filterTable();
				},
				false
			);
	});
};

IndexController.prototype.filterTable = function () {
	var table = document.getElementById("mentor-list");
	var mentors = table.getElementsByTagName("article");

	if (this.selectedTags.length < 1) {
		for (var i = 0; i < mentors.length; i++) {
			mentors[i].style.display = "";
		}

		return;
	}

	for (var i = 0; i < mentors.length; i++) {

		mentors[i].style.display = "none";

		const specialities = [...mentors[i].querySelector("#specialities-list").getElementsByTagName("span")].map(el => el.innerText);
		
		if (this._matchSpecialities(this.selectedTags, specialities) === true) {
			mentors[i].style.display = "";
			continue;
		}
	}
};

IndexController.prototype._matchSpecialities = (array1, array2) => {

	for (let i = 0; i < array1.length; i++) {
		for (let j = 0; j < array2.length; j++) {

			if (!array1[i] || !array2[j]) {
				return false;
			}

			if (array1[i].toLowerCase() === array2[j].toLowerCase()) {
				return true;
			}
		}
	}

	return false;
}

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
			return { name: "Technology & Tooling", color: "orange", value: "technology & tooling" };
		}

		if (speciality.indexOf("marketing/ social/ pr/ content/ ads") > -1) {
			return { name: "Marketing / Social / PR / Content / Ads", color: "orange", value: "marketing/ social/ pr/ content/ ads" };
		}

		if (speciality.indexOf("growth") > -1) {
			return { name: "Growth", color: "orange", value: "growth" };
		}

		if (speciality.indexOf("funding/ seeding") > -1) {
			return { name: "Funding / Seeding", color: "orange", value: "funding/ seeding" };
		}

		if (speciality.indexOf("customer experience & design") > -1) {
			return { name: "Customer Experience & Design", color: "orange", value: "customer experience & design" };
		}

		if (speciality.indexOf("business model/strategy") > -1) {
			return { name: "Business Model / Strategy", color: "orange", value: "business model/strategy" };
		}

		if (speciality.indexOf("data based technology") > -1) {
			return { name: "Data Based Technology", color: "gold", value: "data based technology" };
		}

		if (speciality.indexOf("physical prototyping") > -1) {
			return { name: "Physical Prototyping", color: "gold", value: "physical prototyping" };
		}

		if (speciality.indexOf("sales/ customer success/ leads/ pricing") > -1) {
			return { name: "Sales / Customer Success / Leads / Pricing", color: "gold", value: "sales/ customer success/ leads/ pricing" };
		}

		if (speciality.indexOf("legal (all)/ employment/ hr") > -1) {
			return { name: "Legal / Employment / HR", color: "gold", value: "legal (all)/ employment/ hr" };
		}

		if (speciality.indexOf("finance/ book-keeping/ admin") > -1) {
			return { name: "Finance / Book-keeping / Admin", color: "gold", value: "finance/ book-keeping/ admin" };
		}

		if (speciality.indexOf("confidence/ presenting/ pitching") > -1) {
			return { name: "Confidence / Pitching / Presenting", color: "gold", value: "confidence/ presenting/ pitching" };
		}

		if (speciality.indexOf("soft skills/ management &team skills") > -1) {
			return { name: "Soft Skills / Management & Team Skills", color: "gold", value: "soft skills/ management &team skills" };
		}

		if (speciality.indexOf("cvs/ career strategy/ interviews") > -1) {
			return { name: "CVs / Career Strategy / Interviews", color: "yellow", value: "cvs/ career strategy/ interviews" };
		}

		if (speciality.indexOf("branding/ design/ packaging") > -1) {
			return { name: "Branding / Design / Packaging", color: "yellow", value: "branding/ design/ packaging" };
		}

		if (speciality.indexOf("community/ memberships") > -1) {
			return { name: "Community / Memberships", color: "yellow", value: "community/ memberships" };
		}

		if (speciality.indexOf("film/ photography/ sound/ visual") > -1) {
			return { name: "Film / Photography / Sound / Visual", color: "yellow", value: "film/ photography/ sound/ visual" };
		}

		if (speciality.indexOf("policy/ campaigning/ ngos") > -1) {
			return { name: "Policy / Campaigning / NGOs", color: "yellow", value: "policy/ campaigning/ ngos" };
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
