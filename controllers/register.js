const handleRegister = (req, res, db, bcrypt) => {
	const { email, name, password, id } = req.body;
	if (!email || !name || !password){
		return res.status(400).json('incorrect form submission')
	}
	const hash = bcrypt.hashSync(password);
		// create transaction when you have to do more that 2 things at once
		// use trx object to do operations
		db.transaction(trx => {
			trx.insert({
				hash: hash,
				email: email
			})
			.into('login')
			.returning('email')
			.then(loginEmail => {
				return trx ('users')
					.returning('*') 
					.insert({
						id: id,
						name: name,
						email: loginEmail[0],
						joined: new Date()
					})
					.then(user => {
						res.json(user[0])
					})
			})
			// to make sure it got added we have to commit 
			// and in case anything fails we rollback
			.then(trx.commit)
			.catch(trx.rollback)
		})
		.catch(err => res.status(400).json('unable to register'))
}

module.exports = {
	handleRegister: handleRegister
}