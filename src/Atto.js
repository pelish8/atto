if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
/******************************************************************************/
/********************************* Atto class *********************************/
/******************************************************************************/
var Atto = (function AttoClosure() {
    'use strict';
    var attoMap = {},
        emptyArray = [],
        slice = emptyArray.slice,
        atto,
        constants = {
            ATTO_SELECTOR_CLASS_PREFIX: 'js-atto-selector-'
        },
        AttoNotification;
    
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
        var returnObject = {},
            prop;
        for (prop in obj2) {
            if (obj2.hasOwnProperty(prop)) {
                returnObject[prop] = obj2[prop];
            }
        }
        for (prop in obj1) {
            if (obj1.hasOwnProperty(prop)) {
                returnObject[prop] = obj1[prop];
            }
        }
        return returnObject;
    }
    function renderAttoElement(render, renderInSection) {
        var wrapper, len, i;
        if (renderInSection) {
            wrapper = document.createElement('section');
        } else {
            wrapper = document.createDocumentFragment();
            wrapper.isFragment = true;
        }
        if (toString.call(render) === '[object Array]') {
            len = render.length;
            for (i = 0; i < len; i++) {
                wrapper.appendChild(render[i]);
            }
        } else if (typeof render === 'string') {
            wrapper.innerHTML = render.trim();
        } else {
            wrapper.appendChild(render);
        }
        return wrapper;
    }
    function renderIntoElement(element) {
        var map = attoMap, elements,
            newElement = element.cloneNode(true),
            newElement1 = document.createDocumentFragment(),
            attributes = newElement.attributes,
            i, len, name;

        newElement.innerHTML = element.innerHTML;
        element.innerHTML = '';

        for (name in map) {
            if (map.hasOwnProperty(name)) {
                elements = newElement.getElementsByTagName(map[name].name);
                while (0 < elements.length) {
                    new Atto({
                        target: elements[0],
                        name: name,
                        renderInSection: true
                    }).render(true);
                }
            }
        }

        element.parentNode.replaceChild(newElement, element);
    }
    
    /**************************************************************************/
    /****************************** constructor *******************************/
    /**************************************************************************/
    function Atto(option) {
        //target, name, configObject, thisObj, customAttributes, renderInSection
        var config,
            len,
            i,
            props = {},
            attributes,
            target,
            customAttributes;
   
        config = option.config || attoMap[option.name] || {};
        target = option.target || [];
        customAttributes = option.ttributes || {};
        if (!config.isExtened && config.hasOwnProperty('extend')) {
            this.parent = attoMap[config.extend];
            this.config = extend(config, this.parent);
        } else {
            this.config = config;
        }
        if (target.hasOwnProperty('attributes')) {
            attributes = target.attributes;
            len = attributes.length;
            for (i = 0; i < len; i++) {
                props[attributes[i].name] = attributes[i].value;
            }
        }
        this.mergeWith(this.config);
        
        this.mergeWith.call(props, customAttributes);
        this.props = props;
        this.target = target;
        this.class = config.class;
        this.id = config.id;
        this.renderInSection = option.renderInSection;
    }

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
                element = renderAttoElement(renderer, this.renderInSection),
                att;
            if (typeof element === 'undefined') {
                throw new AttoException(
                    'Render method must be implemented and should return value.'
                );
            // render must be implement and return value
            } else if (element.isFragment) {
                activeElement = element.childNodes[0];
            } else {
                activeElement = element;
                for (att in attributes) {
                    if (attributes.hasOwnProperty(att)) {
                        activeElement.setAttribute(att, attributes[att]);
                    }
                }
            }
            activeElement.settingAtto = this.config;
            activeElement.className += ' ' + (this.class || '') +
                (this.config.name ?
                        ' ' +
                        constants.ATTO_SELECTOR_CLASS_PREFIX + this.config.name
                        : '');
            if (this.id) {
                activeElement.id = this.id;
            }
            this.element = element;
            // put new element in dom
            if (inDom) {
                this.insert();
            }
            return activeElement;
        },
        
        insert: function Atto_insert() {
            this.target.parentNode.replaceChild(this.element, this.target);
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
                return new Atto({
                    name: name
                });
            }
            return null;
        },
        observer: function Atto_event(name, callBack) {
            AttoNotification.observer(name, callBack, this);
        },
        post: function Atto_post(name, mixin) {
            AttoNotification.post(name, mixin);
        },
        rerender: function Atto_rerender() {
            this.target = this.element;
            this.render(true);
        },
        mergeWith: function Atto_mergeWith(object) {
            var prop;
            for (prop in object) {
                if (object.hasOwnProperty(prop) && prop !== 'render') {
                    this[prop] = object[prop];
                }
            }
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
                    throw new AttoException(
                        'Cannot extend, unknown component "' + config.extend +
                            '".'
                    );
                }
                attoMap[config.name] = extend(config, ext);
                attoMap[config.name].isExtend = true;
            } else {
                attoMap[config.name] = config;
            }
        } else {
            throw new AttoException(
                'Name configuration property must be defined.'
            );
        }
    };
    Atto.run = function Atto_run(settings) {
        var elements,
            len,
            i;
    
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
        if (typeof config === 'object') {
            return new Atto({
                config: config,
                renderInSection: false
            });
        }
        // throw error
        return null;
    };
    
    Atto.find = function Atto_find(name, scope) {
        var elements,
            list = [],
            len,
            i,
            el;
        scope = scope || document;
        if (attoMap.hasOwnProperty(name)) {
            elements = scope.getElementsByClassName(
                constants.ATTO_SELECTOR_CLASS_PREFIX + name
            );
            len = elements.length;
            for (i = 0; i < len; i++) {
                el = elements[i];
                list.push(new Atto({target: el,
                    name: el.settingAtto.name,
                    config: el.settingAtto
                    }));
            }
            
            return list;
        }
        
        return null;
    };
    
    Atto.get = function Atto_get(name, attributes) {
        if (attoMap.hasOwnProperty(name)) {
            return new Atto({
                name: name,
                config: attoMap[name],
                attributes: attributes,
                renderInSection: false
            });
        }
        // throw error
        return null;
    };
    
    AttoNotification = (function AttoNotificationClosure() {
        var notification = {};
        function AttoNotification(notificationName, callBack, id, context) {
            this.name = notificationName;
            this.callBack = callBack || function () {};
            this.id = id;
            this.target = context;
        }
    
        AttoNotification.prototype = {
            execute: function AttoNotification_execute(mixin) {
                this.callBack.apply(this.target, [mixin, this]);
            }
        };

        AttoNotification.observer = function AttoNotification_observer(name, callBack, context) {
            var notif, id;
        
            if (!notification.hasOwnProperty(name)) {
                notification[name] = [];
            }

            if (!context.hasOwnProperty('notifications')) {
                context.notifications = {};
            }

            notif = notification[name];
            id = notif.length;
        
            if (typeof context.notifications[name] === 'undefined') {
                notif.push(new AttoNotification(name, callBack, id, context));
                context.notifications[name] = id;
            }
        };
        AttoNotification.post = function AttoNotification_post(name, mixin) {
            var list,
                len,
                i = 0,
                interval;
            if (notification.hasOwnProperty(name)) {
                list = notification[name];
            }
            len = list.length;
            interval = setInterval(function () {
                if (i > len) {
                    clearInterval(interval);
                }
                if (typeof list[i] !== 'undefined') {
                    list[i].execute(mixin);
                } else {
                    clearInterval(interval);
                }
                i++;
            }, 10);
        };

        return AttoNotification;
    }());

    return Atto;
}());
