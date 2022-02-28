import  chai, { expect }  from 'chai';
import chaiHttp from "chai-http";
import { required } from 'joi';
var mongoose = require('mongoose');
const {app}=require( "../src/app"); 
const server=require("../src/app");
var sleep = require("sleep-promise");
chai.should();
chai.use(chaiHttp);
// db.once("open",()=>{
describe('Users Api', () => { // the tests container
          let token="";
          let deleteID="";
          let deleteAfterId="";
          before(async()=> {  
            
            let user={
            email:"alice@gmail.com",password:"1234"
            }
            const res= await chai.request(app).post("/users/login").send(user);
            token=  res.body.token;
            // console.log("TOKEN ",token);

            let signupUser={name:"aliza",email:"aliza@gmail.com",password:"1234",DOB:"99-12-29",gender:"male"};
            const response= await chai.request(app).post("/users/signup").send(signupUser);
            console.log("GOT THE ID ",response.body._id);
            deleteID=  response.body._id;

          }); 
          after(async()=>{
            const response= await chai
            .request(app)
            .get(`/users/delete/${deleteAfterId}`)
            .set({ "Authorization": `Bearer ${token}` });

          }); 
    describe("GET USERS", () => {
        it("should get an array of users", async () => {
         const response = await chai.request(app).get("/users/");
         response.body.should.be.a("array");
         response.body.length.should.be.eql(6);
        });
        
      });

      describe("SIGNUP", () => {
       
        it("should register a user", async () => {
          let user={
            name:"alice1",email:"alice1@gmail.com",password:"1234",DOB:"99-12-29",gender:"female"
          }
          const response=await chai
            .request(app)
            .post("/users/signup")
            .send(user)
            // .end((error, response) => {
              //console.log(response.body);
              response.body.should.have.property("followingList");
              response.body.should.have.property("_id");
              response.body.should.have.property("name");
              response.body.should.have.property("email");
              response.body.should.have.property("password");
              response.body.should.have.property("DOB");
              response.body.should.have.property("gender");
              deleteAfterId=response.body._id;
           // });
        });
        
        it("should not register an existing user", async () => {
          let user={
            name:"alice1",email:"alice1@gmail.com",password:"1234",DOB:"99-12-29",gender:"female"
          }
          chai
            .request(app)
            .post("/users/signup")
            .send(user)
            .end((error, response) => {
              expect(response.status).to.equal(400);
              expect(response.body.message).to.equal("User already exists");
            });
        });
        
      });

      describe("LOGIN", () => {
        it("should login a user", async () => {
          let user={
            email:"alice@gmail.com",password:"1234"
          }
          chai
            .request(app)
            .post("/users/login")
            .send(user)
            .end((error, response) => {
              
              response.body.should.have.property("followingList");
              response.body.should.have.property("_id");
              response.body.should.have.property("name");
              response.body.should.have.property("email");
              response.body.should.have.property("password");
              response.body.should.have.property("DOB");
              response.body.should.have.property("gender");
              response.body.should.have.property("token");
              
            });
        });

        it("should not login with correct email and wrong password", async () => {
          let user={
            email:"alice@gmail.com",password:"12345"
          }
          chai
            .request(app)
            .post("/users/login")
            .send(user)
            .end((error, response) => {
             
              response.status.should.equal(401);
              expect(response.body).to.deep.equal({ message: "Invalid credentials" });
            });
        });

        it("should not login with incorrect email and correct password", async () => {
          let user={
            email:"alice22@gmail.com",password:"1234"
          }
          chai
            .request(app)
            .post("/users/login")
            .send(user)
            .end((error, response) => {
              response.status.should.equal(401);
              expect(response.body).to.deep.equal({ message: "Invalid credentials" });
            });
        });
        
      });

      describe("Get User", () => {
        
        it("should get a user with id", async () => {
          const response = await chai.request(app).get("/users/6214c24f645f054588c9fbac").set({ "Authorization": `Bearer ${token}` });
          //console.log("GET USER ID ",response.body);
          response.body.should.have.property("followingList");
          response.body.should.have.property("_id");
          response.body.should.have.property("name");
          response.body.should.have.property("email");
          response.body.should.have.property("password");
          response.body.should.have.property("DOB");
          response.body.should.have.property("gender");
              
        });

        // it("should not get a user with incorrect id", async () => {
        //   const response = await chai.request(app).get("/users/6213975673c8ad3c9f8c9bb5").set({ "Authorization": `Bearer ${token}` });
        //   //console.log("GET USER ID ",response.body);
        //   expect(response.status).to.equal(404);
        //   expect(response.body.message).to.equal("Cannot find user");
              
        // });

        
        
      });

      describe("Delete User", () => {
        
        it("should delete a user", async () => {

          //console.log("delete id ",deleteID);
          const response= await chai
            .request(app)
            .get(`/users/delete/${deleteID}`)
            .set({ "Authorization": `Bearer ${token}` });
            // .end((error, response) => {
            //console.log("DURE ",token);
            console.log("GET USER ID ",response.body);
            expect(response.body.message).to.equal("User deleted");
              
            //});
        });
        
      });

      describe("Update User", () => {
        
        it("should update a user", async () => {

          let user={name:"aishaM",email:"aishaM@gmail.com"};
          const response= await chai
            .request(app)
            .post(`/users/update/6214c24f645f054588c9fbac`)
            .send(user)
            .set({ "Authorization": `Bearer ${token}` });
            
            expect(response.body.name).to.equal("aishaM");
            expect(response.body.email).to.equal("aishaM@gmail.com");
            
        });
        
      });

      describe("Follow User", () => {
        
        it("should not follow a user with invalid ID", async () => {

          let user={userID:"6213975673c8ad3c9f8c9bb5",followerID:"62160403b04ed21de59d8b0b"};
          const response= await chai
            .request(app)
            .post(`/users/follow`)
            .send(user)
            .set({ "Authorization": `Bearer ${token}` });
            
            expect(response.body.message).to.equal("Cannot find user");
            expect(response.status).to.equal(404);
            
        });

        it("should not follow an already followed user", async () => {

          let user={userID:"6214c24f645f054588c9fbac",followerID:"62160403b04ed21de59d8b0b"};
          const response= await chai
            .request(app)
            .post(`/users/follow`)
            .send(user)
            .set({ "Authorization": `Bearer ${token}` });
            
            expect(response.body.message).to.equal("Already a follower");
            expect(response.status).to.equal(400);
            
        });

        it("should follow a user", async () => {

          let user={userID:"6214c24f645f054588c9fbac",followerID:"62188d5c860c952d00176ceb"};
          const response= await chai
            .request(app)
            .post(`/users/follow`)
            .send(user)
            .set({ "Authorization": `Bearer ${token}` });
            
            expect(response.body.followingList.length).to.equal(2);
            
        });

        it("should throw an error on a user with invalid ID", async () => {

          let user={userID:"123",followerID:"62160403b04ed21de59d8b0b"};
          const response= await chai
            .request(app)
            .post(`/users/follow`)
            .send(user)
            .set({ "Authorization": `Bearer ${token}` });
            
            expect(response.status).to.equal(500);
            
        });
        
      });

      describe("Unfollow User", () => {
        
        it("should not follow a user with invalid ID", async () => {

          let user={userID:"6213975673c8ad3c9f8c9bb5",followerID:"62160403b04ed21de59d8b0b"};
          const response= await chai
            .request(app)
            .post(`/users/unfollow`)
            .send(user)
            .set({ "Authorization": `Bearer ${token}` });
            
            expect(response.body.message).to.equal("Cannot find user");
            expect(response.status).to.equal(404);
            
        });

        
        it("should unfollow a user", async () => {

          let user={userID:"6214c24f645f054588c9fbac",followerID:"62188d5c860c952d00176ceb"};
          const response= await chai
            .request(app)
            .post(`/users/unfollow`)
            .send(user)
            .set({ "Authorization": `Bearer ${token}` });
            
            expect(response.body.followingList.length).to.equal(1);
            
        });

        it("should throw an error on a user with invalid ID", async () => {

          let user={userID:"123",followerID:"62160403b04ed21de59d8b0b"};
          const response= await chai
            .request(app)
            .post(`/users/unfollow`)
            .send(user)
            .set({ "Authorization": `Bearer ${token}` });
            
            //expect(response.body.message).to.equal("Cannot find user");
            expect(response.status).to.equal(500);
            
        });
        
      });

});
//});