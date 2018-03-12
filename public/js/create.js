var myCreate = {
	positionEntryFields: document.getElementsByClassName("positionEntry"),

	rosterSize: document.getElementById("rosterSize"),
	rosterSizeOptions: document.getElementById("rosterSize").options,

	numOfDefSelect: document.getElementById("numOfDef"),
	numOfMidSelect: document.getElementById("numOfMid"),
	numOfRucSelect: document.getElementById("numOfRuc"),
	numOfFwdSelect: document.getElementById("numOfFwd"),
	numOfBenSelect: document.getElementById("numOfBen"),

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
	} // Close showPositionCounts() function.

}; // Close myCreate Namespace.



// Prevent the form from being submitted and issue an error message if the total number of roster spots is equal to 0.
document.getElementById("submit").addEventListener("click", function(event){
	var rosterCount = Number(myCreate.numOfDefSelect.value) + Number(myCreate.numOfMidSelect.value) + Number(myCreate.numOfRucSelect.value) + Number(myCreate.numOfFwdSelect.value) + Number(myCreate.numOfBenSelect.value);
	var errorDiv = document.getElementById("errorDiv");

   	// Clear the error div.
	errorDiv.innerHTML = "";

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

});

// Run updateCoachFields() once the document is loaded to make the label and coach fields appear for the default number of coaches.
// We wait until the document is loaded so that there is time to pass in any existing session data before running the functions.
// We use this session data to repopulate selected options on a page refresh or if there is a page reload after an error.
// These session values are saved at the bottom of this file.
//$(document).ready(function(){
	setTimeout(myCreate.showPositionCounts, 250);
//});