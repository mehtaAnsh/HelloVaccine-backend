require('dotenv').config();

//const moment = require('moment');
//const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const functions = require('./functions');
const notifier = require('./notifier');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/*
var mapWithPin = {};
const setConfig = (pin, date) => {
	return {
		method: 'GET',
		url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pin}&date=${date}`,
		headers: {
			accept: 'application/json',
		},
	};
};
const getSlots = async (pin, date) => {
	const config = setConfig(pin, date);
	let validCenters = { before45: [], after45: [] };

	await axios(config)
		.then(function (slots) {
			console.log(slots);
			let centers = slots.data.centers;
			centers.forEach(center => {
				const temp = center.sessions.filter(session => session.available_capacity === 0);
				if (temp.length > 0) {
					center.sessions[0].min_age_limit < 45
						? (validCenters['before45'] = [...validCenters['before45'], center])
						: (validCenters['after45'] = [...validCenters['after45'], center]);
				}
			});

			mapWithPin[pin].map(({ email, age }) => {
				slotDetails = age < 45 ? validCenters.before45 : validCenters.after45;
				if (slotDetails.length > 1)
					functions.sendEmail(
						email,
						'VACCINE AVAILABLE',
						JSON.stringify(slotDetails, null, '\t'),
						(err, result) => {
							if (err) {
								console.error({ err });
							}
						}
					);
			});
			delete mapWithPin[pin];
		})
		.catch(function (error) {
			console.log(error);
		});
	/* local testing
	let centers = slots.centers;
	let validCenters = { before45: [], after45: [] };
	centers.forEach(center => {
		const temp = center.sessions.filter(session => session.available_capacity === 0);
		if (temp.length > 0) {
			center.sessions[0].min_age_limit < 45
				? (validCenters['before45'] = [...validCenters['before45'], center])
				: (validCenters['after45'] = [...validCenters['after45'], center]);
		}
	});

	mapWithPin[pin].map(({ email, age }) => {
		slotDetails = age < 45 ? validCenters.before45 : validCenters.after45;
		if (slotDetails.length > 1)
			functions.sendEmail(email, 'VACCINE AVAILABLE', JSON.stringify(slotDetails, null, '\t'), (err, result) => {
				if (err) {
					console.error({ err });
				}
			});
	});
	delete mapWithPin[pin];
	
};
*/
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(
	'mongodb+srv://anshm:NcuAQEwPpeA6bgRe@hellovaccine.334w6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
	{ useUnifiedTopology: true }
)
	.then(client => {
		console.log('Connected to Database');

		const db = client.db('users');
		const usersCollection = db.collection('users');

		/* testing routes */
		/*
		app.post('/test', async (req, res, next) => {
			var pincodeArr = [];

			await usersCollection
				.find({ isVerified: true })
				.forEach(doc => {
					const temp = { email: doc.email, age: doc.age };
					mapWithPin[doc.pin]
						? (mapWithPin[doc.pin] = [...mapWithPin[doc.pin], temp])
						: (mapWithPin[doc.pin] = [temp]);

					if (!pincodeArr.includes(doc.pin)) pincodeArr[pincodeArr.length] = doc.pin;
				})
				.then(() => {
					console.log('arr: ', pincodeArr);
					console.log(mapWithPin);

					pincodeArr.map(async pin => {
						await getSlots(pin, moment().format('DD-MM-YYYY'));
					});

					res.json({ message: 'Done' });
				});
		});*/

		app.post('/mail', async (req, res, next) => {
			if (!req.body.email || !req.body.pin || !req.body.date || !req.body.age) {
				res.status(500).json({ message: 'Parameters missing' });
			}

			var { email, pin, date, age } = req.body;
			pin = Number(pin);
			age = Number(age);
			const OTP = functions.generateOTP();

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
									age,
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
						.insertOne({ email, OTP, pin, age, date, isVerified: false })
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

		notifier().then(() => console.log('Cronjob started!'));

		app.listen(port, () => {
			console.log(`Example app listening at http://localhost:${port}`);
		});
	})
	.catch(err => console.error(err));
