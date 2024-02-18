import { createClient } from "@vercel/kv";

export type GameState = {
  users: string[];
  roundEndTime?: number;
  potatoHolder?: string;
};

  const url = process.env.GAMES_REST_API_URL;
  const token = process.env.GAMES_REST_API_TOKEN;

export async function getGameState(gameId: string): Promise<GameState> {
  if (!url || !token) {
    throw new Error("Missing GAMES_REST_API_URL or GAMES_REST_API_TOKEN");
  }
 const games = createClient({
  url,
    token
})
  const usersKey = `${gameId}:users`;
  const users = await games.lrange(usersKey, 0, 4) ?? [];

  const roundEndTimeKey = `${gameId}:roundEndTime`;
  const roundEndTime = await games.get(roundEndTimeKey) as string | undefined;
  const potatoHolderKey = `${gameId}:potatoHolder`;
  const potatoHolder = await games.get(potatoHolderKey) as string | undefined;
  const game = {
    users,
    roundEndTime: Number(roundEndTime),
    potatoHolder,
  } as GameState;
  return game;
}

export async function addPlayer(gameId: string, userId: string): Promise<void> {
  if (!url || !token) {
    throw new Error("Missing GAMES_REST_API_URL or GAMES_REST_API_TOKEN");
  }
  const games = createClient({
  url,
    token
})
  await games.zadd(`${gameId}:users`, {score: Date.now().valueOf(), member: userId});
}


export async function setGameState(gameId: string, gameState: GameState): Promise<void> {
  if (!url || !token) {
    throw new Error("Missing GAMES_REST_API_URL or GAMES_REST_API_TOKEN");
  }
  const games = createClient({
  url,
    token
})
  await games.set(gameId, gameState);
}


