if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}
var Atto = (function () {
    'use strict';
    var attoMap = {}, m,
    emptyArray = [],
    forEach = emptyArray.forEach,
    slice = emptyArray.slice;
    
    function attoException (message) {
        this.message = message;
        this.name = 'methodNotDefined';
        this.toString = function() {
            return this.message;
       };
    }
    
    function extend (obj1, obj2) {
        var returnObject = {}, prop;
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
        // returnObject.parent = obj2;
        return returnObject;
    }
    
    function renderAttoElement (render) {
        if (typeof render === 'string') {
            
            var div = document.createElement('div'),
                fragmet = document.createDocumentFragment(),
                childNodes = div.childNodes;
            div.innerHTML = render.trim();
            
            // add node list in to fragemt
            forEach.call(childNodes, function (item) {
                fragmet.appendChild(item);
            });
            // flag to know it is a fragment
            fragmet.isFragment = true;
            return fragmet;
        }
        return render;
    };
    
    function attoNode (element, config, thisObj) {
        this.element = element || [];
        if ('extend' in config) {
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
    
    attoNode.prototype.render = function (inDom) {
        var renderer = this.config.render.apply(this, [this.config, this]),
            attributes = this.attributes,
            activeElement,
            template = renderAttoElement.call(this, renderer);
        if (typeof template === 'undefined') {
            throw new attoException('Render method must be implemented and should return value.');
            // render must be implement and return value
        } else if (template.isFragment &&
            ('setAttribute' in template.childNodes[0])) {
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
    };
    
    attoNode.prototype.insert = function () {
        this.element.parentNode.replaceChild(this.template, this.element);
    };
    
    attoNode.prototype.setAttribute = function (name, value) {
        this.attributes[name] = value;
    };
    
    attoNode.prototype.removeAttribute = function (name) {
        if (name in this.attributes) {
            delete this.attributes[name];
        }
    };
    
    attoNode.prototype.get = function (name) {
        if (name in attoMap) {
            return new attoNode(undefined, attoMap[name], this);
        }
        return null;
    };

    m = {
       define: function (config) {
           if ('name' in config) {
               if ('extend' in config) {
                   var ext = attoMap[config.extend];
                   if (!ext) {
                       throw new attoException('Cannot extend, unknown component "' + 
                       config.extend + '".');
                   }
                   attoMap[config.name] = extend(config, ext);
               } else {
                   attoMap[config.name] = config;
               }
           } else {
               throw new attoException('Name configuration property must be defined.');
           }
       },
       run: function () {
           var config,
               map = attoMap,
               elements,
               element,
               i = 0,
               prop;

           for (prop in map) {
               if (map.hasOwnProperty(prop)) {
                   config = map[prop];
                   elements = document.getElementsByTagName(config.name);
               
                   for(; i < elements.length;) {
                       element = elements[i];
                       var el = new attoNode(element, config, this);
                       el.render(true);
                   }
               }
           }
       },
       create: function (config) {
           if ('extend' in config) {
               return new attoNode(undefined, extend(config, attoMap[config.extend]), this);
           }
           return new attoNode(undefined, config, this);
       }
    }
    
    return m;
})();