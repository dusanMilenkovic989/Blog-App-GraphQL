import jwt from "jsonwebtoken"

const getUserId = (request, authRequired = true) => {
    const header = request.request.headers.authorization

    if (header) {
        const token = header.substring(7)
        const { userId } = jwt.verify(token, process.env.JWT_SECRET)
        return userId
    }

    if (authRequired) {
        throw new Error('Authentication required!')
    }

    return null
}

export { getUserId as default }