import 'cross-fetch/polyfill'
import prisma from '../src/prisma'
import seedDatabase, { userOne, postOne, postTwo } from './fixtures/seedDatabase'
import getClient from './fixtures/getClient'
import { getPosts, getMyPosts, updatePost, createPost, deletePost, subscribeToPosts } from './fixtures/postOperations'

const client = getClient()

beforeEach(seedDatabase, 10000)

test('Should only expose published posts', async () => {
    const { data: { posts } } = await client.query({ query: getPosts })

    // posts.forEach((post) => {
    //     expect(post.published).toBe(true)
    // })
    expect(posts.length).toBe(1)
    expect(posts[0].published).toBe(true)
})

test('Should expose own posts when authenticated', async () => {
    const client = getClient(userOne.jwt)
    const { data: { myPosts } } = await client.query({ query: getMyPosts })

    expect(myPosts.length).toBe(2)
})

test('Should update own post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: postOne.post.id,
        data: {
            published: false
        }
    }
    const { data: { updatePost: { published } } } = await client.mutate({ mutation: updatePost, variables })
    const postExists = await prisma.exists.Post({ id: postOne.post.id, published: false })

    expect(published).toBe(false)
    expect(postExists).toBe(true)
})

test('Should create new post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        data: {
            title: 'My test post',
            body: 'This is my new test post',
            published: true
        }
    }
    await client.mutate({ mutation: createPost, variables })
    const postExists = await prisma.exists.Post({ title: 'My test post', body: 'This is my new test post', published: true })

    expect(postExists).toBe(true)
})

test('Should delete a post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: postTwo.post.id
    }
    const { data: { deletePost: { id } } } = await client.mutate({ mutation: deletePost, variables })
    const postExists = await prisma.exists.Post({ id })

    expect(postExists).toBe(false)
})

// test('Should subscribe to posts from an author', async (done) => {
//     const variables = {
//         authorId: userOne.user.id
//     }
//     client.subscribe({ query: subscribeToPosts, variables }).subscribe({
//         next(response) {

//             expect(response.data.post.mutation).toBe('UPDATED')
//             done()
//         }
//     })
//     setTimeout(async () => {
//         await prisma.mutation.updatePost({ data: { published: false }, where: { id: postOne.post.id } })
//     }, 20000)
// })