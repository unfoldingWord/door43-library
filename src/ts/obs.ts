/// <reference path="d/strings.d.ts" />

interface Catalog {

    catalogs: any[];
    languages: Language[];
}

interface Language {
    language: string;   // language code
    title: string;      // localized language name
    direction: string;  // ltr or rtl
    owners: { [key: string]: Owner; };
}

interface Owner {
    name: string;
    full_name: string;
    subjects: { [key: string]: Subject; };
}

interface Subject {
    subject: string;  // subject
    entries: CatalogEntry[];
}

interface CatalogEntry {
    id: number;
    branch_or_tag_name: string;
    full_name: string;
    name: string;
    language: string;
    language_title: string;
    language_direction: string;
    metadata_url: string;
    owner: string;
    release: Release;
    subject: string;
    title: string;
    zipball_url: string;
}

interface Release {
    id: string;
    tag_name: string;
    assets: Asset[];
}

interface Asset {
    id: number;
    name: string;
    size: number;
    browser_download_url: string;
    download_count: number;
    created_at: Date;
}

class Format {
    name: string;
    ext: string;
    format: string;
    quality: string;
    prefix: string;
    version: string;
    asset: Asset;
    chapters: Chapter[];
}

class Chapter extends Format {
    identifier: string;
}

class DownloadableTypes {
    text: Format[] = [];
    audio: Format[] = [];
    video: Format[] = [];
    other: Format[] = [];
}

class OBS {
    /**
     * {0} = language code
     * {1} = Anglicized language name
     * {2} = Localized language name
     * @type {string}
     */
    static expandable_list_header: string = '<h{0} class="resource-list-h{0}" data-lang-code="{1}"><span class="plus"></span> {2}</h{0}>\n';

    static chapters_h3: string = '<span class="chapters-toggle">&ensp;<span class="plus"></span></span>';

    /**
     * {0} = Downloadable type name (Text, Audio, Video)
     * @type {string}
     */
    static downloadable_type_desc: string = '<p><strong><em>{0}</em></strong></p>\n';

    /**
     * {0} = Downloadable URL
     * {1} = Downloadable description
     * @type {string}
     */
    static downloadable_li: string = '<li><a href="{0}" style="text-decoration: none;" target="_blank">{1}</a></li>\n';

    static chapters_ul: string = '<ul style="margin: 16px 0;  display: none"></ul>';

    /**
     * {0} = font awesome class
     * {1} = title
     * {2} = type
     * {3} = size
     * @type {string}
     */
    static description: string = '<i class="fa {0}" aria-hidden="true"></i>&ensp;{1}&nbsp;<span style="color: #606060">({2}{3})</span>';

    /**
     * {0} = size string, and zipped if applicable
     * @type {string}
     */
    static size_span = '&nbsp;<span style="color: #606060">{0}</span>';

    testString: string;
    loadResult: string;
    languages: { [key: string]: Language; } = {};
    langnames: { [key: string]: any; } = {};

    /**
     * Class constructor
     * @param {string} v5_url
     * @param {Function} callback An optional callback function, mainly for unit testing
     */
    constructor(v5_url: string, callback?: Function) {
        this.populateLangnames();

        // load the v5 catalog now
        let me = this;
        $.ajax({
            url: v5_url,
            dataType: 'json',
            context: this,
        }).done(function (resp) {
            me.extractOBS(resp.data);
            me.loadResult = 'Successfully loaded catalog data.';
            if (typeof callback !== 'undefined')
                callback(me.loadResult);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            const error = 'Failed: status = "' + textStatus + '", message = "' + errorThrown + '".';
            console.log(error);
        });
    }

