const bcrypt = require("bcryptjs");
const pool = require("../db/index");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

exports.signup_get = (req, res) => {
  res.render("signup");
};

exports.signup_post = [
  body("firstname")
    .trim()
    .isLength({ min: 1 })
    .withMessage("first name is required"),
  body("lastname")
    .trim()
    .isLength({ min: 1 })
    .withMessage("last name is required"),
  body("username")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("password must have atleast 6 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value != req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
  async (req, res, next) => {
    const { firstname, lastname, username, password } = req.body;
    const isAdmin = req.body.admin;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", { errors: errors.array() });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await pool.query(
        "INSERT INTO users (firstname,lastname,username,password,admin) values($1,$2,$3,$4,$5)",
        [firstname, lastname, username, hashedPassword, isAdmin]
      );
      res.redirect("/login");
    } catch (err) {
      if (err.code === "23505") {
        return res.render("signup", {
          errors: [{ msg: "Email is already registered" }],
        });
      }
      return next(err);
    }
  },
];

exports.login_get = (req, res) => {
  res.render("login");
};

/*exports.login_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
});*/
exports.login_post = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render("login", { errors: [{ msg: info.message }] });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  })(req, res, next);
};


exports.grant_membershipPost = async (req, res) => {
  if (req.body.passcode === process.env.MEMBER_PASSCODE) {
    await pool.query(
      `UPDATE  users
          SET membership_status=true
          WHERE id=$1`,
      [req.user.id]
    );
    const { rows } = await pool.query(`SELECT * FROM users WHERE id=$1`, [
      req.user.id,
    ]);
    const updatedUser = rows[0];
    req.login(updatedUser, (err) => {
      if (err) return next(err);
      res.redirect("/messages");
    });
  } else {
    res.render("grant-membership", {
      error: "Invalid passcode. Try again!",
    });
  }
};
