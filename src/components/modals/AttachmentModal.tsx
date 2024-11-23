interface AttachmentModalProps {
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
}

const AttachmentModal = ({ onClose, onSubmit }: AttachmentModalProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onSubmit(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Add Attachment</h3>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full mb-4"
        />
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AttachmentModal; 