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
describe('Posts Api', () => { // the tests container
          let token="";
          let deleteID="";
          let deleteAfterId="";
          before(async()=> {  
            
            let user={
            email:"aishaM@gmail.com",password:"1234"
            }
            const res= await chai.request(app).post("/users/login").send(user);
            token=  res.body.token;
           
          }); 

    describe("Get Posts", () => {
        it("should get an array of posts", async () => {
         const response = await chai.request(app).get("/posts/");
         response.body.should.be.a("array");
         response.body.length.should.be.eql(4);
        });
        
      });

    describe("Get Posts for User", () => {
        it("should get an array of posts for a user", async () => {
         const response = await chai.request(app).get("/posts/user?id=6214c24f645f054588c9fbac").set({ "Authorization": `Bearer ${token}` });
         response.body.should.be.a("array");
         response.body.length.should.be.eql(3);
        });
        
      });

    describe("Get Feed for User", () => {
        it("should get an array of posts for a user", async () => {
         const response = await chai.request(app).get("/posts/feed?id=6214c24f645f054588c9fbac").set({ "Authorization": `Bearer ${token}` });
         response.body.should.be.a("array");
         response.body.length.should.be.eql(1);
        });

        it("should get an array of posts for a user with filter", async () => {
            const response = await chai.request(app).get("/posts/feed?id=6214c24f645f054588c9fbac&filter=office").set({ "Authorization": `Bearer ${token}` });
            response.body.should.be.a("array");
            response.body.length.should.be.equal(0);
           });

        it("should not get an array of posts for an invalid user", async () => {
            const response = await chai.request(app).get("/posts/feed?id=6213975673c8ad3c9f8c9bb5").set({ "Authorization": `Bearer ${token}` });
            expect(response.status).to.equal(401);
            expect(response.body.message).to.equal("User not found");
           });
        
      });

    describe("Create Post", () => {
        it("should create post for a user", async () => {
        let post={userID:"6214c24f645f054588c9fbac",caption:"My first day at office"};
         const response = await chai.request(app).post("/posts/create").set({ "Authorization": `Bearer ${token}` }).send(post);
         deleteID=response.body._id;
         response.body.should.have.property("_id");
         response.body.should.have.property("userID");
         response.body.should.have.property("caption");
         
        });

        it("should not create post for an invalid user", async () => {
            let post={userID:"6213975673c8ad3c9f8c9bb5",caption:"My first day at office"};
            const response = await chai.request(app).post("/posts/create").set({ "Authorization": `Bearer ${token}` }).send(post);
            expect(response.status).to.equal(404);
            expect(response.body.message).to.equal("Cannot find user");
           });
        
      });
    
      describe("Delete Post", () => {
        it("should delete post for a user", async () => {
        
         const response = await chai.request(app).get(`/posts/delete/${deleteID}`).set({ "Authorization": `Bearer ${token}` });
         expect(response.body.message).to.equal("Post deleted");
         
        });

        
      });

      describe("Get Post", () => {

        it("should  get post with a sepcific ID", async () => {
        
            const response = await chai.request(app).get(`/posts/621cbe95a4ae4f4e86be2f4f`).set({ "Authorization": `Bearer ${token}` });
            expect(response.body._id).to.equal("621cbe95a4ae4f4e86be2f4f");
            
           });

        it("should not get post with invalid ID", async () => {
        
         const response = await chai.request(app).get(`/posts/621cc2a744463f545ca5cbd0`).set({ "Authorization": `Bearer ${token}` });
         expect(response.body.message).to.equal("Cannot find post");
         expect(response.status).to.equal(404);
        });

        
      });

      describe("Update Post", () => {
        let post={caption:"first day at work"};
        it("should update a post", async () => {
        
            const response = await chai.request(app).post(`/posts/update/621cbe95a4ae4f4e86be2f4f`).set({ "Authorization": `Bearer ${token}` }).send(post);
            expect(response.body._id).to.equal("621cbe95a4ae4f4e86be2f4f");
            
           });

        it("should not update post with invalid ID", async () => {
        
         const response = await chai.request(app).post(`/posts/update/621cc2a744463f545ca5cbd0`).set({ "Authorization": `Bearer ${token}` }).send(post);
         expect(response.body.message).to.equal("Cannot find post");
         expect(response.status).to.equal(404);
        });

        
      });


});
