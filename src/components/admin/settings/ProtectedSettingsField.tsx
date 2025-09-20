import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, Edit, X } from 'lucide-react';

interface ProtectedSettingsFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password' | 'email' | 'textarea';
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

const ProtectedSettingsField: React.FC<ProtectedSettingsFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  rows = 3,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const maskValue = (val: string) => {
    if (type === 'email') {
      return val.replace(/(.{2}).*@/, '$1***@');
    } else if (type === 'password') {
      return '••••••••';
    } else if (type === 'textarea') {
      return val.length > 50 ? val.substring(0, 50) + '...' : val;
    } else {
      return val.length > 10 ? val.substring(0, 10) + '...' : val;
    }
  };

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const displayValue = isVisible ? value : maskValue(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-white">{label}</Label>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsVisible(!isVisible)}
            className="glass-button-outline"
            disabled={disabled}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="glass-button-outline"
            disabled={disabled}
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {type === 'textarea' ? (
        <Textarea
          value={isEditing ? editValue : displayValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="glass-input text-white border-white/20"
          disabled={disabled || !isEditing}
        />
      ) : (
        <Input
          type={type}
          value={isEditing ? editValue : displayValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className="glass-input text-white border-white/20"
          disabled={disabled || !isEditing}
        />
      )}
      
      {isEditing && (
        <div className="flex gap-2">
          <Button onClick={handleSave} className="glass-button">
            Save
          </Button>
          <Button onClick={handleCancel} className="glass-button-outline">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProtectedSettingsField;
