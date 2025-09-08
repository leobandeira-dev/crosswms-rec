
import { useState } from 'react';
import { Volume } from '../../components/etiquetas/VolumesTable';

/**
 * Hook for managing dialog state
 */
export const useDialogState = () => {
  const [classifyDialogOpen, setClassifyDialogOpen] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<Volume | null>(null);

  /**
   * Opens the classify dialog for a specific volume
   */
  const openClassifyDialog = (volume: Volume) => {
    setSelectedVolume(volume);
    setClassifyDialogOpen(true);
  };

  /**
   * Closes the classify dialog
   */
  const closeClassifyDialog = () => {
    setClassifyDialogOpen(false);
    setSelectedVolume(null);
  };

  return {
    classifyDialogOpen,
    selectedVolume,
    setClassifyDialogOpen,
    openClassifyDialog,
    closeClassifyDialog
  };
};
