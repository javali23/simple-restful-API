var express= require("express");
var app=express();

//body-parser middleware  
const bodyParser=require('body-parser'); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let server= require('./server');
let middleware = require('./middleware');

const MongoClient= require('mongodb').MongoClient;
const url='mongodb://localhost:127.0.0.1:27017/';
const dbName='hospitalmanagement';

let db
MongoClient.connect(url,{
    useUnifiedTopology: true},(err,client)=>{                   //useUnifiedTopology: constructor enabling
    if(err)
    return log.console(err);
    db=client.db(dbName);
    console.log(`Connected MongoDB: ${url}`);
   console.log(`Database: ${dbName}`);
});


app.get('/hospitaldetails', middleware.checkToken, function(req,res ){
    console.log("fetching data from hospital collection");
    var data = db.collection('hospital').find().toArray().then(result=> res.json(result));
});

app.get('/ventilatordetails', middleware.checkToken, function(req,res ){
    console.log("ventilator information");
    var ventilatordetails = db.collection('ventilator').find().toArray().then(result=> res.json(result));
});

app.post('/searchventbystatus', middleware.checkToken, (req,res)=> {
    var status = req.body.status;
    console.log(status);
    var ventilatordetails = db.collection('ventilator').find({"status": status}).toArray().then(result=> res.json(result));
   
});

app.post('/searchventbyname', middleware.checkToken, (req,res)=> {
    var name = req.body.name;
    console.log(name);
    var ventilatordetails = db.collection('ventilator').find({'name':new RegExp(name, 'i')}).toArray().then(result=> res.json(result));
});

app.post('/searchhospital', middleware.checkToken, (req,res)=> {
    var name = req.body.name;
    console.log(name);
    var hospitaldetails = db.collection('hospital').find({'name':new RegExp(name, 'i')}).toArray().then(result=> res.json(result));
});

app.put('/updateventilator', middleware.checkToken, (req,res)=>{
    var ventid = {ventilatorId: req.body.ventilatorId };
    console.log(ventid);
    var newvalues = { $set:{ status:req.body.status} };
    db.collection("ventilator").updateOne(ventid, newvalues, function(err,result){
        res.json('1 document updated');
        if (err) throw err;
    });
});

app.post('/addventilatorbyuser', middleware.checkToken, (req,res)=>{
    var hId = req.body.hId;
    var ventilatorId = req.body.ventilatorId;
    var status = req.body.status;
    var name = req.body.name;
    var item = {
        hId:hId, ventilatorId:ventilatorId, status:status, name:name
    };
    db.collection('ventilator').insertOne(item, function(err,result){
        if(err) throw err;
        res.json('item inserted');
    });
});

app.delete('/delete', middleware.checkToken, (req,res)=>{
    var myquery = req.query.ventilatorId;
    console.log(myquery);
    var myquery1 = { ventilatorId: myquery};
    db.collection('ventilator').deleteOne(myquery1, function(err, obj){
        if(err) throw err;
        res.json("1 document deleted");
    });
});
app.listen(1100);