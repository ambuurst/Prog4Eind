/**
 * Created by dkroeske on 31/03/2017.
 */

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index');

chai.should();

chai.use(chaiHttp);

describe('Hello', () => {
    it('GET /apiv1/hello', (done) => {
        chai.request(server)
            .get('/apiv1/hello')
            .end( (err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
            done();
        });
    });

    // it('(GET) all the cpus from 2013', (done) => {
    //     chai.request(server)
    //         .get('/apiv2/intel/cpu?year=2013')
    //         .end(function (err, res) {
    //             res.should.have.status(200);
    //             res.body.should.be.a('array');
    //             done();
    //         })
    // });

    it('(GET) all the cpus', (done) => {
        chai.request(server)
            .get('/apiv2/intel/cpu/2013')
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.should.be.length(2);
                done();
            })
    });
});