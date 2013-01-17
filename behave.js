define(["dojo/query", "dojo/dom-attr"], function(query, domAttr){

    var queryObject = function(obj, q){
        q.split(".").reduce(function(val, propertyName){
            return val[propertyName];
        }, obj);
    };

    var prepare = function(domNode){

        var bindNodes = query("[data-bind]", domNode);

        if(domAttr.has(domNode, "data-bind")){
            bindNodes.unshift(domNode);
        }

        bindNodes.forEach(function(node){

            var context = domAttr.get(node, "data-bind");

            query("[data-prop]", node).forEach(function(node){

                var value    = domAttr.get(node, "data-prop"),
                    newValue = value.replace(/^@/, context + ".");

                domAttr.set(node, "data-prop", newValue);

            });

            query("[data-each]", node).forEach(function(node){

                var value    = domAttr.get(node, "data-each"),
                    newValue = value.replace(/^@/, context + ".");

                query("[data-prop]", node).forEach(function(node){
                    domAttr.set(node, "data-context", newValue);
                });

                domAttr.set(node, "data-each", newValue);

            });

        });

    };

    var bind = function(domNode, data){

        var propNodes = query("[data-prop]", domNode);

        if(domAttr.has(domNode, "data-prop")){
            propNodes.unshift(domNode);
        }

        propNodes.forEach(function(node){

            var q     = domAttr.get(node, "data-prop"),
                value = queryObject(data, q)
            ;

            node.innerHTML = value;

        });

        var eachNodes = query("[data-each]", domNode);

        if(domAttr.has(domNode, "data-each")){
            eachNodes.unshift(domNode);
        }

        eachNodes.forEach(function(node){

            var q = domAttr.get(node, "data-each");

            prepare(node);

            bind(node, queryObject(data, q));

        });
    };


    return {

        prepare : prepare,


        bind : bind
    };

});
