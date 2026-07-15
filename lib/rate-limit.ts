/**
 * Simple in-memory rate limiter for development and single-instance deployments.
 * In a true distributed production environment (like Vercel Edge functions), 
 * this should be replaced with @upstash/ratelimit (Redis).
 */

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export const rateLimit = (identifier: string, limit: number, windowMs: number) => {
  const now = Date.now();
  const userRecord = rateLimitMap.get(identifier);

  // If no record exists, or window has expired, reset it
  if (!userRecord || now - userRecord.timestamp > windowMs) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return { success: true, remaining: limit - 1 };
  }

  // If user is within window and below limit
  if (userRecord.count < limit) {
    userRecord.count += 1;
    rateLimitMap.set(identifier, userRecord);
    return { success: true, remaining: limit - userRecord.count };
  }

  // Rate limit exceeded
  return { success: false, remaining: 0 };
};
