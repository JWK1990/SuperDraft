var coachEmails = document.getElementById("coachEmails");
var positionEntryFields = document.getElementsByClassName("positionEntry");

var rosterSize = document.getElementById("rosterSize");
var rosterSizeOptions = rosterSize.options;
console.log(rosterSizeOptions);

var numOfDefSelect = document.getElementById("numOfDef");
var numOfMidSelect = document.getElementById("numOfMid");
var numOfRucSelect = document.getElementById("numOfRuc");
var numOfFwdSelect = document.getElementById("numOfFwd");
var numOfBenSelect = document.getElementById("numOfBen");

// Define updateCoachFields() function to update the number of coach entry boxes.
function updateCoachFields(){
	// Remove all current labels and input fields.
	while (coachEmails.firstChild) {
	    coachEmails.removeChild(coachEmails.firstChild);
	}

	// Get the currently selected number of coaches.
	var numOfCoaches = document.getElementById("numOfCoaches").value;

	// Create and append a label element.
	var label = document.createElement("label");
	label.for = "coachEmails";
	label.innerHTML = "Invite Teams:";
	coachEmails.appendChild(label);

	// Create and append the required number of input elements.
	for (var i=1; i <= numOfCoaches; i++){
		var input = document.createElement("input");
		input.id = "email";
		input.className = "form-control";
		input.type = "email";
		input.placeholder = "Team #" + i + " Email";
		input.name = "coach" + i;
		console.log(input);
		coachEmails.appendChild(input);
		console.log(coachEmails);
	}
}; // Close updateCoachFields() function.


// Define the showPositionCounts() function to show or hide the manual position boxes based on whether or not the user has selected "Custom".
function showPositionCounts(){
	// If the user has selected "Custom" then the rosterSize.value will be "" so we show the manual position entry fields.
	if(rosterSize.value == ""){
		for(var i=0; i < positionEntryFields.length; i++){
			positionEntryFields[i].style.display = "";
		}
		// Default the manual position count entries to 1.
		numOfDefSelect.value = 1;
		numOfMidSelect.value = 1;
		numOfRucSelect.value = 1;
		numOfFwdSelect.value = 1;
		numOfBenSelect.value = 1;

		// Run updateRosterCount() to update the value of the roster size to the total of all of the selected position counts. 
		updateRosterCount();

		console.log("Def: " + numOfDefSelect.value);
		console.log("Mid: " + numOfMidSelect.value);
		console.log("Ruc: " + numOfRucSelect.value);
		console.log("Fwd: " + numOfFwdSelect.value);
		console.log("Ben: " + numOfBenSelect.value);

	// If the user has selected anything other than "Custom" then hide the fields.
	} else {
		for(var i=0; i < positionEntryFields.length; i++){
			positionEntryFields[i].style.display = "none";
		}

		// Update the value for the "Custom" roster size option to be "" so that the "if(rosterSize.value == "")" part of the function above still works.
		// If we don't update this it will stay at the custom total that we set it to above and then we won't be able to select it properly.
		rosterSizeOptions[8].value = "";

		// Get the currently selected roster options innerHTML, which we then parse to set the number of roster spots in each position below.
		var selectedRosterOption = rosterSizeOptions[rosterSize.selectedIndex].innerHTML;
		console.log("SRO: " + selectedRosterOption);

		// Parse the selected roster options inner html and set the manual positon count values to match the selected values.
		numOfDefSelect.value = Number(selectedRosterOption[12]);
		console.log("Def: " + numOfDefSelect.value);
		numOfMidSelect.value = Number(selectedRosterOption[17]);
		console.log("Mid: " + numOfMidSelect.value);
		numOfRucSelect.value = Number(selectedRosterOption[22]);
		console.log("Ruc: " + numOfRucSelect.value);
		numOfFwdSelect.value = Number(selectedRosterOption[27]);
		console.log("Fwd: " + numOfFwdSelect.value);
		numOfBenSelect.value = Number(selectedRosterOption[32]);
		console.log("Ben: " + numOfBenSelect.value);

		console.log(rosterSize.value);

	}
}; // Close showPositionCounts() function.

// Define the updateRosterCount() function to update the value of the "Custom" roster option to the sum of the manual position counts selected by the user.
function updateRosterCount(){
	var customRosterCount = Number(numOfDefSelect.value) + Number(numOfMidSelect.value) + Number(numOfRucSelect.value) + Number(numOfFwdSelect.value) + Number(numOfBenSelect.value);
	rosterSizeOptions[8].value = customRosterCount;
	console.log("RSV: " + rosterSize.value);
}


// Run updateCoachFields() on page load to make the label and coach fields appear for the default number of coaches.
updateCoachFields();
showPositionCounts();