    /**
     * Due to CORS, the file originally at https://td.unfoldingword.org/exports/langnames.json has
     * to reside on the same server as this script, and since we serving this script from
     * obs-web.netlify.app, it has to access the file there. The below code determines if we are
     * on the SquareSpace openbiblestories.org site (or the squarespace.com site for editing), and
     * if so, adds 'obs-web.netlify.app' to the json/langnames.json URL. Otherwise it gets the one
     * we fetch in the build.sh script on build.
    */
    populateLangnames() {
        let me = this;
        let hostname = '';
        if (window.location.hostname.indexOf("openbiblestories.org") >= 0 ||
            window.location.hostname.indexOf("squarespace.com") >= 0) {
            hostname = 'https://obs-web.netlify.app/';
        }
        $.ajax({
            dataType: "json",
            url: hostname + 'json/langnames.json',
            async: false,
            error: function (xhr, status, error) {
                console.log('Error fetching file: ' + hostname + 'json/langnames.json\n\rxhr: ' + xhr + '\n\rstatus: ' + status + '\n\rerror: ' + error);
            },
            success: function (data) {
                console.log('Fetch of ' + hostname + 'json/langnames.json successful');
                data.forEach(langname => {
                    me.langnames[langname["lc"]] = langname;
                })
            }
        });
    }

    /**
     * Extracts the languages with OBS entries from the catalog
     * @param data The catalog from https://git.door43.org/api/catalog/v5/search?includeHistory=1&subject=<all OBS subjects>
     */
    extractOBS(data: Object[]): void {
        let me = this;
        data.forEach(item => {
            // if (item['language'] != 'en' && item['language'] != 'es-419') return;
            let langId = item['language'];
            let subjectId = item['subject'].toLowerCase().replace(/^tsv */, '');
            let ownerId = item['owner'].toLowerCase();
            if (!(langId in me.languages)) {
                me.languages[langId] = <Language>{
                    language: langId,
                    title: item['language_title'],
                    direction: item['language_direction'],
                    owners: {},
                };
            }
            if (!(ownerId in me.languages[langId].owners)) {
                me.languages[langId].owners[ownerId] = <Owner>{
                    name: item['owner'],
                    full_name: item['repo']['owner']['full_name'],
                    subjects: {},
                };
            }
            if (!(subjectId in me.languages[langId].owners[ownerId].subjects)) {
                me.languages[langId].owners[ownerId].subjects[subjectId] = <Subject>{
                    subject: item['subject'],
                    entries: [],
                };
            }
            me.languages[langId].owners[ownerId].subjects[subjectId].entries.push(<CatalogEntry>item);
        });
    }

    /**
     * Adds a link to Downloadable types
     * @param {DownloadableTypes} downloadable_types the existing downloadable types
     * @param {Asset} asset the asset to add
     */
    static addLinkToDownloadableTypes(downloadable_types: DownloadableTypes, asset: Asset, version: string): DownloadableTypes {
        if (!asset || !asset.browser_download_url || !asset.name)
            return downloadable_types;
        let fmt = new Format();
        fmt.name = asset.name;
        fmt.asset = asset;
        fmt.prefix = asset.browser_download_url.getHostName();
        fmt.format = OBS.getFormatFromName(asset.name);
        fmt.version = version;
        let type: string = "other";

        if (
            fmt.prefix.indexOf('door43.org') > -1
        ) {
            type = "text";
        }

        for (let k = 0; k < downloadable_types[type].length; k++) {
            let f = downloadable_types[type][k];
            if (f.prefix == fmt.prefix && f.version > fmt.version)
                return downloadable_types;
        }
        downloadable_types[type].push(fmt);
        return downloadable_types;
    }

