describe('filter', function () {
    var gb_format_filter,
        mb_format_filter;

    beforeEach(module('AppFilter'));
    beforeEach(inject(function ($filter) {
        gb_format_filter = $filter('gb_format');
        mb_format_filter = $filter('mb_format');
    }));
    
    describe('filter:gb_format', function () {
        it('should add GB to disk size value', function () {
            expect(gb_format_filter('9.8')).toBe('9.8GB');
        });

        it('should get 0GB if value is not an valid number', function () {
            expect(gb_format_filter('sdfsd')).toBe('0GB');
        });
    });

    describe('filter:mb_format', function () {
        it('should return MB RAM value', function () {
            expect(mb_format_filter('98')).toBe('98MB');
        });
        it('should return GB RAM value', function () {
            expect(mb_format_filter('2048')).toBe('2GB');
        });
    });

});
