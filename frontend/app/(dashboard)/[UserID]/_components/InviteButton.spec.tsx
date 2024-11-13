import React from "react";
import { render, screen } from "@testing-library/react";
import { InviteButton } from "./InviteButton";
import "@testing-library/jest-dom";

describe("InviteButton", () => {
  it("renders the invite button with correct text", () => {
    render(<InviteButton />);
    expect(screen.getByText("Invite Members")).toBeInTheDocument();
  });

  test("dialog is not visible initially", () => {
    render(<InviteButton />);

    const dialogContent = screen.queryByTestId("dialog-content");
    expect(dialogContent).not.toBeInTheDocument();
  });
});
