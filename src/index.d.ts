import * as React from 'react';

interface RgReactTextEditorProps {
    onEditorUploadFile?: (file: File) => string;
    maxUploadedFileSize?: number;
    disabledOptions?: Array<string>;
    editorStartHTML?: string;
    fontFamilyDisable?: boolean;
    fontSizeDisable?: boolean;
    maxLength?: number;
    onEditorStateChange?: (htmlToSave: string) => any;
    disabled?: boolean;
    config?: any;
}

export class RgReactTextEditor extends React.Component<RgReactTextEditorProps, any> {}
