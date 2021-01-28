const express = require('express');
const path = require('path');
const cors=require('cors');
var mongodb=require("mongodb");
var MongoClient=mongodb.MongoClient;
var url=process.env.url;
var fs=require('fs');
const app = express();
const PORT = process.env.PORT || 8080; // Step 1
var dbname="hacker";

require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use('/', express.static(path.join(__dirname, '/public')));
app.get("/", express.static(path.join(__dirname, "./public")));


  app.get("/getteamnames",(req,res)=>{
    MongoClient.connect(url,function(err,client)
    {
        if(err)
        {
            console.log("Error while connecting to the MongoDB Atlas",err)
        }
        var db=client.db(dbname);
        var getData=db.collection("teamnames").find({}).toArray();
        getData.then(function(err,data)
        {
            if(err)
            {
                client.close();
                res.json({message:err})
            }
            else
            {
                client.close();
                res.json({message:data})
            }
        })
    })
})
app.post("/getteamnamedata",(req,res)=>{
    MongoClient.connect(url,async function(err,client){
        if(err)
        {
            console.log("Error while connecting to MongoDB Atlas",err);
        }
        try{
             var db=client.db(dbname);
             var findData1=await db.collection("teamnames").find({"team_name":
             { $regex: new RegExp("^" + req.body.team_name.toLowerCase()+ "$", "i") } }).toArray();
            client.close();
            res.json({
                message:findData1
            })
        }
        catch(error)
        {
            client.close();
            res.json({
                message:error
            })
        }
    })
})
app.put("/assignwinner",(req,res)=>{
    MongoClient.connect(url,async function(err,client){
        if(err)
        {
            console.log("Error while connecting to MongoDB Atlas",err);
        }
        try{
        var db=client.db(dbname);
        var findData1=await db.collection("teamnames").find({team_name:req.body.team_name1}).toArray();
        var findData2=await db.collection("teamnames").find({team_name:req.body.team_name2}).toArray();
        let score1=0;
        let score2=0;
        let winner1=0;
        let winner2=0;
        let tie1=0;
        let tie2=0;
        let loss1=0;
        let loss2=0;
        
        if(req.body.score1==='winner' && req.body.score2=='looser')
        {
            score1=3;
            winner1=1;
            loss2=1;
        }
        if(req.body.score2==='winner' && req.body.score1=='looser')
        {
            score2=3;
            winner2=1;
            loss1=1;
        }
        if(req.body.score1==='tie' && req.body.score2==='tie')
        {
            score1=1;
            score2=1;
            tie1=1;
            tie2=1;
        }
   
        var updateScore1=findData1[0].score+score1;
        var updateScore2=findData2[0].score+score2;
        var updateWins1=findData1[0].wins+winner1;
        var updateWins2=findData2[0].wins+winner2;
        var updateLosses1=findData1[0].losses+loss1;
        var updateLosses2=findData2[0].losses+loss2;
        var updateTies1=findData1[0].ties+tie1;
        var updateTies2=findData2[0].ties+tie2;
        var updateData1=await db.collection("teamnames").findOneAndUpdate({team_name:req.body.team_name1},{$set:{score:updateScore1,wins:updateWins1,losses:updateLosses1,ties:updateTies1}});
        var updateData2=await db.collection("teamnames").findOneAndUpdate({team_name:req.body.team_name2},{$set:{score:updateScore2,wins:updateWins2,losses:updateLosses2,ties:updateTies2}});
        res.json({message:"Data Updated SuccessFully"});
    }
    catch(error)
    {
        console.log(error);
    }

    })
})
app.post("/addteamname",(req,res)=>{
    MongoClient.connect(url,async function(err,client){
        if(err)
        {
            console.log("Error while connecting to MongoDB Atlas",err);
        }
        try{
        var db=client.db(dbname);
        var findData=await db.collection("teamnames").find({team_name:req.body.team_name}).toArray();
        if(findData.length>0)
        {
            client.close();
            res.json({message:"Team Name Already Exists, Kindly Provide a new team name"})
        }
        else
        {
            var insertData=await db.collection("teamnames").insertOne(req.body);
            client.close();
            res.json({message:"Data inserted SuccessFully"});
        }
        }
        catch(error)
        {
            client.close();
            res.json({message:error})
        }
    })
})

app.listen(PORT, console.log(`Server is starting at ${PORT}`));