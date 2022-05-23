function copy(e, t) {
    for (var n in e) t[n] = e[n]
}
function _extends(e, t) {
    function n() {}
    var o = e.prototype;
    if (Object.create) {
        var i = Object.create(t.prototype);
        o.__proto__ = i
    }
    o instanceof t || (n.prototype = t.prototype, n = new n, copy(o, n), e.prototype = o = n),
    o.constructor != e && ("function" != typeof e && console.error("unknow Class:" + e), o.constructor = e)
}
function DOMException(e, t) {
    if (t instanceof Error) var n = t;
    else n = this,
    Error.call(this, ExceptionMessage[e]),
    this.message = ExceptionMessage[e],
    Error.captureStackTrace && Error.captureStackTrace(this, DOMException);
    return n.code = e,
    t && (this.message = this.message + ": " + t),
    n
}
function NodeList() {}
function LiveNodeList(e, t) {
    this._node = e,
    this._refresh = t,
    _updateLiveList(this)
}
function _updateLiveList(e) {
    var t = e._node._inc || e._node.ownerDocument._inc;
    if (e._inc != t) {
        var n = e._refresh(e._node);
        __set__(e, "length", n.length),
        copy(n, e),
        e._inc = t
    }
}
function NamedNodeMap() {}
function _findNodeIndex(e, t) {
    for (var n = e.length; n--;) if (e[n] === t) return n
}
function _addNamedNode(e, t, n, o) {
    if (o ? t[_findNodeIndex(t, o)] = n: t[t.length++] = n, e) {
        n.ownerElement = e;
        var i = e.ownerDocument;
        i && (o && _onRemoveAttribute(i, e, o), _onAddAttribute(i, e, n))
    }
}
function _removeNamedNode(e, t, n) {
    var o = _findNodeIndex(t, n);
    if (! (o >= 0)) throw DOMException(NOT_FOUND_ERR, new Error(e.tagName + "@" + n));
    for (var i = t.length - 1; i > o;) t[o] = t[++o];
    if (t.length = i, e) {
        var r = e.ownerDocument;
        r && (_onRemoveAttribute(r, e, n), n.ownerElement = null)
    }
}
function DOMImplementation(e) {
    if (this._features = {},
    e) for (var t in e) this._features = e[t]
}
function Node() {}
function _xmlEncoder(e) {
    return "<" == e && "&lt;" || ">" == e && "&gt;" || "&" == e && "&amp;" || '"' == e && "&quot;" || "&#" + e.charCodeAt() + ";"
}
function _visitNode(e, t) {
    if (t(e)) return ! 0;
    if (e = e.firstChild) do
    if (_visitNode(e, t)) return ! 0;
    while (e = e.nextSibling)
}
function Document() {}
function _onAddAttribute(e, t, n) {
    e && e._inc++;
    var o = n.namespaceURI;
    "http://www.w3.org/2000/xmlns/" == o && (t._nsMap[n.prefix ? n.localName: ""] = n.value)
}
function _onRemoveAttribute(e, t, n) {
    e && e._inc++;
    var o = n.namespaceURI;
    "http://www.w3.org/2000/xmlns/" == o && delete t._nsMap[n.prefix ? n.localName: ""]
}
function _onUpdateChild(e, t, n) {
    if (e && e._inc) {
        e._inc++;
        var o = t.childNodes;
        if (n) o[o.length++] = n;
        else {
            for (var i = t.firstChild,
            r = 0; i;) o[r++] = i,
            i = i.nextSibling;
            o.length = r
        }
    }
}
function _removeChild(e, t) {
    var n = t.previousSibling,
    o = t.nextSibling;
    return n ? n.nextSibling = o: e.firstChild = o,
    o ? o.previousSibling = n: e.lastChild = n,
    _onUpdateChild(e.ownerDocument, e),
    t
}
function _insertBefore(e, t, n) {
    var o = t.parentNode;
    if (o && o.removeChild(t), t.nodeType === DOCUMENT_FRAGMENT_NODE) {
        var i = t.firstChild;
        if (null == i) return t;
        var r = t.lastChild
    } else i = r = t;
    var a = n ? n.previousSibling: e.lastChild;
    i.previousSibling = a,
    r.nextSibling = n,
    a ? a.nextSibling = i: e.firstChild = i,
    null == n ? e.lastChild = r: n.previousSibling = r;
    do i.parentNode = e;
    while (i !== r && (i = i.nextSibling));
    return _onUpdateChild(e.ownerDocument || e, e),
    t.nodeType == DOCUMENT_FRAGMENT_NODE && (t.firstChild = t.lastChild = null),
    t
}
function _appendSingleChild(e, t) {
    var n = t.parentNode;
    if (n) {
        var o = e.lastChild;
        n.removeChild(t);
        var o = e.lastChild
    }
    var o = e.lastChild;
    return t.parentNode = e,
    t.previousSibling = o,
    t.nextSibling = null,
    o ? o.nextSibling = t: e.firstChild = t,
    e.lastChild = t,
    _onUpdateChild(e.ownerDocument, e, t),
    t
}
function Element() {
    this._nsMap = {}
}
function Attr() {}
function CharacterData() {}
function Text() {}
function Comment() {}
function CDATASection() {}
function DocumentType() {}
function Notation() {}
function Entity() {}
function EntityReference() {}
function DocumentFragment() {}
function ProcessingInstruction() {}
function XMLSerializer() {}
function nodeSerializeToString(e, t) {
    var n = [],
    o = 9 == this.nodeType ? this.documentElement: this,
    i = o.prefix,
    r = o.namespaceURI;
    if (r && null == i) {
        var i = o.lookupPrefix(r);
        if (null == i) var a = [{
            namespace: r,
            prefix: null
        }]
    }
    return serializeToString(this, n, e, t, a),
    n.join("")
}
function needNamespaceDefine(e, t, n) {
    var o = e.prefix || "",
    i = e.namespaceURI;
    if (!o && !i) return ! 1;
    if ("xml" === o && "http://www.w3.org/XML/1998/namespace" === i || "http://www.w3.org/2000/xmlns/" == i) return ! 1;
    for (var r = n.length; r--;) {
        var a = n[r];
        if (a.prefix == o) return a.namespace != i
    }
    return ! 0
}
function serializeToString(e, t, n, o, i) {
    if (o) {
        if (e = o(e), !e) return;
        if ("string" == typeof e) return t.push(e),
        void 0
    }
    switch (e.nodeType) {
    case ELEMENT_NODE:
        i || (i = []);
        var r = (i.length, e.attributes),
        a = r.length,
        s = e.firstChild,
        u = e.tagName;
        n = htmlns === e.namespaceURI || n,
        t.push("<", u);
        for (var d = 0; a > d; d++) {
            var c = r.item(d);
            "xmlns" == c.prefix ? i.push({
                prefix: c.localName,
                namespace: c.value
            }) : "xmlns" == c.nodeName && i.push({
                prefix: "",
                namespace: c.value
            })
        }
        for (var d = 0; a > d; d++) {
            var c = r.item(d);
            if (needNamespaceDefine(c, n, i)) {
                var N = c.prefix || "",
                l = c.namespaceURI,
                p = N ? " xmlns:" + N: " xmlns";
                t.push(p, '="', l, '"'),
                i.push({
                    prefix: N,
                    namespace: l
                })
            }
            serializeToString(c, t, n, o, i)
        }
        if (needNamespaceDefine(e, n, i)) {
            var N = e.prefix || "",
            l = e.namespaceURI,
            p = N ? " xmlns:" + N: " xmlns";
            t.push(p, '="', l, '"'),
            i.push({
                prefix: N,
                namespace: l
            })
        }
        if (s || n && !/^(?:meta|link|img|br|hr|input)$/i.test(u)) {
            if (t.push(">"), n && /^script$/i.test(u)) for (; s;) s.data ? t.push(s.data) : serializeToString(s, t, n, o, i),
            s = s.nextSibling;
            else for (; s;) serializeToString(s, t, n, o, i),
            s = s.nextSibling;
            t.push("</", u, ">")
        } else t.push("/>");
        return;
    case DOCUMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE:
        for (var s = e.firstChild; s;) serializeToString(s, t, n, o, i),
        s = s.nextSibling;
        return;
    case ATTRIBUTE_NODE:
        return t.push(" ", e.name, '="', e.value.replace(/[<&"]/g, _xmlEncoder), '"');
    case TEXT_NODE:
        return t.push(e.data.replace(/[<&]/g, _xmlEncoder));
    case CDATA_SECTION_NODE:
        return t.push("<![CDATA[", e.data, "]]>");
    case COMMENT_NODE:
        return t.push("<!--", e.data, "-->");
    case DOCUMENT_TYPE_NODE:
        var E = e.publicId,
        m = e.systemId;
        if (t.push("<!DOCTYPE ", e.name), E) t.push(' PUBLIC "', E),
        m && "." != m && t.push('" "', m),
        t.push('">');
        else if (m && "." != m) t.push(' SYSTEM "', m, '">');
        else {
            var h = e.internalSubset;
            h && t.push(" [", h, "]"),
            t.push(">")
        }
        return;
    case PROCESSING_INSTRUCTION_NODE:
        return t.push("<?", e.target, " ", e.data, "?>");
    case ENTITY_REFERENCE_NODE:
        return t.push("&", e.nodeName, ";");
    default:
        t.push("??", e.nodeName)
    }
}
function importNode(e, t, n) {
    var o;
    switch (t.nodeType) {
    case ELEMENT_NODE:
        o = t.cloneNode(!1),
        o.ownerDocument = e;
    case DOCUMENT_FRAGMENT_NODE:
        break;
    case ATTRIBUTE_NODE:
        n = !0
    }
    if (o || (o = t.cloneNode(!1)), o.ownerDocument = e, o.parentNode = null, n) for (var i = t.firstChild; i;) o.appendChild(importNode(e, i, n)),
    i = i.nextSibling;
    return o
}
function cloneNode(e, t, n) {
    var o = new t.constructor;
    for (var i in t) {
        var r = t[i];
        "object" != typeof r && r != o[i] && (o[i] = r)
    }
    switch (t.childNodes && (o.childNodes = new NodeList), o.ownerDocument = e, o.nodeType) {
    case ELEMENT_NODE:
        var a = t.attributes,
        s = o.attributes = new NamedNodeMap,
        u = a.length;
        s._ownerElement = o;
        for (var d = 0; u > d; d++) o.setAttributeNode(cloneNode(e, a.item(d), !0));
        break;
    case ATTRIBUTE_NODE:
        n = !0
    }
    if (n) for (var c = t.firstChild; c;) o.appendChild(cloneNode(e, c, n)),
    c = c.nextSibling;
    return o
}
function __set__(e, t, n) {
    e[t] = n
}
function getTextContent(e) {
    switch (e.nodeType) {
    case ELEMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE:
        var t = [];
        for (e = e.firstChild; e;) 7 !== e.nodeType && 8 !== e.nodeType && t.push(getTextContent(e)),
        e = e.nextSibling;
        return t.join("");
    default:
        return e.nodeValue
    }
}
var htmlns = "http://www.w3.org/1999/xhtml",
NodeType = {},
ELEMENT_NODE = NodeType.ELEMENT_NODE = 1,
ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2,
TEXT_NODE = NodeType.TEXT_NODE = 3,
CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4,
ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5,
ENTITY_NODE = NodeType.ENTITY_NODE = 6,
PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7,
COMMENT_NODE = NodeType.COMMENT_NODE = 8,
DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9,
DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10,
DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11,
NOTATION_NODE = NodeType.NOTATION_NODE = 12,
ExceptionCode = {},
ExceptionMessage = {},
INDEX_SIZE_ERR = ExceptionCode.INDEX_SIZE_ERR = (ExceptionMessage[1] = "Index size error", 1),
DOMSTRING_SIZE_ERR = ExceptionCode.DOMSTRING_SIZE_ERR = (ExceptionMessage[2] = "DOMString size error", 2),
HIERARCHY_REQUEST_ERR = ExceptionCode.HIERARCHY_REQUEST_ERR = (ExceptionMessage[3] = "Hierarchy request error", 3),
WRONG_DOCUMENT_ERR = ExceptionCode.WRONG_DOCUMENT_ERR = (ExceptionMessage[4] = "Wrong document", 4),
INVALID_CHARACTER_ERR = ExceptionCode.INVALID_CHARACTER_ERR = (ExceptionMessage[5] = "Invalid character", 5),
NO_DATA_ALLOWED_ERR = ExceptionCode.NO_DATA_ALLOWED_ERR = (ExceptionMessage[6] = "No data allowed", 6),
NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = (ExceptionMessage[7] = "No modification allowed", 7),
NOT_FOUND_ERR = ExceptionCode.NOT_FOUND_ERR = (ExceptionMessage[8] = "Not found", 8),
NOT_SUPPORTED_ERR = ExceptionCode.NOT_SUPPORTED_ERR = (ExceptionMessage[9] = "Not supported", 9),
INUSE_ATTRIBUTE_ERR = ExceptionCode.INUSE_ATTRIBUTE_ERR = (ExceptionMessage[10] = "Attribute in use", 10),
INVALID_STATE_ERR = ExceptionCode.INVALID_STATE_ERR = (ExceptionMessage[11] = "Invalid state", 11),
SYNTAX_ERR = ExceptionCode.SYNTAX_ERR = (ExceptionMessage[12] = "Syntax error", 12),
INVALID_MODIFICATION_ERR = ExceptionCode.INVALID_MODIFICATION_ERR = (ExceptionMessage[13] = "Invalid modification", 13),
NAMESPACE_ERR = ExceptionCode.NAMESPACE_ERR = (ExceptionMessage[14] = "Invalid namespace", 14),
INVALID_ACCESS_ERR = ExceptionCode.INVALID_ACCESS_ERR = (ExceptionMessage[15] = "Invalid access", 15);
DOMException.prototype = Error.prototype,
copy(ExceptionCode, DOMException),
NodeList.prototype = {
    length: 0,
    item: function(e) {
        return this[e] || null
    },
    toString: function(e, t) {
        for (var n = [], o = 0; o < this.length; o++) serializeToString(this[o], n, e, t);
        return n.join("")
    }
},
LiveNodeList.prototype.item = function(e) {
    return _updateLiveList(this),
    this[e]
},
_extends(LiveNodeList, NodeList),
NamedNodeMap.prototype = {
    length: 0,
    item: NodeList.prototype.item,
    getNamedItem: function(e) {
        for (var t = this.length; t--;) {
            var n = this[t];
            if (n.nodeName == e) return n
        }
    },
    setNamedItem: function(e) {
        var t = e.ownerElement;
        if (t && t != this._ownerElement) throw new DOMException(INUSE_ATTRIBUTE_ERR);
        var n = this.getNamedItem(e.nodeName);
        return _addNamedNode(this._ownerElement, this, e, n),
        n
    },
    setNamedItemNS: function(e) {
        var t, n = e.ownerElement;
        if (n && n != this._ownerElement) throw new DOMException(INUSE_ATTRIBUTE_ERR);
        return t = this.getNamedItemNS(e.namespaceURI, e.localName),
        _addNamedNode(this._ownerElement, this, e, t),
        t
    },
    removeNamedItem: function(e) {
        var t = this.getNamedItem(e);
        return _removeNamedNode(this._ownerElement, this, t),
        t
    },
    removeNamedItemNS: function(e, t) {
        var n = this.getNamedItemNS(e, t);
        return _removeNamedNode(this._ownerElement, this, n),
        n
    },
    getNamedItemNS: function(e, t) {
        for (var n = this.length; n--;) {
            var o = this[n];
            if (o.localName == t && o.namespaceURI == e) return o
        }
        return null
    }
},
DOMImplementation.prototype = {
    hasFeature: function(e, t) {
        var n = this._features[e.toLowerCase()];
        return n && (!t || t in n) ? !0 : !1
    },
    createDocument: function(e, t, n) {
        var o = new Document;
        if (o.implementation = this, o.childNodes = new NodeList, o.doctype = n, n && o.appendChild(n), t) {
            var i = o.createElementNS(e, t);
            o.appendChild(i)
        }
        return o
    },
    createDocumentType: function(e, t, n) {
        var o = new DocumentType;
        return o.name = e,
        o.nodeName = e,
        o.publicId = t,
        o.systemId = n,
        o
    }
},
Node.prototype = {
    firstChild: null,
    lastChild: null,
    previousSibling: null,
    nextSibling: null,
    attributes: null,
    parentNode: null,
    childNodes: null,
    ownerDocument: null,
    nodeValue: null,
    namespaceURI: null,
    prefix: null,
    localName: null,
    insertBefore: function(e, t) {
        return _insertBefore(this, e, t)
    },
    replaceChild: function(e, t) {
        this.insertBefore(e, t),
        t && this.removeChild(t)
    },
    removeChild: function(e) {
        return _removeChild(this, e)
    },
    appendChild: function(e) {
        return this.insertBefore(e, null)
    },
    hasChildNodes: function() {
        return null != this.firstChild
    },
    cloneNode: function(e) {
        return cloneNode(this.ownerDocument || this, this, e)
    },
    normalize: function() {
        for (var e = this.firstChild; e;) {
            var t = e.nextSibling;
            t && t.nodeType == TEXT_NODE && e.nodeType == TEXT_NODE ? (this.removeChild(t), e.appendData(t.data)) : (e.normalize(), e = t)
        }
    },
    isSupported: function(e, t) {
        return this.ownerDocument.implementation.hasFeature(e, t)
    },
    hasAttributes: function() {
        return this.attributes.length > 0
    },
    lookupPrefix: function(e) {
        for (var t = this; t;) {
            var n = t._nsMap;
            if (n) for (var o in n) if (n[o] == e) return o;
            t = t.nodeType == ATTRIBUTE_NODE ? t.ownerDocument: t.parentNode
        }
        return null
    },
    lookupNamespaceURI: function(e) {
        for (var t = this; t;) {
            var n = t._nsMap;
            if (n && e in n) return n[e];
            t = t.nodeType == ATTRIBUTE_NODE ? t.ownerDocument: t.parentNode
        }
        return null
    },
    isDefaultNamespace: function(e) {
        var t = this.lookupPrefix(e);
        return null == t
    }
},
copy(NodeType, Node),
copy(NodeType, Node.prototype),
Document.prototype = {
    nodeName: "#document",
    nodeType: DOCUMENT_NODE,
    doctype: null,
    documentElement: null,
    _inc: 1,
    insertBefore: function(e, t) {
        if (e.nodeType == DOCUMENT_FRAGMENT_NODE) {
            for (var n = e.firstChild; n;) {
                var o = n.nextSibling;
                this.insertBefore(n, t),
                n = o
            }
            return e
        }
        return null == this.documentElement && e.nodeType == ELEMENT_NODE && (this.documentElement = e),
        _insertBefore(this, e, t),
        e.ownerDocument = this,
        e
    },
    removeChild: function(e) {
        return this.documentElement == e && (this.documentElement = null),
        _removeChild(this, e)
    },
    importNode: function(e, t) {
        return importNode(this, e, t)
    },
    getElementById: function(e) {
        var t = null;
        return _visitNode(this.documentElement,
        function(n) {
            return n.nodeType == ELEMENT_NODE && n.getAttribute("id") == e ? (t = n, !0) : void 0
        }),
        t
    },
    createElement: function(e) {
        var t = new Element;
        t.ownerDocument = this,
        t.nodeName = e,
        t.tagName = e,
        t.childNodes = new NodeList;
        var n = t.attributes = new NamedNodeMap;
        return n._ownerElement = t,
        t
    },
    createDocumentFragment: function() {
        var e = new DocumentFragment;
        return e.ownerDocument = this,
        e.childNodes = new NodeList,
        e
    },
    createTextNode: function(e) {
        var t = new Text;
        return t.ownerDocument = this,
        t.appendData(e),
        t
    },
    createComment: function(e) {
        var t = new Comment;
        return t.ownerDocument = this,
        t.appendData(e),
        t
    },
    createCDATASection: function(e) {
        var t = new CDATASection;
        return t.ownerDocument = this,
        t.appendData(e),
        t
    },
    createProcessingInstruction: function(e, t) {
        var n = new ProcessingInstruction;
        return n.ownerDocument = this,
        n.tagName = n.target = e,
        n.nodeValue = n.data = t,
        n
    },
    createAttribute: function(e) {
        var t = new Attr;
        return t.ownerDocument = this,
        t.name = e,
        t.nodeName = e,
        t.localName = e,
        t.specified = !0,
        t
    },
    createEntityReference: function(e) {
        var t = new EntityReference;
        return t.ownerDocument = this,
        t.nodeName = e,
        t
    },
    createElementNS: function(e, t) {
        var n = new Element,
        o = t.split(":"),
        i = n.attributes = new NamedNodeMap;
        return n.childNodes = new NodeList,
        n.ownerDocument = this,
        n.nodeName = t,
        n.tagName = t,
        n.namespaceURI = e,
        2 == o.length ? (n.prefix = o[0], n.localName = o[1]) : n.localName = t,
        i._ownerElement = n,
        n
    },
    createAttributeNS: function(e, t) {
        var n = new Attr,
        o = t.split(":");
        return n.ownerDocument = this,
        n.nodeName = t,
        n.name = t,
        n.namespaceURI = e,
        n.specified = !0,
        2 == o.length ? (n.prefix = o[0], n.localName = o[1]) : n.localName = t,
        n
    }
},
_extends(Document, Node),
Element.prototype = {
    nodeType: ELEMENT_NODE,
    hasAttribute: function(e) {
        return null != this.getAttributeNode(e)
    },
    getAttribute: function(e) {
        var t = this.getAttributeNode(e);
        return t && t.value || ""
    },
    getAttributeNode: function(e) {
        return this.attributes.getNamedItem(e)
    },
    setAttribute: function(e, t) {
        var n = this.ownerDocument.createAttribute(e);
        n.value = n.nodeValue = "" + t,
        this.setAttributeNode(n)
    },
    removeAttribute: function(e) {
        var t = this.getAttributeNode(e);
        t && this.removeAttributeNode(t)
    },
    appendChild: function(e) {
        return e.nodeType === DOCUMENT_FRAGMENT_NODE ? this.insertBefore(e, null) : _appendSingleChild(this, e)
    },
    setAttributeNode: function(e) {
        return this.attributes.setNamedItem(e)
    },
    setAttributeNodeNS: function(e) {
        return this.attributes.setNamedItemNS(e)
    },
    removeAttributeNode: function(e) {
        return this.attributes.removeNamedItem(e.nodeName)
    },
    removeAttributeNS: function(e, t) {
        var n = this.getAttributeNodeNS(e, t);
        n && this.removeAttributeNode(n)
    },
    hasAttributeNS: function(e, t) {
        return null != this.getAttributeNodeNS(e, t)
    },
    getAttributeNS: function(e, t) {
        var n = this.getAttributeNodeNS(e, t);
        return n && n.value || ""
    },
    setAttributeNS: function(e, t, n) {
        var o = this.ownerDocument.createAttributeNS(e, t);
        o.value = o.nodeValue = "" + n,
        this.setAttributeNode(o)
    },
    getAttributeNodeNS: function(e, t) {
        return this.attributes.getNamedItemNS(e, t)
    },
    getElementsByTagName: function(e) {
        return new LiveNodeList(this,
        function(t) {
            var n = [];
            return _visitNode(t,
            function(o) {
                o === t || o.nodeType != ELEMENT_NODE || "*" !== e && o.tagName != e || n.push(o)
            }),
            n
        })
    },
    getElementsByTagNameNS: function(e, t) {
        return new LiveNodeList(this,
        function(n) {
            var o = [];
            return _visitNode(n,
            function(i) {
                i === n || i.nodeType !== ELEMENT_NODE || "*" !== e && i.namespaceURI !== e || "*" !== t && i.localName != t || o.push(i)
            }),
            o
        })
    }
},
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName,
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS,
_extends(Element, Node),
Attr.prototype.nodeType = ATTRIBUTE_NODE,
_extends(Attr, Node),
CharacterData.prototype = {
    data: "",
    substringData: function(e, t) {
        return this.data.substring(e, e + t)
    },
    appendData: function(e) {
        e = this.data + e,
        this.nodeValue = this.data = e,
        this.length = e.length
    },
    insertData: function(e, t) {
        this.replaceData(e, 0, t)
    },
    appendChild: function() {
        throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
    },
    deleteData: function(e, t) {
        this.replaceData(e, t, "")
    },
    replaceData: function(e, t, n) {
        var o = this.data.substring(0, e),
        i = this.data.substring(e + t);
        n = o + n + i,
        this.nodeValue = this.data = n,
        this.length = n.length
    }
},
_extends(CharacterData, Node),
Text.prototype = {
    nodeName: "#text",
    nodeType: TEXT_NODE,
    splitText: function(e) {
        var t = this.data,
        n = t.substring(e);
        t = t.substring(0, e),
        this.data = this.nodeValue = t,
        this.length = t.length;
        var o = this.ownerDocument.createTextNode(n);
        return this.parentNode && this.parentNode.insertBefore(o, this.nextSibling),
        o
    }
},
_extends(Text, CharacterData),
Comment.prototype = {
    nodeName: "#comment",
    nodeType: COMMENT_NODE
},
_extends(Comment, CharacterData),
CDATASection.prototype = {
    nodeName: "#cdata-section",
    nodeType: CDATA_SECTION_NODE
},
_extends(CDATASection, CharacterData),
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE,
_extends(DocumentType, Node),
Notation.prototype.nodeType = NOTATION_NODE,
_extends(Notation, Node),
Entity.prototype.nodeType = ENTITY_NODE,
_extends(Entity, Node),
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE,
_extends(EntityReference, Node),
DocumentFragment.prototype.nodeName = "#document-fragment",
DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE,
_extends(DocumentFragment, Node),
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE,
_extends(ProcessingInstruction, Node),
XMLSerializer.prototype.serializeToString = function(e, t, n) {
    return nodeSerializeToString.call(e, t, n)
},
Node.prototype.toString = nodeSerializeToString;
try {
    Object.defineProperty && (Object.defineProperty(LiveNodeList.prototype, "length", {
        get: function() {
            return _updateLiveList(this),
            this.$$length
        }
    }), Object.defineProperty(Node.prototype, "textContent", {
        get: function() {
            return getTextContent(this)
        },
        set: function(e) {
            switch (this.nodeType) {
            case ELEMENT_NODE:
            case DOCUMENT_FRAGMENT_NODE:
                for (; this.firstChild;) this.removeChild(this.firstChild); (e || String(e)) && this.appendChild(this.ownerDocument.createTextNode(e));
                break;
            default:
                this.data = e,
                this.value = e,
                this.nodeValue = e
            }
        }
    }), __set__ = function(e, t, n) {
        e["$$" + t] = n
    })
} catch(e) {}
exports.DOMImplementation = DOMImplementation,
exports.XMLSerializer = XMLSerializer;