import React from "react";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";
import { useOrganization } from "@clerk/nextjs";
import "@testing-library/jest-dom";

jest.mock("@clerk/nextjs", () => ({
  UserButton: () => <div data-testid="user-button">UserButton</div>,
  OrganizationSwitcher: () => (
    <div data-testid="organization-switcher">OrganizationSwitcher</div>
  ),
  useOrganization: jest.fn(),
}));

jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = "MockLink";
  return MockLink;
});

jest.mock("./SearchInput", () => ({
  SearchInput: () => <div data-testid="search-input">SearchInput</div>,
}));

jest.mock("./InviteButton", () => ({
  InviteButton: () => <div data-testid="invite-button">InviteButton</div>,
}));

jest.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.join(" "),
}));

jest.mock("next/font/google", () => ({
  Poppins: () => ({ className: "poppins-font" }),
}));

describe("Navbar Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the logo link with correct href and text", () => {
    (useOrganization as jest.Mock).mockReturnValue({ organization: null });

    render(<Navbar />);

    const logoLink = screen.getByRole("link", { name: /itmo\.board/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("href", "/");
  });

  test("renders the OrganizationSwitcher component", () => {
    (useOrganization as jest.Mock).mockReturnValue({ organization: null });

    render(<Navbar />);

    const orgSwitcher = screen.getByTestId("organization-switcher");
    expect(orgSwitcher).toBeInTheDocument();
  });

  test("renders the SearchInput component on large screens", () => {
    (useOrganization as jest.Mock).mockReturnValue({ organization: null });

    render(<Navbar />);

    const searchInput = screen.getByTestId("search-input");
    expect(searchInput).toBeInTheDocument();
  });

  test("renders the InviteButton when an organization exists", () => {
    (useOrganization as jest.Mock).mockReturnValue({
      organization: { id: "org_123" },
    });

    render(<Navbar />);

    const inviteButton = screen.getByTestId("invite-button");
    expect(inviteButton).toBeInTheDocument();
  });

  test("does not render the InviteButton when no organization exists", () => {
    (useOrganization as jest.Mock).mockReturnValue({ organization: null });

    render(<Navbar />);

    const inviteButton = screen.queryByTestId("invite-button");
    expect(inviteButton).not.toBeInTheDocument();
  });

  test("renders the UserButton component", () => {
    (useOrganization as jest.Mock).mockReturnValue({ organization: null });

    render(<Navbar />);

    const userButton = screen.getByTestId("user-button");
    expect(userButton).toBeInTheDocument();
  });

  test("applies the Poppins font class to the logo text", () => {
    (useOrganization as jest.Mock).mockReturnValue({ organization: null });

    render(<Navbar />);

    const logoText = screen.getByText(/itmo\.board/i);
    expect(logoText).toHaveClass("font-semibold text-2xl poppins-font");
  });
});
