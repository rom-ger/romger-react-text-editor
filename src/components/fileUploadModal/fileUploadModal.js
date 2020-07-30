import { FlexBox } from '@romger/react-flex-layout';
import { RgReactInput } from '@romger/react-input';
import { RgReactBaseModal } from '@romger/react-modal-dialog';
import classnames from 'classnames';
import React, { useState } from 'react';
import { FileUploadService } from '../../services/fileUploadService';

/**
 * Модальное окно загрузки файла
 * @param props.uploadFileAction
 * @param props.maxUploadedFileSize
 * @param props.onClose({fileLink: string, fileLinkTitle: string})
 * @returns {*}
 * @constructor
 */
const FileUploadModal = (props) => {
    const modalWindowWidth = 600;

    const [fileLink, setFileLink] = useState(null);
    const [fileLinkTitle, setFileLinkTitle] = useState(null);
    const [fileLoading, setFileLoading] = useState(false);

    const isValidForm = () => !!fileLink && !!fileLinkTitle;

    /**
     * Загрузить файл
     */
    const uploadFile = (e) => {
        if (!e || !e.target || !e.target.files) {
            return;
        }

        let file = e.target.files[0];

        FileUploadService.uploadFile(file, checkAndUploadFile);
    };

    /**
     * Проверить, является ли файл изображением
     */
    const checkAndUploadFile = (fileInfo) => {
        const BYTE_OF_MEGABYTE = 1048576;

        if (!fileInfo) {
            window.alert('Файл не загружен!');
            return;
        }

        if (props.maxUploadedFileSize && !FileUploadService.isFileAllowedSize(fileInfo, props.maxUploadedFileSize)) {
            window.alert(`Файл слишком большой! выберите файл размером меньше ${props.maxUploadedFileSize / BYTE_OF_MEGABYTE} МБ`);
            return;
        }

        setFileLoading(true);

        props.uploadFileAction(fileInfo)
            .then(fileLink => {
                setFileLink(fileLink);
                setFileLoading(false);
            })
            .catch(() => setFileLoading(false));
    };

    return (
        <RgReactBaseModal
            show
            title={'Вставить ссылку на файл'}
            closeCallback={() => props.onClose()}
            currentWidth={modalWindowWidth}
            actions={[
                {
                    isDefaultCancel: true,
                    title: 'Отмена',
                },
                {
                    isDisabled: () => !isValidForm(),
                    onClick: () => props.onClose({
                        fileLink,
                        fileLinkTitle,
                    }),
                    title: 'Добавить',
                },
            ]}
            parentClass={classnames(
                'file-upload-modal',
            )}
        >
            {
                !fileLink &&
                <FlexBox
                    row={'start'}
                >
                    <input
                        type="file"
                        onChange={e => uploadFile(e)}
                    />
                    {
                        fileLoading &&
                        <div>Идёт загрузка файла...</div>
                    }
                </FlexBox>
            }
            {
                !!fileLink &&
                <FlexBox
                    row={'sb ctr'}
                    className={classnames(
                        'file-upload-modal__file-link',
                    )}
                >
                    <div>{fileLink}</div>
                    <button
                        className={classnames(
                            'file-upload-modal__change-file-button',
                        )}
                        onClick={() => setFileLink(null)}
                    >
                        Изменить
                    </button>
                </FlexBox>
            }
            <RgReactInput
                topLabel
                value={fileLinkTitle}
                label={'Текст ссылки'}
                updateCallback={e => setFileLinkTitle(e.target.value ? e.target.value : '')}
            />
        </RgReactBaseModal>
    );
};

export { FileUploadModal };
