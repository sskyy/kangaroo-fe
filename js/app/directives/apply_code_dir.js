app_directives
  .directive('createApplyCode', ['EventCenter', function (EventCenter) {
      return {
          restrict: 'E',
          replace: true,           
          scope: {
              'createApShown': '='
          },
          templateUrl: '/static/js/templates/admin/apply_code/create_ap.html',
          link: function (scope, elem, attrs) {
              scope.submit = function () {
                  var data = {'count': scope.count};
                  EventCenter.trigger('apply_code:create', data);
                  scope.close_create_ap_modal();
              };
              scope.close_create_ap_modal = function () {
                  scope.createApShown = false;
              };   
          }
      };
  }]);
