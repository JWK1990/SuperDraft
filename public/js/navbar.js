
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