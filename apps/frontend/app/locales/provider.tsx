import { disableInteractions, enableInteractions } from "@app/utils/dom";
import { type ReactNode, createContext, use, useState } from "react";
import type { NavigateFunction } from "react-router";
import { HINT_LOCALE_KEY, getCurrLocation } from "~/utils/urls";
import { formatLocaleCode, getLocale, parseLocale } from ".";
import en from "./en/translation";
import { DefaultLocale, GetLocaleMetadata } from "./meta";
import type { Locale, LocaleMetaData } from "./types";

interface LocaleContext {
    locale: LocaleMetaData;
    t: Locale;
    changeLocale: (locale: string, navigate?: NavigateFunction) => void;
}
const LocaleContext = createContext<LocaleContext>({
    locale: DefaultLocale,
    t: en,
    changeLocale: (_locale: string, _navigate?: NavigateFunction) => {},
});

export function LocaleProvider({ children, initLocale, initMetadata }: Props) {
    const [translation, setTranslation] = useState(initLocale);
    const [localeMetadata, setLocaleMetadata] = useState(initMetadata || DefaultLocale);

    async function changeLocale(locale: string, navigate?: NavigateFunction) {
        disableInteractions();

        if (navigate) {
            const newLangMetadata = GetLocaleMetadata(locale);
            const newUrl = alterUrlHintLocale(newLangMetadata || DefaultLocale);
            navigate(newUrl, { preventScrollReset: true });
        }

        setTranslation(await getLocale(locale));
        setLocaleMetadata(GetLocaleMetadata(parseLocale(locale)) || DefaultLocale);

        enableInteractions();
    }

    return (
        <LocaleContext
            value={{
                locale: localeMetadata,
                t: translation,
                changeLocale,
            }}
        >
            {children}
        </LocaleContext>
    );
}

export function alterUrlHintLocale(locale: LocaleMetaData, omitDefaultLocale = true, url = getCurrLocation()) {
    const localeCode = formatLocaleCode(locale);

    if (omitDefaultLocale === true && localeCode === formatLocaleCode(DefaultLocale)) {
        url.searchParams.delete(HINT_LOCALE_KEY);
        return url;
    }

    url.searchParams.set(HINT_LOCALE_KEY, localeCode);
    return url;
}

interface Props {
    children: ReactNode;
    initLocale: Locale;
    initMetadata?: LocaleMetaData;
}

export function useTranslation() {
    return use(LocaleContext);
}
