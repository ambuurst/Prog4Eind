/**
 * Testcases aimed at testing the authentication process. 
 */
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')

chai.should()
chai.use(chaiHttp)

// After successful registration we have a valid token. We export this token
// for usage in other testcases that require login.
let validToken

describe('Registration', () => {
    it('should return a token when providing valid information', (done) => {
        chai.request(server)
            .post('/api/register')
            .send({"username" : "test",
                    "lastname" : "test",
                    "email" : "test",
                    "password" : "test"})
            .end((err, res) => {

                res.should.have.status(200)
                validToken = res.body.token


                done()
            });

        // Tip: deze test levert een token op. Dat token gebruik je in
        // andere testcases voor beveiligde routes door het hier te exporteren
        // en in andere testcases te importeren via require.

         // validToken = res.body.token
         // module.exports = {
         //     token: validToken
         // }
    })


    it('should throw an error when no firstname is provided', (done) => {
        chai.request(server)
            .post('/api/register')
            .set('Accept', 'application/json')
            .send({"username" : "t",
                "lastname" : "test",
                "email" : "test",
                "password" : "test"})
            .end((err, res) => {

                res.should.have.status(412)


                done()
            });
    })

    it('should throw an error when firstname is shorter than 2 chars', (done) => {
        chai.request(server)
            .post('/api/register')
            .set('Accept', 'application/json')
            .send({"username" : "",
                "lastname" : "test",
                "email" : "test",
                "password" : "test"})
            .end((err, res) => {

                res.should.have.status(412)


                done()
            });
    })

    it('should throw an error when no lastname is provided', (done) => {
        chai.request(server)
            .post('/api/register')
            .set('Accept', 'application/json')
            .send({"username" : "test",
                "lastname" : "",
                "email" : "test",
                "password" : "test"})
            .end((err, res) => {

                res.should.have.status(412)


                done()
            });
    })

    it('should throw an error when lastname is shorter than 2 chars', (done) => {
        chai.request(server)
            .post('/api/register')
            .set('Accept', 'application/json')
            .send({"username" : "test",
                "lastname" : "t",
                "email" : "test",
                "password" : "test"})
            .end((err, res) => {

                res.should.have.status(412)


                done()
            });
    })


})

describe('Login', () => {

    it('should return a token when providing valid information', (done) => {
        chai.request(server)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send({"email" : "test",
                   "password" : "test"})
            .end((err, res) => {

                res.should.have.status(200)

                done()
            })

    })

    it('should throw an error when email does not exist', (done) => {
        chai.request(server)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send({"email" : "tes",
                "password" : "test"})
            .end((err, res) => {

                res.should.have.status(412)

                done()
            })
    })

    it('should throw an error when email exists but password is invalid', (done) => {
        chai.request(server)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send({"email" : "test",
                "password" : "tes"})
            .end((err, res) => {

                res.should.have.status(401)

                done()
            })
    })


})