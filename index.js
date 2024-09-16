const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const userModel = require("./models/user_model");
const postModel = require("./models/post");
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookieparser());

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get("/", function(req, res){
    res.render("index");
})

app.post("/register", function(req, res){
    let {name, username, password,email, age} = req.body;

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt,async function(err, hash) {
            let user = await userModel.create({
                name,
                password: hash,
                username,
                email,
                age
            })
            var token = jwt.sign({ email: email }, 'shhhhh');
            res.cookie("token", token);
            res.redirect("/");
        });
    });

})


app.get("/login", function(req, res){
    res.render("login");
})

app.get("/profile",isLoggedin,async function(req, res){
    let user = await userModel.findOne({email:req.user.email}).populate("posts")
    res.render("profile", {user});
})

app.post("/post",isLoggedin,async function(req, res){
    let user = await userModel.findOne({email: req.user.email});
    let {content} = req.body;
    let post =await postModel.create({
        user: user._id,
        content
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
})

app.post("/login",async function(req, res){
    let {username, password, email} = req.body;

    let user = await userModel.findOne({email,username});
    if(!user) return res.send("somthing went wrong");

    bcrypt.compare(password, user.password, function(err, result) {
        if(result){
            let token = jwt.sign({ email: email }, 'shhhhh');
            res.cookie("token", token);
            res.send("you are login")
        }
        else{
            res.redirect("/login");
        }
    });
})

app.get("/logout", function(req, res){
    res.cookie("token","");
    res.redirect("/");
})

function isLoggedin(req, res, next){
    if(req.cookies.token=="")
        {
            res.send("you have to login first");
        }
    else{
        let data = jwt.verify(req.cookies.token,'shhhhh');
        req.user = data;
    }
    next();
}

app.listen(3000);
