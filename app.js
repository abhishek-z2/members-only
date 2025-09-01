const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path =  require("path");
const bcrypt = require("bcryptjs");
const pool = require("./db/index")
require("dotenv").config();
const LocalStrategy = require("passport-local").Strategy;

const indexRouter = require("./routes/indexRouter");

const app = express();

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:false}));

passport.use(new LocalStrategy(
    async (username,password,done) => {
        try{
            const result = await pool.query("SELECT * FROM users WHERE username=$1",[username]);
            const user = result.rows[0];

            if(!user){
                return done(null,false,{message:"Incorrect email"});
            }
            const match = await bcrypt.compare(password,user.password);
            if(!match){
                return done(null,false,{message:"Incorrect Password"});
            }
            return done(null,user);
        }catch(err){
        return done(err);
        }
    }
))

passport.serializeUser(( user,done )=>{
    done(null,user.id);
})

passport.deserializeUser(async (id,done)=>{
    try{
        const result = await pool.query("SELECT * FROM users WHERE id=$1",[id]);
        const user = result.rows[0];
        done(null,user);
    }catch(err){
        done(err);
    }
})

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}));

app.use(passport.session());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    next();
})
app.use("/",indexRouter);
app.listen(3000,()=> console.log("server running on port http:/localhost:3000"));

