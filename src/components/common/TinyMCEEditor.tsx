import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
  disabled?: boolean;
  mode?: 'email' | 'document';
}

export const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  value,
  onChange,
  height = 400,
  placeholder = '',
  disabled = false,
  mode = 'document'
}) => {
  // Different toolbar configurations based on mode
  const toolbarConfig = mode === 'email'
    ? 'undo redo | blocks | bold italic underline | forecolor backcolor | alignleft aligncenter alignright | bullist numlist | link image | removeformat'
    : 'undo redo | blocks fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table | removeformat code';

  const pluginsConfig = mode === 'email'
    ? 'lists link image autolink'
    : 'lists link image table code autolink charmap searchreplace visualblocks wordcount';

  return (
    <Editor
      apiKey="lf2pyi0thf7o66zbwm8re3w8lchhive1vhj9jkvzdghoub8w"
      value={value}
      disabled={disabled}
      onEditorChange={onChange}
      init={{
        height,
        menubar: false,
        plugins: pluginsConfig,
        toolbar: toolbarConfig,
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; }',
        placeholder,
        branding: false,
        promotion: false,
        resize: false,
        statusbar: false,
        // Link settings
        link_default_target: '_blank',
        link_assume_external_targets: true,
        // Image settings
        images_upload_handler: (blobInfo: any) => {
          return new Promise<string>((resolve, reject) => {
            // For now, convert to base64
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.onerror = () => {
              reject('Error reading image');
            };
            reader.readAsDataURL(blobInfo.blob());
          });
        },
        // Paste settings
        paste_as_text: false,
        paste_data_images: true,
        // Additional settings
        entity_encoding: 'raw',
        convert_urls: false,
      }}
    />
  );
};
