const moment = require('moment');
const cron = require('node-cron');
const axios = require('axios');
const functions = require('./functions');

const setConfig = (pin, date) => {
	return {
		method: 'GET',
		url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pin}&date=${date}`,
		headers: {
			accept: 'application/json',
		},
	};
};

var mapWithPin = {};

const main = async () => {
	try {
		cron.schedule('20 * * * *', async () => await checkAvailability());
	} catch (e) {
		console.log('An error occured.');
		throw e;
	}
};

const checkAvailability = async () => {
	const MongoClient = require('mongodb').MongoClient;
	MongoClient.connect(
		'mongodb+srv://anshm:NcuAQEwPpeA6bgRe@hellovaccine.334w6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
		{ useUnifiedTopology: true }
	).then(async client => {
		console.log('Connected to DB');

		const db = client.db('users');

		var pincodeArr = [];
		mapWithPin = {};

		await db
			.collection('users')
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

				console.log('Done');
			});
	});
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
};

//main().then(() => console.log('Cronjob started!'));

module.exports = main;
