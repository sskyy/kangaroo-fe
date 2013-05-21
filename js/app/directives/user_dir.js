app_directives
    .directive('createUserModal', ['ProjectPool', 'UserPool', 'EventCenter',
        function (ProjectPool, UserPool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'modalShown': '=',
                'isEdit': '=',
                'selectedItems': '='
            },
            templateUrl: '/static/js/templates/admin/user/create_user.html',
            link: function (scope, elem, attrs) {
                scope.submit = function () {
                    var data = {
                        'name': scope.name,
                        'email': scope.email,
                        'password': scope.password,
                        'project_uuid': scope.project_uuid,
                        'enabled': scope.enabled
                    };
                    if (scope.isEdit) {
                      EventCenter.trigger('user:update', scope.$parent.selectedItems[0].id, data);
                    } else {
                      EventCenter.trigger('user:create', data);
                    }
                    scope.close_modal();
                };
                scope.$watch('modalShown', function (newValue) {
                    if (!newValue) return;
                    scope.project_list = ProjectPool.fetch(function (projects) {
                        scope.project_uuid = projects[0].id;
                        return projects;
                    });
                });
                scope.close_modal = function () {
                    scope.modalShown = false;
                };
                scope.can_submit=function(form){
                    return (scope.updateSg||sg_form.sg_name&&sg_form.sg_desc
                        &&sg_form.sg_name.$valid&&sg_form.sg_desc.$valid);
                };
                scope.$watch('modalShown', function() {
                    if(!scope.modalShown)
                        return;
                    var flag = scope.isEdit;
                    var item =  scope.$parent.selectedItems[0]; 

                    scope.name = flag? item.name: '';
                    scope.email = flag? item.email: '';
                    scope.password = '';
                    scope.confirm_password = '';
                    scope.project_uuid = flag? 0: 0;
                    scope.enabled = flag? item.enabled: true;
                    $('#input_name')
                        .attr({'name-valid-except': scope.name});
                    
                    if(flag)
                        $('#create_user_form .help-inline').hide();
                });
            }
        };
    }])
    .directive('nameValid', ['UserPool', function (UserPool) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.users = UserPool.fetch(); 
                console.log(scope.users);
                ctrl.$parsers.unshift(function (value) {
                    var isRepeated = false;
                    for(var i=0;i<scope.users.length;i++)
                    {
                        if(scope.users[i].name.toLowerCase() === value.toLowerCase())
                        {
                            isRepeated = true;
                            break;
                        }
                    }
                    var except = $('#input_name').attr('name-valid-except');
                    if(!except)
                        except = "";
                    if(value.toLowerCase() == except.toLowerCase())
                        isRepeated = false;
                    ctrl.$setValidity('repeated', !isRepeated);
                    if(!isRepeated)
                        ctrl.$setValidity('required', true);
                    return value;
                });
            }
        }
    }])
    .directive('sameAsValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.sameAs=attrs.sameAs;
                ctrl.$parsers.unshift(function (value) {
                    // scope.lastValue = value;
                    var isSameAs = $(scope.sameAs).val() == value;
                    if(attrs.sameAsValidOff)
                        isSameAs = false;
                    ctrl.$setValidity('same_as_valid', isSameAs);
                    return value;
                });
                // scope.$watch('sameAs', function () {
                //     ctrl.$setValidity('same_as_valid', scope.sameAs == scope.lastValue);
                // });
            }
        };
    })
    .directive('emailFormatValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$parsers.unshift(function (value) {
                    ctrl.$setValidity('email_format_valid', 
                        value == "" || /.@./.test(value));
                    return value;
                });
            }
        };
    })
    .directive('lengthLimitValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$parsers.unshift(function (value) {
                    if(attrs.lengthMin !== undefined)
                        ctrl.$setValidity('too_short', value.length==0 || value.length >= attrs.lengthMin);
                    if(attrs.lengthMax !== undefined)
                        ctrl.$setValidity('too_long', value.length <= attrs.lengthMax);
                    return value;
                });
                if(scope.lengthMin !== undefined)
                    ctrl.$setValidity('too_short', false);
            }
        };
    });
