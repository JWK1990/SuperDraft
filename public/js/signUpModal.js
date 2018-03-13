// Get the modal
var signupModal = document.getElementById('signupModal');
// Get the modal
var loginModal = document.getElementById('loginModal');
// Get the <span> element that closes the modal
var signupSpan = document.getElementById("signupClose");
// Get the elements with the "click-to-open" class.
var btn = document.getElementsByClassName("click-to-open");
// Get all modal elements.
var allModals = document.getElementsByClassName("modal");
// Get the email button.
var emailButton = document.getElementById("emailButton");
// Get the signupDiv.
var signupDiv = document.getElementById("signupDiv");
// Get the loginDiv.
var loginDiv = document.getElementById("loginDiv");

// Add onclick event to the signupSpan.
signupSpan.onclick = function() {
    signupModal.style.display = "none";
	emailButton.style.backgroundColor = "#417aba";
	emailButton.style.color = "white";
	emailButton.style.border = "#417aba 1px solid";
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
		signupDiv.style.display = "none";
		loginDiv.style.display = "block";
	}, false);
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == signupModal || event.target == loginModal) {
        signupModal.style.display = "none";
        loginModal.style.display = "none";
        emailButton.style.backgroundColor = "#417aba";
		emailButton.style.color = "white";
		emailButton.style.border = "#417aba 1px solid";
    }
}

// If there is a signupError then show the signupModal on page load.
if(document.getElementById("signupError")){
	signupModal.style.display = "block";
}

// If there is a signupError then show the signupModal on page load.
if(document.getElementById("loginError")){
	signupModal.style.display = "block";
}

emailButton.onclick = function(){
	if(signupDiv.style.display == "none"){
		$( "#signupDiv" ).slideDown("slow");
		emailButton.style.backgroundColor = "rgb(44,252,14)";
		emailButton.style.color = "blue";
		emailButton.style.border = "#417aba solid 2px";
	} else {
		$( "#signupDiv" ).slideUp("slow");
		emailButton.style.backgroundColor = "#417aba";
		emailButton.style.color = "white";
		emailButton.style.border = "#417aba 1px solid"
	}
}

var loginLink = document.getElementById("loginLink");

loginLink.onclick = function(){
	$( "#loginDiv" ).slideDown("slow");
	$( "#signupDiv" ).hide();
	emailButton.style.backgroundColor = "#417aba";
	emailButton.style.color = "white";
	emailButton.style.border = "#417aba 1px solid"
};
