const http = require('http');
const app = require('./src/app');
const initSocket = require('./src/config/socket');
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
