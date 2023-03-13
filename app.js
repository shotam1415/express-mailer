const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
const port = 3002;

// 送信用アカウントの設定（ここでGmailaddressとアプリパスワードを利用します。）
const transporter = nodemailer.createTransport({
  port: process.env.MAILER_PORT,
  host: process.env.MAILER_HOST,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
  secure: true,
});

//メールの文面
async function sendmail(req, res) {
  await new Promise((resolve, reject) => {
    const toGestMailData = {
      from: process.env.USER,
      to: `${req.body.email}`,
      subject: `【お問い合わせ】${req.body.name}様より`,
      text: " | Sent from: ",
      html: `<p>お問い合わせ、ありがとうございました。</p>
  <p>送信内容は以下になります。</p>
  <p>＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝</p>
  <p>【名前】${req.body.name}</p>
  <p>【メールアドレス】${req.body.email}</p>
  <p>＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝</p>
  `,
    };

    transporter.sendMail(toGestMailData, function (err, info) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });
}

//POSTのパラメータを取得できるようにする
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.listen(port);

app.post("/contact", (req, res) => {
  sendmail(req, res);
  res.status(201).send("ok");
});
