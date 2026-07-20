class Message {

    constructor(event) {

        const msg = event.payload;
        const raw = msg._data || {};

        // Normalisasi URL media
        let media = null;

        if (msg.media?.url) {

            media = {
                ...msg.media,
                url: msg.media.url.replace("http://localhost:3000", "")
            };

            // ===== DEBUG =====
            // console.log("Original URL   :", msg.media.url);
            // console.log("Normalized URL :", media.url);
            // ================

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

        // Simpan payload asli untuk debugging jika diperlukan
        this.raw = event;

    }

}

module.exports = Message;


