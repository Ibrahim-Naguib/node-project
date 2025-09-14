import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';
import connectDB from './config/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }

  process.exit(1);
});

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }

  server.close(async () => {
    console.log('🛑 Server closed gracefully');

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🗄️  MongoDB connection closed');
    }

    process.exit(1);
  });
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string) => {
  console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('🛑 HTTP server closed');

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🗄️  MongoDB connection closed');
    }

    console.log('👋 Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⏰ Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
