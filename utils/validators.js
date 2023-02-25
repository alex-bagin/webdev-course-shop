const { body } = require('express-validator');
const User = require('../models/User');

exports.registerValidators = [
  body('name', 'Name muss min. 3 Buchstaben haben').isLength({ min: 3 }).trim(),
  body('email')
    .isEmail()
    .withMessage('Geben Sie eine korrekte Email ein')
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('Diese Email ist schon vergeben');
        }
      } catch (error) {
        console.log(error);
      }
    })
    .normalizeEmail(),
  body('password', 'Passwort muss min. 4 Zeichen haben')
    .isLength({ min: 4, max: 56 })
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password muss gleich sein');
      }
      return true;
    })
    .trim(),
];

exports.loginValidators = [
  body('email')
    .isEmail()
    .withMessage('Geben Sie eine korrekte Email ein')
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (!user) {
          return Promise.reject('Dieser Benutzer ist nicht bekannt');
        }
      } catch (error) {
        console.log(error);
      }
    })
    .normalizeEmail(),
  body('password', 'Passwort muss min. 4 Zeichen haben')
    .isLength({ min: 4, max: 56 })
    .isAlphanumeric()
    .trim(),
];

exports.courseValidators = [
  body('title', 'Mindestlänge des Titels beträgt 3 Buchstaben').isLength({ min: 3 }),
  body('price', 'Geben Sie korrekten Preis an').isNumeric(),
  body('img', 'Geben Sie korrekte Url an').isURL(),
];
