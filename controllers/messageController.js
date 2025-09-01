const pool = require("../db/index");

module.exports.messagesGet = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id,m.title,m.body,m.user_id,m.created_at,u.firstname from message m 
        JOIN users u ON m.user_id = u.id
        ORDER BY created_at DESC`
    );
    res.render("messages", {
      user: req.user,
      messages: result.rows,
    });
  } catch (err) {
    console.log(err);
    res.send("Error fetching message");
  }
};

module.exports.messagesPost = async (req,res) => {
    try{
        const { title,body } = req.body;
        await pool.query(
            `INSERT INTO message(user_id,title,body)
            VALUES ($1,$2,$3)`
        ,[req.user.id,title,body]);
        res.redirect("/messages");
    }catch(err){
        console.log(err);
        res.send("Error posting message");
    }
}
module.exports.deleteMessage = async (req,res,next)=>{
    try{
        console.log("deleting message with id",req.params.id);
        await pool.query(
            `DELETE FROM message WHERE id=$1`
        ,[req.params.id]);
        console.log("deleted emssage")
        res.redirect("/messages");
    }catch(err){
        next(err);
    }
}


