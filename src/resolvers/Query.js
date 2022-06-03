import getUserId from '../utilities/getUserId'

const Query = {
    users(parent, { query, orderBy, first, skip, after }, { prisma }, info) {
        const opArgs = { orderBy, first, skip, after }

        if (query) {
            opArgs.where = { name_contains: query }
        }

        return prisma.query.users(opArgs, info)
    },
    me(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)

        return prisma.query.user({ where: { id: userId }}, info)
    },
    posts(parent, { query, orderBy, first, skip, after }, { prisma }, info) {
        const opArgs = {
            where: {
                published: true
            },
            orderBy,
            first,
            skip,
            after 
        }

        if (query) {
            opArgs.where.OR = [{
                title_contains: query
            }, {
                body_contains: query
            }]
        }

        return prisma.query.posts(opArgs, info)
    },
    myPosts(parent, { query, orderBy, first, skip, after }, { prisma, request }, info) {
        const userId = getUserId(request)
        const opArgs = {
            where: {
                author: {
                    id: userId
                }
            },
            orderBy,
            first,
            skip,
            after
        }

        if (query) {
            opArgs.where.OR = [{
                title_contains: query
            }, {
                body_contains: query
            }]
        }

        return prisma.query.posts(opArgs, info)
    },
    async post(parent, { id }, { prisma, request }, info) {
        const userId = getUserId(request, false)

        const posts = await prisma.query.posts({
            where: {
                id,
                OR: [{
                    published: true
                }, {
                    author: {
                        id: userId
                    }
                }]
            }
        }, info)

        if (posts.length === 0) {
            throw new Error('Unable to find post!')
        }

        return posts[0]
    },
    comments(parent, { orderBy, first, skip, after }, { prisma }, info) {
        return prisma.query.comments({ orderBy, first, skip, after }, info)
    }
}

export { Query as default }