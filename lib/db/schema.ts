import {
    boolean,
    doublePrecision,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const ledger = pgTable("ledger", {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: text()
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    amount: doublePrecision().notNull(),
    description: text().notNull(),
    name: text().notNull(),
});

export const person = pgTable("person", {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: text()
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    userId: text().references(() => user.id, { onDelete: "set null" }),
});

export const group = pgTable("group", {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: text()
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
});

export const groupMember = pgTable(
    "group_member",
    {
        groupId: uuid()
            .notNull()
            .references(() => group.id, { onDelete: "cascade" }),
        personId: uuid()
            .notNull()
            .references(() => person.id, { onDelete: "cascade" }),
    },
    (table) => [primaryKey({ columns: [table.groupId, table.personId] })],
);

export const transaction = pgTable("transaction", {
    id: uuid().primaryKey().defaultRandom(),
    ledgerId: uuid()
        .notNull()
        .references(() => ledger.id, { onDelete: "cascade" }),
    amount: doublePrecision().notNull(),
    description: text(),
    createdAt: timestamp().defaultNow().notNull(),
    correspondentId: text().references(() => user.id, { onDelete: "set null" }),
    invoiceURL: text(),
    projectId: uuid().references(() => project.id, { onDelete: "set null" }),
});

export const project = pgTable("project", {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: text()
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    description: text(),
    amount: doublePrecision().notNull(), // to collect from each participant
    deadline: timestamp(),
    createdAt: timestamp().defaultNow().notNull(),
    completedAt: timestamp(),
    paidOutAt: timestamp(),
    refundable: boolean().default(true).notNull(),
});

export const projectParticipant = pgTable(
    "project_participant",
    {
        projectId: uuid()
            .notNull()
            .references(() => project.id, { onDelete: "cascade" }),
        personId: uuid()
            .notNull()
            .references(() => person.id, { onDelete: "cascade" }),
        paidAt: timestamp(),
        paidTransactionId: uuid().references(() => transaction.id, {
            onDelete: "set null",
        }),
        refundedAt: timestamp(),
        refundedTransactionId: uuid().references(() => transaction.id, {
            onDelete: "set null",
        }),
    },
    (table) => [primaryKey({ columns: [table.projectId, table.personId] })],
);
