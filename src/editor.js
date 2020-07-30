import { FlexBox } from '@romger/react-flex-layout';
import classnames from 'classnames';
import 'jodit/build/jodit.min.css';
import React from 'react';
import { FileUploadModal } from './components/fileUploadModal/fileUploadModal';
import JoditEditor from './components/joditEditor/joditEditor';
import localizationRu from './config/i18n/ru';
import { FileUploadService } from './services/fileUploadService';

/**
 * Компонент для редактирования текста
 * @param {String} editorStartHTML - начальное значение для текстового редактора
 * @param {Function} onEditorStateChange - колбек при смене стейта редактора
 * @param {Boolean} fontSizeDisable - отключить добавление стилей font-size в html код
 * @param {Boolean} fontFamilyDisable - отключить добавление стилей font-family в html код
 * @param {Boolean} saveCopiedTextFormatDisable - отключить сохранение форматирования при вставке текста
 * @param {Function} onEditorUploadFile - колбек для загрузки изображения (возвращает promise с url до загруженного изображения)
 * @param {Number} maxUploadedFileSize - максимальный размер загружаемого файла (в байтах)
 */
class RgReactTextEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            content: null,
            load: false,
            contentLength: 0,
            showFileUploadModal: false,
            savedEditorCursorPosition: null,
        };

        this.editorNode = null;
        this.fileInput = null;

        this.config = {
            'language': 'ru',
            'defaultMode': '1',
            'askBeforePasteHTML': !this.props.saveCopiedTextFormatDisable,
            'askBeforePasteFromWord': !this.props.saveCopiedTextFormatDisable,
            'buttons': 'bold,strikethrough,underline,italic,|,superscript,subscript,|,ul,ol,|,outdent,indent,|,font,fontsize,brush,paragraph,|,video,table,link,|,align,undo,redo,\n,cut,hr,eraser,copyformat,|,symbol,fullsize,selectall,print',
            'buttonsMD': 'bold,strikethrough,underline,italic,|,superscript,subscript,|,ul,ol,|,outdent,indent,|,font,fontsize,brush,paragraph,|,video,table,link,|,align,undo,redo,\n,cut,hr,eraser,copyformat,|,symbol,fullsize,selectall,print',
            'buttonsSM': 'bold,strikethrough,underline,italic,|,superscript,subscript,|,ul,ol,|,outdent,indent,|,font,fontsize,brush,paragraph,|,video,table,link,|,align,undo,redo,\n,cut,hr,eraser,copyformat,|,symbol,fullsize,selectall,print',
            'buttonsXS': 'bold,strikethrough,underline,italic,|,superscript,subscript,|,ul,ol,|,outdent,indent,|,font,fontsize,brush,paragraph,|,video,table,link,|,align,undo,redo,\n,cut,hr,eraser,copyformat,|,symbol,fullsize,selectall,print',
            i18n: {
                ru: localizationRu,
            },
            extraButtons: [
                {
                    icon: 'image',
                    exec: () => {
                        if (!!this.fileInput) {
                            this.fileInput.click();
                        }
                    },
                    tooltip: 'Вставить изображение',
                },
                {
                    icon: 'file',
                    exec: () => {
                        this.setState({
                            showFileUploadModal: true,
                            savedEditorCursorPosition: this.editorNode.selection.current(),
                        });
                    },
                    tooltip: 'Вставить файл',
                },
            ],
        };

        if (this.props.config) {
            this.config = Object.assign({}, this.config, this.props.config);
        }
    }

    componentDidMount() {
        this.setState({
            content: this.props.editorStartHTML,
            load: true,
            contentLength:
                this.props.editorStartHTML
                    ? this.props.editorStartHTML
                        .replace(/\r|\n/g, '')
                        .replace(/<\/?[^>]+>/g, '')
                        .length
                    : 0,
        });
    }

    /**
     * Обновление стэйта текстового редактора
     * @param editedHtml
     */
    onEditorStateChange(editedHtml) {
        let text = editedHtml.replace(/\r|\n/g, '')
            .replace(/<\/?[^>]+>/g, '');

        this.setState({
            content: editedHtml,
            contentLength: text.length,
        }, () => this.pushChangesUp(this.state.content, this.state.contentLength));
    }

    pushChangesUp(htmlString, contentLength) {
        if (contentLength <= this.props.maxLength || !this.props.maxLength) {
            let htmlToSave = htmlString;

            if (this.props.fontFamilyDisable) {
                htmlToSave = htmlToSave.replace(/font-family:[^;]*;?/g, '');
            }

            if (this.props.fontSizeDisable) {
                htmlToSave = htmlToSave.replace(/font-size:[^;]*;?/g, '');
            }

            htmlToSave = htmlToSave.replace(/float:none;/g, 'position:relative;left:50%;transform:translateX(-50%);');

            this.props.onEditorStateChange(htmlToSave);
        }
    }

    /**
     * Загрузить файл
     */
    uploadFile(e) {
        if (!e || !e.target || !e.target.files) {
            return;
        }

        let file = e.target.files[0];

        FileUploadService.uploadFile(file, this.checkAndUploadFile.bind(this));
    }

    /**
     * Проверить, является ли файл изображением
     */
    checkAndUploadFile(fileInfo) {
        let allowedTypes = [
            'image/jpeg',
            'image/bmp',
            'image/gif',
            'image/png',
        ];

        const BYTE_OF_MEGABYTE = 1048576;

        if (!fileInfo) {
            window.alert('Файл не загружен!');
            return;
        }

        if (!FileUploadService.isFileAllowedType(fileInfo, allowedTypes)) {
            window.alert('Данный файл не удовлетворяет требований к расширению! Доступные расширения: jpeg, bmp, gif, png.');
            return;
        }

        if (this.props.maxUploadedFileSize && !FileUploadService.isFileAllowedSize(fileInfo, this.props.maxUploadedFileSize)) {
            window.alert(`Файл слишком большой! выберите файл размером меньше ${this.props.maxUploadedFileSize / BYTE_OF_MEGABYTE} МБ`);
            return;
        }

        this.uploadFileAction(fileInfo)
            .then(imageLink => {
                this.editorNode.selection.insertHTML(`<img src="${imageLink}" />`);
                this.fileInput.value = null;
            });
    }

    /**
     * Загрузить файл на сервер
     * @param fileInfo
     * @returns {*}
     */
    uploadFileAction(fileInfo) {
        if (!this.props.onEditorUploadFile) {
            return Promise.reject('Prop onEditorUploadFile is missing');
        }

        return this.props.onEditorUploadFile(fileInfo.multiPartFile);
    }

    /**
     * Закрытие модальное окна добавления ссылки на файл
     * @param fileLinkObj
     */
    onFileUploadModalClose(fileLinkObj) {
        if (!!this.state.savedEditorCursorPosition) {
            this.editorNode.selection.setCursorAfter(this.state.savedEditorCursorPosition);
        }
        if (fileLinkObj) {
            this.editorNode.selection.insertHTML(`<a target="_blank" href="${fileLinkObj.fileLink}" rel="noopener noreferrer">${fileLinkObj.fileLinkTitle}</a>`);
        }
        this.setState({
            showFileUploadModal: false,
            savedEditorCursorPosition: null,
        });
    }

    render() {
        return (
            this.state.load &&
            <div>
                {
                    this.state.showFileUploadModal &&
                    <FileUploadModal
                        uploadFileAction={this.uploadFileAction.bind(this)}
                        maxUploadedFileSize={this.props.maxUploadedFileSize}
                        onClose={this.onFileUploadModalClose.bind(this)}
                    />
                }
                {
                    this.props.disabled
                        ?
                        <div
                            className={classnames(
                                'ws-react-text-editor__disabled-wrap',
                            )}
                            dangerouslySetInnerHTML={{
                                __html: this.state.content ?
                                    this.state.content :
                                    '',
                            }}>
                        </div>
                        :
                        <div
                            style={{
                                position: 'relative',
                            }}
                        >
                            <JoditEditor
                                ref={node => this.editorNode = node}
                                value={this.state.content}
                                config={this.config}
                                onChange={this.onEditorStateChange.bind(this)}
                            />
                            <FlexBox
                                row="end ctr"
                                className={classnames(
                                    'max-length-wrap',
                                )}>
                                {
                                    this.props.maxLength &&
                                    <div
                                        className={classnames(
                                            {
                                                'max-length-wrap__error': this.state.contentLength > this.props.maxLength,
                                            },
                                        )}>
                                        {this.state.contentLength} / {this.props.maxLength}
                                    </div>
                                }
                            </FlexBox>
                            <input
                                onChange={e => this.uploadFile(e)}
                                ref={node => this.fileInput = node}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                }

            </div>
        );
    }
}

export default RgReactTextEditor;
