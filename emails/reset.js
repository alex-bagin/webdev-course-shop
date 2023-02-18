const keys = require("../keys");

module.exports = function (email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: "Wiederherstellung des Zugangs",
    html: `
    <h1>Sie haben das Passwort vergessen?</h1>
    
    <p>Wenn nicht, dann können Sie diese Nachricht ignorieren.</p>
    <p>Ansonsten kliken Sie auf den Link unten:</p>
    <p><a href="${keys.BASE_URL}/auth/password/${token}">Zugang wiederherstellen</a></p>
    <hr/>
    <h4><a href="${keys.BASE_URL}">StorWebKurse</a></h4>
    `,
  };
};
