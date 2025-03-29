import { isValidUrl } from "@app/utils/string";
import {
    BoldIcon,
    CodeIcon,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    ImageIcon,
    InfoIcon,
    ItalicIcon,
    LinkIcon,
    ListIcon,
    ListOrderedIcon,
    PlusIcon,
    ScanEyeIcon,
    StrikethroughIcon,
    TextQuoteIcon,
    UnderlineIcon,
    VideoIcon,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MarkdownRenderBox } from "~/md-editor/render-md";
import { Button, CancelButton } from "~/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/ui/dialog";
import { FormErrorMessage } from "~/ui/form-message";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import { Switch } from "~/ui/switch";
import { Textarea } from "~/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/ui/tooltip";
import { cn } from "~/utils";
import "./highlightjs.css";

type LocaleObj = typeof editorLocaleObj & { cancel: string; url: string };

interface Props {
    editorValue: string;
    setEditorValue: (value: string) => void;
    placeholder?: string;
    textAreaClassName?: string;
    t?: LocaleObj;
}

const textSeparatorChar = "{|}";

export default function MarkdownEditor({ editorValue, setEditorValue, placeholder, textAreaClassName, t = editorLocaleObj }: Props) {
    const [previewOpen, setPreviewOn] = useState(false);
    const editorTextarea = useRef<HTMLTextAreaElement>(null);
    const [lastSelectionRange, setLastSelectionRange] = useState<number[] | null>();
    const [wordWrap, setWordWrap] = useState(false);
    const [keyboardShortcutsModalOpen, setKeyboardShortcutsModalOpen] = useState(false);

    function toggleTextAtCursorsLine(
        text: string,
        atLineStart?: boolean,
        actionType?: "ADD_FRAGMENT" | "DELETE_FRAGMENT" | "",
        replaceSelectedText: string | null = null,
    ) {
        if (editorTextarea.current?.selectionStart === undefined) return;
        // selectionStart and selectionEnd index, if nothing's selected both will be the same
        const selectionStart = editorTextarea.current.selectionStart;
        const selectionEnd = editorTextarea.current.selectionEnd;

        // If the text has to be added at the line start of around the selection
        if (atLineStart === true) {
            const firstSelectedLineIndex = editorValue.slice(0, selectionStart).lastIndexOf("\n") + 1; // Start index of the first selected line
            const linesBeforeSelection = editorValue.slice(0, firstSelectedLineIndex); // All the other ines before first selected line
            const textAfterSelection = editorValue.slice(selectionEnd); // All the other text after selection
            const selectedLines = `${editorValue.slice(firstSelectedLineIndex, selectionEnd)}`.split("\n"); // All of the selected lines

            let action: "ADD_FRAGMENT" | "DELETE_FRAGMENT" | "" = actionType || "";
            if (!action) {
                // If the first line starts with that text regardless of the other lines, this will be a delete action
                if (selectedLines[0].startsWith(text)) action = "DELETE_FRAGMENT";
                else action = "ADD_FRAGMENT";
            }

            let newSelectedLinesText = "";
            if (action === "ADD_FRAGMENT") {
                // Loop through each line and add the text at the start of each, then add them up
                for (const line of selectedLines) {
                    newSelectedLinesText = `${newSelectedLinesText}${text}${line}\n`;
                }

                setLastSelectionRange([selectionStart + text.length, selectionEnd + text.length * selectedLines.length]);
            } else if (action === "DELETE_FRAGMENT") {
                // Same way, loop through each line, but check if the text is at the line start before removing anything
                let charactersDeletedCount = 0;
                for (const line of selectedLines) {
                    if (line.startsWith(text)) {
                        charactersDeletedCount += text.length;
                        newSelectedLinesText += `${line.slice(text.length)}\n`;
                    } else {
                        newSelectedLinesText += `${line}\n`;
                    }
                }

                // If the selection is upto the first character of that line, make sure not to decrease the startIndex
                if (editorValue[selectionStart - 1] === "\n" || selectionStart === 0) {
                    setLastSelectionRange([selectionStart, selectionEnd - charactersDeletedCount]);
                } else {
                    setLastSelectionRange([selectionStart - text.length, selectionEnd - charactersDeletedCount]);
                }
            }
            setEditorValue(`${linesBeforeSelection}${newSelectedLinesText.slice(0, -1)}${textAfterSelection}`);
        } else {
            const textFragments = text.split(textSeparatorChar);
            const editorValueFragments = [
                editorValue.slice(0, selectionStart),
                editorValue.slice(selectionStart, selectionEnd),
                editorValue.slice(selectionEnd),
            ];

            let newText = editorValue;
            if (editorValueFragments[0].endsWith(textFragments[0]) && editorValueFragments[2].startsWith(textFragments[1])) {
                newText = `${editorValue.slice(0, selectionStart - textFragments[0].length)}${editorValueFragments[1] ? editorValueFragments[1] : ""}${editorValue.slice(selectionEnd + textFragments[1].length)}`;
                setLastSelectionRange([selectionStart - textFragments[0].length, selectionEnd - textFragments[0].length]);
            } else {
                newText = `${editorValue.slice(0, selectionStart)}${textFragments[0]}${replaceSelectedText ? replaceSelectedText : editorValueFragments[1] ? editorValueFragments[1] : ""}${textFragments[1]}${editorValue.slice(selectionEnd)}`;

                if (replaceSelectedText !== null) {
                    setLastSelectionRange([
                        selectionStart + textFragments[0].length,
                        selectionEnd - editorValueFragments[1].length + replaceSelectedText.length + textFragments[0].length,
                    ]);
                } else {
                    setLastSelectionRange([selectionStart + textFragments[0].length, selectionEnd + textFragments[0].length]);
                }
            }

            setEditorValue(newText);
        }

        editorTextarea.current.focus();
    }

    function Bold() {
        toggleTextAtCursorsLine(`**${textSeparatorChar}**`);
    }
    function Italic() {
        toggleTextAtCursorsLine(`_${textSeparatorChar}_`);
    }
    function Underline() {
        toggleTextAtCursorsLine(`<u>${textSeparatorChar}</u>`);
    }
    function UnorderedList() {
        toggleTextAtCursorsLine("- ", true);
    }
    function Quote() {
        toggleTextAtCursorsLine("> ", true);
    }
    function CodeBlock() {
        toggleTextAtCursorsLine(`\`\`\`\n${textSeparatorChar}\n\`\`\``);
    }
    function Spoiler() {
        toggleTextAtCursorsLine(`<details>\n<summary>Spoiler</summary>\n\n${textSeparatorChar}\n\n</details>`);
    }

    useEffect(() => {
        if (lastSelectionRange?.length) {
            setCursorPosition(editorTextarea.current, lastSelectionRange);
            setLastSelectionRange(null);
        }
    }, [editorValue]);

    useEffect(() => {
        let blockKeydownEvent = false;
        function handler(e: KeyboardEvent) {
            if (e.key === "/" && e.ctrlKey) {
                e.preventDefault();

                if (blockKeydownEvent === true) return;
                blockKeydownEvent = true;
                setKeyboardShortcutsModalOpen(!keyboardShortcutsModalOpen);
            }
        }

        function resetKeyDownEventBlocking() {
            blockKeydownEvent = false;
        }

        document.addEventListener("keydown", handler);
        document.addEventListener("keyup", resetKeyDownEventBlocking);
        () => {
            document.removeEventListener("keydown", handler);
            document.removeEventListener("keyup", resetKeyDownEventBlocking);
        };
    }, []);

    return (
        <TooltipProvider>
            <div className="flex w-full flex-col items-start justify-center gap-1">
                {/* TOOLBAR */}
                <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-1">
                    <div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-1">
                        <BtnGroup>
                            <IconButton
                                tooltipContent={t.heading1}
                                disabled={previewOpen}
                                onClick={() => {
                                    toggleTextAtCursorsLine("# ", true);
                                }}
                            >
                                <Heading1Icon aria-hidden className="h-5 w-5" />
                            </IconButton>
                            <IconButton
                                tooltipContent={t.heading2}
                                disabled={previewOpen}
                                onClick={() => {
                                    toggleTextAtCursorsLine("## ", true);
                                }}
                            >
                                <Heading2Icon aria-hidden className="h-5 w-5" />
                            </IconButton>
                            <IconButton
                                tooltipContent={t.heading3}
                                disabled={previewOpen}
                                onClick={() => {
                                    toggleTextAtCursorsLine("### ", true);
                                }}
                            >
                                <Heading3Icon aria-hidden className="h-5 w-5" />
                            </IconButton>
                        </BtnGroup>
                        <Separator />
                        <BtnGroup>
                            <IconButton tooltipContent={t.bold} disabled={previewOpen} onClick={Bold}>
                                <BoldIcon aria-hidden className="h-5 w-5" />
                            </IconButton>
                            <IconButton tooltipContent={t.italic} disabled={previewOpen} onClick={Italic}>
                                <ItalicIcon aria-hidden className="h-5 w-5" />
                            </IconButton>
                            <IconButton tooltipContent={t.underline} disabled={previewOpen} onClick={Underline}>
                                <UnderlineIcon aria-hidden className="h-5 w-5" />
                            </IconButton>
                            <IconButton
                                tooltipContent={t.strikethrough}
                                disabled={previewOpen}
                                onClick={() => {
                                    toggleTextAtCursorsLine(`~~${textSeparatorChar}~~`);
                                }}
                            >
                                <StrikethroughIcon aria-hidden className="h-5 w-5" />
                            </IconButton>
                            <IconButton tooltipContent={t.code} disabled={previewOpen} onClick={CodeBlock}>
                                <CodeIcon aria-hidden className="h-5 w-5" />
                            </IconButton>
                            <IconButton tooltipContent={t.spoiler} disabled={previewOpen} onClick={Spoiler}>
                                <ScanEyeIcon aria-hidden className="h-btn-icon w-btn-icon" />
                            </IconButton>
                        </BtnGroup>
                        <Separator />
                        <BtnGroup>
                            <IconButton tooltipContent={t.bulletedList} disabled={previewOpen} onClick={UnorderedList}>
                                <ListIcon aria-hidden className="h-5 w-5" />
                            </IconButton>
                            <IconButton
                                tooltipContent={t.numberedList}
                                disabled={previewOpen}
                                onClick={() => {
                                    toggleTextAtCursorsLine("1. ", true);
                                }}
                            >
                                <ListOrderedIcon aria-hidden className="h-5 w-5" />
                            </IconButton>
                            <IconButton tooltipContent={t.quote} disabled={previewOpen} onClick={Quote}>
                                <TextQuoteIcon aria-hidden className="h-5 w-5" />
                            </IconButton>
                        </BtnGroup>
                        <Separator />
                        <BtnGroup>
                            <LinkInsertionModal
                                disabled={previewOpen}
                                modalTitle={t.insertLink}
                                getMarkdownString={(url: string, altText: string, isPreview?: boolean) => {
                                    let selectedText = "";
                                    if (editorTextarea.current) selectedText = getTextareaSelectedText(editorTextarea.current);
                                    const linkLabel = altText || selectedText || url;
                                    return `[${isPreview === true ? linkLabel : ""}${textSeparatorChar}](${url})`;
                                }}
                                insertFragmentFunc={(markdownString: string, url: string, altText: string) => {
                                    let selectedText = "";
                                    if (editorTextarea.current) selectedText = getTextareaSelectedText(editorTextarea.current);
                                    const linkLabel = altText || selectedText || url;
                                    toggleTextAtCursorsLine(markdownString, false, "ADD_FRAGMENT", linkLabel);
                                }}
                                altTextInputLabel={t.label}
                                altTextInputPlaceholder={t.enterLabel}
                                urlInputLabel={t.url}
                                urlInputPlaceholder={t.enterUrl}
                                isAltTextRequired={false}
                                altTextInputVisible={true}
                                t={t}
                            >
                                <IconButton tooltipContent={t.link} disabled={previewOpen}>
                                    <LinkIcon aria-hidden className="h-4 w-4" />
                                </IconButton>
                            </LinkInsertionModal>

                            <LinkInsertionModal
                                disabled={previewOpen}
                                modalTitle={t.insertImage}
                                getMarkdownString={(url: string, altText: string, isPreview = false) => {
                                    let selectedText = "";
                                    if (editorTextarea.current) selectedText = getTextareaSelectedText(editorTextarea.current);
                                    const linkLabel = altText || selectedText || url;
                                    return `![${isPreview ? linkLabel : ""}${textSeparatorChar}](${url})`;
                                }}
                                insertFragmentFunc={(markdownString: string, url: string, altText: string) => {
                                    let selectedText = "";
                                    if (editorTextarea.current) selectedText = getTextareaSelectedText(editorTextarea.current);
                                    const linkLabel = altText || selectedText || url;
                                    toggleTextAtCursorsLine(markdownString, false, "ADD_FRAGMENT", linkLabel);
                                }}
                                altTextInputLabel={t.imgAlt}
                                altTextInputPlaceholder={t.imgAltDesc}
                                urlInputLabel={t.url}
                                urlInputPlaceholder={t.enterImgUrl}
                                isAltTextRequired={false}
                                altTextInputVisible={true}
                                t={t}
                            >
                                <IconButton tooltipContent={t.image} disabled={previewOpen}>
                                    <ImageIcon aria-hidden className="h-4 w-4" />
                                </IconButton>
                            </LinkInsertionModal>

                            <LinkInsertionModal
                                disabled={previewOpen}
                                modalTitle={t.inserYtVideo}
                                getMarkdownString={getYoutubeIframe}
                                insertFragmentFunc={(markdownString: string, _url: string, _altText: string) => {
                                    toggleTextAtCursorsLine(markdownString, false, "ADD_FRAGMENT");
                                }}
                                altTextInputLabel=""
                                altTextInputPlaceholder=""
                                urlInputLabel={t.ytVideoUrl}
                                urlInputPlaceholder={t.enterYtUrl}
                                isAltTextRequired={false}
                                altTextInputVisible={false}
                                t={t}
                            >
                                <IconButton tooltipContent={t.video} disabled={previewOpen}>
                                    <VideoIcon aria-hidden className="h-5 w-5" />
                                </IconButton>
                            </LinkInsertionModal>
                        </BtnGroup>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Switch id="markdown-editor-preview-toggle-switch" checked={previewOpen} onCheckedChange={setPreviewOn} />
                        <Label htmlFor="markdown-editor-preview-toggle-switch" className="text-base">
                            {t.preview}
                        </Label>
                    </div>
                </div>

                <div className="mt-2 flex w-full items-start justify-center gap-2">
                    {/* Editor area */}
                    <div className={cn("flex w-full flex-col items-center justify-center gap-2", previewOpen === true && "hidden")}>
                        <Textarea
                            name="markdown-textarea"
                            placeholder={placeholder}
                            className={cn(
                                "h-[32rem] min-h-[16rem] w-full resize-y rounded-lg font-mono text-base focus-within:!bg-background-shallow/10",
                                "text-muted-foreground dark:text-muted-foreground focus-within:text-black dark:focus-within:text-white",
                                wordWrap === true ? "overflow-x-auto whitespace-nowrap" : "break-words",
                                textAreaClassName,
                            )}
                            ref={editorTextarea}
                            value={editorValue}
                            onChange={(e) => {
                                setEditorValue(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                const pressedKey = e.key.toLowerCase();
                                if (pressedKey === "escape") return editorTextarea.current?.blur();

                                if (pressedKey === "tab") {
                                    e.preventDefault();

                                    if (e.shiftKey === true) {
                                        toggleTextAtCursorsLine("  ", true, "DELETE_FRAGMENT");
                                    } else {
                                        toggleTextAtCursorsLine("  ", true, "ADD_FRAGMENT");
                                    }
                                }

                                if (e.shiftKey) return;

                                if (e.altKey) {
                                    e.preventDefault();

                                    if (pressedKey === "z") setWordWrap((prev) => !prev);
                                    else if (pressedKey === "b") Bold();
                                    else if (pressedKey === "i") Italic();
                                    else if (pressedKey === "u") Underline();
                                    else if (pressedKey === "c") CodeBlock();
                                    else if (pressedKey === "s") Spoiler();
                                    else if (pressedKey === "q") Quote();
                                    else if (pressedKey === "l") UnorderedList();
                                }
                            }}
                            spellCheck={false}
                        />

                        <div className="w-full flex items-center justify-between flex-wrap gap-x-6 gap-y-2 text-muted-foreground text-sm">
                            <div className="flex items-center justify-start gap-2">
                                <InfoIcon aria-hidden className="w-btn-icon h-btn-icon" />
                                <p>
                                    <MarkdownRenderBox text={`${t.youCanUse}`} />
                                </p>
                            </div>
                            <KeyboardShortcutsDialog open={keyboardShortcutsModalOpen} setOpen={setKeyboardShortcutsModalOpen}>
                                <div className="hidden lg:flex items-center justify-center gap-2 cursor-pointer font-mono">
                                    <span>{t.keyboardShortcuts}</span>
                                    <div className="flex items-center justify-center gap-1 font-mono">
                                        <span className="flex items-center justify-center bg-shallow-background rounded px-1">ctrl</span>
                                        <span className="flex items-center justify-center bg-shallow-background rounded px-1">/</span>
                                    </div>
                                </div>
                            </KeyboardShortcutsDialog>
                        </div>
                    </div>

                    {previewOpen && (
                        <div
                            className={cn(
                                "flex w-full overflow-auto items-center justify-center rounded border-2 border-shallow-background p-4",
                                !editorValue && "min-h-24",
                            )}
                        >
                            <MarkdownRenderBox text={editorValue} />
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}

interface IconButtonProps {
    children: React.ReactNode;
    tooltipContent?: React.ReactNode;
    disabled?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

function IconButton({ children, tooltipContent, disabled, onClick, ...props }: IconButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size={"icon"}
                    type="button"
                    variant={"secondary"}
                    tabIndex={disabled ? -1 : 0}
                    disabled={disabled}
                    className="h-8 w-8 text-muted-foreground"
                    onClick={onClick}
                    {...props}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
    );
}

function Separator() {
    return <span className="hidden h-10 w-[0.1rem] bg-shallow-background lg:flex" />;
}

function BtnGroup({ children }: { children: React.ReactNode }) {
    return <div className="flex items-center justify-start flex-wrap gap-x-1.5 gap-y-0.5">{children}</div>;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>vscode
function setCursorPosition(textarea: any, position: number[]) {
    try {
        if (textarea.setSelectionRange) {
            textarea.focus();
            textarea.setSelectionRange(position[0], position[1]);
        } else if (textarea.createTextRange) {
            const range = textarea.createTextRange();
            range.collapse(true);
            range.moveEnd("character", position[0]);
            range.moveStart("character", position[1]);
            range.select();
        }
    } catch (error) {
        console.error(error);
    }
}

function getTextareaSelectedText(textarea: HTMLTextAreaElement) {
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    return textarea.value.slice(selectionStart, selectionEnd) || "";
}

function getYoutubeIframe(url: string, _altText: string) {
    const youtubeRegex =
        /^(?:https?:)?(?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9_-]{7,15})(?:[?&][a-zA-Z0-9_-]+=[a-zA-Z0-9_-]+)*$/;
    const match = youtubeRegex.exec(url);
    if (match) {
        return `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${match[1]}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>${textSeparatorChar}`;
    }
    return "";
}

interface EditorModalProps {
    disabled: boolean;
    title: string;
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    trigger: React.ReactNode;
    children: React.ReactNode;
    insertFragmentFunc: () => void;
    t: LocaleObj;
}

function EditorModal({ disabled, title, trigger, children, modalOpen, t, setModalOpen, insertFragmentFunc }: EditorModalProps) {
    return (
        <Dialog
            open={modalOpen}
            onOpenChange={(open: boolean) => {
                if (disabled) return;
                setModalOpen(open);
            }}
        >
            <DialogTrigger asChild disabled={disabled}>
                <div className="flex items-center justify-center">{trigger}</div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <DialogBody className="flex flex-col gap-form-elements">
                    {children}

                    <DialogFooter>
                        <DialogClose asChild>
                            <CancelButton type="button">{t.cancel}</CancelButton>
                        </DialogClose>

                        <Button
                            type="button"
                            className="gap-2"
                            onClick={() => {
                                insertFragmentFunc();
                                setModalOpen(false);
                            }}
                        >
                            <PlusIcon aria-hidden className="w-btn-icon-md h-btn-icon-md" />
                            {t.insert}
                        </Button>
                    </DialogFooter>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}

interface InsertLinkModalProps {
    modalTitle: string;
    disabled: boolean;
    altTextInputLabel: string;
    altTextInputPlaceholder: string;
    isAltTextRequired: boolean;
    altTextInputVisible: boolean;
    urlInputLabel: string;
    children: React.ReactNode;
    urlInputPlaceholder: string;
    insertFragmentFunc: (markdownString: string, url: string, altText: string) => void;
    getMarkdownString: (url: string, altText: string, isPreview?: boolean) => string;
    t: LocaleObj;
}

function LinkInsertionModal({
    modalTitle,
    disabled,
    insertFragmentFunc,
    getMarkdownString,
    altTextInputLabel,
    altTextInputPlaceholder,
    urlInputLabel,
    urlInputPlaceholder,
    isAltTextRequired,
    altTextInputVisible,
    children,
    t,
}: InsertLinkModalProps) {
    const [url, setUrl] = useState("");
    const [urlAltText, setUrlAltText] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [urlValidationError, setUrlValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (modalOpen === false) {
            setUrl("");
            setUrlAltText("");
        }
    }, [modalOpen]);

    useEffect(() => {
        try {
            if (isValidUrl(cleanUrl(url))) setUrlValidationError(null);
            else setUrlValidationError("Invlid URL");
        } catch (error) {
            // @ts-ignore
            setUrlValidationError((error?.message as string) || "");
        }
    }, [url]);

    return (
        <EditorModal
            modalOpen={modalOpen}
            disabled={disabled}
            setModalOpen={setModalOpen}
            title={modalTitle}
            insertFragmentFunc={() => {
                if (!url || urlValidationError) return;
                if (isAltTextRequired && !urlAltText) return;

                insertFragmentFunc(getMarkdownString(url, urlAltText, false), url, urlAltText);

                setUrl("");
                setUrlAltText("");
            }}
            trigger={children}
            t={t}
        >
            {altTextInputVisible && (
                <div className="flex w-full flex-col items-start justify-center gap-1.5">
                    <Label htmlFor="markdown-editor-link-label-input" className="flex items-center justify-center">
                        {altTextInputLabel}{" "}
                        {isAltTextRequired && <span className="flex h-full items-start justify-center text-accent-foreground">*</span>}
                    </Label>
                    <Input
                        type="text"
                        id="markdown-editor-link-label-input"
                        value={urlAltText}
                        onChange={(e) => {
                            setUrlAltText(e.target.value);
                        }}
                        placeholder={altTextInputPlaceholder}
                        className="w-full"
                    />
                </div>
            )}
            <div className="flex w-full flex-col items-start justify-center gap-1.5">
                <Label htmlFor="markdown-editor-link-url-input" className="flex items-center justify-center">
                    {urlInputLabel} <span className="flex h-full items-start justify-center text-accent-foreground">*</span>
                </Label>
                <Input
                    id="markdown-editor-link-url-input"
                    spellCheck={false}
                    type="text"
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                    }}
                    placeholder={urlInputPlaceholder}
                    className="w-full"
                />
            </div>

            {url && urlValidationError ? (
                <FormErrorMessage text={urlValidationError} />
            ) : isAltTextRequired && !urlAltText ? (
                <FormErrorMessage text={`${altTextInputLabel} is required!`} />
            ) : null}

            <div className="flex w-full flex-col items-start justify-center gap-1.5">
                <Label>{t.preview}</Label>
                <div
                    tabIndex={-1}
                    className={cn(
                        "flex min-h-24 w-full items-start justify-start rounded border-2 border-shallow-background bg-shallow-background/25 px-4 py-3 dark:border",
                    )}
                >
                    {url && !urlValidationError ? (
                        <MarkdownRenderBox text={getMarkdownString(url, urlAltText, true).split(textSeparatorChar).join("")} />
                    ) : null}
                </div>
            </div>
        </EditorModal>
    );
}

export function cleanUrl(input: string): string {
    let url: URL;

    try {
        url = new URL(input);
    } catch (e) {
        throw new Error("Invalid URL. Make sure the URL is well-formed.");
    }

    // Check for unsupported protocols
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Unsupported protocol. Use http or https.");
    }

    // If the scheme is "http", automatically upgrade it to "https"
    if (url.protocol === "http:") {
        url.protocol = "https:";
    }

    // Block certain domains for compliance
    const blockedDomains = ["forgecdn"];
    if (blockedDomains.some((domain) => url.hostname.includes(domain))) {
        throw new Error("Invalid URL. This domain is not allowed.");
    }

    return url.toString();
}

function KeyboardShortcutsDialog({
    open,
    setOpen,
    children,
}: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    children: React.ReactNode;
}) {
    const shortcutsString =
        "|  Action  |  Shortcut  |\n|---|---|\n|  Bold  | <kbd>alt</kbd> <kbd>b</kbd>  |\n|  Italic  | <kbd>alt</kbd> <kbd>i</kbd>  |\n|  Underline  | <kbd>alt</kbd> <kbd>u</kbd>  |\n|  Code  |  <kbd>alt</kbd> <kbd>c</kbd>  |\n|  Spoiler  |  <kbd>alt</kbd> <kbd>s</kbd>  |\n|  Quote  |  <kbd>alt</kbd> <kbd>q</kbd>  |\n|  Bulleted list  |  <kbd>alt</kbd> <kbd>l</kbd>  |\n|  Toggle word wrap  |  <kbd>alt</kbd> <kbd>z</kbd>  |";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild className="flex w-fit items-center justify-start">
                {children}
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Keyboard shortcuts</DialogTitle>
                </DialogHeader>

                <DialogBody className="markdown-body flex w-full flex-col items-center justify-center">
                    <MarkdownRenderBox text={shortcutsString} />
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}

const editorLocaleObj = {
    heading1: "Heading 1",
    heading2: "Heading 2",
    heading3: "Heading 3",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strikethrough: "Strikethrough",
    code: "Code",
    spoiler: "Spoiler",
    bulletedList: "Bulleted list",
    numberedList: "Numbered list",
    quote: "Quote",
    insertLink: "Insert link",
    label: "Label",
    enterLabel: "Enter label",
    link: "Link", // Noun
    enterUrl: "Enter the link URL",
    insertImage: "Insert image",
    imgAlt: "Description (alt text)",
    imgAltDesc: "Enter a description for the image",
    enterImgUrl: "Enter the image URL",
    image: "Image",
    inserYtVideo: "Insert YouTube video",
    ytVideoUrl: "YouTube video URL",
    enterYtUrl: "Enter the YouTube video URL",
    video: "Video",
    preview: "Preview",
    insert: "Insert",
    cancel: "Cancel",
    url: "URL",
};
