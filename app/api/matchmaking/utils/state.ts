// Track all connected users, not just those waiting to match
export const connectedUsers = new Set<string>()
export const waitingUsers = new Set<string>()
export const activeMatches = new Set<string>()
