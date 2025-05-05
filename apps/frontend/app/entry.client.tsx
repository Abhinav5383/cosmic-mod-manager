import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { getLocale } from "~/locales";
import { GetLocaleMetadata } from "~/locales/meta";
import { LocaleProvider } from "~/locales/provider";
import { getHintLocale } from "~/utils/urls";

startTransition(async () => {
    const hintLocale = getHintLocale();
    const initLocaleModule = await getLocale(hintLocale);
    const initLocaleMetadata = GetLocaleMetadata(hintLocale);

    hydrateRoot(
        document,

        <LocaleProvider initLocale={initLocaleModule} initMetadata={initLocaleMetadata}>
            <HydratedRouter />
        </LocaleProvider>,
    );
});
