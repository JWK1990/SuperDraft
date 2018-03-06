var myCreate = {
	coachEmails: document.getElementById("coachEmails"),
	positionEntryFields: document.getElementsByClassName("positionEntry"),

	rosterSize: document.getElementById("rosterSize"),
	rosterSizeOptions: document.getElementById("rosterSize").options,

	numOfDefSelect: document.getElementById("numOfDef"),
	numOfMidSelect: document.getElementById("numOfMid"),
	numOfRucSelect: document.getElementById("numOfRuc"),
	numOfFwdSelect: document.getElementById("numOfFwd"),
	numOfBenSelect: document.getElementById("numOfBen"),

	// Define updateCoachFields() function to update the number of coach entry boxes.
	updateCoachFields: function(){
		// Clear all of the existing coach entry boxes.
		while (myCreate.coachEmails.firstChild) {
		    myCreate.coachEmails.removeChild(myCreate.coachEmails.firstChild);
		}
		// Get the currently selected number of coaches.
		var numOfCoaches = document.getElementById("numOfCoaches").value;
		// Create and append a label element.
		var label = document.createElement("label");
		label.for = "coachEmails";
		label.innerHTML = "Invite Teams:";
		myCreate.coachEmails.appendChild(label);
		// Create and append the coachesDiv element.
		var coachesDiv = document.createElement("div");
		coachesDiv.style.position = "relative";
		myCreate.coachEmails.appendChild(coachesDiv);

		// Create and append the admin coaches input element.
		var input = document.createElement("input");
		input.id = "coachEmail1";
		input.className = "form-control coachEmail";
		input.type = "email";
		input.placeholder = "Your Email";
		input.name = "coach" + 1;
		input.required = true;
		input.value = document.getElementById("currentUserEmail").innerHTML;
		input.style.paddingLeft = "65px";
		input.readOnly = true;
		coachesDiv.appendChild(input);

		var adminLabel = document.createElement("label");
		adminLabel.className = "static-value";
		adminLabel.innerHTML = "Admin: ";
		coachesDiv.appendChild(adminLabel);

		// Create and append the required number of input elements.
		for (var i=2; i <= numOfCoaches; i++){
			var input = document.createElement("input");
			input.id = "coachEmail" + i;
			input.className = "form-control coachEmail";
			input.type = "email";
			input.placeholder = "Team #" + i + " Email";
			input.name = "coach" + i;
			input.required = true;
			coachesDiv.appendChild(input);
		}
	}, // Close updateCoachFields() function.

	showPositionCounts: function(){
	// Define the showPositionCounts() function to show or hide the manual position boxes based on whether or not the user has selected "Custom".
		// If the user has selected "Custom" then the rosterSize.value will be "" so we show the manual position entry fields.
		if(myCreate.rosterSize.value == 9){
			for(var i=0; i < myCreate.positionEntryFields.length; i++){
				myCreate.positionEntryFields[i].style.display = "";
			}
			// Default the manual position count entries to 1.
			myCreate.numOfDefSelect.value = 1;
			myCreate.numOfMidSelect.value = 1;
			myCreate.numOfRucSelect.value = 1;
			myCreate.numOfFwdSelect.value = 1;
			myCreate.numOfBenSelect.value = 1;
		// If the user has selected anything other than "Custom" then hide the fields.
		} else {
			for(var i=0; i < myCreate.positionEntryFields.length; i++){
				myCreate.positionEntryFields[i].style.display = "none";
			}
			// Get the currently selected roster options innerHTML, which we then parse to set the number of roster spots in each position below.
			var selectedRosterOption = myCreate.rosterSizeOptions[myCreate.rosterSize.selectedIndex].innerHTML;
			// Parse the selected roster options inner html and set the manual positon count values to match the selected values.
			myCreate.numOfDefSelect.value = Number(selectedRosterOption[12]);
			myCreate.numOfMidSelect.value = Number(selectedRosterOption[17]);
			myCreate.numOfRucSelect.value = Number(selectedRosterOption[22]);
			myCreate.numOfFwdSelect.value = Number(selectedRosterOption[27]);
			myCreate.numOfBenSelect.value = Number(selectedRosterOption[32]);
		}
	}, // Close showPositionCounts() function.

	findDuplicateEmails: function(data){
	    var counts = [];
	    for(var i = 0; i <= data.length; i++) {
	        if(counts[data[i]] === undefined) {
	            counts[data[i]] = 1;
	        } else {
	            return true;
	        }
	    }
	    return false;
	} // Close findDuplicateEmails() function.


}; // Close myCreate Namespace.



