class Message {

    constructor(event) {

        const msg = event.payload;
        const raw = msg._data || {};

        let media = null;

        if (msg.media) {
            media = {
                ...msg.media,

                size: raw.size || null,

                url: msg.media.url
                    ? msg.media.url.replace("http://localhost:3000", "")
                    : null
            };
        }

        this.id = msg.id;
        this.session = event.session;

        this.from = msg.from;
        this.to = msg.to;

        this.name = raw.notifyName || null;

        this.type = raw.type;
        this.body = msg.body;

        this.hasMedia = msg.hasMedia;
        this.media = media;

        this.timestamp = msg.timestamp;

        this.isGroup = msg.from.endsWith("@g.us");

        this.caption = this.body || "";

        this.command = this.caption.startsWith("#");

        this.raw = event;
    }

}

module.exports = Message;