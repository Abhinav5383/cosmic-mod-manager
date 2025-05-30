import MarkdownRenderBox from "~/components/md-renderer";
import { useTranslation } from "~/locales/provider";
import Config from "~/utils/config";
import { MetaTags } from "~/utils/meta";
import { FormatUrl_WithHintLocale } from "~/utils/urls";
import { descriptionSuffix } from "./layout";

const title = "Privacy Policy";

export default function () {
    const { t } = useTranslation();

    return (
        <MarkdownRenderBox
            className="bg-card-background bright-heading p-6 rounded-lg"
            text={t.legal.privacyPolicy({
                title: t.legal.privacyPolicyTitle,
                supportEmail: Config.SUPPORT_EMAIL,
                siteName_Short: Config.SITE_NAME_SHORT,
                siteName_Long: Config.SITE_NAME_LONG,
                websiteUrl: Config.FRONTEND_URL,
                sessionSettings_PageUrl: `${Config.FRONTEND_URL}${FormatUrl_WithHintLocale("settings/sessions")}`,
                accountSettings_PageUrl: `${Config.FRONTEND_URL}${FormatUrl_WithHintLocale("settings/account")}`,
            })}
        />
    );
}

export function meta() {
    return MetaTags({
        title: title,
        description: `The ${title} of ${Config.SITE_NAME_SHORT}, ${descriptionSuffix}.`,
        image: Config.SITE_ICON,
        url: `${Config.FRONTEND_URL}${FormatUrl_WithHintLocale("legal/privacy")}`,
        suffixTitle: true,
    });
}
