describe('Releases', () => {
    
    describe('invalid post', () => {
        it('it should return error', (done) => {
        request
            .post('/releases')
            .end((err, res) => {
                expect(res.statusCode).to.eql(503); 
                expect(res.body).to.eql({error:{name: "Error", message: "Missing Fields"}});   
                done();
            });
        });
    });

});