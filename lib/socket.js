



// import { Server } from 'socket.io';
// import { getUserFromServerCookie } from './auth';
// import Chat from '@/models/Chat';

// let io;
// const onlineUsers = new Map();

// export function initSocket(server) {
//   io = new Server(server);
  
//   io.on('connection', async (socket) => {
//     try {
//       const user = await getUserFromServerCookie(socket.request.cookies);
//       if (!user) {
//         throw new Error('Authentication required');
//       }
      
//       socket.user = user;
//       onlineUsers.set(user._id.toString(), socket.id);

//       // Update user's online status in all their chats
//       await Chat.updateMany(
//         { 'participants.userId': user._id },
//         { 
//           $set: { 
//             'participants.$.online': true,
//             'participants.$.lastSeen': new Date()
//           }
//         }
//       );

//       socket.on('join-chat', (chatId) => {
//         socket.join(chatId);
//       });

//       socket.on('leave-chat', (chatId) => {
//         socket.leave(chatId);
//       });

//       // Rate limiting
//       let messageCount = 0;
//       let lastMessageTime = Date.now();

//       socket.on('send-message', async (data) => {
//         const now = Date.now();
        
//         // Reset counter after 1 minute
//         if (now - lastMessageTime > 60000) {
//           messageCount = 0;
//         }

//         // Limit to 10 messages per minute
//         if (messageCount >= 10) {
//           socket.emit('error', 'Too many messages. Please wait.');
//           return;
//         }

//         messageCount++;
//         lastMessageTime = now;

//         io.to(data.chatId).emit('new-message', {
//           sender: socket.user._id,
//           content: data.content,
//           timestamp: new Date()
//         });
//       });

//       socket.on('disconnect', async () => {
//         onlineUsers.delete(socket.user._id.toString());
//         await Chat.updateMany(
//           { 'participants.userId': socket.user._id },
//           { 
//             $set: { 
//               'participants.$.online': false,
//               'participants.$.lastSeen': new Date()
//             }
//           }
//         );
//       });
//     } catch (error) {
//       socket.disconnect();
//     }
//   });

//   return io;
// }

// export function getIO() {
//   return io;
// }
