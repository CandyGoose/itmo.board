import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const images = [
    "/placeholders/1.svg",
    "/placeholders/2.svg",
    "/placeholders/3.svg",
    "/placeholders/4.svg",
    "/placeholders/5.svg",
    "/placeholders/6.svg",
    "/placeholders/7.svg",
    "/placeholders/8.svg",
    "/placeholders/9.svg",
    "/placeholders/10.svg",
];

// Create a new board with the given data
export const createBoard = mutation({
    args: {
        orgId: v.string(),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const randomIndex = Math.floor(Math.random() * images.length);
        const randomImage = images[randomIndex];

        const board = await ctx.db.insert("boards", {
            title: args.title,
            orgId: args.orgId,
            authorId: identity.subject,
            authorName: identity.name!,
            imageUrl: randomImage,
        });

        return board;
    },
});

// Delete a board by id
export const deleteById = mutation({
    args: {
        id: v.id("boards"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const userId = identity.subject;

        const existingRelation = await ctx.db
            .query("userBoards")
            .withIndex("by_user_board", (q) => {
                return q.eq("userId", userId).eq("boardId", args.id);
            })
            .unique();

        if (existingRelation) {
            await ctx.db.delete(existingRelation._id);
        }

        await ctx.db.delete(args.id);
    },
});

export const updateById = mutation({
    args: {
        id: v.id("boards"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = ctx.auth.getUserIdentity();
        const title = args.title.trim();

        if (!identity) {
            throw new Error("Unauthorized!");
        }

        if (!title) {
            throw new Error("Title is required");
        }

        if (title.length > 60) {
            throw new Error("Title cannot be longer than 60 characters");
        }

        const board = await ctx.db.patch(args.id, {
            title,
        });

        return board;
    },
});

export const get = query({
    args: { id: v.id("boards") },
    handler: async (ctx, args) => {
        const board = await ctx.db.get(args.id);

        return board;
    },
});
