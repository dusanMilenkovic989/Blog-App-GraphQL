import bcrypt from 'bcryptjs'
import hashPassword from '../utilities/hashPassword'
import generateAuthToken from '../utilities/generateAuthToken'
import getUserId from '../utilities/getUserId'

const Mutation = {
    async createUser(parent, { data }, { prisma }, info) {
        const emailTaken = await prisma.exists.User({ email: data.email })

        if (emailTaken) {
            throw new Error('This email address is already in use! Please pick another one.')
        }

        const password = await hashPassword(data.password)
        const user = await prisma.mutation.createUser({ 
            data: {
                ...data,
                password
            }
        })

        return {
            user,
            token: generateAuthToken(user.id)
        }
    },
    async loginUser(parent, { data }, { prisma }, info) {
        const user = await prisma.query.user({ where: { email: data.email } })

        if (!user) {
            throw new Error('Username or password is not valid!')
        }

        const isMatch = await bcrypt.compare(data.password, user.password)

        if (!isMatch) {
            throw new Error('Username or password is not valid!')
        }

        return {
            user,
            token: generateAuthToken(user.id)
        }
    },
    async updateUser(parent, { data }, { prisma, request }, info) {
        const userId = getUserId(request)

        if (data.email) {
            const emailTaken = await prisma.exists.User({ email: data.email })

            if (emailTaken) {
                throw new Error('This email is already in use!')
            }
        }

        if (typeof data.password === 'string') {
            data.password = await hashPassword(data.password)
        }

        return prisma.mutation.updateUser({ data, where: { id: userId } }, info)
    },
    deleteUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)

        return prisma.mutation.deleteUser({ where: { id: userId } }, info)
    },
    createPost(parent, { data }, { prisma, request }, info) {
        const userId = getUserId(request)

        return prisma.mutation.createPost({ 
            data: {
                ...data,
                author: {
                    connect: {
                        id: userId
                    }
                }
            }
        }, info)
    },
    async updatePost(parent, { id, data }, { prisma, request }, info) {
        const userId = getUserId(request)
        const postExists = await prisma.exists.Post({ id, author: { id: userId } })

        if (!postExists) {
            throw new Error('You must be authenticated in order to update this post!')
        }

        const isPostPublished = await prisma.exists.Post({ id, published: true })

        if (isPostPublished && data.published === false) {
            await prisma.mutation.deleteManyComments({ where: { post: { id } } })
        }

        return prisma.mutation.updatePost({ data, where: { id } }, info)
    },
    async deletePost(parent, { id }, { prisma, request }, info) {
        const userId = getUserId(request)
        const postExists = await prisma.exists.Post({ id, author: { id: userId } })

        if (!postExists) {
            throw new Error('You must be authenticated in order to delete this post!')
        }

        return prisma.mutation.deletePost({ where: { id } }, info)
    },
    async createComment(parent, { data }, { prisma, request }, info) {
        const userId = getUserId(request)
        const postExists = await prisma.exists.Post({ id: data.post, published: true })

        if (!postExists) {
            throw new Error('Can not leave comments on this post at this time!')
        }

        return prisma.mutation.createComment({
            data: {
                ...data,
                author: {
                    connect: {
                        id: userId
                    }
                },
                post: {
                    connect: {
                        id: data.post
                    }
                }
            }
        }, info)
    },
    async updateComment(parent, { id, data }, { prisma, request }, info) {
        const userId = getUserId(request)
        const commentExists = await prisma.exists.Comment({ id, author: { id: userId } })

        if (!commentExists) {
            throw new Error('You must be authenticated in order to update this comment!')
        }

        const comment = await prisma.query.comment({ where: { id } }, '{ post { id } }')
        const postExists = await prisma.exists.Post({ id: comment.post.id, published: true })

        if (!postExists) {
            throw new Error('Can not update comment on this post at this time!')
        }
        
        return prisma.mutation.updateComment({ data, where: { id }}, info)
    },
    async deleteComment(parent, { id }, { prisma, request }, info) {
        const userId = getUserId(request)
        const commentExists = await prisma.exists.Comment({ id, author: { id: userId } })

        if (!commentExists) {
            throw new Error('You must be authenticated in order to delete this comment!')
        }

        const comment = await prisma.query.comment({ where: { id } }, '{ post { id } }')
        const postExists = await prisma.exists.Post({ id: comment.post.id, published: true })

        if (!postExists) {
            throw new Error('Can not delete comment on this post at this time!')
        }

        return prisma.mutation.deleteComment({ where: { id } }, info)
    }
}

export { Mutation as default }