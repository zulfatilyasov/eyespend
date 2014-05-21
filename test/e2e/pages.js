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

    this.loginWithAcivationCode = function () {
        this.setCodeOrEmail('123');
        this.submit.click();
    };
};

var Transactions = function () {
    var repeater = by.repeater('transaction in vm.trs');
    this.transactions = element(repeater);
    this.tag = element(repeater.row(3)).element(by.repeater('tag in transaction.tags').row(0));
    this.tagsFilter = $('.searchBlock .tags input');

    this.addTagToFilter = function (tag) {
        this.tagsFilter.sendKeys(tag + '\n');
    }
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
exports.Transactions = Transactions;