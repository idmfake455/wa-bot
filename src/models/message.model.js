class Message {

constructor(event) {

    const MEDIA_BASE_URL =
        process.env.MEDIA_BASE_URL || "http://localhost:3000";

    const msg = event.payload || {};
    const raw = msg._data || {};


    // ============================================================
    // MAIN MEDIA
    // ============================================================

    let media = null;

    if (msg.media) {

        media = {
            ...msg.media,

            size:
                raw.size ||
                null,

            url:
                msg.media.url
                    ? msg.media.url.replace(
                        MEDIA_BASE_URL,
                        ""
                    )
                    : null
        };

    }


    // ============================================================
    // REPLY / QUOTED MESSAGE
    // ============================================================

    let reply = null;

    if (msg.replyTo) {

        const replyTo =
            msg.replyTo || {};

        const replyRaw =
            replyTo._data || {};

        const quotedRaw =
            raw.quotedMsg || {};


        // --------------------------------------------------------
        // REPLY TYPE
        // --------------------------------------------------------

        const replyType =
            replyRaw.type ||
            replyTo.type ||
            quotedRaw.type ||
            null;


        // --------------------------------------------------------
        // REPLY KIND
        // --------------------------------------------------------

        const replyKind =
            replyRaw.kind ||
            replyTo.kind ||
            quotedRaw.kind ||
            null;


        // --------------------------------------------------------
        // ALBUM DETECTION
        // --------------------------------------------------------

        const isReplyToAlbum =
            replyType === "album" ||
            replyKind === "album";


        // --------------------------------------------------------
        // PARENT MESSAGE KEY
        // --------------------------------------------------------

        const parentMsgKey =
            replyRaw.parentMsgKey ||
            replyTo.parentMsgKey ||
            quotedRaw.parentMsgKey ||
            null;


        // --------------------------------------------------------
        // ALBUM ID
        // --------------------------------------------------------

        /*
         * Case 1:
         *
         * reply langsung ke album
         *
         * replyTo.id = ALBUM ID
         *
         * Case 2:
         *
         * reply ke salah satu image anggota album
         *
         * replyTo._data.parentMsgKey.id = ALBUM ID
         */

        const albumId =
            isReplyToAlbum
                ? (
                    replyTo.id ||
                    null
                )
                : (
                    parentMsgKey?.id ||
                    null
                );


        // --------------------------------------------------------
        // REPLY MEDIA
        // --------------------------------------------------------

        let replyMedia = null;


        /*
         * Untuk single image:
         *
         * replyTo.hasMedia = true
         * replyTo.media = {...}
         *
         * Jadi gunakan replyTo.media.
         *
         * Untuk album:
         *
         * replyTo.hasMedia = false
         * replyTo.media = null
         * _data.type = album
         *
         * sehingga JANGAN memasukkan _data album
         * ke dalam media.
         */

        if (
            !isReplyToAlbum &&
            replyTo.hasMedia === true &&
            replyTo.media
        ) {

            replyMedia = {

                ...replyTo.media,

                url:
                    replyTo.media.url
                        ? replyTo.media.url.replace(
                            MEDIA_BASE_URL,
                            ""
                        )
                        : null

            };

        }


        // --------------------------------------------------------
        // BUILD REPLY OBJECT
        // --------------------------------------------------------

        reply = {

            id:
                replyTo.id ||
                null,

            participant:
                replyTo.participant ||
                null,

            body:
                replyTo.body ||
                null,

            hasMedia:
                replyTo.hasMedia === true,

            type:
                replyType,

            kind:
                replyKind,

            isAlbum:
                isReplyToAlbum,

            albumId:
                albumId,

            parentMsgKey:
                parentMsgKey,

            media:
                replyMedia

        };

    }


    // ============================================================
    // BASIC MESSAGE
    // ============================================================

    this.id =
        msg.id ||
        null;


    this.session =
        event.session ||
        null;


    // ============================================================
    // FROM / TO
    // ============================================================

    this.from =
        msg.from ||
        null;

    this.to =
        msg.to ||
        null;


    // ============================================================
    // ALBUM INFORMATION OF CURRENT MESSAGE
    // ============================================================

    this.albumId =
        msg.parentMsgKey?.id ||
        raw.parentMsgKey?.id ||
        null;


    this.isAlbum =
        raw.type === "album";


    // ============================================================
    // SENDER NAME
    // ============================================================

    this.name =
        raw.notifyName ||
        null;


    // ============================================================
    // MESSAGE TYPE
    // ============================================================

    this.type =
        raw.type ||
        null;


    // ============================================================
    // BODY
    // ============================================================

    this.body =
        msg.body ||
        "";


    // ============================================================
    // MAIN MEDIA
    // ============================================================

    this.hasMedia =
        msg.hasMedia === true;

    this.media =
        media;


    // ============================================================
    // REPLY
    // ============================================================

    this.reply =
        reply;


    // ============================================================
    // TIMESTAMP
    // ============================================================

    this.timestamp =
        msg.timestamp ||
        null;


    // ============================================================
    // GROUP
    // ============================================================

    this.isGroup =
        typeof msg.from === "string"
            ? msg.from.endsWith("@g.us")
            : false;


    // ============================================================
    // CAPTION
    // ============================================================

    this.caption =
        this.body;


    // ============================================================
    // COMMAND
    // ============================================================

    this.command =
        this.caption.startsWith("#");


    // ============================================================
    // RAW EVENT
    // ============================================================

    this.raw =
        event;

}


}

module.exports = Message;
