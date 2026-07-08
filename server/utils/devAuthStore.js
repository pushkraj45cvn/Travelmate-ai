const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Simple in-memory store for development/testing when MongoDB is unavailable
const users = new Map();


const createDevelopmentUser = async ({ name, email, password, role = 'user', avatar = '' }) => {
	const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
	const salt = await bcrypt.genSalt(10);
	const hashed = await bcrypt.hash(password, salt);

	const user = {
		_id: id,
		id,
		name,
		email: email.toLowerCase(),
		password: hashed,
		role,
		avatar,
		isVerified: true,
		isActive: true,
		preferredCurrency: 'USD',
		preferredLanguage: 'en',
		signJwtToken() {
			return jwt.sign({ id: this.id, email: this.email, role: this.role }, process.env.JWT_SECRET || 'devsecret', {
				expiresIn: process.env.JWT_EXPIRE || '1d',
			});
		},
		signRefreshToken() {
			return jwt.sign({ id: this.id }, process.env.JWT_REFRESH_SECRET || 'devrefresh', {
				expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
			});
		},
		async matchPassword(enteredPassword) {
			return bcrypt.compare(enteredPassword, this.password);
		},
	};

	users.set(user.id, user);
	users.set(user.email, user);

	return user;
};

const findDevelopmentUserByEmail = async (email) => {
	if (!email) return null;
	return users.get(email.toLowerCase()) || null;
};

const findDevelopmentUserById = async (id) => {
	return users.get(id) || null;
};

module.exports = { createDevelopmentUser, findDevelopmentUserByEmail, findDevelopmentUserById };

