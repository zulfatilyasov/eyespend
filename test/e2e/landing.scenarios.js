'use strict';

var res = require('../../app/translations.js');
var pages = require('../e2e/pages.js');

//var landingPage = new pages.Landing();
//var menu = new pages.Menu();
//var content = new pages.Content();

var header = 'Познакомьтесь с EyeSpend';
function logout() {
    menu.logout.click();
    expect(landingPage.header()).toBe(header);
}

describe('landing page', function () {
    browser.driver.get('http://localhost:3000/');

//    it('should automatically redirect landing', function () {
//        expect(landingPage.header()).toBe(header);
//    });

//    it('should show error on empty email', function () {
//        loginPage.setCodeOrEmail('');
//        loginPage.submit.click();
//        expect(loginPage.errorMessage()).toBe(res.ru.ENTER_CODE_OR_EMAIL);
//    });
//
//    it('should show error on invalid email', function () {
//        loginPage.setCodeOrEmail('invalid@email');
//        loginPage.setPassWord('bar');
//        loginPage.submit.click();
//        expect(loginPage.errorMessage()).toBe(res.ru.INVALID_CODE_OR_EMAIL);
//    });
//
//    it('should show error on empty password', function () {
//        loginPage.setCodeOrEmail('valid@email.com');
//        loginPage.setPassWord('');
//        loginPage.submit.click();
//        expect(loginPage.errorMessage()).toBe(res.ru.PASSORD_REQUIRED);
//    });
//
//    it('should show error if bad credentials', function() {
//        loginPage.setCodeOrEmail('wrong@email.com');
//        loginPage.setPassWord('bar');
//        loginPage.submit.click();
//        expect(loginPage.errorMessage()).toBe(res.ru.INVALID_EMAIL_OR_PASSWORD);
//    });

    it('should log in by valid email and password', function () {
        var correctEmail = "foo@gmail.com";
        var correctPassword = "bar";
        browser.driver.findElement(by.id('login')).click();
        browser.driver.findElement(by.id('email')).sendKeys(correctEmail);
        browser.driver.findElement(by.id('password')).sendKeys(correctPassword);
        browser.driver.findElement(by.id('loginButton')).click();
        browser.driver.wait(function() {
            return browser.driver.findElement(by.css('.page-title')).getText().then(function(title) {
                return res.ru.EXPENSES_HISTORY === title;
            });
        });
//        expect(browser.driver.findElement(by.css('.page-title')).getText()).toBe(res.ru.EXPENSES_HISTORY);
    });

//    it('should logout', logout);

//    it('should show error on wrong activation code', function () {
//        loginPage.setCodeOrEmail('321');
//        loginPage.submit.click();
//        expect(loginPage.errorMessage()).toBe(res.ru.INVALID_ACTIVATION_CODE);
//    });

//    it('should log in by valid activation code', function () {
//        landingPage.loginWithAcivationCode();
//        expect(content.header()).toBe(res.ru.EXPENSES_HISTORY);
//    });
});