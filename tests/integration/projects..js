describe('Projects', () => {

  describe('/GET projects', () => {
      it('it should GET all projects', (done) => {
        request
            .get('/projects')
            .end((err, res) => {
                expect(res.statusCode).to.eql(200); 
                expect(res.body).to.eql('get projects');   
              done();
            });
      });
  });

  describe('/GET invalid url', () => {
    it('it should return route not found', (done) => {
      request
          .get('/projects/test')
          .end((err, res) => {
              expect(res.statusCode).to.eql(404); 
              expect(res.body).to.eql('route not found');   
            done();
          });
    });
});

});