import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NewBoardButton } from "./NewBoardButton";

import { useParams } from "next/navigation";
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

import { cn } from "@/lib/utils";
jest.mock("@/lib/utils", () => ({
  cn: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  Plus: (
    props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
  ) => <svg data-testid="plus-icon" {...props}></svg>,
}));

describe("NewBoardButton Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the button with correct text and icon", () => {
    (useParams as jest.Mock).mockReturnValue({});

    (cn as jest.Mock).mockImplementation((...classes: string[]) =>
      classes.filter(Boolean).join(" ")
    );

    render(<NewBoardButton orgId="org_123" />);

    const button = screen.getByRole("button", { name: /new board/i });
    expect(button).toBeInTheDocument();

    const icon = screen.getByTestId("plus-icon");
    expect(icon).toBeInTheDocument();

    const buttonText = screen.getByText(/new board/i);
    expect(buttonText).toBeInTheDocument();
  });

  test("applies correct class names when enabled", () => {
    (useParams as jest.Mock).mockReturnValue({});
    (cn as jest.Mock).mockImplementation((...classes: string[]) =>
      classes.filter(Boolean).join(" ")
    );

    render(<NewBoardButton orgId="org_123" />);

    const button = screen.getByRole("button", { name: /new board/i });
    expect(cn).toHaveBeenCalledWith(
      "col-span-1 aspect-[100/127] bg-blue-500 rounded-lg hover:bg-blue-600 flex flex-col items-center justify-center py-6",
      undefined
    );
    expect(button).toHaveClass(
      "col-span-1 aspect-[100/127] bg-blue-500 rounded-lg hover:bg-blue-600 flex flex-col items-center justify-center py-6"
    );
    expect(button).not.toHaveClass(
      "opacity-75 hover:bg-blue-500 cursor-not-allowed"
    );
  });

  test("applies correct class names when disabled", () => {
    (useParams as jest.Mock).mockReturnValue({});
    (cn as jest.Mock).mockImplementation((...classes: string[]) =>
      classes.filter(Boolean).join(" ")
    );

    render(<NewBoardButton orgId="org_123" disabled />);

    const button = screen.getByRole("button", { name: /new board/i });
    expect(cn).toHaveBeenCalledWith(
      "col-span-1 aspect-[100/127] bg-blue-500 rounded-lg hover:bg-blue-600 flex flex-col items-center justify-center py-6",
      "opacity-75 hover:bg-blue-500 cursor-not-allowed"
    );
    expect(button).toHaveClass(
      "col-span-1 aspect-[100/127] bg-blue-500 rounded-lg hover:bg-blue-600 flex flex-col items-center justify-center py-6 opacity-75 hover:bg-blue-500 cursor-not-allowed"
    );
    expect(button).toBeDisabled();
  });

  test("button is enabled when disabled prop is false", () => {
    (useParams as jest.Mock).mockReturnValue({});
    (cn as jest.Mock).mockImplementation((...classes: string[]) =>
      classes.filter(Boolean).join(" ")
    );

    render(<NewBoardButton orgId="org_123" disabled={false} />);

    const button = screen.getByRole("button", { name: /new board/i });
    expect(button).toBeEnabled();
    expect(button).toHaveClass(
      "col-span-1 aspect-[100/127] bg-blue-500 rounded-lg hover:bg-blue-600 flex flex-col items-center justify-center py-6"
    );
  });

  test("button is disabled when disabled prop is true", () => {
    (useParams as jest.Mock).mockReturnValue({});
    (cn as jest.Mock).mockImplementation((...classes: string[]) =>
      classes.filter(Boolean).join(" ")
    );

    render(<NewBoardButton orgId="org_123" disabled />);

    const button = screen.getByRole("button", { name: /new board/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "opacity-75 hover:bg-blue-500 cursor-not-allowed"
    );
  });

  test("handles click event when enabled", () => {
    (useParams as jest.Mock).mockReturnValue({});
    (cn as jest.Mock).mockImplementation((...classes: string[]) =>
      classes.filter(Boolean).join(" ")
    );
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<NewBoardButton orgId="org_123" />);
    const button = screen.getByRole("button", { name: /new board/i });
    fireEvent.click(button);

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test("does not handle click event when disabled", () => {
    (useParams as jest.Mock).mockReturnValue({});
    (cn as jest.Mock).mockImplementation((...classes: string[]) =>
      classes.filter(Boolean).join(" ")
    );
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<NewBoardButton orgId="org_123" disabled />);
    const button = screen.getByRole("button", { name: /new board/i });
    fireEvent.click(button);

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
