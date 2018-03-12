
// Function that sets the navbar to appear and dissapear when the window is scrolled below 40px.
$(window).scroll(
    function () {
    var currentTop = $(window).scrollTop();
    if (currentTop < 40) {
        $(".navbar").fadeIn(200);
    } else {
        $(".navbar").fadeOut(200);
    }
});

$(document).ready(function () {
  $(".navbar-nav a").click(function(event) {
    $(".navbar-nav.collapse").collapse('hide');
  });
});