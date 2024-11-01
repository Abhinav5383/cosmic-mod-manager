import { GameVersionReleaseType } from "../types";

export interface GameVersion {
    label: string;
    value: string;
    releaseType: GameVersionReleaseType;
    major: boolean;
}

const GAME_VERSIONS: GameVersion[] = [
    {
        label: "0.3.2-pre10",
        value: "0.3.2-pre10",
        releaseType: GameVersionReleaseType.SNAPSHOT,
        major: false,
    },
    {
        label: "0.3.2-pre9",
        value: "0.3.2-pre9",
        releaseType: GameVersionReleaseType.SNAPSHOT,
        major: false,
    },
    {
        label: "0.3.2-pre8",
        value: "0.3.2-pre8",
        releaseType: GameVersionReleaseType.SNAPSHOT,
        major: false,
    },
    {
        label: "0.3.2-pre7",
        value: "0.3.2-pre7",
        releaseType: GameVersionReleaseType.SNAPSHOT,
        major: false,
    },
    {
        label: "0.3.2-pre6",
        value: "0.3.2-pre6",
        releaseType: GameVersionReleaseType.SNAPSHOT,
        major: false,
    },
    {
        label: "0.3.2-pre5",
        value: "0.3.2-pre5",
        releaseType: GameVersionReleaseType.SNAPSHOT,
        major: false,
    },
    {
        label: "0.3.2-pre4",
        value: "0.3.2-pre4",
        releaseType: GameVersionReleaseType.SNAPSHOT,
        major: false,
    },
    {
        label: "0.3.2-pre3",
        value: "0.3.2-pre3",
        releaseType: GameVersionReleaseType.SNAPSHOT,
        major: false,
    },
    {
        label: "0.3.2-pre2",
        value: "0.3.2-pre2",
        releaseType: GameVersionReleaseType.SNAPSHOT,
        major: false,
    },
    {
        label: "0.3.2-pre1",
        value: "0.3.2-pre1",
        releaseType: GameVersionReleaseType.SNAPSHOT,
        major: false,
    },
    {
        label: "0.3.1",
        value: "0.3.1",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.3",
        value: "0.3.0",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.2.5",
        value: "0.2.5",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.2.4",
        value: "0.2.4",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.2.3",
        value: "0.2.3",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.2.2",
        value: "0.2.2",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.2.1",
        value: "0.2.1",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.2",
        value: "0.2.0",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.50",
        value: "0.1.50",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.49",
        value: "0.1.49",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.48",
        value: "0.1.48",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.47",
        value: "0.1.47",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.46",
        value: "0.1.46",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.45",
        value: "0.1.45",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.44",
        value: "0.1.44",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.43",
        value: "0.1.43",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.42",
        value: "0.1.42",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.41",
        value: "0.1.41",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.40",
        value: "0.1.40",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.39",
        value: "0.1.39",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.38",
        value: "0.1.38",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.37",
        value: "0.1.37",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.36",
        value: "0.1.36",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.35",
        value: "0.1.35",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.34",
        value: "0.1.34",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.33",
        value: "0.1.33",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.32",
        value: "0.1.32",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.31",
        value: "0.1.31",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.30",
        value: "0.1.30",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.29",
        value: "0.1.29",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.28",
        value: "0.1.28",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.27",
        value: "0.1.27",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.26",
        value: "0.1.26",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.25",
        value: "0.1.25",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.24",
        value: "0.1.24",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.23",
        value: "0.1.23",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.22",
        value: "0.1.22",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.21",
        value: "0.1.21",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.20",
        value: "0.1.20",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.19",
        value: "0.1.19",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.18",
        value: "0.1.18",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.17",
        value: "0.1.17",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.16",
        value: "0.1.16",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.15",
        value: "0.1.15",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.14",
        value: "0.1.14",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.13",
        value: "0.1.13",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.12",
        value: "0.1.12",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.11",
        value: "0.1.11",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.10",
        value: "0.1.10",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.9",
        value: "0.1.9",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.8",
        value: "0.1.8",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.7",
        value: "0.1.7",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.6",
        value: "0.1.6",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.5",
        value: "0.1.5",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.4",
        value: "0.1.4",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.3",
        value: "0.1.3",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.2",
        value: "0.1.2",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
    {
        label: "0.1.1",
        value: "0.1.1",
        releaseType: GameVersionReleaseType.PRE_RELEASE,
        major: false,
    },
];
export default GAME_VERSIONS;

export const getGameVersionFromLabel = (label: string): GameVersion | null => {
    return GAME_VERSIONS.find((version) => version.label === label) || null;
};

export const getGameVersionFromValue = (value: string): GameVersion | null => {
    return GAME_VERSIONS.find((version) => version.value === value) || null;
};

export const getGameVersionsFromLabels = (labels: string[]): GameVersion[] => {
    return labels.map((label) => getGameVersionFromLabel(label)).filter((version) => version !== null) as GameVersion[];
};

export const getGameVersionsFromValues = (values: string[]): GameVersion[] => {
    return values.map((value) => getGameVersionFromValue(value)).filter((version) => version !== null) as GameVersion[];
};

export const isExperimentalGameVersion = (releaseType: GameVersionReleaseType) => {
    return [
        GameVersionReleaseType.SNAPSHOT,
        // TODO: Uncomment when pre-release versions are considered experimental
        // GameVersionReleaseType.PRE_RELEASE,
        GameVersionReleaseType.ALPHA,
        GameVersionReleaseType.BETA,
    ].includes(releaseType);
};
