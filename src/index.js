const express = require('express');
const cors = require('cors');
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');
const bodyParser = require('body-parser');
const { checkServiceCode } = require('./middleware/middleware');
const app = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: '*',
  })
);

const logs = path.resolve(__dirname, './logs/logs.txt');
const dataPathEvent = path.resolve(__dirname, './assets/events.json');
const dataPathUniversity = path.resolve(__dirname, './assets/universities.json');
const dataPathAdvisor = path.resolve(__dirname, './assets/advisors.json');
const dataPathFQA = path.resolve(__dirname, './assets/fqa.json');
const events = JSON.parse(fs.readFileSync(dataPathEvent, 'utf8'));
const universities = JSON.parse(fs.readFileSync(dataPathUniversity, 'utf8'));
const advisors = JSON.parse(fs.readFileSync(dataPathAdvisor, 'utf8'));
const fqa = JSON.parse(fs.readFileSync(dataPathFQA, 'utf8'));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Endpoint to get universities
app.get('/universities', checkServiceCode, (req, res) => {
  res.json(universities);
});

// Endpoint to get advisors
app.get('/advisors', checkServiceCode, (req, res) => {
  console.log('Here');
  console.log(advisors);
  res.json(advisors);
});

// Endpoint to get events
app.get('/fqa', checkServiceCode, (req, res) => {
  res.json(fqa);
});

// Endpoint to get events
app.get('/events', checkServiceCode, (req, res) => {
  res.json(events);
});

app.post('/report', checkServiceCode, async (req, res) => {
  const { subject, message, email, firstName, lastName } = req.body;
  const to = process.env.EMAIL;
  try {
    const info = await transporter.sendMail({
      from: email,
      to,
      subject,
      message,
    });
    console.log('Message sent: %s', info.messageId);
    res.send('Report email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
  const currentDate = new Date();
  // Log the email sending
  const logData = `${email}\User Name: ${firstName} ${lastName}\nSubject: ${subject}\nsentAt: ${currentDate}`;
  fs.appendFileSync(logs, `Email sent from: ${logData}\n'----------------------------------------\n'`);
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
