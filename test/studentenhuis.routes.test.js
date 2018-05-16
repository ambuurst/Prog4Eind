const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')

chai.should()
chai.use(chaiHttp)

describe('Studentenhuis API POST', () => {
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .set("X-Access-Token", "ABCD")
            .send({})
            .end((err, res) => {
                res.should.not.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                done()
            });
    })

    it('should return a studentenhuis when posting a valid object', (done) => {


        done()
    })

    it('should throw an error when naam is missing', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    it('should throw an error when adres is missing', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })
})

describe('Studentenhuis API GET all', () => {
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .set("X-Access-Token", "ABCD")
            .send({})
            .end((err, res) => {
                res.should.not.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                done()
            });
    });

    it('should return all studentenhuizen when using a valid token', (done) => {

       chai.request(server)
            .get('/api/studentenhuis')
            .end( (err, res) => {
            res.should.have.status(401);
        });
        done()
    })
})

describe('Studentenhuis API GET one', () => {
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .set("X-Access-Token", "ABCD")
            .send({})
            .end((err, res) => {
                res.should.not.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                done()
            });
    })

    it('should return the correct studentenhuis when using an existing huisId', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    it('should return an error when using an non-existing huisId', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })
})

describe('Studentenhuis API PUT', () => {
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .put('/api/studentenhuis/1')
            .set("X-Access-Token", "ABCD")
            .send({})
            .end((err, res) => {
                res.should.not.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                done()
            });
    })

    it('should return a studentenhuis with ID when posting a valid object', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    it('should throw an error when naam is missing', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    it('should throw an error when adres is missing', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })
})

describe('Studentenhuis API DELETE', () => {
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .delete('/api/studentenhuis/1')
            .set("X-Access-Token", "ABCD")
            .send({})
            .end((err, res) => {
                res.should.not.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                done()
            });
    })

    it('should return a studentenhuis when posting a valid object', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    it('should throw an error when naam is missing', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    it('should throw an error when adres is missing', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })
})