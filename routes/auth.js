const { Router } = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const keys = require("../keys");
const regEmail = require("../emails/registration");
const resetEmail = require("../emails/reset");
const { registerValidators } = require("../utils/validators");
const { loginValidators } = require("../utils/validators");
const router = Router();

const transporter = nodemailer.createTransport(
  mg({
    auth: {
      api_key: keys.MAILGUN_API_KEY,
      domain: keys.MAILGUN_DOMAIN,
    },
  })
);

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Login",
    isLogin: true,
    registerError: req.flash("registerError"),
    loginError: req.flash("loginError"),
  });
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.post("/login", loginValidators, async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("loginError", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#login");
    }

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);

      if (areSame) {
        const user = candidate;
        req.session.user = user;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) throw err;
          res.redirect("/");
        });
      } else {
        req.flash("loginError", "Passwort ist falsch");
        res.redirect("/auth/login#login");
      }
    } else {
      req.flash("loginError", "Benutzer existiert nicht");
      res.redirect("/auth/login#login");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/register", registerValidators, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("registerError", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#register");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashPassword,
      cart: { items: [] },
    });
    await user.save();
    console.log(regEmail(email));
    // await transporter.sendMail(regEmail(email));
    res.redirect("/auth/login#login");
  } catch (error) {
    console.log(error);
  }
});

router.get("/reset", (req, res) => {
  res.render("auth/reset", {
    title: "Passwort vergessen?",
    error: req.flash("error"),
  });
});

router.post("/reset", (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash("error", "Irgendwas hat nicht funktioniert, versuchen Sie es später nochmal");
        return res.redirect("/auth/reset");
      }
      const token = buffer.toString("hex");
      const candidate = await User.findOne({ email: req.body.email });

      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token));
        res.redirect("/auth/login");
      } else {
        req.flash("error", "Email existiert nicht");
        res.redirect("/auth/reset");
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/password/:token", async (req, res) => {
  console.log(req.params.token);
  if (!req.params.token) {
    return res.redirect("/auth/login");
  }
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (user) {
      res.render("auth/password", {
        title: "Zugang wiederherstellen",
        error: req.flash("error"),
        userId: user._id.toString(),
        token: req.params.token,
      });
    } else {
      res.redirect("/auth/login");
    }
  } catch (error) {
    return res.redirect("/auth/login");
  }
});

router.post("/password", async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });
    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect("/auth/login");
    } else {
      req.flash("loginError", "Wiederherstellungszeit ist abgelaufen");
      res.redirect("/auth/login");
    }
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
