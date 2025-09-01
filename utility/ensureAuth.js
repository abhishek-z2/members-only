function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
function ensureAdmin(req,res,next) {
    if(req.user && req.user.admin===true){
        return next();
    }
    res.status(403).send("Forbidden");
}
module.exports = { ensureAuthenticated , ensureAdmin };