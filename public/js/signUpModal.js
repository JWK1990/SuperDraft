// Get the modal
var signupModal = document.getElementById('signupModal');
// Get the modal
var loginModal = document.getElementById('loginModal');
// Get the <span> element that closes the modal
var signupSpan = document.getElementById("signupClose");
// Get the <span> element that closes the modal
var loginSpan = document.getElementById("loginClose");
// Get the elements with the "click-to-open" class.
var btn = document.getElementsByClassName("click-to-open");
// Get all modal elements.
var allModals = document.getElementsByClassName("modal");

// Add onclick event to the signupSpan.
signupSpan.onclick = function() {
    signupModal.style.display = "none";
}

// Add onclick event to the loginSpan.
loginSpan.onclick = function() {
    loginModal.style.display = "none";
}

// Add click event listeners to all elements with the "click-to-open" class.
for (var i = 0; i < btn.length; i++) {
	var thisBtn = btn[i];
	thisBtn.addEventListener("click", function(){
		// When a button is clicked, loop through all modals and undisplay them.
		for(var j = 0; j < allModals.length; j++){
			allModals[j].style.display = "none";
		}
		// Display the modal that corresponds to the clicked button.
		var modal = document.getElementById(this.dataset.modal);
		modal.style.display = "block";
	}, false);
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == signupModal || event.target == loginModal) {
        signupModal.style.display = "none";
        loginModal.style.display = "none";
    }
}

// If there is a signupError then show the signupModal on page load.
if(document.getElementById("signupError")){
	signupModal.style.display = "block";
}

// If there is a signupError then show the signupModal on page load.
if(document.getElementById("loginError")){
	loginModal.style.display = "block";
}
