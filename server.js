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
			const { email, pincode, date } = req.body;

			const OTP = functions.generateOTP();

			functions.sendEmail(email, 'HelloVaccine OTP', `OTP for HelloVaccine is ${OTP}.`, err => {
				if (err) console.log(err);
			});

			const usersCollection = db.collection('users');
			usersCollection.insertOne({ email, OTP, pincode, date }).catch(err => console.log(err));
			res.json({ status: 200, message: 'Email sent successfully!' });
		});

		app.post('/verifyOTP', async (req, res, next) => {
			const { email, OTP } = req.body;

			const usersCollection = db.collection('users');
			var obj = await usersCollection.findOne({ email });

			if (!obj) res.status(500).json({ message: 'E-mail not found' });

			if (obj.OTP == Number(OTP)) {
				await usersCollection.updateOne(
					{ email },
					{
						$set: {
							email,
							pincode: obj.pincode,
							date: obj.date,
							isVerified: true,
						},
					},
					{ new: true }
				);
				res.json({ status: 200, message: 'Verified' });
			} else {
				res.status(401).json({ message: 'OTP wrong' });
			}
		});

		app.listen(port, () => {
			console.log(`Example app listening at http://localhost:${port}`);
		});
	})
	.catch(err => console.error(err));
