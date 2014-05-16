'use strict';

var res = require('../../app/translations.js');
var pages = require('../e2e/pages.js');

var loginPage = new pages.Login();
var menu = new pages.Menu();
var content = new pages.Content();

function logout() {
    menu.logout.click();
    expect(loginPage.header()).toBe(res.ru.ENTER_CODE_OR_EMAIL);
}

describe('login page', function () {
    browser.get('#/');

    it('should automatically redirect to /login', function () {
        expect(browser.getLocationAbsUrl()).toMatch(/\/login/);
        expect(loginPage.header()).toBe(res.ru.ENTER_CODE_OR_EMAIL);
    });

    it('should show error on empty email', function () {
        loginPage.setCodeOrEmail('');
        loginPage.submit.click();
        expect(loginPage.errorMessage()).toBe(res.ru.ENTER_CODE_OR_EMAIL);
    });

    it('should show error on invalid email', function () {
        loginPage.setCodeOrEmail('invalid@email');
        loginPage.setPassWord('bar');
        loginPage.submit.click();
        expect(loginPage.errorMessage()).toBe(res.ru.INVALID_CODE_OR_EMAIL);
    });

    it('should show error on empty password', function () {
        loginPage.setCodeOrEmail('valid@email.com');
        loginPage.setPassWord('');
        loginPage.submit.click();
        expect(loginPage.errorMessage()).toBe(res.ru.PASSORD_REQUIRED);
    });

    it('should show error if bad credentials', function() {
        loginPage.setCodeOrEmail('wrong@email.com');
        loginPage.setPassWord('bar');
        loginPage.submit.click();
        expect(loginPage.errorMessage()).toBe(res.ru.INVALID_EMAIL_OR_PASSWORD);
    });

    it('should log in by valid email and password', function () {
        var correctEmail = "foo@gmail.com";
        var correctPassword = "bar";
        loginPage.setCodeOrEmail(correctEmail);
        loginPage.setPassWord(correctPassword);
        loginPage.submit.click();
        expect(content.header()).toBe(res.ru.EXPENSES_HISTORY);
    });

    it('should logout', logout);

    it('should show error on wrong activation code', function () {
        loginPage.setCodeOrEmail('321');
        loginPage.submit.click();
        expect(loginPage.errorMessage()).toBe(res.ru.INVALID_ACTIVATION_CODE);
    });

    it('should log in by valid activation code', function () {
        loginPage.loginWithAcivationCode();
        expect(content.header()).toBe(res.ru.EXPENSES_HISTORY);
    });
});
