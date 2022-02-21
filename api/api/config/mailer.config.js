const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    pool: true,
    host: "mail.infomaniak.com",
    port: 587,
    auth: {
        user: "gjacopin@grinto.fr",
        pass: "GuiJac14",
    },
});

const config = (to, subject, body) => {
    return {
        from: "gjacopin@grinto.fr",
        to: to,
        subject: subject,
        html: body
    }
};

const sendMail = async (to, subject, body) => {
    const mail = config(to, subject, body)
    return await transporter.sendMail(mail);
}

module.exports = sendMail;