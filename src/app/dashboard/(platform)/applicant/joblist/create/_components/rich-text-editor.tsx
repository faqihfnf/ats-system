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
  Bold, Italic, List, ListOrdered, Strikethrough, 
  Underline as UnderlineIcon, AlignLeft, AlignCenter, 
  AlignRight, Type, Highlighter, Link as LinkIcon, 
  Baseline, ChevronDown, 
  AlignJustify
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

// --- KOMPONEN LINK PICKER (BARU) ---
const LinkPicker = ({ editor }: { editor: Editor }) => {
  const [url, setUrl] = useState("");

  // Update input saat kursor berpindah ke teks yang sudah ada link-nya
  useEffect(() => {
    if (editor.isActive("link")) {
      setUrl(editor.getAttributes("link").href || "");
    } else {
      setUrl("");
    }
  }, [editor.isActive("link"), editor.state.selection]);

  const setLink = () => {
  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  // Logika untuk memastikan URL adalah absolut
  let validatedUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    validatedUrl = `https://${url}`;
  }

  editor.chain().focus()
    .extendMarkRange("link")
    .setLink({ href: validatedUrl })
    .run();
};

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className={`p-2 hover:bg-muted rounded flex items-center gap-0.5 ${editor.isActive("link") ? "bg-blue-50 text-blue-600" : ""}`}
        >
          <LinkIcon className="size-4" />
          <ChevronDown className="size-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Insert Link</h4>
          <div className="flex gap-2">
            <Input 
              placeholder="https://example.com" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === "Enter" && setLink()}
            />
            <Button size="sm" className="h-8 px-3 text-xs" onClick={setLink}>
              Apply
            </Button>
          </div>
          {editor.isActive("link") && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-7 text-[10px] text-destructive hover:bg-destructive/10"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setUrl("");
              }}
            >
              Remove Link
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
// Palet warna sesuai gambar Anda
const COLORS = [
  "#ffffff", "#f1f5f9", "#f0fdf4", "#fffbeb",
  "#fff1f2", "#e2e8f0", "#94a3b8", "#dcfce7",
  "#fde68a", "#fca5a5", "#64748b", "#3b82f6",
  "#4ade80", "#facc15", "#ef4444", "#0f172a",
  "#2563eb", "#16a34a", "#ea580c", "#991b1b",
];

type ColorPickerProps = {
  editor: Editor;
  type: "text" | "highlight";
  icon: React.ReactNode;
};

// Komponen Kecil untuk Pemilih Warna
const ColorPicker = ({ editor, type, icon }: ColorPickerProps) => {
  const title = type === "text" ? "PICK A TEXT COLOR" : "PICK A HIGHLIGHT COLOR";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 hover:bg-muted rounded flex items-center gap-0.5">
          {icon}
          <ChevronDown className="size-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-3">
        <span className="text-[10px] font-bold text-muted-foreground block mb-3 tracking-wider">
          {title}
        </span>
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              className="size-6 rounded border border-slate-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => {
                if (type === "text") {
                  editor.chain().focus().setColor(color).run();
                } else {
                  editor.chain().focus().setHighlight({ color }).run();
                }
              }}
            />
          ))}
          {/* Tombol Reset Warna */}
          <button 
            className="col-span-4 mt-2 text-[10px] py-1 bg-secondary rounded hover:bg-secondary/80"
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
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right", "justify"], }),
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
    ],
    immediatelyRender: false,
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none border-x border-b rounded-b-md",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  // Fungsi pembantu untuk menentukan value Select yang sedang aktif
  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "p";
  };

  // Helper untuk icon alignment yang sedang aktif
  const getAlignIcon = () => {
    if (editor.isActive({ textAlign: "center" })) return <AlignCenter className="size-4" />;
    if (editor.isActive({ textAlign: "right" })) return <AlignRight className="size-4" />;
    if (editor.isActive({ textAlign: "justify" })) return <AlignJustify className="size-4" />;
    return <AlignLeft className="size-4" />;
  };

  const setLink = () => {
    const url = window.prompt("Masukkan URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toolbar Utama */}
      <div className="flex flex-wrap items-center gap-1 p-1 border rounded-t-md bg-slate-50/50">
        
        {/* Heading Dropdown */}
        <Select
          value={getCurrentHeading()}
          onValueChange={(value) => {
            if (value === "p") {
              editor.chain().focus().setParagraph().run();
            } else {
              // Mengambil angka dari string seperti "h1", "h2"
              const level = parseInt(value.replace("h", "")) as 1 | 2 | 3;
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
        >
          <SelectTrigger className="w-32 h-8 text-xs border-none bg-transparent hover:bg-muted">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Basic Formatting */}
        <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="size-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="size-4" />
        </Toggle>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </Toggle>

        {/* Alignment Dropdown (BARU - Sesuai Gambar) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-muted rounded-md flex items-center gap-1">
              {getAlignIcon()}
              <ChevronDown className="size-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-10 flex flex-col gap-1 p-1">
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("left").run()} className="justify-center">
              <AlignLeft className="size-4" />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("center").run()} className="justify-center">
              <AlignCenter className="size-4" />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("right").run()} className="justify-center">
              <AlignRight className="size-4" />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("justify").run()} className="justify-center">
              <AlignJustify className="size-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border mx-1" />

        {/* BARU: Text Color & Highlight Pickers */}
        <ColorPicker 
          editor={editor} 
          type="text" 
          icon={<Type className="size-4" style={{ color: editor.getAttributes("textStyle").color || "inherit" }} />} 
        />
        
        <ColorPicker 
          editor={editor} 
          type="highlight" 
          icon={<Highlighter className="size-4" />} 
        />

       {/* Link Picker Baru */}
        <LinkPicker editor={editor} />

        {/* Clear Formatting */}
        <button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="p-1 hover:bg-muted rounded ml-auto">
          <Baseline className="size-4" />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}