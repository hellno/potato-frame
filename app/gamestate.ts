import { createClient } from "@vercel/kv";

export const GAME_DURATION_MINUTES = 5;

export type GameState = {
  users: string[];
  roundEndTime?: number;
  hotPotatoHolder?: number; // index of user in users array
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
  const now = Date.now().valueOf();
  const users = (await games.zrange(usersKey, 0, now))?.slice(0,4) ?? [];

  const roundEndTimeKey = `${gameId}:roundEndTime`;
  const roundEndTime = await games.get(roundEndTimeKey) as string | null;
  const potatoHolderKey = `${gameId}:potatoHolder`;
  const rawPotatoHolder = await games.get(potatoHolderKey) as string | null;
  const hotPotatoHolder = rawPotatoHolder ? parseInt(rawPotatoHolder) : undefined;

  if (users.length >= 5 && roundEndTime === undefined) {
    await startGame(gameId);
  }
  const game = {
    users,
    roundEndTime: Number(roundEndTime),
    hotPotatoHolder,
  } as GameState;
  return game;
}

export async function startGame(gameId: string): Promise<void> {
  if (!url || !token) {
    throw new Error("Missing GAMES_REST_API_URL or GAMES_REST_API_TOKEN");
  }
  const gameState = await getGameState(gameId);
  if (gameState.users.length < 5) {
    throw new Error("Not enough players to start game");
  }
  const games = createClient({
  url,
    token
  });
  const roundEndTimeKey = `${gameId}:roundEndTime`;
  await games.set(roundEndTimeKey, Date.now().valueOf() + (60 * 1000 * GAME_DURATION_MINUTES));
await passPotato(gameId, null, 0);
}

export async function passPotato(gameId: string, thrower: string | null, receiverIndex: number): Promise<void> {
  if (!url || !token) {
    throw new Error("Missing GAMES_REST_API_URL or GAMES_REST_API_TOKEN");
  }
  const games = createClient({
  url,
    token
})
  const gameState = await getGameState(gameId);
  const holder = gameState.hotPotatoHolder ? gameState.users[gameState.hotPotatoHolder] : null;
  if (holder !== thrower) {
    throw new Error("Potato holder does not match thrower");
  }
  if (receiverIndex < 0 || receiverIndex >= 5) {
    throw new Error("Invalid user index");
  }
  await games.set(`${gameId}:potatoHolder`, receiverIndex);
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


