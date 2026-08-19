class Message {

    constructor(event) {

        const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || "http://localhost:3000";
        const msg = event.payload;
        const raw = msg._data || {};

        let media = null;

        if (msg.media) {
            media = {
                ...msg.media,
                size: raw.size || null,
                url: msg.media.url
                    ? msg.media.url.replace(MEDIA_BASE_URL, "")
                    : null
            };
        }

        let reply = null;

        if (msg.replyTo) {

            const replyMedia =
                msg.replyTo.media ||
                msg.replyTo._data ||
                raw.quotedMsg ||
                null;

            reply = {
                id: msg.replyTo.id,
                participant: msg.replyTo.participant,
                body: msg.replyTo.body,
                hasMedia: msg.replyTo.hasMedia,

                media: replyMedia
                    ? {
                        ...replyMedia,

                        url:
                            replyMedia.url
                            || replyMedia.directPath
                            || replyMedia.deprecatedMms3Url
                            || null
                    }
                    : null
            };

        }
        this.id = msg.id;
        this.session = event.session;

        this.from = msg.from;
        this.to = msg.to;

        this.albumId = msg.parentMsgKey?.id || raw.parentMsgKey?.id || null;
        this.isAlbum = raw.type === "album";

        this.name = raw.notifyName || null;

        this.type = raw.type;
        this.body = msg.body;

        this.hasMedia = msg.hasMedia;
        this.media = media;
        this.reply = reply;

        this.timestamp = msg.timestamp;

        this.isGroup = msg.from.endsWith("@g.us");

        this.caption = this.body || "";

        this.command = this.caption.startsWith("#");

        this.raw = event;
        
    }

}

module.exports = Message;