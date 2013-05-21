app_directives
    .directive('sg', ['$filter', 'EventCenter', function ($filter, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: "=",
                updateSg: "=",
            },
            templateUrl: "/static/js/templates/project/security_group/sg.html",
            link: function (scope, elem, attrs) {
                var i18nFilter = $filter('i18n');
                // tooltip info
                scope.name_not_null = i18nFilter('name not null');
                scope.desc_not_null = i18nFilter('description not null');
                scope.port_range_info = i18nFilter('port range info');
                scope.icmp_type_info = i18nFilter('type info');
                scope.icmp_code_info = i18nFilter('code info');
                scope.source_info = i18nFilter('source info');

                scope.quick_rules=[];
                scope.quick_rules.push([{
                    "name": "SAE Bridge",
                    "protocol": "tcp",
                    "port_range": "1-65535",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "All TCP",
                    "protocol": "tcp",
                    "port_range": "1-65535",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "All UDP",
                    "protocol": "udp",
                    "port_range": "1-65535",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "All ICMP",
                    "protocol": "icmp",
                    "type": "-1",
                    "code": "-1",
                    "source": "0.0.0.0/0"
                }]);
                scope.quick_rules.push([{
                    "name": "SSH",
                    "protocol": "tcp",
                    "port_range": "22",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "MySQL",
                    "protocol": "tcp",
                    "port_range": "3306",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "DNS",
                    "protocol": "udp",
                    "port_range": "53",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "RDP",
                    "protocol": "tcp",
                    "port_range": "3389",
                    "source": "0.0.0.0/0"
                }]);
                scope.quick_rules.push([{
                    "name": "HTTP",
                    "protocol": "tcp",
                    "port_range": "80",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "HTTPS",
                    "protocol": "tcp",
                    "port_range": "443",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "POP3",
                    "protocol": "tcp",
                    "port_range": "110",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "POP3S",
                    "protocol": "tcp",
                    "port_range": "995",
                    "source": "0.0.0.0/0"
                }]);
                scope.quick_rules.push([{
                    "name": "SMTP",
                    "protocol": "tcp",
                    "port_range": "25",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "SMTPS",
                    "protocol": "tcp",
                    "port_range": "465",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "IMAP",
                    "protocol": "tcp",
                    "port_range": "143",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "IMAPS",
                    "protocol": "tcp",
                    "port_range": "993",
                    "source": "0.0.0.0/0"
                }]);

                //rule saving

                scope.rule_categories=[
                    {protocol:'tcp',cols:{'1.protocol':'TCP','2.port_range':'Port Range','3.source':'Source'}},
                    {protocol:'udp',cols:{'1.protocol':'UDP','2.port_range':'Port Range','3.source':'Source'}},
                    {protocol:'icmp',cols:{'1.protocol':'ICMP','2.type':'Type','3.code':'Code','4.source':'Source'}}
                ];

                scope.category_col_order=function(category){
                    var arr=[];
                    for(var c in category.cols)
                    {
                        var ret=/.\.(\w*)/.exec(c);
                        if(arr.length==0&&ret[1]=='protocol')
                        {
                            arr.push('nothing');
                        }
                        else
                        {
                            arr.push(ret[1]);
                        }
                    }
                    return arr;
                };

                scope.rule_mapping=new function(){
                    var data={};
                    var counter={};

                    this.all = function () {
                        return data;
                    }
                    this.count=function(protocol){
                        if(protocol!==undefined)
                            return counter[protocol];
                        return counter.tcp+counter.udp+counter.icmp;
                    };

                    this.add=function(rule){
                        if(typeof(rule)=='Array')
                        {
                            //batch add rules
                            for(var i in rule)
                                this.add(rule[i]);
                            return;
                        }
                        if (rule.protocol === null) return;
                        var key=toKey(rule);
                        if(data[rule.protocol][key]!==undefined)
                        {
                            //rule exists;
                            return;
                        }
                        data[rule.protocol][key]=rule;
                        counter[rule.protocol]++;
                    };

                    this.has=function(rule){
                        var ret=data[rule.protocol][toKey(rule)]!==undefined;
                        return ret;
                    };

                    this.toggle=function(rule){
                        if(this.has(rule))
                            this.remove(rule);
                        else
                            this.add(rule);
                    }

                    this.get=function(protocol){
                        // console.log(data[protocol]);
                        return data[protocol];
                    };

                    this.getRaw=function(inline){
                        if(inline)
                        {
                            var arr=[];
                            for(var p in data)
                            {
                                for(var k in data[p])
                                    arr.push(data[p][k]);
                            }
                            return arr;
                        }
                        return data;
                    }

                    this.remove=function(rule){

                        var key=toKey(rule);
                        if(data[rule.protocol][key]===undefined)
                        {
                            //rule not exists
                            return;
                        }

                        delete data[rule.protocol][key];
                        counter[rule.protocol]--;
                    };

                    this.reset=function(){
                        data={
                            'tcp':{},
                            'udp':{},
                            'icmp':{}
                        };
                        for(var k in data)
                            counter[k]=0;
                    };
                    this.reset();

                    var toKey=function(rule) {
                        switch(rule.protocol)
                        {
                            case 'tcp':
                            case 'udp':
                                //#fix sort by port_range(first num)
                                return (/\d*/.exec(rule.port_range)*1+100000)+'#'+rule.port_range+'@'+rule.source;
                            case 'icmp':
                                return rule.type+'@'+rule.code+'@'+rule.source;
                                break;
                        }
                    };
                };
                scope.create_sg = function (data) {
                  EventCenter.trigger('sg:create', data);
                  scope.close_sg_modal();
                };
                scope.update_sg = function (id, data) {
                    EventCenter.trigger('sg:update', id, data);
                    scope.close_sg_modal();
                };

                scope.$watch('modalShown', function (newValue) {
                    if (newValue) {
                        scope.rule_mapping.reset();
                        if (scope.updateSg) {
                            var rules = scope.$parent.selectedItems[0].rules;
                            for (var i=0; i < rules.length; i++) {
                                var rule = {
                                    'source': rules[i].source,
                                    'protocol': rules[i].ip_protocol,
                                };
                                if (rules[i].ip_protocol == 'icmp') {
                                    rule['type'] = rules[i].from_port;
                                    rule['code'] = rules[i].to_port;
                                } else {
                                    if (rules[i].from_port == rules[i].to_port) {
                                        rule['port_range'] = rules[i].from_port;
                                    } else {
                                        rule['port_range'] = rules[i].from_port + '-' + rules[i].to_port;
                                    }
                                }
                                scope.rule_mapping.add(rule);
                            }
                        }
                    };
                });

                var port_range_format = function (port_range) {
                        var ports = port_range.toString().split('-'),
                            start_port, end_port;
                        if (ports.length == 1) {
                            start_port = end_port = ports[0];
                        } else if (ports.length == 2) {
                            start_port = $.trim(ports[0]);
                            end_port = $.trim(ports[1]);
                        }
                        return {
                            'from_port': start_port,
                            'to_port': end_port
                        };
                };
                scope.close_sg_modal = function () {
                    scope.modalShown = false;
                };
                scope.new_rule=function(sg_form){
                    var ports = port_range_format(sg_form.port_range.$modelValue),
                        port_range;
                    if (ports.from_port == ports.to_port) {
                        port_range = ports.from_port;   
                    } else {
                        port_range =  ports.from_port + '-' + ports.to_port;
                    }
                    scope.rule_mapping.add({
                        protocol: sg_form.protocol.$modelValue,
                        port_range: port_range,
                        type: sg_form.type.$modelValue,
                        code: sg_form.code.$modelValue,
                        source: sg_form.source.$modelValue
                    });
                };
                scope.can_submit=function(sg_form){
                    return (scope.updateSg||sg_form.sg_name&&sg_form.sg_desc
                        &&sg_form.sg_name.$valid&&sg_form.sg_desc.$valid);
                };
                scope.add_rule_valid=function(sg_form){
                    return ((sg_form.protocol.$modelValue=='tcp'
                                ||sg_form.protocol.$modelValue=='udp')
                            &&sg_form.port_range.$valid
                            &&sg_form.source.$valid
                            )
                            ||
                            ((sg_form.protocol.$modelValue=='icmp')
                            &&sg_form.type.$valid
                            &&sg_form.code.$valid
                            &&sg_form.source.$valid
                            );
                };
                scope.submit_sg=function(sg_form){
                    var rules = scope.rule_mapping.getRaw(true),
                        rules_post = [];

                    for (var i=0; i<rules.length; i++) {
                        var rule = rules[i],
                            from_port, to_port;
                        if (rule.protocol == 'icmp') {
                            from_port = rule.type;
                            to_port = rule.code;
                        } else {
                            var port_range = port_range_format(rule.port_range);
                            from_port = port_range.from_port,
                            to_port = port_range.to_port;
                        }
                        rules_post.push({'ip_protocol': rule.protocol,
                                         'from_port': from_port,
                                         'to_port': to_port,
                                         'source': rule.source});

                    }
                    var formdata={
                        rules: rules_post
                    };
                    if(!scope.updateSg)
                    {
                        formdata.name = sg_form.sg_name.$modelValue;
                        formdata.description = sg_form.sg_desc.$modelValue;
                        scope.create_sg(formdata);
                    } else {
                        var id = scope.$parent.selectedItems[0].id;
                        formdata.name = scope.$parent.selectedItems[0].name;
                        formdata.description = scope.$parent.selectedItems[0].description;
                        scope.update_sg(id, formdata);
                    }
                }
            },
        };
    }]);
