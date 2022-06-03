const Subscription = {
    post: {
        async subscribe(parent, { authorId }, { prisma }, info) {
            const userExists = await prisma.exists.User({ id: authorId })

            if (!userExists) {
                throw new Error('Unable to find user!')
            }

            return prisma.subscription.post({
                where: {
                    node: {
                        AND: [{
                            published: true
                        }, {
                            author: {
                                id: authorId
                            }
                        }]
                    }
                }
            }, info)
        }
    },
    comment: {
        async subscribe(parent, { postId }, { prisma }, info) {
            const postExists = await prisma.exists.Post({ id: postId })

            if (!postExists) {
                throw new Error('Unable to find post!')
            }

            return prisma.subscription.comment({
                where: {
                    node: {
                        post: {
                            id: postId
                        }
                    }
                }
            }, info)
        }
    }
}

export { Subscription as default }