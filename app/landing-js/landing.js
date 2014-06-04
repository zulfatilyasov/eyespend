$(function () {
    $(".back-to-top").on('click', function () {
        $("html, body").animate({ scrollTop: 0 }, "fast");
        return false;
    });

    function setMessage(message) {
        $('#loginError').html(message);
    }

    function validEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function isNumeric(str) {
        return /^[0-9]+$/.test(str);
    }

    var isEmail = false;
    $('#login').click(function () {
        var email = $('#email').val();
        if (!email || isNumeric(email)) {
            $('#password-area').hide();
            isEmail = false;
        }
    });


    $('#email').keyup(function (e) {
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

    $('#loginButton').click(function () {
        var email = $('#email').val();
        isEmail = !isNumeric(email) && validEmail(email);
        if (!email) {
            setMessage('ENTER_CODE_OR_EMAIL');
            return;
        }
        if (email && isEmail && !validEmail(email)) {
            setMessage('INVALID_CODE_OR_EMAIL');
            return;
        }
        var password = $('#password').val();
        if (email && isEmail && !password) {
            setMessage('PASSORD_REQUIRED');
            return;
        }
        var url = isEmail ? '/api/users/login' : '/quickpass';
        var data = isEmail ? {authCodeOrEmail: email, password: password} : {psw: email};

        $.post(url, data)
            .done(function (data) {
                var date = new Date();
                date.setMonth(date.getMonth() + 30);
                console.log(date);
                document.cookie = "isAuthenticated=" + true + "; path=/; expires=" + date.toUTCString();
                localStorage.setItem('ls.token', data.token);
                location.href = '/';
            });
    });
});