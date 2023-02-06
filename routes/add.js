const { Router } = require("express");
const Course = require("../models/Course");
const User = require("../models/User");
const router = Router();

router.get("/", (req, res) => {
  res.render("add", {
    title: "Kurs hinzufügen",
    isAdd: true,
  });
});

router.post("/", async (req, res) => {
  const course = new Course({
    title: req.body.title,
    price: req.body.price,
    img: req.body.img,
    userId: req.user._id,
  });

  try {
    await course.save();
    res.redirect("/courses");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