    /**
     * Adds an asset to Downloadable types
     * @param {DownloadableTypes} downloadable_types the existing downloadable types
     * @param {Asset} asset the asset to add
     */
    static addAssetToDownloadableTypes(downloadable_types: DownloadableTypes, asset: Asset, release_version: string): DownloadableTypes {
        const fileparts_regex = /^([^_]+)_([^_]+)_v([\d\.-]+)_*(.*)\.([^\._]+)$/;
        const audioparts_regex = /^(\d+|mp\d|3gpp)_([^_]+)$/;
        let fileparts = fileparts_regex.exec(asset.name.toLowerCase())
        if (!fileparts) {
            return OBS.addLinkToDownloadableTypes(downloadable_types, asset, release_version)
        }
        let prefix = fileparts[1] + "_" + fileparts[2];
        let version = fileparts[3];
        let info = fileparts[4];
        let ext = fileparts[5];
        let format = OBS.getFormatFromName(asset.name);
        const audioparts = audioparts_regex.exec(info);
        if (audioparts && (ext == "zip" || ext == "mp3" || ext == "mp4")) {
            let quality = audioparts[2];
            if (ext == "mp3" || ext == "mp4") {
                let parent_zip_name = prefix + "_v" + version + "_" + ext + "_" + quality + ".zip"
                let chapterNum = audioparts[1]
                let parent: Format;
                let chapter = new Chapter();
                chapter.identifier = chapterNum;
                chapter.name = asset.name;
                chapter.ext = ext;
                chapter.prefix = prefix;
                chapter.version = version;
                chapter.quality = quality;
                chapter.format = format;
                chapter.asset = asset;
                let type = "audio";
                if (ext == "mp4")
                    type = "video";
                for (let k = 0; k < downloadable_types[type].length; k++) {
                    let media = downloadable_types[type][k];
                    if (media.prefix == prefix && media.quality == quality && media.version > version)
                        return downloadable_types;
                    if (!parent && media.name == parent_zip_name) {
                        parent = media;
                    }
                }
                if (!parent) {
                    parent = new Format();
                    parent.name = parent_zip_name;
                    parent.chapters = [];
                    parent.quality = quality;
                    parent.prefix = prefix;
                    parent.ext = "zip";
                    parent.version = version;
                    downloadable_types[type].push(parent);
                }
                if (! parent.chapters) {
                    parent.chapters = [];
                }
                parent.chapters.push(chapter);
                parent.chapters.sort((a: Chapter, b: Chapter) => { return a.identifier.localeCompare(b.identifier) });
            }
            else { // is a media zip
                let media_ext = audioparts[1];
                let my_fmt;
                let type: string = "audio";
                if (media_ext == "mp4" || media_ext == "3gpp") {
                    type = "video";
                }
                for (let k = 0; k < downloadable_types[type].length; k++) {
                    let media = downloadable_types[type][k];
                    if (media.prefix == prefix && media.format == format && media.quality == quality && media.version > version)
                        return downloadable_types;
                    if (!my_fmt && !media.asset && media.name == asset.name) {
                        my_fmt = media;
                    }
                }
                if (!my_fmt) {
                    my_fmt = new Format();
                    my_fmt.quality = quality;
                    my_fmt.format = format;
                    my_fmt.prefx = prefix;
                    my_fmt.ext = ext;
                    my_fmt.version = version;
                    my_fmt.chapters = [];
                    downloadable_types[type].push(my_fmt);
                }
                my_fmt.name = asset.name;
                my_fmt.asset = asset;
            }
        } else {
            let fmt = new Format();
            fmt.name = asset.name;
            fmt.prefix = prefix;
            fmt.ext = ext;
            fmt.asset = asset;
            fmt.format = format;
            fmt.version = version;
            let type: string = "other";

            if (format.indexOf('audio') > -1) {
                type = "audio";
            }
            else if (format.indexOf('video') > -1) {
                type = "video";
            }
            else if (
                format.indexOf('markdown') > -1 ||
                format.indexOf('pdf') > -1 ||
                format.indexOf('docx') > -1 ||
                format.indexOf('odt') > -1 ||
                format.indexOf('epub') > -1 ||
                format.indexOf('door43') > -1
            ) {
                type = "text";
            }

            for (let k = 0; k < downloadable_types[type].length; k++) {
                let f = downloadable_types[type][k];
                if (f.prefix == fmt.prefix && f.ext == fmt.ext && f.format == fmt.format && f.version > fmt.version)
                    return downloadable_types;
            }
            downloadable_types[type].push(fmt);
        }
        return downloadable_types;
    }

