// import Redis from 'ioredis';
// // The Redis connection string from your environment variables
// const redisUrl = process.env.REDIS_URL; 

// // The 'redis' client library is not needed if you're using 'ioredis'
// // const client = createClient(); 

// const redis = new Redis(redisUrl, {
//   tls: {
//     // This is often needed for Redis Cloud connections
//     rejectUnauthorized: false,
//   },
// });

// redis.on('connect', () => {
//   console.log('✅ Connected to Redis successfully!');
// });

// redis.on('error', (err) => {
//   console.error('❌ Redis connection error:', err);
// });

// export default redis;

import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();
const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-17845.c278.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 17845
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar

export default client;

