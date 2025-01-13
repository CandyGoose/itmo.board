import { render, screen } from "@testing-library/react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Authenticated, AuthLoading } from "convex/react";
import ConvexClietProvider from "./ConvexClientProvider";
import '@testing-library/jest-dom';

jest.mock("@clerk/nextjs", () => ({
    ClerkProvider: jest.fn(({ children }) => <div>{children}</div>),
    useAuth: jest.fn(),
}));

jest.mock("convex/react-clerk", () => ({
    ConvexProviderWithClerk: jest.fn(({ children }) => <div>{children}</div>),
}));

jest.mock("convex/react", () => ({
    Authenticated: jest.fn(({ children }) => <div>{children}</div>),
    AuthLoading: jest.fn(({ children }) => <div>{children}</div>),
    ConvexReactClient: jest.fn(() => ({
        query: jest.fn(),
        mutation: jest.fn(),
    })),
}));

jest.mock("@/app/[locale]/loading", () => jest.fn(() => <div>Loading...</div>));

describe("ConvexClietProvider", () => {
    it("renders children inside ClerkProvider and ConvexProviderWithClerk", () => {
        const ChildComponent = () => <div>Child Component</div>;

        render(
            <ConvexClietProvider>
                <ChildComponent />
            </ConvexClietProvider>
        );

        expect(ClerkProvider).toHaveBeenCalled();
        expect(ConvexProviderWithClerk).toHaveBeenCalled();

        expect(screen.getByText("Loading...")).toBeInTheDocument();

        expect(screen.getByText("Child Component")).toBeInTheDocument();
    });

    it("passes the correct client to ConvexProviderWithClerk", () => {
        render(
            <ConvexClietProvider>
                <div>Test</div>
            </ConvexClietProvider>
        );

        expect(ConvexProviderWithClerk).toHaveBeenCalledWith(
            expect.objectContaining({
                client: expect.any(Object),
            }),
            {}
        );
    });

    it("renders the loading screen while authentication is loading", () => {
        render(
            <ConvexClietProvider>
                <div>Test</div>
            </ConvexClietProvider>
        );

        expect(AuthLoading).toHaveBeenCalled();
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders children when authenticated", () => {
        render(
            <ConvexClietProvider>
                <div>Authenticated Content</div>
            </ConvexClietProvider>
        );

        expect(Authenticated).toHaveBeenCalled();
        expect(screen.getByText("Authenticated Content")).toBeInTheDocument();
    });
});
