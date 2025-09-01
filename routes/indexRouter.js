const {Router} = require("express");
const { ensureAuthenticated,ensureAdmin } = require("../utility/ensureAuth");

const indexRouter = Router();
const authController = require("../controllers/authController");
const messageController = require("../controllers/messageController");



indexRouter.get("/signup",authController.signup_get);
indexRouter.post("/signup",authController.signup_post);
indexRouter.get("/login",authController.login_get);
indexRouter.post("/login",authController.login_post);
indexRouter.get("/",(req,res)=>{
    res.render("index");
})
indexRouter.get("/logout",(req,res,next)=>{
    req.logout(err =>{
        if(err) next(err);
    })
    res.redirect("/");
})

indexRouter.get("/messages",messageController.messagesGet);
indexRouter.post("/messages",messageController.messagesPost);
indexRouter.post("/grant-membership",ensureAuthenticated,authController.grant_membershipPost);
indexRouter.post("/:id/delete",ensureAuthenticated,ensureAdmin,messageController.deleteMessage);

module.exports = indexRouter;