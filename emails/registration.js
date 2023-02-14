const keys = require("../keys");

module.exports = function (email) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: "Account ist erstellt",
    html: `
    <h1>Herzlich willkommen in unserem Shop</h1>
    <p>Sie haben sich erfolgreich registriert mit email - ${email}</p>
    <hr/>
    <a href="${keys.BASE_URL}">StorWebKurse</a>
    `,
  };
};
