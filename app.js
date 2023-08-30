//jshint esversion:6
require("dotenv").config();
const bodyParser = require("body-parser");
const express=require("express");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


const app=express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:"encryption sentence.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/tourneyDB",{useNewUrlParser:true});

const userSchema= new mongoose.Schema({
    email: String,
    password: String,

});
console.log("con mongo")
userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",userSchema);

const registrationSchema = {
  fname: String,
  lname: String,
  age: Number,
  gender: String,
  email: String,
  contact: Number,
  eventname: String,
  createdby: String
};

const Registration = mongoose.model("Registration", registrationSchema);

const eventSchema = {
  eventname: String,
  datetime: String,
  eligibility: String,
  modeofconduct: String,
  venue: String,
  fees: String,
  description: String,
  host: String,
  hostcontact: Number,
  hostemail: String,
  createdby:String
};

const Event = mongoose.model("Event", eventSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res) {
    res.render("home");
});

app.get("/login",function(req,res) {
  if(req.isAuthenticated()){
    res.redirect("events",{
      username:req.user.username,
      });
  } else{
    res.render("login");
  }
});

app.get("/register",function(req,res) {
    res.render("register");
});

app.get("/events",function(req,res){
    if(req.isAuthenticated()){
      Event.find({}, function(err, events){
        res.render("events", {
          username:req.user.username,
          events: events
          });
      });
    } else{
        res.redirect("/login");
    }
});

app.get("/myevents",function(req,res){
  if(req.isAuthenticated()){
    Event.find({createdby: req.user.username}, function(err, events){
      res.render("myevents", {
        username:req.user.username,
        events: events
        });
    });
  } else{
      res.redirect("/login");
  }
});

app.get("/createevent",function(req,res){
  if(req.isAuthenticated()){
      res.render("createevent",{
        username:req.user.username
      });
  } else{
      res.redirect("/login");
  }
});

app.get('/logout', function(req, res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect('/');
        }
    });
  });

  app.get("/viewregistrations",function(req,res){
    if(req.isAuthenticated()){
      Registration.find({eventname:req.user.eventname}, function(err, registrations){
        res.render("viewregistrations",{
          username: req.user.username,
          eventname:req.body.eventname,
          registrations:registrations
        })
      });
      }
       else{
        res.redirect("/login");
      }
  });

app.post("/register",function(req,res){
    User.register({username:req.body.username},req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/events");
            });
        }
    });
});

app.post("/login",function(req,res){
    const user=new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/events");
            });
        }
    });
});

app.post("/eventregistration",function(req,res){
  if(req.isAuthenticated()){
      res.render("eventregistration",{
        username: req.user.username,
        eventname:req.body.eventname
      });
  } else{
      res.redirect("/login");
  }
});

app.post("/viewregistrations",function(req,res){
  if(req.isAuthenticated()){
    const eventsearch= req.body.eventname;
    Registration.find({eventname:eventsearch}, function(err, registrations){
      res.render("viewregistrations",{
        username: req.user.username,
        eventname:req.body.eventname,
        registrations:registrations
      })
    });
    }
     else{
      res.redirect("/login");
    }
});

app.post("/events",function(req,res){
  if(req.isAuthenticated()){
      const registration = new Registration({
        fname: req.body.fname,
        lname: req.body.lname,
        age: req.body.age,
        gender: req.body.gender,
        email: req.body.email,
        contact: req.body.contact,
        eventname: req.body.eventname,
        createdby: req.body.createdby
      });
    
      registration.save(function(err){
        if (!err){
          res.redirect("/events");
        };
      });
  } else{
      res.redirect("/login");
  }
});

app.post("/myevents",function(req,res){
  if(req.isAuthenticated()){
     const event = new Event({
        eventname: req.body.eventname,
        datetime: req.body.datetime,
        eligibility: req.body.eligibility,
        modeofconduct: req.body.modeofconduct,
        venue: req.body.venue,
        fees: req.body.fees,
        description: req.body.description,
        host: req.body.host,
        hostcontact: req.body.contact,
        hostemail: req.body.hostemail,
        createdby:req.body.createdby
     });
    
      event.save(function(err){
        if (!err){
            res.redirect("/myevents");
        }
      });
  } else{
      res.redirect("/login");
  }
});

app.listen(3000,function(){
    console.log("server started");
});





// Post.findAll({createdby: req.user.username}, function(err, posts){
//   res.render("myevents", {
//     username:req.user.username,
//     events:events
//   });
// });