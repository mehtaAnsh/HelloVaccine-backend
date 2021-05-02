require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const functions = require('./functions');
const mongoose = require('mongoose');

app.use(express.json());
app.use(express.urlencoded());

const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(
	'mongodb+srv://anshm:NcuAQEwPpeA6bgRe@hellovaccine.334w6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
	{ useUnifiedTopology: true }
)
	.then(client => {
		console.log('Connected to Database');

		const db = client.db('users');

		/*
		const cursor = db
			.collection('users')
			.find()
			.toArray()
			.then(results => console.log(results));
		*/

		app.post('/mail', (req, res, next) => {
			const email = req.body.email;
			const OTP = functions.generateOTP();

			functions.sendEmail(email, 'HelloVaccine OTP', `OTP for HelloVaccine is ${OTP}.`, err => {
				if (err) console.log(err);
			});

			/* Save OTP in DB */
			const usersCollection = db.collection('users');
			usersCollection.insertOne({ email, OTP }).catch(err => console.log(err));
			res.json({ status: 200, message: 'Email sent successfully!' });
		});

		app.listen(port, () => {
			console.log(`Example app listening at http://localhost:${port}`);
		});
	})
	.catch(err => console.error(err));
