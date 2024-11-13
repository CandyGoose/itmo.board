import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmptyOrg } from "./EmptyOrg";

jest.mock("@clerk/nextjs", () => ({
  CreateOrganization: jest.fn(() => (
    <div data-testid="create-organization">CreateOrganization Component</div>
  )),
}));

jest.mock("@/components/ui/Dialog", () => {
  const React = jest.requireActual("react");
  return {
    Dialog: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DialogTrigger: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DialogContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

jest.mock("@/components/ui/Button", () => {
  const React = jest.requireActual("react");
  return {
    Button: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <button {...props}>{children}</button>,
  };
});

describe("EmptyOrg Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders heading and paragraph correctly", () => {
    render(<EmptyOrg />);

    const heading = screen.getByRole("heading", {
      name: /welcome to itmo\.board/i,
    });
    expect(heading).toBeInTheDocument();

    const paragraph = screen.getByText(
      /create an organization to get started!/i
    );
    expect(paragraph).toBeInTheDocument();
  });

  test('renders "Create an Organization!" button', () => {
    render(<EmptyOrg />);

    const button = screen.getByRole("button", {
      name: /create an organization!/i,
    });
    expect(button).toBeInTheDocument();
  });

  test("opens dialog with CreateOrganization component on button click", async () => {
    render(<EmptyOrg />);

    const button = screen.getByRole("button", {
      name: /create an organization!/i,
    });
    fireEvent.click(button);

    const createOrgComponent = screen.getByTestId("create-organization");
    expect(createOrgComponent).toBeInTheDocument();
    expect(createOrgComponent).toHaveTextContent(
      "CreateOrganization Component"
    );
  });
});
