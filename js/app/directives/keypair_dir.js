app_directives
    .directive('keypairmodal', ['$timeout', 'ApiList', 'KeypairPool', 'EventCenter', function ($timeout, ApiList, KeypairPool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                keypairModalShown: "=",
                importKeypair: "=",
            },
            templateUrl: "/static/js/templates/project/keypair/keypair_modal.html",
            link: function (scope, elem, attrs) {
                scope.key_exist = function (key) {
                  return KeypairPool.fetch(function (keys) {
                            for (var i=0; i < keys.length;i++) {
                              if (keys[i].name == key) return false;
                            }
                            return true;
                          });
                }
                scope.create_url = ApiList.get('keypair', 'create_keypair');
                scope.refresh_keypairs = function () {
                    scope.$parent.keypairs = KeypairPool.query(function(res){
                        scope.$parent.instance_keypair = scope.$parent.keypairs[0];
                        return res;
                    });
                };
                scope.import_keypair = function (keypair_name, public_key) {
                  var data = {'name': keypair_name,
                             'public_key': public_key};
                  EventCenter.trigger('keypair:import', data);
                };
                scope.close_keypair_modal = function () {
                    scope.keypairModalShown = false;
                };
                scope.can_submit=function(keypair_form){
                    return (scope.importKeypair&&
                                keypair_form.keypair_name.$valid&&keypair_form.public_key.$valid
                            )||(
                                (!scope.importKeypair)&&
                                keypair_form.keypair_name&&keypair_form.keypair_name.$valid
                            );
                };
                scope.submit_keypair=function(keypair_form){
                    if (scope.importKeypair) {
                        scope.import_keypair(scope.keypair_name, scope.public_key);
                        scope.close_keypair_modal();
                    } else {
                        (function($){
                            if($('iframe#temp-download').length){
                                $('iframe#temp-download').attr('src',scope.create_url + '/' + scope.keypair_name);
                            } else{
                                $('<iframe></iframe>').attr({
                                    'id' : 'temp-download',
                                    'src' : scope.create_url + '/' + scope.keypair_name
                                }).appendTo('body:eq(0)').hide();
                            }
                        })(jQuery);

                        scope.close_keypair_modal();
                        $timeout(scope.refresh_keypairs, 1000); //waiting
                    }
                };
            },
        };
    }])
    .directive('keypairNameValid', ['KeypairPool', function (KeypairPool) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.key_name_valid = function (key_name) {
                    var keys = KeypairPool.fetch();
                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i].name == key_name) {
                            console.log('exist');
                            return false;
                        }
                    }
                    return true;
                };
                ctrl.$parsers.unshift(function (value) {
                    if (scope.key_name_valid(value)) {
                        ctrl.$setValidity('key_name_valid', true);
                        return value;
                    }
                    ctrl.$setValidity('key_name_valid', false);
                    return value;
                });
            },
        };   
    }]);
