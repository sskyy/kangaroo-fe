app_directives
    .directive('createImage', function () {
        return {
            restrict : 'E',
            replace: true,
            scope: {
                modalShown: '='
            },
            templateUrl: '/static/js/templates/admin/image/create_image.html',
            link: function (scope, elem, attr) {
                scope.closeModal = function () {scope.modalShown = false};
                scope.image_formats = [
                    {id: 'aki', name: 'AKI - Amazon Kernel Image'},
                    {id: 'ami', name: 'AMI - Amazon Machine Image'},
                    {id: 'ari', name: 'ARI - Amazzon Ramdisk Image'},
                    {id: 'iso', name: 'ISO - optical Disk Image'},
                    {id: 'qcow2', name: 'QCOW2 - QEMU Emulator'},
                    {id: 'raw', name: 'Raw'},
                    {id: 'vdi', name: 'VDI'},
                    {id: 'vhd', name: 'VHD'},
                    {id: 'vmdk', name: 'VHDK'}
                ];
                scope.form_invalid = function () {
                    if (!scope.disk_format) return true;
                    if (!scope.copy_from && $(elem).find("input[type=file]")[0].value ==  "") return true;
                }
                scope.complete_upload = function (content, result) {
                    console.log(content);
                    console.log(result);
                }
                scope.csrf_token = $.cookie('csrftoken');
            }
        };
    });
