describe('App', function () {
    describe('app/overview', function () {
        beforeEach(function () {
            browser().navigateTo('/app/overview');
        });
    });

    describe('app/instance', function () {
        var instance_scope;
        beforeEach(function () {
            browser().navigateTo('/app/instance');
            instance_scope = angular.element(element('#panel_center')).scope();
        });

        it('should check whether button is enabling', function () {
            expect(element(':button:contains(Connect)').attr('disabled')).toBeTruthy();
            expect(element(':button:contains(Launch Instance)').attr('disabled')).toBeUndefined;
        });

        it('should launch the launch instance modal', function () {
        });
    });

    describe('app/snapshot', function () {
        beforeEach(function () {
            browser().navigateTo('/app/snapshot');
        });
    });
});
