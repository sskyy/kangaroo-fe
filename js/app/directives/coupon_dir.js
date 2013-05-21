app_directives
    .directive('createCouponModal', ['CouponCodeResource', function (CouponCodeResource) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'modalShown': '='
            },
            templateUrl: '/static/js/templates/admin/coupon/create_coupon.html',
            link: function (scope, elem, attrs) {
                scope.submit = function () {
                    var data = {
                        'value': scope.value,
                        'count': scope.count
                    };
                    CouponCodeResource.list_resource.create(data, {multi: true}, function(){
                        CouponCodeResource.list_resource.fetch({from_cache:1});
                    });
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                }
            },
        };
    }])
    .directive('loadCouponModal', ['CouponLogResource', function (CouponLogResource) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'modalShown': '='
            },
            templateUrl: '/static/js/templates/project/balance/load_coupon.html',
            link: function (scope, elem, attrs) {
                scope.submit = function () {
                    var data = {
                        'code': scope.code
                    };
                    CouponLogResource.list_resource.create(data, null, function () {
                        CouponLogResource.remaining_resource.get(function (res) {
                            scope.$parent.coupon_remaining = res['remaining'];
                        })
                        CouponLogResource.list_resource.fetch({'year': new Date().getFullYear(), 'from_cache': 1});
                    });
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                };
            }
        }
    }]);
