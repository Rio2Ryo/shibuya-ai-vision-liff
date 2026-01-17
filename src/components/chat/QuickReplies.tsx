interface QuickRepliesProps {
  options: string[];
  onSelect: (option: string) => void;
}

export function QuickReplies({ options, onSelect }: QuickRepliesProps) {
  if (options.length === 0) return null;

  return (
    <div className="px-4 py-2 bg-white border-t">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option)}
            className="flex-shrink-0 px-4 py-2 bg-pink-50 text-pink-600 rounded-full
                       border border-pink-200 hover:bg-pink-100 transition-colors
                       text-sm font-medium whitespace-nowrap"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
