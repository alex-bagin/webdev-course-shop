const { Router } = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = Router();

router.get('/', auth, async (req, res) => {
  res.render('profile', {
    title: 'Profil',
    isProfile: true,
    user: req.user.toObject(),
  });
});

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const toCange = {
      name: req.body.name,
    };

    if (req.file) {
      toCange.avatarUrl = req.file.path;
    }

    Object.assign(user, toCange);
    await user.save();
    res.redirect('/profile');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
