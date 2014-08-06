var isEmail = false;
$(function() {
    $('.goUp').click(function() {
        $("body").animate({
            scrollTop: 0
        }, "slow");
    });
    $('.twitter-icon').click(function() {
        alert(123);
    });

    $('#password-area').hide();

    $('#email').keyup(function(e) {
        var code = e.keyCode || e.which;
        if (code === 9)
            return;
        var email = $('#email').val();
        if (!email || isNumeric(email)) {
            $('#password-area').hide(300);
            isEmail = false;
        }
        if (email && !isNumeric(email)) {
            $('#password-area').show(300);
            isEmail = true;
        }
    });
});

function setMessage(message) {
    $('#loginError').text(message);
}

function validEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function isNumeric(str) {
    return /^[0-9]+$/.test(str);
}

function goToAppStore() {
    alert('appstore');
}

function shareFacebook() {
    alert('facebook');
}

function shareTwitter() {
    alert('twitter');
}
