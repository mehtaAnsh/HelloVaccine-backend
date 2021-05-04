require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const functions = require('./functions');

app.use(cors());
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

		app.post('/mail', async (req, res, next) => {
			if (!req.body.email || !req.body.pin || !req.body.date) {
				res.status(500).json({ message: 'Parameters missing' });
			}

			const { email, pin, date } = req.body;
			const OTP = functions.generateOTP();

			const usersCollection = await db.collection('users');
			const temp = await usersCollection.findOne({ email });
			temp
				? await usersCollection
						.findOneAndUpdate(
							{ email },
							{
								$set: {
									OTP,
									pin,
									date,
									isVerified: false,
								},
							}
						)
						.then(dbres => {
							console.log('updated');
							if (dbres.ok) {
								functions.sendEmail(
									email,
									'HelloVaccine OTP',
									`OTP for HelloVaccine is ${OTP}.`,
									err => {
										if (err) res.status(500).json({ message: 'Email server error.' });
									}
								);
								res.status(200).json({ message: 'Email sent successfully!' });
							} else res.status(500).json({ message: 'Database error.' });
						})
				: await usersCollection
						.insertOne({ email, OTP, pin, date, isVerified: false })
						.then(() => {
							functions.sendEmail(email, 'HelloVaccine OTP', `OTP for HelloVaccine is ${OTP}.`, err => {
								if (err) console.log(err);
							});
							res.status(200).json({ message: 'Email sent successfully!' });
						})
						.catch(err => console.log(err));
		});

		app.post('/verifyOTP', async (req, res, next) => {
			console.log(req.body);
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
							isVerified: true,
						},
						$unset: {
							OTP,
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
