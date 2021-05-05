require('dotenv').config();

//const moment = require('moment');
//const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const functions = require('./functions');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* testData
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
	const slots = {
		centers: [
			{
				center_id: 549109,
				name: 'THUNGA HOSPITAL MIRA ROAD',
				address: 'Near Raymond Showroom, Mira Bhayander Road.',
				state_name: 'Maharashtra',
				district_name: 'Thane',
				block_name: 'Mira Bhayander Municipal Corporation',
				pincode: 401107,
				lat: 19,
				long: 72,
				from: '09:00:00',
				to: '17:00:00',
				fee_type: 'Paid',
				sessions: [
					{
						session_id: '0cd8b825-acfd-4a28-9124-c59a7de1e48d',
						date: '05-05-2021',
						available_capacity: 0,
						min_age_limit: 45,
						vaccine: 'COVISHIELD',
						slots: ['09:00AM-11:00AM', '11:00AM-01:00PM', '01:00PM-03:00PM', '03:00PM-05:00PM'],
					},
					{
						session_id: 'e8d6a78a-9160-44f4-badd-abafae0de8ce',
						date: '06-05-2021',
						available_capacity: 0,
						min_age_limit: 45,
						vaccine: 'COVISHIELD',
						slots: ['09:00AM-11:00AM', '11:00AM-01:00PM', '01:00PM-03:00PM', '03:00PM-05:00PM'],
					},
				],
			},
			{
				center_id: 680751,
				name: 'Mbmc Indira Gandhi',
				address: 'Poonam Sagar Opp Allahabad Bank Mira Road East',
				state_name: 'Maharashtra',
				district_name: 'Thane',
				block_name: 'Mira Bhayander Municipal Corporation',
				pincode: 401107,
				lat: 19,
				long: 72,
				from: '09:00:00',
				to: '16:00:00',
				fee_type: 'Free',
				sessions: [
					{
						session_id: 'de8094b2-e3e6-49c4-9327-612077c18ee0',
						date: '06-05-2021',
						available_capacity: 0,
						min_age_limit: 45,
						vaccine: 'COVAXIN',
						slots: ['09:00AM-11:00AM', '11:00AM-01:00PM', '01:00PM-03:00PM', '03:00PM-04:00PM'],
					},
				],
			},
			{
				center_id: 551889,
				name: 'B. Indira Gandhi Hospital',
				address: 'Poonam Sagar Nr Alahabad Bnak Mira Road East',
				state_name: 'Maharashtra',
				district_name: 'Thane',
				block_name: 'Mira Bhayander Municipal Corporation',
				pincode: 401107,
				lat: 19,
				long: 72,
				from: '09:00:00',
				to: '16:00:00',
				fee_type: 'Free',
				sessions: [
					{
						session_id: 'd72839d9-a888-4bfc-8d26-256aa0f4d6cf',
						date: '06-05-2021',
						available_capacity: 0,
						min_age_limit: 45,
						vaccine: 'COVISHIELD',
						slots: ['09:00AM-11:00AM', '11:00AM-01:00PM', '01:00PM-03:00PM', '03:00PM-04:00PM'],
					},
				],
			},
		],
	};

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
	/*
	const config = setConfig(pin, date);
	await axios(config)
		.then(function (slots) {
			let centers = slots.data.centers;
			let validSlots = [];
			centers.forEach(center => {
				const temp = center.sessions.filter(session => session.available_capacity == 0);
				if (temp.length > 0
					&&mapWithPin[center.pincode] {
				mapWithPin[center.pincode].map(email => {
					functions.sendEmail(
						email,
						'VACCINE AVAILABLE',
						JSON.stringify(center, null, '\t'),
						(err, result) => {
							if (err) {
								console.error({ err });
							}
						}
					);
				});
				delete mapWithPin[center.pincode];
					
				}
			});
			return validSlots;
		})
		.catch(function (error) {
			console.log(error);
		});
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
		/* app.post('/test', async (req, res, next) => {
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
		}); */

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

		app.listen(port, () => {
			console.log(`Example app listening at http://localhost:${port}`);
		});
	})
	.catch(err => console.error(err));
