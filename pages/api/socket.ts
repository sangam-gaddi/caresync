import { Server as ServerIO } from 'socket.io';
import { NextApiRequest } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

const connectedUsers = new Map();

export default async function handler(req: NextApiRequest, res: any) {
    if (res.socket.server.io) {
        res.end();
        return;
    }

    console.log('Initializing Socket.io server...');

    const io = new ServerIO(res.socket.server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['polling'],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join', (data) => {
            try {
                const { usn, name } = data;
                socket.data.usn = usn;
                socket.data.name = name;

                socket.join('global');
                socket.join(`user:${usn}`);

                connectedUsers.set(usn, {
                    usn,
                    name,
                    socketId: socket.id,
                    connectedAt: new Date(),
                });

                io.emit('user-online', { usn, name, totalOnline: connectedUsers.size });

                const onlineUsersList = Array.from(connectedUsers.values())
                    .filter((u) => u.usn !== usn)
                    .map((u) => ({ usn: u.usn, name: u.name, studentName: u.name }));

                socket.emit('online-users-list', { users: onlineUsersList });
            } catch (error) {
                console.error('Error in join:', error);
            }
        });

        socket.on('send-global-message', (data) => {
            try {
                if (!socket.data.usn || !socket.data.name) return;
                const messageData = {
                    senderUsn: socket.data.usn,
                    senderName: socket.data.name,
                    message: data.message,
                    timestamp: new Date(),
                    type: 'global',
                };
                io.emit('new-global-message', messageData);
            } catch (error) {
                console.error('Error sending global message:', error);
            }
        });

        socket.on('send-private-message', (data) => {
            try {
                if (!socket.data.usn || !socket.data.name) return;
                const { recipientUsn, message } = data;
                const messageData = {
                    senderUsn: socket.data.usn,
                    senderName: socket.data.name,
                    recipientUsn,
                    message,
                    timestamp: new Date(),
                    type: 'private',
                };
                io.to(`user:${recipientUsn}`).emit('new-private-message', messageData);
                socket.emit('new-private-message', messageData);
            } catch (error) {
                console.error('Error sending private message:', error);
            }
        });

        socket.on('typing-global', () => {
            if (!socket.data.usn || !socket.data.name) return;
            socket.to('global').emit('user-typing-global', { usn: socket.data.usn, name: socket.data.name });
        });

        socket.on('typing-private', (data) => {
            if (!socket.data.usn || !socket.data.name) return;
            io.to(`user:${data.recipientUsn}`).emit('user-typing-private', { usn: socket.data.usn, name: socket.data.name });
        });

        socket.on('request-online-users', () => {
            try {
                const onlineUsersList = Array.from(connectedUsers.values())
                    .filter((u) => u.usn !== socket.data.usn)
                    .map((u) => ({ usn: u.usn, name: u.name, studentName: u.name }));
                socket.emit('online-users-list', { users: onlineUsersList });
            } catch (error) {
                console.error('Error fetching online users:', error);
            }
        });

        socket.on('disconnect', (reason) => {
            try {
                if (socket.data.usn) {
                    connectedUsers.delete(socket.data.usn);
                    io.emit('user-offline', { usn: socket.data.usn, totalOnline: connectedUsers.size });
                }
            } catch (error) {
                console.error('Error in disconnect:', error);
            }
        });
    });

    console.log('Socket.io initialized successfully');
    res.end();
}
