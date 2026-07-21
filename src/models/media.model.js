class Media {

    constructor(data) {

        this.id = data.id;

        this.filename = data.filename;

        this.path = data.path;

        this.mimetype = data.mimetype;

        this.extension = data.extension;

        this.size = data.size;

        this.source = data.source;

    }

}

module.exports = Media;