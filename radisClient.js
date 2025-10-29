import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();
const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-14508.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 14508
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar

export default client;

