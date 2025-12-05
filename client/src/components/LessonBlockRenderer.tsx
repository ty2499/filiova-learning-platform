import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, FileText, Image as ImageIcon, Video as VideoIcon } from "lucide-react";

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'accordion';
  content: any;
  orderNum: number;
}

interface LessonBlockRendererProps {
  blocks: ContentBlock[];
}

export default function LessonBlockRenderer({ blocks }: LessonBlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No content blocks for this lesson.</p>
      </div>
    );
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.orderNum - b.orderNum);

  return (
    <div className="lesson-content-reset">
      {sortedBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  const [isOpen, setIsOpen] = useState(true);

  // Helper function to detect and convert YouTube URLs to embed format
  const getVideoEmbedUrl = (url: string) => {
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      return {
        isYouTube: true,
        embedUrl: `https://www.youtube.com/embed/${match[1]}`
      };
    }
    
    return {
      isYouTube: false,
      embedUrl: url
    };
  };

  switch (block.type) {
    case 'text':
      return (
        <p className="leading-relaxed text-foreground whitespace-pre-wrap">{block.content.text}</p>
      );

    case 'image':
      return (
        <>
          {block.content.url && (
            <img
              src={block.content.url}
              alt={block.content.alt || 'Lesson image'}
              className="w-full"
            />
          )}
          {block.content.caption && (
            <p className="text-sm text-muted-foreground italic text-center">
              {block.content.caption}
            </p>
          )}
        </>
      );

    case 'video':
      const videoInfo = block.content.url ? getVideoEmbedUrl(block.content.url) : null;
      return (
        <>
          {videoInfo && (
            <div className="aspect-video bg-black">
              {videoInfo.isYouTube ? (
                <iframe
                  src={videoInfo.embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Lesson video"
                />
              ) : (
                <video
                  src={videoInfo.embedUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
          {block.content.caption && (
            <p className="text-sm text-muted-foreground italic text-center">
              {block.content.caption}
            </p>
          )}
        </>
      );

    case 'accordion':
      return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="bg-white border-b">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-left">
                  <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  <span>{block.content.title || 'Collapsible Section'}</span>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="leading-relaxed text-foreground whitespace-pre-wrap">{block.content.content}</p>
            </CollapsibleContent>
          </div>
        </Collapsible>
      );

    default:
      return null;
  }
}
