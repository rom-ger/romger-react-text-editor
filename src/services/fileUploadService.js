export class FileUploadService {
    /**
     * Загрузка файла
     * @param file
     * @param checkAndUploadFile - функция проверки и загрузки файла на сервер
     */
    static uploadFile(file, checkAndUploadFile) {
        if (!file) {
            return;
        }

        let reader = new FileReader();

        reader.onload = e => {
            let fileInfo = this.getFileInfo(e);
            fileInfo.name = file.name;
            fileInfo.multiPartFile = file;
            checkAndUploadFile(fileInfo);
        };

        reader.readAsDataURL(file);
    }

    /**
     * Получить необходимую информацию по файлу
     * @param {*} file
     */
    static getFileInfo(file) {
        let forIteration = 1;
        let doublePoint3IndexCheck = -1;
        let result = {};
        let doublePointIndex = file.target.result.indexOf(':');
        let doublePoint2Index = file.target.result.indexOf(';');
        let doublePoint3Index = file.target.result.indexOf(',');
        result.type_file = file.target.result.substr(doublePointIndex + forIteration, doublePoint2Index - doublePointIndex - forIteration);
        if (doublePoint3Index === doublePoint3IndexCheck) {
            doublePoint3Index = doublePoint2Index;
        }
        result.base_64 = file.target.result.substr(doublePoint3Index + forIteration, file.target.result.length - doublePoint3Index - forIteration);
        result.url_encode = encodeURIComponent(result.base_64);
        result.size = file.total;
        result.result = file.target.result;
        return result;
    }

    /**
     * Является ли подходящим формат файла
     * @param fileInfo
     * @param allowedTypes
     * @returns {*}
     */
    static isFileAllowedType(fileInfo, allowedTypes) {
        return allowedTypes.includes(fileInfo.type_file);
    }

    /**
     * Файл не превышает допустимый размер
     * @param fileInfo
     * @param maxAllowedSize
     * @returns {*|boolean}
     */
    static isFileAllowedSize(fileInfo, maxAllowedSize) {
        return fileInfo.size && fileInfo.size <= maxAllowedSize;
    }
}
