import type { GlobalUserRole } from "@app/utils/types";
import type { User } from "@prisma/client";

export interface SessionDeviceDetails {
    os: {
        name: string;
        version?: string;
    };
    ipAddress: string;
    browser: string;
    city: string;
    country: string;
}

export interface ContextUserData extends User {
    sessionId: string;
    role: GlobalUserRole;
}

export enum FILE_STORAGE_SERVICE {
    LOCAL = "local",
}

export enum HashAlgorithms {
    SHA1 = "sha1",
    SHA512 = "sha512",
}
