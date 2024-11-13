import { render, screen } from "@testing-library/react";
import { EmptySearch } from "./EmptySearch";
import "@testing-library/jest-dom";

describe("EmptySearch", () => {
  it("renders the main heading", () => {
    render(<EmptySearch />);
    expect(screen.getByText("No results found!")).toBeInTheDocument();
  });

  it("renders the subtext", () => {
    render(<EmptySearch />);
    expect(
      screen.getByText("Try searching for something else!")
    ).toBeInTheDocument();
  });
});
