if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
/******************************************************************************/
/********************************* Atto class *********************************/
/******************************************************************************/
var Atto = (function () {
    'use strict';
    var attoMap = {},
        emptyArray = [],
        slice = emptyArray.slice,
        atto,
        constants = {
            ATTO_SELECTOR_CLASS_PREFIX: 'js-atto-selector-'
        };
    
    function AttoException(message) {
        this.message = message;
        this.name = 'methodNotDefined';
        this.toString = function () {
            return this.message;
        };
    }

    /**************************************************************************/
    /***************************** private method *****************************/
    /**************************************************************************/
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
    }
    function renderIntoElement(element) {
        var map = attoMap, elements,
            newElement = document.createElement('div'),
            // newElement = document.createDocumentFragment(),
            attributes = newElement.attributes, 
            i, len;

        newElement.innerHTML = element.innerHTML;
        element.innerHTML = '';

        for (var name in map) {
            if (map.hasOwnProperty(name)) {
                elements = newElement.getElementsByTagName(map[name].name);
                while (0 < elements.length) {
                    new Atto(elements[0], name, this).render(true);
                }
            }
        };
        element.appendChild(newElement);
        // element.parentNode.replaceChild(newElement, element);
    };

    /**************************************************************************/
    /****************************** constructor *******************************/
    /**************************************************************************/
    function Atto(element, name, configObject, thisObj) {
        var config = attoMap[name] || configObject || {};
        this.element = element || [];
        // this.AttoFromConfig(config, thisObj);
        if (config.hasOwnProperty('extend')) {
            this.parent = attoMap[config.extend];
            this.config = extend(config, this.parent);
        } else {
            this.config = config;
        }
        // this.scope = thisObj || null;
        // this.props = slice.call(this.element.attributes || [], 0);
        this.class = config.class;
        this.id = config.id;            
        
    };

    /**************************************************************************/
    /***************************** public method ******************************/
    /**************************************************************************/
    Atto.prototype = {
        AttoFromConfig: function Atto_renderFromConfig(config, thisObj) {
        },
        render: function Atto_render(inDom) {
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
            activeElement.settingAtto = this.config;
            if (this.class) {
                activeElement.className += ' ' + (this.class || '') + 
                (this.config.name ?
                     ' ' + constants.ATTO_SELECTOR_CLASS_PREFIX + this.config.name
                     : '');
            }
            if (this.id) {
                this.template.id = this.id;
            }
            this.template = activeElement;
            // put new element in dom
            if (inDom) {
                this.insert();
            }
            return activeElement;
        },
        
        insert: function Atto_insert() {
            this.element.parentNode.replaceChild(this.template, this.element);
        },
        setAttribute: function Atto_setattribute(name, value) {
            this.attributes[name] = value;
        },
        removeAttribute: function Atto_removeAttribute(name) {
            if (this.attributes.hasOwnProperty(name)) {
                delete this.attributes[name];
            }
        },
        get: function Atto_get(name) {
            if (attoMap.hasOwnProperty(name)) {
                return new Atto(undefined, name, this);
            }
            return null;
        }
    };

    /**************************************************************************/
    /***************************** static method ******************************/
    /**************************************************************************/
    Atto.define = function Atto_define(config) {
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
    };
    Atto.run = function Atto_run(settings) {
        var elements, len, i;
    
        settings = settings || {};
    
        if (settings.hasOwnProperty('target') &&
            (elements = settings.target) &&
            typeof elements.length === 'number') {
            len = elements.length;
            for (i = 0; i < len; i++) {
                renderIntoElement(elements[i]);
            }
        } else {
            renderIntoElement(document.body);
        }
        this.settings = settings;
    };
    Atto.create = function Atto_create(config) {
        return new Atto(undefined, null, config, this);
    };
    
    Atto.get = function Atto_get(name, scope) {
        var elements;
        scope = scope || document;
        if (attoMap.hasOwnProperty(name)) {
            elements = scope.getElementsByClassName(constants.ATTO_SELECTOR_CLASS_PREFIX + name);
        }
    };

    return Atto;
}());
