$(function () {
    var code = parseInt(getParameterByName('code'));
    if (code) {
        $.get('/api/getTokenFromCode', {code: code})
            .done(function (data) {
                if (data.token) {
                    setAthenticated(data.token);
                    location.href = '/';
                }
            });
    }

    var translations = translationsRu;
    $.ajax({
        url: "http://ajaxhttpheaders.appspot.com",
        dataType: 'jsonp',
        success: function (headers) {
            language = headers['Accept-Language'];
            console.log(language);
            translations = language.indexOf('ru-RU') >= 0 ? translationsRu : translationsEn;
        }
    });

    $(".back-to-top").on('click', function () {
        $("html, body").animate({ scrollTop: 0 }, "fast");
        return false;
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

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function setAthenticated(token) {
        var now = new Date();
        var yearAfterNow = new Date(new Date(now).setMonth(now.getMonth()+12));
        document.cookie = "isAuthenticated=" + true + "; path=/; expires=" + yearAfterNow.toUTCString();
        localStorage.setItem('ls.token', token);
    }

    $('#loginButton').click(function () {
        var email = $('#email').val();
        isEmail = !isNumeric(email);
        if (!email) {
            setMessage(translations['ENTER_CODE_OR_EMAIL']);
            return;
        }
        if (email && isEmail && !validEmail(email)) {
            setMessage(translations['INVALID_CODE_OR_EMAIL']);
            return;
        }
        var password = $('#password').val();
        if (email && isEmail && !password) {
            setMessage(translations['PASSORD_REQUIRED']);
            return;
        }
        var url = '/api/users/login';
        var data = {auth_code_or_email: email, password: password};

        $.post(url, data)
            .done(function (data) {
                setAthenticated(data.token);
                location.href = '/';
            });
    });
});
