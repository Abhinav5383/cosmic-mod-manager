import { fallbackOrgIcon, fallbackProjectIcon } from "@app/components/icons";
import RefreshPage from "@app/components/misc/refresh-page";
import { Button } from "@app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@app/components/ui/card";
import { toast } from "@app/components/ui/sonner";
import { LoadingSpinner } from "@app/components/ui/spinner";
import { NotificationType } from "@app/utils/types";
import type { Notification, OrganisationListItem, ProjectListItem } from "@app/utils/types/api";
import type { UserProfileData } from "@app/utils/types/api/user";
import { CheckCheckIcon, HistoryIcon } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router";
import { VariantButtonLink, useNavigate } from "~/components/ui/link";
import { useTranslation } from "~/locales/provider";
import clientFetch from "~/utils/client-fetch";
import { OrgPagePath, ProjectPagePath } from "~/utils/urls";
import { TeamInviteNotification } from "./item-card";

export interface NotificationsData {
    notifications: Notification[];
    relatedProjects: ProjectListItem[];
    relatedUsers: UserProfileData[];
    relatedOrgs: OrganisationListItem[];
}

export default function NotificationsPage({ notifications, relatedProjects, relatedOrgs, relatedUsers }: NotificationsData) {
    const { t } = useTranslation();
    const [markingAsRead, setMarkingAsRead] = useState(false);
    const unreadNotifications = notifications?.filter((notification) => !notification.read);

    const navigate = useNavigate();
    const location = useLocation();

    async function markAllAsRead() {
        if (!unreadNotifications?.length || markingAsRead) return;
        setMarkingAsRead(true);
        try {
            const unreadNotificationIds = unreadNotifications.map((n) => n.id);
            const result = await clientFetch(`/api/notifications?ids=${encodeURIComponent(JSON.stringify(unreadNotificationIds))}`, {
                method: "PATCH",
            });

            if (!result.ok) {
                return toast.error("Failed to mark notifications as read");
            }

            RefreshPage(navigate, location);
        } finally {
            setMarkingAsRead(false);
        }
    }

    return (
        <Card className="w-full">
            <CardHeader className="w-full flex flex-row flex-wrap gap-x-4 gap-y-2 items-center justify-between">
                <CardTitle className="w-fit">{t.dashboard.notifications}</CardTitle>

                {(notifications?.length || 0) > 0 && (
                    <div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-1">
                        <VariantButtonLink url="/dashboard/notifications/history" className="w-fit">
                            <HistoryIcon aria-hidden className="w-btn-icon-md h-btn-icon-md" />
                            {t.dashboard.viewHistory}
                        </VariantButtonLink>

                        {(unreadNotifications?.length || 0) > 1 && (
                            <Button variant="secondary-destructive" disabled={markingAsRead} onClick={markAllAsRead}>
                                {markingAsRead ? (
                                    <LoadingSpinner size="xs" />
                                ) : (
                                    <CheckCheckIcon aria-hidden className="w-btn-icon-md h-btn-icon-md" />
                                )}
                                {t.dashboard.markAllRead}
                            </Button>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent className="flex flex-col gap-panel-cards">
                {!unreadNotifications?.length && <span className="text-muted-foreground">{t.dashboard.noUnreadNotifs}</span>}

                <ul aria-label="Notifications list" className="w-full flex flex-col gap-panel-cards">
                    {unreadNotifications?.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            relatedProject={relatedProjects.find((p) => p.id === `${notification.body?.projectId}`)}
                            relatedUser={relatedUsers.find((u) => u.id === `${notification.body?.invitedBy}`)}
                            relatedOrg={relatedOrgs.find((o) => o.id === `${notification.body?.orgId}`)}
                        />
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

export function NotificationItem({
    notification,
    relatedProject,
    relatedOrg,
    relatedUser,
    ...props
}: {
    notification: Notification;
    relatedProject?: ProjectListItem;
    relatedOrg?: OrganisationListItem;
    relatedUser?: UserProfileData;
    concise?: boolean;
    showMarkAsReadButton?: boolean;
    showDeleteButton?: boolean;
}) {
    const [markingAsRead, setMarkingAsRead] = useState(false);
    const [deletingNotification, setDeletingNotification] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    async function markNotificationAsRead(refresh = true) {
        if (deletingNotification || markingAsRead) return;
        setMarkingAsRead(true);
        try {
            const result = await clientFetch(`/api/notifications/${notification.id}`, {
                method: "PATCH",
            });

            if (!result.ok) {
                toast.error("Failed to mark notifications as read");
                return;
            }

            if (refresh) RefreshPage(navigate, location);
        } finally {
            setMarkingAsRead(false);
        }
    }

    async function deleteNotification(refresh = true) {
        if (markingAsRead) return;
        setDeletingNotification(true);
        try {
            const result = await clientFetch(`/api/notifications/${notification.id}`, {
                method: "DELETE",
            });

            if (!result.ok) {
                toast.error("Failed to delete notification");
                return;
            }

            if (refresh) RefreshPage(navigate, location);
        } finally {
            setDeletingNotification(false);
        }
    }

    switch (notification.type) {
        case NotificationType.TEAM_INVITE:
            return (
                <TeamInviteNotification
                    notification={notification}
                    markNotificationAsRead={markNotificationAsRead}
                    deleteNotification={deleteNotification}
                    markingAsRead={markingAsRead}
                    deletingNotification={deletingNotification}
                    navigateTo={ProjectPagePath(relatedProject?.type[0] || "project", relatedProject?.slug || "")}
                    pageUrl={ProjectPagePath(relatedProject?.type[0] || "project", relatedProject?.slug || "")}
                    invitedBy={{
                        userName: relatedUser?.userName || (notification.body?.invitedBy as string),
                        avatar: relatedUser?.avatar || null,
                    }}
                    title={relatedProject?.name || (notification.body?.projectId as string)}
                    icon={relatedProject?.icon || null}
                    fallbackIcon={fallbackProjectIcon}
                    {...props}
                />
            );

        case NotificationType.ORGANIZATION_INVITE:
            return (
                <TeamInviteNotification
                    notification={notification}
                    markNotificationAsRead={markNotificationAsRead}
                    deleteNotification={deleteNotification}
                    markingAsRead={markingAsRead}
                    deletingNotification={deletingNotification}
                    navigateTo={OrgPagePath(relatedOrg?.slug || "")}
                    pageUrl={OrgPagePath(relatedOrg?.slug || "")}
                    invitedBy={{
                        userName: relatedUser?.userName || (notification.body?.invitedBy as string),
                        avatar: relatedUser?.avatar || null,
                    }}
                    title={relatedOrg?.name || (notification.body?.orgId as string)}
                    icon={relatedOrg?.icon || null}
                    fallbackIcon={fallbackOrgIcon}
                    {...props}
                />
            );
    }
}