    /**
     * Builds the language accordion and inserts it into the page
     * @param {Function} callback An optional callback function
     */
    buildDiv(callback?: Function): void {
        let $container = $('body').find('#published-languages');
        $container.empty();
        let me = this;
        let $accordion_wrapper = $(`<div class="accordion-wrapper" id="language-list"></div>`);
        Object.keys(me.languages).sort().forEach(langId => {
            let lang = me.languages[langId]
            let ang = '';
            if (langId in me.langnames && 'ang' in me.langnames[langId] && me.langnames[langId]['ang'].trim() &&
                me.langnames[langId]['ang'].toLowerCase() != lang.title.toLowerCase()) {
                ang = ' / ' + me.langnames[langId].ang;
            }
            let $lang_accordion = $(`<div class="accordion lang-accordion"></div>`);
            let id = langId.replace(/[^\w-]/g,'_');
            $accordion_wrapper.append($lang_accordion);
            $lang_accordion.append(`
    <h2 class="accordion-title language-toggle" data-lang-code="${langId}" id="${id}">${langId}${ang} / ${lang.title}
        <i class="accordion-icon">
            <div class="line-01"></div>
            <div class="line-02"></div>
        </i>
    </h2>
`);
            let $lang_content = $(`<div class="accordion-content"></div>`);
            $lang_accordion.append($lang_content);

            Object.keys(lang.owners).sort().forEach(ownerId => {
                let owner = me.languages[langId].owners[ownerId];

                let $owner_accordion = $(`<div class="accordion accordion-nested owner-accordion"></div>`)
                let id = `${langId}--${ownerId}`.replace(/[^\w-]/g, '_');
                $lang_content.append($owner_accordion);
                $owner_accordion.append(`
        <h3 class="accordion-title owner-toggle" id="${id}">Published by: <strong>${owner.full_name ? owner.full_name : owner.name}</strong> <a href="https://git.door43.org/${owner.name}" class="globe" target="_blank"><i class="fa fa-external-link-alt" aria-hidden="true" title="View Organization page on DCS"></i></a>
            <i class="accordion-icon">
                <div class="line-01"></div>
                <div class="line-02"></div>
            </i>
        </h3>
`);
                let $owner_content = $(`<div class="accordion-content"></div>`);
                $owner_accordion.append($owner_content);

                Object.keys(owner.subjects).sort((a: string, b: string) => {
                    // List Open Bible Stories first, all others alphabetically
                    return (a.startsWith("open") ? -1 : (b.startsWith("open") ? 1 : a.localeCompare(b)));
                }).forEach(subjectId => {
                    let subject = owner.subjects[subjectId]

                    let top_entry: CatalogEntry = subject.entries[0];

                    let locale_title = top_entry.title;
                    let subjectStr = top_entry.subject;
                    let title = locale_title;
                    if (title.replace('Open Bible Stories ', 'OBS ').replace(/ /g, '').toLowerCase() == subjectStr.replace(/ /g, '').toLowerCase())
                        title = locale_title;
                    else if (langId != 'en' && subjectStr.toLowerCase().replace(/ /g, '') != locale_title.toLowerCase().replace(/ /g, ''))
                        title = locale_title + " (" + subjectStr + ")";

                    let $subject_accordion = $(`<div class="accordion accordion-nested subject-accordion"></div>`);
                    let id = `${langId}--${ownerId}--${subjectId}`.replace(/[^\w-]/g,'_');
                    $owner_content.append($subject_accordion);
                    $subject_accordion.append(`
            <h4 class="accordion-title subject-toggle" id="${id}">${title}
                <i class="accordion-icon">
                    <div class="line-01"></div>
                    <div class="line-02"></div>
                </i>
            </h4>
`);

                    let $subject_content = $(`<div class="accordion-content"></div>`);
                    $subject_accordion.append($subject_content);

                    let downloadable_types = OBS.getDownloadableTypes(subject.entries);

                    if (downloadable_types.text.length > 0) {
                        $subject_content.append(OBS.downloadable_type_desc.format('Text'));
                        $subject_content.append(OBS.getList(downloadable_types.text, locale_title));
                    }

                    if (downloadable_types.audio.length > 0) {
                        $subject_content.append(OBS.downloadable_type_desc.format('Audio'));
                        $subject_content.append(OBS.getList(downloadable_types.audio, locale_title));
                    }

                    if (downloadable_types.video.length > 0) {
                        $subject_content.append(OBS.downloadable_type_desc.format('Video'));
                        $subject_content.append(OBS.getList(downloadable_types.video, top_entry.title));
                    }

                    if (downloadable_types.other.length > 0) {
                        $subject_content.append(OBS.downloadable_type_desc.format('Other'));
                        $subject_content.append(OBS.getList(downloadable_types.other, top_entry.title));
                    }
                });
            });
        });

        $container.append($accordion_wrapper);

        let $chapters_toggle = $container.find('.chapters-toggle');
        $chapters_toggle.css('cursor', 'pointer');
        $chapters_toggle.on('click', function () {
            $(this).nextUntil('h3').slideToggle();
            $(this).find('span').toggleClass('minus');
        });

        // When any accordion title is clicked...
        $(".accordion-title").on('click', function () {
            const id = $(this).attr('id');
            window.location.hash = `#${id}`;
            const $accordion_wrapper = $(this).parent();
            const $accordion_content = $(this).parent().find(".accordion-content").first();
            const $accordion_open = "accordion-open";

            // If this accordion is already open
            if ($accordion_wrapper.hasClass($accordion_open)) {
                $accordion_content.slideUp();                     // Close the content.
                $accordion_wrapper.removeClass($accordion_open);  // Remove the accordionm--open class.
            }
            // If this accordion is not already open
            else {
                $accordion_content.slideDown();                 // Show this accordion's content.
                $accordion_wrapper.addClass($accordion_open);   // Add the accordion-open class.
            }
        });

        const [langHash, ownerHash, subjectHash] = window.location.hash.split('--');
        if (langHash) {
            $(langHash).trigger('click');
            if(ownerHash) {
                $(langHash + '--' + ownerHash).trigger('click');
                if(subjectHash) {
                    $(langHash + '--' + ownerHash + '--' + subjectHash).trigger('click');
                }
            }
            $('html, body').animate({
                scrollTop: $(langHash).offset().top
            }, 'slow');
        }

        if (typeof callback !== 'undefined')
            callback();
    }

