const keys = require("../keys");

module.exports = function (email) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: "Account ist erstellt",
    html: `
    <h1>Herzlich willkommen in unserem Shop</h1>
    
    <h4>Sie haben sich erfolgreich registriert mit der Email - ${email}</h4>
    <hr/>
    <h4><a href="${keys.BASE_URL}">StorWebKurse</a></h4>
    `,
  };
};
