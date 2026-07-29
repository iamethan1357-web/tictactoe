import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  jsonb,
  varchar,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 30 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: varchar("display_name", { length: 50 }).notNull(),
  avatar: varchar("avatar", { length: 20 }).notNull().default("🎮"),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  draws: integer("draws").notNull().default(0),
  currentLevel: integer("current_level").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const friendships = pgTable("friendships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  friendId: uuid("friend_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerXId: uuid("player_x_id").notNull().references(() => users.id),
  playerOId: uuid("player_o_id").references(() => users.id), // null for AI games
  board: jsonb("board").notNull().default(JSON.stringify(Array(9).fill(null))),
  currentTurn: varchar("current_turn", { length: 1 }).notNull().default("X"),
  status: varchar("status", { length: 20 }).notNull().default("waiting"), // waiting, active, finished
  winner: varchar("winner", { length: 10 }), // X, O, draw, null
  gameType: varchar("game_type", { length: 20 }).notNull().default("pvp"), // pvp, ai
  aiDifficulty: varchar("ai_difficulty", { length: 10 }), // easy, medium, hard
  level: integer("level"), // for level mode
  isDaily: boolean("is_daily").notNull().default(false),
  dailyDate: varchar("daily_date", { length: 10 }), // YYYY-MM-DD
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromUserId: uuid("from_user_id").notNull().references(() => users.id),
  toUserId: uuid("to_user_id").notNull().references(() => users.id),
  gameId: uuid("game_id").references(() => games.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  challengeDate: varchar("challenge_date", { length: 10 }).notNull(),
  completed: boolean("completed").notNull().default(false),
  won: boolean("won").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Game = typeof games.$inferSelect;
export type Friendship = typeof friendships.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
