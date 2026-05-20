import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function VoiceChatButton() {
  const handleClick = () => {
    window.open(
      "https://elevenlabs.io/app/talk-to?agent_id=agent_9001kb5caygye9qanf9635kfa1dz",
      "_blank"
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            size="icon"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-white"
          >
            <Mic className="h-7 w-7 text-white" />
            <span className="sr-only">Open Voice Assistant</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Talk to AI Assistant</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
