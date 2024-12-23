import { FILE_STORAGE_SERVICE } from "@/types";
import { isUrl } from "@shared/lib/utils";
import { type WritableFile, deleteFromLocalStorage, getFileFromLocalStorage, saveFileToLocalStorage } from "./local";
import { orgFileStoragePath, projectFileStoragePath, projectGalleryStoragePath, versionFileStoragePath } from "./utils";

export const getFile = async (storageService: FILE_STORAGE_SERVICE, path: string) => {
    try {
        switch (storageService) {
            case FILE_STORAGE_SERVICE.LOCAL:
                return await getFileFromLocalStorage(path);
            default:
                return null;
        }
    } catch (error) {
        return null;
    }
};

export const saveFile = async (storageService: FILE_STORAGE_SERVICE, file: WritableFile, path: string) => {
    try {
        switch (storageService) {
            case FILE_STORAGE_SERVICE.LOCAL:
                return await saveFileToLocalStorage(path, file);
            default:
                return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const deleteFile = async (storageService: FILE_STORAGE_SERVICE, path: string) => {
    try {
        switch (storageService) {
            case FILE_STORAGE_SERVICE.LOCAL:
                return await deleteFromLocalStorage(path);
            default:
                return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const deleteDirectory = async (storageService: FILE_STORAGE_SERVICE, path: string) => {
    try {
        switch (storageService) {
            case FILE_STORAGE_SERVICE.LOCAL:
                return await deleteFromLocalStorage(path);
            default:
                return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

// ? Project Files
export const saveProjectFile = async (storageService: FILE_STORAGE_SERVICE, projectId: string, file: WritableFile, fileName: string) => {
    return await saveFile(storageService, file, projectFileStoragePath(projectId, fileName));
};

export const deleteProjectFile = async (storageService: FILE_STORAGE_SERVICE, projectId: string, fileName: string) => {
    return await deleteFile(storageService, projectFileStoragePath(projectId, fileName));
};

export const deleteProjectDirectory = async (storageService: FILE_STORAGE_SERVICE, projectId: string) => {
    return await deleteDirectory(storageService, projectFileStoragePath(projectId));
};

export const getProjectFile = async (storageService: FILE_STORAGE_SERVICE, projectId: string, fileName: string) => {
    return await getFile(storageService, projectFileStoragePath(projectId, fileName));
};

// ? Project Version Files
export const saveProjectVersionFile = async (
    storageService: FILE_STORAGE_SERVICE,
    projectId: string,
    versionId: string,
    file: WritableFile,
    fileName: string,
) => {
    return await saveFile(storageService, file, versionFileStoragePath(projectId, versionId, fileName));
};

export const deleteProjectVersionFile = async (
    storageService: FILE_STORAGE_SERVICE,
    projectId: string,
    versionId: string,
    fileName: string,
) => {
    return await deleteFile(storageService, versionFileStoragePath(projectId, versionId, fileName));
};

export const deleteProjectVersionDirectory = async (storageService: FILE_STORAGE_SERVICE, projectId: string, versionId: string) => {
    return await deleteDirectory(storageService, versionFileStoragePath(projectId, versionId));
};

export const getProjectVersionFile = async (
    storageService: FILE_STORAGE_SERVICE,
    projectId: string,
    versionId: string,
    fileName: string,
) => {
    return await getFile(storageService, versionFileStoragePath(projectId, versionId, fileName));
};

// ? Project Gallery Files
export const getProjectGalleryFile = async (storageService: FILE_STORAGE_SERVICE, projectId: string, fileName: string) => {
    if (isUrl(fileName)) return fileName;
    return await getFile(storageService, projectGalleryStoragePath(projectId, fileName));
};

export const saveProjectGalleryFile = async (
    storageService: FILE_STORAGE_SERVICE,
    projectId: string,
    file: WritableFile,
    fileName: string,
) => {
    if (isUrl(fileName)) return fileName;
    return await saveFile(storageService, file, projectGalleryStoragePath(projectId, fileName));
};

export const deleteProjectGalleryFile = async (storageService: FILE_STORAGE_SERVICE, projectId: string, fileName: string) => {
    if (isUrl(fileName)) return fileName;
    return await deleteFile(storageService, projectGalleryStoragePath(projectId, fileName));
};

// ? Organization Files
export const saveOrgFile = async (storageService: FILE_STORAGE_SERVICE, orgId: string, file: WritableFile, fileName: string) => {
    return await saveFile(storageService, file, orgFileStoragePath(orgId, fileName));
};

export const deleteOrgFile = async (storageService: FILE_STORAGE_SERVICE, orgId: string, fileName: string) => {
    return await deleteFile(storageService, orgFileStoragePath(orgId, fileName));
};

export const deleteOrgDirectory = async (storageService: FILE_STORAGE_SERVICE, orgId: string) => {
    return await deleteDirectory(storageService, orgFileStoragePath(orgId));
};

export const getOrgFile = async (storageService: FILE_STORAGE_SERVICE, orgId: string, fileName: string) => {
    return await getFile(storageService, orgFileStoragePath(orgId, fileName));
};
