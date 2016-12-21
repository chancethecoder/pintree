import { expect } from 'chai';
import testUtils from './utils';

describe('application launch', function () {

    beforeEach(testUtils.beforeEach);
    afterEach(testUtils.afterEach);

    it('shows hello world text on screen after launch', function () {
        // end to end test code here
        return this.app.client.getText('#greet').then(function (text) {
            expect(text).to.equal('Dashboard');
        });
    });
});
