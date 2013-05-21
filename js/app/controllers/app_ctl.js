app_module.controller('AppCtrl',
    ['$window', '$filter', '$timeout', '$scope', '$rootScope',
     '$location', '$cookies', 'PanelGroupsResource',
     'RegionsResource', 'LocaleSetting',
     function ($window, $filter, $timeout, $scope, $rootScope,
               $location, $cookies, PanelGroupsResource,
               RegionsResource, LocaleSetting) {
      var i18nFilter = $filter('i18n');

      if ($cookies.user_console == 'true') {
          $scope.user_console = 'false';
      } else {
          $scope.user_console = 'true';
      }
      $scope.logout = function () {
          // logout app
          $window.location.href = "/accounts/logout/";
      };
      $scope.products = [];
      $scope.regions = [];
      $scope.services = [];
      $scope.user_info =  [{'name': $cookies.username||'User', 'link': '#'},
                           {'name': 'Logout', 'link': '/accounts/logout/',
                            'callback': $scope.logout}];
      var change_lang = function () {
          LocaleSetting.set(this.lang);
      };
      $scope.lang = [
          {'name': i18nFilter('Language')},
          {'name': '简体中文', 'lang': 'zh_CN', 'callback': change_lang},
          {'name': 'English', 'lang': 'en_US', 'callback': change_lang}];
      $scope.help_links = [{'name': 'Document', 'link': '#'}];
      var reset_panel_selected = function (groups) {
          // detect whethe the panel is selected based on current path;
          var current_view = $location.path().substring(5); // remove '/app/'
          for (var i = 0; i< groups.length; i++) {
              var group = groups[i].panels;
              for (var j = 0; j < group.length; j++) {
                  var panel = group[j];
                  if (panel.name == current_view) {
                      $scope.selected_panel = panel.name;
                  }
              }
          }
      };

      $scope.panel_groups = PanelGroupsResource.query(function (res) {
          for (var i = 0; i < res.length; i++) {
              var panel_group = res[i],
                  first_link = '/app/' + panel_group.panels[0].name;
              $scope.products.push({'name': panel_group.name, 'link': first_link});
          }
          reset_panel_selected(res);
      });

      // for top bar items
      RegionsResource.list_resource.fetch({}, function (regions) {
        var region_click = function (region) {
          return function () {
            location.href = location.origin + "/app/region_change/" + "?endpoint=" + region.link + "&region_name=" + region.name;
          };
        }
          for (var i=0;i<regions.length;i++) {
              regions[i].callback = region_click(regions[i]);
          }
          var current_region = null;
          for (var j=0; j < regions.length; j++) {
              var region = regions[j];
              if (region.current) {
                  current_region = region;
                  regions.splice(j, 1);
                  break;
              }
          }
          regions.unshift(current_region);
          $scope.regions = regions;
      });

      $scope.toggle_user_admin_console = function () {
          if ($cookies.user_console == "true") {
              //check to admin console
              document.cookie = "user_console=false; path=/";
          } else {
              //check to user console
              document.cookie = "user_console=true; path=/";
          }
          $window.location.reload();
      };

      $rootScope.$on('$routeChangeStart', function (evt, route) {
          if ($window.ajax_list !== undefined) {
              for (var i=0; i < $window.ajax_list.length; i++) {
                  $timeout.cancel($window.ajax_list[i]);
              }
              $window.ajax_list =  [];
          }
      });

      $rootScope.$on('$routeChangeSuccess', function (evt, route) {
          var current_view = $location.path().substring(5); // remove '/app/'
          $scope.services = [];
          if ($scope.panel_groups.length === 0) {
              // has not be initailed
              return ;
          }
          reset_panel_selected($scope.panel_groups);
      });

}]);
