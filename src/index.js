// import { GraphQLServer } from 'graphql-yoga'
const { GraphQLServer } = require("graphql-yoga");
const { v4: uuidv4 } = require('uuid');


const users = [
  {
    id: "1",
    name: "Nasko",
    email: "Nask@abv.bg",
  },
  {
    id: "2",
    name: "ddeed",
    email: "sss@dd.bg",
  },
  {
    id: "3",
    name: "sseess",
    email: "eee@dd.bg",
  },
];

const posts = [
  {
    id: "1",
    title: "World War 3",
    body: "Shte ima li 3ta svetovna",
    published: true,
    author: "1",
  },
  {
    id: "2",
    title: "Chervenata shapchica",
    body: "imalo edno vreeme",
    published: false,
    author: "2",
  },
  {
    id: "3",
    title: "The Matrix 4",
    body: "The Matrix 4 will be released in 2021",
    published: true,
    author: "1",
  },
];

const comments = [
  {
    id: "1",
    text: "1vi komentar",
    author: "1",
    post: "3",
  },
  {
    id: "2",
    text: "2ri komentar",
    author: "1",
    post: "1",
  },
  {
    id: "3",
    text: "3ti komentar",
    author: "2",
    post: "2",
  },
  {
    id: "4",
    text: "4ti komentar",
    author: "3",
    post: "1",
  },
];

const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments: [Comment!]!
        me: User!
        post: Post!
    }

    type Mutation {
        createUser(name: String!, email: String!, age: Int): User!
        createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
        createComment(text: String!, author: ID!, post: ID!): Comment!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`;

const resolvers = {
  Query: {
    me() {
      return {
        id: "12323",
        name: "Nasko",
        email: "nasko@abv.bg",
        age: 28,
      };
    },
    comments(parent, args, context, info) {
      return comments;
    },
    posts(parent, args, context, info) {
      if (!args.query) {
        return posts;
      }

      return posts.filter((post) => {
        return (
          post.title.toLowerCase().includes(args.query.toLowerCase()) ||
          post.body.toLowerCase().includes(args.query.toLowerCase())
        );
      });
    },
    users(parent, args, context, info) {
      if (!args.query) {
        return users;
      }

      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },
    post() {
      return {
        id: "12323",
        title: "World war 3",
        body: "dasdasdsadasdasd",
        published: true,
      };
    },
  },
  Comment: {
    author(parent, args, context, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    post(parent, args, context, info) {
      return posts.find((post) => {
        return post.id === parent.post;
      });
    },
  },
  Mutation: {
    createUser(parent, args, context, info) {
      var isEmailTaken = users.some((user) => user.email === args.email)

      if (isEmailTaken) {
        throw new Error('Email is taken')
      }

      const user = {
        id: uuidv4(),
        name: args.name,
        email: args.email,
        age: args.age,
      }

      users.push(user)
      return user
    },
    createPost(parent, args, context, info) {
        var isUserExist = users.some((user) => user.id === args.author)

        if (!isUserExist) {
            throw new Error('User doesnt exist')
        }

        const post = {
            id: uuidv4(),
            title: args.title,
            body: args.body,
            published: args.published,
            author: args.author
        }

        posts.push(post)
        return post
    },
    createComment(parent, args, context, info) {

        const isUserExist = users.some((user) => user.id === args.author)
        const isPostExist = posts.some((post) => post.id === args.post && post.published === true)

        if (!isUserExist) {
            throw new Error('The user does not exist')
        }

        if (!isPostExist) {
            throw new Error('Post does not exist or it is not published')
        }

        const comment = {
            id: uuidv4(),
            text: args.text,
            author: args.author,
            post: args.post
        }
        comments.push(comment)
        return comment
    }
  },
  Post: {
    author(parent, args, context, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, context, info) {
      return comments.filter((comment) => {
        return comment.post === parent.id;
      });
    },
  },
  User: {
    posts(parent, args, context, info) {
      return posts.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, context, info) {
      return comments.filter((comment) => {
        return comment.author === parent.id;
      });
    },
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost:4000"));
