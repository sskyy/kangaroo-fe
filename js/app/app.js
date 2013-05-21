"use strict";
var app_module = angular.module('App',
    ['ui', 'ngCookies', 'bootstrap', 'anGrid', 'RestService', 'RestServiceV2',
     'CommonService', 'AppService', 'AppFilter', 'AppDirectives'])
  .value('ui.config', {
        jq: {
            tooltip: {
                placement: 'right'
            },
            popover: {
                'trigger': 'hover',
                'placement': 'bottom'
            }
        }
  })
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/app/test', 
        {templateUrl: '/static/js/templates/test.html',
         controller: 'TestCtrl'})
      .when('/app/overview',
        {templateUrl: '/static/js/templates/project/overview/index.html',
         controller: 'user.OverviewCtrl'})
      .when('/app/instance',
        {templateUrl: '/static/js/templates/project/instance/index.html',
         controller: 'user.InstanceCtrl'})
      .when('/app/volume',
        {templateUrl: '/static/js/templates/project/volume/index.html',
         controller: 'user.VolumeCtrl'})
      .when('/app/volume_snapshot',
        {templateUrl: '/static/js/templates/project/volume/snapshot.html',
         controller: 'user.VolumeSnapshotCtrl'})
      .when('/app/image',
        {templateUrl: '/static/js/templates/project/image/index.html',
         controller: 'user.ImageCtrl'})
      .when('/app/snapshot',
        {templateUrl: '/static/js/templates/project/snapshot/index.html',
         controller: 'user.SnapshotCtrl'})
      .when('/app/security_group',
        {templateUrl: '/static/js/templates/project/security_group/index.html',
         controller: 'user.SgCtrl'})
      .when('/app/keypair',
        {templateUrl: '/static/js/templates/project/keypair/index.html',
         controller: 'user.KeypairCtrl'})
      .when('/app/floating_ip',
        {templateUrl: '/static/js/templates/project/floating_ip/index.html',
         controller: 'user.FloatingIpCtrl'})
      .when('/app/load_balancer',
        {templateUrl: '/static/js/templates/project/load_balancer/index.html',
         controller: 'user.LBCtrl'})
      .when('/app/monitor',
        {templateUrl: '/static/js/templates/project/monitor/index.html',
         controller: 'user.MonitorCtrl'})
      .when('/app/billing',
        {templateUrl: '/static/js/templates/project/billing/index.html',
         controller: 'user.BillingCtrl'})
      .when('/app/balance',
        {templateUrl: '/static/js/templates/project/balance/index.html',
         controller: 'user.BalanceCtrl'})
      .when('/app/admin_overview',
        {templateUrl: '/static/js/templates/admin/overview/index.html',
         controller: 'admin.OverviewCtrl'})
      .when('/app/admin_instance',
        {templateUrl: '/static/js/templates/admin/instance/index.html',
         controller: 'user.InstanceCtrl'})
      .when('/app/admin_volume',
        {templateUrl: '/static/js/templates/admin/volume/index.html',
         controller: 'admin.VolumeCtrl'})
      .when('/app/admin_service',
        {templateUrl: '/static/js/templates/admin/service/index.html',
         controller: 'admin.ServiceCtrl'})
      .when('/app/admin_flavor',
        {templateUrl: '/static/js/templates/admin/flavor/index.html',
         controller: 'admin.FlavorCtrl'})
      .when('/app/admin_image',
        {templateUrl: '/static/js/templates/admin/image/index.html',
         controller: 'admin.ImageCtrl'})
      .when('/app/admin_project',
        {templateUrl: '/static/js/templates/admin/project/index.html',
         controller: 'admin.ProjectCtrl'})
      .when('/app/admin_user',
        {templateUrl: '/static/js/templates/admin/user/index.html',
         controller: 'admin.UserCtrl'})
      .when('/app/admin_quota',
        {templateUrl: '/static/js/templates/admin/quota/index.html',
         controller: 'admin.QuotaCtrl'})
      .when('/app/admin_coupon',
        {templateUrl: '/static/js/templates/admin/coupon/index.html',
         controller: 'admin.CouponCtrl'})
      .when('/app/admin_apply_code',
        {templateUrl: '/static/js/templates/admin/apply_code/index.html',
         controller: 'admin.ApplyCodeCtrl'})
      .otherwise({redirectTo: '/app/overview'});
    $locationProvider.html5Mode(true);
  }]);
