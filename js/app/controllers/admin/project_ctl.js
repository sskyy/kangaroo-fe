app_module.controller('admin.ProjectCtrl',
    ['$scope', 'CouponLogResource', 'CrashResource', 'ProjectPool',
     'UserPool', 'InstancePool', '$filter', 'EventCenter',
     function ($scope, CouponLogResource, CrashResource, ProjectPool,
                UserPool, InstancePool, $filter, EventCenter) {

        $scope.$emit('load_start');
        $scope.projects = ProjectPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        $scope.project_users = [];

        $scope.quotas = {};
        $scope.quotas['Instances'] = {raw_limit:3,raw_used:1};
        $scope.quotas['Snapshots'] = {raw_limit:30,raw_used:10};
        $scope.quotas['vCPU'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Security Groups'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Memory'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Key Pairs'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Disk'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Floating IPs'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Load Balancers'] = {raw_limit:30,raw_used:10};

        $scope.viewQuotas = $filter('part_filter')($scope.quotas);

        $scope.open_create_project = function () {
            $scope.create_project_shown = true;
        };

        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };

        $scope.open_edit_project = function () {
            $scope.edit_project_shown = true;
            $scope.$broadcast('edit_project_shown');
        };

        $scope.open_manage_user = function () {
            $scope.manage_user_shown = true;
        };

        $scope.open_modify_quota = function () {
            $scope.modify_quota_shown = true;
            $scope.$broadcast("modify_quota_shown");
        };

        $scope.delete_projects = function () {
            for (var i=0; i < $scope.selectedItems.length;i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('project:remove', selected.id);
            }
            //$scope.selectedItems.splice(0, $scope.selectedItems.length);
        };

        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: 'projects',
            columnDefs: [
                        // {field: 'id', displayName: 'UUID'},
                         {field: 'name', displayName: 'Name'},
                         {field: 'enabled', displayName: 'Enabled'},
                         {field: 'description', displayName: 'Description'}],
            selectedItems: $scope.selectedItems
        };

        // for project user
        $scope.usersGridOptions = {
            angridStyle: 'th-list',
            multiSelectWithCheckbox: true,
            data: 'project_users',
            columnDefs: [{field: 'id', displayName: 'UUID'},
                         {field: 'name', displayName: 'Name'},
                         {field: 'email', displayName: 'Email'},
                         {field: 'enabled', displayName: 'Enabled'}]
        };

        // for billing pane
        var current_year = new Date().getFullYear(),
            start_year = 2011, select_years = [];
        $scope.selected_year = current_year;
        for (var i=start_year; i <= current_year; i++) {
            select_years.push(i);
        }
        $scope.select_years = select_years;


        $scope.billingGridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: 'crash_log',
            columnDefs: [{field: 'month', displayName: 'Month'},
                         {field: 'summary', displayName: 'Summary'},
                         {field: 'instance', displayName: 'Instance'},
                         {field: 'network', displayName: 'Network'},
                         {field: 'floating_ip', displayName: 'Floating Ip'}],
            selectedItems: $scope.selectedItems
        };

        // for project instance
        $scope.instancesGridOptions = {
            angridStyle: 'th-list',
            multiSelectWithCheckbox: true,
            data: 'project_instances',
            columnDefs: [{field: 'image_name', displayName: 'OS', width: '5%'},
                         {field: 'name', displayName: 'Name'},
                         {field: 'private_ip', displayName: 'Private Ip'},
                         {field: 'flavor', displayName: 'Flavor', columnFilter: 'flavor_filter'},
                         {field: 'payment_type', displayName: 'Payment Type'},
                         {field: 'status', displayName: 'Status', columnFilter: 'status_filter'},
                         {field: 'ssh_domain', displayName: 'Public Domain'},
                         {field: 'security_groups', displayName: 'Security Groups', columnFilter:'sg_filter'},
                         {field: 'key_name', displayName: 'Key Name'}
                         ],
        };

        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
            if($scope.selectedItems.length == 0)
                return;
            $scope.displayItem = $scope.selectedItems[0];


            var selected_uuid = $scope.selectedItems[0].id;

            UserPool.query_no_cache({'tenant_id': selected_uuid},
                function (users) {
                    $scope.project_users = [];
                    for (var i=0; i < users.length; i++) {
                        $scope.project_users.push(users[i]);
                    }
            });

            InstancePool.query_no_cache({'tenant_id': selected_uuid}, 
                function (instances) {
                    $scope.project_instances = [];
                    for (var i=0; i < instances.length; i++) {
                        $scope.project_instances.push(instances[i]);
                    }
            });

            $scope.coupon_remaining = CouponLogResource.remaining_resource.get({'id': selected_uuid}, function (res) {
                $scope.coupon_remaining = res.remaining;
            });
            $scope.crash_remaining = CrashResource.remaining_resource.get({'id': selected_uuid}, function (res) {
                $scope.crash_remaining = res.remaining;
            });


            $scope.$watch('selected_year', function (newValue) {
                if (newValue !== undefined) {
                    $scope.crash_log = CrashResource.list_resource.fetch({
                        'from_cache': 1,
                        'year': newValue,
                        'id': selected_uuid
                    });
                }
            });

        });
        $scope.$on('cache_change:project', function () {
          $scope.projects = ProjectPool.fetch();
        });
}]);
