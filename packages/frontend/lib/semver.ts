import GAME_VERSIONS from "@shared/config/game-versions";
import { rsort } from "semver";

export const groupContinuousVersions = (versions: string[], referenceList: string[]): string[][] => {
    const groupedList: string[][] = [[]];
    const sortedVersions = rsort(versions);
    let refListIndex = referenceList.indexOf(sortedVersions[0]);

    if (refListIndex === -1) return groupedList;

    for (let i = 0; i < sortedVersions.length; i++) {
        refListIndex += 1;
        groupedList.at(-1)?.push(sortedVersions[i]);

        if (sortedVersions[i + 1] === referenceList[refListIndex]) continue;
        if (i < sortedVersions.length - 1) {
            groupedList.push([]);
            refListIndex = referenceList.indexOf(sortedVersions[i + 1]);
        }
    }

    return groupedList;
};

export const getGroupedVersionsList = (list: string[]): string[] => {
    const formattedList: string[] = [];
    const groupedVersions = groupContinuousVersions(
        list,
        GAME_VERSIONS.map((version) => version.version),
    );

    for (const versionGroup of groupedVersions) {
        if (versionGroup.length === 1) formattedList.push(versionGroup[0]);
        else {
            formattedList.push(`${versionGroup.at(-1)}–${versionGroup[0]}`);
        }
    }

    return formattedList;
};

export const formatVersionsListString = (list: string[]): string => {
    let formattedStr = "";
    const groupedVersions = groupContinuousVersions(
        list,
        GAME_VERSIONS.map((version) => version.version),
    );

    for (const versionGroup of groupedVersions) {
        if (versionGroup.length === 1) formattedStr += `${versionGroup[0]}, `;
        else {
            formattedStr += `${versionGroup.at(-1)}–${versionGroup[0]}, `;
        }
    }

    return formattedStr.slice(0, -2);
};
