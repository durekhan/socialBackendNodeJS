import  chai, { expect }  from 'chai';
import chaiHttp from "chai-http";
import { required } from 'joi';
var mongoose = require('mongoose');
const {app,db}=require( "../src/app"); 
const server=require("../src/app");
var sleep = require("sleep-promise");
chai.should();
chai.use(chaiHttp);
// db.once("open",()=>{
describe('Users Api', () => { // the tests container
          var token="";
         
          beforeEach(async()=> {  
            console.log("BEFORE EACH ");
            let user={
            email:"alice@gmail.com",password:"1234"
            }
            const res= await chai.request(app).post("/users/login").send(user);
            token=  res.body.token;
            console.log("TOKEN ",token);
          }); 
    // describe("GET USERS", () => {
    //     it("should get an array of users", async () => {
    //       chai
    //         .request(server)
    //         .get("/users/")
    //         .end((error, response) => {
              
    //           response.body.should.be.a("array");
    //           response.body.length.should.be.eql(6);
    //         });
    //     });
        
    //   });
      // describe("SIGNUP", () => {
      //   // before(()=>{
      //   //   chai.request(server).delete("/users/"+"62188d5c860c952d00176ceb").end((err,res)=>{

      //   //   })
      //   // })
       
      //   it("should register a user", async () => {
      //     let user={
      //       name:"alice1",email:"alice1@gmail.com",password:"1234",DOB:"99-12-29",gender:"female"
      //     }
      //     chai
      //       .request(server)
      //       .post("/users/signup")
      //       .send(user)
      //       .end((error, response) => {
      //         console.log(response.body);
      //         response.body.should.have.property("followingList");
      //         response.body.should.have.property("_id");
      //         response.body.should.have.property("name");
      //         response.body.should.have.property("email");
      //         response.body.should.have.property("password");
      //         response.body.should.have.property("DOB");
      //         response.body.should.have.property("gender");
              
      //       });
      //   });
        
      // });
      // describe("LOGIN", () => {
      //   it("should login a user", async () => {
      //     let user={
      //       email:"alice@gmail.com",password:"1234"
      //     }
      //     chai
      //       .request(app)
      //       .post("/users/login")
      //       .send(user)
      //       .end((error, response) => {
              
      //         response.body.should.have.property("followingList");
      //         response.body.should.have.property("_id");
      //         response.body.should.have.property("name");
      //         response.body.should.have.property("email");
      //         response.body.should.have.property("password");
      //         response.body.should.have.property("DOB");
      //         response.body.should.have.property("gender");
      //         response.body.should.have.property("token");
              
      //       });
      //   });

      //   it("should not login with correct email and wrong password", async () => {
      //     let user={
      //       email:"alice@gmail.com",password:"12345"
      //     }
      //     chai
      //       .request(app)
      //       .post("/users/login")
      //       .send(user)
      //       .end((error, response) => {
             
      //         response.status.should.equal(401);
      //         expect(response.body).to.deep.equal({ message: "Invalid credentials" });
      //       });
      //   });

      //   it("should not login with incorrect email and correct password", async () => {
      //     let user={
      //       email:"alice22@gmail.com",password:"1234"
      //     }
      //     chai
      //       .request(app)
      //       .post("/users/login")
      //       .send(user)
      //       .end((error, response) => {
      //         response.status.should.equal(401);
      //         expect(response.body).to.deep.equal({ message: "Invalid credentials" });
      //       });
      //   });
        
      // });

      describe("Get User", () => {
        
        it("should get a user with id", async () => {

          console.log("DURE ",token);
          chai
            .request(app)
            .get("/users/6213975673c8ad3c9f8c9bb5")
            .set({ "Authorization": `Bearer ${token}` })
            .end((error, response) => {
              console.log("DURE ",token);
              console.log("GET USER ID ",response.body);
              response.body.should.have.property("followingList");
              response.body.should.have.property("_id");
              response.body.should.have.property("name");
              response.body.should.have.property("email");
              response.body.should.have.property("password");
              response.body.should.have.property("DOB");
              response.body.should.have.property("gender");
              
              
            });
        });
        
      });

});
//});