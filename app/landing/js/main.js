$(function() {
  $('.goUp').click(function() {
    $("body").animate({
      scrollTop: 0
    }, "slow");
  });
  setTimeout(function() {
    $('.carousel-control').fadeTo("slow", 1);
  }, 1000);

});
