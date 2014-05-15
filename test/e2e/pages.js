var LoginPage = function () {
    this.codeOrEmail = element(by.input('vm.user.codeOrEmail'));
    this.password = element(by.input('vm.user.password'));
    this.submit = element(by.id('loginButton'));
    this.errorMessage = function () {
        return $('.authError').getText();
    };
    this.header = function () {
        return $('.content h4').getText();
    };

    this.setCodeOrEmail = function (value) {
        this.codeOrEmail.clear();
        this.codeOrEmail.sendKeys(value);
    };
    this.setPassWord = function (value) {
        this.password.clear();
        this.password.sendKeys(value);
    };
};

var Menu = function () {
    this.globe = element(by.id('globe'));
    this.logout = element(by.id('logoutButton'));

    this.changeLanguage = function (langCode) {
        this.globe.click();
        element(by.id(langCode)).click();
    };

};

var Content = function () {
    this.header = function () {
        return $('.content h2').getText();
    };
};

exports.Login = LoginPage;
exports.Menu = Menu;
exports.Content = Content;