    static getDownloadableTypes(entries: CatalogEntry[]): DownloadableTypes {
        let downloadable_types = new DownloadableTypes();

        if (entries.length < 1)
            return downloadable_types;

        const top_entry = entries[0];

        for (let i = 0; i < entries.length; i++) {
            let entry: CatalogEntry = entries[i];
            for (let j = 0; j < entry.release.assets.length; j++) {
                let asset: Asset = entry.release.assets[j];
                if (asset.name.toLowerCase().endsWith("links.json")
                    || asset.name.toLowerCase().endsWith("link.json")
                    || asset.name.toLowerCase().endsWith("assets.json")
                    || asset.name.toLowerCase().endsWith("attachments.json")
                    || asset.name.toLowerCase().endsWith("files.json")) {
                    $.ajax({
                        url: asset.browser_download_url,
                        dataType: "json",
                        async: false,
                        success: function (linkAssets) {
                            if (!Array.isArray(linkAssets)) {
                                linkAssets = [linkAssets];
                            }
                            linkAssets.forEach((linkAsset: Asset) => {
                                downloadable_types = OBS.addAssetToDownloadableTypes(downloadable_types, linkAsset, entry.release.tag_name);
                            });
                        }
                    });
                } else {
                    downloadable_types = OBS.addAssetToDownloadableTypes(downloadable_types, asset, entry.release.tag_name);
                }
            }
        }
        downloadable_types = OBS.addAssetToDownloadableTypes(downloadable_types, <Asset>{
            'name': "View on Door43.org",
            'browser_download_url': "https://door43.org/u/" + top_entry.full_name + "/" + top_entry.release.tag_name,
        }, top_entry.release.tag_name);
        downloadable_types = OBS.addAssetToDownloadableTypes(downloadable_types, <Asset>{
            'name': top_entry.name + "-" + top_entry.release.tag_name + ".zip",
            'browser_download_url': top_entry.zipball_url,
        }, top_entry.release.tag_name);
        return downloadable_types;
    }

