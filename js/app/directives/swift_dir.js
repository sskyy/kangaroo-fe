app_directives
  .directive('swiftList', ['EventCenter', function ($EventCenter) {
      return {
          restrict: 'E',
          scope : true,
          replace:true,
          template : '<div class="swift-list">'
           + '<div class="swift-list-paths">'
           + '<span class="swift-list-path" ng-repeate="path in paths">{{path.name}}</span>'
           + '</div><div class="swift-list-grid" ng-grid="{data:\"files\"}"></div></div>',
          link: function ($scope, $elem, $attrs) {
            if( !('swift-data-name' in $attrs ) || !(attrs['swift-data-name']) in $scope.$parent ){
              return;
            }

            $scope.files = $scope.$parent[attrs['swift-data-name']];
            $scope.paths = [];
            $scope.changePath = function( path ){
              $EventCenter.trigger("swift:changePath", path );
            }

            $scope.createFolder = function(){

            }

            $scope.uploadFile = function(){

            }
          }
      };
  }]);