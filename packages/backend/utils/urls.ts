import env from "./env";

const CDN_PREFIX = (useCacheCdn?: boolean) => `${useCacheCdn ? env.CACHE_CDN_URL : env.CDN_SERVER_URL}/cdn/data`;

export function cdnUrl(path: string, useCacheCdn = true) {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    return `${CDN_PREFIX(useCacheCdn)}/${path}`;
}

export function projectIconUrl(projectId: string, icon: string | null) {
    if (!icon) return null;
    // If the icon has a full URL, return it
    if (icon.startsWith("http")) return icon;

    // Otherwise, construct and return the CDN URL
    return cdnUrl(`${projectId}/${icon}`);
}

export function projectGalleryFileUrl(projectId: string, galleryFile: string) {
    if (galleryFile.startsWith("http")) return galleryFile;
    return cdnUrl(`${projectId}/gallery/${encodeURIComponent(galleryFile)}`);
}

export function versionFileUrl(projectId: string, versionId: string, fileName: string, useCacheCdn?: boolean) {
    if (fileName.startsWith("http")) return fileName;
    return cdnUrl(`${projectId}/version/${versionId}/${encodeURIComponent(fileName)}`, useCacheCdn);
}

export function orgIconUrl(orgId: string, icon: string | null) {
    if (!icon) return null;
    // If the icon has a full URL, return it
    if (icon.startsWith("http")) return icon;

    // Otherwise, construct and return the CDN URL
    return cdnUrl(`organization/${orgId}/${icon}`);
}

export function userIconUrl(userId: string, icon: string | null) {
    if (!icon) return null;
    // If the icon has a full URL, return it
    if (icon.startsWith("http")) return icon;

    // Otherwise, construct and return the CDN URL
    return cdnUrl(`user/${userId}/${icon}`);
}
