import { gql } from 'apollo-boost'

const getPosts = gql`
    query {
        posts {
            published
        }
    }
`

const getMyPosts = gql`
    query {
        myPosts {
            id
        }
    }
`

const updatePost = gql`
    mutation($id: ID!, $data: UpdatePostInput!) {
        updatePost(id: $id, data: $data) {
            published
        }
    }
`

const createPost = gql`
    mutation($data: CreatePostInput!) {
        createPost(data: $data) {
            title
            body
            published
        }
    }
`

const deletePost = gql`
    mutation($id: ID!) {
        deletePost(id: $id) {
            id
        }
    }
`

const subscribeToPosts = gql`
    subscription($authorId: ID!) {
        post(authorId: $authorId) {
            mutation
            node {
                id
            }
        }
    }
`

export { getPosts, getMyPosts, updatePost, createPost, deletePost, subscribeToPosts }