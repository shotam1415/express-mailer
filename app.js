const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
// const port = 3002;

// 送信用アカウントの設定（ここでGmailのメールアドレスとアプリパスワードを利用します。）
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
      user: process.env.GMAILUSER,
      pass: process.env.GMAILPASSWORD,
  },
});

//メールの文面
async function sendmail(request, res) {
  await new Promise((resolve, reject) => {
    // const name = req.body.name;
    // const furigana = req.body.furigana
    
    // const textContent = "お問い合わせ、ありがとうございました。\n"+
    //                     "＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n"+
    //                     "【名前】"+name+"\n"+
    //                     "【ふりがな】"+furigana+"\n"+
    //                     "＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n"

    // const toAdminMail = {
    //   from: process.env.USER,
    //   to:   process.env.MAILER_USER,
    //   subject: `【お問い合わせ】${name}様より`,
    //   text: textContent};

    // transporter.sendMail(toAdminMail, function (err, info) {
    //   if (err) {
    //     console.log(err);
    //     reject(err);
    //   } else {
    //     console.log(info);
    //     resolve(info);
    //   }
    // });

    const body = request.json()

    const name = body.data.name
    const email = body.data.email
    const tel = body.data.phone
    const message = body.data.message


    //pomie側へのメール内容
    const toHostMailData = {
        from: `${message}`,//入力側
        to: process.env.GMAILUSER, // pomie
        subject: `コーポレートサイトからお問い合わせが届きました。`, // タイトル
        text: `${message}`,
        html: `
        <p>コーポレートサイトからお問い合わせが届きました。</p>
        <p>======================</p>
        <p>お名前：</p>
        <p>${name}</p>
        <p>メールアドレス：</p>
        <p>${email}</p>
        <p>電話番号：</p>
        <p>${tel}</p>
        <p>メッセージ：</p>
        <p>${message}</p>
        <p>======================</p>
        `,
    };
    //送信者へのメール内容
    const toCustomerMailData = {
        from: process.env.GMAILUSER,//pomie
        to: `${email}`, // 送信者
        subject: `お問い合わせありがとうございます`, // タイトル
        text: `${message}`,
        html: `
        <p>お問い合わせいただきありがとうございます。</p>
        <p>以下の内容で受け付けましたのでご確認ください。</p>
        <p>いただいたお問い合わせ内容につきまして、担当者よりご回答のメールをお送りいたしますので、今しばらくお待ちくださいませ。</p>
        <p>======================</p>
        <p>お名前：</p>
        <p>${name}</p>
        <p>メールアドレス：</p>
        <p>${email}</p>
        <p>電話番号：</p>
        <p>${tel}</p>
        <p>メッセージ：</p>
        <p>${message}</p>
        <p>======================</p>

        `,
    };


    try {
        await transporter.sendMail(toHostMailData);
        await transporter.sendMail(toCustomerMailData);

        // console.log('管理者向けメール送信成功');
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        // console.error('メール送信エラー:', error);
        return new Response('メール送信エラー', { status: 500 });
    }
  });
}

//POSTのパラメータを取得できるようにする
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.listen(port);

app.post("/contact", (req, res) => {
  sendmail(req, res);
  res.status(201).send("ok");
});
