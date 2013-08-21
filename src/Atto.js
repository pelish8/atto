if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
var Atto = (function () {
    'use strict';
    var attoMap = {}, atto,
        emptyArray = [],
        slice = emptyArray.slice;
    
    function AttoException(message) {
        this.message = message;
        this.name = 'methodNotDefined';
        this.toString = function () {
            return this.message;
        };
    }
    
    function extend(obj1, obj2) {
        var returnObject = {};
        for (var prop in obj2) {
            if (obj2.hasOwnProperty(prop)) {
                returnObject[prop] = obj2[prop];
            }
        }
        for (var prop in obj1) {
            if (obj1.hasOwnProperty(prop)) {
                returnObject[prop] = obj1[prop];
            }
        }
        // returnObject.parent = obj2;
        return returnObject;
    }
    
    function renderAttoElement(render) {
        if (typeof render === 'string') {
            
            var div = document.createElement('div'),
                fragmet = document.createDocumentFragment(),
                childNodes = div.childNodes;
                i, 
                len = childNodes.length;
            div.innerHTML = render.trim();
            
            // add node list in to fragemt
            for (i = 0; i < len; i++) {
                fragmet.appendChild(childNodes[i]);
            } 
            // flag to know it is a fragment
            fragmet.isFragment = true;
            return fragmet;
        }
        return render;
    };
    
    function AttoNode(element, config, thisObj) {
        this.element = element || [];
        if (config.hasOwnProperty('extend')) {
            this.parent = attoMap[config.extend];
            this.config = extend(config, this.parent);
        } else {
            this.config = config || {};
        }
        // this.scope = thisObj || null;
        this.props = slice.call(this.element.attributes || [], 0);
        this.class = config.class;
        this.id = config.id;
    };
    
    AttoNode.prototype = {
        render: function AttoNode_render(inDom) {
            var renderer = this.config.render.apply(this, [this.config, this]),
                attributes = this.attributes,
                activeElement,
                template = renderAttoElement.call(this, renderer);

            if (typeof template === 'undefined') {
                throw new AttoException('Render method must be implemented and should return value.');
                // render must be implement and return value
            } else if (template.isFragment &&
                (template.childNodes[0].hasOwnProperty('setAttribute'))) {
                activeElement = template.childNodes[0];
            } else {
                activeElement = template;
            }
        
            for (var att in attributes) {
                if (attributes.hasOwnProperty(att)) {
                    activeElement.setAttribute(att, attributes[att]);
                }
            }
            this.template = template;
            if (this.class) {
                this.template.className += ' ' + this.class;
            }
            if (this.id) {
                this.template.id = this.id;
            }
            // put new element in dom
            if (inDom) {
                this.insert();
            }
            return template;
        },
        
        insert: function AttoNode_insert() {
            this.element.parentNode.replaceChild(this.template, this.element);
        },
        setAttribute: function AttoNode_setattribute(name, value) {
            this.attributes[name] = value;
        },
        removeAttribute: function AttoNode_removeAttribute(name) {
            if (this.attributes.hasOwnProperty(name)) {
                delete this.attributes[name];
            }
        },
        get: function AttoNode_get(name) {
            if (attoMap.hasOwnProperty(name)) {
                return new AttoNode(undefined, attoMap[name], this);
            }
            return null;
        }
    };

    atto = {
       define: function atto_define(config) {
           if (config.hasOwnProperty('name')) {
               if (config.hasOwnProperty('extend')) {
                   var ext = attoMap[config.extend];
                   if (!ext) {
                       throw new AttoException('Cannot extend, unknown component "' + 
                       config.extend + '".');
                   }
                   attoMap[config.name] = extend(config, ext);
               } else {
                   attoMap[config.name] = config;
               }
           } else {
               throw new AttoException('Name configuration property must be defined.');
           }
       },
       run: function atto_run() {
           var config,
               map = attoMap,
               elements,
               element,
               i,
               body = document.body,
               newBody = document.createElement('body'),
               attributes = body.attributes,
               len;

            newBody.innerHTML = body.innerHTML;
            len = attributes.length;
            for (i = 0; i < len; i++) {
                newBody.setAttribute(attributes[i].name, attributes[i].value);
            }
            
            for (var prop in map) {
                if (map.hasOwnProperty(prop)) {
                    config = map[prop];
                    elements = newBody.getElementsByTagName(config.name);
                    for (; 0 < elements.length;) {
                        new AttoNode(elements[0], config, this).render(true);
                    }
                }
            }
           body.parentNode.replaceChild(newBody, body);
       },
       create: function atto_create(config) {
           if (config.hasOwnProperty('extend')) {
               return new AttoNode(undefined, extend(config, attoMap[config.extend]), this);
           }
           return new AttoNode(undefined, config, this);
       }
    }
    
    return atto;
}());
