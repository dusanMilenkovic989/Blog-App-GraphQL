import { gql } from 'apollo-boost'

const createUser = gql`
    mutation($data: CreateUserInput!) {
        createUser(data: $data) {
            user { 
                id 
            }
        }
    }
`

const getUsers = gql`
    query {
        users {
            name
            email
        }
    }
`

const loginUser = gql`
    mutation($data: LoginUserInput!) {
        loginUser(data: $data) {
            token
        }
    }
`

const getProfile = gql`
    query {
        me {
            id
            name
            email
        }
    }
`

export { createUser, getUsers, loginUser, getProfile }