import 'cross-fetch/polyfill'
import prisma from '../src/prisma'
import seedDatabase, { userOne } from './fixtures/seedDatabase'
import getClient from './fixtures/getClient'
import { createUser, getUsers, loginUser, getProfile } from './fixtures/userOperations'

const client = getClient()

beforeEach(seedDatabase, 10000)

test('Should create a new user', async () => {
    const variables = {
        data: {
            name: 'Dusan',
            email: 'dusan@example.com',
            password: 'graphql123'
        }
    }
    const { data: { createUser: { user: { id } } } } = await client.mutate({ mutation: createUser, variables })
    const userExists = await prisma.exists.User({ id })

    expect(userExists).toBe(true)
})

test('Should expose public author profiles', async () => {
    const { data: { users } } = await client.query({ query: getUsers })

    expect(users.length).toBe(2)
    expect(users[0].name).toBe('Ivan')
    expect(users[0].email).toBe(null)
    expect(users[1].name).toBe('Milan')
    expect(users[1].email).toBe(null)
})

test('Should not login with bad credentials', async () => {
    const variables = {
        data: {
            email: 'nikola@example.com',
            password: 'Klmno123'
        }
    }

    await expect(client.mutate({ mutation: loginUser, variables })).rejects.toThrow()
})

test('Should not sign up user with short password', async () => {
    const variables = {
        data: {
            name: "Dusan",
            email: "dusan@example.com",
            password: "graphql"
        }
    }

    await expect(client.mutate({ mutation: createUser, variables })).rejects.toThrow()
})

test('Should expose user profile', async () => {
    const client = getClient(userOne.jwt)
    const { data: { me: { id, name, email } } } = await client.query({ query: getProfile })

    expect(id).toBe(userOne.user.id)
    expect(name).toBe(userOne.user.name)
    expect(email).toBe(userOne.user.email)
})