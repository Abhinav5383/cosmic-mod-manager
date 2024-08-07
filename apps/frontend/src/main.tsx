import RedrectTo from "@/components/redirect-to";
import { SuspenseFallback } from "@/components/ui/spinner";
import SignInCallbackPage from "@/src/(auth)/callbacks/signin";
import ChangePasswordPageLayout from "@/src/(auth)/change-password/layout";
import LoginPageLayout from "@/src/(auth)/login/layout";
import SignupPageLayout from "@/src/(auth)/signup/layout";
import RootLayout from "@/src/App";
import MessagePage from "@/src/Message";
import "@/src/globals.css";
import NotFoundPage from "@/src/not-found";
import ProjectContextProvider from "@/src/providers/project-context";
import SettingsPageLayout from "@/src/settings/layout";
import { ProjectTypes } from "@root/config/project";
import { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";

import DashboardPageLayout from "@/src/dashboard/layout";
import ProjectDetailsLayout from "@/src/dashboard/projects/project-details/layout";
import ProjectSettingsLayout from "@/src/dashboard/projects/project-settings/layout";
import { getProjectTypePathname } from "@root/lib/utils";

const SignupPage = lazy(() => import("@/src/(auth)/signup/page"));
const LoginPage = lazy(() => import("@/src/(auth)/login/page"));
const VerifyActionPage = lazy(() => import("@/src/(auth)/verify-action/page"));
const ChangePasswordPage = lazy(() => import("@/src/(auth)/change-password/page"));
const Notifications = lazy(() => import("@/src/dashboard/notifications"));
const Overview = lazy(() => import("@/src/dashboard/overview"));
const DashboardPage = lazy(() => import("@/src/dashboard/page"));
const ProjectDescription = lazy(() => import("@/src/dashboard/projects/project-details/description"));
const CreateVersionPage = lazy(() => import("@/src/dashboard/projects/project-details/versions/create-version"));
const EditVersionPage = lazy(() => import("@/src/dashboard/projects/project-details/versions/edit-version"));
const VersionListPage = lazy(() => import("@/src/dashboard/projects/project-details/versions/page"));
const ProjectVersionPage = lazy(() => import("@/src/dashboard/projects/project-details/versions/version-page"));
const ProjectDescriptSettingsPage = lazy(() => import("@/src/dashboard/projects/project-settings/description"));
const GeneralProjectSettings = lazy(() => import("@/src/dashboard/projects/project-settings/general"));
const ProjectLinksSettings = lazy(() => import("@/src/dashboard/projects/project-settings/links"));
const Projects = lazy(() => import("@/src/dashboard/projects/projects"));
const ReportsPage = lazy(() => import("@/src/dashboard/reports"));
const AccountSettingsPage = lazy(() => import("@/src/settings/account/page"));
const SettingsPage = lazy(() => import("@/src/settings/page"));
const TagsSettingsPage = lazy(() => import("./dashboard/projects/project-settings/tags"));
const HomePage = lazy(() => import("@/src/home"));
const Sessions = lazy(() => import("@/src/settings/session/page"));
const LicensePage = lazy(() => import("@/src/dashboard/projects/project-settings/license"));
const MembersSettingsPage = lazy(() => import("@/src/dashboard/projects/project-settings/members"));
const SearchPage = lazy(() => import("@/src/search-page/search"));

const projectRoute = (project_type: string) => {
    return {
        path: project_type,
        element: <Outlet />,
        children: [
            {
                path: "",
                element: <NotFoundPage />,
            },
            {
                path: ":projectUrlSlug",
                element: (
                    <ProjectContextProvider>
                        <Outlet />
                    </ProjectContextProvider>
                ),
                children: [
                    {
                        path: "",
                        element: <ProjectDetailsLayout />,
                        children: [
                            {
                                path: "",
                                element: <RedrectTo destinationUrl="description" />,
                            },
                            {
                                path: "description",
                                element: (
                                    <Suspense fallback={<SuspenseFallback />}>
                                        <ProjectDescription />
                                    </Suspense>
                                ),
                            },
                            {
                                path: "gallery",
                                element: <p>Project gallery</p>,
                            },
                            {
                                path: "changelog",
                                element: <p>Changelogs</p>,
                            },
                            {
                                path: "versions",
                                element: (
                                    <Suspense fallback={<SuspenseFallback />}>
                                        <VersionListPage projectType={project_type} />
                                    </Suspense>
                                ),
                            },
                            {
                                path: "version",
                                element: <Outlet />,
                                children: [
                                    {
                                        path: "create",
                                        element: (
                                            <Suspense fallback={<SuspenseFallback />}>
                                                <CreateVersionPage projectType={project_type} />
                                            </Suspense>
                                        ),
                                    },
                                    {
                                        path: ":versionUrlSlug",
                                        element: <Outlet />,
                                        children: [
                                            {
                                                path: "",
                                                element: (
                                                    <Suspense fallback={<SuspenseFallback />}>
                                                        <ProjectVersionPage projectType={project_type} />
                                                    </Suspense>
                                                ),
                                            },
                                            {
                                                path: "edit",
                                                element: (
                                                    <Suspense fallback={<SuspenseFallback />}>
                                                        <EditVersionPage projectType={project_type} />
                                                    </Suspense>
                                                ),
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        path: "settings",
                        element: <ProjectSettingsLayout projectType={project_type} />,
                        children: [
                            {
                                path: "",
                                element: <RedrectTo destinationUrl="general" />,
                            },
                            {
                                path: "general",
                                element: (
                                    <Suspense fallback={<SuspenseFallback />}>
                                        <GeneralProjectSettings />
                                    </Suspense>
                                ),
                            },
                            {
                                path: "tags",
                                element: (
                                    <Suspense fallback={<SuspenseFallback />}>
                                        <TagsSettingsPage />
                                    </Suspense>
                                ),
                            },
                            {
                                path: "description",
                                element: (
                                    <Suspense fallback={<SuspenseFallback />}>
                                        <ProjectDescriptSettingsPage />
                                    </Suspense>
                                ),
                            },
                            {
                                path: "license",
                                element: (
                                    <Suspense fallback={<SuspenseFallback />}>
                                        <LicensePage />
                                    </Suspense>
                                ),
                            },
                            {
                                path: "links",
                                element: (
                                    <Suspense fallback={<SuspenseFallback />}>
                                        <ProjectLinksSettings />
                                    </Suspense>
                                ),
                            },
                            {
                                path: "members",
                                element: (
                                    <Suspense fallback={<SuspenseFallback />}>
                                        <MembersSettingsPage />
                                    </Suspense>
                                ),
                            },
                        ],
                    },
                ],
            },
        ],
    };
};

const getProjectPageRoutes = () => {
    const projectTypeRoutes = [...ProjectTypes.map((project_type) => getProjectTypePathname(project_type).slice(1))];
    const projectRoute_1 = projectRoute("project");
    const list: (typeof projectRoute_1)[] = [projectRoute_1];
    for (const project_type of projectTypeRoutes) {
        list.push(projectRoute(project_type));
    }

    return list;
};

const getSearchPageRoutes = () => {
    const routes = [];
    for (const project_type of ProjectTypes) {
        routes.push({
            path: `${getProjectTypePathname(project_type).slice(1)}s`,
            element: (
                <Suspense
                    fallback={
                        <div className="w-full h-[75vh] flex items-center justify-center">
                            <SuspenseFallback />
                        </div>
                    }
                >
                    <SearchPage projectType={project_type} />
                </Suspense>
            ),
        });
    }

    return routes;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                path: "",
                element: (
                    <Suspense
                        fallback={
                            <div className="w-full h-[75vh] flex items-center justify-center">
                                <SuspenseFallback />
                            </div>
                        }
                    >
                        <HomePage />
                    </Suspense>
                ),
            },
            ...getSearchPageRoutes(),
            {
                path: "login",
                element: <LoginPageLayout />,
                children: [
                    {
                        path: "",
                        element: (
                            <Suspense fallback={<SuspenseFallback />}>
                                <LoginPage />
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                path: "signup",
                element: <SignupPageLayout />,
                children: [
                    {
                        path: "",
                        element: (
                            <Suspense fallback={<SuspenseFallback />}>
                                <SignupPage />
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                path: "change-password",
                element: <ChangePasswordPageLayout />,
                children: [
                    {
                        path: "",
                        element: (
                            <Suspense fallback={<SuspenseFallback />}>
                                <ChangePasswordPage />
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                path: "settings",
                element: <SettingsPageLayout />,
                children: [
                    {
                        path: "",
                        element: (
                            <Suspense fallback={<SuspenseFallback />}>
                                <SettingsPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: "account",
                        element: (
                            <Suspense fallback={<SuspenseFallback />}>
                                <AccountSettingsPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: "sessions",
                        element: (
                            <Suspense fallback={<SuspenseFallback />}>
                                <Sessions />
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                path: "dashboard",
                element: <DashboardPageLayout />,
                children: [
                    {
                        path: "",
                        element: (
                            <Suspense fallback={<SuspenseFallback />}>
                                <DashboardPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: "overview",
                        element: (
                            <Suspense fallback={<SuspenseFallback />}>
                                <Overview />
                            </Suspense>
                        ),
                    },
                    {
                        path: "notifications",
                        element: (
                            <Suspense fallback={<SuspenseFallback />}>
                                <Notifications />
                            </Suspense>
                        ),
                    },
                    {
                        path: "reports",
                        element: (
                            <Suspense fallback={<SuspenseFallback />}>
                                <ReportsPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: "projects",
                        element: (
                            <Suspense fallback={<SuspenseFallback />}>
                                <Projects />
                            </Suspense>
                        ),
                    },
                    {
                        path: "*",
                        element: <p>DASHBOARD_PAGE</p>,
                    },
                ],
            },
            ...getProjectPageRoutes(),
            {
                path: "auth/callback/:authProvider",
                element: <SignInCallbackPage />,
            },
            {
                path: "verify-action",
                element: (
                    <Suspense fallback={<SuspenseFallback />}>
                        <VerifyActionPage />
                    </Suspense>
                ),
            },
            {
                path: "message",
                element: <MessagePage />,
            },
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
]);

ReactDOM.createRoot(
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    document.getElementById("root")!,
).render(<RouterProvider router={router} />);