    /**
     * Get the file extension of a URL (including if it has query params) without the preceeding dot
     * @param {string} url
     * @returns {string}
     */
    private static getUrlExt(url: string): string {
        return (url = url.substr(1 + url.lastIndexOf("/")).split('?')[0]).split('#')[0].substr(url.lastIndexOf(".") + 1)
    }

    /**
     * Get the file extension of a filename
     * @param {string} name
     * @returns {string}
     */
    private static getFileExt(name: string): string {
        if (!name) return '';
        return name.slice(name.lastIndexOf(".") + 1);
    }

    /**
     * Get the format from the Format fields, such based on the URL file extension or quality
     * @param {string} name 
     * @returns {string}
     */
    private static getFormatFromName(name: string): string {
        if (!name)
            return '';
        var ext = OBS.getFileExt(name.toLowerCase());
        var zip_type_regex = /_(mp3|3gp|mp4)_/gi;
        switch (ext) {
            case '3gp':
                return 'video/3gp';
            case 'html':
                return 'text/html';
            case 'md':
                return 'text/markdown';
            case 'mp3':
                return 'audio/mp3';
            case 'mp4':
                return 'video/mp4';
            case 'pdf':
                return 'application/pdf';
            case 'txt':
                return 'text/txt';
            case 'usfm':
                return 'text/usfm';
            case 'doc':
                return 'application/doc';
            case 'docx':
                return 'application/docx';
            case 'epub':
                return 'application/epub';
            case 'odt':
                return 'applicaiton/odt';
            case 'zip':
                let match = zip_type_regex.exec(name.toLowerCase());
                if (match) {
                    switch (match[1].toLowerCase()) {
                        case '3gp':
                            return 'application/zip; content=video/3gp';
                        case 'mp4':
                            return 'application/zip; content=video/mp4';
                        case 'mp3':
                            return 'application/zip; content=audio/mp3';
                    }
                }
                return 'application/zip';
            default:
                if (name.toLowerCase().indexOf('door43.org') > -1)
                    return 'door43.org';
                else if (name.toLowerCase().indexOf('youtube.com') > -1)
                    return 'youtube.com';
                else if (name.toLowerCase().indexOf('bloomlibrary.org') > -1)
                    return 'bloomlibrary.org';
                else if (ext)
                    return ext;
                else
                    return name.getHostName();
        }
    }

