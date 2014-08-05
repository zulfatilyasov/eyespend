$(function() {
    $('.goUp').click(function() {
        $("body").animate({
            scrollTop: 0
        }, "slow");
    });
    $('.twitter-icon').click(function() {
        alert(123);
    });
});

function goToAppStore() {
    alert('appstore');
}

function shareFacebook() {
    alert('facebook');
}

function shareTwitter() {
    alert('twitter');
}
