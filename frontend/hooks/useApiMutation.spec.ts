import { renderHook, act } from "@testing-library/react";
import { useApiMutation } from "./useApiMutation";
import { useMutation } from "convex/react";

jest.mock("convex/react", () => ({
    useMutation: jest.fn(),
}));

describe("useApiMutation", () => {
    const mockMutationFunction = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useMutation as jest.Mock).mockReturnValue(mockMutationFunction);
    });

    it("should initialize with pending as false", () => {
        const { result } = renderHook(() => useApiMutation(() => {}));
        expect(result.current.pending).toBe(false);
    });

    it("should set pending to true while the mutation is in progress", async () => {
        mockMutationFunction.mockImplementation(() => new Promise(() => {}));

        const { result } = renderHook(() => useApiMutation(() => {}));
        const payload = { test: "data" };

        act(() => {
            result.current.mutate(payload);
        });

        expect(result.current.pending).toBe(true);
    });

    it("should set pending to false after the mutation resolves", async () => {
        mockMutationFunction.mockResolvedValue("success");

        const { result } = renderHook(() => useApiMutation(() => {}));
        const payload = { test: "data" };

        await act(async () => {
            await result.current.mutate(payload);
        });

        expect(result.current.pending).toBe(false);
    });

    it("should return the result of the mutation", async () => {
        const response = { message: "Mutation successful" };
        mockMutationFunction.mockResolvedValue(response);

        const { result } = renderHook(() => useApiMutation(() => {}));
        const payload = { test: "data" };

        let data;
        await act(async () => {
            data = await result.current.mutate(payload);
        });

        expect(data).toEqual(response);
    });

    it("should throw an error if the mutation fails", async () => {
        const error = new Error("Mutation failed");
        mockMutationFunction.mockRejectedValue(error);

        const { result } = renderHook(() => useApiMutation(() => {}));
        const payload = { test: "data" };

        await expect(
            act(async () => {
                await result.current.mutate(payload);
            })
        ).rejects.toThrow("Mutation failed");
    });

    it("should set pending to false if the mutation fails", async () => {
        const error = new Error("Mutation failed");
        mockMutationFunction.mockRejectedValue(error);

        const { result } = renderHook(() => useApiMutation(() => {}));
        const payload = { test: "data" };

        try {
            await act(async () => {
                await result.current.mutate(payload);
            });
        } catch (e) {
        }

        expect(result.current.pending).toBe(false);
    });
});
