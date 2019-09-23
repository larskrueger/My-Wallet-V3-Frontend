'use strict';

describe('ExportHistoryController2', () => {

    let $rootScope;
    let $controller;
    let $q;
    let $timeout;
    let $translate;
    let browser;
    let DateHelper;
    let Wallet;
    let Alerts;
    let ExportHistory;

    beforeEach(angular.mock.module('walletApp'));

    beforeEach(inject(function (_$rootScope_, $injector) {

        $rootScope = _$rootScope_;
        // We get an instance of each dependency
        $q = $injector.get('$q');
        $timeout = $injector.get('$timeout');
        $translate = $injector.get('$translate');
        format = $injector.get('format');
        browser = $injector.get('browser');
        DateHelper = $injector.get('DateHelper');
        Wallet = $injector.get('Wallet');
        Alerts = $injector.get('Alerts');
        ExportHistory = $injector.get('ExportHistory');
        $controller = $injector.get('$controller');

        // We mock the default behavior of these dependencies
        Wallet.legacyAddresses = () => [
            { address: 'some_address', archived: false, isWatchOnly: false, label: 'some_label' },
            { address: 'watch_address', archived: false, isWatchOnly: true },
            { address: 'other_address', archived: true, isWatchOnly: false }
        ];

        Wallet.accounts = () => [
            { label: "Checking", index: 0, archived: false, balance: 1, extendedPublicKey: 'xpub1' },
            { label: "Savings", index: 1, archived: false, balance: 1, extendedPublicKey: 'xpub2' },
            { label: "Something", index: 2, archived: true, extendedPublicKey: 'xpub3' }
        ];

        ExportHistory.fetch = () => $q.resolve();

    }));

    let createController = (activeIndex, coinCode) => {

        return $controller('ExportHistoryController', {
            $scope: $rootScope.$new(),
            activeIndex: activeIndex,
            accts: { accounts: Wallet.accounts().filter((w) => !w.archived), addresses: Wallet.legacyAddresses().filter((w) => !w.archived) },
            coinCode: coinCode || 'btc'
        });
    };

    it('should create list of export targets', () => {
        let controller = createController('');
        expect(controller.targets.length).toEqual(4);
    });

    it('should have the correct active target count', () => {
        let controller = createController('');
        expect(controller.activeCount).toEqual(4);
    });

    it('should set the target to all when only one active is found', () => {
        spyOn(Wallet, 'legacyAddresses').and.returnValue([]);
        spyOn(Wallet, 'accounts').and.returnValue([{ label: "Checking", index: 0, archived: false, balance: 1, extendedPublicKey: 'xpub1' }]);
        let controller = createController('');
        expect(controller.active.address).toEqual(['xpub1']);
    });
  
    describe('startDateLimits', () => {
    
      it('btc min start date should be Jan 3, 2009', () => {
        let controller = createController('', 'btc');
        expect(controller.options.minDate.toString().startsWith('Sat Jan 03 2009')).toBeTruthy();
      });
  
      it('bch min start date should be Aug 1, 2017', () => {
        let controller = createController('', 'bch');
        expect(controller.options.minDate.toString().startsWith('Tue Aug 01 2017')).toBeTruthy();
      });
    });
    
    describe('activeIndex', () => {

        it('should set all when "" ', () => {
            let controller = createController('');
            expect(controller.active.address).toEqual(['xpub1', 'xpub2', { address: 'some_address', archived: false, isWatchOnly: false, label: 'some_label' }, { address: 'watch_address', archived: false, isWatchOnly: true }]);
        });

        it('should set all addresses when "imported" ', () => {
            let controller = createController('imported');
            expect(controller.active.address).toEqual([{ address: 'some_address', archived: false, isWatchOnly: false, label: 'some_label' }, { address: 'watch_address', archived: false, isWatchOnly: true }]);
        });

        it('should set the right account ', () => {
            let controller = createController('1');
            expect(controller.active.xpub).toEqual('xpub2');
        });
    });

    describe('submit', () => {

        it('should assign right startDate', () => {
            let date = new Date(2017, 3, 25);
            spyOn(DateHelper, 'now').and.returnValue(date);
            let expectedStart = {
                open: true,
                date: new Date(2017, 3, 18, 0, 0, 0, 0)
            };

            let controller = createController('');
            expect(controller.start).toEqual(expectedStart);
        });

        it('should assign right endDate', () => {
            let date = new Date(2017, 3, 25);
            spyOn(DateHelper, 'now').and.returnValue(date);
            let expectedEnd = {
                open: true,
                date: new Date(2017, 3, 25, 0, 0, 0, 0)
            };

            let controller = createController('');
            expect(controller.end).toEqual(expectedEnd);
        });

        it('should fetch data using ExportHistory', () => {
            let date = new Date(2017, 3, 25);
            spyOn(DateHelper, 'now').and.returnValue(date);
            spyOn(ExportHistory, 'fetch').and.callThrough();
            let controller = createController('');
            controller.submit();
            expect(ExportHistory.fetch).toHaveBeenCalledWith('18/04/2017', '25/04/2017', ['xpub1', 'xpub2', { address: 'some_address', archived: false, isWatchOnly: false, label: 'some_label' }, { address: 'watch_address', archived: false, isWatchOnly: true }], 'btc');
            // expect(ExportHistory.fetch).toHaveBeenCalledTimes(1);
        });

        it('should format filename correctly', () => {

            let date = new Date(2017, 3, 25);
            spyOn(DateHelper, 'now').and.returnValue(date);
            let expectedFilename = "history-18-04-2017-25-04-2017.csv";

            let controller = createController('');
            expect(controller.filename()).toEqual(expectedFilename);
        });
    });
});
