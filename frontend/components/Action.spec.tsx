import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Actions } from "./Action";
import { useRenameModal } from "@/store/useRenameModal";
import { useApiMutation } from "@/hooks/useApiMutation";
import { NextIntlClientProvider } from "next-intl";

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("@/store/useRenameModal", () => ({
    useRenameModal: jest.fn(),
}));

jest.mock("@/hooks/useApiMutation", () => ({
    useApiMutation: jest.fn(),
}));

global.navigator.clipboard = {
    writeText: jest.fn(),
} as any;

const messages = {
    tools: {
        copyLink: "Copy link",
        rename: "Rename",
        download: "Download",
        downloadAsSVG: "Download as SVG",
        downloadAsPNG: "Download as PNG",
        delete: "Delete",
    },
};

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <NextIntlClientProvider locale="en" messages={messages}>
            {ui}
        </NextIntlClientProvider>
    );

describe("Actions component", () => {
    const mockOnOpen = jest.fn();
    const mockMutate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useRenameModal as jest.Mock).mockReturnValue({
            onOpen: mockOnOpen,
        });

        (useApiMutation as jest.Mock).mockReturnValue({
            mutate: mockMutate,
            pending: false,
        });
    });

    test("рендерит триггер (children)", () => {
        renderWithIntl(
            <Actions id="1" title="Test Board">
                <button>Trigger</button>
            </Actions>
        );

        expect(screen.getByText("Trigger")).toBeInTheDocument();
    });

    test("открывает меню и находит пункт 'Copy link'", async () => {
        renderWithIntl(
            <Actions id="1" title="Test Board">
                <button>Trigger</button>
            </Actions>
        );

        const triggerButton = screen.getByRole("button", { name: "Trigger" });

        await act(async () => {
            userEvent.click(triggerButton);
        });

        const copyLinkItem = await screen.findByText("Copy link");
        expect(copyLinkItem).toBeInTheDocument();
    });

    test("нажимает на 'Rename', вызывает onOpen(id, title)", async () => {
        renderWithIntl(
            <Actions id="1" title="Test Board">
                <button>Trigger</button>
            </Actions>
        );

        await act(async () => {
            userEvent.click(screen.getByRole("button", { name: "Trigger" }));
        });

        const renameItem = await screen.findByText("Rename");

        await act(async () => {
            userEvent.click(renameItem);
        });

        await waitFor(() => {
            expect(mockOnOpen).toHaveBeenCalledWith("1", "Test Board");
        });
    });
});