    /**
     * Gets a friendly description of the format
     * @param {Format|Chapter} fmt
     * @param {string} title
     *
     * @returns {string}
     */
    private static getDescription(fmt: Format | Chapter): string {
        let title = fmt.asset.name;

        if (!fmt.format) {
            fmt.format = OBS.getFormatFromName(fmt.asset.name);
        }

        let fmt_description: string;
        let fmt_class: string;

        let format_parts = fmt.format.split(' ');
        let format_map = {};
        format_parts.forEach(part => {
            part = part.replace(/\s*;*$/, '');
            let key_value = part.split('=');
            if (key_value.length == 2) {
                format_map[key_value[0]] = key_value[1];
            } else if (!format_map['mime']) {
                format_map['mime'] = part;
            }
        });

        let is_zipped = (format_map['mime'] == 'application/zip');
        let mime = format_map['mime'];
        if (is_zipped && 'content' in format_map) {
            mime = format_map['content'];
        }

        let mime_parts = mime.split('/');
        let show_size = true;
        let is_source_regex = /https:\/\/git.door43.org\/[^/]+\/[^/]+\/archive\//i;
        switch (mime_parts[mime_parts.length - 1]) {
            case 'pdf':
                fmt_description = 'PDF';
                fmt_class = 'fa-file-pdf';
                break;
            case 'youtube':
                title = fmt.name;
                show_size = false;
                fmt_class = 'fa-brands fa-youtube';
                fmt_description = 'Website'
                break;
            case 'bloom':
                title = fmt.name;
                show_size = false;
                fmt_description = 'Website';
                fmt_class = 'fa-book';
                break;
            case 'door43.org':
                title = fmt.name;
                fmt_description = 'Website';
                fmt_class = 'fa-globe';
                show_size = false;
                break;
            case 'git.door43.org':
                title = fmt.name;
                fmt_description = 'Source Files';
                fmt_class = 'fa-file-lines';
                show_size = false;
                break;
            case 'docx':
                fmt_description = 'Word Document';
                fmt_class = 'fa-file-word';
                break;
            case 'odt':
                fmt_description = 'OpenDocument Text';
                fmt_class = 'fa-file-text';
                break;
            case 'epub':
                fmt_description = 'ePub Book';
                fmt_class = 'fa-book';
                break;
            case 'markdown':
            case 'md':
                fmt_description = 'Markdown';
                fmt_class = 'fa-file-text';
                break;
            case 'html':
                fmt_description = 'HTML';
                fmt_class = 'fa-code';
                break;
            case 'usfm':
                fmt_description = 'USFM';
                fmt_class = 'fa-file-text';
                break;
            case 'mp3':
                fmt_description = 'MP3';
                fmt_class = 'fa-file-audio';
                break;
            case 'mp4':
                fmt_description = 'MP4';
                fmt_class = 'fa-file-video';
                break;
            case '3gp':
            case '3gpp':
                fmt_description = '3GP';
                fmt_class = 'fa-file-video';
                break;
            case 'zip':
                fmt_class = 'fa-file-zipper';
                fmt_description = 'Zipped'
                let match = is_source_regex.exec(fmt.asset.browser_download_url);
                if (match) {
                    fmt_description += ", Source Files"
                }
                break;
            default:
                title = fmt.name;
                fmt_description = fmt.format;
                fmt_class = 'fa-file';
                break;
        }

        if (fmt.quality && fmt.quality != fmt_description) {
            fmt_description += '&nbsp;&ndash;&nbsp;' + fmt.quality;
        }

        let size_string = ''
        if (show_size && fmt.asset.size > 0) {
            size_string = OBS.getSize(fmt.asset.size);
            if (is_zipped) {
                size_string += ' zipped';
            }
        }

        if (size_string) {
            size_string = ', ' + size_string;
        }

        if ('identifier' in fmt) {
            title = '<span style="color: #606060">Chapter&nbsp;' + parseInt((<Chapter>fmt).identifier).toLocaleString() + ':</span> ' + title
        }

        return OBS.description.format(fmt_class, title, fmt_description, size_string);
    }

    private static getSize(file_size: number): string {

        if (file_size === 0) {
            return '';
        }

        if (file_size < 1000) {
            return file_size.toLocaleString() + ' Bytes';
        }

        let kb = file_size / 1024;
        if (kb < 1000) {
            return kb.toFixed(1).toLocaleString() + ' KB';
        }

        let mb = kb / 1024;
        if (mb < 1000) {
            return mb.toFixed(1).toLocaleString() + ' MB';
        }

        let gb = mb / 1024;
        if (gb < 1000) {
            return gb.toFixed(1).toLocaleString() + ' GB';
        }
    }

    private static getList(downloadable_type: Format[], title: string): JQuery {

        let $ul = $(`<ul></ul>`);

        for (let n = 0; n < downloadable_type.length; n++) {

            let fmt: Format = downloadable_type[n];

            let description = OBS.getDescription(fmt);
            if (description == null)
                continue;

            let $li = $(OBS.downloadable_li.format(fmt.asset.browser_download_url, description));
            if ( ! ('chapters' in fmt) || (fmt.chapters.length < 1) ) {
                $ul.append
            } else {
                $li.append(OBS.chapters_h3);

                let $chapters_ul: JQuery = $(OBS.chapters_ul);

                for (let m = 0; m < fmt.chapters.length; m++) {

                    let chap: Chapter = fmt.chapters[m];

                    let chap_description = OBS.getDescription(chap);
                    if (chap_description == null)
                        continue;

                    let $chapter_li = $(OBS.downloadable_li.format(chap.asset.browser_download_url, chap_description));
                    $chapters_ul.append($chapter_li);
                }

                $li.append($chapters_ul);
            }

            $ul.append($li);
        }

        return $ul;
    }
}
