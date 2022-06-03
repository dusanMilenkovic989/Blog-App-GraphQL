import jwt from 'jsonwebtoken'

const generateAuthToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET)

export { generateAuthToken as default }