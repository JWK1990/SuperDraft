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


/*
        var $emptyFields = $('#coachEmails :input').filter(function() {
            return $.trim(this.value) === "";
    	})

		console.log($emptyFields.length);
*/


// Define updateCoachFields() function to update the number of coach entry boxes.
function updateCoachFields(){
	// Clear all of the existing coach entry boxes.
	while (coachEmails.firstChild) {
	    coachEmails.removeChild(coachEmails.firstChild);
	}
	// Get the currently selected number of coaches.
	var numOfCoaches = document.getElementById("numOfCoaches").value;
	console.log("NUM OF COACHES: " + numOfCoaches);

	// Create and append a label element.
	var label = document.createElement("label");
	label.for = "coachEmails";
	label.innerHTML = "Invite Teams:";
	coachEmails.appendChild(label);

	// Create and append the required number of input elements.
	for (var i=1; i <= numOfCoaches; i++){
		var input = document.createElement("input");
		input.id = "email";
		input.className = "form-control coachEmail";
		input.type = "email";
		input.placeholder = "Team #" + i + " Email";
		input.name = "coach" + i;
		input.required = true;
		coachEmails.appendChild(input);
	}

}; // Close updateCoachFields() function.


// Define the showPositionCounts() function to show or hide the manual position boxes based on whether or not the user has selected "Custom".
function showPositionCounts(){
	// If the user has selected "Custom" then the rosterSize.value will be "" so we show the manual position entry fields.
	if(rosterSize.value == 9){

		for(var i=0; i < positionEntryFields.length; i++){
			positionEntryFields[i].style.display = "";
		}
		// Default the manual position count entries to 1.
		numOfDefSelect.value = 1;
		numOfMidSelect.value = 1;
		numOfRucSelect.value = 1;
		numOfFwdSelect.value = 1;
		numOfBenSelect.value = 1;

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


// Prevent the form from being submitted and issue an error message if the total number of roster spots is equal to 0.
document.getElementById("submit").addEventListener("click", function(event){
	var rosterCount = Number(numOfDefSelect.value) + Number(numOfMidSelect.value) + Number(numOfRucSelect.value) + Number(numOfFwdSelect.value) + Number(numOfBenSelect.value);

	if(rosterCount == 0){
		// Prevent the submit form from submitting.
   		event.preventDefault();

   		// Create the error div.
   		var errorDiv = document.createElement("div");
   		errorDiv.className = "auth_error";

   		// Append the error div to the topColumn.
   		document.getElementById("topColumn").prepend(errorDiv);

   		// Create the "i" element.
   		var iElement = document.createElement("i");
   		iElement.className = "fa fa-times-circle";
   		iElement.innerHTML = " Total roster size cannot be 0 players!";

   		// Append the "i" element to the errorDiv.
   		errorDiv.append(iElement);

	}
});



function findDuplicateEmails(data) {
    var counts = [];
    for(var i = 0; i <= data.length; i++) {
        if(counts[data[i]] === undefined) {
            counts[data[i]] = 1;
        } else {
            return true;
        }
    }
    return false;
}


// Run updateCoachFields() once the document is loaded to make the label and coach fields appear for the default number of coaches.
// We wait until the document is loaded so that there is time to pass in any existing session data before running the functions.
// We use this session data to repopulate selected options on a page refresh or if there is a page reload after an error.
// These session values are saved at the bottom of this file.
//$(document).ready(function(){
	setTimeout(updateCoachFields, 250);
	setTimeout(showPositionCounts, 250);
//});