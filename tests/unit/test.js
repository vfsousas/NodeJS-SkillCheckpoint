const {errorHandling} = require('../../src/apis/helpers');

const error = {
    name: "test error",
    maessage: "test error message"
};
const resp = {}

describe('helpers', () => {
    
    describe('error handler', () => {
        it('it should return name and message', (done) => {
            let result = errorHandling(error, resp)
            expect(result).to.eql('error')
        });
    });
})
