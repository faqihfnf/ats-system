"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Highlighter,
  Link as LinkIcon,
  Baseline,
  ChevronDown,
  AlignJustify,
  Trash2,
  RemoveFormatting,
} from "lucide-react";

import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

// --- HELPER: TOOLTIP WRAPPER ---
const EditorTooltip = ({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="cursor-pointer">{children}</div>
    </TooltipTrigger>
    <TooltipContent
      side="top"
      className="border-none bg-slate-900 px-2 py-1 text-[10px] text-white"
    >
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

// --- KOMPONEN LINK PICKER ---
const LinkPicker = ({ editor }: { editor: Editor }) => {
  const [url, setUrl] = useState("");
  const isActive = editor.isActive("link");

  useEffect(() => {
    if (isActive) {
      setUrl(editor.getAttributes("link").href || "");
    } else {
      setUrl("");
    }
  }, [isActive, editor.state.selection]);

  const setLink = () => {
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    let validatedUrl = url;
    if (!/^https?:\/\//i.test(url)) validatedUrl = `https://${url}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: validatedUrl })
      .run();
  };

  return (
    <Popover>
      <EditorTooltip label="Insert Link">
        <PopoverTrigger asChild>
          <button
            className={cn(
              "hover:bg-muted flex cursor-pointer items-center gap-0.5 rounded p-2 transition-colors",
              isActive ? "text-blue-600!" : "text-slate-600",
            )}
          >
            <LinkIcon className="size-4" />
            <ChevronDown className="size-3 opacity-50" />
          </button>
        </PopoverTrigger>
      </EditorTooltip>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Insert Link
            </h4>
            {isActive && (
              <button
                onClick={() => editor.chain().focus().unsetLink().run()}
                className="text-destructive flex cursor-pointer items-center gap-1 text-[10px] hover:underline"
              >
                <Trash2 className="size-3" /> Remove
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === "Enter" && setLink()}
            />
            <Button
              size="sm"
              className="h-8 cursor-pointer px-3 text-xs"
              onClick={setLink}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Palet warna
const COLORS = [
  "#ffffff",
  "#f1f5f9",
  "#f0fdf4",
  "#fffbeb",
  "#fff1f2",
  "#e2e8f0",
  "#94a3b8",
  "#dcfce7",
  "#fde68a",
  "#fca5a5",
  "#64748b",
  "#3b82f6",
  "#4ade80",
  "#facc15",
  "#ef4444",
  "#0f172a",
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#991b1b",
];

// Komponen Pemilih Warna
const ColorPicker = ({
  editor,
  type,
  icon,
}: {
  editor: Editor;
  type: "text" | "highlight";
  icon: ReactNode;
}) => {
  const tooltipLabel = type === "text" ? "Text Color" : "Highlight Color";
  const isActive =
    type === "text"
      ? !!editor.getAttributes("textStyle").color
      : editor.isActive("highlight");

  return (
    <Popover>
      <EditorTooltip label={tooltipLabel}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "hover:bg-muted flex cursor-pointer items-center gap-0.5 rounded p-2",
              isActive ? "text-blue-600!" : "text-slate-600",
            )}
          >
            {icon}
            <ChevronDown className="size-3 opacity-50" />
          </button>
        </PopoverTrigger>
      </EditorTooltip>
      <PopoverContent className="w-44 p-3 shadow-xl">
        <span className="text-muted-foreground mb-3 block text-[10px] font-bold tracking-wider uppercase">
          Pick {type} Color
        </span>
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              className="size-6 cursor-pointer rounded border border-slate-200 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              onClick={() => {
                if (type === "text")
                  editor.chain().focus().setColor(color).run();
                else editor.chain().focus().setHighlight({ color }).run();
              }}
            />
          ))}
          <button
            className="bg-secondary hover:bg-secondary/80 col-span-4 mt-2 cursor-pointer rounded py-1 text-[10px]"
            onClick={() => {
              if (type === "text") editor.chain().focus().unsetColor().run();
              else editor.chain().focus().unsetHighlight().run();
            }}
          >
            Reset to Default
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

type Props = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-500 underline cursor-pointer" },
      }),
    ],
    immediatelyRender: false,
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[250px] p-4 focus:outline-none border-x border-b rounded-b-md",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "p";
  };

  const isAlignActive =
    !editor.isActive({ textAlign: "left" }) &&
    (editor.isActive({ textAlign: "center" }) ||
      editor.isActive({ textAlign: "right" }) ||
      editor.isActive({ textAlign: "justify" }));

  const getAlignIcon = () => {
    if (editor.isActive({ textAlign: "center" }))
      return <AlignCenter className="size-4" />;
    if (editor.isActive({ textAlign: "right" }))
      return <AlignRight className="size-4" />;
    if (editor.isActive({ textAlign: "justify" }))
      return <AlignJustify className="size-4" />;
    return <AlignLeft className="size-4" />;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex w-full flex-col bg-white">
        {/* Toolbar Utama */}
        <div className="flex flex-wrap items-center gap-1 rounded-t-md border bg-slate-50/50 p-1">
          <EditorTooltip label="Text Formatting">
            <Select
              value={getCurrentHeading()}
              onValueChange={(value) => {
                if (value === "p") editor.chain().focus().setParagraph().run();
                else
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({
                      level: parseInt(value.replace("h", "")) as any,
                    })
                    .run();
              }}
            >
              <SelectTrigger
                className={cn(
                  "hover:bg-muted h-8 w-32 cursor-pointer border-none bg-transparent text-xs shadow-none",
                  getCurrentHeading() !== "p"
                    ? "font-bold text-blue-600!"
                    : "text-slate-600",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p" className="cursor-pointer text-xs">
                  Paragraph
                </SelectItem>
                <SelectItem
                  value="h1"
                  className="cursor-pointer text-xs font-bold"
                >
                  Heading 1
                </SelectItem>
                <SelectItem
                  value="h2"
                  className="cursor-pointer text-xs font-bold"
                >
                  Heading 2
                </SelectItem>
                <SelectItem
                  value="h3"
                  className="cursor-pointer text-xs font-bold"
                >
                  Heading 3
                </SelectItem>
              </SelectContent>
            </Select>
          </EditorTooltip>

          <div className="bg-border mx-1 h-6 w-px" />

          {/* Basic Formatting */}
          <EditorTooltip label="Bold">
            <Toggle
              size="sm"
              className={cn(
                "h-8 w-8 cursor-pointer",
                editor.isActive("bold") && "bg-blue-50 text-blue-600!",
              )}
              pressed={editor.isActive("bold")}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="size-4" />
            </Toggle>
          </EditorTooltip>

          <EditorTooltip label="Italic">
            <Toggle
              size="sm"
              className={cn(
                "h-8 w-8 cursor-pointer",
                editor.isActive("italic") && "bg-blue-50 text-blue-600!",
              )}
              pressed={editor.isActive("italic")}
              onPressedChange={() =>
                editor.chain().focus().toggleItalic().run()
              }
            >
              <Italic className="size-4" />
            </Toggle>
          </EditorTooltip>

          <EditorTooltip label="Underline">
            <Toggle
              size="sm"
              className={cn(
                "h-8 w-8 cursor-pointer",
                editor.isActive("underline") && "bg-blue-50 text-blue-600!",
              )}
              pressed={editor.isActive("underline")}
              onPressedChange={() =>
                editor.chain().focus().toggleUnderline().run()
              }
            >
              <UnderlineIcon className="size-4" />
            </Toggle>
          </EditorTooltip>

          <EditorTooltip label="Strikethrough">
            <Toggle
              size="sm"
              className={cn(
                "h-8 w-8 cursor-pointer",
                editor.isActive("strike") && "bg-blue-50 text-blue-600!",
              )}
              pressed={editor.isActive("strike")}
              onPressedChange={() =>
                editor.chain().focus().toggleStrike().run()
              }
            >
              <Strikethrough className="size-4" />
            </Toggle>
          </EditorTooltip>

          <div className="bg-border mx-1 h-6 w-px" />

          {/* Lists */}
          <EditorTooltip label="Bullet List">
            <Toggle
              size="sm"
              className={cn(
                "h-8 w-8 cursor-pointer",
                editor.isActive("bulletList") && "bg-blue-50 text-blue-600!",
              )}
              pressed={editor.isActive("bulletList")}
              onPressedChange={() =>
                editor.chain().focus().toggleBulletList().run()
              }
            >
              <List className="size-4" />
            </Toggle>
          </EditorTooltip>

          <EditorTooltip label="Numbered List">
            <Toggle
              size="sm"
              className={cn(
                "h-8 w-8 cursor-pointer",
                editor.isActive("orderedList") && "bg-blue-50 text-blue-600!",
              )}
              pressed={editor.isActive("orderedList")}
              onPressedChange={() =>
                editor.chain().focus().toggleOrderedList().run()
              }
            >
              <ListOrdered className="size-4" />
            </Toggle>
          </EditorTooltip>

          {/* Alignment dengan Tooltip & Blue Color */}
          <DropdownMenu>
            <EditorTooltip label="Alignment">
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "hover:bg-muted flex cursor-pointer items-center gap-0.5 rounded p-2 transition-colors",
                    isAlignActive ? "text-blue-600!" : "text-slate-600",
                  )}
                >
                  {getAlignIcon()}
                  <ChevronDown className="size-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
            </EditorTooltip>
            <DropdownMenuContent
              align="start"
              className="flex min-w-10 flex-col gap-1 bg-white p-1 shadow-lg"
            >
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                className="cursor-pointer justify-center hover:bg-blue-50"
              >
                <AlignLeft
                  className={cn(
                    "size-4",
                    editor.isActive({ textAlign: "left" }) && "text-blue-600",
                  )}
                />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                className="cursor-pointer justify-center hover:bg-blue-50"
              >
                <AlignCenter
                  className={cn(
                    "size-4",
                    editor.isActive({ textAlign: "center" }) && "text-blue-600",
                  )}
                />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                className="cursor-pointer justify-center hover:bg-blue-50"
              >
                <AlignRight
                  className={cn(
                    "size-4",
                    editor.isActive({ textAlign: "right" }) && "text-blue-600",
                  )}
                />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                className="cursor-pointer justify-center hover:bg-blue-50"
              >
                <AlignJustify
                  className={cn(
                    "size-4",
                    editor.isActive({ textAlign: "justify" }) &&
                      "text-blue-600",
                  )}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="bg-border mx-1 h-6 w-px" />

          {/* Text Color & Highlight */}
          <ColorPicker
            editor={editor}
            type="text"
            icon={
              <Type
                className="size-4"
                style={{
                  color: editor.getAttributes("textStyle").color || "inherit",
                }}
              />
            }
          />

          <ColorPicker
            editor={editor}
            type="highlight"
            icon={
              <Highlighter
                className="size-4"
                style={{
                  backgroundColor:
                    editor.getAttributes("highlight").color || "transparent",
                }}
              />
            }
          />

          <LinkPicker editor={editor} />

          {/* Clear Formatting */}
          <EditorTooltip label="Clear Formatting">
            <button
              onClick={() =>
                editor.chain().focus().unsetAllMarks().clearNodes().run()
              }
              className="hover:bg-muted ml-auto cursor-pointer rounded p-2 text-slate-400 transition-colors"
            >
              <RemoveFormatting className="size-4" />
            </button>
          </EditorTooltip>
        </div>

        <EditorContent editor={editor} className="cursor-text" />
      </div>
    </TooltipProvider>
  );
}
