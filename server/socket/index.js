const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation');

const app = express();

const allowedOrigins = ['http://localhost:5200', 'http://localhost:3000'];

/*** Socket connection */
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

// Online users
const onlineUser = new Set();

io.on('connection', async (socket) => {
    try {
        console.log('Connected User:', socket.id);

        const token = socket.handshake.auth.token;

        // Check if token is provided
        if (!token) {
            console.error('No token provided');
            return socket.disconnect(true);
        }

        // Get current user details
        const user = await getUserDetailsFromToken(token);

        // Check if user is valid
        if (!user) {
            console.error('User not found or invalid token');
            return socket.disconnect(true);
        }

        console.log('User details:', user);

        // Create a room for the user
        socket.join(user._id.toString());
        onlineUser.add(user._id.toString());

        // Emit online users to all clients
        io.emit('onlineUser', Array.from(onlineUser));

        // Handle message page request
        socket.on('message-page', async (userId) => {
            try {
                console.log('Requested userId:', userId);

                const userDetails = await UserModel.findById(userId).select('-password');

                if (!userDetails) {
                    console.error('User details not found');
                    return;
                }

                const payload = {
                    _id: userDetails._id,
                    name: userDetails.name,
                    email: userDetails.email,
                    profile_pic: userDetails.profile_pic,
                    online: onlineUser.has(userId),
                };

                socket.emit('message-user', payload);

                // Get previous messages
                const getConversationMessage = await ConversationModel.findOne({
                    $or: [
                        { sender: user._id, receiver: userId },
                        { sender: userId, receiver: user._id },
                    ],
                })
                    .populate('messages')
                    .sort({ updatedAt: -1 });

                socket.emit('message', getConversationMessage?.messages || []);
            } catch (error) {
                console.error('Error in message-page event:', error);
            }
        });

        // Handle new message
socket.on('new message', async (data) => {
    try {
        let conversation = await ConversationModel.findOne({
            $or: [
                { sender: data.sender, receiver: data.receiver },
                { sender: data.receiver, receiver: data.sender },
            ],
        });

        // If conversation doesn't exist, create one
        if (!conversation) {
            const createConversation = new ConversationModel({
                sender: data.sender,
                receiver: data.receiver,
            });
            conversation = await createConversation.save();
        }

        // Save the new message
        const message = new MessageModel({
            text: data.text,
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
            msgByUserId: data.msgByUserId,
        });
        const saveMessage = await message.save();

        // Update conversation with the new message
        await ConversationModel.updateOne(
            { _id: conversation._id },
            { $push: { messages: saveMessage._id } }
        );

        // Get updated conversation with messages
        const getConversationMessage = await ConversationModel.findOne({
            $or: [
                { sender: data.sender, receiver: data.receiver },
                { sender: data.receiver, receiver: data.sender },
            ],
        })
            .populate('messages')
            .sort({ updatedAt: -1 });

        // Emit messages to both sender and receiver
        io.to(data.sender).emit('message', getConversationMessage?.messages || []);
        io.to(data.receiver).emit('message', getConversationMessage?.messages || []);

        // Send updated conversation lists
        const conversationSender = await getConversation(data.sender);
        const conversationReceiver = await getConversation(data.receiver);

        io.to(data.sender).emit('conversation', conversationSender);
        io.to(data.receiver).emit('conversation', conversationReceiver);
    } catch (error) {
        console.error('Error in new message event:', error);
    }
});


        // Handle sidebar request
        socket.on('sidebar', async (currentUserId) => {
            try {
                console.log('Current user:', currentUserId);

                const conversation = await getConversation(currentUserId);
                socket.emit('conversation', conversation);
            } catch (error) {
                console.error('Error in sidebar event:', error);
            }
        });

        // Handle seen event
        socket.on('seen', async (msgByUserId) => {
            try {
                let conversation = await ConversationModel.findOne({
                    $or: [
                        { sender: user._id, receiver: msgByUserId },
                        { sender: msgByUserId, receiver: user._id },
                    ],
                });

                const conversationMessageId = conversation?.messages || [];

                // Update messages as seen
                await MessageModel.updateMany(
                    { _id: { $in: conversationMessageId }, msgByUserId: msgByUserId },
                    { $set: { seen: true } }
                );

                // Send updated conversation lists
                const conversationSender = await getConversation(user._id.toString());
                const conversationReceiver = await getConversation(msgByUserId);

                io.to(user._id.toString()).emit('conversation', conversationSender);
                io.to(msgByUserId).emit('conversation', conversationReceiver);
            } catch (error) {
                console.error('Error in seen event:', error);
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            onlineUser.delete(user._id.toString());
            console.log('Disconnected user:', socket.id);
        });
    } catch (error) {
        console.error('Error in socket connection:', error);
        socket.disconnect(true);
    }
});

module.exports = {
    app,
    server,
};