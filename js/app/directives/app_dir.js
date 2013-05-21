app_directives
  .directive('topbardropdown', ['$location', function ($location) {
        // nav bar item
        return {
            restrict: 'E',
            scope: {
                items: "=",
                iconleft: "@",
                iconright: "@",
            },
            replace: true,
            template:   '<span class="btn" data-toggle="dropdown" href="#">' +
                            '<i ng-show="iconleft" class="iconleft {{iconcolor}} {{iconleft}}"></i>' +
                            '<span>' +
                                '{{items[0].name|i18n}}' +
                            '</span>' +
                            '<i ng-show="iconright" class="iconright {{iconcolor}} {{iconright}}"></i>' +
                            '<ul ng-show="items.length > 1" class="dropdown-menu" role="menu" aria-labelleby="dLabel">' +
                                '<li ng-repeat="item in items">' +
                                    '<a ng-click="item_click(item)" ng-hide="$index == 0" >{{item.name|i18n}}' +
                                    '</a>' +
                                '</li>' +
                            '</ul>' +
                        '</span>',
            link: function (scope, elem, attrs) {
                scope.view_change = function (item) {
                    $location.path(item.link);
                };
                scope.iconcolor = "icon-black";
                var a = $(elem[0]),
                    ul = $(elem.children('.dropdown-menu')[0]),
                    iconleft = a.find('.iconleft'),
                    iconright = a.find('.iconright'),
                    iconrightclass = attrs.iconright;


                scope.hovered = false;
                elem.mouseenter(function () {
                    elem.siblings().children('.dropdown-menu.open').removeClass('open');
                    elem.addClass("open");
                });
                
                var hideLock = null;
                elem.mouseleave(function () {
                    if( elem.hasClass('open') ){
                        hideLock = window.setTimeout(function(){
                            elem.removeClass('open');
                        },100)    
                    }
                });
                
                ul.mouseenter( function() {
                    if( hideLock !== null ){
                        window.clearTimeout( hideLock );
                    }
                })

                ul.mouseleave( function(){
                    if( elem.hasClass('open') ){
                        elem.removeClass('open');
                    }
                })

                scope.item_click = function (item) {
                    if (item.callback == undefined) {
                        scope.view_change(item);
                    } else {
                        item.callback(item);
                    }
                };
            }
        };
    }])
    .directive('sidepanel', function () {
        // sidepanel item
        return {
            restrict: 'E',
            scope: {
                group: "=",
                selectedPanel: "=",
            },
            replace: true,
            template: "<div class='nav-group'>" +
                       "<li class='menu-header' ng-click='toggle_panel()' ng-class='{\"active\": has_item_selected()}'>" +
                         "<i class='icon-th-list'></i>"+
                         "<i ng-class='{\"icon-chevron-down\": folded == false, \"icon-chevron-right\": folded == true}' ></i>" +
                         "{{group.name|i18n}}" +
                       "</li>" +
                       "<ul ui-sortable='{axis:\"y\"}' class='nav'>" +
                         "<li ng-repeat='panel in group.panels' ng-class='{\"active\": selectedPanel == panel.name}'>" +
                           "<a ng-href='/app/{{panel.name}}' class='sidebar-{{panel.name}}'>" +
                               "<i class='icon-icon'></i>" +
                               "{{panel.name|i18n}}" +
                           "</a>" +
                         "</li>" +
                       "</ul>" +
                      "</div>",
            link: function (scope, elem, attrs) {
                scope.folded = false;
                scope.has_item_selected = function () {
                    // check whethe the selected panel is in the group
                    for (var i = 0; i < scope.group.panels.length; i++) {
                        var panel = scope.group.panels[i];
                        if (panel.name == scope.selectedPanel) {
                            return true;
                        }
                    }
                    return false;
                };
                scope.toggle_panel = function () {
                    if (scope.folded) {
                        $(elem).find('.nav').slideDown();
                        scope.folded = false;
                    } else {
                        $(elem).find('.nav').slideUp();
                        scope.folded = true;
                    }
                };

            },
        };
    })
    .directive('confirmDialog', function () {
        return {
            restrict: 'E',
            scope: {
                title: "@",
                msg: "@",
                action: "&",
                confirmDialogShown: "=",
            },
            templateUrl: "/static/js/templates/common/confirmDialog.html",
            link: function (scope, elem, attrs) {
                scope.close_modal = function () {
                    scope.confirmDialogShown = false;
                };
                scope.perform_action = function () {
                    scope.submitted = true;
                    scope.action();
                    scope.close_modal();
                };

                scope.$watch('confirmDialogShown', function (value) {
                    //called when ui-modal is shown
                    if (value) {
                        scope.submitted = false;
                    }
                });
                if (attrs.title) {
                    scope._title = attrs.title;
                } else {
                    scope._title = "Confirm";
                }
                if (attrs.msg) {
                    scope._msg = attrs.msg;
                } else {
                    scope._msg = "Confirm to delete?";
                }
            }
        };
    })
    .directive('stdCenterWrapper', function() {
        return {
            restrict: 'C',
            link: function (scope, elem, attrs) {
                
                $(elem).height($('body').height()-120);
                if( elem.find('.buttom_region').length != 0 ){
                    scope.height = Math.max(130, $('#panel_center').height()/3);
                    $(elem)
                        .splitter({type: 'h', 
                        sizeTop: scope.height});

                    var pushheight = function () {
                        if(scope.height == null)
                            scope.height = elem.find('.upper_region').height();
                        elem.find('.upper_region').height('100%');
                        scope.$broadcast('pushheight');
                    };
                    var popheight = function () {
                        elem.find('.upper_region').height(scope.height);
                        scope.height = null;
                        scope.$broadcast('popheight');
                    }

                    if(elem.hasClass('activable')){
                        pushheight();
                    }

                    scope.$watch('selectedItems', function (value) {
                        if(value && value.length == 1)
                        {
                            elem.addClass('active');
                            if(elem.hasClass('activable'))
                                popheight();
                        }
                        else
                        {
                            elem.removeClass('active');
                            if(elem.hasClass('activable'))
                                pushheight();
                        }
                    })
                }else{
                    elem.find('.upper_region').height('100%');
                }
                
            }
        }
    })
    .directive('dropDownBtn', function () {
        return {
            restrict: 'A',
            scope: {
                disabled: "=",
                onClick: "&",
            },
            link: function (scope, elem, attrs) {
                var e = $(elem);
                e.on('click', function () {
                    if (scope.disabled) {
                        return ;
                    }
                    scope.onClick();
                });

                scope.$watch('disabled', function (newValue) {
                    if (newValue) {
                        e.addClass('dropdown-btn-disabled');
                    } else {
                        e.removeClass('dropdown-btn-disabled');
                    };
                });

                scope.label_toggle = function (option) {
                    var type = option.type;
                    if (type == 'toggle_pause') {
                        if (scope.$parent.selectedItems.length != 1) {
                            return "Pause Instance";
                        }   
                        if (scope.$parent.selectedItems[0].status == 'paused') {
                            return 'Unpause Instance';
                        }
                        return 'Pause Instance';
                    } else if (type == 'toggle_suspend') {
                        if (scope.$parent.selectedItems.length != 1) {
                            return "Suspend Instance";
                        }
                        if (scope.$parent.selectedItems[0].status == 'suspended') {
                            return "Resume Instance";
                        }
                        return "Suspend Instance";
                    } else if (type == 'toggle_stop') {
                        if (scope.$parent.selectedItems.length != 1) {
                            return "Stop";
                        }
                        if (scope.$parent.selectedItems[0].status == 'shutoff'){
                            return "Start Instance";
                        }
                        return "Stop Instance";
                    }
                };
            },
        };
    })
    .directive('pageLoader', function () {
        return {
            restrict: 'E',
            replace: true,
            template: "<div class='page-loader hide'>" +
                        "<span>loading..</span>" +
                      "</div>",
            link: function (scope, elem, attr) {
                scope.$on('load_complete', function () {
                    $(elem).addClass('hide');
                });

                scope.$on('load_start', function () {
                    $(elem).removeClass('hide');
                });
            }
        };
    })
    .directive('notifyWindow', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/static/js/templates/common/notify.html',
            link: function (scope, elem, attr) {
                var current_time = function () {
                    var d = new Date();
                    return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
                };
                scope.msgs = {
                    data: [],
                    push: function (m, level) {
                        this.data.push({
                            date: current_time(),
                            msg: m,
                            level: level
                        });
                    },
                    clean: function () {
                        this.data = []; 
                    }
                };
                scope.$on('log_msg', function (evt, msg, level) {
                    level = level || 'info';
                    scope.msgs.push(msg, level);
                    !scope.display_full && $(elem).find('.notify_min a').fadeOut().fadeIn();
                    $timeout(function () {
                        var last_msg = $(elem).find('.msg_wrapper').last()[0]
                        last_msg && last_msg.scrollIntoViewIfNeeded();
                    }, 100)
                });
            }
        };
    }])
    .directive('uiConfig', function(){
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            template: "<div><i class='icon-cog'></i><div class='trans-box' ng-transclude><i class='ui-up-arrow'></i></div> </div>",
            link: function(scope, element, attrs) {
                $('.ui-config i').hide();
                $(element).parent().hover(
                    function(){
                        $('.ui-config i').fadeIn();
                    },
                    function(){
                        $('.ui-config i').fadeOut();
                        $('.ui-config div').slideUp(200);
                    }
                );

                $('.ui-config i').on('click',function(){
                $('.ui-config div').slideToggle(200);
                })
            }
        }
    });
