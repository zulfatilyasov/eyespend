exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        'e2e/login.scenarios.js',
        'e2e/transactions.scenarios.js'
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    baseUrl: 'http://localhost:3000',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};
