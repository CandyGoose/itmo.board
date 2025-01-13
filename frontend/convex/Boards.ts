import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAllByOrgId = query({
  args: {
    orgId: v.string(),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated!");
    }

    const title = args.search as string;
    let boards = [];

    if (title) {
      boards = await ctx.db
        .query("boards")
        .withSearchIndex("search_title", (q) => {
          return q.search("title", title).eq("orgId", args.orgId);
        })
        .collect();
    } else {
      boards = await ctx.db
        .query("boards")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .order("desc")
        .collect();
    }

    const boardsWithRelation = boards.map(async (board) => {
      return ctx.db
        .query("userBoards")
        .withIndex("by_user_board", (q) => {
          return q.eq("userId", identity.subject).eq("boardId", board._id);
        })
        .unique()
        .then((relation) => {
          return {
            ...board,
            isRelation: !!relation,
          };
        });
    });

    const boardsWithBoolean = Promise.all(boardsWithRelation);

    return boardsWithBoolean;
  },
});