// Prevent the form from being submitted and issue an error message if the total number of roster spots is equal to 0.
document.getElementById("submit").addEventListener("click", function(event){
	var rosterCount = Number(myCreate.numOfDefSelect.value) + Number(myCreate.numOfMidSelect.value) + Number(myCreate.numOfRucSelect.value) + Number(myCreate.numOfFwdSelect.value) + Number(myCreate.numOfBenSelect.value);
	var numOfCoaches = document.getElementById("numOfCoaches").value;
	var errorDiv = document.getElementById("errorDiv");

   	// Clear the error div.
	errorDiv.innerHTML = "";

	// Build and sort the coachesArray.
	var coachesArray = [];
	for (var i=0; i < numOfCoaches; i++){
		var id = "coachEmail" + Number(i + 1);
		console.log(id);
		coachesArray.push(document.getElementById(id).value.toUpperCase());
	};
	coachesArray.sort();


	// Check if the total rosterCount is 0 and if so prevent submission of the form.
	if(rosterCount == 0){
		// Prevent the submit form from submitting.
   		event.preventDefault();
   		// Show the error div.
   		errorDiv.style.display = "";
   		// Create the "i" element.
   		var iElement = document.createElement("i");
   		iElement.className = "fa fa-times-circle";
   		iElement.innerHTML = " Total roster size cannot be 0 players!";
   		// Append the "i" element to the errorDiv.
   		errorDiv.append(iElement);
   		// Scroll the window to the top.
   		window.scrollTo(0,0);
	}

	console.log("COACHES ARRAY!");
	console.log(coachesArray);

	// Check if there are any duplicate coaches and if so prevent submission of the form.
	for (var i = 0; i < coachesArray.length - 1; i++) {
		if (coachesArray[i] == ""){
		    // Prevent the submit form from submitting.
	   		event.preventDefault();
	   		// Show the error div.
   			errorDiv.style.display = "";
	   		// Create the "i" element.
	   		var iElement = document.createElement("i");
	   		iElement.className = "fa fa-times-circle";
	   		iElement.innerHTML = " All Team Emails must be complete!";
	   		// Append the "i" element to the errorDiv.
	   		errorDiv.append(iElement);
	   		// Scroll the window to the top.
   			window.scrollTo(0,0);
	   		return;

		} else if (coachesArray[i + 1] == coachesArray[i]) {
		    // Prevent the submit form from submitting.
	   		event.preventDefault();
	   		// Show the error div.
   			errorDiv.style.display = "";
	   		// Create the "i" element.
	   		var iElement = document.createElement("i");
	   		iElement.className = "fa fa-times-circle";
	   		iElement.innerHTML = " All Team Emails must be unique!";
	   		// Append the "i" element to the errorDiv.
	   		errorDiv.append(iElement);
	   		// Scroll the window to the top.
   			window.scrollTo(0,0);
	   		return;
		}
	};
});

// Run updateCoachFields() once the document is loaded to make the label and coach fields appear for the default number of coaches.
// We wait until the document is loaded so that there is time to pass in any existing session data before running the functions.
// We use this session data to repopulate selected options on a page refresh or if there is a page reload after an error.
// These session values are saved at the bottom of this file.
//$(document).ready(function(){
	setTimeout(myCreate.updateCoachFields, 250);
	setTimeout(myCreate.showPositionCounts, 250);
//});