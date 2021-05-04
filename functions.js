let nodemailer = require('nodemailer');

let nodemailerTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: String(process.env.EMAIL),
		pass: String(process.env.APPLICATION_PASSWORD),
	},
});

exports.sendEmail = function (email, subjectLine, slotDetails, callback) {
	let options = {
		from: String('Vaccine Checker ' + process.env.EMAIL),
		to: email,
		subject: subjectLine,
		text: slotDetails,
	};
	nodemailerTransporter.sendMail(options, (error, info) => {
		if (error) {
			return callback(error);
		}
		return callback(error, info);
	});
};

exports.generateOTP = function () {
	var digits = '0123456789';
	let OTP = '';
	for (let i = 0; i < 4; i++) {
		OTP += digits[Math.floor(Math.random() * 10)];
	}
	return OTP;
};
