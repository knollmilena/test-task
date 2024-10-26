import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
	private readonly redis: Redis;

	constructor() {
		this.redis = new Redis({
			host: 'localhost',
			port: 6379,
		});
	}

	async close() {
		await this.redis.quit();
	}

	async get(key: string): Promise<string | null> {
		return await this.redis.get(key);
	}

	async set(key: string, value: string, expirationInSeconds: number): Promise<void> {
		await this.redis.set(key, value, 'EX', expirationInSeconds);
	}

	async cacheHandler<T>(cacheKey: string, fetchFunction: () => Promise<T>): Promise<T> {
		const cachedData = await this.get(cacheKey);

		if (cachedData) {
			return JSON.parse(cachedData);
		}

		const data = await fetchFunction();

		await this.set(cacheKey, JSON.stringify(data), 3600);
		return data;
	}

	async deleteCache(cacheKey: string) {
		await this.redis.del(cacheKey);
	}
}
