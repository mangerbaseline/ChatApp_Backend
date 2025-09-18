import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false, // needed for Redis Cloud
  },
});

redis.on("connect", () => console.log("✅ Connected to Redis Cloud"));
redis.on("error", (err) => console.error("❌ Redis error", err));

export default redis;
