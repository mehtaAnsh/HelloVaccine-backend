const momemt = require('moment');
const cron = require('node-cron');
const axios = require('axios');
const functions = require('./functions');

const config = (pin, date) => {
	return {
		method: 'GET',
		url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pin}&date=${date}`,
		headers: {
			accept: 'application/json',
			'Accept-Language': 'hi_IN',
		},
	};
};

const main = async () => {
	try {
		cron.schedule('* * * *', async () => await checkAvailability());
	} catch (e) {
		console.log('An error occured.');
		throw e;
	}
};

const checkAvailability = async () => {
	/* get mail contents from DB */

	getSlots();
};

const getSlots = async () => {
	axios(config)
		.then(function (slots) {
			let sessions = slots.data.sessions;
			let validSlots = sessions.filter(slot => slot.min_age_limit <= AGE && slot.available_capacity > 0);
			if (validSlots.length > 0) {
				sendMail(validSlots);
			}
		})
		.catch(function (error) {
			console.log(error);
		});
};

const sendMail = async () => {
	let slotDetails = JSON.stringify(validSlots, null, '\t');
	functions.sendEmail(EMAIL, 'VACCINE AVAILABLE', slotDetails, (err, result) => {
		if (err) {
			console.error({ err });
		}
	});
};

main().then(() => console.log('started!'));
