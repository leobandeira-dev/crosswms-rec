
import React from 'react';
import VolumesTable from './VolumesTable';
import AddVolumeForm from './AddVolumeForm';
import { VolumeItem } from '../../utils/volumeCalculations';

interface VolumesInputFormProps {
  volumes: VolumeItem[];
  onChange: (volumes: VolumeItem[]) => void;
  readOnly?: boolean;
}

const VolumesInputForm: React.FC<VolumesInputFormProps> = ({ 
  volumes, 
  onChange,
  readOnly = false
}) => {
  const handleAddVolume = (newVolume: VolumeItem) => {
    onChange([...volumes, newVolume]);
  };

  const handleRemoveVolume = (indexToRemove: number) => {
    onChange(volumes.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <VolumesTable 
        volumes={volumes} 
        onRemoveVolume={handleRemoveVolume} 
        readOnly={readOnly} 
      />
      
      {!readOnly && (
        <AddVolumeForm onAddVolume={handleAddVolume} />
      )}
    </div>
  );
};

export default VolumesInputForm;
