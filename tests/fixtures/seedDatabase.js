import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../src/prisma'

const userOne = {
    input: { 
        name: 'Ivan', 
        email: 'ivan@example.com', 
        password: bcrypt.hashSync('Abcde123') 
    },
    user: undefined,
    jwt: undefined
}

const userTwo = {
    input: {
        name: 'Milan',
        email: 'milan@example.com',
        password: bcrypt.hashSync('Fghij123')
    },
    user: undefined,
    jwt: undefined
}

const postOne = {
    input: {
        title: 'Join us',
        body: 'Come hang out with us tonight!',
        published: true
    },
    post: undefined
}

const postTwo = {
    input: {
        title: 'Weekend',
        body: 'We will organize an event this weekend.',
        published: false
    },
    post: undefined
}

const commentOne = {
    input: {
        title: 'All right',
        body: 'I will not miss it!'
    },
    comment: undefined
}

const commentTwo = {
    input: {
        title: 'Check-in',
        body: 'Save a spot for me.'
    },
    comment: undefined
}

const seedDatabase = async () => {
    // Clear database
    await prisma.mutation.deleteManyComments()
    await prisma.mutation.deleteManyPosts()
    await prisma.mutation.deleteManyUsers()

    // Create user one
    userOne.user = await prisma.mutation.createUser({
        data: userOne.input
    })
    userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET)

    //Create user two
    userTwo.user = await prisma.mutation.createUser({
        data: userTwo.input
    })
    userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET)

    // Create post one
    postOne.post = await prisma.mutation.createPost({
        data: {
            ...postOne.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    })

    // Create post two
    postTwo.post = await prisma.mutation.createPost({
        data: {
            ...postTwo.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    })

    // Create comment one
    commentOne.comment = await prisma.mutation.createComment({
        data: {
            ...commentOne.input,
            author: {
                connect: {
                    id: userTwo.user.id
                }
            },
            post: {
                connect: {
                    id: postOne.post.id
                }
            }
        }
    })

    // Create comment two
    commentTwo.comment = await prisma.mutation.createComment({
        data: {
            ...commentTwo.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            },
            post: {
                connect: {
                    id: postOne.post.id
                }
            }
        }
    })
}

export { seedDatabase as default, userOne, userTwo, postOne, postTwo, commentOne, commentTwo }