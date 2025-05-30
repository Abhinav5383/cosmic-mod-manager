import MarkdownRenderBox from "~/components/md-renderer";
import { useTranslation } from "~/locales/provider";
import Config from "~/utils/config";
import { MetaTags } from "~/utils/meta";
import { FormatUrl_WithHintLocale } from "~/utils/urls";
import { descriptionSuffix } from "./layout";

const title = "Copyright Policy";

export default function () {
    const { t } = useTranslation();

    return (
        <MarkdownRenderBox
            className="bg-card-background bright-heading p-6 rounded-lg"
            text={t.legal.copyrightPolicy({
                title: t.legal.copyrightPolicyTitle,
                adminEmail: Config.ADMIN_EMAIL,
                siteName_Short: Config.SITE_NAME_SHORT,
                siteName_Long: Config.SITE_NAME_LONG,
            })}
        />
    );
}

export function meta() {
    return MetaTags({
        title: title,
        description: `The ${title} of ${Config.SITE_NAME_SHORT}, ${descriptionSuffix}.`,
        image: Config.SITE_ICON,
        url: `${Config.FRONTEND_URL}${FormatUrl_WithHintLocale("legal/copyright")}`,
        suffixTitle: true,
    });
}
