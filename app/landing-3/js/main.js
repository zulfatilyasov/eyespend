'use strict';
$(function() {
    var code = parseInt(getParameterByName('code'));
    if (code) {
        $.post('/api/users/login', {
                auth_code: code
            })
            .done(function(data) {
                if (data.token) {
                    setAthenticated(data.token);
                    location.reload(true);
                }
            });
    }
    var isEmail = false;


    var translations = translationsRu;
    // $.ajax({
    //     url: 'http://ajaxhttpheaders.appspot.com',
    //     dataType: 'jsonp',
    //     success: function (headers) {
    //         language = headers['Accept-Language'];
    //         translations = language.indexOf('ru-RU') >= 0 ? translationsRu : translationsEn;
    //     }
    // });

    $('#login').click(function() {
        if (!$('#email').val())
            $('#password-area').hide();
            $('.forgot').hide();
    });

    $('.md-modal').keypress(function(e) {
        if (e.which == 13) {
            authenticate();
        }
    });

    $('.close-btn').click(function() {
        setTimeout(function() {
            showLogin();
        }, 600);
    });

    $('#email').keyup(function(e) {
        var code = e.keyCode || e.which;
        if (code === 9)
            return;

        var email = $('#email').val();

        if (!email || isNumeric(email)) {
            $('#password-area').hide();
            $('.forgot').hide();
            isEmail = false;
        }

        if (email && !isNumeric(email)) {
            $('#password-area').show();
            $('.forgot').show();
            isEmail = true;
        }
    });

    $('#loginButton').click(function() {
        authenticate();
    });

    function authenticate() {
        var email = $('#email').val();
        isEmail = !isNumeric(email);

        if (!email) {
            setMessage(translations.ENTER_CODE_OR_EMAIL);
            $('#email-area').addClass('error');
            return;
        }

        if (email && isEmail && !validEmail(email)) {
            $('#email-area').addClass('error');
            setMessage(translations.INVALID_CODE_OR_EMAIL);
            return;
        }

        var password = $('#password').val();

        if (email && isEmail && !password) {
            setMessage(translations.PASSORD_REQUIRED);
            $('#password-area').addClass('error');
            return;
        }

        var url = '/api/users/login';

        var data = {
            auth_code_or_email: email,
            password: password
        };

        $.post(url, data)
            .done(function(data) {
                setAthenticated(data.token);
                location.reload(true);
            })
            .fail(function(data) {
                if (data && data.responseJSON && data.responseJSON.error && data.responseJSON.error.code) {
                    if (data.responseJSON.error.code === 'subscription_required') {
                        showInstruction();
                    }
                } else {
                    $('#email-area').addClass('error');
                    $('#password-area').addClass('error');
                    setMessage(translations.INVALID_CODE_OR_EMAIL);
                }
            });
    }

    setTimeout(function() {
        $('.carousel-control').fadeTo('slow', 1);
    }, 800);

});

function showInstruction() {
    $('.md-modal').addClass('instruction');
    $('.login-widget').hide();
    $('.instruction-widget').show();
}

function showLogin() {
    $('.md-modal').removeClass('instruction');
    $('.login-widget').show();
    $('.instruction-widget').hide();
}

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
    window.open('https://itunes.apple.com/ru/app/eyespend/id608344707', '_blank');
}

function shareFacebook() {
    window.open('https://www.facebook.com/eyespnd', '_blank');
}

function shareTwitter() {
    window.open('https://twitter.com/eyeSpend_RU/', '_blank');
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function setAthenticated(token) {
    var now = new Date();
    var yearAfterNow = new Date(new Date(now).setMonth(now.getMonth() + 12));
    document.cookie = 'isAuthenticated=' + true + '; path=/; expires=' + yearAfterNow.toUTCString();
    localStorage.setItem('ls.token', token);
}
