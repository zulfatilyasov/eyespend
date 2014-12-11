app = angular.module("app")

app.constant "routes",
  [
    {
      url: "/"
      config:
        templateUrl: "transactions/transactions.html"
        title: "transactions"
    }
    {
      url: "/login"
      config:
        templateUrl: "login/login.html"
        title: "login"
    }
    {
      url: "/settings"
      config:
        templateUrl: "settings/settings.html"
        title: "settings"
    }
    {
      url: "/tagstats"
      config:
        templateUrl: "tagstats/tagstats.html"
        title: "tagstats"
    }
    {
      url: "/stats"
      config:
        templateUrl: "stats/stats.html"
        title: "stats"
    }
    {
      url: "/tagstats"
      config:
        templateUrl: "tagstats/tagstats.html"
        title: "tagstats"
    }
  ]

app.config [
  "$routeProvider"
  "routes"
  ($routeProvider, routes) ->
    routes.forEach (r) ->
      $routeProvider.when r.url, r.config

    $routeProvider.otherwise redirectTo: "/"
]
