describe('ApiResource', function () {
    beforeEach(module('RestService'));

    it('should get api url', inject(function (ApiResource) {
        expect(ApiResource.enabled_panels.list).toBe('/resource/panels');
        expect(ApiResource.region.list).toBe('/resource/region/list');
    }));

});

describe('AppService', function () {
    beforeEach(module('AppService'));

    it('should get csrf token from cookie', inject(function (get_csrf_token) {
    
    }));
});

