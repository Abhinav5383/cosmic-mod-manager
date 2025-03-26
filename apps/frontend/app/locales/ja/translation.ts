import type { Locale } from "~/locales/types";
import { SearchItemHeader_Keys } from "../shared-enums";
import { Rules } from "./legal";
import tags from "./tags";

export default {
    common: {
        settings: "設定",
        success: "成功",
        error: "エラー",
        home: "ホーム",
        somethingWentWrong: "問題が発生しました",
        redirecting: "リダイレクト中...",
        accept: "承認",
        decline: "拒否",
        download: "ダウンロード",
        report: "報告",
        copyId: "IDをコピー",
        all: "すべて",
        noResults: "結果なし",
        more: "もっと見る",
    },

    // NOTE: It isn't necessary to return the count in the array, because an Intl formatted count is used in the actual html
    // it's here just for readability
    // The returned format should be [prefix, count, suffix]
    // If there's no suffix or no prefix, just put an empty string there

    // If you're wondering as to why we are returning an array instead of a string, then the reason is html formatting
    // the count in most places is put in a different html tag for styling purposes
    count: {
        downloads: (count: number) => {
            return ["", count, "ダウンロード"];
        },
        followers: (count: number) => {
            return ["", count, "フォロワー"];
        },
        projects: (count: number) => {
            return ["", count, "件のプロジェクト"];
        },
        members: (count: number) => {
            return ["", count, "名のメンバー"];
        },
    },

    navbar: {
        mod: "Mod",
        mods: "Mod",
        datamod: "データMod",
        datamods: "データMod",
        "resource-pack": "リソースパック",
        "resource-packs": "リソースパック",
        shader: "シェーダー",
        shaders: "シェーダー",
        modpack: "Modパック",
        modpacks: "Modパック",
        plugin: "プラグイン",
        plugins: "プラグイン",
        world: "ワールド",
        worlds: "ワールド",
        signout: "ログアウト",
        profile: "プロフィール",
        skipToMainContent: "メインコンテンツへスキップ",
    },

    homePage: {
        title: (projectType: string) => ["Cosmic Reachの", projectType, "のための場所"],
        desc: "Cosmic ReachのModに最高の場所。コンテンツを発見し、遊び、作成する、そのすべてを1つの場所で。",
        exploreMods: "Modを探してみよう",
    },

    auth: {
        email: "メールアドレス",
        password: "パスワード",
        changePassword: "パスワードを再設定する",
        dontHaveAccount: "アカウントをお持ちではありませんか？",
        alreadyHaveAccount: "すでにアカウントをお持ちですか？",
        forgotPassword: "パスワードをお忘れですか？",
        signupWithProviders: "外部アカウントでログイン：",
        aggrement: "アカウントを作成すると、CRMMの[利用規約](/legal/terms)および[プライバシーポリシー](/legal/privacy)に同意したものとみなされます。",
        invalidCode: "無効または期限切れのコード",
        didntRequest: "これをリクエストしませんでしたか？",
        checkSessions: "ログインされいるセッションを見る",
        confirmNewPass: "新しいパスワードの確認",
        confirmNewPassDesc:
            "あなたのアカウントに新しいパスワードが追加されました。ご本人であることを確認してください。",
        newPass: "新しいパスワード",
        newPass_label: "新しいパスワードを入力",
        confirmPass: "新しいパスワードの確認",
        confirmPass_label: "確認のためもう一度入力",
        deleteAccount: "アカウントの削除",
        deleteAccountDesc:
            "アカウントを削除すると、データベースからすべてのデータが削除されます。アカウント削除後は、後戻りはできません。",
        enterEmail: "メールアドレスを入力",
    },

    settings: {
        account: "アカウント",
        preferences: "設定",
        publicProfile: "公開プロフィール",
        accountAndSecurity: "アカウントとセキュリティ",
        sessions: "セッション",
        toggleFeatures: "機能の切り替え",
        enableOrDisableFeatures: "このデバイスで特定の機能を有効または無効にします。",
        viewTransitions: "トランジションを見る",
        viewTransitionsDesc: "ページ間の移動時にトランジション（モーフ）を有効にする。",
        accountSecurity: "アカウントのセキュリティ",
        changePassTitle: "アカウントのパスワードを再設定する",
        addPassDesc: "ログインするためにパスワードを追加する",
        manageAuthProviders: "外部アカウントの管理",
        manageProvidersDesc: "ログインの方法を追加または削除する",
        removePass: "パスワードを削除",
        removePassTitle: "アカウントのパスワードを削除する",
        removePassDesc: "パスワードを削除したら、パスワードを使用してログインできなくなります",
        enterCurrentPass: "現在のパスワードを入力",
        addPass: "パスワードを追加",
        addPassDialogDesc: "このパスワードを使用してアカウントにログインできます",
        manageProviders: "管理",
        linkedProviders: "外部アカウント",
        linkProvider: (provider: string) => `${provider}のアカウントと連携する`,
        link: "連携", // Verb
        sureToDeleteAccount: "本当にアカウントを削除しますか？",
        profileInfo: "プロフィール情報",
        profileInfoDesc: (site: string) => `あなたのプロフィール情報は、${site}で公開されています。`,
        profilePic: "プロフィール画像",
        bio: "自己紹介",
        bioDesc: "他のユーザーにあなたのことを伝えるための簡単な説明です。",
        visitYourProfile: "自分のプロフィールを開く",
        showIpAddr: "IPアドレスを表示する",
        sessionsDesc:
            "これらは現在アカウントにログインしているすべてのデバイスです。個別にセッションを破棄できます。見覚えのないことが表示されている場合は、すぐにセッションを破棄して、外部アカウントのパスワードを変更してください。",
        ipHidden: "IP非表示",
        lastAccessed: (when: string) => `${when}に最終アクセス`,
        created: (when: string) => `${when}に作成`, // eg: Created a month ago
        sessionCreatedUsing: (providerName: string) => `${providerName}を使っているセッション`,
        currSession: "現在のセッション",
        revokeSession: "セッションを破棄",
    },

    dashboard: {
        dashboard: "ダッシュボード",
        overview: "概要",
        notifications: "通知",
        activeReports: "報告履歴",
        analytics: "アナリティクス",
        projects: "プロジェクト",
        organizations: "組織",
        collections: "コレクション",
        collection: "コレクション",
        revenue: "収益",
        manage: "管理",
        seeAll: "すべて見る",
        viewNotifHistory: "通知履歴を見る",
        noUnreadNotifs: "未読の通知はありません。",
        totalDownloads: "総ダウンロード数",
        fromProjects: (count: number) => {
            return `（${count}件のプロジェクト）`;
        },
        totalFollowers: "総フォロワー数",
        viewHistory: "履歴を見る",
        markAllRead: "すべて既読にする",
        markRead: "既読にする",
        deleteNotif: "通知を削除する",
        received: "受信：",
        history: "履歴",
        notifHistory: "通知履歴",
        createProjectInfo: "プロジェクトがありません。上のボタンをクリックして作成してください。",
        type: "種類",
        status: "ステータス",
        createProject: "プロジェクトを作成",
        creatingProject: "プロジェクトを作成中",
        chooseProjectType: "プロジェクトの種類を選択してください",
        projectTypeDesc: "プロジェクトに適したタイプを選択する",
        createOrg: "組織を作成",
        creatingOrg: "組織を作成中",
        enterOrgName: "組織の名前を入力",
        enterOrgDescription: "組織の簡単な説明を入力してください。",
        creatingACollection: "コレクションを作成中",
        enterCollectionName: "コレクションの名前を入力",
        createCollection: "コレクションを作成",
    },

    search: {
        // Search labels
        project: "プロジェクトを検索",
        mod: "Modを検索",
        "resource-pack": "リソースパックを検索",
        shader: "シェーダーを検索",
        plugin: "プラグインを検索",
        modpack: "Modパックを検索",
        datamod: "データModを検索",
        world: "ワールドを検索",

        // Sorting methods
        showPerPage: "件数",
        sortBy: "並び替え",
        relevance: "関連性順",
        downloads: "ダウンロード数順",
        follow_count: "フォロー数順",
        recently_updated: "更新日順",
        recently_published: "公開日順",

        filters: "フィルター",
        searchFilters: "検索フィルター",
        loaders: "ローダー",
        gameVersions: "ゲームのバージョン",
        channels: "チャンネル",
        environment: "環境",
        category: "カテゴリー", // The key is kept singular just for ease of acess, the string is plural
        feature: "機能", // __
        resolution: "解像度", // __
        performance_impact: "パフォーマンスへの影響",
        license: "ライセンス",
        openSourceOnly: "オープンソースのみ",
        clearFilters: "すべてのフィルターをクリア",

        tags: tags,

        /**
         * Project item header format \
         * The array items will be arranged in the order they are returned \
         * so in the current case, the string format will be `{Project_Name} by {Author}` \
         * \
         * **Custom format example** \
         * For the returned value to be formatted like `{Author}'s {Project_Name}`
         * The returned array will look something like this
         * ```ts
         * return [
         *     [SearchItemHeader_Keys.AUTHOR_NAME, `${author}'s`],
         *     [SearchItemHeader_Keys.BY, " "],
         *     [SearchItemHeader_Keys.PROJECT_NAME, project],
         * ]
         * ```
         */
        itemHeader: (project: string, author: string) => {
            return [
                [SearchItemHeader_Keys.PROJECT_NAME, project],
                [SearchItemHeader_Keys.BY, "作成者："],
                [SearchItemHeader_Keys.AUTHOR_NAME, author],
            ];
        },
    },

    project: {
        compatibility: "互換性",
        environments: "環境",
        reportIssues: "バグトラッカー",
        viewSource: "ソースコード",
        visitWiki: "Wiki",
        joinDiscord: "Discordサーバー",
        featuredVersions: "主要バージョン",
        creators: "作成者",
        organization: "組織",
        project: "プロジェクト",
        details: "詳細",
        licensed: (license: string) => ["ライセンス", license, ""],
        updatedAt: (when: string) => `更新 ${when}`, // eg: Updated 3 days ago
        publishedAt: (when: string) => `公開 ${when}`, // eg: Published 3 days ago
        gallery: "ギャラリー",
        changelog: "更新履歴",
        versions: "バージョン",
        noProjectDesc: "プロジェクトの説明なし",
        uploadNewImg: "ギャラリーに新しい画像をアップロード",
        uploadImg: "ギャラリーに画像をアップロード",
        galleryOrderingDesc: "番号の大きい画像が最初に表示されます。",
        featuredGalleryImgDesc:
            "代表ギャラリー画像は検索結果とプロジェクトカードに表示されます。代表ギャラリー画像は1つのみ設定できます。",
        addGalleryImg: "ギャラリー画像を追加",
        featureImg: "代表画像に設定",
        unfeatureImg: "代表画像の設定を解除",
        sureToDeleteImg: "本当にこのギャラリー画像を削除しますか？",
        deleteImgDesc: "これにより、このギャラリー画像は永久に削除されます（本当に永久です）。",
        editGalleryImg: "ギャラリー画像を編集",
        currImage: "現在の画像",

        // Version
        uploadVersion: "バージョンをアップロード",
        uploadNewVersion: "新しいプロジェクトのバージョンをアップロード",
        showDevVersions: "開発バージョンを表示",
        noProjectVersions: "プロジェクトのバージョンが見つかりません",
        stats: "統計",
        published: "公開日", // Used for table headers
        downloads: "ダウンロード数", // Used for table headers
        openInNewTab: "新しいタブで開く",
        copyLink: "リンクをコピー",
        doesNotSupport: (project: string, version: string, loader: string) => {
            return `${project}の${version}は${loader}をサポートしていません`;
        },
        downloadProject: (project: string) => `${project}をダウンロード`,
        gameVersion: "ゲームのバージョン：",
        selectGameVersion: "ゲームのバージョンを選択",
        platform: "プラットフォーム：",
        selectPlatform: "プラットフォームを選択",
        onlyAvailableFor: (project: string, platform: string) => `${project}は${platform}のみで利用可能です`,
        noVersionsAvailableFor: (gameVersion: string, loader: string) => `${gameVersion}のためのバージョンは${loader}にありません`,
        declinedInvitation: "招待を辞退しました",
        teamInvitationTitle: (teamType: string) => `${teamType}に参加する招待`, // teamType = organization | project
        teamInviteDesc: (teamType: string, role: string) =>
            `あなたは${teamType}の'${role}'として招待されています。`,

        browse: {
            mod: "Modを見る",
            datamod: "データModを見る",
            "resource-pack": "リソースパックを見る",
            shader: "シェーダーを見る",
            modpack: "Modパックを見る",
            plugin: "プラグインを見る",
            world: "ワールドを見る",
        },

        rejected: "却下",
        withheld: "保留中",
        archivedMessage: (project: string) =>
            `${project}はアーカイブされました。作成者がプロジェクトのアーカイブを解除しない限り、これ以上更新されることはありません。`,
        publishingChecklist: {
            required: "必須",
            suggestion: "提案",
            review: "審査",
            progress: "進捗状況：",
            title: "公開するためにすること",
            uploadVersion: "バージョンをアップロード",
            uploadVersionDesc: "プロジェクトが審査に提出されるには、少なくとも1つのバージョンが必要です。",
            addDescription: "概要を追加",
            addDescriptionDesc: "プロジェクトの目的と機能を明確に説明する概要が必要です。",
            addIcon: "アイコンを追加",
            addIconDesc: "プロジェクトに一目であなたのプロジェクトであることがわかるように、見栄えの良いアイコンをつけてください。",
            featureGalleryImg: "代表ギャラリー画像を設定",
            featureGalleryImgDesc: "代表ギャラリー画像は、多くのユーザーの第一印象となるかもしれません。",
            selectTags: "タグを選択",
            selectTagsDesc: "プロジェクトに該当するタグをすべて選択してください。",
            addExtLinks: "外部リンクの追加",
            addExtLinksDesc: "ソースコード、バグトラッカー、Discordサーバーなどの関連リンクを追加してください。",
            selectLicense: "ライセンスを選択",
            selectLicenseDesc: (projectType: string) => `${projectType}が配布されているライセンスを選択してください。`,
            selectEnv: "対応環境を選択",
            selectEnvDesc: (projectType: string) => `${projectType}がクライアント側／サーバー側のどちらで機能するかを選択してください。`,
            requiredStepsDesc: "＊印は必須項目です",
            submitForReview: "審査に提出",
            submitForReviewDesc:
                "プロジェクトはプロジェクトのメンバーだけが閲覧できます。公開するにはモデレーターの審査が必要です。",
            resubmitForReview: "審査に再提出",
            resubmit_ApprovalRejected:
                "プロジェクトがモデレーターに却下されました。ほとんどの場合、モデレーターのメッセージに対応した後、審査に再提出できます。",
            resubmit_ProjectWithheld:
                "プロジェクトがモデレーターに保留されました。ほとんどの場合、モデレーターのメッセージに対応した後、審査に再提出できます。",
            visit: {
                versionsPage: "バージョンのページを開く",
                descriptionSettings: "概要の設定を開く",
                generalSettings: "一般設定を開く",
                galleryPage: "ギャラリーページを開く",
                tagSettings: "タグの設定を開く",
                linksSettings: "リンクの設定を開く",
                licenseSettings: "ライセンスの設定を開く",
                moderationPage: "モデレーションページを開く",
            },
        },
    },

    version: {
        deleteVersion: "バージョンを削除",
        sureToDelete: "本当にこのバージョンを削除しますか？",
        deleteDesc: "これにより、このバージョンは永久に削除されます（本当に永久です）。",
        enterVersionTitle: "バージョンのタイトルを入力...",
        feature: "主要バージョンに設定",
        unfeature: "主要バージョンの設定を解除",
        featured: "主要バージョン",
        releaseChannel: "チャンネル",
        versionNumber: "バージョン番号",
        selectLoaders: "ローダーを選択",
        selectVersions: "バージョンを選択",
        cantAddCurrProject: "現在のプロジェクトを依存関係として追加することはできません",
        cantAddDuplicateDep: "同じ依存関係を2回追加することはできません",
        addDep: "依存関係の追加",
        enterProjectId: "プロジェクトID/Slugを入力",
        enterVersionId: "バージョンID/Slugを入力",
        dependencies: "依存関係",
        files: "ファイル",

        depencency: {
            required: "必須",
            optional: "任意",
            incompatible: "非互換性",
            embedded: "埋め込み",
            required_desc: (version: string) => `バージョン${version}は必須です`,
            optional_desc: (version: string) => `バージョン${version}は任意です`,
            incompatible_desc: (version: string) => `バージョン${version}は互換性がありません`,
            embedded_desc: (version: string) => `バージョン${version}は埋め込まれています`,
        },

        primary: "プライマリー",
        noPrimaryFile: "プライマリーファイルが選択されていません",
        chooseFile: "ファイルを選択",
        replaceFile: "ファイルを置き換える",
        uploadExtraFiles: "追加ファイルのアップロード",
        uploadExtraFilesDesc: "ソースやドキュメンテーションなどの追加ファイルに使用します",
        selectFiles: "ファイルを選択",
        primaryFileRequired: "プライマリーファイルは必須です",
        metadata: "メタデータ",
        devReleasesNote: "注意：古い開発リリースは、新しい開発リリースが公開されると自動的に削除されます。",
        publicationDate: "公開日",
        publisher: "公開者",
        versionID: "バージョンID",
        copySha1: "SHA-1ハッシュをコピー",
        copySha512: "SHA-512ハッシュをコピー",
        copyFileUrl: "ファイルURLをコピー",
    },

    projectSettings: {
        settings: "プロジェクト設定",
        general: "一般",
        tags: "タグ",
        links: "リンク",
        members: "メンバー",
        view: "見る", // this one is weird, it is on the sidebar of the project settings and only "Analytics" is under it so idk what to call it
        upload: "アップロード",
        externalLinks: "外部リンク",
        issueTracker: "バグトラッカー",
        issueTrackerDesc: "プロジェクトに関するバグや問題、懸念を報告するための場所です。",
        sourceCode: "ソースコード",
        sourceCodeDesc: "プロジェクトのソースコードを含むページ／リポジトリーです。",
        wikiPage: "Wikiページ",
        wikiPageDesc: "プロジェクトの情報、ドキュメンテーション、使い方を含むページです。",
        discordInvite: "Discordサーバー",
        discordInviteDesc: "プロジェクトのDiscordサーバーへの招待リンクです。",
        licenseDesc: (projectType: string) =>
            `あなたの${projectType}に適切なライセンスを選択することは非常に重要です。リストから1つ選択するか、カスタムのライセンスを使えます。また、選択したライセンスへのURLを入力することもできて、URLを入力しない場合はライセンスの文章が表示されます。`,
        customLicenseDesc:
            "有効な[SPDX Identifier](https://spdx.org/licenses)を入力してください。ライセンスにSPDX Identifierがない場合（例えば、ライセンスを自分で作成した場合や、ライセンスがCosmic Reach固有のものである場合）は、チェックボックスにチェックを入れ、代わりにライセンス名を入力してください。",
        selectLicense: "ライセンスを選択",
        custom: "カスタム",
        licenseName: "ライセンス名",
        licenseUrl: "ライセンスのURL（任意）",
        spdxId: "SPDX Identifier",
        doesntHaveSpdxId: "ライセンスにSPDX Identiferがありません",
        tagsDesc: (projectType: string) => `正確なタグ付けは、他のユーザーがあなたの${projectType}を見つけやすくために重要です。該当するタグをすべて選択してください。`,
        tagsDesc2: (projectType: string) => `${projectType}のテーマや機能に一致するカテゴリーをすべて選択してください。`,
        featuredCategories: "優先表示カテゴリー",
        featuredCategoriesDesc: (count: number) => `最も関連性の高いタグを最大${count}個まで優先表示できます。`,
        selectAtLeastOneCategory: "カテゴリーを優先表示するには、少なくとも1つのカテゴリーを選択してください。",
        projectInfo: "プロジェクト情報",
        clientSide: "クライアント側",
        clientSideDesc: (projectType: string) => `${projectType}にクライアント側の機能があるかどうかで選択してください。`,
        serverSide: "サーバー側",
        serverSideDesc: (projectType: string) => `${projectType}にサーバー側の機能があるかどうかで選択してください。`,
        unknown: "不明",
        clientOrServer: "クライアントまたはサーバー",
        clientAndServer: "クライアントとサーバー",
        required: "必須",
        optional: "任意",
        unsupported: "対応していません",
        visibilityDesc:
            "公開中とアーカイブ済みのプロジェクトは検索結果に表示されます。限定公開のプロジェクトは公開されますが、検索結果やユーザープロフィールでは表示されません。非公開プロジェクトは、そのプロジェクトのメンバーだけがアクセスできます。",
        ifApproved: "モデレーターが承認した場合：",
        visibleInSearch: "検索結果に表示",
        visibleOnProfile: "プロフィールに表示",
        visibleViaUrl: "URLからアクセス可能",
        visibleToMembersOnly: "プロジェクトのメンバーのみがアクセスできます",
        listed: "公開中",
        private: "非公開",
        public: "公開",
        unlisted: "限定公開",
        archived: "アーカイブ済み",
        deleteProject: "プロジェクトの削除",
        deleteProjectDesc: (site: string) =>
            `プロジェクトを${site}のサーバーと検索結果から削除します。これをクリックするとプロジェクトが削除されますので、十分注意してください！`,
        sureToDeleteProject: "本当にこのプロジェクトを削除しますか？",
        deleteProjectDesc2:
            "続行すると、プロジェクトのすべてのバージョンとデータがサーバーから削除されます。他のプロジェクトが壊れる可能性がありますので、ご注意ください。",
        typeToVerify: (projectName: string) => `確認のため、以下に**${projectName}**と入力してください：`,
        typeHere: "ここに入力...",
        manageMembers: "メンバーを管理",
        leftProjectTeam: "チームを抜けました",
        leaveOrg: "組織を抜ける",
        leaveProject: "プロジェクトを抜ける",
        leaveOrgDesc: "この組織のメンバーとして抜けます。",
        leaveProjectDesc: "このプロジェクトのメンバーとして抜けます。",
        sureToLeaveTeam: "本当にこのチームから抜けますか？",
        cantManageInvites: "メンバーの招待を管理するアクセス権がありません。",
        inviteMember: "メンバーを招待する",
        inviteProjectMemberDesc: "このプロジェクトのメンバーに招待したい人のユーザー名を入力してください。",
        inviteOrgMemberDesc: "この組織のメンバーに招待したい人のユーザー名を入力してください。",
        invite: "招待",
        memberUpdated: "メンバーの更新に成功しました",
        pending: "保留中",
        role: "役割",
        roleDesc: "このメンバーがこのチームで果たす役割のタイトル。",
        permissions: "権限",
        perms: {
            upload_version: "バージョンをアップロード",
            delete_version: "バージョンを削除",
            edit_details: "詳細を編集",
            edit_description: "概要を編集",
            manage_invites: "招待を管理する",
            remove_member: "メンバーを削除",
            edit_member: "メンバーを編集",
            delete_project: "プロジェクトを削除",
            view_analytics: "アナリティクスを見る",
            view_revenue: "収益を見る",
        },
        owner: "オーナー",
        removeMember: "メンバーを削除",
        transferOwnership: "所有権の移転",
        overrideValues: "値を上書きする",
        overrideValuesDesc: "組織のデフォルト値を上書きし、プロジェクトのこのユーザーにカスタム権限と役割を割り当てます。",
        projectNotManagedByOrg:
            "このプロジェクトは組織によって管理されていません。いずれかの組織に所属している場合は、その組織に管理を移管することができます。",
        transferManagementToOrg: "管理を移管",
        selectOrg: "組織を選択",
        projectManagedByOrg: (orgName: string) =>
            `このプロジェクトは${orgName}によって管理されています。メンバー権限のデフォルトは組織設定で設定されます。下記で上書きすることができます。`,
        removeFromOrg: "組織から削除",
        memberRemoved: "メンバーの削除に成功しました",
        sureToRemoveMember: (memberName: string) => `本当に${memberName}をこのチームから削除しますか？`,
        ownershipTransfered: "所有権の移転に成功しました",
        sureToTransferOwnership: (memberName: string) => `本当に${memberName}に所有権の移転をしますか？`,
    },

    organization: {
        orgDoesntHaveProjects: "この組織にはまだプロジェクトがありません。",
        manageProjects: "プロジェクトを管理",
        orgSettings: "組織設定",
        transferProjectsTip: "プロジェクト設定 > メンバーから、既存のプロジェクトをこの組織に移行できます。",
        noProjects_CreateOne: "Tこの組織にはプロジェクトがありません。作成するには上のボタンをクリックしてください。",
        orgInfo: "組織情報",
        deleteOrg: "組織を削除",
        deleteOrgDesc:
            "組織を削除すると、組織のすべてのプロジェクトが組織のオーナーに移転されます。この操作は元に戻せません。",
        sureToDeleteOrg: "本当にこの組織を削除しますか？",
        deleteOrgNamed: (orgName: string) => `組織「${orgName}」を削除`,
        deletionWarning: "これにより、この組織は永久に削除されます（本当に永久です）。",

        perms: {
            edit_details: "詳細を編集",
            manage_invites: "招待を管理する",
            remove_member: "メンバーを削除",
            edit_member: "メンバーを編集",
            add_project: "プロジェクトを追加",
            remove_project: "プロジェクトを削除",
            delete_organization: "組織を削除",
            edit_member_default_permissions: "メンバー権限のデフォルトを編集",
        },
    },

    user: {
        admin: "アドミン",
        moderator: "モデレーター",
        doesntHaveProjects: (user: string) => `${user}にはまだプロジェクトがありません。`,
        isntPartOfAnyOrgs: (user: string) => `${user}はどの組織にも所属していません。`,
        joined: (when: string) => `${when}に参加`, // eg: Joined 2 months ago
    },

    collection: {
        curatedBy: "作成者",
        searchCollections: "コレクションを検索",
        editingCollection: "コレクションを編集",
        deleteCollection: "コレクションを削除",
        sureToDeleteCollection: "本当にこのコレクションを削除しますか？",
        followedProjects: "フォロー中のプロジェクト",
        followedProjectsDesc: "あなたがフォローしているプロジェクトがすべて含まれた自動生成のコレクションです。",
    },

    footer: {
        company: "会社情報",
        terms: "利用規約",
        privacy: "プライバシー",
        rules: "ルール",
        resources: "リソース",
        docs: "ドキュメンテーション",
        status: "ステータス",
        support: "サポート",
        socials: "ソーシャル",
        about: "CRMMについて",
        changeTheme: "テーマを変更",
        siteOfferedIn: (site: string) => `${site}は次の言語で提供されています：`,
    },

    legal: {
        legal: "法的情報",
        rulesTitle: "コンテンツルール",
        contentRules: Rules,
        termsTitle: "利用規約",
        copyrightPolicyTitle: "著作権ポリシー",
        securityNoticeTitle: "セキュリティについて",
        privacyPolicyTitle: "プライバシーポリシー",
    },

    moderation: {
        review: "プロジェクトを審査",
        reports: "報告",
        moderation: "管理",
        statistics: "統計",
        authors: "作成者",
        projectsInQueue: (count: number) => {
            return `待ち行列には${count}個のプロジェクトがあります。`;
        },
        // hours will either be 24 or 48
        projectsQueuedFor: (count: number, hours: number) => {
            return `${count}個のプロジェクトが${hours}時間以上待ち行列に入っています。`;
        },
        submitted: (when: string) => `Submitted ${when}`, // eg: Submitted 4 hours ago, (the date string comes from the localized phrases defined at end of the file)
        viewProject: "プロジェクトを見る",
        awaitingApproval: "プロジェクトは承認待ちです",
        draft: "下書き",
        approve: "承認",
        reject: "却下",
        withhold: "保留",
    },

    form: {
        login: "ログイン",
        login_withSpace: "ログイン",
        signup: "アカウント作成",
        email: "メールアドレス",
        username: "ユーザー名",
        password: "パスワード",
        name: "名前",
        displayName: "表示名",
        icon: "アイコン",
        details: "詳細",
        description: "概要",
        id: "ID",
        url: "URL",
        projectType: "プロジェクトの種類",
        visibility: "公開範囲",
        summary: "まとめ",
        title: "タイトル",
        ordering: "順序",
        featured: "代表",
        continue: "続ける",
        submit: "送信",
        remove: "削除",
        confirm: "確認",
        edit: "編集",
        delete: "削除",
        cancel: "キャンセル",
        saveChanges: "変更を保存",
        uploadIcon: "アイコンをアップロード",
        removeIcon: "アイコンを削除",
        noFileChosen: "ファイルが選択されていません",
        showAllVersions: "バージョンを全て表示",
        createNew: "新規作成",
    },

    error: {
        sthWentWrong: "問題が発生しました。",
        errorDesc: "何かが壊れたようです。私たちが問題を解決しようとしている間に、ページを更新してみてください。",
        refresh: "更新",
        pageNotFound: "404｜ページが見つかりません。",
        pageNotFoundDesc: "お探しのページは見つかりませんでした。",
        projectNotFound: "プロジェクトが見つかりませんでした。",
        projectNotFoundDesc: (type: string, slug: string) => `スラッグ/ID「${slug}」の${type}は存在しません。`,
    },

    editor: {
        heading1: "見出し1",
        heading2: "見出し2",
        heading3: "見出し3",
        bold: "太字",
        italic: "斜体",
        underline: "下線",
        strikethrough: "取り消し",
        code: "コードブロック",
        spoiler: "スポイラー",
        bulletedList: "箇条書きリスト",
        numberedList: "番号付きリスト",
        quote: "引用",
        insertLink: "リンクを挿入",
        label: "ラベル",
        enterLabel: "ラベルを入力",
        link: "リンク", // Noun
        enterUrl: "リンクURLを入力してください",
        insertImage: "画像を挿入",
        imgAlt: "説明（altテキスト）",
        imgAltDesc: "画像の説明を入力してください",
        enterImgUrl: "画像のURLを入力してください",
        image: "画像",
        inserYtVideo: "YouTube動画を挿入",
        ytVideoUrl: "YouTube動画URL",
        enterYtUrl: "YouTube動画のURLを入力してください",
        video: "動画",
        preview: "プレビュー",
        insert: "挿入",
    },
} satisfies Locale;
