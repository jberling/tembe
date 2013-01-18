define(["dojo/query", "dojo/dom-attr"], function(query, domAttr){

    var queryObject = function(obj, q){
        return q.replace(/\[/g, ".[")
            .split(".")
            .reduce(function(val, key){
                if(key.match(/^\[/)) {
                    key = key.slice(1, key.length-1)
                }
                return val[key];
            }, obj);
    };

    var prepare = function(domNode){

        var bindNodes = query("[data-bind]", domNode);

        if(domAttr.has(domNode, "data-bind")){
            bindNodes.unshift(domNode);
        }

        bindNodes.forEach(function(node){

            var context = domAttr.get(node, "data-bind");

            query("[data-q]", node).forEach(function(node){

                var value    = domAttr.get(node, "data-q"),
                    newValue = value.replace(/^@/, context + ".");

                domAttr.set(node, "data-q", newValue);

            });

//            query("[data-each]", node).forEach(function(node){
//
//                var value    = domAttr.get(node, "data-each"),
//                    newValue = value.replace(/^@/, context + ".");
//
//                query("[data-q]", node).forEach(function(node){
//                    domAttr.set(node, "data-context", newValue);
//                });
//
//                domAttr.set(node, "data-each", newValue);
//
//            });

        });

    };

    var bind = function(domNode, data){

        var propNodes = query("[data-q]", domNode);

        if(domAttr.has(domNode, "data-q")){
            propNodes.unshift(domNode);
        }

        propNodes.forEach(function(node){

            var q     = domAttr.get(node, "data-q"),
                value = queryObject(data, q)
            ;

            node.innerHTML = value;

        });

//        var eachNodes = query("[data-each]", domNode);
//
//        if(domAttr.has(domNode, "data-each")){
//            eachNodes.unshift(domNode);
//        }
//
//        eachNodes.forEach(function(node){
//
//            var q = domAttr.get(node, "data-each");
//
//            prepare(node);
//
//            bind(node, queryObject(data, q));
//
//        });
    };

    return {
        prepare : prepare,
        bind : bind
    };

});
