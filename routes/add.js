const { Router } = require('express');
const { validationResult } = require('express-validator');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const { courseValidators } = require('../utils/validators');
const router = Router();

router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Kurs hinzufügen',
    isAdd: true,
  });
});

router.post('/', auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('add', {
      title: 'Kurs hinzufügen',
      isAdd: true,
      error: errors.array()[0].msg,
      data: {
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
      },
    });
  }

  const course = new Course({
    title: req.body.title,
    price: req.body.price,
    img: req.body.img,
    userId: req.user._id,
  });

  try {
    await course.save();
    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
