import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { CookiesProvider } from "react-cookie";
import AuthProvider from "./auth-provider";
import ThemeProvider from "./theme-provider";

const reactQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<QueryClientProvider client={reactQueryClient}>
			<CookiesProvider>
				<AuthProvider>
					<ThemeProvider>{children}</ThemeProvider>
				</AuthProvider>
			</CookiesProvider>
		</QueryClientProvider>
	);
};

export default Providers;
