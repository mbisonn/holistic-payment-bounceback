
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
      <Input
        className="pl-10 bg-gray-900 text-white border-gray-700 placeholder-gray-400"
        placeholder="Search by name or SKU..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
