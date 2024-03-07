//Import User Model & auth
const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        activeUser: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw AuthenticationError;
        },
    },
    Mutation: {
        createUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },

        login: async (parent, args) => {
            try {
                const user = await User.findOne({ email: args.email });
                if (!user) {
                    return { message: "Can't find this user" };
                }

                const correctPw = await user.isCorrectPassword(args.password);
                if (!correctPw) {
                    return { message: 'Wrong password!' };
                }

                const token = signToken(user);
                return { token, user };
            } catch (err) {
                console.log(err);
                return err;
            }

        },
        saveBook: async (parent, { bookId, title, authors, description, image, link }, context) => {
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    {
                        $addToSet: {
                            savedBooks: {
                                bookId,
                                title,
                                authors,
                                description,
                                image,
                                link
                            }
                        }
                    },
                    { new: true, runValidators: true }
                );
                return updatedUser
            } catch (err) {
                console.log(err);
                return err;
            }
        },
        removeBook: async (parent, args, context) => {
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );
                if (!updatedUser) {
                    return { message: "Couldn't find user with this id!" };
                }
                return updatedUser;
            } catch (err) {
                console.log(err);
                return err;
            }
        }
    }
}

module.exports = resolvers;